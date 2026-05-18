import { NextResponse } from 'next/server';
import { createHubSpotEnquiry } from '@/lib/hubspot/enquiries';

const TEST_EMAIL_BASE = 'claude-test';
const TEST_DOMAIN = 'mbautocollective-test.invalid';

const TESTS = [
  {
    label: 'contact',
    data: {
      name: 'Claude Test Contact',
      email: `${TEST_EMAIL_BASE}+contact@${TEST_DOMAIN}`,
      phone: '0400000001',
      message: 'Automated test: contact form',
      source: 'contact' as const,
    },
  },
  {
    label: 'enquiry',
    data: {
      name: 'Claude Test Enquiry',
      email: `${TEST_EMAIL_BASE}+enquiry@${TEST_DOMAIN}`,
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
      email: `${TEST_EMAIL_BASE}+valuation@${TEST_DOMAIN}`,
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
      email: `${TEST_EMAIL_BASE}+sourcing@${TEST_DOMAIN}`,
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
  const results: Record<string, unknown> = {};
  const envCheck = {
    HUBSPOT_ACCESS_TOKEN: !!process.env.HUBSPOT_ACCESS_TOKEN,
    NEXT_PUBLIC_HUBSPOT_PORTAL_ID: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID ?? null,
    NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID: process.env.NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID ?? null,
    NEXT_PUBLIC_HUBSPOT_ENQUIRY_FORM_ID: process.env.NEXT_PUBLIC_HUBSPOT_ENQUIRY_FORM_ID ?? null,
    NEXT_PUBLIC_HUBSPOT_VALUATION_FORM_ID: process.env.NEXT_PUBLIC_HUBSPOT_VALUATION_FORM_ID ?? null,
  };

  for (const test of TESTS) {
    try {
      const result = await createHubSpotEnquiry(test.data);
      results[test.label] = { ok: true, ...result };
    } catch (err) {
      results[test.label] = { ok: false, error: (err as Error).message };
    }
  }

  return NextResponse.json({ envCheck, results });
}
