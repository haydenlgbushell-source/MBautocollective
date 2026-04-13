import { NextRequest, NextResponse } from 'next/server';
import { createHubSpotEnquiry } from '@/lib/hubspot/enquiries';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, vehicle, source = 'website' } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // 1. Send to HubSpot
    let hubspotResult = null;
    try {
      hubspotResult = await createHubSpotEnquiry({ name, email, phone, message, vehicle });
    } catch (err) {
      console.error('HubSpot error:', err);
      // Don't fail the request if HubSpot is down — Supabase backup is sufficient
    }

    // 2. Save to Supabase as backup
    try {
      const supabase = await createAdminClient();
      await supabase.from('enquiries').insert({
        vehicle_id: vehicle?.id ?? null,
        name,
        email,
        phone: phone ?? null,
        message: message ?? null,
        source,
      });
    } catch (err) {
      console.error('Supabase enquiry backup error:', err);
    }

    return NextResponse.json({ success: true, hubspot: hubspotResult });
  } catch (err) {
    console.error('Enquiry API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
