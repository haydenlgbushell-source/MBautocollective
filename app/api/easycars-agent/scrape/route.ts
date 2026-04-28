import { NextRequest, NextResponse } from 'next/server';
import type { Browser, Page } from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';

// Vercel Pro required for maxDuration > 10s
export const maxDuration = 60;

// ── Cookie persistence via Supabase ──────────────────────────────────────────

type SavedCookie = {
  name: string; value: string; domain: string; path: string;
  expires: number; httpOnly: boolean; secure: boolean; sameSite?: string;
};

const COOKIE_KEY = 'easycars_session';

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function loadCookies(): Promise<SavedCookie[] | null> {
  try {
    const sb = supabaseAdmin();
    if (!sb) return null;
    const { data } = await sb
      .from('app_settings')
      .select('value')
      .eq('key', COOKIE_KEY)
      .single();
    return data?.value ? JSON.parse(data.value) : null;
  } catch { return null; }
}

async function saveCookies(cookies: SavedCookie[]): Promise<void> {
  try {
    const sb = supabaseAdmin();
    if (!sb) return;
    await sb.from('app_settings').upsert({ key: COOKIE_KEY, value: JSON.stringify(cookies) });
  } catch { /* non-fatal */ }
}

// ── Browser setup ─────────────────────────────────────────────────────────────

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const chromium = (await import('@sparticuz/chromium-min')).default;
    const puppeteer = (await import('puppeteer-core')).default;
    return puppeteer.launch({
      args: [...chromium.args, '--disable-gpu', '--no-sandbox', '--disable-blink-features=AutomationControlled'],
      defaultViewport: { width: 1440, height: 900 },
      executablePath: await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
      ),
      headless: true,
    });
  } else {
    const puppeteer = await import('puppeteer');
    return puppeteer.default.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled'],
      defaultViewport: { width: 1440, height: 900 },
    });
  }
}

async function applyStealthSettings(page: Page): Promise<void> {
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', {
      get: () => Object.assign([...Array(3)].map((_, i) => ({ name: `Plugin${i}` })), { length: 3 }),
    });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-AU', 'en'] });
  });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  );
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-AU,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function jpeg(page: Page): Promise<string> {
  const buf = await page.screenshot({ type: 'jpeg', quality: 72, fullPage: false });
  return Buffer.from(buf as Buffer).toString('base64');
}

async function scrollAndCapture(page: Page): Promise<string[]> {
  const shots: string[] = [await jpeg(page)];
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

async function typeIntoField(page: Page, selector: string, value: string): Promise<boolean> {
  const el = await page.$(selector);
  if (!el) return false;
  await el.click({ clickCount: 3 });
  await el.type(value, { delay: 60 });
  return true;
}

// ── Session via saved cookies ─────────────────────────────────────────────────

/**
 * Inject saved cookies and test whether the session is still valid by
 * navigating to the vehicles page. Returns true if the session is active.
 */
async function tryRestoredSession(page: Page, cookies: SavedCookie[]): Promise<boolean> {
  await page.setCookie(...(cookies as Parameters<Page['setCookie']>[0][]));
  await page.goto('https://my.easycars.net.au/app/Vehicles/Manage', {
    waitUntil: 'domcontentloaded', timeout: 20000,
  });
  await new Promise((r) => setTimeout(r, 2500));
  return !isLoginUrl(page.url());
}

// ── Full login flow ───────────────────────────────────────────────────────────

async function login(page: Page, email: string, password: string): Promise<string> {
  page.setDefaultNavigationTimeout(30000);

  const cleanEmail    = email.trim();
  const cleanPassword = password.trim();

  await page.goto('https://my.easycars.net.au/app/Login', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('input', { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1500));

  // Fill email — PascalCase variants common in .NET/ASP.NET MVC
  const emailSelectors = [
    'input[type="email"]',
    'input[name="Email"]', 'input[name="email"]',
    'input[id="Email"]',   'input[id="email"]',
    'input[name="UserName"]', 'input[name="username"]',
    'input[placeholder*="email" i]', 'input[placeholder*="user" i]',
    'input[type="text"]',
  ];
  let emailFilled = false;
  for (const sel of emailSelectors) {
    if (await typeIntoField(page, sel, cleanEmail)) { emailFilled = true; break; }
  }
  if (!emailFilled) throw new Error('Could not find the email/username field on the EasyCars login page.');

  const passFilled = await typeIntoField(page, 'input[type="password"]', cleanPassword)
    || await typeIntoField(page, 'input[name="Password"]', cleanPassword);
  if (!passFilled) throw new Error('Could not find the password field on the EasyCars login page.');

  await new Promise((r) => setTimeout(r, 500));

  // Pre-submit screenshot — shows whether fields were filled (attached to errors)
  const preSubmitShot = await jpeg(page);

  // Submit
  let submitted = false;
  for (const sel of ['button[type="submit"]', 'input[type="submit"]', 'button.btn-primary', 'button.login-btn']) {
    const el = await page.$(sel);
    if (el) { await el.click(); submitted = true; break; }
  }
  if (!submitted) {
    submitted = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button, input[type="button"]'))
        .find((el) => /login|sign\s*in/i.test((el as HTMLElement).innerText || (el as HTMLInputElement).value || ''));
      if (btn) { (btn as HTMLElement).click(); return true; }
      return false;
    });
  }
  if (!submitted) await page.keyboard.press('Enter');

  // Wait for password field to vanish — definitive exit from login page
  await page.waitForFunction(
    () => !document.querySelector('input[type="password"]'),
    { timeout: 20000 }
  ).catch(() => {});
  await new Promise((r) => setTimeout(r, 1000));

  if (await page.$('input[type="password"]')) {
    throw Object.assign(
      new Error(
        'Login failed — EasyCars is still showing the login form after submission. ' +
        'The screenshot shows the form state BEFORE clicking login — check if the fields contain your credentials.'
      ),
      { diagShot: preSubmitShot }
    );
  }

  // Dismiss MFA prompt if present
  await page.evaluate(() => {
    const skip = Array.from(document.querySelectorAll('a, button')).find((el) => {
      const t = (el as HTMLElement).innerText?.toLowerCase() ?? '';
      return t.includes('continue without') || t.includes('skip') || t.includes('remind me later');
    });
    if (skip) (skip as HTMLElement).click();
  });

  await new Promise((r) => setTimeout(r, 3000));
  return jpeg(page);
}

