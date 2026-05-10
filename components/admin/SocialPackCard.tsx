'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import type { Vehicle } from '@/types/vehicle';
import type { SocialPack, IGVariant, IGStory, TikTokShot, ReelShot } from '@/types/social';
import { formatPrice } from '@/lib/utils';

type Platform = 'instagram' | 'facebook' | 'marketplace' | 'tiktok' | 'linkedin' | 'threads';

const TABS: { id: Platform; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'threads', label: 'Threads' },
];

// ── Editable field state mirroring SocialPack ──────────────────────────────

interface EditState {
  ig_caption_lifestyle: string;
  ig_caption_spec: string;
  ig_caption_story: string;
  ig_hashtags: string;
  ig_photo_order: string[];
  ig_stories: IGStory[];
  fb_body: string;
  fb_hashtags: string;
  marketplace_title: string;
  marketplace_body: string;
  tiktok_script: TikTokShot[];
  tiktok_hashtags: string;
  linkedin_body: string;
  linkedin_hashtags: string;
  threads_body: string;
  threads_hashtags: string;
}

function packToEditState(pack: SocialPack): EditState {
  return {
    ig_caption_lifestyle: pack.ig_caption_lifestyle ?? '',
    ig_caption_spec: pack.ig_caption_spec ?? '',
    ig_caption_story: pack.ig_caption_story ?? '',
    ig_hashtags: (pack.ig_hashtags ?? []).join(' '),
    ig_photo_order: pack.ig_photo_order ?? [],
    ig_stories: pack.ig_stories ?? [],
    fb_body: pack.fb_body ?? '',
    fb_hashtags: (pack.fb_hashtags ?? []).join(' '),
    marketplace_title: pack.marketplace_title ?? '',
    marketplace_body: pack.marketplace_body ?? '',
    tiktok_script: pack.tiktok_script ?? [],
    tiktok_hashtags: (pack.tiktok_hashtags ?? []).join(' '),
    linkedin_body: pack.linkedin_body ?? '',
    linkedin_hashtags: (pack.linkedin_hashtags ?? []).join(' '),
    threads_body: pack.threads_body ?? '',
    threads_hashtags: (pack.threads_hashtags ?? []).join(' '),
  };
}

// ── Shared helpers ─────────────────────────────────────────────────────────

function VehiclePhoto({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`bg-bg-3 flex items-center justify-center text-text-3 text-[11px] tracking-widest uppercase ${className ?? ''}`}
      >
        No photo
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <Image src={src} alt={alt} fill className="object-cover" unoptimized />
    </div>
  );
}

