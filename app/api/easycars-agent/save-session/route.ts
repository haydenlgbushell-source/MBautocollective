import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const COOKIE_KEY = 'easycars_session';

export async function POST(request: NextRequest) {
  try {
    const { cookies } = await request.json();

    if (!Array.isArray(cookies) || cookies.length === 0) {
      return NextResponse.json({ error: 'Expected a JSON array of cookies.' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase not configured on the server.' }, { status: 500 });
    }

    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await sb
      .from('app_settings')
      .upsert({ key: COOKIE_KEY, value: JSON.stringify(cookies), updated_at: new Date().toISOString() });

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, count: cookies.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
