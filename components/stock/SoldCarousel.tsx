'use client';

import { useState, useEffect, useCallback } from 'react';
import VehicleCard from './VehicleCard';
import type { Vehicle } from '@/types/vehicle';

export default function SoldCarousel({ vehicles }: { vehicles: Vehicle[] }) {
  const n = vehicles.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const advance = useCallback(() => {
    setIndex(i => (i + 1) % n);
  }, [n]);

  useEffect(() => {
    if (paused || n <= visibleCount) return;
    const t = setInterval(advance, 5000);
    return () => clearInterval(t);
  }, [paused, advance, n, visibleCount]);

  const goPrev = () => setIndex(i => (i - 1 + n) % n);
  const goNext = () => advance();

  const cardWidth = 100 / Math.min(visibleCount, n);
  const translateX = -(index * cardWidth);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ transform: `translateX(${translateX}%)` }}
        >
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              style={{ width: `${cardWidth}%`, flexShrink: 0 }}
              className="pr-[2px] last:pr-0"
            >
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </div>
      </div>

      {n > visibleCount && (
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
                onClick={() => setIndex(i)}
                className={`transition-all duration-300 rounded-full h-[3px] ${
                  i === index ? 'w-[20px] bg-gold' : 'w-[6px] bg-border hover:bg-text-3'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-[38px] h-[38px] border border-border flex items-center justify-center text-text-3 text-[16px] transition-all duration-300 hover:border-gold hover:text-gold hover:bg-[rgba(201,168,76,0.08)]"
            aria-label="Next"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
