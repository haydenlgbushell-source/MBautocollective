'use client';

import { useState } from 'react';
import type { PublishPlatform, PublishResults } from '@/types/social';

const PLATFORMS: {
  id: PublishPlatform;
  label: string;
  icon: string;
  credentialKeys: string[];
  note?: string;
}[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'f',
    credentialKeys: ['FACEBOOK_PAGE_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID'],
    note: 'Posts to Facebook Business Page with first photo',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '◎',
    credentialKeys: ['FACEBOOK_PAGE_ACCESS_TOKEN', 'INSTAGRAM_BUSINESS_ACCOUNT_ID'],
    note: 'Carousel if multiple photos, single otherwise',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'in',
    credentialKeys: ['LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_ORGANIZATION_ID'],
    note: 'Posts to Company Page with first photo',
  },
];

interface Props {
  packId: string;
  isPublished: boolean;
  existingResults: PublishResults | null;
  onPublish: (platforms: PublishPlatform[]) => Promise<PublishResults>;
  onClose: () => void;
}

export default function PublishModal({
  packId,
  isPublished,
  existingResults,
  onPublish,
  onClose,
}: Props) {
  const [selected, setSelected] = useState<Set<PublishPlatform>>(
    new Set(['facebook', 'instagram', 'linkedin'])
  );
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<PublishResults | null>(existingResults);
  const [done, setDone] = useState(!!existingResults && Object.keys(existingResults).length > 0);

  function toggle(p: PublishPlatform) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  }

  async function handlePublish() {
    if (!selected.size) return;
    setPublishing(true);
    try {
      const res = await onPublish([...selected]);
      setResults(res);
      setDone(true);
    } finally {
      setPublishing(false);
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg-2 border border-border w-full max-w-[480px] mx-4 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <div className="font-display text-[20px] font-[300]">
              Publish <em className="italic text-gold-hi">Pack</em>
            </div>
            <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mt-[2px]">
              Post to social platforms
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-3 hover:text-text transition-colors text-[20px] leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6">
          {!done ? (
            <>
              {/* Platform selection */}
              <div className="flex flex-col gap-3 mb-7">
                {PLATFORMS.map((p) => {
                  const isSelected = selected.has(p.id);
                  const prevResult = existingResults?.[p.id];
                  return (
                    <label
                      key={p.id}
                      className={`flex items-start gap-4 px-4 py-4 border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-gold bg-gold-dim'
                          : 'border-border hover:border-gold-lo'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(p.id)}
                        className="mt-[2px] accent-[#b8963e] flex-shrink-0"
                      />
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded bg-border flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-[11px] text-text-2 font-sans">{p.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-body text-[11px] tracking-[0.12em] uppercase text-text">
                            {p.label}
                          </div>
                          <div className="font-mono-custom text-[9px] text-text-3 mt-[2px]">
                            {p.note}
                          </div>
                        </div>
                        {prevResult?.success && (
                          <span className="text-[9px] font-mono-custom tracking-[0.15em] uppercase text-gold flex-shrink-0">
                            Posted ✓
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Credentials notice */}
              <div className="mb-6 px-4 py-3 border border-border bg-bg-3 text-[10px] text-text-3 font-body leading-relaxed">
                Platform credentials are configured via environment variables.
                See <span className="text-gold font-mono-custom">.env.example</span> for the required keys.
              </div>

              <button
                onClick={handlePublish}
                disabled={publishing || !selected.size}
                className="w-full bg-gold text-bg font-body text-[10px] tracking-[0.2em] uppercase px-6 py-4 font-[500] hover:bg-gold-hi transition-colors disabled:opacity-40"
              >
                {publishing ? 'Publishing…' : `Post Now — ${selected.size} platform${selected.size !== 1 ? 's' : ''}`}
              </button>
            </>
          ) : (
            /* Results view */
            <div className="flex flex-col gap-3">
              <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-2">
                Publish Results
              </div>
              {PLATFORMS.filter((p) => results?.[p.id]).map((p) => {
                const r = results![p.id]!;
                return (
                  <div
                    key={p.id}
                    className={`flex items-start gap-4 px-4 py-4 border ${
                      r.success ? 'border-green-900/50 bg-green-950/20' : 'border-red-900/40 bg-red-950/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-border flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-[11px] text-text-2 font-sans">{p.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-body text-[11px] tracking-[0.12em] uppercase text-text">
                          {p.label}
                        </span>
                        <span
                          className={`font-mono-custom text-[8px] tracking-[0.18em] uppercase ${
                            r.success ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {r.success ? '✓ Posted' : '✕ Failed'}
                        </span>
                      </div>
                      {r.success && r.postUrl && (
                        <a
                          href={r.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono-custom text-[9px] text-gold hover:text-gold-hi underline underline-offset-2 break-all"
                        >
                          {r.postUrl}
                        </a>
                      )}
                      {!r.success && r.error && (
                        <div className="font-body text-[10px] text-red-400 mt-1">{r.error}</div>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={onClose}
                className="mt-4 w-full border border-border text-text-2 font-body text-[10px] tracking-[0.2em] uppercase px-6 py-4 font-[500] hover:border-gold-lo hover:text-text transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
