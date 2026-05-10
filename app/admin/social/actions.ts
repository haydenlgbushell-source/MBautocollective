'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function approvePack(packId: string, captionVariant: 'lifestyle' | 'spec' | 'story') {
  const [userClient, adminClient] = await Promise.all([createClient(), createAdminClient()]);
  const { data: { user } } = await userClient.auth.getUser();

  const { error } = await adminClient.from('social_packs').update({
    status: 'approved',
    ig_caption_selected: captionVariant,
    approved_at: new Date().toISOString(),
    approved_by: user?.email ?? 'admin',
  }).eq('id', packId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/social');
}

export async function rejectPack(packId: string) {
  const adminClient = await createAdminClient();
  const { error } = await adminClient.from('social_packs').update({ status: 'rejected' }).eq('id', packId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/social');
}

export async function regeneratePack(vehicleId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const internalKey = process.env.INTERNAL_API_KEY;

  if (!internalKey) throw new Error('INTERNAL_API_KEY not configured');

  const res = await fetch(`${supabaseUrl}/functions/v1/social-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${internalKey}`,
    },
    body: JSON.stringify({ vehicle_id: vehicleId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  revalidatePath('/admin/social');
}
