import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';

export default function CTABand() {
  return (
    <div
      className="relative border-t border-border border-b px-[52px] py-[84px] flex items-center justify-between gap-10 flex-wrap max-md:px-6 max-md:py-16 max-md:flex-col max-md:text-center overflow-hidden"
      style={{ background: '#0e0e0c' }}
    >
      {/* Radial gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Grain overlay */}
      <div
        className="noise-overlay absolute inset-0 pointer-events-none"
        style={{ opacity: 0.025 }}
      />

      <div className="relative z-10">
        <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-5">
          Ready when you are
        </div>
        <div
          className="font-display font-[300] leading-[1.12] text-text"
          style={{ fontSize: 'clamp(30px, 3.8vw, 50px)' }}
        >
          Ready to find your
          <br />
          <em className="italic text-gold-hi">next vehicle?</em>
        </div>
      </div>

      <div className="relative z-10 flex gap-[14px] flex-shrink-0 max-md:justify-center">
        <Link
          href="/stock"
          className="inline-flex items-center justify-center bg-gold text-bg font-body text-[11px] tracking-[0.22em] uppercase px-10 py-[15px] font-[500] hover:bg-gold-hi transition-colors no-underline"
        >
          View Stock
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center bg-transparent text-text-2 font-body text-[11px] tracking-[0.22em] uppercase px-10 py-[15px] font-[300] border border-border-2 hover:border-gold-lo hover:text-gold transition-all no-underline"
        >
          Talk to {BUSINESS.director}
        </Link>
      </div>
    </div>
  );
}
