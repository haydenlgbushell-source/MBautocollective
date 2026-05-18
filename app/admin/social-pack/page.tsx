import { getVehicles } from '@/lib/supabase/vehicles';
import { createAdminClient } from '@/lib/supabase/server';
import type { SocialPack } from '@/types/social';
import SocialPackClientPage from './client';

export const revalidate = 0;

export default async function SocialPackPage() {
  let vehicles: Awaited<ReturnType<typeof getVehicles>> = [];
  let packs: SocialPack[] = [];
  let linkedInConnected = !!process.env.LINKEDIN_ACCESS_TOKEN;
  let linkedInExpiresAt: string | null = null;

  try {
    const supabase = await createAdminClient();
    const [vehicleData, { data: packData }, { data: liToken }, { data: liExpiry }] =
      await Promise.all([
        getVehicles(),
        supabase.from('social_packs').select('*'),
        supabase.from('app_settings').select('value').eq('key', 'linkedin_access_token').single(),
        supabase.from('app_settings').select('value').eq('key', 'linkedin_token_expires_at').single(),
      ]);
    vehicles = vehicleData;
    packs = (packData as SocialPack[]) ?? [];
    if (!linkedInConnected && liToken?.value) linkedInConnected = true;
    linkedInExpiresAt = liExpiry?.value ?? null;
  } catch {
    // Supabase not configured
  }

  const packsMap: Record<string, SocialPack> = Object.fromEntries(
    packs.map((p) => [p.vehicle_id, p])
  );

  return (
    <SocialPackClientPage
      vehicles={vehicles}
      packsMap={packsMap}
      linkedInConnected={linkedInConnected}
      linkedInExpiresAt={linkedInExpiresAt}
    />
  );
}
