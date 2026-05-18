import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET() {
  const { data } = await db()
    .from('app_settings')
    .select('key, value')
    .in('key', ['linkedin_access_token', 'linkedin_organization_id']);

  const settings = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));

  const accessToken =
    settings['linkedin_access_token'] || process.env.LINKEDIN_ACCESS_TOKEN || '';
  const organizationId =
    settings['linkedin_organization_id'] || process.env.LINKEDIN_ORGANIZATION_ID || '';

  return NextResponse.json({ connected: !!(accessToken && organizationId) });
}
