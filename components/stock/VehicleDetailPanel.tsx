'use client';

import { useState } from 'react';
import type { Vehicle } from '@/types/vehicle';
import { formatKm } from '@/lib/utils';

type Tab = 'details' | 'features' | 'extras';

const SPEC_ROWS = [
  { key: 'year' as const, label: 'Year' },
  { key: 'kilometres' as const, label: 'Kilometres', format: (v: number) => formatKm(v) },
  { key: 'transmission' as const, label: 'Transmission' },
  { key: 'engine' as const, label: 'Engine' },
  { key: 'fuel_type' as const, label: 'Fuel Type' },
  { key: 'body_type' as const, label: 'Body Type' },
  { key: 'colour' as const, label: 'Colour' },
  { key: 'seats' as const, label: 'Seats' },
];

// Keyword lists drive the auto-categorisation of the flat features array
const SAFETY_KW = [
  'safety', 'airbag', 'srs', 'brake', 'abs', 'ebd', 'esp', 'asr',
  'traction', 'stability', 'collision', 'lane', 'blind spot', 'parking',
  'camera', 'sensor', 'alarm', 'immobilis', 'isofix', 'fcw', 'ldw',
  'eba', 'reverse',
];
const PERFORMANCE_KW = [
  'sport', 'turbo', 'supercharg', 'engine', 'power', 'torque',
  'awd', '4wd', '4x4', 'all-wheel', 'suspension', 'exhaust',
  'differential', 'drive mode', 'launch', 'aero', 'carbon',
  'paddle', 'intercool', 'performance',
];
const COMFORT_KW = [
  'leather', 'seat', 'climate', 'air con', 'heated', 'cooled',
  'ventilat', 'massage', 'sunroof', 'panoram', 'carplay', 'apple',
  'android', 'navigation', 'nav', 'bluetooth', 'audio', 'sound',
  'speaker', 'display', 'screen', 'wireless', 'usb', 'keyless',
  'cruise', 'entertainment', 'infotainment', 'memory', 'ambient',
];

function categorise(feature: string): 'safety' | 'performance' | 'comfort' | 'other' {
  const lower = feature.toLowerCase();
  if (SAFETY_KW.some((k) => lower.includes(k))) return 'safety';
  if (PERFORMANCE_KW.some((k) => lower.includes(k))) return 'performance';
  if (COMFORT_KW.some((k) => lower.includes(k))) return 'comfort';
  return 'other';
}

function CheckCircle() {
  return (
    <span className="flex-shrink-0 w-[22px] h-[22px] rounded-full border border-gold-lo flex items-center justify-center">
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
        <path
          d="M1 4L3.5 6.5L9 1"
          stroke="#b8963e"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function FeatureGroup({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-5 mb-2">
        <span className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold whitespace-nowrap">
          {title}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-[11px] border-b border-border">
            <CheckCircle />
            <span className="text-[13px] text-text-2">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'features', label: 'Features' },
  { id: 'extras', label: 'Optional Extras' },
];

export default function VehicleDetailPanel({ vehicle }: { vehicle: Vehicle }) {
  const [tab, setTab] = useState<Tab>('details');

  const features = vehicle.features ?? [];
  const safety = features.filter((f) => categorise(f) === 'safety');
  const performance = features.filter((f) => categorise(f) === 'performance');
  const comfort = [
    ...features.filter((f) => categorise(f) === 'comfort'),
    ...features.filter((f) => categorise(f) === 'other'),
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-border mb-8">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative font-mono-custom text-[9px] tracking-[0.3em] uppercase pb-[14px] mr-10 transition-colors ${
              tab === id ? 'text-gold' : 'text-text-3 hover:text-text-2'
            }`}
          >
            {label}
            {tab === id && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gold" />
            )}
          </button>
        ))}
      </div>

      {/* Details */}
      {tab === 'details' && (
        <div className="grid grid-cols-2 gap-[1px] bg-border">
          {SPEC_ROWS.map(({ key, label, format }) => {
            const raw = vehicle[key];
            if (raw == null) return null;
            const val = format
              ? (format as (v: typeof raw) => string)(raw as never)
              : String(raw);
            return (
              <div key={key} className="bg-bg-2 px-[18px] py-[14px]">
                <div className="font-mono-custom text-[8px] tracking-[0.22em] uppercase text-text-3 mb-1">
                  {label}
                </div>
                <div className="text-[13px] text-text">{val}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Features */}
      {tab === 'features' && (
        <div className="space-y-8">
          {features.length === 0 ? (
            <p className="font-mono-custom text-[10px] tracking-[0.18em] uppercase text-text-3">
              No features listed for this vehicle.
            </p>
          ) : (
            <>
              <FeatureGroup title="Safety & Braking" items={safety} />
              <FeatureGroup title="Performance & Dynamics" items={performance} />
              <FeatureGroup title="Comfort & Technology" items={comfort} />
            </>
          )}
        </div>
      )}

      {/* Optional Extras */}
      {tab === 'extras' && (
        <div className="space-y-4">
          {features.length === 0 ? (
            <p className="font-mono-custom text-[10px] tracking-[0.18em] uppercase text-text-3">
              No optional extras listed for this vehicle.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
              {features.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-[11px] border-b border-border">
                  <CheckCircle />
                  <span className="text-[13px] text-text-2">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
