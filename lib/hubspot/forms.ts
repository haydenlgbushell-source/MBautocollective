interface HubSpotFormField {
  name: string;
  value: string;
}

interface HubSpotFormContext {
  pageUri?: string;
  pageName?: string;
}

export async function submitHubSpotForm(
  formId: string,
  fields: HubSpotFormField[],
  context: HubSpotFormContext = {}
): Promise<void> {
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
  if (!portalId) throw new Error('Missing NEXT_PUBLIC_HUBSPOT_PORTAL_ID');
  if (!formId) throw new Error('Missing HubSpot form ID');

  const res = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: fields.filter((f) => f.value !== '' && f.value !== undefined),
        context,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HubSpot form submission failed: ${err}`);
  }
}
