'use client';

import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';

interface HeroProps {
  availableCount: number;
}

export default function Hero({ availableCount }: HeroProps) {
  return (
    <section
      className="relative flex flex-col justify-end overflow-hidden"
      style={{ height: '100vh', minHeight: 700 }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 60% 40%, rgba(184,150,62,0.06) 0%, transparent 60%),
            linear-gradient(160deg, #0a0a0a 0%, #111 50%, #0f0d0a 100%)
          `,
        }}
      />

      {/* Animated vertical gold lines */}
      <div className="absolute inset-0 overflow-hidden" style={{ opacity: 0.15 }}>
        <div className="hero-line-v" style={{ left: '30%' }} />
        <div
          className="hero-line-v"
          style={{ left: '65%', animationDuration: '12s', animationDirection: 'reverse' }}
        />
      </div>

      {/* Abstract car silhouette */}
      <svg
        viewBox="0 0 800 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute pointer-events-none max-md:hidden"
        style={{ right: '-5%', bottom: '10%', width: '65%', opacity: 0.04 }}
        aria-hidden
      >
        <path
          d="M50 200 C100 200 150 160 250 140 C320 125 380 110 450 108 C540 106 600 125 700 160 L740 175 L750 200 Z"
          fill="white"
        />
        <path
          d="M200 140 C220 100 270 70 380 65 C480 60 560 80 620 140"
          fill="white"
        />
        <circle cx="200" cy="215" r="40" fill="white" />
        <circle cx="600" cy="215" r="40" fill="white" />
      </svg>

      {/* Hero content — bottom aligned, fades up */}
      <div
        className="relative z-10 px-[60px] pb-[80px] max-w-[700px] animate-fadeup max-md:px-6 max-md:pb-[140px]"
      >
        {/* Eyebrow */}
        <div className="flex items-center gap-[16px] mb-[20px]">
          <div className="w-10 h-px bg-gold flex-shrink-0" />
          <span className="font-mono-custom text-[10px] tracking-[0.35em] uppercase text-gold">
            Sydney&apos;s Finest Pre-Owned
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-display font-[300] leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(52px, 6vw, 88px)', letterSpacing: '-0.01em' }}
        >
          Drive What
          <br />
          <em className="italic text-gold-hi">Others Only</em>
          <br />
          Dream About.
        </h1>

        {/* Sub */}
        <p
          className="font-body text-[13px] text-text-2 leading-[1.8] max-w-[420px] mb-[44px]"
          style={{ letterSpacing: '0.04em' }}
        >
          Hand-selected luxury and performance vehicles, presented with the transparency and
          precision that discerning buyers deserve.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-[16px]">
          <Link
            href="/stock"
            className="inline-flex items-center bg-gold text-bg font-body text-[10px] font-[600] tracking-[0.25em] uppercase px-9 py-[16px] hover:bg-gold-hi transition-all hover:-translate-y-px no-underline"
          >
            View Inventory
          </Link>
          <Link
            href="/car-valuation"
            className="inline-flex items-center bg-transparent text-text font-body text-[10px] font-[400] tracking-[0.25em] uppercase px-9 py-[16px] border hover:border-gold hover:text-gold transition-all no-underline"
            style={{ borderColor: 'rgba(245,242,237,0.25)' }}
          >
            Get a Valuation
          </Link>
        </div>
      </div>

      {/* Stats bar — bottom of hero, fades up with delay */}
      <div
        className="relative z-10 grid grid-cols-2 md:grid-cols-4 animate-fadeup-delayed"
        style={{ borderTop: '1px solid rgba(184,150,62,0.25)', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(20px)' }}
      >
        {[
          [availableCount > 0 ? availableCount.toString() : '47', 'Vehicles In Stock'],
          ['11+', 'Years Experience'],
          [BUSINESS.reviewScore + '★', 'Google Rating'],
          ['100%', 'Finance Available'],
        ].map(([num, label]) => (
          <div
            key={label}
            className="group px-0 py-7 border-r last:border-r-0 text-center transition-colors duration-300"
            style={{ borderColor: 'rgba(184,150,62,0.25)' }}
          >
            <div className="font-display text-[36px] font-[300] text-gold leading-none mb-[6px]">
              {num}
            </div>
            <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
