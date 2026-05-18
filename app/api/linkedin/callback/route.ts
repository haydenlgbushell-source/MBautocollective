import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function upsertSetting(key: string, value: string) {
  const { error } = await db()
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) {
    console.error('[linkedin/callback] upsertSetting failed:', key, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? origin;
  const redirectUri = `${baseUrl}/api/linkedin/callback`;

  if (error || !code) {
    const desc = searchParams.get('error_description') ?? error ?? 'Unknown error';
    return NextResponse.redirect(
      `${baseUrl}/admin/social-pack?linkedin_error=${encodeURIComponent(desc)}`
    );
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;

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
    const msg = await tokenRes.text();
    console.error('[linkedin/callback] token exchange failed:', tokenRes.status, msg);
    return NextResponse.redirect(
      `${baseUrl}/admin/social-pack?linkedin_error=${encodeURIComponent(`Token exchange failed: ${msg}`)}`
    );
  }

  const tokenData = await tokenRes.json() as {
    access_token: string;
    expires_in?: number;
    refresh_token?: string;
  };

  try {
    await upsertSetting('linkedin_access_token', tokenData.access_token);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.redirect(
      `${baseUrl}/admin/social-pack?linkedin_error=${encodeURIComponent(`DB write failed: ${msg}`)}`
    );
  }

  // Auto-discover the organization the user administers (pick the first)
  try {
    const aclRes = await fetch(
      'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalTarget~(id,localizedName)))',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    if (aclRes.ok) {
      const aclData = await aclRes.json() as {
        elements?: { organizationalTarget?: { id?: string } }[];
      };
      const orgUrn = aclData.elements?.[0]?.organizationalTarget?.id;
      if (orgUrn) {
        // URN format: urn:li:organization:12345678 — extract the numeric ID
        const orgId = orgUrn.split(':').pop() ?? orgUrn;
        await upsertSetting('linkedin_organization_id', orgId);
      }
    }
  } catch {
    // Non-fatal — admin can set LINKEDIN_ORGANIZATION_ID env var manually
  }

  return NextResponse.redirect(`${baseUrl}/admin/social-pack?linkedin_connected=1`);
}
