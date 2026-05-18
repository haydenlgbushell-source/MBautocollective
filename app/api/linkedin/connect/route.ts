import { NextResponse } from 'next/server';

const SCOPES = ['w_organization_social', 'r_organization_social'].join(' ');

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  if (!clientId) {
    return NextResponse.json({ error: 'LINKEDIN_CLIENT_ID not configured' }, { status: 500 });
  }

  const state = crypto.randomUUID();
  const redirectUri = `${siteUrl}/api/linkedin/callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: SCOPES,
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set('linkedin_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
