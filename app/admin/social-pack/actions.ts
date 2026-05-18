'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { IGVariant, IGStory, TikTokShot, IGReel, PublishPlatform, PublishResults, PlatformResult } from '@/types/social';
import { postToFacebook, postToInstagram } from '@/lib/platforms/facebook';
import { postToLinkedIn } from '@/lib/platforms/linkedin';

export interface PackEdits {
  ig_caption_lifestyle?: string;
  ig_caption_spec?: string;
  ig_caption_story?: string;
  ig_hashtags?: string[];
  ig_photo_order?: string[];
  ig_stories?: IGStory[];
  ig_reel?: IGReel;
  fb_body?: string;
  fb_hashtags?: string[];
  marketplace_title?: string;
  marketplace_body?: string;
  tiktok_script?: TikTokShot[];
  tiktok_hashtags?: string[];
  linkedin_body?: string;
  linkedin_hashtags?: string[];
  threads_body?: string;
  threads_hashtags?: string[];
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function approvePack(
  packId: string,
  captionVariant: IGVariant
): Promise<{ error?: string }> {
  try {
    const supabase = adminClient();
    const { error } = await supabase
      .from('social_packs')
      .update({
        status: 'approved',
        ig_caption_selected: captionVariant,
        approved_at: new Date().toISOString(),
      })
      .eq('id', packId);

    if (error) return { error: error.message };
    revalidatePath('/admin/social-pack');
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updatePack(
  packId: string,
  edits: PackEdits
): Promise<{ error?: string }> {
  try {
    const supabase = adminClient();
    const { error } = await supabase
      .from('social_packs')
      .update(edits)
      .eq('id', packId);

    if (error) return { error: error.message };
    revalidatePath('/admin/social-pack');
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateVehiclePhotos(
  vehicleId: string,
  photos: string[]
): Promise<{ error?: string }> {
  try {
    const supabase = adminClient();
    const { error } = await supabase
      .from('vehicles')
      .update({ photos })
      .eq('id', vehicleId);

    if (error) return { error: error.message };
    revalidatePath('/admin/social-pack');
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export interface PublishPackResult {
  ok: boolean;
  results: PublishResults;
  error?: string;
}

function joinCaption(body: string | null, hashtags: string[] | null): string {
  const b = body ?? '';
  const h = (hashtags ?? []).join(' ');
  return h ? `${b}\n\n${h}` : b;
}

export async function publishPack(
  packId: string,
  platforms: PublishPlatform[]
): Promise<PublishPackResult> {
  try {
    const supabase = adminClient();

    const { data: pack, error: pErr } = await supabase
      .from('social_packs')
      .select('*, vehicles(*)')
      .eq('id', packId)
      .single();

    if (pErr || !pack) return { ok: false, results: {}, error: 'Pack not found' };
    if (pack.status !== 'approved') return { ok: false, results: {}, error: 'Pack must be approved before publishing' };

    const photos: string[] = pack.ig_photo_order ?? pack.vehicles?.photos ?? [];
    const results: Record<string, PlatformResult> = {};

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

    if (platforms.includes('linkedin')) {
      const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
      const organizationId = process.env.LINKEDIN_ORGANIZATION_ID;
      if (!accessToken || !organizationId) {
        results.linkedin = { success: false, error: 'LinkedIn credentials not configured' };
      } else {
        try {
          const text = joinCaption(pack.linkedin_body, pack.linkedin_hashtags);
          const result = await postToLinkedIn({ accessToken, organizationId, text, photoUrl: photos[0] });
          results.linkedin = { success: true, ...result };
        } catch (e) {
          results.linkedin = { success: false, error: e instanceof Error ? e.message : String(e) };
        }
      }
    }

    const anySuccess = Object.values(results).some((r) => r.success);

    if (anySuccess) {
      await supabase
        .from('social_packs')
        .update({ status: 'published', published_at: new Date().toISOString(), publish_results: results })
        .eq('id', packId);
    } else {
      await supabase.from('social_packs').update({ publish_results: results }).eq('id', packId);
    }

    revalidatePath('/admin/social-pack');
    return { ok: anySuccess, results };
  } catch (err) {
    return { ok: false, results: {}, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
