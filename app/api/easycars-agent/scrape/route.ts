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

/** Fill an input in a way that triggers React/Vue/Angular change detection. */
async function fillInput(page: Page, selector: string, value: string): Promise<boolean> {
  return page.evaluate((sel, val) => {
    const el = document.querySelector(sel) as HTMLInputElement | null;
    if (!el) return false;
    el.focus();
    // Use the native setter so React's synthetic event system picks up the change
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeSetter?.call(el, val);
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, selector, value);
}

async function login(page: Page, email: string, password: string): Promise<void> {
  page.setDefaultNavigationTimeout(30000);

  await page.goto('https://my.easycars.net.au/app/Login', { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for the form to appear and allow the SPA to fully initialise
  await page.waitForSelector('input', { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1500));

  // Try to fill the email field using React-safe native setter
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[id="email"]',
    'input[name="username"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="user" i]',
    'input[type="text"]',
  ];
  let emailFilled = false;
  for (const sel of emailSelectors) {
    if (await fillInput(page, sel, email)) { emailFilled = true; break; }
  }
  if (!emailFilled) throw new Error('Could not find the email/username field on the EasyCars login page.');

  // Fill password
  const passFilled = await fillInput(page, 'input[type="password"]', password);
  if (!passFilled) throw new Error('Could not find the password field on the EasyCars login page.');

  // Small delay so the SPA can validate the filled values before we submit
  await new Promise((r) => setTimeout(r, 500));

  // Submit — hook waitForNavigation BEFORE clicking to avoid the race
  const navPromise = page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 25000 }).catch(() => {});
  let submitted = false;
  for (const sel of [
    'button[type="submit"]',
    'input[type="submit"]',
    'button.btn-primary',
    'button.login-btn',
    'button',
  ]) {
    const el = await page.$(sel);
    if (el) {
      await el.click();
      submitted = true;
      break;
    }
  }
  if (!submitted) await page.keyboard.press('Enter');
  await navPromise;

  // Give SPA extra time to settle and set auth state
  await new Promise((r) => setTimeout(r, 2500));

  // URL check
  if (isLoginUrl(page.url())) {
    const diagShot = await jpeg(page);
    throw Object.assign(
      new Error('Login failed — check EASYCARS_EMAIL / EASYCARS_PASSWORD in your environment variables.'),
      { diagShot }
    );
  }

  // Secondary check: password field still visible means login form is still showing
  if (await page.$('input[type="password"]')) {
    const diagShot = await jpeg(page);
    throw Object.assign(
      new Error('Login failed — EasyCars is still showing the login form after credentials were submitted. Verify your credentials.'),
      { diagShot }
    );
  }
}

async function findVehicleByRego(page: Page, rego: string): Promise<void> {
  // EasyCars is a hash-based SPA — vehicle detail URL is /app/Vehicles/Manage/#<id>
  // waitForNavigation won't fire on hash changes, so we poll for DOM/hash changes instead.
  const base = 'https://my.easycars.net.au/app/Vehicles/Manage';

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 20000 });
  // Wait for SPA to fully initialise
  await new Promise((r) => setTimeout(r, 3000));

  // Guard: if we were redirected to login the session wasn't established
  if (isLoginUrl(page.url())) {
    const diagShot = await jpeg(page);
    throw Object.assign(
      new Error('Session not established — browser was redirected to login when accessing vehicles. Verify EASYCARS_EMAIL / EASYCARS_PASSWORD are correct.'),
      { diagShot }
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

    await login(page, email, password);
    await findVehicleByRego(page, rego);

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
