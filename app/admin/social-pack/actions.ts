'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { IGVariant } from '@/types/social';

export async function approvePack(packId: string, captionVariant: IGVariant) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('social_packs')
    .update({
      status: 'approved',
      ig_caption_selected: captionVariant,
      approved_at: new Date().toISOString(),
    })
    .eq('id', packId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/social-pack');
}

export async function regeneratePack(vehicleId: string) {
  const supabase = await createAdminClient();

  const { data: existing } = await supabase
    .from('social_packs')
    .select('id')
    .eq('vehicle_id', vehicleId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('social_packs')
      .update({ status: 'pending', regeneration_notes: `Manually requested ${new Date().toISOString()}` })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('social_packs')
      .insert({ vehicle_id: vehicleId, status: 'pending' });
    if (error) throw new Error(error.message);
  }

  revalidatePath('/admin/social-pack');
}
