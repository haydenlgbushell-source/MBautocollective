import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

// ── Supabase admin client (no cookies needed for service role) ─────────────

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ── Anthropic helpers ──────────────────────────────────────────────────────

const ANTHROPIC_BASE = 'https://api.anthropic.com/v1/messages';

function anthropicHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY!,
    'anthropic-version': '2023-06-01',
  };
}

interface PhotoTag {
  url: string;
  idx: number;
  primary_tag: string;
  quality_score: number;
  social_safe: boolean;
}

async function tagPhoto(url: string, idx: number): Promise<PhotoTag> {
  const tagPrompt =
    'Classify this vehicle photo. Respond with JSON only, no preamble:\n' +
    '{"primary_tag":"<one of: exterior_front_3q, exterior_rear_3q, exterior_side, interior_wide, interior_dash, interior_seats, wheel_detail, engine_bay, boot, badge_close, odometer, vin_plate, damage_close, paperwork, other>","quality_score":<1-10>,"social_safe":<true|false>}\n\n' +
    'social_safe is false for: damage close-ups, odometer, VIN plate, paperwork, anything with personal info or licence plates clearly visible.';

  try {
    const res = await fetch(ANTHROPIC_BASE, {
      method: 'POST',
      headers: anthropicHeaders(),
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'url', url } },
              { type: 'text', text: tagPrompt },
            ],
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`Haiku ${res.status}`);
    const data = await res.json();
    const text: string = data.content
      ?.filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('') ?? '';
    const parsed = JSON.parse(text.replace(/```json\s*|\s*```/g, '').trim());
    return {
      url,
      idx,
      primary_tag: parsed.primary_tag ?? 'other',
      quality_score: parsed.quality_score ?? 5,
      social_safe: parsed.social_safe !== false,
    };
  } catch {
    return { url, idx, primary_tag: 'other', quality_score: 5, social_safe: true };
  }
}

