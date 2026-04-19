#!/usr/bin/env node
/**
 * Creates the three HubSpot forms (Contact, Vehicle Enquiry, Valuation)
 * and prints the env vars to paste into .env.local
 *
 * Usage:
 *   HUBSPOT_ACCESS_TOKEN=pat-xxx node scripts/setup-hubspot-forms.mjs
 */

const TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('Error: HUBSPOT_ACCESS_TOKEN is not set.');
  console.error('Usage: HUBSPOT_ACCESS_TOKEN=pat-xxx node scripts/setup-hubspot-forms.mjs');
  process.exit(1);
}

const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

// Standard contact fields shared across all forms
const baseFields = [
  {
    objectTypeId: '0-1',
    name: 'firstname',
    label: 'First Name',
    required: true,
    fieldType: 'single_line_text',
  },
  {
    objectTypeId: '0-1',
    name: 'lastname',
    label: 'Last Name',
    required: false,
    fieldType: 'single_line_text',
  },
  {
    objectTypeId: '0-1',
    name: 'email',
    label: 'Email',
    required: true,
    fieldType: 'single_line_text',
  },
  {
    objectTypeId: '0-1',
    name: 'phone',
    label: 'Phone',
    required: false,
    fieldType: 'single_line_text',
  },
  {
    objectTypeId: '0-1',
    name: 'message',
    label: 'Message',
    required: false,
    fieldType: 'multi_line_text',
  },
];

function buildForm(name, fields = baseFields) {
  return {
    name,
    formType: 'hubspot',
    configuration: {
      createNewContactForNewEmail: true,
      language: 'en',
      cloneable: false,
      editable: true,
      allowLinkToResetKnownValues: false,
      lifecycleStages: [],
    },
    displayOptions: {
      renderRawHtml: false,
      cssClass: '',
      style: '',
      submitButtonText: 'Submit',
      theme: 'default_style',
    },
    legalConsentOptions: { type: 'none' },
    fieldGroups: [
      {
        groupType: 'default_group',
        richTextType: 'text',
        fields,
      },
    ],
  };
}

async function createForm(name, fields = baseFields) {
  const res = await fetch('https://api.hubapi.com/marketing/v3/forms', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(buildForm(name, fields)),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Failed to create "${name}": ${JSON.stringify(data)}`);
  }

  return data.id;
}

async function getPortalId() {
  const res = await fetch('https://api.hubapi.com/account-info/v3/details', {
    headers: HEADERS,
  });
  if (!res.ok) throw new Error('Failed to fetch HubSpot account details');
  const data = await res.json();
  return String(data.portalId);
}

async function main() {
  console.log('Fetching HubSpot portal ID...');
  const portalId = await getPortalId();
  console.log(`Portal ID: ${portalId}\n`);

  console.log('Creating HubSpot forms...');

  const [contactId, enquiryId, valuationId] = await Promise.all([
    createForm('MB Auto Collective — Contact'),
    createForm('MB Auto Collective — Vehicle Enquiry'),
    createForm('MB Auto Collective — Car Valuation'),
  ]);

  console.log('Forms created successfully.\n');
  console.log('=== Add these to your .env.local ===\n');
  console.log(`NEXT_PUBLIC_HUBSPOT_PORTAL_ID=${portalId}`);
  console.log(`NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID=${contactId}`);
  console.log(`NEXT_PUBLIC_HUBSPOT_ENQUIRY_FORM_ID=${enquiryId}`);
  console.log(`NEXT_PUBLIC_HUBSPOT_VALUATION_FORM_ID=${valuationId}`);
  console.log('\n=====================================');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
