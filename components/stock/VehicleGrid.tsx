import type { Vehicle } from '@/types/vehicle';
import VehicleCard from './VehicleCard';
import CarSVG from '@/components/ui/CarSVG';

interface VehicleGridProps {
  vehicles: Vehicle[];
}

export default function VehicleGrid({ vehicles }: VehicleGridProps) {
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <CarSVG width={180} opacity={0.07} />
        <p className="font-display text-[24px] font-[300] italic text-text-2 mt-8">
          No vehicles found
        </p>
        <p className="font-mono-custom text-[10px] tracking-[0.2em] uppercase text-text-3 mt-3">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px]">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
