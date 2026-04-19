'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function VehicleCombobox({
  label,
  options,
  value,
  onChange,
  placeholder = 'Any',
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function select(opt: string) {
    onChange(opt);
    setOpen(false);
    setQuery('');
  }

  function clear(e: { preventDefault: () => void }) {
    e.preventDefault();
    onChange('');
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3 mb-[6px]">
        {label}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={open ? query : value}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (!disabled) { setQuery(''); setOpen(true); } }}
          placeholder={open ? (value || placeholder) : (value || placeholder)}
          disabled={disabled}
          className="flex-1 bg-transparent border-none text-text font-body text-[13px] outline-none font-[300] placeholder:text-text-3 disabled:opacity-40 disabled:cursor-not-allowed"
        />
        {value ? (
          <button
            onMouseDown={clear}
            className="text-text-3 hover:text-gold text-[10px] shrink-0 transition-colors leading-none"
            aria-label="Clear"
          >
            ✕
          </button>
        ) : (
          <span className="text-text-3 text-[10px] shrink-0 pointer-events-none">▾</span>
        )}
      </div>

      {open && !disabled && (
        <ul
          className="absolute left-0 right-0 z-[200] max-h-52 overflow-y-auto"
          style={{
            top: 'calc(100% + 1px)',
            background: '#1a1a1c',
            border: '1px solid rgba(184,150,62,0.35)',
          }}
        >
          {filtered.length > 0 ? (
            filtered.map(opt => (
              <li key={opt}>
                <button
                  onMouseDown={() => select(opt)}
                  className="w-full text-left px-4 py-[8px] font-body text-[13px] font-[300] transition-colors"
                  style={{
                    color: opt === value ? '#b8963e' : '#f5f2ed',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,150,62,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {opt}
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-[8px] font-body text-[13px] text-text-3">No results</li>
          )}
        </ul>
      )}
    </div>
  );
}
