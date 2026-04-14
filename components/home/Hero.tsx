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
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 110% 80% at 60% 35%, #1c1608 0%, #07070a 60%)',
        }}
      />

      {/* Animated grain overlay */}
      <div
        className="noise-overlay noise-animate pointer-events-none absolute"
        style={{
          inset: '-10%',
          width: '120%',
          height: '120%',
          opacity: 0.045,
        }}
      />

      {/* Vertical divider line */}
      <div
        className="absolute top-0 bottom-0 w-px pointer-events-none"
        style={{
          left: '52%',
          background: 'linear-gradient(to bottom, transparent 0%, #7a641e 20%, #7a641e 80%, transparent 100%)',
          opacity: 0.2,
        }}
      />

      {/* Horizontal accent at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(to right, transparent 0%, #7a641e 30%, #7a641e 70%, transparent 100%)',
          opacity: 0.3,
        }}
      />

      {/* Car illustration */}
      <div className="absolute inset-0 flex items-center justify-end pr-[6%] pointer-events-none">
        <CarSVG width={620} opacity={0.055} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-[52px] max-w-[680px] max-md:px-6">
        {/* Tag line */}
        <div
          className="flex items-center gap-[14px] mb-9"
          style={mounted ? { opacity: 1, transition: 'opacity 0.6s ease 0.1s' } : { opacity: 0 }}
        >
          <div className="w-9 h-px bg-gold flex-shrink-0" />
          <span className="font-mono-custom text-[10px] tracking-[0.35em] uppercase text-gold">
            Prestige Pre-Owned · Waterloo, Sydney
          </span>
        </div>

        {/* Title — per-line slide-up */}
        <h1
          className="font-display font-[300] leading-[0.93] tracking-[-0.01em] mb-8"
          style={{ fontSize: 'clamp(58px, 8vw, 104px)' }}
        >
          <span className="hero-line-wrap">
            <span
              className="hero-line"
              style={{ animationDelay: '0.15s' }}
            >
              Buy. Sell.
            </span>
          </span>
          <span className="hero-line-wrap">
            <em
              className="hero-line block italic text-gold-hi"
              style={{ animationDelay: '0.35s' }}
            >
              Drive.
            </em>
          </span>
        </h1>

        {/* Body */}
        <p
          className="text-[15px] text-text-2 leading-[1.85] max-w-[440px] mb-12 border-l-2 border-gold-lo pl-5"
          style={mounted ? { opacity: 1, transition: 'opacity 0.8s ease 0.6s' } : { opacity: 0 }}
        >
          MB Auto Collective prides itself on the best possible experience through trustworthy and
          reliable customer engagement. Sydney&apos;s premier destination for prestige and
          performance vehicles.
        </p>

        {/* Actions */}
        <div
          className="flex flex-wrap gap-4"
          style={mounted ? { opacity: 1, transition: 'opacity 0.8s ease 0.8s' } : { opacity: 0 }}
        >
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
      <div className="absolute right-[52px] bottom-[100px] z-10 flex flex-col items-center gap-2 max-md:hidden">
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
            className="group flex-1 px-9 py-7 border-r border-border last:border-r-0 max-md:px-5 max-md:py-5 relative overflow-hidden transition-colors duration-300 hover:bg-[rgba(201,168,76,0.04)]"
          >
            <div
              className="absolute bottom-0 left-0 right-0 h-px bg-gold-lo transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"
            />
            <div className="font-display text-[36px] font-[300] text-gold leading-none">{num}</div>
            <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mt-[6px]">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
