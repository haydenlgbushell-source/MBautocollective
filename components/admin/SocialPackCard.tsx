'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Vehicle } from '@/types/vehicle';
import { formatPrice, formatKm } from '@/lib/utils';

type Platform = 'instagram' | 'facebook' | 'marketplace' | 'tiktok' | 'linkedin' | 'threads';
type IGVariant = 'lifestyle' | 'spec' | 'story';

// ── Caption generators ─────────────────────────────────────────────────────

function igCaption(v: Vehicle, variant: IGVariant): string {
  const price = formatPrice(v.price);
  const km = v.kilometres ? formatKm(v.kilometres) : null;
  const title = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;

  if (variant === 'lifestyle') {
    return `This is what precision feels like.\n\n${title} — now available at MB Auto Collective.\n\n${km ? `${km} · ` : ''}${price} drive away.\n\nBook your private viewing today. Link in bio.`;
  }
  if (variant === 'spec') {
    const specs = [
      v.engine ? `Engine: ${v.engine}` : null,
      v.transmission ? `Trans: ${v.transmission}` : null,
      v.fuel_type ? `Fuel: ${v.fuel_type}` : null,
      km ? `Odometer: ${km}` : null,
    ]
      .filter(Boolean)
      .join('\n');
    return `${title}\n\n${specs}\n\n${price} drive away\n\nDM us or visit the link in bio.`;
  }
  return `NEW ARRIVAL ✨\n${title}\n${price}`;
}

function fbCaption(v: Vehicle): string {
  const price = formatPrice(v.price);
  const km = v.kilometres ? formatKm(v.kilometres) : null;
  const title = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;
  const body =
    v.short_description ||
    (v.description ? v.description.slice(0, 220) + (v.description.length > 220 ? '…' : '') : 'A stunning example in exceptional condition.');
  return `🚗 ${title} — Now Available!\n\n${body}\n\n${km ? `Odometer: ${km}\n` : ''}Price: ${price} drive away\n\nInterested? Send us a message or comment below!`;
}

function marketplaceListing(v: Vehicle): { title: string; desc: string } {
  const km = v.kilometres ? formatKm(v.kilometres) : null;
  const body =
    v.short_description ||
    (v.description ? v.description.slice(0, 320) + (v.description.length > 320 ? '…' : '') : 'Exceptional vehicle in outstanding condition.');
  return {
    title: `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`,
    desc: `${body}${km ? `\n\nOdometer: ${km}` : ''}\n\nContact MB Auto Collective for more info or to arrange a private viewing.`,
  };
}

function linkedinPost(v: Vehicle): string {
  const price = formatPrice(v.price);
  const title = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;
  const body =
    v.description
      ? v.description.slice(0, 440) + (v.description.length > 440 ? '…' : '')
      : 'A remarkable example of automotive engineering, presented in outstanding condition.';
  return `We're proud to present the ${title} — a vehicle that exemplifies what we do at MB Auto Collective.\n\nOffered at ${price} drive away, this represents exceptional value in today's market.\n\n${body}\n\nIf you're seeking something exceptional, we'd love to connect.`;
}

function threadsPost(v: Vehicle): string {
  const price = formatPrice(v.price);
  const km = v.kilometres ? formatKm(v.kilometres) : null;
  const title = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;
  const body = v.short_description || 'an exceptional example — rarely found in this condition.';
  return `just dropped: ${title}\n\n${km ? `${km} · ` : ''}${price} drive away\n\n${body}\n\nDM for details 🤙`;
}

function tiktokShots(v: Vehicle) {
  const price = formatPrice(v.price);
  const title = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;
  return [
    { ts: '0:00–0:03', shot: 'Cinematic exterior walk-around', caption: title },
    { ts: '0:03–0:07', shot: 'Close-up: headlights, grille, badge', caption: `${v.make} precision engineering` },
    { ts: '0:07–0:12', shot: 'Interior reveal — seats, dash', caption: 'Luxury inside and out' },
    { ts: '0:12–0:16', shot: 'Spec card / odometer', caption: v.kilometres ? `${formatKm(v.kilometres)} · ${price}` : price },
    { ts: '0:16–0:20', shot: 'CTA — link in bio', caption: 'DM us @MBAutoCollective' },
  ];
}

