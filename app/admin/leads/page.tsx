import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

async function getRecentEnquiries() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('enquiries')
      .select('*, vehicles(make, model, year)')
      .order('created_at', { ascending: false })
      .limit(20);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminLeadsPage() {
  const enquiries = await getRecentEnquiries();

  return (
    <div className="px-12 py-12 max-md:px-6">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-2">
            CRM &amp; Leads
          </div>
          <h1 className="font-display text-[36px] font-[300]">
            Leads &amp; <em className="italic text-gold-hi">Enquiries</em>
          </h1>
        </div>
        <a
          href="https://app.hubspot.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-gold text-bg font-body text-[10px] tracking-[0.2em] uppercase px-6 py-3 font-[500] hover:bg-gold-hi transition-colors no-underline"
        >
          Open HubSpot CRM ↗
        </a>
      </div>

      {/* HubSpot info */}
      <div className="bg-bg-2 border border-border p-7 mb-8">
        <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-gold mb-2">
          Primary CRM
        </div>
        <p className="text-[13px] text-text-2 leading-[1.8] mb-4">
          All enquiries submitted via the website are sent to HubSpot and stored here as a backup.
          Use HubSpot for deal management, follow-ups, and pipeline tracking.
        </p>
        <a
          href="https://app.hubspot.com"
          target="_blank"
          rel="noreferrer"
          className="font-body text-[11px] tracking-[0.2em] uppercase text-text-2 border-b border-border-2 pb-[3px] hover:text-gold hover:border-gold-lo transition-all no-underline"
        >
          Open HubSpot →
        </a>
      </div>

      {/* Enquiries table */}
      <div className="mb-4 flex items-center justify-between">
        <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-gold">
          Recent Enquiries (Backup)
        </div>
        <div className="font-mono-custom text-[9px] tracking-[0.18em] text-text-3">
          {enquiries.length} record{enquiries.length !== 1 ? 's' : ''}
        </div>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-bg-2 border border-border p-10 text-center">
          <p className="font-display text-[20px] font-[300] italic text-text-2">
            No enquiries yet
          </p>
        </div>
      ) : (
        <div className="bg-bg-2 border border-border overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Name', 'Email', 'Phone', 'Vehicle', 'Source', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="text-left font-mono-custom text-[8px] tracking-[0.28em] uppercase text-text-3 px-4 py-3 border-b border-border font-[400]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e: any) => (
                <tr key={e.id} className="hover:bg-bg-3 transition-colors">
                  <td className="px-4 py-3 border-b border-border text-[13px] text-text">
                    {e.name}
                  </td>
                  <td className="px-4 py-3 border-b border-border text-[12px] text-text-2">
                    <a href={`mailto:${e.email}`} className="hover:text-gold transition-colors no-underline">
                      {e.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 border-b border-border text-[12px] text-text-2">
                    {e.phone ? (
                      <a href={`tel:${e.phone}`} className="hover:text-gold transition-colors no-underline">
                        {e.phone}
                      </a>
                    ) : (
                      <span className="text-text-3">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-border text-[12px] text-text-2">
                    {e.vehicles
                      ? `${e.vehicles.year} ${e.vehicles.make} ${e.vehicles.model}`
                      : <span className="text-text-3">General</span>}
                  </td>
                  <td className="px-4 py-3 border-b border-border">
                    <span className="font-mono-custom text-[8px] tracking-[0.15em] uppercase text-text-3">
                      {e.source ?? 'website'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-border text-[11px] text-text-3 font-mono-custom">
                    {new Date(e.created_at).toLocaleDateString('en-AU', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
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
