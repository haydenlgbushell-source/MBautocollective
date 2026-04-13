import { notFound } from 'next/navigation';
import VehicleForm from '@/components/admin/VehicleForm';
import { getVehicleById } from '@/lib/supabase/vehicles';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehiclePage({ params }: PageProps) {
  const { id } = await params;
  let vehicle;

  try {
    vehicle = await getVehicleById(id);
  } catch {
    notFound();
  }

  if (!vehicle) notFound();

  return (
    <div className="px-12 py-12 max-md:px-6">
      <div className="mb-10">
        <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-2">
          Edit Listing
        </div>
        <h1 className="font-display text-[36px] font-[300]">
          {vehicle.year} {vehicle.make}{' '}
          <em className="italic text-gold-hi">{vehicle.model}</em>
        </h1>
        {vehicle.variant && (
          <p className="text-text-2 text-[14px] mt-1">{vehicle.variant}</p>
        )}
      </div>

      <VehicleForm vehicle={vehicle} mode="edit" />
    </div>
  );
}
