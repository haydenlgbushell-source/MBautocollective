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
      <div className="flex items-end justify-between mb-[52px] max-md:flex-col max-md:items-start max-md:gap-4">
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-[14px]">
            Current Stock
          </div>
          <h2
            className="font-display font-[300] leading-[1.05]"
            style={{ fontSize: 'clamp(36px, 4.5vw, 56px)' }}
          >
            Featured <em className="italic text-gold-hi">Vehicles</em>
          </h2>
        </div>
        <Link
          href="/stock"
          className="font-body text-[11px] tracking-[0.2em] uppercase text-text-2 border-b border-border-2 pb-[3px] hover:text-gold hover:border-gold-lo transition-all no-underline"
        >
          View All Stock →
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]">
        {vehicles.slice(0, 3).map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  );
}
