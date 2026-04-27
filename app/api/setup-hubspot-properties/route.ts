import { NextResponse } from 'next/server';

const PROPERTIES = [
  { name: 'vehicle_make',         label: 'Vehicle Make',        type: 'string', fieldType: 'text' },
  { name: 'vehicle_model',        label: 'Vehicle Model',       type: 'string', fieldType: 'text' },
  { name: 'vehicle_year',         label: 'Vehicle Year',        type: 'string', fieldType: 'text' },
  { name: 'vehicle_kilometres',   label: 'Kilometres',          type: 'string', fieldType: 'text' },
  { name: 'vehicle_colour',       label: 'Colour Preference',   type: 'string', fieldType: 'text' },
  { name: 'vehicle_transmission', label: 'Transmission',        type: 'string', fieldType: 'text' },
  { name: 'vehicle_budget',       label: 'Budget',              type: 'string', fieldType: 'text' },
  { name: 'vehicle_year_from',    label: 'Year From',           type: 'string', fieldType: 'text' },
  { name: 'vehicle_year_to',      label: 'Year To',             type: 'string', fieldType: 'text' },
  { name: 'enquiry_notes',        label: 'Additional Notes',    type: 'string', fieldType: 'textarea' },
];

export async function GET() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const results = [];
  for (const prop of PROPERTIES) {
    const res = await fetch('https://api.hubapi.com/crm/v3/properties/deals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prop, groupName: 'dealinformation' }),
    });
    const data = await res.json();
    results.push({ name: prop.name, status: res.status, result: data.name ?? data.message });
  }
  return NextResponse.json(results);
}
