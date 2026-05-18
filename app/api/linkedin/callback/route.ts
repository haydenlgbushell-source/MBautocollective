import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${siteUrl}/admin/social-pack?linkedin_error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/admin/social-pack?linkedin_error=missing_code`);
  }

  // Validate state cookie to prevent CSRF
  const storedState = request.cookies.get('linkedin_oauth_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${siteUrl}/admin/social-pack?linkedin_error=state_mismatch`);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${siteUrl}/api/linkedin/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${siteUrl}/admin/social-pack?linkedin_error=missing_credentials`
    );
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    console.error('LinkedIn token exchange failed:', body);
    return NextResponse.redirect(
      `${siteUrl}/admin/social-pack?linkedin_error=token_exchange_failed`
    );
  }

  const tokenData = await tokenRes.json();
  const accessToken: string = tokenData.access_token;
  const expiresIn: number = tokenData.expires_in ?? 5184000;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  // Store in app_settings (service role bypasses RLS)
  const supabase = db();
  const upserts = [
    { key: 'linkedin_access_token', value: accessToken, updated_at: new Date().toISOString() },
    { key: 'linkedin_token_expires_at', value: expiresAt, updated_at: new Date().toISOString() },
  ];

  const { error: dbErr } = await supabase
    .from('app_settings')
    .upsert(upserts, { onConflict: 'key' });

  if (dbErr) {
    console.error('Failed to store LinkedIn token:', dbErr.message);
    return NextResponse.redirect(
      `${siteUrl}/admin/social-pack?linkedin_error=storage_failed`
    );
  }

  const response = NextResponse.redirect(`${siteUrl}/admin/social-pack?linkedin_connected=1`);
  response.cookies.delete('linkedin_oauth_state');
  return response;
}
