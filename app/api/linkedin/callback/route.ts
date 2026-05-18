// LinkedIn OAuth callback — exchanges the authorization code for tokens and
// stores them in app_settings. Visit /api/linkedin/callback to start the flow.
//
// Required env vars: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, ADMIN_API_SECRET

import { NextRequest, NextResponse } from 'next/server';
import { bootstrapLinkedInTokens } from '@/lib/platforms/linkedin-auth';

const SCOPES = ['w_organization_social', 'r_organization_social'].join(' ');

function callbackUrl(req: NextRequest): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${req.headers.get('host')}`;
  return `${base}/api/linkedin/callback`;
}

// GET /api/linkedin/callback — two modes:
//   1. No query params + Authorization header → redirect to LinkedIn authorization page
//   2. ?code=... → exchange code for tokens and store them
export async function GET(request: NextRequest) {
  const expectedSecret = process.env.ADMIN_API_SECRET;
  const authHeader = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Step 2 — LinkedIn redirects back here with a code
  if (code) {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return new NextResponse('LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be set', { status: 500 });
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl(request),
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json().catch(() => ({}));
      const msg = (err as { error_description?: string }).error_description ?? `Token exchange failed: ${tokenRes.status}`;
      return new NextResponse(`LinkedIn error: ${msg}`, { status: 500 });
    }

    const data = await tokenRes.json();

    try {
      // bootstrapLinkedInTokens expects a refresh_token; if LinkedIn returned one, use it.
      // If not (some flows omit it), store what we have directly.
      if (data.refresh_token) {
        await bootstrapLinkedInTokens(data.refresh_token);
      } else {
        // Store the access token directly with its expiry — no refresh available
        const { default: supabase } = await import('@supabase/supabase-js');
        const db = supabase.createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        );
        const expiresAt = new Date(Date.now() + data.expires_in * 1000 - 60_000);
        await db.from('app_settings').upsert({
          key: 'linkedin_tokens',
          value: JSON.stringify({
            access_token: data.access_token,
            refresh_token: '',
            expires_at: expiresAt.toISOString(),
          }),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      return new NextResponse(
        `Failed to store tokens: ${e instanceof Error ? e.message : String(e)}`,
        { status: 500 }
      );
    }

    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem">
        <h2>LinkedIn connected</h2>
        <p>Tokens stored successfully. Auto-refresh is now active.</p>
        <p><a href="/admin">Back to admin</a></p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  if (error) {
    return new NextResponse(`LinkedIn authorization error: ${searchParams.get('error_description') ?? error}`, { status: 400 });
  }

  // Step 1 — initiate the OAuth flow (requires admin auth)
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'LINKEDIN_CLIENT_ID not set' }, { status: 500 });
  }

  const state = Math.random().toString(36).slice(2);
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', callbackUrl(request));
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
