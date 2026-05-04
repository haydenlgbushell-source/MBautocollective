import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';

export default function CarSourcingSection() {
  return (
    <section
      className="px-[60px] py-[100px] max-md:px-6 max-md:py-16"
      style={{ background: '#0a0a0a' }}
      id="car-sourcing"
    >
      <div className="max-w-[900px]">
        <div className="flex items-center gap-[16px] mb-9">
          <span className="font-mono-custom text-[10px] tracking-[0.3em] uppercase text-gold">
            Car Sourcing
          </span>
          <div className="h-px w-[80px]" style={{ background: 'rgba(184,150,62,0.3)' }} />
        </div>

        <h2
          className="font-display font-[300] leading-[1.1] mb-5"
          style={{ fontSize: 'clamp(42px, 5.5vw, 68px)' }}
        >
          Can&apos;t Find It?
          <br />
          <em className="italic text-gold-hi">We&apos;ll Source It.</em>
        </h2>

        <p
          className="font-body text-[14px] text-text-2 leading-[1.9] mb-12 max-w-[580px]"
          style={{ letterSpacing: '0.03em' }}
        >
          If the exact car you want isn&apos;t in our current stock, tell us what you&apos;re after.
          {' '}{BUSINESS.director} personally searches our extensive network of dealers and private
          sellers across Australia to find your perfect match.
        </p>

        <ol className="list-none flex flex-col gap-[20px] mb-12">
          {[
            'Tell us the make, model, budget and any specifics you need',
            'We search our dealer network and private connections across Australia',
            'We present you with matched options — no obligation to proceed',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-6">
              <span
                className="font-display text-[32px] font-[300] text-gold leading-none min-w-[36px]"
                style={{ opacity: 0.5 }}
              >
                0{i + 1}
              </span>
              <span className="font-body text-[13px] text-text-2 leading-[1.7] pt-[7px]"
                style={{ letterSpacing: '0.05em' }}>
                {step}
              </span>
            </li>
          ))}
        </ol>

        <Link
          href="/car-sourcing"
          className="inline-flex items-center bg-gold text-bg font-body text-[10px] font-[600] tracking-[0.25em] uppercase px-9 py-[16px] hover:bg-gold-hi transition-colors no-underline"
        >
          Submit a Full Request
        </Link>
      </div>
    </section>
  );
}