const IG_HASHTAGS =
  '#MBAutoCollective #LuxuryCars #PrestigeCars #GoldCoast #CarLife #ExoticCars #DreamCar #AutoCollective';

const TABS: { id: Platform; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'threads', label: 'Threads' },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function VehiclePhoto({
  src,
  alt,
  className,
  style,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!src) {
    return (
      <div
        className={`bg-bg-3 flex items-center justify-center text-text-3 text-[11px] tracking-widest uppercase ${className ?? ''}`}
        style={style}
      >
        No photo
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={style}>
      <Image src={src} alt={alt} fill className="object-cover" unoptimized />
    </div>
  );
}

// ── Instagram Tab ──────────────────────────────────────────────────────────

function InstagramTab({ v }: { v: Vehicle }) {
  const [variant, setVariant] = useState<IGVariant>('lifestyle');
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = v.photos ?? [];
  const caption = igCaption(v, variant);
  const title = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;

  return (
    <div className="flex flex-col gap-10">
      {/* Top: post card + controls */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Post mockup */}
        <div className="bg-white rounded-[12px] overflow-hidden w-full max-w-[380px] flex-shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative w-9 h-9 rounded-full flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <span className="font-bold text-[13px] text-gray-800 font-sans">MB</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-gray-900 font-sans leading-tight">mbautocollective</div>
              <div className="text-[11px] text-gray-500 font-sans">Gold Coast, QLD</div>
            </div>
            <div className="ml-auto text-gray-400">
              <span className="text-[20px] leading-none">···</span>
            </div>
          </div>

          {/* Square photo with carousel indicator */}
          <div className="relative w-full aspect-square bg-gray-100">
            <VehiclePhoto
              src={photos[photoIdx] ?? photos[0]}
              alt={title}
              className="w-full h-full"
            />
            {photos.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/60 text-white text-[11px] font-sans px-[7px] py-[3px] rounded-full">
                {photoIdx + 1}/{photos.length}
              </div>
            )}
            {photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-[5px]">
                {photos.slice(0, 6).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    className={`w-[6px] h-[6px] rounded-full transition-all ${
                      i === photoIdx ? 'bg-[#3897f0] scale-110' : 'bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 pt-3 pb-1 flex items-center gap-4">
            <span className="text-[24px]">🤍</span>
            <span className="text-[22px]">💬</span>
            <span className="text-[22px]">↗</span>
            <span className="ml-auto text-[22px]">🔖</span>
          </div>

          {/* Likes */}
          <div className="px-4 pb-1">
            <span className="text-[13px] font-semibold text-gray-900 font-sans">1,482 likes</span>
          </div>

          {/* Caption */}
          <div className="px-4 pb-3 text-[13px] text-gray-900 font-sans leading-[1.5]">
            <span className="font-semibold">mbautocollective </span>
            {caption.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
            <span className="text-[#3897f0]">{IG_HASHTAGS}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 min-w-0">
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-3">
            Caption Variant
          </div>
          <div className="flex flex-col gap-2 mb-7">
            {(['lifestyle', 'spec', 'story'] as IGVariant[]).map((vr) => (
              <label
                key={vr}
                className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-all ${
                  variant === vr
                    ? 'border-gold bg-gold-dim text-text'
                    : 'border-border text-text-2 hover:border-gold-lo'
                }`}
              >
                <input
                  type="radio"
                  name="ig-variant"
                  value={vr}
                  checked={variant === vr}
                  onChange={() => setVariant(vr)}
                  className="accent-[#b8963e]"
                />
                <span className="font-body text-[11px] tracking-[0.12em] uppercase">{vr}</span>
              </label>
            ))}
          </div>

          {photos.length > 0 && (
            <>
              <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-3">
                Photo Order
              </div>
              <div className="flex gap-2 flex-wrap">
                {photos.slice(0, 9).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    className={`relative w-[60px] h-[60px] border-2 flex-shrink-0 overflow-hidden transition-all ${
                      i === photoIdx ? 'border-gold' : 'border-border hover:border-gold-lo'
                    }`}
                  >
                    <Image src={p} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                    <div className="absolute top-[2px] left-[2px] bg-black/70 text-white text-[9px] w-4 h-4 flex items-center justify-center font-mono-custom rounded-full">
                      {i + 1}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Caption copy box */}
          <div className="mt-6">
            <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">
              Caption Text
            </div>
            <div className="bg-bg-2 border border-border p-4 text-[12px] text-text-2 leading-relaxed whitespace-pre-wrap font-body">
              {caption}
              {'\n\n'}
              {IG_HASHTAGS}
            </div>
          </div>
        </div>
      </div>

      {/* Story cards */}
      <div>
        <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-text-3 mb-4">
          Story Cards (9:16)
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[
            { label: 'Arrival', headline: 'NEW ARRIVAL', sub: `${v.year} ${v.make} ${v.model}` },
            { label: 'Feature', headline: formatPrice(v.price), sub: 'Drive Away' },
            { label: 'CTA', headline: 'Enquire Now', sub: 'Link in Bio ↗' },
          ].map(({ label, headline, sub }) => (
            <div
              key={label}
              className="relative flex-shrink-0 overflow-hidden rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
              style={{ width: 120, height: 213 }}
            >
              <VehiclePhoto src={photos[0]} alt={title} className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <div className="text-[9px] tracking-[0.2em] uppercase opacity-70 font-sans mb-1">{label}</div>
                <div className="text-[14px] font-bold font-sans leading-tight">{headline}</div>
                <div className="text-[10px] opacity-80 font-sans mt-[2px]">{sub}</div>
              </div>
              <div className="absolute top-3 left-3 right-3 flex gap-[3px]">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-[2px] flex-1 rounded-full bg-white/60" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reel storyboard */}
      <div>
        <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-text-3 mb-4">
          Reel Storyboard
        </div>
        <div className="bg-bg-2 border border-border overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                {['#', 'Timestamp', 'Shot', 'On-screen Text'].map((h) => (
                  <th
                    key={h}
                    className="text-left font-mono-custom text-[8px] tracking-[0.25em] uppercase text-text-3 px-4 py-3 border-b border-border font-[400]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tiktokShots(v).map((row, i) => (
                <tr key={i} className="hover:bg-bg-3 transition-colors">
                  <td className="px-4 py-3 border-b border-border text-gold font-mono-custom text-[11px]">{i + 1}</td>
                  <td className="px-4 py-3 border-b border-border text-text-2 font-mono-custom text-[10px] whitespace-nowrap">{row.ts}</td>
                  <td className="px-4 py-3 border-b border-border text-text">{row.shot}</td>
                  <td className="px-4 py-3 border-b border-border text-text-2 italic">{row.caption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Facebook Tab ───────────────────────────────────────────────────────────

function FacebookTab({ v }: { v: Vehicle }) {
  const caption = fbCaption(v);
  const photos = v.photos ?? [];
  const title = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Post mockup */}
      <div className="bg-white rounded-[12px] overflow-hidden w-full max-w-[420px] flex-shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-start gap-3 px-4 py-4">
          <div className="w-10 h-10 rounded-full bg-[#1877f2] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[13px] font-sans">MB</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-[#1c1e21] font-sans leading-tight">MB Auto Collective</div>
            <div className="flex items-center gap-1 mt-[2px]">
              <span className="text-[12px] text-[#65676b] font-sans">Just now · </span>
              <span className="text-[12px] text-[#65676b]">🌐</span>
            </div>
          </div>
          <div className="text-[#65676b] text-[20px]">···</div>
        </div>

        {/* Post text */}
        <div className="px-4 pb-3 text-[14px] text-[#1c1e21] font-sans leading-[1.6] whitespace-pre-wrap">
          {caption}
        </div>

        {/* 16:9 photo */}
        <div className="relative w-full bg-gray-100" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0">
            <VehiclePhoto src={photos[0]} alt={title} className="w-full h-full" />
          </div>
        </div>

        {/* Reaction counts */}
        <div className="px-4 py-2 flex justify-between items-center border-b border-[#e4e6ea]">
          <div className="flex items-center gap-1">
            <span className="text-[14px]">👍❤️😮</span>
            <span className="text-[13px] text-[#65676b] font-sans">247</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[13px] text-[#65676b] font-sans hover:underline cursor-pointer">38 comments</span>
            <span className="text-[13px] text-[#65676b] font-sans hover:underline cursor-pointer">12 shares</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="px-4 py-1 flex items-center">
          {[{ icon: '👍', label: 'Like' }, { icon: '💬', label: 'Comment' }, { icon: '↗', label: 'Share' }].map(
            ({ icon, label }) => (
              <button
                key={label}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-[13px] text-[#65676b] font-sans font-semibold hover:bg-[#f2f2f2] rounded-[4px] transition-colors"
              >
                <span>{icon}</span>
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Caption copy */}
      <div className="flex-1 min-w-0">
        <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Post Text</div>
        <div className="bg-bg-2 border border-border p-4 text-[12px] text-text-2 leading-relaxed whitespace-pre-wrap font-body">
          {caption}
          {'\n\n#MBAutoCollective #LuxuryCars #GoldCoast'}
        </div>
      </div>
    </div>
  );
}

// ── Marketplace Tab ────────────────────────────────────────────────────────

function MarketplaceTab({ v }: { v: Vehicle }) {
  const { title, desc } = marketplaceListing(v);
  const photos = v.photos ?? [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Listing card mockup */}
      <div className="bg-white rounded-[8px] overflow-hidden w-full max-w-[360px] flex-shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
        {/* 4:3 photo */}
        <div className="relative w-full bg-gray-100" style={{ paddingBottom: '75%' }}>
          <div className="absolute inset-0">
            <VehiclePhoto src={photos[0]} alt={title} className="w-full h-full" />
          </div>
        </div>

        <div className="p-4">
          <div className="text-[22px] font-bold text-[#1c1e21] font-sans leading-tight mb-1">
            {formatPrice(v.price)}
          </div>
          <div className="text-[15px] font-semibold text-[#1c1e21] font-sans mb-1">{title}</div>
          <div className="flex items-center gap-1 text-[13px] text-[#65676b] font-sans mb-3">
            <span>📍</span>
            <span>Gold Coast QLD</span>
          </div>
          <p className="text-[13px] text-[#1c1e21] font-sans leading-[1.55] mb-4 line-clamp-4">
            {desc}
          </p>
          <button className="w-full bg-[#1877f2] text-white font-sans font-semibold text-[14px] py-2 rounded-[6px] hover:bg-[#166fe5] transition-colors">
            Message
          </button>
        </div>
      </div>

      {/* Listing copy */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Title</div>
          <div className="bg-bg-2 border border-border p-4 text-[13px] text-text font-body">{title}</div>
        </div>
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Price</div>
          <div className="bg-bg-2 border border-border p-4 text-[13px] text-gold font-mono-custom">
            {formatPrice(v.price)}
          </div>
        </div>
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Description</div>
          <div className="bg-bg-2 border border-border p-4 text-[12px] text-text-2 leading-relaxed whitespace-pre-wrap font-body">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TikTok Tab ─────────────────────────────────────────────────────────────

function TikTokTab({ v }: { v: Vehicle }) {
  const photos = v.photos ?? [];
  const title = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;
  const shots = tiktokShots(v);
  const price = formatPrice(v.price);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Phone mockup */}
      <div className="flex-shrink-0">
        <div
          className="relative bg-black rounded-[32px] overflow-hidden shadow-[0_12px_60px_rgba(0,0,0,0.7)] border-[3px] border-[#2a2a2a]"
          style={{ width: 200, height: 355 }}
        >
          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4 z-10">
            <span className="text-white text-[10px] font-sans font-semibold">9:41</span>
            <div className="w-16 h-4 bg-black rounded-full" />
            <div className="flex gap-1">
              <span className="text-white text-[10px]">●●●</span>
            </div>
          </div>

          {/* Video bg */}
          <VehiclePhoto src={photos[0]} alt={title} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* TikTok UI — right sidebar */}
          <div className="absolute right-2 bottom-24 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-[16px]">❤️</span>
              </div>
              <span className="text-white text-[9px] font-sans">2.4K</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-[16px]">💬</span>
              </div>
              <span className="text-white text-[9px] font-sans">183</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-[16px]">↗</span>
              </div>
              <span className="text-white text-[9px] font-sans">Share</span>
            </div>
          </div>

          {/* Bottom text */}
          <div className="absolute left-2 bottom-8 right-12 text-white">
            <div className="text-[11px] font-semibold font-sans mb-[3px]">@mbautocollective</div>
            <div className="text-[10px] font-sans leading-tight mb-1">{title}</div>
            <div className="text-[9px] text-[#00f2ea] font-sans">#MBAutoCollective #LuxuryCars #GoldCoast</div>
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 left-0 right-0 h-7 bg-black/80 flex items-center justify-around">
            {['🏠', '🔍', '+', '📥', '👤'].map((icon, i) => (
              <span key={i} className="text-white text-[12px]">
                {icon}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Storyboard */}
      <div className="flex-1 min-w-0">
        <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-text-3 mb-4">
          Shot Storyboard
        </div>
        <div className="bg-bg-2 border border-border overflow-x-auto mb-6">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                {['#', 'Time', 'Shot Description', 'Caption / Text'].map((h) => (
                  <th
                    key={h}
                    className="text-left font-mono-custom text-[8px] tracking-[0.25em] uppercase text-text-3 px-4 py-3 border-b border-border font-[400]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shots.map((row, i) => (
                <tr key={i} className="hover:bg-bg-3 transition-colors">
                  <td className="px-4 py-3 border-b border-border text-gold font-mono-custom text-[11px]">{i + 1}</td>
                  <td className="px-4 py-3 border-b border-border text-text-2 font-mono-custom text-[10px] whitespace-nowrap">{row.ts}</td>
                  <td className="px-4 py-3 border-b border-border text-text">{row.shot}</td>
                  <td className="px-4 py-3 border-b border-border text-text-2 italic">{row.caption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Caption / Bio Text</div>
          <div className="bg-bg-2 border border-border p-4 text-[12px] text-text-2 leading-relaxed whitespace-pre-wrap font-body">
            {`${title} 🔥\n\n${v.kilometres ? formatKm(v.kilometres) + ' · ' : ''}${price} drive away\n\nDM or visit link in bio 👇\n\n#MBAutoCollective #LuxuryCars #PrestigeCars #GoldCoast #${v.make.replace(/\s/g, '')}`}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LinkedIn Tab ───────────────────────────────────────────────────────────

function LinkedInTab({ v }: { v: Vehicle }) {
  const [expanded, setExpanded] = useState(false);
  const post = linkedinPost(v);
  const preview = post.slice(0, 280);
  const showToggle = post.length > 280;
  const photos = v.photos ?? [];
  const title = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Post mockup */}
      <div className="bg-white rounded-[8px] overflow-hidden w-full max-w-[440px] flex-shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          <div className="w-12 h-12 rounded-[4px] bg-[#0077b5] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[15px] font-sans">MB</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-[#1c1e21] font-sans leading-tight">
              MB Auto Collective
            </div>
            <div className="text-[12px] text-[#666] font-sans">Prestige Automotive · Gold Coast, QLD</div>
            <div className="text-[11px] text-[#999] font-sans">1h · 🌐</div>
          </div>
          <button className="border border-[#0077b5] text-[#0077b5] text-[13px] font-semibold font-sans px-4 py-1 rounded-full hover:bg-[#e8f3fb] transition-colors">
            Follow
          </button>
        </div>

        {/* Post text */}
        <div className="px-4 pb-3 text-[14px] text-[#1c1e21] font-sans leading-[1.6]">
          <span className="whitespace-pre-wrap">{expanded || !showToggle ? post : preview + '…'}</span>
          {showToggle && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#666] font-semibold hover:underline ml-1"
            >
              {expanded ? 'see less' : 'see more'}
            </button>
          )}
        </div>

        {/* 16:9 photo */}
        <div className="relative w-full bg-gray-100" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0">
            <VehiclePhoto src={photos[0]} alt={title} className="w-full h-full" />
          </div>
        </div>

        {/* Reactions */}
        <div className="px-4 py-2 flex justify-between items-center border-b border-[#e4e6ea]">
          <div className="flex items-center gap-1">
            <span className="text-[14px]">👍❤️💡</span>
            <span className="text-[13px] text-[#666] font-sans">312</span>
          </div>
          <span className="text-[13px] text-[#666] font-sans hover:underline cursor-pointer">48 comments</span>
        </div>

        {/* Action bar */}
        <div className="px-4 py-1 flex items-center">
          {[
            { icon: '👍', label: 'Like' },
            { icon: '💬', label: 'Comment' },
            { icon: '🔁', label: 'Repost' },
            { icon: '↗', label: 'Send' },
          ].map(({ icon, label }) => (
            <button
              key={label}
              className="flex-1 flex items-center justify-center gap-1 py-2 text-[12px] text-[#666] font-sans font-semibold hover:bg-[#f2f2f2] rounded-[4px] transition-colors"
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Post copy */}
      <div className="flex-1 min-w-0">
        <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Post Text</div>
        <div className="bg-bg-2 border border-border p-4 text-[12px] text-text-2 leading-relaxed whitespace-pre-wrap font-body">
          {post}
          {'\n\n#MBAutoCollective #LuxuryAutomotive #PrestigeCars #GoldCoast'}
        </div>
      </div>
    </div>
  );
}

// ── Threads Tab ────────────────────────────────────────────────────────────

function ThreadsTab({ v }: { v: Vehicle }) {
  const post = threadsPost(v);
  const photos = v.photos ?? [];
  const title = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Post mockup */}
      <div className="w-full max-w-[420px] flex-shrink-0">
        <div className="bg-[#101010] rounded-[16px] border border-[#2a2a2a] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.7)]">
          <div className="p-4">
            {/* Thread header */}
            <div className="flex gap-3">
              {/* Left column: avatar + thread line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b8963e] to-[#7a6428] flex items-center justify-center">
                  <span className="text-white font-bold text-[12px] font-sans">MB</span>
                </div>
                <div className="w-[2px] flex-1 bg-[#2a2a2a] mt-2 min-h-[40px]" />
              </div>

              {/* Right: username + post */}
              <div className="flex-1 min-w-0 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-[14px] font-sans">mbautocollective</span>
                  <span className="text-[#666] text-[13px] font-sans">· 1h</span>
                  <span className="ml-auto text-[#666] text-[18px]">···</span>
                </div>
                <div className="text-[#e0e0e0] text-[14px] font-sans leading-[1.6] whitespace-pre-wrap mb-3">
                  {post}
                </div>

                {/* Photo embed */}
                {photos[0] && (
                  <div className="relative rounded-[8px] overflow-hidden mb-3" style={{ height: 200 }}>
                    <VehiclePhoto src={photos[0]} alt={title} className="w-full h-full" />
                  </div>
                )}

                <div className="text-[13px] text-[#666] font-sans">Reply to @mbautocollective</div>
              </div>
            </div>

            {/* Replies row */}
            <div className="flex items-center gap-4 pl-12 pt-1">
              <div className="flex items-center gap-1 text-[#666]">
                <span className="text-[16px]">❤️</span>
                <span className="text-[12px] font-sans">182</span>
              </div>
              <div className="flex items-center gap-1 text-[#666]">
                <span className="text-[16px]">💬</span>
                <span className="text-[12px] font-sans">24 replies</span>
              </div>
              <div className="flex items-center gap-1 text-[#666]">
                <span className="text-[16px]">🔁</span>
                <span className="text-[12px] font-sans">Repost</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post copy */}
      <div className="flex-1 min-w-0">
        <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Post Text</div>
        <div className="bg-bg-2 border border-border p-4 text-[12px] text-text-2 leading-relaxed whitespace-pre-wrap font-body">
          {post}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function SocialPackCard({ vehicle }: { vehicle: Vehicle }) {
  const [tab, setTab] = useState<Platform>('instagram');

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border mb-8 overflow-x-auto">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-5 py-3 font-body text-[10px] tracking-[0.18em] uppercase whitespace-nowrap border-b-2 transition-all -mb-[1px] ${
              tab === id
                ? 'border-b-gold text-gold'
                : 'border-b-transparent text-text-3 hover:text-text-2'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'instagram' && <InstagramTab v={vehicle} />}
      {tab === 'facebook' && <FacebookTab v={vehicle} />}
      {tab === 'marketplace' && <MarketplaceTab v={vehicle} />}
      {tab === 'tiktok' && <TikTokTab v={vehicle} />}
      {tab === 'linkedin' && <LinkedInTab v={vehicle} />}
      {tab === 'threads' && <ThreadsTab v={vehicle} />}
    </div>
  );
}
