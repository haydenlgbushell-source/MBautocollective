'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { IGVariant, IGStory, TikTokShot, IGReel } from '@/types/social';

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
