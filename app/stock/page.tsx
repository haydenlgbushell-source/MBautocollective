import { Suspense } from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FilterBar from '@/components/stock/FilterBar';
import VehicleGrid from '@/components/stock/VehicleGrid';
import { getVehicles } from '@/lib/supabase/vehicles';
import type { Vehicle } from '@/types/vehicle';

export const metadata: Metadata = {
  title: 'Current Stock | MB Auto Collective',
  description:
    'Browse our handpicked selection of prestige and performance pre-owned vehicles. Updated regularly.',
};

export const revalidate = 30;

interface StockPageProps {
  searchParams: Promise<{ body?: string; q?: string; status?: string }>;
}

export default async function StockPage({ searchParams }: StockPageProps) {
  const params = await searchParams;
  let vehicles: Vehicle[] = [];

  try {
    vehicles = await getVehicles();
  } catch {
    // Supabase not yet configured
  }

  // Filter client-side from the full list (fast for small inventories)
  const filtered = vehicles.filter((v) => {
    if (params.body && params.body !== 'ALL' && v.body_type !== params.body) return false;
    if (params.q) {
      const q = params.q.toLowerCase();
      const haystack =
        `${v.make} ${v.model} ${v.variant ?? ''} ${v.colour ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const availableCount = filtered.filter((v) => v.status === 'available').length;

  return (
    <>
      <Navbar />
      <main className="pt-[76px]">
        {/* Page hero */}
        <div className="px-[52px] py-[52px] border-b border-border max-md:px-6">
          <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-[14px]">
            Available Now
          </div>
          <h1
            className="font-display font-[300] leading-[1.0]"
            style={{ fontSize: 'clamp(44px, 6vw, 72px)' }}
          >
            Current <em className="italic text-gold-hi">Stock</em>
          </h1>
          <div className="font-mono-custom text-[10px] tracking-[0.22em] uppercase text-text-3 mt-[14px]">
            {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} available
            {params.body && params.body !== 'ALL' ? ` · ${params.body}` : ''}
          </div>
        </div>

        <section className="px-[52px] pt-10 pb-24 max-md:px-6">
          <Suspense fallback={null}>
            <FilterBar />
          </Suspense>
          <VehicleGrid vehicles={filtered} />
        </section>
      </main>
      <Footer />
    </>
  );
}
