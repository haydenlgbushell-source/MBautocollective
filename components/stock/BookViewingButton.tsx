'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Vehicle } from '@/types/vehicle';

const BookViewingModal = dynamic(() => import('@/components/forms/BookViewingModal'), {
  ssr: false,
});

export default function BookViewingButton({ vehicle }: { vehicle: Vehicle }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-[10px] w-full bg-gold text-bg font-body text-[11px] tracking-[0.2em] uppercase px-6 py-[14px] font-[500] hover:bg-gold-hi transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[15px] h-[15px] flex-shrink-0"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
            clipRule="evenodd"
          />
        </svg>
        Book a Viewing
      </button>

      {open && <BookViewingModal vehicle={vehicle} onClose={() => setOpen(false)} />}
    </>
  );
}
