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

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('https://my.easycars.net.au', { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for any input to appear
  await page.waitForSelector('input', { timeout: 10000 });

  // Fill email — try common selectors in priority order
  for (const sel of [
    'input[type="email"]',
    'input[name="email"]',
    'input[id="email"]',
    'input[name="username"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="user" i]',
    'input[type="text"]:first-of-type',
  ]) {
    const el = await page.$(sel);
    if (el) {
      await el.click({ clickCount: 3 });
      await el.type(email, { delay: 40 });
      break;
    }
  }

  // Fill password
  const passEl = await page.$('input[type="password"]');
  if (passEl) {
    await passEl.click({ clickCount: 3 });
    await passEl.type(password, { delay: 40 });
  }

  // Submit
  let submitted = false;
  for (const sel of [
    'button[type="submit"]',
    'input[type="submit"]',
    'button.btn-primary',
    'button.login-btn',
    'button:has-text("Login")',
    'button:has-text("Sign in")',
  ]) {
    const el = await page.$(sel);
    if (el) {
      await el.click();
      submitted = true;
      break;
    }
  }
  if (!submitted) {
    await page.keyboard.press('Enter');
  }

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});

  // Confirm we're past the login page
  const url = page.url();
  if (url.includes('login') || url.includes('signin') || url.includes('sign-in')) {
    throw new Error(
      'Login failed — check EASYCARS_EMAIL and EASYCARS_PASSWORD, or the EasyCars login page selectors may have changed.'
    );
  }
}

async function findVehicleByRego(page: Page, rego: string): Promise<void> {
  const encoded = encodeURIComponent(rego);

  // Attempt 1: URL-based search (most DMS systems support this)
  const searchUrls = [
    `https://my.easycars.net.au/vehicles?search=${encoded}`,
    `https://my.easycars.net.au/stock?search=${encoded}`,
    `https://my.easycars.net.au/inventory?search=${encoded}`,
    `https://my.easycars.net.au/vehicles?rego=${encoded}`,
    `https://my.easycars.net.au/vehicles?registration=${encoded}`,
    `https://my.easycars.net.au/vehicles?q=${encoded}`,
  ];

  let foundViaUrl = false;
  for (const url of searchUrls) {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 12000 }).catch(() => {});

    // Check if we have results (any link/row mentioning the rego)
    const found = await page.evaluate((r: string) => {
      return document.body.innerText.toUpperCase().includes(r.toUpperCase());
    }, rego);

    if (found) {
      foundViaUrl = true;
      break;
    }
  }

  // Attempt 2: Use the on-page search input if URL approach didn't show results
  if (!foundViaUrl) {
    await page.goto('https://my.easycars.net.au/vehicles', {
      waitUntil: 'networkidle2',
      timeout: 12000,
    }).catch(() => {
      page.goto('https://my.easycars.net.au', { waitUntil: 'networkidle2', timeout: 12000 });
    });

    for (const sel of [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="rego" i]',
      'input[placeholder*="registration" i]',
      'input[name="search"]',
      'input[name="q"]',
    ]) {
      const el = await page.$(sel);
      if (el) {
        await el.click({ clickCount: 3 });
        await el.type(rego, { delay: 60 });
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {});
        break;
      }
    }
  }

  // Click into the vehicle detail if we're on a results list
  await page
    .evaluate((r: string) => {
      // Try to find a clickable element containing the rego
      const candidates = Array.from(
        document.querySelectorAll('a, tr[onclick], .vehicle-item, .stock-row, [data-href]')
      );
      for (const el of candidates) {
        if ((el as HTMLElement).innerText?.toUpperCase().includes(r.toUpperCase())) {
          (el as HTMLElement).click();
          return true;
        }
      }
      return false;
    }, rego)
    .catch(() => false);

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {});
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

    return NextResponse.json({ screenshots, url: finalUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during scrape';
    console.error('EasyCars scrape error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
