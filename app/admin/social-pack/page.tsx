import { getVehicles } from '@/lib/supabase/vehicles';
import { createAdminClient } from '@/lib/supabase/server';
import type { SocialPack } from '@/types/social';
import SocialPackClientPage from './client';

export const revalidate = 0;

export default async function SocialPackPage() {
  let vehicles: Awaited<ReturnType<typeof getVehicles>> = [];
  let packs: SocialPack[] = [];

  try {
    const supabase = await createAdminClient();
    const [vehicleData, { data: packData }] = await Promise.all([
      getVehicles(),
      supabase.from('social_packs').select('*'),
    ]);
    vehicles = vehicleData;
    packs = (packData as SocialPack[]) ?? [];
  } catch {
    // Supabase not configured
  }

  const packsMap: Record<string, SocialPack> = Object.fromEntries(
    packs.map((p) => [p.vehicle_id, p])
  );

  return <SocialPackClientPage vehicles={vehicles} packsMap={packsMap} />;
}
