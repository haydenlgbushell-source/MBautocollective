import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'LINKEDIN_CLIENT_ID not configured' }, { status: 500 });
  }

  // Derive base URL from the request so it works without NEXT_PUBLIC_BASE_URL
  const { origin } = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? origin;
  const redirectUri = `${baseUrl}/api/linkedin/callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'w_organization_social r_organization_social',
    state: 'social-pack',
  });

  return NextResponse.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  );
}
