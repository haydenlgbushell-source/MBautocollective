import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('https://api.hubapi.com/crm/v3/pipelines/deals', {
    headers: { Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}` },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
