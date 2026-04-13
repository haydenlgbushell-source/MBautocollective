import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { make, model, variant, year, price, ...rest } = body;

    if (!make || !model || !year || !price) {
      return NextResponse.json(
        { error: 'make, model, year, and price are required' },
        { status: 400 }
      );
    }

    const slug = generateSlug(make, model, year, variant);

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('vehicles')
      .insert({ make, model, variant, year, price, slug, ...rest })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique slug conflict — append random suffix
        const uniqueSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        const { data: d2, error: e2 } = await supabase
          .from('vehicles')
          .insert({ make, model, variant, year, price, slug: uniqueSlug, ...rest })
          .select()
          .single();
        if (e2) throw e2;
        return NextResponse.json(d2, { status: 201 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('POST /api/vehicles error:', err);
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}
