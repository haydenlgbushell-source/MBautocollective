import Link from 'next/link';
import type { Vehicle } from '@/types/vehicle';
import VehicleCard from '@/components/stock/VehicleCard';

interface FeaturedStockProps {
  vehicles: Vehicle[];
}

export default function FeaturedStock({ vehicles }: FeaturedStockProps) {
  if (vehicles.length === 0) return null;

  return (
    <section className="px-[52px] py-24 max-md:px-6 max-md:py-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-[52px] max-md:flex-col max-md:items-start max-md:gap-5">
        <div>
          <div className="flex items-center gap-3 mb-[14px]">
            <div className="w-7 h-px bg-gold" />
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold">
              Current Stock
            </div>
          </div>
          <h2
            className="font-display font-[300] leading-[1.02]"
            style={{ fontSize: 'clamp(36px, 4.5vw, 58px)' }}
          >
            Featured{' '}
            <em className="italic text-gold-hi">Vehicles</em>
          </h2>
        </div>

        <div className="flex items-center gap-5">
          <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3 max-md:hidden">
            {vehicles.length} available
          </div>
          <Link
            href="/stock"
            className="group inline-flex items-center gap-3 font-body text-[11px] tracking-[0.2em] uppercase text-text-2 hover:text-gold transition-colors no-underline"
          >
            View All Stock
            <span className="w-[28px] h-[28px] border border-border-2 flex items-center justify-center text-[12px] transition-all duration-200 group-hover:border-gold-lo group-hover:text-gold">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Grid — cards lift on hover so they need breathing room */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] pb-2">
        {vehicles.slice(0, 3).map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  );
}
