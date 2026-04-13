import Link from 'next/link';
import { getVehicles } from '@/lib/supabase/vehicles';
import { formatPrice, formatKm } from '@/lib/utils';
import AdminDeleteButton from '@/components/admin/AdminDeleteButton';

export const revalidate = 0;

export default async function AdminInventoryPage() {
  let vehicles: Awaited<ReturnType<typeof getVehicles>> = [];

  try {
    vehicles = await getVehicles();
  } catch {
    // Supabase not configured yet
  }

  return (
    <div className="px-12 py-12 max-md:px-6">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-[36px] font-[300]">
          Inventory <em className="italic text-gold-hi">Management</em>
        </h1>
        <Link
          href="/admin/inventory/new"
          className="inline-flex items-center gap-2 bg-gold text-bg font-body text-[10px] tracking-[0.2em] uppercase px-6 py-3 font-[500] hover:bg-gold-hi transition-colors no-underline"
        >
          + Add Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-bg-2 border border-border p-12 text-center">
          <p className="font-display text-[24px] font-[300] italic text-text-2 mb-4">
            No vehicles yet
          </p>
          <Link
            href="/admin/inventory/new"
            className="inline-flex bg-gold text-bg font-body text-[10px] tracking-[0.2em] uppercase px-6 py-3 font-[500] hover:bg-gold-hi transition-colors no-underline"
          >
            Add your first vehicle
          </Link>
        </div>
      ) : (
        <div className="bg-bg-2 border border-border overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Make / Model', 'Year', 'Price', 'Km', 'Status', 'Featured', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left font-mono-custom text-[8px] tracking-[0.28em] uppercase text-text-3 px-4 py-3 border-b border-border font-[400]"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-bg-3 transition-colors">
                  <td className="px-4 py-4 border-b border-border">
                    <div className="font-mono-custom text-[9px] tracking-[0.18em] uppercase text-gold">
                      {v.make}
                    </div>
                    <div className="font-display text-[20px] font-[400] leading-tight">{v.model}</div>
                    {v.variant && (
                      <div className="text-[11px] text-text-3 mt-[2px]">{v.variant}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 border-b border-border text-[13px] text-text-2">
                    {v.year}
                  </td>
                  <td className="px-4 py-4 border-b border-border text-[13px] text-text-2 font-mono-custom">
                    {formatPrice(v.price)}
                  </td>
                  <td className="px-4 py-4 border-b border-border text-[13px] text-text-2">
                    {v.kilometres ? formatKm(v.kilometres) : '—'}
                  </td>
                  <td className="px-4 py-4 border-b border-border">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-4 py-4 border-b border-border">
                    <span className={`font-mono-custom text-[9px] tracking-[0.15em] ${v.featured ? 'text-gold' : 'text-text-3'}`}>
                      {v.featured ? '★ YES' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-border">
                    <div className="flex gap-2 flex-wrap">
                      <Link
                        href={`/stock/${v.slug}`}
                        target="_blank"
                        className="bg-transparent border border-border text-text-3 px-[14px] py-[6px] font-body text-[9px] tracking-[0.15em] uppercase hover:border-gold-lo hover:text-gold transition-all no-underline"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/inventory/${v.id}/edit`}
                        className="bg-transparent border border-border text-text-3 px-[14px] py-[6px] font-body text-[9px] tracking-[0.15em] uppercase hover:border-gold-lo hover:text-gold transition-all no-underline"
                      >
                        Edit
                      </Link>
                      <AdminDeleteButton vehicleId={v.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: 'bg-[rgba(201,168,76,0.12)] text-gold',
    sold: 'bg-[rgba(255,255,255,0.04)] text-text-3',
    reserved: 'bg-[rgba(255,255,255,0.06)] text-text-2',
  };
  return (
    <span
      className={`inline-block px-[10px] py-1 font-mono-custom text-[8px] tracking-[0.2em] uppercase ${styles[status] ?? 'text-text-3'}`}
    >
      {status}
    </span>
  );
}
