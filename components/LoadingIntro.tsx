'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ── Sequence ──────────────────────────────────────────────────────
// 0.0–1.4s  vlines + hlines + ticks + meta strips
// 1.2–2.6s  monogram box traces → MB text fades → wordmark expands
// 2.9–4.6s  Buy / Sell / Trade pillars rise with separators
// 4.7–6.0s  proof block fades, stars pop, counter ticks 84 → reviewsCount
// 7.2s      doors wipe in, overlay unmounts
// ─────────────────────────────────────────────────────────────────

const TOTAL_MS   = 7200;
const START_COUNT = 84;

const CSS = `
/* ── Stage ─────────────────────────────────── */
.mb-intro {
  position: fixed; inset: 0; z-index: 9995;
  background:
    radial-gradient(ellipse at 50% 50%, rgba(184,150,62,0.08) 0%, transparent 55%),
    linear-gradient(135deg, #0a0a0a 0%, #0f0d0a 100%);
  overflow: hidden;
  display: grid;
  place-items: center;
  user-select: none;
}

/* grain */
.mb-intro::before {
  content: '';
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMjAnIGhlaWdodD0nMjIwJz48ZmlsdGVyIGlkPSduJz48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC43NScgbnVtT2N0YXZlcz0nMicgc3RpdGNoVGlsZXM9J3N0aXRjaCcvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbHRlcj0ndXJsKCUyM24pJyBvcGFjaXR5PScwLjU1Jy8+PC9zdmc+");
  opacity: 0.04;
  pointer-events: none;
  mix-blend-mode: overlay;
  animation: mb-grain 8s steps(6) infinite;
}
@keyframes mb-grain {
  0%,100% { transform: translate(0,0); }
  20%     { transform: translate(-3%, 2%); }
  40%     { transform: translate(2%, -3%); }
  60%     { transform: translate(-1%, 4%); }
  80%     { transform: translate(3%, 1%); }
}

/* ── Vertical hairlines ─────────────────────── */
.mb-intro__vline {
  position: absolute; top: 0; bottom: 0; width: 1px;
  background: linear-gradient(to bottom, transparent 0%, rgba(184,150,62,0.55) 50%, transparent 100%);
  transform-origin: center; transform: scaleY(0); opacity: 0;
}
.mb-intro__vline--center { left: 50%;  animation: mb-vline 900ms cubic-bezier(0.25,0.46,0.45,0.94) 200ms forwards; }
.mb-intro__vline--left   { left: 22%;  animation: mb-vline 900ms cubic-bezier(0.25,0.46,0.45,0.94) 600ms forwards; }
.mb-intro__vline--right  { left: 78%;  animation: mb-vline 900ms cubic-bezier(0.25,0.46,0.45,0.94) 600ms forwards; }
@keyframes mb-vline { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }

/* ── Horizontal hairlines ───────────────────── */
.mb-intro__hline {
  position: absolute; left: 0; right: 0; height: 1px;
  background: linear-gradient(to right, transparent 0%, rgba(184,150,62,0.45) 50%, transparent 100%);
  transform-origin: center; transform: scaleX(0); opacity: 0;
}
.mb-intro__hline--top    { top: 18%;    animation: mb-hline 900ms cubic-bezier(0.25,0.46,0.45,0.94) 800ms forwards; }
.mb-intro__hline--bottom { bottom: 18%; animation: mb-hline 900ms cubic-bezier(0.25,0.46,0.45,0.94) 800ms forwards; }
@keyframes mb-hline { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }

/* ── Corner ticks — sit at hairline intersections ── */
.mb-intro__ticks {
  position: absolute; inset: 18% 22%;
  pointer-events: none; opacity: 0;
  animation: mb-fadein 600ms ease 1300ms forwards;
}
.mb-intro__tick {
  position: absolute; width: 14px; height: 14px;
  border: 1px solid var(--gold);
}
.mb-intro__tick--tl { top: -1px;    left: -1px;   border-right: 0; border-bottom: 0; }
.mb-intro__tick--tr { top: -1px;    right: -1px;  border-left:  0; border-bottom: 0; }
.mb-intro__tick--bl { bottom: -1px; left: -1px;   border-right: 0; border-top:    0; }
.mb-intro__tick--br { bottom: -1px; right: -1px;  border-left:  0; border-top:    0; }

/* ── Meta strips ─────────────────────────────── */
.mb-intro__meta {
  position: absolute; left: 60px; right: 60px;
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--fm); font-size: 9px;
  letter-spacing: 0.3em; text-transform: uppercase;
  color: var(--text-3); opacity: 0;
  animation: mb-fadein 600ms ease 200ms forwards;
}
.mb-intro__meta--top    { top: 32px; }
.mb-intro__meta--bottom { bottom: 32px; color: var(--gold-lo); }
.mb-intro__meta-dot {
  display: inline-block; width: 6px; height: 6px;
  background: var(--gold); border-radius: 9999px;
  margin-right: 10px; vertical-align: middle;
}

@keyframes mb-fadein { from { opacity: 0; } to { opacity: 1; } }

/* ── Frame ───────────────────────────────────── */
.mb-intro__frame {
  position: relative;
  width: min(900px, 80vw);
  text-align: center;
  z-index: 2;
}

/* ── Monogram box ─────────────────────────────── */
.mb-intro__monogram {
  width: 64px; height: 64px;
  margin: 0 auto 28px;
  opacity: 0;
  animation: mb-fadein 400ms ease 1200ms forwards;
}
.mb-intro__monogram svg { width: 100%; height: 100%; }
.mb-intro__monogram rect {
  fill: none;
  stroke: var(--gold); stroke-width: 1;
  stroke-dasharray: 252; stroke-dashoffset: 252;
  animation: mb-drawbox 900ms cubic-bezier(0.25,0.46,0.45,0.94) 1300ms forwards;
}
.mb-intro__monogram text {
  font-family: var(--fd); font-weight: 400; font-size: 28px;
  fill: var(--gold-hi); letter-spacing: 0.04em;
  opacity: 0;
  animation: mb-fadein 500ms ease 1900ms forwards;
}
@keyframes mb-drawbox { to { stroke-dashoffset: 0; } }

/* ── Wordmark ─────────────────────────────────── */
.mb-intro__word {
  font-family: var(--fd); font-weight: 300;
  font-size: clamp(22px, 2.2vw, 28px);
  letter-spacing: 0.42em;
  color: var(--text); text-transform: uppercase;
  margin-bottom: 10px; opacity: 0;
  animation: mb-wordin 900ms cubic-bezier(0.25,0.46,0.45,0.94) 2100ms forwards;
}
.mb-intro__word em {
  font-style: italic; font-weight: 400;
  color: var(--gold); letter-spacing: 0.18em;
}
@keyframes mb-wordin {
  from { opacity: 0; letter-spacing: 0.6em; }
  to   { opacity: 1; letter-spacing: 0.42em; }
}

/* ── Sub ──────────────────────────────────────── */
.mb-intro__sub {
  font-family: var(--fm); font-size: 9px;
  letter-spacing: 0.5em; text-transform: uppercase;
  color: var(--text-3); opacity: 0;
  animation: mb-fadein 700ms ease 2500ms forwards;
}

/* ── Pillars ──────────────────────────────────── */
.mb-intro__pillars {
  position: relative;
  margin: 48px auto 0;
  height: 110px;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  column-gap: 28px;
  max-width: 720px;
}
.mb-intro__pillar {
  font-family: var(--fd); font-weight: 300;
  font-size: clamp(44px, 6vw, 78px);
  line-height: 1; letter-spacing: -0.01em;
  color: var(--text);
  opacity: 0; transform: translateY(20px);
}
.mb-intro__pillar--accent { font-style: italic; color: var(--gold-hi); font-weight: 400; }
.mb-intro__pillar-stop    { color: var(--gold); font-weight: 400; }
.mb-intro__pillar--1 { animation: mb-pillarin 700ms cubic-bezier(0.16,1,0.30,1) 2900ms forwards; }
.mb-intro__pillar--2 { animation: mb-pillarin 700ms cubic-bezier(0.16,1,0.30,1) 3300ms forwards; }
.mb-intro__pillar--3 { animation: mb-pillarin 700ms cubic-bezier(0.16,1,0.30,1) 3700ms forwards; }
@keyframes mb-pillarin {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.mb-intro__pillar-sep {
  width: 1px; height: 56px;
  background: linear-gradient(to bottom, transparent, rgba(184,150,62,0.6), transparent);
  opacity: 0; transform: scaleY(0);
}
.mb-intro__pillar-sep--1 { animation: mb-sepin 500ms cubic-bezier(0.25,0.46,0.45,0.94) 3100ms forwards; }
.mb-intro__pillar-sep--2 { animation: mb-sepin 500ms cubic-bezier(0.25,0.46,0.45,0.94) 3500ms forwards; }
@keyframes mb-sepin {
  from { transform: scaleY(0); opacity: 0; }
  to   { transform: scaleY(1); opacity: 1; }
}

/* ── Proof ────────────────────────────────────── */
.mb-intro__proof {
  position: relative; margin: 40px auto 0;
  opacity: 0;
  animation: mb-fadein 500ms ease 4700ms forwards;
}
.mb-intro__stars { display: inline-flex; gap: 8px; margin-bottom: 18px; }
.mb-intro__star {
  width: 16px; height: 16px;
  background: var(--gold);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  opacity: 0; transform: scale(0.4);
}
.mb-intro__star--1 { animation: mb-starin 280ms cubic-bezier(0.16,1,0.30,1) 4800ms forwards; }
.mb-intro__star--2 { animation: mb-starin 280ms cubic-bezier(0.16,1,0.30,1) 4920ms forwards; }
.mb-intro__star--3 { animation: mb-starin 280ms cubic-bezier(0.16,1,0.30,1) 5040ms forwards; }
.mb-intro__star--4 { animation: mb-starin 280ms cubic-bezier(0.16,1,0.30,1) 5160ms forwards; }
.mb-intro__star--5 { animation: mb-starin 280ms cubic-bezier(0.16,1,0.30,1) 5280ms forwards; }
@keyframes mb-starin {
  from { opacity: 0; transform: scale(0.4); }
  to   { opacity: 1; transform: scale(1); }
}

.mb-intro__count {
  font-family: var(--fd); font-weight: 300;
  font-size: clamp(34px, 4.2vw, 52px);
  line-height: 1; color: var(--text); letter-spacing: -0.01em;
}
.mb-intro__count em { font-style: italic; color: var(--gold-hi); font-weight: 400; }
.mb-intro__count-num { font-feature-settings: "tnum"; }

.mb-intro__proof-label {
  margin-top: 14px;
  font-family: var(--fm); font-size: 10px;
  letter-spacing: 0.35em; text-transform: uppercase;
  color: var(--text-3);
}
.mb-intro__proof-label-gold { color: var(--gold); }

/* ── Loader bar ───────────────────────────────── */
.mb-intro__loader {
  position: absolute; left: 50%; bottom: 64px;
  transform: translateX(-50%);
  width: 220px; height: 1px;
  background: rgba(184,150,62,0.14);
  overflow: hidden; opacity: 0;
  animation: mb-fadein 400ms ease 600ms forwards;
}
.mb-intro__loader-fill {
  position: absolute; left: 0; top: 0;
  height: 100%; width: 0%;
  background: linear-gradient(to right, transparent, var(--gold), var(--gold-hi));
  animation: mb-fillbar 6200ms cubic-bezier(0.6,0.05,0.4,1) 600ms forwards;
}
@keyframes mb-fillbar { from { width: 0%; } to { width: 100%; } }

/* ── Doors ────────────────────────────────────── */
.mb-intro__door {
  position: fixed; top: 0; bottom: 0;
  width: 51%; background: var(--bg);
  z-index: 50; pointer-events: none;
}
.mb-intro__door--left  { left: 0;  transform: translateX(-100%); transition: transform 900ms cubic-bezier(0.25,0.46,0.45,0.94); }
.mb-intro__door--right { right: 0; transform: translateX(100%);  transition: transform 900ms cubic-bezier(0.25,0.46,0.45,0.94); }
.mb-intro--closing .mb-intro__door--left  { transform: translateX(0); }
.mb-intro--closing .mb-intro__door--right { transform: translateX(0); }
`;

