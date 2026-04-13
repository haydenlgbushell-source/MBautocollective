'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatKm } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import CarSVG from '@/components/ui/CarSVG';
import type { Vehicle } from '@/types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const coverPhoto = vehicle.photos?.[0];

  return (
    <Link
      href={`/stock/${vehicle.slug}`}
      className="group block bg-bg-2 hover:bg-bg-3 transition-colors duration-200 no-underline overflow-hidden"
    >
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden bg-bg-3 relative">
        <div className="w-full h-full transition-transform duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.045] flex items-center justify-center">
          {coverPhoto ? (
            <Image
              src={coverPhoto}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <CarSVG width={240} opacity={0.12} />
          )}
        </div>
        <div className="absolute top-[14px] right-[14px]">
          <Badge status={vehicle.status} />
        </div>
      </div>

      {/* Body */}
      <div className="px-[26px] pt-[22px] pb-[26px]">
        <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-gold mb-[5px]">
          {vehicle.make}
        </div>
        <div className="font-display text-[28px] font-[400] leading-[1.05]">{vehicle.model}</div>
        <div className="text-[12px] text-text-2 mt-[3px] mb-[18px] tracking-[0.03em]">
          {vehicle.variant ? `${vehicle.variant} · ` : ''}{vehicle.year}
        </div>

        <div className="flex gap-[18px] mb-[18px]">
          {vehicle.kilometres != null && (
            <span className="font-mono-custom text-[10px] text-text-3 tracking-[0.08em]">
              {formatKm(vehicle.kilometres)}
            </span>
          )}
          {vehicle.transmission && (
            <span className="font-mono-custom text-[10px] text-text-3 tracking-[0.08em]">
              {vehicle.transmission}
            </span>
          )}
          {vehicle.colour && (
            <span className="font-mono-custom text-[10px] text-text-3 tracking-[0.08em]">
              {vehicle.colour}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between pt-[18px] border-t border-border">
          <div>
            <div className="font-mono-custom text-[8px] tracking-[0.22em] uppercase text-text-3 mb-1">
              Asking Price
            </div>
            <div className="font-display text-[30px] font-[300] text-text">
              {formatPrice(vehicle.price)}
            </div>
          </div>
          <div className="w-[34px] h-[34px] border border-border flex items-center justify-center text-text-3 text-[14px] transition-all duration-200 group-hover:border-gold-lo group-hover:text-gold">
            →
          </div>
        </div>
      </div>
    </Link>
  );
}
