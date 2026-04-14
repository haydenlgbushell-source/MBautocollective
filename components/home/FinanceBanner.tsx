import Link from 'next/link';

export default function FinanceBanner() {
  return (
    <div
      className="px-[52px] py-9 flex items-center justify-between gap-6 flex-wrap max-md:px-6 max-md:py-8 max-md:flex-col max-md:text-center"
      style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #7a5c14 100%)' }}
    >
      <div>
        <div className="font-display text-[24px] md:text-[28px] font-[300] text-bg leading-tight">
          Finance from <em className="italic">2.99% p.a.</em> — approved in minutes, not days.
        </div>
        <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-[rgba(8,8,7,0.55)] mt-2">
          Access to 15+ lenders · No obligation · Fast approvals
        </div>
      </div>

      <Link
        href="/finance"
        className="inline-flex items-center gap-3 bg-bg text-gold font-body text-[10px] font-[600] tracking-[0.22em] uppercase px-9 py-[14px] hover:bg-bg-3 transition-colors no-underline flex-shrink-0"
      >
        Get Pre-Approved →
      </Link>
    </div>
  );
}