function buildSystemPrompt(brandVoice: string): string {
  return `${brandVoice}

---

# Your task

You are the social content generator for MB Auto Collective. You will receive a JSON payload with one vehicle's data and an array of social-safe photos (each with a vision tag).

Produce a complete multi-platform social pack as a single JSON object. No preamble, no markdown fences, no commentary — just the JSON.

# Required output schema

{
  "vehicle_summary": "string — one short line for the admin UI",
  "instagram_feed": {
    "captions": {
      "lifestyle": "string — 2-4 short lines, lifestyle hook",
      "spec_led": "string — 2-4 short lines, spec hook",
      "story_led": "string — 2-4 short lines, story/provenance hook"
    },
    "hashtags": ["6-10 hashtags, must include #mbautocollective"],
    "photo_order": ["url1", "url2", "..."],
    "photo_gaps": ["string"]
  },
  "instagram_stories": [
    { "photo_url": "string", "text": "string" },
    { "photo_url": "string", "text": "string" },
    { "photo_url": "string", "text": "string" }
  ],
  "instagram_reel": {
    "script": [{ "timestamp": "0-1.5s", "shot": "string", "caption": "string" }],
    "audio_guidance": "string",
    "requires_video": true
  },
  "facebook_feed": { "body": "string", "hashtags": ["0-2"] },
  "facebook_marketplace": { "title": "string", "body": "string" },
  "tiktok": {
    "script": [{ "timestamp": "0-1.5s", "shot": "string", "caption": "string" }],
    "hashtags": ["3-5"]
  },
  "linkedin": { "body": "string", "hashtags": ["2-3"] },
  "threads": { "body": "string", "hashtags": ["1-2"] },
  "quality_warnings": ["string"],
  "regeneration_notes": "string"
}

# Hard rules

- Never invent features. Only reference what is in the input vehicle data.
- All photos in photo_order must be URLs from the input photos array.
- Photo order: hero (exterior_front_3q preferred) first, then variety.
- Australian English. No exclamation marks anywhere.
- Lead with the strongest distinctive fact.
- All banned phrases from the brand voice document are forbidden.
- If data is missing, do not fabricate it — note in quality_warnings.
- If fewer than 6 social-safe photos, set requires_video=true and add "insufficient_photos" to quality_warnings.

Respond with the JSON object and nothing else.`;
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  let vehicle_id: string;
  try {
    const body = await request.json();
    vehicle_id = body.vehicle_id;
    if (!vehicle_id || typeof vehicle_id !== 'string') {
      return NextResponse.json({ error: 'vehicle_id required' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const supabase = db();

  // Fetch vehicle
  const { data: vehicle, error: vErr } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicle_id)
    .single();

  if (vErr || !vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  // Fetch brand voice
  const { data: voiceRow } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'brand_voice_doc')
    .single();
  const brandVoice: string = voiceRow?.value ?? '';

  // Mark pack as pending (creates row if not exists, resets if regenerating)
  await supabase.from('social_packs').upsert(
    { vehicle_id, status: 'pending', generation_error: null },
    { onConflict: 'vehicle_id' }
  );

  // Tag photos in parallel
  const photos: string[] = vehicle.photos ?? [];
  const photoTags = await Promise.all(photos.map((url: string, idx: number) => tagPhoto(url, idx)));
  const safePhotos = photoTags.filter((p) => p.social_safe);

  // Build generation payload
  const userPayload = {
    vehicle: {
      id: vehicle.id,
      slug: vehicle.slug,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      variant: vehicle.variant ?? null,
      price_aud: vehicle.price,
      kilometres: vehicle.kilometres,
      colour: vehicle.colour,
      transmission: vehicle.transmission,
      body_type: vehicle.body_type,
      fuel_type: vehicle.fuel_type,
      engine: vehicle.engine,
      seats: vehicle.seats,
      features: vehicle.features ?? [],
      description: vehicle.description,
      short_description: vehicle.short_description,
      permalink: `https://m-bautocollective.vercel.app/stock/${vehicle.slug}`,
    },
    photos: safePhotos,
    photo_count: safePhotos.length,
  };

  // Generate with Claude Sonnet
  let rawText: string;
  try {
    const genRes = await fetch(ANTHROPIC_BASE, {
      method: 'POST',
      headers: anthropicHeaders(),
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        temperature: 0.7,
        system: buildSystemPrompt(brandVoice),
        messages: [{ role: 'user', content: JSON.stringify(userPayload) }],
      }),
    });

    if (!genRes.ok) {
      const err = await genRes.text();
      throw new Error(`Anthropic ${genRes.status}: ${err.slice(0, 200)}`);
    }

    const genData = await genRes.json();
    rawText = genData.content
      ?.filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('') ?? '';
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabase.from('social_packs').upsert(
      { vehicle_id, status: 'failed', generation_error: msg },
      { onConflict: 'vehicle_id' }
    );
    return NextResponse.json({ error: 'Generation failed', detail: msg }, { status: 500 });
  }

  // Parse JSON output
  let pack: Record<string, unknown>;
  try {
    const cleaned = rawText.replace(/```json\s*|\s*```/g, '').trim();
    pack = JSON.parse(cleaned);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabase.from('social_packs').upsert(
      {
        vehicle_id,
        status: 'failed',
        generation_error: `JSON parse failed: ${msg}. Raw: ${rawText.slice(0, 300)}`,
      },
      { onConflict: 'vehicle_id' }
    );
    return NextResponse.json({ error: 'Parse failed', detail: msg }, { status: 500 });
  }

  // Persist to DB
  type JsonObj = Record<string, unknown>;
  const ig = (pack.instagram_feed ?? {}) as JsonObj;
  const igCaps = (ig.captions ?? {}) as JsonObj;
  const fb = (pack.facebook_feed ?? {}) as JsonObj;
  const mp = (pack.facebook_marketplace ?? {}) as JsonObj;
  const tt = (pack.tiktok ?? {}) as JsonObj;
  const li = (pack.linkedin ?? {}) as JsonObj;
  const th = (pack.threads ?? {}) as JsonObj;
  const reel = (pack.instagram_reel ?? {}) as JsonObj;

  const { error: upErr } = await supabase.from('social_packs').upsert(
    {
      vehicle_id,
      status: 'pending',
      generation_error: null,
      vehicle_summary: pack.vehicle_summary as string,
      ig_caption_lifestyle: igCaps.lifestyle as string,
      ig_caption_spec: igCaps.spec_led as string,
      ig_caption_story: igCaps.story_led as string,
      ig_caption_selected: null,
      ig_hashtags: (ig.hashtags as string[]) ?? [],
      ig_photo_order: (ig.photo_order as string[]) ?? [],
      ig_stories: (pack.instagram_stories as unknown[]) ?? [],
      ig_reel: reel,
      fb_body: fb.body as string,
      fb_hashtags: (fb.hashtags as string[]) ?? [],
      marketplace_title: mp.title as string,
      marketplace_body: mp.body as string,
      tiktok_script: (tt.script as unknown[]) ?? [],
      tiktok_hashtags: (tt.hashtags as string[]) ?? [],
      linkedin_body: li.body as string,
      linkedin_hashtags: (li.hashtags as string[]) ?? [],
      threads_body: th.body as string,
      threads_hashtags: (th.hashtags as string[]) ?? [],
      quality_warnings: (pack.quality_warnings as string[]) ?? [],
      regeneration_notes: pack.regeneration_notes as string,
      generated_at: new Date().toISOString(),
      approved_at: null,
      published_at: null,
    },
    { onConflict: 'vehicle_id' }
  );

  if (upErr) {
    return NextResponse.json({ error: 'DB upsert failed', detail: upErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    vehicle_id,
    vehicle_summary: pack.vehicle_summary,
    photos_tagged: photoTags.length,
    photos_social_safe: safePhotos.length,
    quality_warnings: pack.quality_warnings ?? [],
  });
}
