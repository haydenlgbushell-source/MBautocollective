import { NextRequest, NextResponse } from 'next/server';
import type { Browser, Page } from 'puppeteer-core';

// Vercel Pro required for maxDuration > 10s
export const maxDuration = 60;

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    // chromium-min downloads the binary at runtime — avoids bundling issues on Vercel
    const chromium = (await import('@sparticuz/chromium-min')).default;
    const puppeteer = (await import('puppeteer-core')).default;
    return puppeteer.launch({
      args: [...chromium.args, '--disable-gpu', '--no-sandbox'],
      defaultViewport: { width: 1440, height: 900 },
      executablePath: await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
      ),
      headless: true,
    });
  } else {
    // Local dev — requires `puppeteer` in devDependencies
    const puppeteer = await import('puppeteer');
    return puppeteer.default.launch({
      headless: true,
      defaultViewport: { width: 1440, height: 900 },
    });
  }
}

async function jpeg(page: Page): Promise<string> {
  const buf = await page.screenshot({ type: 'jpeg', quality: 72, fullPage: false });
  return Buffer.from(buf as Buffer).toString('base64');
}

async function scrollAndCapture(page: Page): Promise<string[]> {
  const shots: string[] = [];
  shots.push(await jpeg(page));

  // Scroll down in thirds to capture the full listing
  const height = await page.evaluate(() => document.body.scrollHeight);
  if (height > 900) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await new Promise((r) => setTimeout(r, 600));
    shots.push(await jpeg(page));

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 600));
    shots.push(await jpeg(page));
  }

  return shots;
}

function isLoginUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('login') || u.includes('signin') || u.includes('sign-in');
}

/** Type into an input using real keyboard events (works with React, Vue, Angular). */
async function typeIntoField(page: Page, selector: string, value: string): Promise<boolean> {
  const el = await page.$(selector);
  if (!el) return false;
  await el.click({ clickCount: 3 }); // focus + select-all
  await el.type(value, { delay: 60 }); // character-by-character keyboard events
  return true;
}

/**
 * Log in and return a base64 JPEG taken immediately after the login attempt.
 * This screenshot travels with the error if a later step fails, giving a clear
 * picture of what the browser state was post-login.
 */
async function login(page: Page, email: string, password: string): Promise<string> {
  page.setDefaultNavigationTimeout(30000);

  // Trim to catch copy-paste whitespace in env vars
  const cleanEmail    = email.trim();
  const cleanPassword = password.trim();

  await page.goto('https://my.easycars.net.au/app/Login', { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for form to appear, then let the SPA fully initialise
  await page.waitForSelector('input', { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1500));

  // Fill email — include PascalCase variants (common in .NET/ASP.NET MVC apps)
  const emailSelectors = [
    'input[type="email"]',
    'input[name="Email"]',
    'input[name="email"]',
    'input[id="Email"]',
    'input[id="email"]',
    'input[name="UserName"]',
    'input[name="username"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="user" i]',
    'input[type="text"]',
  ];
  let emailFilled = false;
  for (const sel of emailSelectors) {
    if (await typeIntoField(page, sel, cleanEmail)) { emailFilled = true; break; }
  }
  if (!emailFilled) throw new Error('Could not find the email/username field on the EasyCars login page.');

  // Fill password (also PascalCase variant)
  const passFilled = await typeIntoField(page, 'input[type="password"]', cleanPassword)
    || await typeIntoField(page, 'input[name="Password"]', cleanPassword);
  if (!passFilled) throw new Error('Could not find the password field on the EasyCars login page.');

  await new Promise((r) => setTimeout(r, 500));

  // Capture the pre-submit state — shows whether fields contain values
  // This screenshot is attached to login-failure errors for diagnosis
  const preSubmitShot = await jpeg(page);

  // Submit — try type-based selectors first, then find by "login" text, then Enter
  let submitted = false;
  for (const sel of ['button[type="submit"]', 'input[type="submit"]', 'button.btn-primary', 'button.login-btn']) {
    const el = await page.$(sel);
    if (el) { await el.click(); submitted = true; break; }
  }
  if (!submitted) {
    submitted = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, input[type="button"]'));
      const btn = all.find((el) => /login|sign\s*in/i.test((el as HTMLElement).innerText || (el as HTMLInputElement).value || ''));
      if (btn) { (btn as HTMLElement).click(); return true; }
      return false;
    });
  }
  if (!submitted) await page.keyboard.press('Enter');

  // Wait for password field to disappear — definitive signal we left the login form
  await page.waitForFunction(
    () => !document.querySelector('input[type="password"]'),
    { timeout: 20000 }
  ).catch(() => {});

  await new Promise((r) => setTimeout(r, 1000));

  // Password field still present = login genuinely failed
  // Return the PRE-submit screenshot so it's clear whether the fields were filled
  if (await page.$('input[type="password"]')) {
    throw Object.assign(
      new Error(
        'Login failed — EasyCars is still showing the login form after submission. ' +
        'The screenshot shows the form state BEFORE clicking login — check if the fields contain your credentials.'
      ),
      { diagShot: preSubmitShot }
    );
  }

  // EasyCars shows an MFA prompt after login — click "Continue without enabling MFA"
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('a, button'));
    const skip = all.find((el) => {
      const t = (el as HTMLElement).innerText?.toLowerCase() ?? '';
      return t.includes('continue without') || t.includes('skip') || t.includes('remind me later');
    });
    if (skip) (skip as HTMLElement).click();
  });

  await new Promise((r) => setTimeout(r, 3000));

  const postLoginShot = await jpeg(page);
  return postLoginShot;
}

