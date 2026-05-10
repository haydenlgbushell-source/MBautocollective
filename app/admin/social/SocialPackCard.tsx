'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { approvePack, rejectPack, regeneratePack } from './actions';

type CaptionVariant = 'lifestyle' | 'spec' | 'story';
type Platform = 'ig' | 'fb' | 'marketplace' | 'tiktok' | 'linkedin' | 'threads';

interface ScriptLine {
  timestamp: string;
  shot: string;
  caption: string;
}

interface Story {
  photo_url: string;
  text: string;
}

export interface SocialPack {
  id: string;
  vehicle_id: string;
  status: string;
  vehicle_summary: string | null;
  ig_caption_lifestyle: string | null;
  ig_caption_spec: string | null;
  ig_caption_story: string | null;
  ig_caption_selected: CaptionVariant | null;
  ig_hashtags: string[] | null;
  ig_photo_order: string[] | null;
  ig_stories: Story[] | null;
  ig_reel: { script: ScriptLine[]; audio_guidance: string; requires_video: boolean } | null;
  fb_body: string | null;
  fb_hashtags: string[] | null;
  marketplace_title: string | null;
  marketplace_body: string | null;
  tiktok_script: ScriptLine[] | null;
  tiktok_hashtags: string[] | null;
  linkedin_body: string | null;
  linkedin_hashtags: string[] | null;
  threads_body: string | null;
  threads_hashtags: string[] | null;
  quality_warnings: string[] | null;
  regeneration_notes: string | null;
  generation_error: string | null;
  generated_at: string | null;
  vehicles: {
    make: string;
    model: string;
    year: number;
    variant: string | null;
    price: number;
    photos: string[] | null;
  } | null;
}

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'ig', label: 'Instagram' },
  { id: 'fb', label: 'Facebook' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'threads', label: 'Threads' },
];

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  approved: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
  published: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  rejected: 'text-red-400 border-red-400/30 bg-red-400/5',
  failed: 'text-red-500 border-red-500/30 bg-red-500/5',
};

// ─── Shared primitive ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="font-mono-custom text-[8px] tracking-[0.3em] uppercase text-text-3 mb-3">
      {children}
    </div>
  );
}

// ─── Instagram ────────────────────────────────────────────────────────────────

function IGAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full p-[2px] flex-shrink-0"
      style={{
        width: size,
        height: size,
        background:
          'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      }}
    >
      <div
        className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-gray-900"
        style={{ fontSize: size * 0.22 }}
      >
        MB
      </div>
    </div>
  );
}

