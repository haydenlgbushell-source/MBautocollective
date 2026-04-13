import Link from 'next/link';
import { getVehicleStats } from '@/lib/supabase/vehicles';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

async function getEnquiryCount() {
  try {
    const supabase = await createClient();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count } = await supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminDashboard() {
  let stats = { total: 0, available: 0, reserved: 0, sold: 0 };
  let enquiryCount = 0;

  try {
    [stats, enquiryCount] = await Promise.all([getVehicleStats(), getEnquiryCount()]);
  } catch {
    // Supabase not configured yet
  }

  return (
    <div className="px-12 py-12 max-md:px-6">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-[36px] font-[300]">
          Dashboard <em className="italic text-gold-hi">Overview</em>
        </h1>
        <Link
          href="/admin/inventory/new"
          className="inline-flex items-center gap-2 bg-gold text-bg font-body text-[10px] tracking-[0.2em] uppercase px-6 py-3 font-[500] hover:bg-gold-hi transition-colors no-underline"
        >
          + Add Vehicle
        </Link>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-10 flex-wrap">
        {[
          { n: stats.total, l: 'Total Vehicles' },
          { n: stats.available, l: 'Available' },
          { n: stats.reserved, l: 'Reserved' },
          { n: stats.sold, l: 'Sold' },
          { n: enquiryCount, l: 'Enquiries This Month' },
        ].map(({ n, l }) => (
          <div key={l} className="bg-bg-2 border border-border px-7 py-5 flex-1 min-w-[140px]">
            <div className="font-display text-[36px] font-[300] text-gold leading-none">{n}</div>
            <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3 mt-1">
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link
          href="/admin/inventory"
          className="bg-bg-2 border border-border p-7 hover:border-gold-lo hover:bg-bg-3 transition-all no-underline group"
        >
          <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-gold mb-4">
            Inventory
          </div>
          <div className="font-display text-[22px] font-[300] mb-2 group-hover:text-gold-hi transition-colors">
            Manage Vehicles
          </div>
          <p className="text-[12px] text-text-3">
            View, edit, and manage all vehicle listings.
          </p>
        </Link>

        <Link
          href="/admin/inventory/new"
          className="bg-bg-2 border border-border p-7 hover:border-gold-lo hover:bg-bg-3 transition-all no-underline group"
        >
          <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-gold mb-4">
            New Listing
          </div>
          <div className="font-display text-[22px] font-[300] mb-2 group-hover:text-gold-hi transition-colors">
            Add a Vehicle
          </div>
          <p className="text-[12px] text-text-3">
            List a new vehicle with photos and details.
          </p>
        </Link>

        <Link
          href="/admin/leads"
          className="bg-bg-2 border border-border p-7 hover:border-gold-lo hover:bg-bg-3 transition-all no-underline group"
        >
          <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-gold mb-4">
            CRM
          </div>
          <div className="font-display text-[22px] font-[300] mb-2 group-hover:text-gold-hi transition-colors">
            Leads &amp; Enquiries
          </div>
          <p className="text-[12px] text-text-3">
            View enquiries and open HubSpot CRM.
          </p>
        </Link>
      </div>
    </div>
  );
}
