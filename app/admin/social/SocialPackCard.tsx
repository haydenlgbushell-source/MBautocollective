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

function HashtagPill({ tag }: { tag: string }) {
  return (
    <span className="inline-block bg-bg border border-border font-mono-custom text-[9px] tracking-[0.15em] text-text-3 px-2 py-1 mr-1 mb-1">
      {tag.startsWith('#') ? tag : `#${tag}`}
    </span>
  );
}

function ContentBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="font-mono-custom text-[8px] tracking-[0.3em] uppercase text-gold mb-2">{label}</div>
      {children}
    </div>
  );
}

function BodyText({ text }: { text: string }) {
  return (
    <p className="text-[12px] text-text-2 leading-[1.9] whitespace-pre-wrap bg-bg border border-border p-4">
      {text}
    </p>
  );
}

function ScriptTable({ lines }: { lines: ScriptLine[] }) {
  return (
    <div className="border border-border overflow-hidden">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-border bg-bg">
            <th className="text-left font-mono-custom text-[8px] tracking-[0.2em] uppercase text-text-3 px-3 py-2 w-16">Time</th>
            <th className="text-left font-mono-custom text-[8px] tracking-[0.2em] uppercase text-text-3 px-3 py-2">Shot</th>
            <th className="text-left font-mono-custom text-[8px] tracking-[0.2em] uppercase text-text-3 px-3 py-2">Caption</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="px-3 py-2 text-text-3 font-mono-custom text-[9px] whitespace-nowrap">{line.timestamp}</td>
              <td className="px-3 py-2 text-text-2">{line.shot}</td>
              <td className="px-3 py-2 text-text-2">{line.caption}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IGTab({ pack, selectedCaption, onSelectCaption }: {
  pack: SocialPack;
  selectedCaption: CaptionVariant;
  onSelectCaption: (v: CaptionVariant) => void;
}) {
  const captions: { id: CaptionVariant; label: string; text: string | null }[] = [
    { id: 'lifestyle', label: 'Lifestyle', text: pack.ig_caption_lifestyle },
    { id: 'spec', label: 'Spec-led', text: pack.ig_caption_spec },
    { id: 'story', label: 'Story-led', text: pack.ig_caption_story },
  ];

  const heroPhoto = pack.ig_photo_order?.[0] ?? pack.vehicles?.photos?.[0];

  return (
    <div>
      {heroPhoto && (
        <ContentBlock label="Lead Photo">
          <div className="relative w-20 h-20 border border-border overflow-hidden">
            <Image src={heroPhoto} alt="lead" fill className="object-cover" sizes="80px" />
          </div>
          {pack.ig_photo_order && pack.ig_photo_order.length > 1 && (
            <div className="font-mono-custom text-[9px] text-text-3 mt-1">
              {pack.ig_photo_order.length} photos in order
            </div>
          )}
        </ContentBlock>
      )}

      <ContentBlock label="Caption — choose one">
        <div className="space-y-2">
          {captions.map(({ id, label, text }) => (
            <button
              key={id}
              onClick={() => onSelectCaption(id)}
              className={`w-full text-left p-4 border transition-all ${
                selectedCaption === id
                  ? 'border-gold bg-[rgba(201,168,76,0.06)]'
                  : 'border-border hover:border-border-2'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                  selectedCaption === id ? 'border-gold bg-gold' : 'border-border-2'
                }`} />
                <span className="font-mono-custom text-[8px] tracking-[0.25em] uppercase text-text-3">{label}</span>
              </div>
              <p className="text-[12px] text-text-2 leading-[1.9] whitespace-pre-wrap">{text ?? '—'}</p>
            </button>
          ))}
        </div>
      </ContentBlock>

      {pack.ig_hashtags && pack.ig_hashtags.length > 0 && (
        <ContentBlock label="Hashtags">
          <div>{pack.ig_hashtags.map(t => <HashtagPill key={t} tag={t} />)}</div>
        </ContentBlock>
      )}

      {pack.ig_stories && pack.ig_stories.length > 0 && (
        <ContentBlock label={`Stories (${pack.ig_stories.length})`}>
          <div className="space-y-2">
            {pack.ig_stories.map((s, i) => (
              <div key={i} className="flex gap-3 items-start bg-bg border border-border p-3">
                <div className="relative w-10 h-10 flex-shrink-0 border border-border overflow-hidden">
                  <Image src={s.photo_url} alt={`story ${i + 1}`} fill className="object-cover" sizes="40px" />
                </div>
                <p className="text-[11px] text-text-2">{s.text}</p>
              </div>
            ))}
          </div>
        </ContentBlock>
      )}

      {pack.ig_reel && (
        <ContentBlock label="Reel Script">
          {pack.ig_reel.requires_video && (
            <div className="font-mono-custom text-[9px] text-gold mb-2">Requires video footage</div>
          )}
          <ScriptTable lines={pack.ig_reel.script} />
          {pack.ig_reel.audio_guidance && (
            <p className="text-[11px] text-text-3 mt-2 italic">{pack.ig_reel.audio_guidance}</p>
          )}
        </ContentBlock>
      )}
    </div>
  );
}

function FBTab({ pack }: { pack: SocialPack }) {
  return (
    <div>
      <ContentBlock label="Post Body">
        <BodyText text={pack.fb_body ?? '—'} />
      </ContentBlock>
      {pack.fb_hashtags && pack.fb_hashtags.length > 0 && (
        <ContentBlock label="Hashtags">
          <div>{pack.fb_hashtags.map(t => <HashtagPill key={t} tag={t} />)}</div>
        </ContentBlock>
      )}
    </div>
  );
}

function MarketplaceTab({ pack }: { pack: SocialPack }) {
  return (
    <div>
      <ContentBlock label="Title">
        <p className="text-[14px] font-[500] text-text-1 bg-bg border border-border px-4 py-3">
          {pack.marketplace_title ?? '—'}
        </p>
      </ContentBlock>
      <ContentBlock label="Body">
        <BodyText text={pack.marketplace_body ?? '—'} />
      </ContentBlock>
    </div>
  );
}

function TikTokTab({ pack }: { pack: SocialPack }) {
  return (
    <div>
      {pack.tiktok_script && pack.tiktok_script.length > 0 && (
        <ContentBlock label="Script">
          <ScriptTable lines={pack.tiktok_script} />
        </ContentBlock>
      )}
      {pack.tiktok_hashtags && pack.tiktok_hashtags.length > 0 && (
        <ContentBlock label="Hashtags">
          <div>{pack.tiktok_hashtags.map(t => <HashtagPill key={t} tag={t} />)}</div>
        </ContentBlock>
      )}
    </div>
  );
}

function LinkedInTab({ pack }: { pack: SocialPack }) {
  return (
    <div>
      <ContentBlock label="Post Body">
        <BodyText text={pack.linkedin_body ?? '—'} />
      </ContentBlock>
      {pack.linkedin_hashtags && pack.linkedin_hashtags.length > 0 && (
        <ContentBlock label="Hashtags">
          <div>{pack.linkedin_hashtags.map(t => <HashtagPill key={t} tag={t} />)}</div>
        </ContentBlock>
      )}
    </div>
  );
}

function ThreadsTab({ pack }: { pack: SocialPack }) {
  return (
    <div>
      <ContentBlock label="Post Body">
        <BodyText text={pack.threads_body ?? '—'} />
      </ContentBlock>
      {pack.threads_hashtags && pack.threads_hashtags.length > 0 && (
        <ContentBlock label="Hashtags">
          <div>{pack.threads_hashtags.map(t => <HashtagPill key={t} tag={t} />)}</div>
        </ContentBlock>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  approved: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
  published: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  rejected: 'text-red-400 border-red-400/30 bg-red-400/5',
  failed: 'text-red-500 border-red-500/30 bg-red-500/5',
};

export default function SocialPackCard({ pack }: { pack: SocialPack }) {
  const [activePlatform, setActivePlatform] = useState<Platform>('ig');
  const [captionVariant, setCaptionVariant] = useState<CaptionVariant>(
    pack.ig_caption_selected ?? 'lifestyle'
  );
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const v = pack.vehicles;
  const title = v ? `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}` : 'Unknown Vehicle';
  const generatedDate = pack.generated_at
    ? new Date(pack.generated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
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
          <span className={`font-mono-custom text-[8px] tracking-[0.2em] uppercase px-2 py-1 border ${STATUS_STYLES[pack.status] ?? 'text-text-3 border-border'}`}>
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

          <div className="px-7 py-6">
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
        {pack.status !== 'approved' && pack.status !== 'published' && pack.status !== 'rejected' && (
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
