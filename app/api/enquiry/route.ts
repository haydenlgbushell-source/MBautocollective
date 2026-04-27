import { NextRequest, NextResponse } from 'next/server';
import { createHubSpotEnquiry } from '@/lib/hubspot/enquiries';
import { createAdminClient } from '@/lib/supabase/server';

const FORM_IDS: Record<string, string | undefined> = {
  contact: process.env.NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID,
  enquiry: process.env.NEXT_PUBLIC_HUBSPOT_ENQUIRY_FORM_ID,
  valuation: process.env.NEXT_PUBLIC_HUBSPOT_VALUATION_FORM_ID,
  sourcing: process.env.HUBSPOT_SOURCING_FORM_ID,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, vehicle, source = 'website' } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const formId = FORM_IDS[source];
    const pageUri = request.headers.get('referer') ?? undefined;

    // 1. Send to HubSpot (Forms API + CRM contact/deal creation)
    let hubspotResult = null;
    let hubspotError = null;
    try {
      hubspotResult = await createHubSpotEnquiry({
        name,
        email,
        phone,
        message,
        vehicle,
        source,
        formId,
        pageUri,
      });
    } catch (err) {
      console.error('HubSpot error:', err);
      hubspotError = err instanceof Error ? err.message : String(err);
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

    return NextResponse.json({ success: true, hubspot: hubspotResult, hubspotError });
  } catch (err) {
    console.error('Enquiry API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
