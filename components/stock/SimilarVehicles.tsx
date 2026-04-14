import { getVehicles } from '@/lib/supabase/vehicles';
import VehicleCard from './VehicleCard';
import type { BodyType } from '@/types/vehicle';

interface SimilarVehiclesProps {
  currentSlug: string;
  bodyType?: BodyType | null;
  make: string;
}

export default async function SimilarVehicles({ currentSlug, bodyType, make }: SimilarVehiclesProps) {
  try {
    const all = await getVehicles({ status: 'available', limit: 20 });

    // Prioritise: same make OR same body type, excluding current vehicle
    let similar = all
      .filter((v) => v.slug !== currentSlug)
      .filter((v) => v.make === make || (bodyType && v.body_type === bodyType))
      .slice(0, 3);

    // Fallback: any other available vehicles
    if (similar.length === 0) {
      similar = all.filter((v) => v.slug !== currentSlug).slice(0, 3);
    }

    if (similar.length === 0) return null;

    return (
      <section className="border-t border-border px-[52px] py-14 max-md:px-6">
        <div className="font-mono-custom text-[9px] tracking-[0.32em] uppercase text-gold mb-2">
          You May Also Like
        </div>
        <h2 className="font-display font-[300] text-[32px] leading-[1.1] mb-8">
          Similar Vehicles
        </h2>
        <div className="grid grid-cols-3 gap-[1px] bg-border max-lg:grid-cols-2 max-md:grid-cols-1">
          {similar.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