// ── Find vehicle by rego ──────────────────────────────────────────────────────

async function findVehicleByRego(page: Page, rego: string, postLoginShot: string): Promise<void> {
  const base = 'https://my.easycars.net.au/app/Vehicles/Manage';

  // Only navigate if not already there
  if (!page.url().includes('/Vehicles/Manage')) {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise((r) => setTimeout(r, 3000));
  }

  if (isLoginUrl(page.url())) {
    throw Object.assign(
      new Error('Session not established — redirected to login when accessing vehicles. The screenshot shows the browser state right after login.'),
      { diagShot: postLoginShot }
    );
  }

  const searchSelectors = [
    'input[type="search"]',
    'input[placeholder*="search" i]', 'input[placeholder*="rego" i]',
    'input[placeholder*="registration" i]', 'input[placeholder*="filter" i]',
    'input[placeholder*="vehicle" i]',
    'input[name="search"]', 'input[name="q"]', 'input[type="text"]',
  ];

  for (const sel of searchSelectors) {
    const el = await page.$(sel);
    if (el) {
      await el.click({ clickCount: 3 });
      await el.type(rego, { delay: 60 });
      await new Promise((r) => setTimeout(r, 2500));
      break;
    }
  }

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
    await page.waitForFunction(() => window.location.hash.length > 1, { timeout: 8000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2500));
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { registration } = await request.json();

  if (!registration?.trim()) {
    return NextResponse.json({ error: 'Registration plate required' }, { status: 400 });
  }

  const email    = process.env.EASYCARS_EMAIL;
  const password = process.env.EASYCARS_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'EASYCARS_EMAIL and EASYCARS_PASSWORD are not configured in environment variables.' },
      { status: 500 }
    );
  }

  const rego = registration.trim().toUpperCase();
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await applyStealthSettings(page);

    let postLoginShot = '';
    let sessionEstablished = false;

    // ── 1. Try restoring a saved session (skips login + bot detection entirely)
    const savedCookies = await loadCookies();
    if (savedCookies?.length) {
      sessionEstablished = await tryRestoredSession(page, savedCookies);
      if (sessionEstablished) {
        postLoginShot = await jpeg(page);
        console.log('[EasyCars] Session restored from saved cookies — skipping login');
      } else {
        console.log('[EasyCars] Saved cookies expired — falling back to login');
      }
    }

    // ── 2. Full login if saved session didn't work
    if (!sessionEstablished) {
      postLoginShot = await login(page, email, password);
      // Persist the new session for next time
      const freshCookies = await page.cookies('https://my.easycars.net.au');
      await saveCookies(freshCookies as SavedCookie[]);
    }

    // ── 3. Navigate to the vehicle listing
    await findVehicleByRego(page, rego, postLoginShot);

    // Save refreshed cookies after navigating (session may have been extended)
    const latestCookies = await page.cookies('https://my.easycars.net.au');
    await saveCookies(latestCookies as SavedCookie[]);

    const screenshots = await scrollAndCapture(page);
    const finalUrl    = page.url();

    if (isLoginUrl(finalUrl)) {
      return NextResponse.json(
        { error: 'Captured screenshots appear to be of the login page — the session may have expired mid-request.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ screenshots, url: finalUrl });
  } catch (err: unknown) {
    const message  = err instanceof Error ? err.message : 'Unknown error during scrape';
    const diagShot = (err as { diagShot?: string }).diagShot;
    console.error('[EasyCars scrape error]', message);
    return NextResponse.json({ error: message, diagShot }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
