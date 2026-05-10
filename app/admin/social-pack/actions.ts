'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { IGVariant } from '@/types/social';

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

export async function regeneratePack(vehicleId: string): Promise<{ error?: string }> {
  try {
    const supabase = adminClient();

    // Upsert: create or reset to pending on conflict (unique vehicle_id constraint)
    const { error } = await supabase
      .from('social_packs')
      .upsert(
        {
          vehicle_id: vehicleId,
          status: 'pending',
          regeneration_notes: `Manually requested ${new Date().toISOString()}`,
        },
        { onConflict: 'vehicle_id' }
      );

    if (error) return { error: error.message };
    revalidatePath('/admin/social-pack');
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
