import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { batchSyncCatalogue } from '@/lib/platforms/whatsapp-catalogue';
import type { Vehicle } from '@/types/vehicle';

export const maxDuration = 60;

export async function POST() {
  if (!process.env.WHATSAPP_CATALOG_ID || !process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'WHATSAPP_CATALOG_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be set' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const vehicles = (data ?? []) as Vehicle[];
    const result = await batchSyncCatalogue(vehicles);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({
      synced: vehicles.length,
      handles: result.handles,
    });
  } catch (err) {
    console.error('WhatsApp catalogue bulk sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
