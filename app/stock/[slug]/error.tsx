'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function VehicleError() {
  return (
    <>
      <Navbar />
      <main className="pt-[76px] min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="font-mono-custom text-[9px] tracking-[0.32em] uppercase text-gold mb-4">
          Unavailable
        </div>
        <h1 className="font-display font-[300] text-[42px] leading-[1.05] mb-4">
          This page couldn&apos;t load
        </h1>
        <p className="font-mono-custom text-[10px] tracking-[0.18em] uppercase text-text-3 mb-8">
          A temporary issue occurred. Please try again.
        </p>
        <Link
          href="/stock"
          className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-2 hover:text-gold transition-colors no-underline border border-border px-6 py-3 hover:border-gold-lo"
        >
          ← Back to Stock
        </Link>
      </main>
      <Footer />
    </>
  );
}
