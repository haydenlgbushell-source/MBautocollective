const BASE = 'https://api.hubapi.com';

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
  };
}

// Returns the HubSpot contact ID, creating the contact if it doesn't exist
export async function upsertContact(
  phone: string,
  name?: string,
): Promise<string> {
  // Search by phone first to avoid duplicates
  const searchRes = await fetch(`${BASE}/crm/v3/objects/contacts/search`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            { propertyName: 'phone', operator: 'EQ', value: phone },
          ],
        },
      ],
      properties: ['firstname', 'lastname', 'phone'],
      limit: 1,
    }),
  });

  const searchData = await searchRes.json();
  if (searchData.results?.length > 0) {
    return searchData.results[0].id as string;
  }

  // Create new contact
  const properties: Record<string, string> = {
    phone,
    hs_lead_source: 'CHAT',
  };

  if (name) {
    const parts = name.trim().split(/\s+/);
    properties.firstname = parts[0];
    if (parts.length > 1) properties.lastname = parts.slice(1).join(' ');
  }

  const createRes = await fetch(`${BASE}/crm/v3/objects/contacts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ properties }),
  });

  const contact = await createRes.json();
  return contact.id as string;
}

// Creates a Deal associated with the given contact
export async function createDeal(
  contactId: string,
  dealName: string,
  stage: string,
): Promise<string> {
  const res = await fetch(`${BASE}/crm/v3/objects/deals`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      properties: {
        dealname: dealName,
        dealstage: stage,
        pipeline: 'default',
        deal_source: 'WhatsApp AI Agent',
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 3, // Contact → Deal
            },
          ],
        },
      ],
    }),
  });

  const deal = await res.json();
  return deal.id as string;
}

// Logs a note on the contact record
export async function createNote(
  contactId: string,
  body: string,
): Promise<void> {
  const res = await fetch(`${BASE}/crm/v3/objects/notes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      properties: {
        hs_note_body: body,
        hs_timestamp: Date.now().toString(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 202, // Note → Contact
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error('HubSpot note error:', await res.text());
  }
}

// Creates a high-priority follow-up task on the contact
export async function createFollowUpTask(
  contactId: string,
  subject: string,
): Promise<void> {
  const due = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now

  const res = await fetch(`${BASE}/crm/v3/objects/tasks`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      properties: {
        hs_task_subject: subject,
        hs_task_body:
          'Customer requested a human callback via the WhatsApp AI agent. Review conversation notes before calling.',
        hs_task_status: 'NOT_STARTED',
        hs_task_priority: 'HIGH',
        hs_task_type: 'CALL',
        hs_timestamp: due.toString(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 204, // Task → Contact
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error('HubSpot task error:', await res.text());
  }
}
