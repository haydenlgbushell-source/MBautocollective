import { cn } from '@/lib/utils';
import type { VehicleStatus } from '@/types/vehicle';

interface BadgeProps {
  status: VehicleStatus;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  const styles = {
    available:
      'bg-[rgba(201,168,76,0.14)] text-gold border border-gold-lo',
    sold: 'bg-[rgba(255,255,255,0.04)] text-text-3 border border-border',
    reserved: 'bg-[rgba(255,255,255,0.05)] text-text-2 border border-border',
  };

  return (
    <span
      className={cn(
        'inline-block font-mono-custom text-[8px] tracking-[0.22em] uppercase px-[10px] py-[5px]',
        styles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
