import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
if (!TOKEN) { console.error('Error: HUBSPOT_ACCESS_TOKEN is not set.'); process.exit(1); }
const BASE  = 'https://api.hubapi.com';
const dir   = join(dirname(fileURLToPath(import.meta.url)), 'templates');

const templates = [
  {
    file:  'enquiry-confirmation.html',
    label: 'MB Auto Collective — Enquiry Confirmation',
    path:  'custom/email/mb-enquiry-confirmation.html',
  },
  {
    file:  'welcome.html',
    label: 'MB Auto Collective — Welcome',
    path:  'custom/email/mb-welcome.html',
  },
];

async function push(tpl) {
  const source = readFileSync(join(dir, tpl.file), 'utf8');

  const res = await fetch(`${BASE}/content/api/v2/templates`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      label:         tpl.label,
      path:          tpl.path,
      template_type: 2,       // 2 = email template
      source,
    }),
  });

  const body = await res.json();

  if (!res.ok) {
    console.error(`✗ ${tpl.label}`);
    console.error('  Status :', res.status);
    console.error('  Message:', body.message ?? JSON.stringify(body));
    return null;
  }

  return body;
}

console.log('Pushing templates to HubSpot…\n');

for (const tpl of templates) {
  const result = await push(tpl);
  if (result) {
    console.log(`✓ ${result.label}`);
    console.log(`  ID      : ${result.id}`);
    console.log(`  Path    : ${result.path}`);
    console.log(`  Edit URL: https://app.hubspot.com/design-manager/${result.portal_id}/edit/${result.id}`);
    console.log();
  }
}