function IGFeedPost({
  photo,
  caption,
  hashtags,
  photoCount,
}: {
  photo: string | null;
  caption: string | null;
  hashtags: string[] | null;
  photoCount: number;
}) {
  return (
    <div className="w-[380px] bg-white rounded-sm overflow-hidden border border-gray-200 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <IGAvatar size={32} />
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-gray-900 leading-tight">mbautocollective</div>
          <div className="text-[10px] text-gray-400 leading-tight">Gold Coast, QLD</div>
        </div>
        <span className="text-gray-500 text-[18px] leading-none pb-1">···</span>
      </div>

      {/* Photo */}
      <div className="relative w-full aspect-square bg-gray-100">
        {photo ? (
          <Image src={photo} alt="Instagram post" fill className="object-cover" sizes="380px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-[11px]">
            No photo
          </div>
        )}
        {photoCount > 1 && (
          <div className="absolute top-2.5 right-2.5 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            1/{photoCount}
          </div>
        )}
        {photoCount > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
            {Array.from({ length: Math.min(photoCount, 7) }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full ${i === 0 ? 'w-1.5 h-1.5 bg-[#3897f0]' : 'w-1.5 h-1.5 bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center mb-2">
          <div className="flex gap-3 text-[20px]">
            <span>♡</span>
            <span style={{ fontSize: 18 }}>💬</span>
            <span style={{ fontSize: 18 }}>↗</span>
          </div>
          <span className="ml-auto text-[18px]">🔖</span>
        </div>

        {/* Caption */}
        <div className="text-[12px] text-gray-900 leading-[1.5]">
          <span className="font-semibold">mbautocollective</span>{' '}
          <span className="whitespace-pre-wrap">{caption ?? ''}</span>
        </div>

        {/* Hashtags */}
        {hashtags && hashtags.length > 0 && (
          <div className="text-[12px] text-[#003569] mt-1 leading-[1.6]">
            {hashtags.map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ')}
          </div>
        )}

        <div className="text-[10px] text-gray-400 mt-1.5 pb-1">View all comments</div>
      </div>

      {/* Timestamp */}
      <div className="px-3 pb-2.5 text-[9px] uppercase tracking-[0.1em] text-gray-400">
        Just now
      </div>
    </div>
  );
}

function IGStoryPreview({ story, index }: { story: Story; index: number }) {
  return (
    <div className="flex-shrink-0">
      <div className="relative w-[120px] aspect-[9/16] rounded-xl overflow-hidden bg-gray-900">
        {story.photo_url ? (
          <Image src={story.photo_url} alt={`Story ${index + 1}`} fill className="object-cover" sizes="120px" />
        ) : (
          <div className="w-full h-full bg-gray-800" />
        )}
        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent p-2">
          <p className="text-white text-[10px] leading-[1.4] font-medium">{story.text}</p>
        </div>
        {/* IG story ring */}
        <div
          className="absolute top-1.5 left-1.5 rounded-full p-[1.5px]"
          style={{
            background:
              'linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%)',
            width: 28,
            height: 28,
          }}
        >
          <div className="w-full h-full rounded-full bg-gray-900 border border-gray-900 flex items-center justify-center text-[6px] font-bold text-white">
            MB
          </div>
        </div>
        {/* Story number */}
        <div className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[8px] px-1.5 py-0.5 rounded-full">
          {index + 1}
        </div>
      </div>
      <div className="text-center text-[9px] text-text-3 mt-1.5 font-mono-custom">Story {index + 1}</div>
    </div>
  );
}

function IGReelStoryboard({ lines, audioGuidance }: { lines: ScriptLine[]; audioGuidance: string }) {
  return (
    <div className="space-y-2">
      {lines.map((line, i) => (
        <div key={i} className="flex gap-0 overflow-hidden rounded-sm border border-gray-700">
          <div className="bg-gray-800 text-gray-400 font-mono text-[9px] px-2 flex items-center w-[52px] flex-shrink-0 justify-center">
            {line.timestamp}
          </div>
          <div className="bg-gray-900 border-l border-gray-700 px-3 py-2 flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-gray-300 mb-0.5">{line.shot}</div>
            <div className="text-[10px] text-gray-400">{line.caption}</div>
          </div>
        </div>
      ))}
      {audioGuidance && (
        <div className="flex items-start gap-2 mt-3 text-[10px] text-gray-400 italic">
          <span>♪</span>
          <span>{audioGuidance}</span>
        </div>
      )}
    </div>
  );
}

function IGTab({
  pack,
  selectedCaption,
  onSelectCaption,
}: {
  pack: SocialPack;
  selectedCaption: CaptionVariant;
  onSelectCaption: (v: CaptionVariant) => void;
}) {
  const photos = pack.ig_photo_order ?? pack.vehicles?.photos ?? [];
  const leadPhoto = photos[0] ?? null;
  const selectedText =
    selectedCaption === 'lifestyle'
      ? pack.ig_caption_lifestyle
      : selectedCaption === 'spec'
      ? pack.ig_caption_spec
      : pack.ig_caption_story;

  const VARIANTS: { id: CaptionVariant; label: string; text: string | null }[] = [
    { id: 'lifestyle', label: 'Lifestyle', text: pack.ig_caption_lifestyle },
    { id: 'spec', label: 'Spec', text: pack.ig_caption_spec },
    { id: 'story', label: 'Story', text: pack.ig_caption_story },
  ];

  return (
    <div className="space-y-8">
      {/* Feed post */}
      <div>
        <SectionLabel>Feed Post</SectionLabel>
        <div className="flex gap-6 items-start flex-wrap">
          <IGFeedPost
            photo={leadPhoto}
            caption={selectedText}
            hashtags={pack.ig_hashtags}
            photoCount={photos.length}
          />

          {/* Right controls */}
          <div className="flex-1 min-w-[220px] space-y-5">
            {/* Caption variant selector */}
            <div>
              <div className="font-mono-custom text-[8px] tracking-[0.25em] uppercase text-text-3 mb-2">
                Caption — select one
              </div>
              <div className="space-y-1.5">
                {VARIANTS.map(({ id, label, text }) => (
                  <button
                    key={id}
                    onClick={() => onSelectCaption(id)}
                    className={`w-full text-left rounded-sm transition-all ${
                      selectedCaption === id
                        ? 'ring-1 ring-gold bg-gold/5'
                        : 'ring-1 ring-border hover:ring-border-2'
                    }`}
                  >
                    <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${
                          selectedCaption === id ? 'bg-gold' : 'bg-transparent border border-border-2'
                        }`}
                      />
                      <span className="font-mono-custom text-[8px] tracking-[0.2em] uppercase text-text-3">
                        {label}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-2 leading-[1.7] whitespace-pre-wrap px-3 pb-2.5">
                      {text ?? '—'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo order */}
            {photos.length > 0 && (
              <div>
                <div className="font-mono-custom text-[8px] tracking-[0.25em] uppercase text-text-3 mb-2">
                  Photo order ({photos.length})
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {photos.slice(0, 10).map((url, i) => (
                    <div key={i} className="relative w-12 h-12 flex-shrink-0 overflow-hidden border border-border">
                      <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="48px" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] text-center leading-tight py-px">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags */}
            {pack.ig_hashtags && pack.ig_hashtags.length > 0 && (
              <div>
                <div className="font-mono-custom text-[8px] tracking-[0.25em] uppercase text-text-3 mb-2">
                  Hashtags
                </div>
                <p className="text-[11px] text-[#003569] leading-[1.8]">
                  {pack.ig_hashtags.map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stories */}
      {pack.ig_stories && pack.ig_stories.length > 0 && (
        <div>
          <SectionLabel>Stories ({pack.ig_stories.length})</SectionLabel>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {pack.ig_stories.map((s, i) => (
              <IGStoryPreview key={i} story={s} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Reel */}
      {pack.ig_reel && pack.ig_reel.script && pack.ig_reel.script.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <SectionLabel>Reel Script</SectionLabel>
            {pack.ig_reel.requires_video && (
              <span className="font-mono-custom text-[8px] tracking-[0.15em] uppercase text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 -mt-3">
                Requires video footage
              </span>
            )}
          </div>
          <div className="max-w-[600px]">
            <IGReelStoryboard
              lines={pack.ig_reel.script}
              audioGuidance={pack.ig_reel.audio_guidance}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

function FBTab({ pack }: { pack: SocialPack }) {
  const photo = pack.vehicles?.photos?.[0] ?? null;
  const body = pack.fb_body ?? '';
  const tags = pack.fb_hashtags ?? [];
  const fullText = tags.length > 0 ? `${body}\n\n${tags.map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ')}` : body;

  return (
    <div>
      <SectionLabel>Feed Post</SectionLabel>
      <div className="max-w-[500px] bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
          <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0">
            MB
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-gray-900 leading-tight">MB Auto Collective</div>
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <span>Just now</span>
              <span>·</span>
              <span>🌐</span>
            </div>
          </div>
          <span className="text-gray-400 text-[18px]">···</span>
        </div>

        {/* Post text */}
        <div className="px-4 pb-3">
          <p className="text-[13px] text-gray-900 leading-[1.6] whitespace-pre-wrap">{fullText}</p>
        </div>

        {/* Photo */}
        {photo && (
          <div className="relative w-full aspect-video bg-gray-100">
            <Image src={photo} alt="Facebook post" fill className="object-cover" sizes="500px" />
          </div>
        )}

        {/* Reaction counts */}
        <div className="px-4 pt-2 pb-1 flex items-center justify-between text-[12px] text-gray-500 border-b border-gray-100">
          <span>👍❤️ 12</span>
          <div className="flex gap-3">
            <span>4 comments</span>
            <span>2 shares</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex divide-x divide-gray-100">
          {['👍  Like', '💬  Comment', '↗  Share'].map(a => (
            <button
              key={a}
              className="flex-1 py-2 text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors text-center"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

function MarketplaceTab({ pack }: { pack: SocialPack }) {
  const photo = pack.vehicles?.photos?.[0] ?? null;
  const price = pack.vehicles?.price;

  return (
    <div>
      <SectionLabel>Marketplace Listing</SectionLabel>
      <div className="max-w-[480px] bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Photo */}
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          {photo ? (
            <Image src={photo} alt="Marketplace" fill className="object-cover" sizes="480px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[12px]">
              No photo
            </div>
          )}
        </div>

        {/* Listing details */}
        <div className="p-4">
          {price && (
            <div className="text-[22px] font-bold text-gray-900 mb-1">
              ${price.toLocaleString()}
            </div>
          )}
          <div className="text-[15px] font-semibold text-gray-900 mb-1">
            {pack.marketplace_title ?? '—'}
          </div>
          <div className="text-[12px] text-gray-500 mb-3 flex items-center gap-1">
            <span>📍</span>
            <span>Gold Coast, QLD</span>
          </div>
          <hr className="border-gray-100 mb-3" />
          <p className="text-[13px] text-gray-700 leading-[1.65] whitespace-pre-wrap">
            {pack.marketplace_body ?? '—'}
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold text-[9px]">
              MB
            </div>
            <span className="text-[11px] text-gray-500">MB Auto Collective</span>
          </div>
          <button className="bg-[#1877F2] text-white text-[12px] font-semibold px-4 py-1.5 rounded-md">
            Message
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

function TikTokTab({ pack }: { pack: SocialPack }) {
  const photo = pack.vehicles?.photos?.[0] ?? null;
  const script = pack.tiktok_script ?? [];
  const tags = pack.tiktok_hashtags ?? [];
  const firstCaption = script[0]?.caption ?? '';

  return (
    <div>
      <SectionLabel>TikTok Video</SectionLabel>
      <div className="flex gap-6 items-start flex-wrap">
        {/* Phone mockup */}
        <div className="flex-shrink-0 w-[220px]">
          <div className="relative w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden border-4 border-gray-800">
            {/* Background photo */}
            {photo && (
              <Image src={photo} alt="TikTok" fill className="object-cover opacity-70" sizes="220px" />
            )}

            {/* TikTok overlay UI */}
            <div className="absolute inset-0 flex flex-col justify-between p-3">
              {/* Top bar */}
              <div className="flex items-center justify-center">
                <div className="flex gap-4 text-white text-[11px] font-semibold">
                  <span className="text-gray-400">Following</span>
                  <span className="border-b-2 border-white pb-0.5">For You</span>
                </div>
              </div>

              {/* Right sidebar icons */}
              <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-[#FE2C55] flex items-center justify-center text-white text-[8px] font-bold">
                    MB
                  </div>
                </div>
                {[['♡', '12.4K'], ['💬', '384'], ['↗', '1.2K'], ['🔖', '']].map(([icon, count]) => (
                  <div key={icon} className="flex flex-col items-center">
                    <span className="text-white text-[20px] leading-none">{icon}</span>
                    {count && <span className="text-white text-[9px] mt-0.5">{count}</span>}
                  </div>
                ))}
              </div>

              {/* Bottom caption */}
              <div className="pr-12">
                <div className="text-white text-[11px] font-semibold mb-1">@mbautocollective</div>
                {firstCaption && (
                  <p className="text-white text-[10px] leading-[1.4] mb-1">{firstCaption}</p>
                )}
                {tags.length > 0 && (
                  <p className="text-[10px] text-[#25F4EE]">
                    {tags.slice(0, 4).map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ')}
                  </p>
                )}
                {/* Scrolling audio ticker */}
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-white text-[10px]">♪</span>
                  <div className="text-white text-[9px] opacity-80 truncate">Original audio · mbautocollective</div>
                </div>
              </div>
            </div>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 text-[10px] text-text-3 font-mono-custom">
              {tags.map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ')}
            </div>
          )}
        </div>

        {/* Shot storyboard */}
        {script.length > 0 && (
          <div className="flex-1 min-w-[240px]">
            <div className="font-mono-custom text-[8px] tracking-[0.25em] uppercase text-text-3 mb-3">
              Shot Storyboard
            </div>
            <div className="space-y-2">
              {script.map((line, i) => (
                <div key={i} className="flex gap-0 overflow-hidden border border-gray-700 rounded-sm">
                  <div className="w-12 flex-shrink-0 bg-[#111] flex flex-col items-center justify-center gap-0.5 py-2 border-r border-gray-700">
                    <div className="text-[#FE2C55] text-[8px] font-mono font-bold">{i + 1}</div>
                    <div className="text-gray-500 text-[8px] font-mono">{line.timestamp}</div>
                  </div>
                  <div className="bg-[#1a1a1a] px-3 py-2 flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-gray-200 mb-0.5 leading-snug">{line.shot}</div>
                    <div className="text-[10px] text-gray-400 leading-snug">{line.caption}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

function LinkedInTab({ pack }: { pack: SocialPack }) {
  const body = pack.linkedin_body ?? '';
  const tags = pack.linkedin_hashtags ?? [];
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_CHARS = 280;
  const needsExpand = body.length > PREVIEW_CHARS;
  const displayText = needsExpand && !expanded ? body.slice(0, PREVIEW_CHARS) + '…' : body;
  const tagLine = tags.length > 0 ? '\n\n' + tags.map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ') : '';

  return (
    <div>
      <SectionLabel>LinkedIn Post</SectionLabel>
      <div className="max-w-[552px] bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 pb-3">
          <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
            MB
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-gray-900 leading-tight">MB Auto Collective</div>
            <div className="text-[12px] text-gray-500 leading-tight">Luxury Vehicle Dealership · Gold Coast</div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
              <span>Just now</span>
              <span>·</span>
              <span>🌐</span>
            </div>
          </div>
          <button className="border border-[#0A66C2] text-[#0A66C2] text-[12px] font-semibold px-3 py-1 rounded-full hover:bg-[#EAF0F9] transition-colors">
            + Follow
          </button>
        </div>

        {/* Post body */}
        <div className="px-4 pb-3">
          <p className="text-[13px] text-gray-900 leading-[1.65] whitespace-pre-wrap">
            {displayText}
            {tagLine && <span className="text-[#0A66C2]">{tagLine}</span>}
          </p>
          {needsExpand && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-[12px] font-semibold text-gray-500 hover:text-gray-700 mt-1"
            >
              {expanded ? 'see less' : '…see more'}
            </button>
          )}
        </div>

        {/* Reactions */}
        <div className="px-4 py-2 flex items-center justify-between text-[12px] text-gray-500 border-t border-gray-100">
          <span>👍 ❤️ 💡 23 reactions</span>
          <div className="flex gap-3">
            <span>8 comments</span>
            <span>3 reposts</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex border-t border-gray-100">
          {['👍  Like', '💬  Comment', '↗  Repost', '✉  Send'].map(a => (
            <button
              key={a}
              className="flex-1 py-2.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors text-center"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Threads ──────────────────────────────────────────────────────────────────

function ThreadsTab({ pack }: { pack: SocialPack }) {
  const body = pack.threads_body ?? '';
  const tags = pack.threads_hashtags ?? [];
  const tagLine = tags.length > 0 ? '\n' + tags.map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ') : '';
  const photo = pack.vehicles?.photos?.[0] ?? null;

  return (
    <div>
      <SectionLabel>Threads Post</SectionLabel>
      <div className="max-w-[510px] bg-[#101010] rounded-xl border border-[#333] overflow-hidden">
        {/* Post row */}
        <div className="flex gap-3 p-4">
          {/* Thread line column */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-bold text-black text-[11px]">
              MB
            </div>
            {/* Thread line */}
            <div className="w-[1.5px] flex-1 bg-[#333] mt-2 min-h-[20px]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white text-[14px] font-semibold">mbautocollective</span>
              <div className="flex items-center gap-2">
                <span className="text-[#888] text-[12px]">just now</span>
                <span className="text-[#888] text-[18px]">···</span>
              </div>
            </div>

            <p className="text-[14px] text-[#e0e0e0] leading-[1.6] whitespace-pre-wrap">
              {body}
              {tagLine && <span className="text-[#4A9EFF]">{tagLine}</span>}
            </p>

            {/* Photo */}
            {photo && (
              <div className="relative w-full aspect-square mt-3 rounded-xl overflow-hidden">
                <Image src={photo} alt="Threads post" fill className="object-cover" sizes="470px" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-3 text-[#888]">
              {['♡', '💬', '↗', '···'].map(icon => (
                <button key={icon} className="text-[18px] hover:text-white transition-colors">
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reply row hint */}
        <div className="flex gap-3 px-4 pb-4 items-center">
          <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center text-[8px] text-[#888] flex-shrink-0">
            ◯
          </div>
          <span className="text-[12px] text-[#555]">Reply to mbautocollective…</span>
        </div>

        {/* Counts row */}
        <div className="px-4 pb-3 flex gap-4 text-[12px] text-[#888] border-t border-[#1e1e1e] pt-2">
          <span>14 replies</span>
          <span>·</span>
          <span>38 likes</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export default function SocialPackCard({ pack }: { pack: SocialPack }) {
  const [activePlatform, setActivePlatform] = useState<Platform>('ig');
  const [captionVariant, setCaptionVariant] = useState<CaptionVariant>(
    pack.ig_caption_selected ?? 'lifestyle'
  );
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const v = pack.vehicles;
  const title = v
    ? `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`
    : 'Unknown Vehicle';
  const generatedDate = pack.generated_at
    ? new Date(pack.generated_at).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  function runAction(fn: () => Promise<void>) {
    setActionError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'An error occurred');
      }
    });
  }

  return (
    <div className="bg-bg-2 border border-border">
      {/* Card header */}
      <div className="px-7 py-5 border-b border-border flex items-start justify-between gap-4">
        <div>
          <div className="font-display text-[20px] font-[300]">{title}</div>
          {pack.vehicle_summary && (
            <p className="text-[12px] text-text-3 mt-1">{pack.vehicle_summary}</p>
          )}
          {generatedDate && (
            <div className="font-mono-custom text-[8px] tracking-[0.2em] uppercase text-text-3 mt-1">
              Generated {generatedDate}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {v && (
            <div className="font-mono-custom text-[10px] tracking-[0.1em] text-text-3">
              ${v.price.toLocaleString()}
            </div>
          )}
          <span
            className={`font-mono-custom text-[8px] tracking-[0.2em] uppercase px-2 py-1 border ${STATUS_STYLES[pack.status] ?? 'text-text-3 border-border'}`}
          >
            {pack.status}
          </span>
        </div>
      </div>

      {/* Quality warnings */}
      {pack.quality_warnings && pack.quality_warnings.length > 0 && (
        <div className="px-7 py-3 bg-[rgba(201,168,76,0.05)] border-b border-border">
          <div className="font-mono-custom text-[8px] tracking-[0.25em] uppercase text-gold mb-1">
            Quality Warnings
          </div>
          <ul className="space-y-0.5">
            {pack.quality_warnings.map((w, i) => (
              <li key={i} className="text-[11px] text-text-2 font-mono-custom">
                · {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Generation error */}
      {pack.status === 'failed' && pack.generation_error && (
        <div className="px-7 py-3 bg-red-500/5 border-b border-red-500/20">
          <div className="font-mono-custom text-[8px] tracking-[0.25em] uppercase text-red-400 mb-1">
            Generation Error
          </div>
          <p className="text-[11px] text-red-400/80 font-mono-custom">{pack.generation_error}</p>
        </div>
      )}

      {/* Platform tabs */}
      {pack.status !== 'failed' && (
        <>
          <div className="flex border-b border-border overflow-x-auto">
            {PLATFORMS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActivePlatform(id)}
                className={`px-5 py-3 font-mono-custom text-[9px] tracking-[0.2em] uppercase whitespace-nowrap transition-all border-b-2 ${
                  activePlatform === id
                    ? 'text-gold border-b-gold'
                    : 'text-text-3 border-b-transparent hover:text-text-2'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="px-7 py-7">
            {activePlatform === 'ig' && (
              <IGTab pack={pack} selectedCaption={captionVariant} onSelectCaption={setCaptionVariant} />
            )}
            {activePlatform === 'fb' && <FBTab pack={pack} />}
            {activePlatform === 'marketplace' && <MarketplaceTab pack={pack} />}
            {activePlatform === 'tiktok' && <TikTokTab pack={pack} />}
            {activePlatform === 'linkedin' && <LinkedInTab pack={pack} />}
            {activePlatform === 'threads' && <ThreadsTab pack={pack} />}
          </div>
        </>
      )}

      {/* Regeneration notes */}
      {pack.regeneration_notes && (
        <div className="px-7 pb-5">
          <div className="font-mono-custom text-[8px] tracking-[0.25em] uppercase text-text-3 mb-1">
            Regeneration Notes
          </div>
          <p className="text-[11px] text-text-3 italic">{pack.regeneration_notes}</p>
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div className="px-7 pb-3">
          <p className="text-[11px] text-red-400 font-mono-custom">Error: {actionError}</p>
        </div>
      )}

      {/* Action bar */}
      <div className="px-7 py-4 border-t border-border flex items-center gap-3 flex-wrap">
        {pack.status !== 'approved' &&
          pack.status !== 'published' &&
          pack.status !== 'rejected' && (
            <button
              onClick={() => runAction(() => approvePack(pack.id, captionVariant))}
              disabled={isPending}
              className="inline-flex items-center gap-2 bg-gold text-bg font-body text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 font-[500] hover:bg-gold-hi transition-colors disabled:opacity-40"
            >
              {isPending ? '...' : '✓ Approve'}
            </button>
          )}

        <button
          onClick={() => runAction(() => regeneratePack(pack.vehicle_id))}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-bg border border-border text-text-2 font-body text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 hover:border-gold-lo hover:text-gold transition-colors disabled:opacity-40"
        >
          {isPending ? '...' : '↺ Regenerate'}
        </button>

        {pack.status !== 'rejected' && (
          <button
            onClick={() => runAction(() => rejectPack(pack.id))}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-bg border border-border text-text-3 font-body text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 hover:border-red-500/30 hover:text-red-400 transition-colors disabled:opacity-40 ml-auto"
          >
            {isPending ? '...' : '✕ Reject'}
          </button>
        )}
      </div>
    </div>
  );
}
