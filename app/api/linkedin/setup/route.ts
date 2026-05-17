// One-time endpoint to bootstrap LinkedIn OAuth refresh tokens into the database.
// Requires Authorization: Bearer <ADMIN_API_SECRET> header.
//
// Usage:
//   curl -X POST https://your-domain/api/linkedin/setup \
//     -H "Authorization: Bearer <ADMIN_API_SECRET>" \
//     -H "Content-Type: application/json" \
//     -d '{"refresh_token":"<linkedin_refresh_token>"}'

import { NextRequest, NextResponse } from 'next/server';
import { bootstrapLinkedInTokens } from '@/lib/platforms/linkedin-auth';

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.ADMIN_API_SECRET;
  const authHeader = request.headers.get('authorization');

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let refreshToken: string;
  try {
    const body = await request.json();
    refreshToken = body.refresh_token;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!refreshToken) {
    return NextResponse.json({ error: 'refresh_token is required' }, { status: 400 });
  }

  try {
    await bootstrapLinkedInTokens(refreshToken);
    return NextResponse.json({ ok: true, message: 'LinkedIn tokens stored — auto-refresh is now active' });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
