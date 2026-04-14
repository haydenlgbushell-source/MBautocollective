'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MAKES = [
  'All Makes', 'BMW', 'Mercedes-Benz', 'Porsche', 'Audi',
  'Lamborghini', 'Ferrari', 'Maserati', 'Lexus', 'Jaguar',
];

const BUDGETS = [
  { label: 'Any Price', value: '' },
  { label: 'Under $80K',       value: 'under-80' },
  { label: '$80K – $150K',     value: '80-150' },
  { label: '$150K – $300K',    value: '150-300' },
  { label: '$300K+',           value: 'over-300' },
];

const BODY_TYPES = [
  'All Types', 'Sedan', 'Coupe', 'SUV', 'Convertible', 'Wagon', 'Hatchback',
];

const FILTER_TAGS = [
  { label: 'All',             param: '' },
  { label: 'Under 20,000 km', param: 'low-km' },
  { label: 'Recent Arrivals', param: 'recent' },
  { label: 'AMG / M Sport',   param: '' },
  { label: 'Convertibles',    bodyType: 'Convertible' },
  { label: 'Under $100K',     param: 'budget' },
  { label: 'Finance Ready',   param: '' },
];

export default function SearchSection() {
  const router = useRouter();
  const [search, setSearch]   = useState('');
  const [make, setMake]       = useState('All Makes');
  const [bodyType, setBodyType] = useState('All Types');
  const [activeTag, setActiveTag] = useState('All');

  const buildSearch = (overrides?: { make?: string; bodyType?: string; q?: string }) => {
    const params = new URLSearchParams();
    const m = overrides?.make     ?? make;
    const b = overrides?.bodyType ?? bodyType;
    const q = overrides?.q        ?? search;
    if (q)                             params.set('q', q);
    if (m && m !== 'All Makes')        params.set('make', m);
    if (b && b !== 'All Types')        params.set('body_type', b);
    router.push(`/stock${params.size ? '?' + params.toString() : ''}`);
  };

  const handleTagClick = (tag: typeof FILTER_TAGS[number]) => {
    setActiveTag(tag.label);
    const params = new URLSearchParams();
    if ('bodyType' in tag && tag.bodyType) params.set('body_type', tag.bodyType);
    router.push(`/stock${params.size ? '?' + params.toString() : ''}`);
  };

  return (
    <section
      className="px-[60px] py-[80px] border-b max-md:px-6 max-md:py-12"
      style={{ background: '#1c1c1e', borderColor: 'rgba(184,150,62,0.2)' }}
    >
      {/* Label */}
      <div className="flex items-center gap-[16px] mb-9">
        <span className="font-mono-custom text-[10px] tracking-[0.3em] uppercase text-gold">
          Find Your Vehicle
        </span>
        <div className="h-px w-[80px]" style={{ background: 'rgba(184,150,62,0.3)' }} />
      </div>

      {/* Filter bar */}
      <div
        className="grid gap-[1px] mb-8 max-lg:grid-cols-1"
        style={{
          gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
          background: 'rgba(184,150,62,0.2)',
        }}
      >
        {/* Search input */}
        <div className="bg-bg-3 px-6 py-5">
          <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3 mb-[6px]">
            Search
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buildSearch()}
            placeholder="e.g. Porsche 911, AMG C63..."
            className="w-full bg-transparent border-none text-text font-body text-[14px] outline-none placeholder:text-text-3 font-[300]"
          />
        </div>

        {/* Make */}
        <div className="bg-bg-3 px-6 py-5">
          <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3 mb-[6px]">
            Make
          </div>
          <select
            value={make}
            onChange={e => setMake(e.target.value)}
            className="w-full bg-transparent border-none text-text font-body text-[13px] outline-none appearance-none font-[300]"
          >
            {MAKES.map(m => (
              <option key={m} value={m} style={{ background: '#1c1c1e' }}>{m}</option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div className="bg-bg-3 px-6 py-5">
          <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3 mb-[6px]">
            Budget
          </div>
          <select
            className="w-full bg-transparent border-none text-text font-body text-[13px] outline-none appearance-none font-[300]"
          >
            {BUDGETS.map(b => (
              <option key={b.value} value={b.value} style={{ background: '#1c1c1e' }}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Body Style */}
        <div className="bg-bg-3 px-6 py-5">
          <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3 mb-[6px]">
            Body Style
          </div>
          <select
            value={bodyType}
            onChange={e => setBodyType(e.target.value)}
            className="w-full bg-transparent border-none text-text font-body text-[13px] outline-none appearance-none font-[300]"
          >
            {BODY_TYPES.map(b => (
              <option key={b} value={b} style={{ background: '#1c1c1e' }}>{b}</option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <button
          onClick={() => buildSearch()}
          className="bg-gold text-bg font-body text-[10px] font-[600] tracking-[0.2em] uppercase px-10 hover:bg-gold-hi transition-colors max-lg:py-4"
        >
          Search
        </button>
      </div>

      {/* Filter tags */}
      <div className="flex flex-wrap gap-[10px]">
        {FILTER_TAGS.map(tag => (
          <button
            key={tag.label}
            onClick={() => handleTagClick(tag)}
            className="font-mono-custom text-[10px] tracking-[0.15em] uppercase px-4 py-[7px] transition-all duration-200"
            style={{
              border: activeTag === tag.label
                ? '1px solid #b8963e'
                : '1px solid rgba(245,242,237,0.12)',
              color: activeTag === tag.label ? '#b8963e' : '#6b6b6b',
            }}
            onMouseEnter={e => {
              if (activeTag !== tag.label) {
                (e.currentTarget as HTMLElement).style.borderColor = '#b8963e';
                (e.currentTarget as HTMLElement).style.color = '#b8963e';
              }
            }}
            onMouseLeave={e => {
              if (activeTag !== tag.label) {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,242,237,0.12)';
                (e.currentTarget as HTMLElement).style.color = '#6b6b6b';
              }
            }}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </section>
  );
}
