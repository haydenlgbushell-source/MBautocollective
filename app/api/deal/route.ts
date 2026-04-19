import { NextRequest, NextResponse } from 'next/server';

interface DealRequest {
  email?: string;
  name?: string;
  message?: string;
  vehicle?: {
    id?: string;
    make: string;
    model: string;
    year: number;
    price: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, message, vehicle }: DealRequest = await request.json();

    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ success: false, error: 'No token' }, { status: 500 });

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Find the contact that was just created by the HubSpot form submission
    let contactId: string | undefined;

    if (email) {
      const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filterGroups: [
            { filters: [{ propertyName: 'email', operator: 'EQ', value: email }] },
          ],
          limit: 1,
        }),
      });
      const searchData = await searchRes.json();
      contactId = searchData.results?.[0]?.id;
    }

    // If contact not found yet (race condition), create it
    if (!contactId && email) {
      const [firstName, ...lastParts] = (name ?? '').trim().split(' ');
      const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          properties: {
            email,
            firstname: firstName,
            lastname: lastParts.join(' ') || undefined,
          },
        }),
      });
      if (createRes.ok) {
        contactId = (await createRes.json()).id;
      } else if (createRes.status === 409) {
        const err = await createRes.json();
        contactId = err?.message?.match(/existing ID: (\d+)/)?.[1];
      }
    }

    // Create the deal
    const vehicleLabel = vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      : 'Vehicle Enquiry';

    const dealRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        properties: {
          dealname: `${vehicleLabel} — ${name ?? email ?? 'Enquiry'}`,
          dealstage: 'appointmentscheduled',
          amount: vehicle?.price?.toString(),
          description: message,
        },
      }),
    });

    if (!dealRes.ok) {
      return NextResponse.json({ success: false, error: 'Failed to create deal' }, { status: 500 });
    }

    const dealId = (await dealRes.json()).id;

    // Associate deal with contact
    if (contactId) {
      await fetch(
        `https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
        { method: 'PUT', headers }
      );
    }

    return NextResponse.json({ success: true, dealId });
  } catch (err) {
    console.error('Deal creation error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
