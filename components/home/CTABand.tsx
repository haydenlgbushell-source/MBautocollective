import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';

export default function CTABand() {
  return (
    <div
      className="bg-bg-3 border-t border-border border-b px-[52px] py-[72px] flex items-center justify-between gap-10 flex-wrap max-md:px-6 max-md:py-14 max-md:flex-col max-md:text-center"
    >
      <div
        className="font-display font-[300] leading-[1.15]"
        style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}
      >
        Ready to find your
        <br />
        <em className="italic text-gold-hi">next vehicle?</em>
      </div>

      <div className="flex gap-[14px] flex-shrink-0">
        <Link
          href="/stock"
          className="inline-flex items-center justify-center bg-gold text-bg font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[500] hover:bg-gold-hi transition-colors no-underline"
        >
          View Stock
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center bg-transparent text-text-2 font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[300] border border-border-2 hover:border-gold-lo hover:text-gold transition-all no-underline"
        >
          Talk to {BUSINESS.director}
        </Link>
      </div>
    </div>
  );
}
