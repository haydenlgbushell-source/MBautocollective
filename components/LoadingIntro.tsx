'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ── Sequence ──────────────────────────────────────────────────────
// 0.0–1.4s  hairlines + corner ticks + mono meta strips draw in
// 1.2–2.6s  MB monogram traces, AUTO COLLECTIVE letter-spaces in
// 2.9–4.6s  Buy. · Sell. · Trade. pillars rise in sequence
// 4.7–6.0s  five stars pop, review counter ticks 84 → reviewsCount
// 7.2s      doors wipe in, overlay unmounts
// ─────────────────────────────────────────────────────────────────

const TOTAL_MS = 7200;
const START_COUNT = 84;

const CSS = `
.mb-intro {
  position: fixed;
  inset: 0;
  z-index: 9995;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
}

/* ── hairlines ─────────────────────────────────── */
.mb-intro__hl {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--gold);
  opacity: 0.35;
  transform: scaleX(0);
  transform-origin: left center;
  animation: mb-scalex 0.9s cubic-bezier(0.4,0,0.2,1) forwards;
}
.mb-intro__hl--top { top: 11%;    animation-delay: 0.1s; }
.mb-intro__hl--bot { bottom: 11%; animation-delay: 0.3s; }
@keyframes mb-scalex {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

/* ── corner ticks ──────────────────────────────── */
.mb-intro__corner {
  position: absolute;
  width: 26px;
  height: 26px;
  opacity: 0;
  animation: mb-fadein 0.5s ease forwards;
}
.mb-intro__corner--tl { top: 6%;    left: 4%;  border-top: 1px solid var(--gold);    border-left: 1px solid var(--gold);   animation-delay: 0.5s; }
.mb-intro__corner--tr { top: 6%;    right: 4%; border-top: 1px solid var(--gold);    border-right: 1px solid var(--gold);  animation-delay: 0.6s; }
.mb-intro__corner--bl { bottom: 6%; left: 4%;  border-bottom: 1px solid var(--gold); border-left: 1px solid var(--gold);   animation-delay: 0.7s; }
.mb-intro__corner--br { bottom: 6%; right: 4%; border-bottom: 1px solid var(--gold); border-right: 1px solid var(--gold);  animation-delay: 0.8s; }

/* ── meta strips ───────────────────────────────── */
.mb-intro__meta {
  position: absolute;
  font-family: var(--fm);
  font-size: 8px;
  letter-spacing: 0.18em;
  color: var(--gold);
  text-transform: uppercase;
  opacity: 0;
  animation: mb-fadein 0.5s ease forwards;
}
.mb-intro__meta--tl { top: 6%;    left: 4%;  padding-top: 10px;    animation-delay: 0.9s; }
.mb-intro__meta--tr { top: 6%;    right: 4%; padding-top: 10px;    animation-delay: 1.0s; text-align: right; }
.mb-intro__meta--bl { bottom: 6%; left: 4%;  padding-bottom: 10px; animation-delay: 1.1s; }
.mb-intro__meta--br { bottom: 6%; right: 4%; padding-bottom: 10px; animation-delay: 1.2s; text-align: right; }
@keyframes mb-fadein { to { opacity: 1; } }

/* ── center container ──────────────────────────── */
.mb-intro__center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── MB monogram SVG ───────────────────────────── */
.mb-intro__mono {
  width: 140px;
  height: 90px;
  overflow: visible;
}
.mb-intro__mono path,
.mb-intro__mono line {
  fill: none;
  stroke: var(--gold);
  stroke-linecap: round;
  stroke-linejoin: round;
}
/* M traces first, then B stem → top bump → bottom bump */
.mb-intro__mono-m {
  stroke-width: 2;
  stroke-dasharray: 270;
  stroke-dashoffset: 270;
  animation: mb-trace 0.8s ease forwards;
  animation-delay: 1.2s;
}
.mb-intro__mono-bstem {
  stroke-width: 2;
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: mb-trace 0.3s ease forwards;
  animation-delay: 2.1s;
}
.mb-intro__mono-btop {
  stroke-width: 2;
  stroke-dasharray: 165;
  stroke-dashoffset: 165;
  animation: mb-trace 0.45s ease forwards;
  animation-delay: 2.35s;
}
.mb-intro__mono-bbot {
  stroke-width: 2;
  stroke-dasharray: 175;
  stroke-dashoffset: 175;
  animation: mb-trace 0.45s ease forwards;
  animation-delay: 2.7s;
}
.mb-intro__mono-div {
  stroke-width: 0.5;
  opacity: 0;
  animation: mb-fadein 0.3s ease forwards;
  animation-delay: 2.5s;
}
@keyframes mb-trace { to { stroke-dashoffset: 0; } }

/* ── AUTO COLLECTIVE wordmark ──────────────────── */
.mb-intro__wordmark {
  font-family: var(--fb);
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.06em;
  color: var(--text);
  text-transform: uppercase;
  margin: 14px 0 0;
  opacity: 0;
  animation: mb-wordmark 0.85s ease forwards;
  animation-delay: 2.1s;
}
@keyframes mb-wordmark {
  from { opacity: 0; letter-spacing: 0.06em; }
  to   { opacity: 1; letter-spacing: 0.42em; }
}

/* ── pillars ───────────────────────────────────── */
.mb-intro__pillars {
  display: flex;
  gap: 40px;
  margin-top: 48px;
  align-items: flex-start;
}
.mb-intro__pillar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  opacity: 0;
  transform: translateY(28px);
  animation: mb-rise 0.55s cubic-bezier(0.34,1.4,0.64,1) forwards;
}
.mb-intro__pillar--1 { animation-delay: 2.9s; }
.mb-intro__pillar--2 { animation-delay: 3.5s; }
.mb-intro__pillar--3 { animation-delay: 4.1s; }
@keyframes mb-rise { to { opacity: 1; transform: translateY(0); } }

.mb-intro__rule {
  display: block;
  width: 1px;
  height: 42px;
  background: var(--gold);
  transform: scaleY(0);
  transform-origin: top center;
  animation: mb-scaley 0.4s ease forwards;
}
.mb-intro__pillar--1 .mb-intro__rule { animation-delay: 2.9s; }
.mb-intro__pillar--2 .mb-intro__rule { animation-delay: 3.5s; }
.mb-intro__pillar--3 .mb-intro__rule { animation-delay: 4.1s; }
@keyframes mb-scaley { to { transform: scaleY(1); } }

.mb-intro__word {
  font-family: var(--fd);
  font-size: 30px;
  font-weight: 300;
  color: var(--text);
  white-space: nowrap;
}
.mb-intro__word--italic {
  font-style: italic;
  color: var(--gold);
}

/* ── reviews ───────────────────────────────────── */
.mb-intro__reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-top: 50px;
  opacity: 0;
  animation: mb-fadein 0.4s ease forwards;
  animation-delay: 4.7s;
}
.mb-intro__stars { display: flex; gap: 3px; }
.mb-intro__star {
  display: inline-block;
  color: var(--gold);
  font-size: 18px;
  line-height: 1;
  opacity: 0;
  transform: scale(0.3);
  animation: mb-starpop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
}
.mb-intro__star--1 { animation-delay: 4.78s; }
.mb-intro__star--2 { animation-delay: 4.90s; }
.mb-intro__star--3 { animation-delay: 5.02s; }
.mb-intro__star--4 { animation-delay: 5.14s; }
.mb-intro__star--5 { animation-delay: 5.26s; }
@keyframes mb-starpop { to { opacity: 1; transform: scale(1); } }

.mb-intro__count {
  font-family: var(--fm);
  font-size: 22px;
  color: var(--gold);
  letter-spacing: 0.06em;
  line-height: 1;
  margin-top: 3px;
}
.mb-intro__proof {
  font-family: var(--fb);
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(245,242,237,0.55);
  margin: 0;
}
.mb-intro__proof em {
  font-style: italic;
  font-family: var(--fd);
  font-size: 13px;
  font-weight: 400;
  color: var(--text);
  letter-spacing: 0.04em;
}

/* ── doors ─────────────────────────────────────── */
.mb-intro__door {
  position: absolute;
  top: 0;
  height: 100%;
  width: 51%;
  background: var(--bg);
  pointer-events: none;
  z-index: 1;
}
.mb-intro__door--l {
  left: 0;
  transform: translateX(-101%);
  transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
}
.mb-intro__door--r {
  right: 0;
  transform: translateX(101%);
  transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
}
.mb-intro--closing .mb-intro__door--l { transform: translateX(0); }
.mb-intro--closing .mb-intro__door--r { transform: translateX(0); }
`;

