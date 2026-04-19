'use client';

import { useState, useEffect, useCallback } from 'react';
import VehicleCard from './VehicleCard';
import type { Vehicle } from '@/types/vehicle';

export default function SoldCarousel({ vehicles }: { vehicles: Vehicle[] }) {
  const n = vehicles.length;
  // Double the list so we can always scroll forward seamlessly
  const track = n > 1 ? [...vehicles, ...vehicles] : vehicles;

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
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

  // After the transition to index n, silently reset to 0
  useEffect(() => {
    if (index < n) return;
    const t = setTimeout(() => {
      setAnimate(false);
      setIndex(index - n);
    }, 700);
    return () => clearTimeout(t);
  }, [index, n]);

  useEffect(() => {
    if (animate) return;
    const t = setTimeout(() => setAnimate(true), 32);
    return () => clearTimeout(t);
  }, [animate]);

  const advance = useCallback(() => {
    setIndex(i => i + 1);
  }, []);

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setInterval(advance, 5000);
    return () => clearInterval(t);
  }, [paused, advance, n]);

  const goPrev = useCallback(() => {
    if (index === 0) {
      // Jump to the mirrored position in the second copy, then animate back one
      setAnimate(false);
      setIndex(n);
      setTimeout(() => {
        setAnimate(true);
        setIndex(n - 1);
      }, 32);
    } else {
      setIndex(i => i - 1);
    }
  }, [index, n]);

  const cardWidth = 100 / Math.min(visibleCount, n);
  const dotIndex = index % n;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(${-(index * cardWidth)}%)`,
            transition: animate ? 'transform 700ms cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
          }}
        >
          {track.map((vehicle, i) => (
            <div
              key={`${i}-${vehicle.id}`}
              style={{ width: `${cardWidth}%`, flexShrink: 0 }}
              className="pr-[2px] last:pr-0"
            >
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </div>
      </div>

      {n > 1 && (
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
                  i === dotIndex ? 'w-[20px] bg-gold' : 'w-[6px] bg-border hover:bg-text-3'
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
  );
}