function EditableText({
  value,
  onChange,
  isEditing,
  rows = 4,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  isEditing: boolean;
  rows?: number;
  className?: string;
}) {
  const base = `bg-bg-2 border border-border p-4 text-[12px] text-text-2 leading-relaxed whitespace-pre-wrap font-body w-full ${className ?? ''}`;
  if (!isEditing) return <div className={base}>{value}</div>;
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className={`${base} resize-y focus:outline-none focus:border-gold-lo transition-colors`}
    />
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function NoPack({ vehicleId, isPending, onRegenerate }: {
  vehicleId: string;
  isPending: boolean;
  onRegenerate: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-text-3">
        No pack generated yet
      </div>
      <p className="text-[12px] text-text-3 text-center max-w-xs">
        Generate a social pack to see AI-written captions, story cards, and platform content for this vehicle.
      </p>
      <button
        onClick={() => onRegenerate(vehicleId)}
        disabled={isPending}
        className="bg-gold text-bg font-body text-[10px] tracking-[0.2em] uppercase px-6 py-3 font-[500] hover:bg-gold-hi transition-colors disabled:opacity-50"
      >
        {isPending ? 'Generating…' : 'Generate Pack'}
      </button>
    </div>
  );
}

// ── Photo reorder strip ────────────────────────────────────────────────────

function PhotoStrip({
  photos,
  activeIdx,
  isEditing,
  onSelect,
  onReorder,
}: {
  photos: string[];
  activeIdx: number;
  isEditing: boolean;
  onSelect: (i: number) => void;
  onReorder: (photos: string[]) => void;
}) {
  if (photos.length === 0) return null;

  function move(from: number, to: number) {
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {photos.slice(0, 9).map((p, i) => (
        <div key={`${p}-${i}`} className="relative flex flex-col items-center gap-1">
          <button
            onClick={() => onSelect(i)}
            className={`relative w-[60px] h-[60px] border-2 flex-shrink-0 overflow-hidden transition-all ${
              i === activeIdx ? 'border-gold' : 'border-border hover:border-gold-lo'
            }`}
          >
            <Image src={p} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
            <div className="absolute top-[2px] left-[2px] bg-black/70 text-white text-[9px] w-4 h-4 flex items-center justify-center font-mono-custom rounded-full">
              {i + 1}
            </div>
          </button>
          {isEditing && (
            <div className="flex gap-[2px]">
              <button
                disabled={i === 0}
                onClick={() => move(i, i - 1)}
                className="text-[9px] text-text-3 hover:text-gold disabled:opacity-20 px-[3px] transition-colors"
                title="Move left"
              >
                ←
              </button>
              <button
                disabled={i === photos.length - 1}
                onClick={() => move(i, i + 1)}
                className="text-[9px] text-text-3 hover:text-gold disabled:opacity-20 px-[3px] transition-colors"
                title="Move right"
              >
                →
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Instagram Tab ──────────────────────────────────────────────────────────

function InstagramTab({
  vehicle,
  pack,
  variant,
  onVariantChange,
  isEditing,
  edits,
  onEdits,
}: {
  vehicle: Vehicle;
  pack: SocialPack;
  variant: IGVariant;
  onVariantChange: (v: IGVariant) => void;
  isEditing: boolean;
  edits: EditState;
  onEdits: (patch: Partial<EditState>) => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);

  const photos = edits.ig_photo_order.length > 0 ? edits.ig_photo_order : (vehicle.photos ?? []);
  const captionMap: Record<IGVariant, string> = {
    lifestyle: edits.ig_caption_lifestyle,
    spec: edits.ig_caption_spec,
    story: edits.ig_caption_story,
  };
  const caption = captionMap[variant];
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;
  const stories: IGStory[] = isEditing ? edits.ig_stories : (pack.ig_stories ?? []);
  const reelScript: ReelShot[] = pack.ig_reel?.script ?? [];

  const captionFieldMap: Record<IGVariant, keyof EditState> = {
    lifestyle: 'ig_caption_lifestyle',
    spec: 'ig_caption_spec',
    story: 'ig_caption_story',
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Top: post card + controls */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Post mockup */}
        <div className="bg-white rounded-[12px] overflow-hidden w-full max-w-[380px] flex-shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
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
              <div className="text-[11px] text-gray-500 font-sans">Waterloo, Sydney</div>
            </div>
            <div className="ml-auto text-gray-400">
              <span className="text-[20px] leading-none">···</span>
            </div>
          </div>

          <div className="relative w-full aspect-square bg-gray-100">
            <VehiclePhoto src={photos[photoIdx] ?? photos[0]} alt={title} className="w-full h-full" />
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

          <div className="px-4 pt-3 pb-1 flex items-center gap-4">
            <span className="text-[24px]">🤍</span>
            <span className="text-[22px]">💬</span>
            <span className="text-[22px]">↗</span>
            <span className="ml-auto text-[22px]">🔖</span>
          </div>

          <div className="px-4 pb-4 pt-1 text-[13px] text-gray-900 font-sans leading-[1.5]">
            <span className="font-semibold">mbautocollective </span>
            {caption.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
            {edits.ig_hashtags && (
              <span className="text-[#3897f0]">{edits.ig_hashtags}</span>
            )}
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
                  onChange={() => onVariantChange(vr)}
                  className="accent-[#b8963e]"
                />
                <span className="font-body text-[11px] tracking-[0.12em] uppercase">{vr}</span>
              </label>
            ))}
          </div>

          {photos.length > 0 && (
            <>
              <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-3">
                Photo Order {isEditing && <span className="text-gold ml-1">· drag ← → to reorder</span>}
              </div>
              <PhotoStrip
                photos={photos}
                activeIdx={photoIdx}
                isEditing={isEditing}
                onSelect={setPhotoIdx}
                onReorder={(p) => onEdits({ ig_photo_order: p })}
              />
            </>
          )}

          <div className="mt-6">
            <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">
              Caption Text
            </div>
            <EditableText
              value={caption}
              onChange={(v) => onEdits({ [captionFieldMap[variant]]: v } as Partial<EditState>)}
              isEditing={isEditing}
              rows={5}
            />
          </div>

          <div className="mt-4">
            <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">
              Hashtags
            </div>
            <EditableText
              value={edits.ig_hashtags}
              onChange={(v) => onEdits({ ig_hashtags: v })}
              isEditing={isEditing}
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Story cards */}
      {stories.length > 0 && (
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-text-3 mb-4">
            Story Cards (9:16)
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {stories.map((story, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div
                  className="relative flex-shrink-0 overflow-hidden rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
                  style={{ width: 120, height: 213 }}
                >
                  <VehiclePhoto src={story.photo_url} alt={`Story ${idx + 1}`} className="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <div className="text-[10px] font-sans leading-snug">{story.text}</div>
                  </div>
                  <div className="absolute top-3 left-3 right-3 flex gap-[3px]">
                    {stories.map((_, i) => (
                      <div key={i} className={`h-[2px] flex-1 rounded-full ${i <= idx ? 'bg-white' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </div>
                {isEditing && (
                  <textarea
                    value={story.text}
                    onChange={(e) => {
                      const next = edits.ig_stories.map((s, i) =>
                        i === idx ? { ...s, text: e.target.value } : s
                      );
                      onEdits({ ig_stories: next });
                    }}
                    rows={3}
                    className="w-[120px] bg-bg-2 border border-border p-2 text-[10px] text-text-2 leading-relaxed font-body resize-none focus:outline-none focus:border-gold-lo transition-colors"
                    placeholder="Story text…"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reel storyboard */}
      {reelScript.length > 0 && (
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
                {reelScript.map((row, i) => (
                  <tr key={i} className="hover:bg-bg-3 transition-colors">
                    <td className="px-4 py-3 border-b border-border text-gold font-mono-custom text-[11px]">{i + 1}</td>
                    <td className="px-4 py-3 border-b border-border text-text-2 font-mono-custom text-[10px] whitespace-nowrap">{row.timestamp}</td>
                    <td className="px-4 py-3 border-b border-border text-text">{row.shot}</td>
                    <td className="px-4 py-3 border-b border-border text-text-2 italic">{row.caption}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pack.ig_reel?.audio_guidance && (
            <div className="mt-3 px-4 py-3 border border-border bg-bg-2 text-[11px] text-text-3 leading-relaxed">
              <span className="font-mono-custom text-[8px] tracking-[0.2em] uppercase text-text-3 mr-2">Audio:</span>
              {pack.ig_reel.audio_guidance}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Facebook Tab ───────────────────────────────────────────────────────────

function FacebookTab({
  vehicle,
  pack,
  isEditing,
  edits,
  onEdits,
}: {
  vehicle: Vehicle;
  pack: SocialPack;
  isEditing: boolean;
  edits: EditState;
  onEdits: (patch: Partial<EditState>) => void;
}) {
  const photos = edits.ig_photo_order.length > 0 ? edits.ig_photo_order : (pack.ig_photo_order ?? vehicle.photos ?? []);
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="bg-white rounded-[12px] overflow-hidden w-full max-w-[420px] flex-shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
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

        <div className="px-4 pb-3 text-[13px] text-[#1c1e21] font-sans leading-[1.6] whitespace-pre-wrap">
          {edits.fb_body}
        </div>

        <div className="relative w-full bg-gray-100" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0">
            <VehiclePhoto src={photos[0]} alt={title} className="w-full h-full" />
          </div>
        </div>

        <div className="px-4 py-2 flex justify-between items-center border-b border-[#e4e6ea]">
          <div className="flex items-center gap-1">
            <span className="text-[14px]">👍❤️😮</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[13px] text-[#65676b] font-sans cursor-pointer">Comments</span>
            <span className="text-[13px] text-[#65676b] font-sans cursor-pointer">Shares</span>
          </div>
        </div>

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

      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Post Text</div>
          <EditableText
            value={edits.fb_body}
            onChange={(v) => onEdits({ fb_body: v })}
            isEditing={isEditing}
            rows={6}
          />
        </div>
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Hashtags</div>
          <EditableText
            value={edits.fb_hashtags}
            onChange={(v) => onEdits({ fb_hashtags: v })}
            isEditing={isEditing}
            rows={1}
          />
        </div>
      </div>
    </div>
  );
}

// ── Marketplace Tab ────────────────────────────────────────────────────────

function MarketplaceTab({
  vehicle,
  pack,
  isEditing,
  edits,
  onEdits,
}: {
  vehicle: Vehicle;
  pack: SocialPack;
  isEditing: boolean;
  edits: EditState;
  onEdits: (patch: Partial<EditState>) => void;
}) {
  const photos = edits.ig_photo_order.length > 0 ? edits.ig_photo_order : (pack.ig_photo_order ?? vehicle.photos ?? []);
  const title = edits.marketplace_title || `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="bg-white rounded-[8px] overflow-hidden w-full max-w-[360px] flex-shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
        <div className="relative w-full bg-gray-100" style={{ paddingBottom: '75%' }}>
          <div className="absolute inset-0">
            <VehiclePhoto src={photos[0]} alt={title} className="w-full h-full" />
          </div>
        </div>

        <div className="p-4">
          <div className="text-[22px] font-bold text-[#1c1e21] font-sans leading-tight mb-1">
            {formatPrice(vehicle.price)}
          </div>
          <div className="text-[15px] font-semibold text-[#1c1e21] font-sans mb-1">{title}</div>
          <div className="flex items-center gap-1 text-[13px] text-[#65676b] font-sans mb-3">
            <span>📍</span>
            <span>Waterloo NSW</span>
          </div>
          <p className="text-[13px] text-[#1c1e21] font-sans leading-[1.55] mb-4 line-clamp-4">
            {edits.marketplace_body}
          </p>
          <button className="w-full bg-[#1877f2] text-white font-sans font-semibold text-[14px] py-2 rounded-[6px] hover:bg-[#166fe5] transition-colors">
            Message
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Title</div>
          <EditableText
            value={edits.marketplace_title}
            onChange={(v) => onEdits({ marketplace_title: v })}
            isEditing={isEditing}
            rows={1}
          />
        </div>
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Price</div>
          <div className="bg-bg-2 border border-border p-4 text-[13px] text-gold font-mono-custom">
            {formatPrice(vehicle.price)}
          </div>
        </div>
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Description</div>
          <EditableText
            value={edits.marketplace_body}
            onChange={(v) => onEdits({ marketplace_body: v })}
            isEditing={isEditing}
            rows={6}
          />
        </div>
      </div>
    </div>
  );
}

// ── TikTok Tab ─────────────────────────────────────────────────────────────

function TikTokTab({
  vehicle,
  pack,
  isEditing,
  edits,
  onEdits,
}: {
  vehicle: Vehicle;
  pack: SocialPack;
  isEditing: boolean;
  edits: EditState;
  onEdits: (patch: Partial<EditState>) => void;
}) {
  const photos = edits.ig_photo_order.length > 0 ? edits.ig_photo_order : (pack.ig_photo_order ?? vehicle.photos ?? []);
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;
  const shots: TikTokShot[] = isEditing ? edits.tiktok_script : (pack.tiktok_script ?? []);
  const firstCaption = shots[0]?.caption ?? title;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Phone mockup */}
      <div className="flex-shrink-0">
        <div
          className="relative bg-black rounded-[32px] overflow-hidden shadow-[0_12px_60px_rgba(0,0,0,0.7)] border-[3px] border-[#2a2a2a]"
          style={{ width: 200, height: 355 }}
        >
          <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4 z-10">
            <span className="text-white text-[10px] font-sans font-semibold">9:41</span>
            <div className="w-16 h-4 bg-black rounded-full" />
            <div className="flex gap-1">
              <span className="text-white text-[10px]">●●●</span>
            </div>
          </div>

          <VehiclePhoto src={photos[0]} alt={title} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          <div className="absolute right-2 bottom-24 flex flex-col items-center gap-4">
            {[{ icon: '❤️', label: '—' }, { icon: '💬', label: '—' }, { icon: '↗', label: 'Share' }].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-[16px]">{icon}</span>
                </div>
                <span className="text-white text-[9px] font-sans">{label}</span>
              </div>
            ))}
          </div>

          <div className="absolute left-2 bottom-8 right-12 text-white">
            <div className="text-[11px] font-semibold font-sans mb-[3px]">@mbautocollective</div>
            <div className="text-[10px] font-sans leading-tight mb-1 line-clamp-2">{firstCaption}</div>
            {edits.tiktok_hashtags && (
              <div className="text-[9px] text-[#00f2ea] font-sans truncate">{edits.tiktok_hashtags}</div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-7 bg-black/80 flex items-center justify-around">
            {['🏠', '🔍', '+', '📥', '👤'].map((icon, i) => (
              <span key={i} className="text-white text-[12px]">{icon}</span>
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
                  <td className="px-4 py-3 border-b border-border text-text-2 font-mono-custom text-[10px] whitespace-nowrap">{row.timestamp}</td>
                  <td className="px-4 py-3 border-b border-border text-text">
                    {isEditing ? (
                      <textarea
                        value={row.shot}
                        onChange={(e) => {
                          const next = edits.tiktok_script.map((s, j) =>
                            j === i ? { ...s, shot: e.target.value } : s
                          );
                          onEdits({ tiktok_script: next });
                        }}
                        rows={2}
                        className="w-full bg-transparent border border-border p-1 text-[12px] text-text resize-none focus:outline-none focus:border-gold-lo transition-colors"
                      />
                    ) : row.shot}
                  </td>
                  <td className="px-4 py-3 border-b border-border text-text-2 italic">
                    {isEditing ? (
                      <textarea
                        value={row.caption}
                        onChange={(e) => {
                          const next = edits.tiktok_script.map((s, j) =>
                            j === i ? { ...s, caption: e.target.value } : s
                          );
                          onEdits({ tiktok_script: next });
                        }}
                        rows={2}
                        className="w-full bg-transparent border border-border p-1 text-[12px] text-text-2 resize-none focus:outline-none focus:border-gold-lo transition-colors italic"
                      />
                    ) : row.caption}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Hashtags</div>
          <EditableText
            value={edits.tiktok_hashtags}
            onChange={(v) => onEdits({ tiktok_hashtags: v })}
            isEditing={isEditing}
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}

// ── LinkedIn Tab ───────────────────────────────────────────────────────────

function LinkedInTab({
  vehicle,
  pack,
  isEditing,
  edits,
  onEdits,
}: {
  vehicle: Vehicle;
  pack: SocialPack;
  isEditing: boolean;
  edits: EditState;
  onEdits: (patch: Partial<EditState>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const photos = edits.ig_photo_order.length > 0 ? edits.ig_photo_order : (pack.ig_photo_order ?? vehicle.photos ?? []);
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;
  const post = edits.linkedin_body;
  const preview = post.slice(0, 280);
  const showToggle = post.length > 280;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="bg-white rounded-[8px] overflow-hidden w-full max-w-[440px] flex-shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          <div className="w-12 h-12 rounded-[4px] bg-[#0077b5] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[15px] font-sans">MB</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-[#1c1e21] font-sans leading-tight">
              MB Auto Collective
            </div>
            <div className="text-[12px] text-[#666] font-sans">Prestige Automotive · Waterloo, Sydney</div>
            <div className="text-[11px] text-[#999] font-sans">1h · 🌐</div>
          </div>
          <button className="border border-[#0077b5] text-[#0077b5] text-[13px] font-semibold font-sans px-4 py-1 rounded-full hover:bg-[#e8f3fb] transition-colors">
            Follow
          </button>
        </div>

        <div className="px-4 pb-3 text-[14px] text-[#1c1e21] font-sans leading-[1.6]">
          <span className="whitespace-pre-wrap">{expanded || !showToggle ? post : preview + '…'}</span>
          {showToggle && (
            <button onClick={() => setExpanded(!expanded)} className="text-[#666] font-semibold hover:underline ml-1">
              {expanded ? 'see less' : 'see more'}
            </button>
          )}
        </div>

        <div className="relative w-full bg-gray-100" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0">
            <VehiclePhoto src={photos[0]} alt={title} className="w-full h-full" />
          </div>
        </div>

        <div className="px-4 py-2 flex justify-between items-center border-b border-[#e4e6ea]">
          <span className="text-[14px]">👍❤️💡</span>
          <span className="text-[13px] text-[#666] font-sans cursor-pointer">Comments</span>
        </div>

        <div className="px-4 py-1 flex items-center">
          {[{ icon: '👍', label: 'Like' }, { icon: '💬', label: 'Comment' }, { icon: '🔁', label: 'Repost' }, { icon: '↗', label: 'Send' }].map(({ icon, label }) => (
            <button key={label} className="flex-1 flex items-center justify-center gap-1 py-2 text-[12px] text-[#666] font-sans font-semibold hover:bg-[#f2f2f2] rounded-[4px] transition-colors">
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Post Text</div>
          <EditableText
            value={edits.linkedin_body}
            onChange={(v) => onEdits({ linkedin_body: v })}
            isEditing={isEditing}
            rows={8}
          />
        </div>
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Hashtags</div>
          <EditableText
            value={edits.linkedin_hashtags}
            onChange={(v) => onEdits({ linkedin_hashtags: v })}
            isEditing={isEditing}
            rows={1}
          />
        </div>
      </div>
    </div>
  );
}

// ── Threads Tab ────────────────────────────────────────────────────────────

function ThreadsTab({
  vehicle,
  pack,
  isEditing,
  edits,
  onEdits,
}: {
  vehicle: Vehicle;
  pack: SocialPack;
  isEditing: boolean;
  edits: EditState;
  onEdits: (patch: Partial<EditState>) => void;
}) {
  const photos = edits.ig_photo_order.length > 0 ? edits.ig_photo_order : (pack.ig_photo_order ?? vehicle.photos ?? []);
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;
  const post = edits.threads_body;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="w-full max-w-[420px] flex-shrink-0">
        <div className="bg-[#101010] rounded-[16px] border border-[#2a2a2a] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.7)]">
          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b8963e] to-[#7a6428] flex items-center justify-center">
                  <span className="text-white font-bold text-[12px] font-sans">MB</span>
                </div>
                <div className="w-[2px] flex-1 bg-[#2a2a2a] mt-2 min-h-[40px]" />
              </div>

              <div className="flex-1 min-w-0 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-[14px] font-sans">mbautocollective</span>
                  <span className="text-[#666] text-[13px] font-sans">· 1h</span>
                  <span className="ml-auto text-[#666] text-[18px]">···</span>
                </div>
                <div className="text-[#e0e0e0] text-[14px] font-sans leading-[1.6] whitespace-pre-wrap mb-2">{post}</div>
                {edits.threads_hashtags && (
                  <div className="text-[13px] text-[#888] font-sans mb-3">{edits.threads_hashtags}</div>
                )}
                {photos[0] && (
                  <div className="relative rounded-[8px] overflow-hidden mb-3" style={{ height: 200 }}>
                    <VehiclePhoto src={photos[0]} alt={title} className="w-full h-full" />
                  </div>
                )}
                <div className="text-[13px] text-[#666] font-sans">Reply to @mbautocollective</div>
              </div>
            </div>

            <div className="flex items-center gap-4 pl-12 pt-1">
              {[{ icon: '❤️', label: '—' }, { icon: '💬', label: 'Replies' }, { icon: '🔁', label: 'Repost' }].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1 text-[#666]">
                  <span className="text-[16px]">{icon}</span>
                  <span className="text-[12px] font-sans">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Post Text</div>
          <EditableText
            value={edits.threads_body}
            onChange={(v) => onEdits({ threads_body: v })}
            isEditing={isEditing}
            rows={5}
          />
        </div>
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">Hashtags</div>
          <EditableText
            value={edits.threads_hashtags}
            onChange={(v) => onEdits({ threads_hashtags: v })}
            isEditing={isEditing}
            rows={1}
          />
        </div>
      </div>
    </div>
  );
}

// ── Quality Warnings ───────────────────────────────────────────────────────

function QualityWarnings({ warnings }: { warnings: string[] }) {
  return (
    <div className="mt-10 border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.04)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[13px]">⚠</span>
        <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-[rgba(245,158,11,0.85)]">
          Quality Warnings ({warnings.length})
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {warnings.map((w, i) => (
          <li key={i} className="flex gap-3 text-[12px] text-text-2 leading-relaxed">
            <span className="text-[rgba(245,158,11,0.6)] font-mono-custom text-[10px] mt-[2px] flex-shrink-0">{i + 1}.</span>
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'text-text-3 border-border',
    approved: 'text-gold border-gold-lo',
    published: 'text-green-400 border-green-900',
    rejected: 'text-red-400 border-red-900',
    failed: 'text-red-400 border-red-900',
  };
  return (
    <span className={`inline-block border px-2 py-[2px] font-mono-custom text-[8px] tracking-[0.2em] uppercase ${styles[status] ?? 'text-text-3 border-border'}`}>
      {status}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function SocialPackCard({
  vehicle,
  pack,
  isPending,
  onApprove,
  onRegenerate,
  onSave,
}: {
  vehicle: Vehicle;
  pack: SocialPack | null;
  isPending: boolean;
  onApprove: (packId: string, variant: IGVariant) => void;
  onRegenerate: (vehicleId: string) => void;
  onSave: (packId: string, edits: import('@/app/admin/social-pack/actions').PackEdits) => Promise<void>;
}) {
  const [tab, setTab] = useState<Platform>('instagram');
  const [igVariant, setIgVariant] = useState<IGVariant>(
    pack?.ig_caption_selected ?? 'lifestyle'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [edits, setEdits] = useState<EditState>(() =>
    pack ? packToEditState(pack) : packToEditState({} as SocialPack)
  );
  const [isSaving, setIsSaving] = useState(false);

  const hasPack = !!pack;
  const isApproved = pack?.status === 'approved' || pack?.status === 'published';

  const patchEdits = useCallback((patch: Partial<EditState>) => {
    setEdits((prev) => ({ ...prev, ...patch }));
  }, []);

  function handleEditToggle() {
    if (!pack) return;
    if (isEditing) {
      // cancel — reset to pack data
      setEdits(packToEditState(pack));
    }
    setIsEditing((v) => !v);
  }

  async function handleSave() {
    if (!pack) return;
    setIsSaving(true);
    try {
      await onSave(pack.id, {
        ig_caption_lifestyle: edits.ig_caption_lifestyle,
        ig_caption_spec: edits.ig_caption_spec,
        ig_caption_story: edits.ig_caption_story,
        ig_hashtags: edits.ig_hashtags.split(/\s+/).filter(Boolean),
        ig_photo_order: edits.ig_photo_order,
        ig_stories: edits.ig_stories,
        fb_body: edits.fb_body,
        fb_hashtags: edits.fb_hashtags.split(/\s+/).filter(Boolean),
        marketplace_title: edits.marketplace_title,
        marketplace_body: edits.marketplace_body,
        tiktok_script: edits.tiktok_script,
        tiktok_hashtags: edits.tiktok_hashtags.split(/\s+/).filter(Boolean),
        linkedin_body: edits.linkedin_body,
        linkedin_hashtags: edits.linkedin_hashtags.split(/\s+/).filter(Boolean),
        threads_body: edits.threads_body,
        threads_hashtags: edits.threads_hashtags.split(/\s+/).filter(Boolean),
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  const tabProps = { isEditing, edits, onEdits: patchEdits };

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center gap-3 justify-end mb-6 flex-wrap">
        {pack && <StatusBadge status={pack.status} />}

        {hasPack && !isEditing && (
          <button
            onClick={handleEditToggle}
            disabled={isPending}
            className="border border-border text-text-2 font-body text-[10px] tracking-[0.2em] uppercase px-5 py-[10px] font-[500] hover:border-gold-lo hover:text-text transition-all disabled:opacity-40"
          >
            Edit
          </button>
        )}

        {isEditing && (
          <>
            <button
              onClick={handleEditToggle}
              className="border border-border text-text-3 font-body text-[10px] tracking-[0.2em] uppercase px-5 py-[10px] font-[500] hover:border-border hover:text-text-2 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gold text-bg font-body text-[10px] tracking-[0.2em] uppercase px-5 py-[10px] font-[500] hover:bg-gold-hi transition-colors disabled:opacity-40"
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        )}

        {!isEditing && (
          <>
            <button
              onClick={() => onRegenerate(vehicle.id)}
              disabled={isPending}
              className="border border-border text-text-2 font-body text-[10px] tracking-[0.2em] uppercase px-5 py-[10px] font-[500] hover:border-gold-lo hover:text-text transition-all disabled:opacity-40"
            >
              {isPending ? 'Working…' : hasPack ? 'Regenerate' : 'Generate Pack'}
            </button>
            {hasPack && (
              <button
                onClick={() => onApprove(pack.id, igVariant)}
                disabled={isPending || isApproved}
                className="bg-gold text-bg font-body text-[10px] tracking-[0.2em] uppercase px-5 py-[10px] font-[500] hover:bg-gold-hi transition-colors disabled:opacity-40"
              >
                {isApproved ? '✓ Approved' : 'Approve'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Edit mode indicator */}
      {isEditing && (
        <div className="mb-6 border border-gold-lo bg-gold-dim px-4 py-3 text-[11px] text-gold font-mono-custom tracking-[0.12em]">
          EDITING — changes apply across all tabs. Save when done.
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border mb-8 overflow-x-auto">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => hasPack && setTab(id)}
            className={`px-5 py-3 font-body text-[10px] tracking-[0.18em] uppercase whitespace-nowrap border-b-2 transition-all -mb-[1px] ${
              tab === id && hasPack
                ? 'border-b-gold text-gold'
                : 'border-b-transparent text-text-3 hover:text-text-2'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* No-pack state */}
      {!hasPack && (
        <NoPack vehicleId={vehicle.id} isPending={isPending} onRegenerate={onRegenerate} />
      )}

      {/* Tab content */}
      {hasPack && (
        <>
          {tab === 'instagram' && (
            <InstagramTab
              vehicle={vehicle}
              pack={pack}
              variant={igVariant}
              onVariantChange={setIgVariant}
              {...tabProps}
            />
          )}
          {tab === 'facebook' && <FacebookTab vehicle={vehicle} pack={pack} {...tabProps} />}
          {tab === 'marketplace' && <MarketplaceTab vehicle={vehicle} pack={pack} {...tabProps} />}
          {tab === 'tiktok' && <TikTokTab vehicle={vehicle} pack={pack} {...tabProps} />}
          {tab === 'linkedin' && <LinkedInTab vehicle={vehicle} pack={pack} {...tabProps} />}
          {tab === 'threads' && <ThreadsTab vehicle={vehicle} pack={pack} {...tabProps} />}

          {pack.quality_warnings && pack.quality_warnings.length > 0 && (
            <QualityWarnings warnings={pack.quality_warnings} />
          )}
        </>
      )}
    </div>
  );
}
