import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ValuationForm from '@/components/forms/ValuationForm';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Free Car Valuation | MB Auto Collective',
  description:
    'Get a free, no-obligation market valuation for your vehicle. MB Auto Collective offers fair, transparent assessments based on current market demand.',
};

export default function CarValuationPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[76px]">
        {/* Page hero */}
        <div className="px-[52px] py-[52px] border-b border-border max-md:px-6">
          <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-[14px]">
            Sell Your Car
          </div>
          <h1
            className="font-display font-[300] leading-[1.0]"
            style={{ fontSize: 'clamp(44px, 6vw, 72px)' }}
          >
            Free Car <em className="italic text-gold-hi">Valuation</em>
          </h1>
          <div className="font-mono-custom text-[10px] tracking-[0.22em] uppercase text-text-3 mt-[14px]">
            Get a fair, transparent market valuation at no cost
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2px] bg-border mt-[2px]">
          {/* Info */}
          <div className="bg-bg-2 px-[52px] py-16 max-md:px-6 max-md:py-10">
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-4">
              Why Sell with Us
            </div>
            <h2
              className="font-display font-[300] leading-[1.05] mb-7"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' }}
            >
              Skip the <em className="italic text-gold-hi">headaches</em>
            </h2>
            <p className="text-[15px] text-text-2 leading-[1.9] mb-6">
              Selling privately means weeks of listings, tyre-kickers, and the risk of missing the
              right buyer. We make it simple — give us your details and {BUSINESS.director} will be
              in touch within 24 hours with a fair market assessment.
            </p>
            <p className="text-[15px] text-text-2 leading-[1.9] mb-10">
              Our valuations are based on real current-market data and our experience across the
              prestige segment. No pressure, no obligation.
            </p>

            <div className="grid grid-cols-2 gap-[1px] bg-border">
              {[
                ['24h', 'Response Time'],
                ['100%', 'No Obligation'],
                ['Fair', 'Market Price'],
                ['Simple', 'Process'],
              ].map(([n, l]) => (
                <div key={l} className="bg-bg-3 px-7 py-6">
                  <div className="font-display text-[32px] font-[300] text-gold leading-none">{n}</div>
                  <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3 mt-[5px]">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-bg-3 px-[52px] py-16 max-md:px-6 max-md:py-10">
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-4">
              Vehicle Details
            </div>
            <h2
              className="font-display font-[300] leading-[1.05] mb-2"
              style={{ fontSize: 'clamp(28px, 3vw, 38px)' }}
            >
              Tell us about <em className="italic text-gold-hi">your car</em>
            </h2>
            <p className="text-[14px] text-text-2 mb-8 leading-[1.8]">
              Fill in your details and {BUSINESS.director} will be in touch within 24 hours with a
              fair market valuation based on current demand.
            </p>
            <ValuationForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