interface Props {
  alwaysPlay?: boolean;
  reviewsCount?: number;
}

export default function LoadingIntro({ alwaysPlay = false, reviewsCount = 126 }: Props) {
  const [visible, setVisible] = useState(false);
  const [done, setDone]       = useState(false);
  const [count, setCount]     = useState(START_COUNT);
  const [closing, setClosing] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    try { sessionStorage.setItem('mb-intro-played', '1'); } catch { /* private browsing */ }
    document.body.style.overflow = '';
    setClosing(true);
    const t = setTimeout(() => setDone(true), 950);
    timers.current = [t];
  }, []);

  useEffect(() => {
    let played = false;
    try { played = !!sessionStorage.getItem('mb-intro-played'); } catch { /* ignore */ }
    if (!alwaysPlay && played) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try { sessionStorage.setItem('mb-intro-played', '1'); } catch { /* ignore */ }
      return;
    }

    setVisible(true);
    document.body.style.overflow = 'hidden';

    const range = reviewsCount - START_COUNT;
    const t1 = setTimeout(() => {
      const t0 = Date.now();
      const step = () => {
        const p = Math.min((Date.now() - t0) / 1200, 1);
        setCount(Math.round(START_COUNT + range * (1 - (1 - p) ** 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 4800);

    const t2 = setTimeout(finish, TOTAL_MS);
    timers.current = [t1, t2];

    return () => {
      timers.current.forEach(clearTimeout);
      document.body.style.overflow = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, finish]);

  if (!visible || done) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        className={`mb-intro${closing ? ' mb-intro--closing' : ''}`}
        onClick={finish}
        role="presentation"
        aria-hidden="true"
      >
        {/* vertical hairlines */}
        <span className="mb-intro__vline mb-intro__vline--center" />
        <span className="mb-intro__vline mb-intro__vline--left" />
        <span className="mb-intro__vline mb-intro__vline--right" />

        {/* horizontal hairlines */}
        <span className="mb-intro__hline mb-intro__hline--top" />
        <span className="mb-intro__hline mb-intro__hline--bottom" />

        {/* corner ticks at hairline intersections */}
        <div className="mb-intro__ticks">
          <span className="mb-intro__tick mb-intro__tick--tl" />
          <span className="mb-intro__tick mb-intro__tick--tr" />
          <span className="mb-intro__tick mb-intro__tick--bl" />
          <span className="mb-intro__tick mb-intro__tick--br" />
        </div>

        {/* top meta */}
        <div className="mb-intro__meta mb-intro__meta--top">
          <span><span className="mb-intro__meta-dot" />MB Auto Collective</span>
          <span>Waterloo, Sydney</span>
        </div>

        {/* bottom meta */}
        <div className="mb-intro__meta mb-intro__meta--bottom">
          <span>Dealer Licence MD081672</span>
          <span>Loading Showroom</span>
        </div>

        {/* center frame */}
        <div className="mb-intro__frame">

          {/* MB monogram — traced square border, then MB text */}
          <div className="mb-intro__monogram">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="1" y="1" width="62" height="62" />
              <text x="32" y="42" textAnchor="middle">MB</text>
            </svg>
          </div>

          <div className="mb-intro__word">Auto <em>Collective</em></div>
          <div className="mb-intro__sub">Waterloo · Sydney</div>

          {/* pillars */}
          <div className="mb-intro__pillars">
            <div className="mb-intro__pillar mb-intro__pillar--1">
              Buy<span className="mb-intro__pillar-stop">.</span>
            </div>
            <div className="mb-intro__pillar-sep mb-intro__pillar-sep--1" />
            <div className="mb-intro__pillar mb-intro__pillar--2">
              Sell<span className="mb-intro__pillar-stop">.</span>
            </div>
            <div className="mb-intro__pillar-sep mb-intro__pillar-sep--2" />
            <div className="mb-intro__pillar mb-intro__pillar--3 mb-intro__pillar--accent">
              Trade<span className="mb-intro__pillar-stop">.</span>
            </div>
          </div>

          {/* proof */}
          <div className="mb-intro__proof">
            <div className="mb-intro__stars">
              <span className="mb-intro__star mb-intro__star--1" />
              <span className="mb-intro__star mb-intro__star--2" />
              <span className="mb-intro__star mb-intro__star--3" />
              <span className="mb-intro__star mb-intro__star--4" />
              <span className="mb-intro__star mb-intro__star--5" />
            </div>
            <div className="mb-intro__count">
              <span className="mb-intro__count-num">{count}</span>
              <em>+</em> Five-Star <em>Google Reviews</em>
            </div>
            <div className="mb-intro__proof-label">
              Rated <span className="mb-intro__proof-label-gold">5.0</span> · Verified on Google
            </div>
          </div>

        </div>

        {/* progress bar */}
        <div className="mb-intro__loader">
          <div className="mb-intro__loader-fill" />
        </div>

        {/* doors */}
        <div className="mb-intro__door mb-intro__door--left" />
        <div className="mb-intro__door mb-intro__door--right" />
      </div>
    </>
  );
}
