// LinkedIn OAuth token management with automatic refresh.
// Tokens are persisted in app_settings under key 'linkedin_tokens' so they survive
// serverless cold-starts and deployments without requiring manual env var rotation.

import { createClient } from '@supabase/supabase-js';

const LI_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const SETTINGS_KEY = 'linkedin_tokens';

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO string — when the access_token expires
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function readTokens(): Promise<StoredTokens | null> {
  const { data } = await db()
    .from('app_settings')
    .select('value')
    .eq('key', SETTINGS_KEY)
    .single();

  if (!data?.value) return null;
  try {
    return JSON.parse(data.value) as StoredTokens;
  } catch {
    return null;
  }
}

async function writeTokens(tokens: StoredTokens): Promise<void> {
  await db()
    .from('app_settings')
    .upsert({ key: SETTINGS_KEY, value: JSON.stringify(tokens), updated_at: new Date().toISOString() });
}

async function exchangeRefreshToken(refreshToken: string): Promise<StoredTokens> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be set for token refresh');
  }

  const res = await fetch(LI_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error_description?: string }).error_description ??
        `LinkedIn token refresh failed: ${res.status}`
    );
  }

  const data = await res.json();

  // Subtract 60 s so we refresh slightly before actual expiry
  const expiresAt = new Date(Date.now() + data.expires_in * 1000 - 60_000);

  return {
    access_token: data.access_token,
    // LinkedIn rotates the refresh token on each exchange; fall back to current one if not returned
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: expiresAt.toISOString(),
  };
}

/**
 * Returns a valid LinkedIn access token, refreshing automatically when expired.
 * Falls back to LINKEDIN_ACCESS_TOKEN env var if no stored tokens exist (allows
 * the old static-token setup to keep working until bootstrap is run).
 */
export async function getLinkedInAccessToken(): Promise<string> {
  const stored = await readTokens();

  if (stored) {
    if (new Date(stored.expires_at) > new Date()) {
      return stored.access_token;
    }
    // Token expired — refresh and persist
    const fresh = await exchangeRefreshToken(stored.refresh_token);
    await writeTokens(fresh);
    return fresh.access_token;
  }

  // No stored tokens yet — fall back to static env var
  const envToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (envToken) return envToken;

  throw new Error(
    'No LinkedIn access token available. POST to /api/linkedin/setup with a refresh_token to enable auto-refresh.'
  );
}

/**
 * One-time bootstrap: exchanges an initial refresh token, stores both tokens in DB.
 * Call via POST /api/linkedin/setup.
 */
export async function bootstrapLinkedInTokens(refreshToken: string): Promise<void> {
  const tokens = await exchangeRefreshToken(refreshToken);
  await writeTokens(tokens);
}
