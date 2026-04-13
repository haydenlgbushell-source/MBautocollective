interface HubSpotEnquiry {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  vehicle?: {
    id?: string;
    make: string;
    model: string;
    year: number;
    price: number;
    slug?: string;
  };
}

export async function createHubSpotEnquiry(data: HubSpotEnquiry) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) throw new Error('Missing HUBSPOT_ACCESS_TOKEN');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. Create or find contact
  const contactRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      properties: {
        firstname: data.name.split(' ')[0] ?? data.name,
        lastname: data.name.split(' ').slice(1).join(' ') || undefined,
        email: data.email,
        phone: data.phone,
      },
    }),
  });

  let contactId: string | undefined;

  if (contactRes.ok) {
    const contactData = await contactRes.json();
    contactId = contactData.id;
  } else if (contactRes.status === 409) {
    // Contact already exists — extract ID from error
    const err = await contactRes.json();
    contactId = err?.message?.match(/existing ID: (\d+)/)?.[1];
  }

  if (!contactId) return { success: false, error: 'Failed to create HubSpot contact' };

  // 2. Create deal
  const vehicleLabel = data.vehicle
    ? `${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}`
    : 'Vehicle Enquiry';

  const dealRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      properties: {
        dealname: `${vehicleLabel} — Enquiry from ${data.name}`,
        dealstage: 'appointmentscheduled',
        amount: data.vehicle?.price?.toString(),
        description: data.message,
      },
    }),
  });

  if (!dealRes.ok) return { success: false, error: 'Failed to create HubSpot deal' };

  const dealData = await dealRes.json();
  const dealId = dealData.id;

  // 3. Associate deal with contact
  await fetch(
    `https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
    { method: 'PUT', headers }
  );

  return { success: true, contactId, dealId };
}
