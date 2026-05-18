import { NextResponse } from 'next/server';
import { createHubSpotEnquiry } from '@/lib/hubspot/enquiries';

const TESTS = [
  {
    label: 'contact',
    data: {
      name: 'Claude Test Contact',
      email: 'claude-test+contact@example.com',
      phone: '0400000001',
      message: 'Automated test: contact form',
      source: 'contact' as const,
    },
  },
  {
    label: 'enquiry',
    data: {
      name: 'Claude Test Enquiry',
      email: 'claude-test+enquiry@example.com',
      phone: '0400000002',
      message: 'Automated test: vehicle enquiry',
      source: 'enquiry' as const,
      vehicle: {
        id: 'test-vehicle-id',
        make: 'Porsche',
        model: '911 GT3',
        year: 2024,
        price: 350000,
        slug: 'porsche-911-gt3-test',
      },
    },
  },
  {
    label: 'valuation',
    data: {
      name: 'Claude Test Valuation',
      email: 'claude-test+valuation@example.com',
      phone: '0400000003',
      message: 'Automated test: valuation request for 2022 BMW M3, 25000 km',
      source: 'valuation' as const,
      details: {
        make: 'BMW',
        model: 'M3',
        year: '2022',
        kilometres: '25000',
        notes: 'Automated test run',
      },
    },
  },
  {
    label: 'sourcing',
    data: {
      name: 'Claude Test Sourcing',
      email: 'claude-test+sourcing@example.com',
      phone: '0400000004',
      message: 'Automated test: car sourcing request',
      source: 'sourcing' as const,
      details: {
        make: 'Ferrari',
        model: 'Roma',
        yearFrom: '2022',
        yearTo: '2024',
        budget: '$400,000',
        colour: 'Black',
        transmission: 'Automatic',
        notes: 'Automated test run',
      },
    },
  },
];

export async function GET() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  const envCheck = {
    HUBSPOT_ACCESS_TOKEN: !!token,
    NEXT_PUBLIC_HUBSPOT_PORTAL_ID: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID ?? null,
    NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID: process.env.NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID ?? null,
    NEXT_PUBLIC_HUBSPOT_ENQUIRY_FORM_ID: process.env.NEXT_PUBLIC_HUBSPOT_ENQUIRY_FORM_ID ?? null,
    NEXT_PUBLIC_HUBSPOT_VALUATION_FORM_ID: process.env.NEXT_PUBLIC_HUBSPOT_VALUATION_FORM_ID ?? null,
  };

  // Diagnostic: raw contact creation to see the actual HubSpot response
  let rawContactDiag: unknown = null;
  if (token) {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          firstname: 'DiagTest',
          lastname: 'Auto',
          email: 'claude-test+diag@example.com',
          phone: '0400000000',
        },
      }),
    });
    const body = await res.json().catch(() => null);
    rawContactDiag = { status: res.status, body };
  }

  const results: Record<string, unknown> = {};
  for (const test of TESTS) {
    try {
      const result = await createHubSpotEnquiry(test.data);
      results[test.label] = { ok: true, ...result };
    } catch (err) {
      results[test.label] = { ok: false, error: (err as Error).message };
    }
  }

  return NextResponse.json({ envCheck, rawContactDiag, results });
}
