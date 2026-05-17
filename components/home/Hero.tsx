'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';
import styles from './Hero.module.css';

interface HeroProps {
  availableCount?: number;
}

interface Vehicle {
  make: string;
  model: string;
  year: number;
  status?: string;
  price?: number;
}

const FALLBACK: Vehicle[] = [
  { make: 'Bentley',      model: 'Continental GT', year: 2020 },
  { make: 'Porsche',      model: '911 Carrera S',  year: 2022 },
  { make: 'Aston Martin', model: 'Vantage',        year: 2021 },
  { make: 'Ferrari',      model: 'Roma',           year: 2023 },
  { make: 'Lamborghini',  model: 'Huracán',        year: 2022 },
  { make: 'Mercedes-AMG', model: 'GT 63 S',        year: 2023 },
];

export default function Hero({ availableCount }: HeroProps) {
  const ticksDRef = useRef<SVGGElement>(null);
  const ticksCRef = useRef<SVGGElement>(null);
  const ticksARef = useRef<SVGGElement>(null);
  const minor8Ref = useRef<SVGGElement>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>(FALLBACK);
  const [isLive, setIsLive] = useState(false);
  const [feedLabel, setFeedLabel] = useState('Connecting');
  const [feedState, setFeedState] = useState<'' | 'live' | 'error'>('');
  const [cursor, setCursor] = useState(0);

  // Generate SVG ticks once
  useEffect(() => {
    const ns = 'http://www.w3.org/2000/svg';
    const cx = 500, cy = 500;

    const buildTicks = (
      g: SVGGElement | null,
      count: number,
      r1: number,
      r2: number | ((i: number) => number),
      style: (i: number) => { w: number; o: number },
    ) => {
      if (!g) return;
      g.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        const r2v = typeof r2 === 'function' ? r2(i) : r2;
        const x1 = cx + Math.cos(a) * r1;
        const y1 = cy + Math.sin(a) * r1;
        const x2 = cx + Math.cos(a) * r2v;
        const y2 = cy + Math.sin(a) * r2v;
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', x1.toFixed(2));
        line.setAttribute('y1', y1.toFixed(2));
        line.setAttribute('x2', x2.toFixed(2));
        line.setAttribute('y2', y2.toFixed(2));
        line.setAttribute('stroke', '#b8963e');
        const s = style(i);
        line.setAttribute('stroke-width', String(s.w));
        line.setAttribute('opacity', String(s.o));
        g.appendChild(line);
      }
    };

    buildTicks(ticksDRef.current, 200, 470, 478, (i) => ({
      w: 1, o: i % 5 === 0 ? 0.6 : 0.25,
    }));
    buildTicks(
      ticksCRef.current,
      60,
      405,
      (i) => (i % 5 === 0 ? 430 : 418),
      (i) => ({
        w: i % 5 === 0 ? 1.5 : 1,
        o: i % 5 === 0 ? 0.95 : 0.45,
      }),
    );
    buildTicks(ticksARef.current, 120, 250, 258, (i) => ({
      w: 1, o: i % 4 === 0 ? 0.7 : 0.3,
    }));

    // 8-tick ring at 45° intervals (skip cardinals)
    const g8 = minor8Ref.current;
    if (g8) {
      g8.innerHTML = '';
      for (let i = 0; i < 8; i++) {
        if (i % 2 === 0) continue;
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const r1 = 308, r2 = 332;
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', (cx + Math.cos(a) * r1).toFixed(2));
        line.setAttribute('y1', (cy + Math.sin(a) * r1).toFixed(2));
        line.setAttribute('x2', (cx + Math.cos(a) * r2).toFixed(2));
        line.setAttribute('y2', (cy + Math.sin(a) * r2).toFixed(2));
        line.setAttribute('stroke', '#b8963e');
        line.setAttribute('stroke-width', '1');
        g8.appendChild(line);
      }
    }
  }, []);

  // Live inventory feed (best effort — falls back gracefully on CORS)
  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function load() {
      try {
        const res = await fetch('/api/vehicles', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Bad shape');
        const available: Vehicle[] = data
          .filter((v: Vehicle) => v && v.status === 'available')
          .map((v: Vehicle) => ({
            make: v.make,
            model: v.model,
            year: v.year,
            price: v.price,
          }));
        if (!available.length) throw new Error('No stock');
        if (cancelled) return;
        setVehicles(available);
        setIsLive(true);
        setFeedState('live');
        setFeedLabel('Live · ' + available.length + ' In Stock');
      } catch {
        if (cancelled) return;
        setFeedState('error');
        setFeedLabel('Offline · Cached');
      }
    }

    load();
    interval = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, []);

  // Cycle marque every 4s
  useEffect(() => {
    if (!vehicles.length) return;
    const t = setInterval(() => {
      setCursor((c) => (c + 1) % vehicles.length);
    }, 4000);
    return () => clearInterval(t);
  }, [vehicles.length]);

  const current = vehicles[cursor % vehicles.length];
  const stockCount = availableCount ?? vehicles.length;

  return (
    <main className={styles.page}>
      <span className={`${styles.vline} ${styles.vlineL}`}></span>
      <span className={`${styles.vline} ${styles.vlineR}`}></span>

      <section className={styles.hero}>
        {/* ─── Copy ─── */}
        <div className={styles.copy}>
          <div className={styles.eyebrow}>EST. 2012 · WATERLOO, SYDNEY</div>
          <h1 className={styles.headline}>
            Drive What
            <br />
            <em>Others Only</em>
            <br />
            Dream About.
          </h1>
          <p className={styles.lede}>
            Hand-selected luxury and performance vehicles, presented with the
            transparency and precision that discerning buyers deserve.
          </p>
          <div className={styles.ctas}>
            <Link href="/stock" className={`${styles.btn} ${styles.btnPrimary}`}>
              View Inventory
            </Link>
            <Link href="/sell" className={`${styles.btn} ${styles.btnOutline}`}>
              Get A Valuation
            </Link>
          </div>
          <div className={styles.meta}>
            <div className={styles.metaCell}>
              <div className={styles.metaK}>In Stock</div>
              <div className={styles.metaV}>
                {stockCount}
                <em>+</em>
              </div>
            </div>
            <div className={styles.metaCell}>
              <div className={styles.metaK}>{BUSINESS.reviewCount} × 5★ Reviews</div>
              <div className={styles.metaV}>
                5.0<em>★</em>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Animated artboard ─── */}
        <div className={styles.stage} aria-hidden="true">
          <span className={`${styles.corner} ${styles.cornerTL}`}></span>
          <span className={`${styles.corner} ${styles.cornerTR}`}></span>
          <span className={`${styles.corner} ${styles.cornerBL}`}></span>
          <span className={`${styles.corner} ${styles.cornerBR}`}></span>

          <svg viewBox="0 0 1000 1000">
            <defs>
              <radialGradient id="mbHeroGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"  stopColor="#b8963e" stopOpacity="0.16" />
                <stop offset="55%" stopColor="#b8963e" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#b8963e" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="mbHeroSweep" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%"   stopColor="#d4af6a" stopOpacity="0" />
                <stop offset="55%"  stopColor="#d4af6a" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#d4af6a" stopOpacity="1" />
              </linearGradient>
            </defs>

            <circle cx="500" cy="500" r="460" fill="url(#mbHeroGlow)" />

            <g className={styles.ringSpinD} stroke="#b8963e" strokeWidth="1" opacity="0.22">
              <g ref={ticksDRef}></g>
            </g>
            <g className={styles.ringSpinC} opacity="0.55">
              <g ref={ticksCRef}></g>
            </g>
            <g className={styles.ringSpinB}>
              <circle cx="500" cy="500" r="320" fill="none" stroke="#7a6428" strokeWidth="1" opacity="0.7" />
              <g stroke="#b8963e" strokeWidth="1.5" opacity="0.85">
                <line x1="500" y1="170" x2="500" y2="200" />
                <line x1="830" y1="500" x2="800" y2="500" />
                <line x1="500" y1="830" x2="500" y2="800" />
                <line x1="170" y1="500" x2="200" y2="500" />
              </g>
              <g ref={minor8Ref} stroke="#b8963e" strokeWidth="1" opacity="0.5"></g>
            </g>
            <g className={styles.ringSpinA} opacity="0.7">
              <g ref={ticksARef}></g>
            </g>

            <g className={styles.sweep}>
              <path
                d="M 500 230 A 270 270 0 0 1 770 500"
                fill="none"
                stroke="url(#mbHeroSweep)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            <g className={styles.orbitDot}>
              <circle cx="500" cy="170" r="3.5" fill="#d4af6a" />
              <circle cx="500" cy="170" r="9" fill="none" stroke="#d4af6a" strokeWidth="1" opacity="0.4" />
            </g>

            <g className={styles.ringPulse}>
              <circle cx="500" cy="500" r="220" fill="none" stroke="#b8963e" strokeWidth="1.5" opacity="0.85" />
              <circle cx="500" cy="500" r="232" fill="none" stroke="#b8963e" strokeWidth="0.5" opacity="0.3" />
            </g>

            <g stroke="#b8963e" strokeWidth="0.8" opacity="0.35">
              <line x1="500" y1="278" x2="500" y2="295" />
              <line x1="500" y1="705" x2="500" y2="722" />
              <line x1="278" y1="500" x2="295" y2="500" />
              <line x1="705" y1="500" x2="722" y2="500" />
            </g>

            <circle cx="500" cy="500" r="2" fill="#d4af6a" />
          </svg>

          <div className={styles.marqueStack}>
            <div className={styles.marqueInner}>
              <div className={styles.marqueEyebrow}>— Now Showing —</div>
              <div className={styles.marque} aria-live="polite" aria-atomic="true">
                <div key={cursor} className={styles.slide}>
                  <div className={styles.make}>{current?.make ?? '—'}</div>
                  <div className={styles.model}>
                    {[current?.model, current?.year].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
              <div className={styles.marqueTag}>
                {isLive
                  ? `${vehicles.length} Hand-Selected · Sydney`
                  : 'Curated Selection · Sydney'}
              </div>
            </div>
          </div>

          <div
            className={`${styles.feedStatus} ${
              feedState === 'live' ? styles.feedLive : feedState === 'error' ? styles.feedError : ''
            }`}
          >
            <span className={styles.feedDot}></span>
            <span>{feedLabel}</span>
          </div>

          <div className={styles.stageMeta}>
            <span>33° 54′ S · 151° 12′ E</span>
            <span>MB · 081672</span>
          </div>
        </div>
      </section>
    </main>
  );
}
