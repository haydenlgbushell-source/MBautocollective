import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CarSourcingForm from '@/components/forms/CarSourcingForm';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Source a Car | MB Auto Collective',
  description:
    "Can't find the car you're after? MB Auto Collective will source it for you. Submit your requirements and we'll search our dealer network across Australia.",
};

export default function CarSourcingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[76px]">
        {/* Page hero */}
        <div className="px-[52px] py-[52px] border-b border-border max-md:px-6">
          <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-[14px]">
            Car Sourcing
          </div>
          <h1
            className="font-display font-[300] leading-[1.0]"
            style={{ fontSize: 'clamp(44px, 6vw, 72px)' }}
          >
            We&apos;ll Find <em className="italic text-gold-hi">Your Car.</em>
          </h1>
          <div className="font-mono-custom text-[10px] tracking-[0.22em] uppercase text-text-3 mt-[14px]">
            Submit your requirements and we&apos;ll search Australia-wide
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2px] bg-border mt-[2px]">
          {/* Info panel */}
          <div className="bg-bg-2 px-[52px] py-16 max-md:px-6 max-md:py-10">
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-4">
              How It Works
            </div>
            <h2
              className="font-display font-[300] leading-[1.05] mb-7"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' }}
            >
              Your spec,<br />
              <em className="italic text-gold-hi">our network.</em>
            </h2>
            <p className="text-[15px] text-text-2 leading-[1.9] mb-6">
              Not every dream car is sitting on a showroom floor. Tell us exactly what you&apos;re
              after — make, model, year, budget, colour, options — and {BUSINESS.director} will
              personally reach out to our network of dealers, wholesalers, and private sellers
              across Australia.
            </p>
            <p className="text-[15px] text-text-2 leading-[1.9] mb-10">
              We do the legwork so you don&apos;t have to. No obligation. No upfront fees. Just
              genuine, curated options delivered to you.
            </p>

            <div className="grid grid-cols-2 gap-[1px] bg-border mb-10">
              {[
                ['24h', 'First Response'],
                ['100%', 'No Obligation'],
                ['AU-Wide', 'Dealer Network'],
                ['Free', 'Service'],
              ].map(([n, l]) => (
                <div key={l} className="bg-bg-3 px-7 py-6">
                  <div className="font-display text-[32px] font-[300] text-gold leading-none">{n}</div>
                  <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3 mt-[5px]">{l}</div>
                </div>
              ))}
            </div>

            <ol className="list-none flex flex-col gap-[16px]">
              {[
                'Submit your vehicle requirements using the form',
                `${BUSINESS.director} searches our Australia-wide dealer and private network`,
                'We present you with curated options that match your spec and budget',
                'You decide — no pressure, no obligation, no fees',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-5">
                  <span
                    className="font-display text-[28px] font-[300] text-gold leading-none min-w-[28px]"
                    style={{ opacity: 0.5 }}
                  >
                    0{i + 1}
                  </span>
                  <span className="font-body text-[12px] text-text-2 leading-[1.7] pt-[6px]"
                    style={{ letterSpacing: '0.05em' }}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Form panel */}
          <div className="bg-bg-3 px-[52px] py-16 max-md:px-6 max-md:py-10">
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-4">
              Your Requirements
            </div>
            <h2
              className="font-display font-[300] leading-[1.05] mb-2"
              style={{ fontSize: 'clamp(28px, 3vw, 38px)' }}
            >
              Tell us what<br />
              <em className="italic text-gold-hi">you&apos;re looking for</em>
            </h2>
            <p className="text-[14px] text-text-2 mb-8 leading-[1.8]">
              The more detail you give us, the better we can match you. Fill in as much as you
              know — {BUSINESS.director} will follow up to refine the brief if needed.
            </p>
            <CarSourcingForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
