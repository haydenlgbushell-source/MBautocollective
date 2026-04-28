import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';

interface PushRequest {
  supabase: Record<string, unknown>;
  hubspot: Record<string, unknown>;
  only?: 'supabase' | 'hubspot';
}

export async function POST(request: NextRequest) {
  const { supabase: sbRaw, hubspot: hsRaw, only }: PushRequest = await request.json();

  const results = {
    supabase: { ok: false, message: '' },
    hubspot: { ok: false, message: '' },
  };

  if (!only || only === 'supabase') {
    try {
      const {
        stock_number,
        year,
        make,
        model,
        variant,
        body_type,
        colour,
        kilometres,
        engine,
        transmission,
        fuel_type,
        vin,
        reg_plate,
        reg_expiry,
        price,
        description,
        status,
      } = sbRaw as Record<string, unknown>;

      if (!make || !model || !year || !price) {
        throw new Error('make, model, year, and price are required');
      }

      const slug = generateSlug(
        make as string,
        model as string,
        year as number,
        variant as string | undefined
      );

      const supabase = await createAdminClient();
      const { error } = await supabase.from('vehicles').insert({
        slug,
        stock_number,
        year,
        make,
        model,
        variant,
        body_type,
        colour,
        kilometres,
        engine,
        transmission,
        fuel_type,
        vin,
        reg_plate,
        reg_expiry,
        price,
        description,
        status: status || 'available',
        photos: [],
      });

      if (error) throw new Error(error.message);
      results.supabase = { ok: true, message: 'Vehicle added to Supabase ✓' };
    } catch (e: unknown) {
      results.supabase = { ok: false, message: (e as Error).message };
    }
  }

  if (!only || only === 'hubspot') {
    try {
      const token = process.env.HUBSPOT_ACCESS_TOKEN;
      if (!token) throw new Error('HubSpot token not configured');

      const { dealname, pipeline, dealstage, amount, ...custom } = hsRaw as Record<
        string,
        unknown
      >;

      const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          properties: {
            dealname,
            pipeline: pipeline || 'default',
            dealstage: dealstage || 'appointmentscheduled',
            amount: String(amount),
            ...custom,
          },
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error((e as { message?: string }).message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      results.hubspot = { ok: true, message: `Deal created · ID ${data.id} ✓` };
    } catch (e: unknown) {
      results.hubspot = { ok: false, message: (e as Error).message };
    }
  }

  return NextResponse.json(results);
}
