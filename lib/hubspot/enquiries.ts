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
  details?: {
    make?: string;
    model?: string;
    year?: string;
    kilometres?: string;
    colour?: string;
    transmission?: string;
    budget?: string;
    yearFrom?: string;
    yearTo?: string;
    notes?: string;
  };
  formId?: string;
  pageUri?: string;
}

const CAR_SALES_PIPELINE = '1680745971';

const DEAL_STAGE: Record<string, string> = {
  enquiry:   '2823590348', // New Enquiry
  valuation: '2824270290', // Car Valuation Request
  sourcing:  '2823576019', // Car Request
  contact:   '2823590348', // New Enquiry
};

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

  // 2. Create or find contact via CRM API
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
  } else {
    const body = await contactRes.json().catch(() => null);
    if (contactRes.status === 409) {
      contactId = body?.message?.match(/existing ID: (\d+)/i)?.[1];
    }
  }

  if (!contactId) {
    return { success: false, error: 'Failed to create HubSpot contact' };
  }

  // 3. Create deal in Car Sales pipeline with correct stage per source
  const v = data.vehicle;
  const d = data.details;
  const make = v?.make ?? d?.make;
  const model = v?.model ?? d?.model;
  const year = v?.year?.toString() ?? d?.year;

  const vehicleLabel = make && model ? `${year ? year + ' ' : ''}${make} ${model}` : 'Enquiry';

  const dealRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      properties: {
        dealname: `${vehicleLabel} — ${data.name}`,
        pipeline: CAR_SALES_PIPELINE,
        dealstage: DEAL_STAGE[data.source ?? ''] ?? DEAL_STAGE.contact,
        amount: v?.price?.toString(),
        description: data.message,
        ...(make             && { vehicle_make:         make }),
        ...(model            && { vehicle_model:        model }),
        ...(year             && { vehicle_year:         year }),
        ...(d?.kilometres    && { vehicle_kilometres:   d.kilometres }),
        ...(d?.colour        && { vehicle_colour:       d.colour }),
        ...(d?.transmission  && { vehicle_transmission: d.transmission }),
        ...(d?.budget        && { vehicle_budget:       d.budget }),
        ...(d?.yearFrom      && { vehicle_year_from:    d.yearFrom }),
        ...(d?.yearTo        && { vehicle_year_to:      d.yearTo }),
        ...(d?.notes         && { enquiry_notes:        d.notes }),
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
