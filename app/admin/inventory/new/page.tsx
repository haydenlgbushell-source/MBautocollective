import VehicleForm from '@/components/admin/VehicleForm';

export default function NewVehiclePage() {
  return (
    <div className="px-12 py-12 max-md:px-6">
      <div className="mb-10">
        <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-2">
          New Listing
        </div>
        <h1 className="font-display text-[36px] font-[300]">
          Add a <em className="italic text-gold-hi">Vehicle</em>
        </h1>
      </div>

      <VehicleForm mode="create" />
    </div>
  );
}
