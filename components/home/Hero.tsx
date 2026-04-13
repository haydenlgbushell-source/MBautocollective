'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CarSVG from '@/components/ui/CarSVG';
import { BUSINESS } from '@/lib/constants';

interface HeroProps {
  availableCount: number;
}

export default function Hero({ availableCount }: HeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 70% at 65% 40%, #1a160a 0%, #080807 65%)',
        }}
      />

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.035] noise-overlay pointer-events-none" />

      {/* Vertical divider line */}
      <div
        className="absolute top-0 bottom-0 w-px opacity-25 pointer-events-none"
        style={{
          left: '52%',
          background: 'linear-gradient(to bottom, transparent 0%, #7a641e 25%, #7a641e 75%, transparent 100%)',
        }}
      />

      {/* Car illustration */}
      <div className="absolute inset-0 flex items-center justify-end pr-[8%] pointer-events-none">
        <CarSVG width={600} opacity={0.07} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-[52px] max-w-[700px] max-md:px-6">
        {/* Tag */}
        <div className="flex items-center gap-[14px] mb-8">
          <div className="w-9 h-px bg-gold flex-shrink-0" />
          <span className="font-mono-custom text-[10px] tracking-[0.35em] uppercase text-gold">
            Prestige Pre-Owned · Waterloo, Sydney
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-display font-[300] leading-[0.93] tracking-[-0.01em] mb-7"
          style={{ fontSize: 'clamp(56px, 8vw, 100px)' }}
        >
          Buy. Sell.
          <br />
          <em className="block italic text-gold-hi">Drive.</em>
        </h1>

        {/* Body */}
        <p className="text-[15px] text-text-2 leading-[1.85] max-w-[460px] mb-12 border-l-2 border-gold-lo pl-5">
          MB Auto Collective prides itself on the best possible experience through trustworthy and
          reliable customer engagement. Sydney&apos;s premier destination for prestige and
          performance vehicles.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/stock"
            className="inline-flex items-center justify-center bg-gold text-bg font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[500] hover:bg-gold-hi transition-colors"
          >
            View Current Stock
          </Link>
          <Link
            href="/car-valuation"
            className="inline-flex items-center justify-center bg-transparent text-text-2 font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[300] border border-border-2 hover:border-gold-lo hover:text-gold transition-all"
          >
            Free Car Valuation
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute right-[52px] bottom-[56px] z-10 flex flex-col items-center gap-2 max-md:hidden">
        <div
          className="w-px h-12 animate-scrollpulse"
          style={{ background: 'linear-gradient(to bottom, #c9a84c, transparent)' }}
        />
        <span
          className="font-mono-custom text-[8px] tracking-[0.3em] uppercase text-text-3"
          style={{ writingMode: 'vertical-rl' }}
        >
          Scroll
        </span>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 flex border-t border-border max-md:grid max-md:grid-cols-2">
        {[
          [availableCount.toString(), 'Vehicles Available'],
          [BUSINESS.reviewCount.toString(), 'Google Reviews'],
          ['5★', 'Average Rating'],
          ['Waterloo', 'Sydney NSW'],
        ].map(([num, label]) => (
          <div
            key={label}
            className="flex-1 px-9 py-7 border-r border-border last:border-r-0 max-md:px-5 max-md:py-5"
          >
            <div className="font-display text-[38px] font-[300] text-gold leading-none">{num}</div>
            <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mt-[6px]">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