async function findVehicleByRego(page: Page, rego: string, postLoginShot: string): Promise<void> {
  // EasyCars is a hash-based SPA — vehicle detail URL is /app/Vehicles/Manage/#<id>
  // waitForNavigation won't fire on hash changes, so we poll for DOM/hash changes instead.
  const base = 'https://my.easycars.net.au/app/Vehicles/Manage';

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 20000 });
  // Wait for SPA to fully initialise
  await new Promise((r) => setTimeout(r, 3000));

  // Guard: if we were redirected to login the session wasn't established.
  // Use postLoginShot so the user sees the browser state right after login (not after redirect).
  if (isLoginUrl(page.url())) {
    throw Object.assign(
      new Error('Session not established — browser was redirected to login when accessing vehicles. The screenshot shows what the browser looked like right after the login attempt.'),
      { diagShot: postLoginShot }
    );
  }

  // Find and use the search input
  const searchSelectors = [
    'input[type="search"]',
    'input[placeholder*="search" i]',
    'input[placeholder*="rego" i]',
    'input[placeholder*="registration" i]',
    'input[placeholder*="filter" i]',
    'input[placeholder*="vehicle" i]',
    'input[name="search"]',
    'input[name="q"]',
    'input[type="text"]',
  ];

  for (const sel of searchSelectors) {
    const el = await page.$(sel);
    if (el) {
      await el.click({ clickCount: 3 });
      await el.type(rego, { delay: 60 });
      // Give the SPA time to filter results
      await new Promise((r) => setTimeout(r, 2500));
      break;
    }
  }

  // Click the first result that contains the rego text
  const clicked = await page.evaluate((r: string) => {
    const candidates = Array.from(
      document.querySelectorAll('a, tr, td, [class*="row"], [class*="item"], [class*="vehicle"], [class*="card"]')
    );
    for (const el of candidates) {
      if ((el as HTMLElement).innerText?.toUpperCase().includes(r.toUpperCase())) {
        (el as HTMLElement).click();
        return true;
      }
    }
    return false;
  }, rego);

  if (clicked) {
    // Wait for hash to change (SPA navigation) then allow detail view to render
    await page.waitForFunction(
      () => window.location.hash.length > 1,
      { timeout: 8000 }
    ).catch(() => {});
    await new Promise((r) => setTimeout(r, 2500));
  }
}

export async function POST(request: NextRequest) {
  const { registration } = await request.json();

  if (!registration?.trim()) {
    return NextResponse.json({ error: 'Registration plate required' }, { status: 400 });
  }

  const email = process.env.EASYCARS_EMAIL;
  const password = process.env.EASYCARS_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'EASYCARS_EMAIL and EASYCARS_PASSWORD are not set in environment variables' },
      { status: 500 }
    );
  }

  const rego = registration.trim().toUpperCase();
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    const postLoginShot = await login(page, email, password);
    await findVehicleByRego(page, rego, postLoginShot);

    const screenshots = await scrollAndCapture(page);
    const finalUrl = page.url();

    // Last-resort guard: never return screenshots of the login page
    if (isLoginUrl(finalUrl)) {
      return NextResponse.json(
        { error: 'Captured screenshots appear to be of the login page — check EasyCars credentials and try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ screenshots, url: finalUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during scrape';
    const diagShot = (err as { diagShot?: string }).diagShot;
    console.error('EasyCars scrape error:', message);
    return NextResponse.json({ error: message, diagShot }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
