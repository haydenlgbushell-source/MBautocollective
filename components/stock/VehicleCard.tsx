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
      className="group block bg-bg-2 transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-[6px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] no-underline overflow-hidden"
    >
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden bg-bg-3 relative">
        <div className="w-full h-full transition-transform duration-[700ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06] flex items-center justify-center">
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

        {/* Gold overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.4)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        <div className="absolute top-[14px] right-[14px]">
          <Badge status={vehicle.status} />
        </div>

        {/* Photo count */}
        {vehicle.photos && vehicle.photos.length > 1 && (
          <div className="absolute bottom-[12px] right-[12px] font-mono-custom text-[8px] tracking-[0.18em] uppercase px-[8px] py-[4px] bg-[rgba(0,0,0,0.65)] text-text-3">
            {vehicle.photos.length} photos
          </div>
        )}
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

        <div className="flex flex-wrap gap-x-[16px] gap-y-1 mb-[18px]">
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
          {vehicle.fuel_type && (
            <span className="font-mono-custom text-[10px] text-text-3 tracking-[0.08em]">
              {vehicle.fuel_type}
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
          <div className="w-[38px] h-[38px] border border-border flex items-center justify-center text-text-3 text-[16px] transition-all duration-300 group-hover:border-gold group-hover:text-gold group-hover:bg-[rgba(201,168,76,0.08)]">
            →
          </div>
        </div>
      </div>
    </Link>
  );
}
