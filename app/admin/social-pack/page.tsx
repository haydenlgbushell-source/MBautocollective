import { getVehicles } from '@/lib/supabase/vehicles';
import { createAdminClient } from '@/lib/supabase/server';
import type { SocialPack } from '@/types/social';
import SocialPackClientPage from './client';

export const revalidate = 0;

async function getLinkedInConnected(supabase: Awaited<ReturnType<typeof createAdminClient>>): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['linkedin_access_token', 'linkedin_organization_id', 'linkedin_member_id']);

    const settings = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
    const accessToken = settings['linkedin_access_token'] || process.env.LINKEDIN_ACCESS_TOKEN || '';
    const organizationId = settings['linkedin_organization_id'] || process.env.LINKEDIN_ORGANIZATION_ID || '';
    const memberId = settings['linkedin_member_id'] || '';
    return !!(accessToken && (organizationId || memberId));
  } catch {
    // Fallback to env vars only
    return !!(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_ORGANIZATION_ID);
  }
}

export default async function SocialPackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const linkedInError = params['linkedin_error'] ?? null;
  const linkedInJustConnected = params['linkedin_connected'] === '1';

  let vehicles: Awaited<ReturnType<typeof getVehicles>> = [];
  let packs: SocialPack[] = [];
  let linkedInConnected = false;

  try {
    const supabase = await createAdminClient();
    const [vehicleData, { data: packData }, liConnected] = await Promise.all([
      getVehicles(),
      supabase.from('social_packs').select('*'),
      getLinkedInConnected(supabase),
    ]);
    vehicles = vehicleData;
    packs = (packData as SocialPack[]) ?? [];
    linkedInConnected = liConnected;
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
      linkedInError={linkedInError}
      linkedInJustConnected={linkedInJustConnected}
    />
  );
}
