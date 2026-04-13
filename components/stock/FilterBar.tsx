'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { BODY_TYPES } from '@/lib/constants';

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const body = searchParams.get('body') ?? 'ALL';
  const search = searchParams.get('q') ?? '';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'ALL') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-[10px] items-center mb-9">
      <span className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mr-1">
        Filter:
      </span>

      <button
        className={`px-[18px] py-2 font-body text-[10px] tracking-[0.18em] uppercase border transition-all duration-200 font-[300] ${
          body === 'ALL'
            ? 'border-gold-lo text-gold bg-[rgba(201,168,76,0.08)]'
            : 'border-border text-text-2 bg-transparent hover:border-gold-lo hover:text-gold hover:bg-[rgba(201,168,76,0.08)]'
        }`}
        onClick={() => updateFilter('body', 'ALL')}
      >
        ALL
      </button>

      {BODY_TYPES.map((bt) => (
        <button
          key={bt}
          className={`px-[18px] py-2 font-body text-[10px] tracking-[0.18em] uppercase border transition-all duration-200 font-[300] ${
            body === bt
              ? 'border-gold-lo text-gold bg-[rgba(201,168,76,0.08)]'
              : 'border-border text-text-2 bg-transparent hover:border-gold-lo hover:text-gold hover:bg-[rgba(201,168,76,0.08)]'
          }`}
          onClick={() => updateFilter('body', bt)}
        >
          {bt}
        </button>
      ))}

      {/* Search */}
      <div className="ml-auto flex">
        <input
          className="bg-bg-2 border border-border border-r-0 px-4 py-2 font-body text-[12px] text-text outline-none w-[210px] focus:border-gold-lo transition-colors placeholder:text-text-3"
          placeholder="Search make, model, colour..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateFilter('q', (e.target as HTMLInputElement).value);
            }
          }}
          onBlur={(e) => updateFilter('q', e.target.value)}
        />
        <button className="bg-bg-3 border border-border px-[14px] py-2 text-text-3 hover:bg-gold-lo hover:text-gold-hi transition-all">
          ⌕
        </button>
      </div>
    </div>
  );
}
