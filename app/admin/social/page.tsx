import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SocialPackCard, { type SocialPack } from './SocialPackCard';

export const revalidate = 0;

const STATUS_FILTERS = [
  { key: 'pending,failed', label: 'Pending Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'published', label: 'Published' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'pending,failed,approved,published,rejected', label: 'All' },
];

export default async function AdminSocialPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const activeFilter = rawStatus ?? 'pending,failed';
  const statuses = activeFilter.split(',');

  const supabase = await createClient();
  const { data: packs, error } = await supabase
    .from('social_packs')
    .select('*, vehicles(make, model, year, variant, price, photos)')
    .in('status', statuses)
    .order('generated_at', { ascending: false });

  const safePacksdata = (packs ?? []) as SocialPack[];

  // Count pending for badge
  const { count: pendingCount } = await supabase
    .from('social_packs')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'failed']);

  return (
    <div className="px-12 py-12 max-md:px-6">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-2">
            Content Management
          </div>
          <h1 className="font-display text-[36px] font-[300]">
            Social <em className="italic text-gold-hi">Packs</em>
          </h1>
        </div>
        {(pendingCount ?? 0) > 0 && (
          <div className="bg-gold/10 border border-gold/30 px-4 py-2 flex-shrink-0 mt-1">
            <span className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-gold">
              {pendingCount} awaiting review
            </span>
          </div>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex border-b border-border mb-8 overflow-x-auto">
        {STATUS_FILTERS.map(({ key, label }) => (
          <Link
            key={key}
            href={`/admin/social?status=${key}`}
            className={`px-5 py-3 font-mono-custom text-[9px] tracking-[0.2em] uppercase whitespace-nowrap no-underline transition-all border-b-2 ${
              activeFilter === key
                ? 'text-gold border-b-gold'
                : 'text-text-3 border-b-transparent hover:text-text-2'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/20 px-6 py-4 mb-6">
          <p className="text-[12px] text-red-400 font-mono-custom">
            Failed to load packs: {error.message}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!error && safePacksdata.length === 0 && (
        <div className="bg-bg-2 border border-border px-7 py-12 text-center">
          <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-text-3 mb-2">
            No packs
          </div>
          <p className="text-[13px] text-text-3">
            {activeFilter.includes('pending')
              ? 'No pending social packs. Packs are generated when a new vehicle is added.'
              : 'Nothing here yet.'}
          </p>
        </div>
      )}

      {/* Pack list */}
      {safePacksdata.length > 0 && (
        <div className="space-y-6">
          {safePacksdata.map((pack) => (
            <SocialPackCard key={pack.id} pack={pack} />
          ))}
        </div>
      )}
    </div>
  );
}