interface Props {
  alwaysPlay?: boolean;
  reviewsCount?: number;
}

export default function LoadingIntro({ alwaysPlay = false, reviewsCount = 126 }: Props) {
  const [visible, setVisible]   = useState(false);
  const [done, setDone]         = useState(false);
  const [count, setCount]       = useState(START_COUNT);
  const [closing, setClosing]   = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    try { sessionStorage.setItem('mb-intro-played', '1'); } catch { /* private browsing */ }
    document.body.style.overflow = '';
    setClosing(true);
    const t = setTimeout(() => setDone(true), 550);
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
        const p = Math.min((Date.now() - t0) / 1300, 1);
        setCount(Math.round(START_COUNT + range * (1 - (1 - p) ** 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 4700);

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
        {/* hairlines */}
        <span className="mb-intro__hl mb-intro__hl--top" />
        <span className="mb-intro__hl mb-intro__hl--bot" />

        {/* corner ticks */}
        <span className="mb-intro__corner mb-intro__corner--tl" />
        <span className="mb-intro__corner mb-intro__corner--tr" />
        <span className="mb-intro__corner mb-intro__corner--bl" />
        <span className="mb-intro__corner mb-intro__corner--br" />

        {/* meta strips */}
        <span className="mb-intro__meta mb-intro__meta--tl">MB Auto Collective</span>
        <span className="mb-intro__meta mb-intro__meta--tr">Est. Sydney NSW</span>
        <span className="mb-intro__meta mb-intro__meta--bl">Prestige Pre-Owned</span>
        <span className="mb-intro__meta mb-intro__meta--br">mbautocollective.com</span>

        {/* center lockup */}
        <div className="mb-intro__center">
          {/* MB monogram — M and B traced sequentially via stroke-dashoffset */}
          <svg
            className="mb-intro__mono"
            viewBox="0 0 160 80"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path className="mb-intro__mono-m"     d="M5 70 L5 10 L35 50 L65 10 L65 70" />
            <path className="mb-intro__mono-bstem" d="M85 10 L85 70" />
            <path className="mb-intro__mono-btop"  d="M85 10 L108 10 C126 10 130 20 130 28 C130 36 126 40 108 40 L85 40" />
            <path className="mb-intro__mono-bbot"  d="M85 40 L112 40 C133 40 138 50 138 58 C138 66 133 70 112 70 L85 70" />
            <line className="mb-intro__mono-div"   x1="75" y1="5" x2="75" y2="75" />
          </svg>

          <p className="mb-intro__wordmark">Auto Collective</p>

          {/* pillars */}
          <div className="mb-intro__pillars">
            <div className="mb-intro__pillar mb-intro__pillar--1">
              <span className="mb-intro__rule" />
              <span className="mb-intro__word">Buy.</span>
            </div>
            <div className="mb-intro__pillar mb-intro__pillar--2">
              <span className="mb-intro__rule" />
              <span className="mb-intro__word">Sell.</span>
            </div>
            <div className="mb-intro__pillar mb-intro__pillar--3">
              <span className="mb-intro__rule" />
              <span className="mb-intro__word mb-intro__word--italic">Trade.</span>
            </div>
          </div>

          {/* reviews */}
          <div className="mb-intro__reviews">
            <div className="mb-intro__stars">
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={`mb-intro__star mb-intro__star--${i}`}>★</span>
              ))}
            </div>
            <span className="mb-intro__count">{count}+</span>
            <p className="mb-intro__proof">
              Five-Star <em>Google Reviews</em>
            </p>
          </div>
        </div>

        {/* doors */}
        <span className="mb-intro__door mb-intro__door--l" />
        <span className="mb-intro__door mb-intro__door--r" />
      </div>
    </>
  );
}
