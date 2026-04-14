'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[200]" style={{ fontFamily: 'var(--fb)' }}>
      {/* Panel */}
      {open && (
        <div className="absolute bottom-[72px] right-0 w-[280px] bg-bg-3 border border-border shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="p-6 border-b border-border">
            <div className="font-display text-[20px] font-[300] mb-[5px]">Ask Us Anything</div>
            <div className="font-mono-custom text-[9px] tracking-[0.15em] uppercase text-text-3">
              Finance · Stock · Availability
            </div>
          </div>
          <div className="p-4 flex flex-col gap-[2px]">
            <Link
              href="/stock"
              onClick={() => setOpen(false)}
              className="block bg-bg-2 px-4 py-3 text-[12px] text-text-2 hover:text-gold hover:bg-bg-3 border-l-2 border-transparent hover:border-gold-lo transition-all no-underline"
            >
              Browse current stock →
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block bg-bg-2 px-4 py-3 text-[12px] text-text-2 hover:text-gold hover:bg-bg-3 border-l-2 border-transparent hover:border-gold-lo transition-all no-underline"
            >
              Send us a message →
            </Link>
            <Link
              href="/finance"
              onClick={() => setOpen(false)}
              className="block bg-bg-2 px-4 py-3 text-[12px] text-text-2 hover:text-gold hover:bg-bg-3 border-l-2 border-transparent hover:border-gold-lo transition-all no-underline"
            >
              Finance enquiry →
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="block bg-bg-2 px-4 py-3 text-[12px] text-text-2 hover:text-gold hover:bg-bg-3 border-l-2 border-transparent hover:border-gold-lo transition-all no-underline"
            >
              Call {BUSINESS.phone} →
            </a>
          </div>
        </div>
      )}

      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Quick enquiry'}
        className="w-14 h-14 bg-gold rounded-full flex items-center justify-center text-bg text-[18px] shadow-[0_8px_32px_rgba(201,168,76,0.35)] hover:bg-gold-hi transition-all duration-200 hover:scale-105 hover:shadow-[0_12px_40px_rgba(201,168,76,0.45)]"
      >
        {open ? '✕' : '✉'}
      </button>
    </div>
  );
}
