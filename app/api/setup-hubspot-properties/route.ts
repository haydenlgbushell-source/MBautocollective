import { NextResponse } from 'next/server';

const PROPERTIES = [
  { name: 'vehicle_budget',    label: 'Budget',    type: 'string', fieldType: 'text' },
  { name: 'vehicle_year_from', label: 'Year From', type: 'string', fieldType: 'text' },
  { name: 'vehicle_year_to',   label: 'Year To',   type: 'string', fieldType: 'text' },
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
