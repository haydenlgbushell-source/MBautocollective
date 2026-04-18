import { submitHubSpotForm } from './forms';

interface HubSpotEnquiry {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  vehicle?: {
    id?: string;
    make: string;
    model: string;
    year: number;
    price: number;
    slug?: string;
  };
  formId?: string;
  pageUri?: string;
}

export async function createHubSpotEnquiry(data: HubSpotEnquiry) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) throw new Error('Missing HUBSPOT_ACCESS_TOKEN');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const [firstName, ...lastParts] = data.name.trim().split(' ');
  const lastName = lastParts.join(' ');

  const vehicleNote = data.vehicle
    ? `Vehicle interest: ${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model} ($${data.vehicle.price.toLocaleString()})`
    : '';

  // 1. Submit via HubSpot Forms API (creates contact + shows in Forms analytics)
  if (data.formId) {
    try {
      await submitHubSpotForm(
        data.formId,
        [
          { name: 'firstname', value: firstName },
          { name: 'lastname', value: lastName },
          { name: 'email', value: data.email },
          { name: 'phone', value: data.phone ?? '' },
          { name: 'message', value: [data.message, vehicleNote].filter(Boolean).join('\n\n') },
        ],
        { pageUri: data.pageUri, pageName: data.source }
      );
    } catch (err) {
      console.error('HubSpot Forms API error (non-fatal):', err);
    }
  }

  // 2. Create or find contact via CRM API (required for deal association)
  const contactRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      properties: {
        firstname: firstName,
        lastname: lastName || undefined,
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
    const err = await contactRes.json();
    contactId = err?.message?.match(/existing ID: (\d+)/)?.[1];
  }

  if (!contactId) return { success: false, error: 'Failed to create HubSpot contact' };

  // 3. Create deal
  const vehicleLabel = data.vehicle
    ? `${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}`
    : 'Enquiry';

  const dealRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      properties: {
        dealname: `${vehicleLabel} — ${data.name}`,
        dealstage: 'appointmentscheduled',
        amount: data.vehicle?.price?.toString(),
        description: data.message,
      },
    }),
  });

  if (!dealRes.ok) return { success: false, error: 'Failed to create HubSpot deal' };

  const dealData = await dealRes.json();
  const dealId = dealData.id;

  // 4. Associate deal with contact
  await fetch(
    `https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
    { method: 'PUT', headers }
  );

  return { success: true, contactId, dealId };
}
