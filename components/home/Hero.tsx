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

      {/* Luxury car illustration */}
      <div className="absolute inset-0 pointer-events-none max-md:hidden overflow-hidden">
        <div
          className="absolute"
          style={{
            right: 0, bottom: 0, left: '30%', top: '20%',
            background: 'radial-gradient(ellipse at 65% 80%, rgba(184,150,62,0.07) 0%, transparent 65%)',
          }}
        />
        <svg
          viewBox="0 0 1000 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ right: '-2%', bottom: '8%', width: '64%' }}
          aria-hidden
        >
          <defs>
            <linearGradient id="hBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b8963e" stopOpacity="0.2" />
              <stop offset="70%" stopColor="#b8963e" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#b8963e" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="hGlassGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af6a" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#b8963e" stopOpacity="0.05" />
            </linearGradient>
            <radialGradient id="hGroundGlow" cx="50%" cy="0%" r="80%">
              <stop offset="0%" stopColor="#b8963e" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#b8963e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hWheelGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#181818" />
              <stop offset="100%" stopColor="#0e0e0e" />
            </radialGradient>
            <radialGradient id="hHeadlight" cx="40%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#d4af6a" stopOpacity="1" />
              <stop offset="100%" stopColor="#b8963e" stopOpacity="0" />
            </radialGradient>
            <filter id="hGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="505" cy="344" rx="390" ry="12" fill="#000" fillOpacity="0.55" />
          {/* Ground gold glow */}
          <ellipse cx="505" cy="336" rx="370" ry="22" fill="url(#hGroundGlow)" />

          {/* Car body */}
          <path
            d="M 108,330
               C 90,328 75,307 73,279
               C 71,251 116,221 190,206
               C 256,192 280,189 308,189
               C 328,189 360,143 388,119
               C 401,107 445,99 500,97
               C 559,97 594,105 636,135
               C 663,154 683,187 702,208
               C 742,214 808,220 866,236
               C 893,246 910,273 904,330
               L 840,330 A 88,78 0 0 0 664,330
               L 316,330 A 77,74 0 0 0 162,330 Z"
            fill="url(#hBodyGrad)"
            stroke="#b8963e"
            strokeWidth="1.5"
            strokeOpacity="0.55"
          />

          {/* Window glass */}
          <path
            d="M 314,189
               C 336,189 364,146 390,121
               C 403,109 445,101 498,99
               C 557,99 592,107 632,135
               C 658,153 678,185 697,207
               L 658,205
               C 645,186 626,157 603,142
               C 572,123 544,117 498,117
               C 449,117 419,123 405,136
               C 391,149 370,181 354,189 Z"
            fill="url(#hGlassGrad)"
            stroke="#b8963e"
            strokeWidth="1"
            strokeOpacity="0.3"
          />

          {/* B-pillar */}
          <line x1="522" y1="99" x2="538" y2="207" stroke="#b8963e" strokeWidth="2" strokeOpacity="0.22" />

          {/* Door crease line */}
          <path d="M 315,190 C 380,250 580,265 695,210" stroke="#b8963e" strokeWidth="1" strokeOpacity="0.18" fill="none" strokeDasharray="4 6" />

          {/* Rocker panel */}
          <path d="M 165,316 L 838,316" stroke="#b8963e" strokeWidth="1" strokeOpacity="0.2" />

          {/* Headlight */}
          <ellipse cx="86" cy="260" rx="15" ry="9" fill="url(#hHeadlight)" filter="url(#hGlow)" />
          <ellipse cx="84" cy="260" rx="7" ry="5" fill="#d4af6a" fillOpacity="0.85" />
          <path d="M 100,255 L 140,248" stroke="#d4af6a" strokeWidth="0.8" strokeOpacity="0.25" />

          {/* Tail light */}
          <rect x="898" y="237" width="7" height="28" rx="2" fill="#b8963e" fillOpacity="0.65" />
          <rect x="899" y="239" width="4" height="24" rx="1" fill="#d4af6a" fillOpacity="0.45" />

          {/* Front wheel — center x=239 */}
          <circle cx="239" cy="330" r="76" fill="url(#hWheelGrad)" stroke="#b8963e" strokeWidth="1.5" strokeOpacity="0.45" />
          <circle cx="239" cy="330" r="56" fill="none" stroke="#b8963e" strokeWidth="0.8" strokeOpacity="0.2" />
          <line x1="239" y1="312" x2="239" y2="276" stroke="#b8963e" strokeWidth="2" strokeOpacity="0.38" />
          <line x1="256" y1="324" x2="290" y2="313" stroke="#b8963e" strokeWidth="2" strokeOpacity="0.38" />
          <line x1="250" y1="345" x2="271" y2="374" stroke="#b8963e" strokeWidth="2" strokeOpacity="0.38" />
          <line x1="228" y1="345" x2="207" y2="374" stroke="#b8963e" strokeWidth="2" strokeOpacity="0.38" />
          <line x1="222" y1="324" x2="188" y2="313" stroke="#b8963e" strokeWidth="2" strokeOpacity="0.38" />
          <circle cx="239" cy="330" r="18" fill="#b8963e" fillOpacity="0.12" stroke="#b8963e" strokeWidth="1.5" strokeOpacity="0.5" />
          <circle cx="239" cy="330" r="5" fill="#b8963e" fillOpacity="0.6" />

          {/* Rear wheel — center x=752 */}
          <circle cx="752" cy="330" r="76" fill="url(#hWheelGrad)" stroke="#b8963e" strokeWidth="1.5" strokeOpacity="0.45" />
          <circle cx="752" cy="330" r="56" fill="none" stroke="#b8963e" strokeWidth="0.8" strokeOpacity="0.2" />
          <line x1="752" y1="312" x2="752" y2="276" stroke="#b8963e" strokeWidth="2" strokeOpacity="0.38" />
          <line x1="769" y1="324" x2="803" y2="313" stroke="#b8963e" strokeWidth="2" strokeOpacity="0.38" />
          <line x1="763" y1="345" x2="784" y2="374" stroke="#b8963e" strokeWidth="2" strokeOpacity="0.38" />
          <line x1="741" y1="345" x2="720" y2="374" stroke="#b8963e" strokeWidth="2" strokeOpacity="0.38" />
          <line x1="735" y1="324" x2="701" y2="313" stroke="#b8963e" strokeWidth="2" strokeOpacity="0.38" />
          <circle cx="752" cy="330" r="18" fill="#b8963e" fillOpacity="0.12" stroke="#b8963e" strokeWidth="1.5" strokeOpacity="0.5" />
          <circle cx="752" cy="330" r="5" fill="#b8963e" fillOpacity="0.6" />
        </svg>
      </div>

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
