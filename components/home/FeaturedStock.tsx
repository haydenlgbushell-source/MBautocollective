'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Vehicle } from '@/types/vehicle';
import VehicleCard from '@/components/stock/VehicleCard';

interface FeaturedStockProps {
  vehicles: Vehicle[];
}

export default function FeaturedStock({ vehicles }: FeaturedStockProps) {
  if (vehicles.length === 0) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const advance = useCallback(() => {
    setActiveIndex((i: number) => (i + 1) % vehicles.length);
  }, [vehicles.length]);

  useEffect(() => {
    if (paused || vehicles.length < 2) return;
    const t = setInterval(advance, 5000);
    return () => clearInterval(t);
  }, [paused, advance, vehicles.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i: number) => (i - 1 + vehicles.length) % vehicles.length);
  }, [vehicles.length]);

  return (
    <section className="px-[52px] py-24 max-md:px-6 max-md:py-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-[52px] max-md:flex-col max-md:items-start max-md:gap-5">
        <div>
          <div className="flex items-center gap-3 mb-[14px]">
            <div className="w-7 h-px bg-gold" />
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold">
              Current Stock
            </div>
          </div>
          <h2
            className="font-display font-[300] leading-[1.02]"
            style={{ fontSize: 'clamp(26px, 4.5vw, 58px)' }}
          >
            Featured <em className="italic text-gold-hi">Vehicles</em>
          </h2>
        </div>

        <div className="flex items-center gap-5">
          <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3 max-md:hidden">
            {vehicles.length} available
          </div>
          <Link
            href="/stock"
            className="group inline-flex items-center gap-3 font-body text-[11px] tracking-[0.2em] uppercase text-text-2 hover:text-gold transition-colors no-underline"
          >
            View All Stock
            <span className="w-[28px] h-[28px] border border-border-2 flex items-center justify-center text-[12px] transition-all duration-200 group-hover:border-gold-lo group-hover:text-gold">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex gap-[2px] items-start overflow-hidden">
          {vehicles.map((vehicle, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={vehicle.id}
                className={`relative transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  isActive ? '' : 'max-md:hidden'
                }`}
                style={{ flex: isActive ? '2.5 0 0%' : '1 0 0%' }}
              >
                <VehicleCard vehicle={vehicle} featured={isActive} />
                {/* Overlay on inactive cards to intercept clicks and select instead of navigate */}
                {!isActive && (
                  <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={() => setActiveIndex(i)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        {vehicles.length > 1 && (
          <div className="flex items-center justify-between mt-6 px-1">
            <button
              onClick={goPrev}
              className="w-[38px] h-[38px] border border-border flex items-center justify-center text-text-3 text-[16px] transition-all duration-300 hover:border-gold hover:text-gold hover:bg-[rgba(201,168,76,0.08)]"
              aria-label="Previous"
            >
              ←
            </button>

            <div className="flex items-center gap-[8px]">
              {vehicles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`transition-all duration-300 rounded-full h-[3px] ${
                    i === activeIndex ? 'w-[20px] bg-gold' : 'w-[6px] bg-border hover:bg-text-3'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={advance}
              className="w-[38px] h-[38px] border border-border flex items-center justify-center text-text-3 text-[16px] transition-all duration-300 hover:border-gold hover:text-gold hover:bg-[rgba(201,168,76,0.08)]"
              aria-label="Next"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
