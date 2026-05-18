import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { postToFacebook, postToInstagram } from '@/lib/platforms/facebook';
import { postToLinkedIn } from '@/lib/platforms/linkedin';

export const maxDuration = 60;

type PlatformResult = {
  success: boolean;
  postId?: string;
  postUrl?: string;
  mediaId?: string;
  error?: string;
};

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function joinCaption(body: string | null, hashtags: string[] | null): string {
  const b = body ?? '';
  const h = (hashtags ?? []).join(' ');
  return h ? `${b}\n\n${h}` : b;
}

export async function POST(request: NextRequest) {
  let packId: string;
  let platforms: string[];

  try {
    const body = await request.json();
    packId = body.pack_id;
    platforms = Array.isArray(body.platforms) ? body.platforms : [];
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!packId) return NextResponse.json({ error: 'pack_id required' }, { status: 400 });
  if (!platforms.length)
    return NextResponse.json({ error: 'At least one platform required' }, { status: 400 });

  const supabase = db();

  // Fetch pack + vehicle
  const { data: pack, error: pErr } = await supabase
    .from('social_packs')
    .select('*, vehicles(*)')
    .eq('id', packId)
    .single();

  if (pErr || !pack)
    return NextResponse.json({ error: 'Pack not found' }, { status: 404 });

  if (pack.status !== 'approved')
    return NextResponse.json(
      { error: 'Pack must be approved before publishing' },
      { status: 400 }
    );

  const photos: string[] = pack.ig_photo_order ?? pack.vehicles?.photos ?? [];

  // Build per-platform results
  const results: Record<string, PlatformResult> = {};

  // ── Facebook ──────────────────────────────────────────────────────────────
  if (platforms.includes('facebook')) {
    const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;

    if (!pageToken || !pageId) {
      results.facebook = { success: false, error: 'Facebook credentials not configured' };
    } else {
      try {
        const message = joinCaption(pack.fb_body, pack.fb_hashtags);
        const result = await postToFacebook({ pageId, pageToken, message, photoUrl: photos[0] });
        results.facebook = { success: true, ...result };
      } catch (e) {
        results.facebook = { success: false, error: e instanceof Error ? e.message : String(e) };
      }
    }
  }

  // ── Instagram ─────────────────────────────────────────────────────────────
  if (platforms.includes('instagram')) {
    const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    if (!pageToken || !igUserId) {
      results.instagram = { success: false, error: 'Instagram credentials not configured' };
    } else {
      try {
        const selectedVariant = pack.ig_caption_selected ?? 'lifestyle';
        const captionBody: Record<string, string | null> = {
          lifestyle: pack.ig_caption_lifestyle,
          spec: pack.ig_caption_spec,
          story: pack.ig_caption_story,
        };
        const caption = joinCaption(
          captionBody[selectedVariant] ?? pack.ig_caption_lifestyle,
          pack.ig_hashtags
        );
        const result = await postToInstagram({ igUserId, pageToken, caption, photoUrls: photos });
        results.instagram = { success: true, ...result };
      } catch (e) {
        results.instagram = { success: false, error: e instanceof Error ? e.message : String(e) };
      }
    }
  }

  // ── LinkedIn ──────────────────────────────────────────────────────────────
  if (platforms.includes('linkedin')) {
    const { data: liSettings } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['linkedin_access_token', 'linkedin_organization_id', 'linkedin_member_id']);
    const liMap = Object.fromEntries((liSettings ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));

    const accessToken = liMap['linkedin_access_token'] || process.env.LINKEDIN_ACCESS_TOKEN;
    const organizationId = liMap['linkedin_organization_id'] || process.env.LINKEDIN_ORGANIZATION_ID;
    const memberId = liMap['linkedin_member_id'];

    if (!accessToken || (!organizationId && !memberId)) {
      results.linkedin = { success: false, error: 'LinkedIn credentials not configured' };
    } else {
      try {
        const text = joinCaption(pack.linkedin_body, pack.linkedin_hashtags);
        const result = await postToLinkedIn({ accessToken, organizationId, memberId, text, photoUrl: photos[0] });
        results.linkedin = { success: true, ...result };
      } catch (e) {
        results.linkedin = { success: false, error: e instanceof Error ? e.message : String(e) };
      }
    }
  }

  // ── Update pack status ────────────────────────────────────────────────────
  const anySuccess = Object.values(results).some((r) => r.success);

  if (anySuccess) {
    await supabase
      .from('social_packs')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        publish_results: results,
      })
      .eq('id', packId);
  } else {
    // Preserve existing publish_results, just merge new failures
    await supabase
      .from('social_packs')
      .update({ publish_results: results })
      .eq('id', packId);
  }

  return NextResponse.json({
    ok: anySuccess,
    results,
  });
}
