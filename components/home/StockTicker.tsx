import { formatPrice, formatKm } from '@/lib/utils';
import type { Vehicle } from '@/types/vehicle';

interface StockTickerProps {
  vehicles: Vehicle[];
}

export default function StockTicker({ vehicles }: StockTickerProps) {
  const items = vehicles.flatMap((v) => [
    v.make,
    v.model,
    formatPrice(v.price),
    v.kilometres ? formatKm(v.kilometres) : null,
  ]).filter(Boolean) as string[];

  // Duplicate for seamless loop
  const allItems = [...items, ...items, ...items];

  return (
    <div className="bg-bg-2 border-t border-border border-b overflow-hidden py-[14px]">
      <div className="flex animate-marquee whitespace-nowrap">
        {allItems.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 px-7 font-mono-custom text-[10px] tracking-[0.2em] uppercase text-text-3"
          >
            <span className="w-[3px] h-[3px] bg-gold-lo rounded-full flex-shrink-0" />
            {i % 4 === 0 ? <span className="text-gold">{item}</span> : item}
          </span>
        ))}
      </div>
    </div>
  );
}
