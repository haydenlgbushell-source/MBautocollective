import { Suspense } from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FilterBar from '@/components/stock/FilterBar';
import VehicleGrid from '@/components/stock/VehicleGrid';
import SoldCarousel from '@/components/stock/SoldCarousel';
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
    if (v.status === 'sold') return false;
    if (params.body && params.body !== 'ALL' && v.body_type !== params.body) return false;
    if (params.q) {
      const q = params.q.toLowerCase();
      const haystack =
        `${v.make} ${v.model} ${v.variant ?? ''} ${v.colour ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const soldVehicles = vehicles
    .filter((v) => v.status === 'sold')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10);
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
            {availableCount} vehicle{availableCount !== 1 ? 's' : ''} available
            {params.body && params.body !== 'ALL' ? ` · ${params.body}` : ''}
          </div>
        </div>

        <section className="px-[52px] pt-10 pb-24 max-md:px-6">
          <Suspense fallback={null}>
            <FilterBar />
          </Suspense>
          <VehicleGrid vehicles={filtered} />
        </section>

        {/* Recently Sold */}
        {soldVehicles.length > 0 && (
          <>
            <div className="border-t border-border mx-[52px] max-md:mx-6" />
            <div className="px-[52px] pt-[52px] pb-[28px] max-md:px-6">
              <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-text-3 mb-[14px]">
                Previously Offered
              </div>
              <h2
                className="font-display font-[300] leading-[1.0]"
                style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
              >
                Recently <em className="italic text-text-2">Sold</em>
              </h2>
            </div>
            <section className="px-[52px] pb-24 max-md:px-6">
              <SoldCarousel vehicles={soldVehicles} />
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
