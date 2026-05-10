'use client';

import { useState, useEffect } from 'react';
import type { Vehicle } from '@/types/vehicle';
import { formatPrice, formatKm } from '@/lib/utils';
import SocialPackCard from '@/components/admin/SocialPackCard';

export default function SocialPackPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vehicles')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setVehicles(data as Vehicle[]);
          if (data.length > 0) setSelected(data[0] as Vehicle);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-12 py-12 max-md:px-6">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <h1 className="font-display text-[36px] font-[300]">
          Social <em className="italic text-gold-hi">Pack</em>
        </h1>
        <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3">
          Platform-ready content for every vehicle
        </div>
      </div>

      {/* Vehicle selector */}
      <div className="mb-8">
        <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-3">
          Select Vehicle
        </div>
        {loading ? (
          <div className="bg-bg-2 border border-border px-4 py-3 text-text-3 text-[12px]">
            Loading vehicles…
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-bg-2 border border-border px-4 py-5 text-text-3 text-[12px] text-center">
            No vehicles found. Add a vehicle to generate social content.
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {vehicles.map((v) => {
              const label = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;
              const isActive = selected?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className={`flex flex-col text-left px-4 py-3 border transition-all ${
                    isActive
                      ? 'border-gold bg-gold-dim text-text'
                      : 'border-border text-text-2 hover:border-gold-lo hover:text-text'
                  }`}
                >
                  <span className="font-body text-[10px] tracking-[0.12em] uppercase">{label}</span>
                  <span
                    className={`font-mono-custom text-[9px] mt-[2px] ${isActive ? 'text-gold' : 'text-text-3'}`}
                  >
                    {formatPrice(v.price)}
                    {v.kilometres ? ` · ${formatKm(v.kilometres)}` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Social pack card */}
      {selected ? (
        <div className="bg-bg-2 border border-border p-8 max-md:p-5">
          <div className="flex items-baseline gap-3 mb-8 flex-wrap">
            <h2 className="font-display text-[28px] font-[300]">
              {selected.year} {selected.make}{' '}
              <em className="italic text-gold-hi">{selected.model}</em>
              {selected.variant ? ` ${selected.variant}` : ''}
            </h2>
            <span className="font-mono-custom text-[10px] tracking-[0.2em] text-text-3 uppercase">
              {formatPrice(selected.price)}
              {selected.kilometres ? ` · ${formatKm(selected.kilometres)}` : ''}
            </span>
          </div>
          <SocialPackCard vehicle={selected} />
        </div>
      ) : !loading && vehicles.length === 0 ? null : null}
    </div>
  );
}
