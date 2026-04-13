import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CTABand from '@/components/home/CTABand';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Finance | MB Auto Collective',
  description:
    'Flexible finance options for prestige and performance vehicles. MB Auto Collective works with trusted brokers to find the right solution for you.',
};

export default function FinancePage() {
  return (
    <>
      <Navbar />
      <main className="pt-[76px]">
        {/* Page hero */}
        <div className="px-[52px] py-[52px] border-b border-border max-md:px-6">
          <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-[14px]">
            Flexible Options
          </div>
          <h1
            className="font-display font-[300] leading-[1.0]"
            style={{ fontSize: 'clamp(44px, 6vw, 72px)' }}
          >
            Vehicle <em className="italic text-gold-hi">Finance</em>
          </h1>
          <p className="font-mono-custom text-[10px] tracking-[0.22em] uppercase text-text-3 mt-[14px]">
            100% finance available · Competitive rates · Fast approvals
          </p>
        </div>

        {/* Intro section */}
        <section className="px-[52px] py-20 border-b border-border max-md:px-6 max-md:py-12">
          <div className="max-w-[760px]">
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-[14px]">
              How It Works
            </div>
            <h2
              className="font-display font-[300] leading-[1.05] mb-7"
              style={{ fontSize: 'clamp(30px, 3.5vw, 42px)' }}
            >
              Drive away with the <em className="italic text-gold-hi">right finance</em>
            </h2>
            <p className="text-[15px] text-text-2 leading-[1.9] mb-6">
              MB Auto Collective works with a network of trusted finance brokers to secure
              competitive rates tailored to your situation. Whether you&apos;re purchasing your
              first prestige vehicle or upgrading, we can help structure a finance solution that
              suits your budget.
            </p>
            <p className="text-[15px] text-text-2 leading-[1.9]">
              Simply let us know you&apos;re interested in finance when making your enquiry and{' '}
              {BUSINESS.director} will connect you with our preferred brokers, who can often
              provide pre-approvals on the same day.
            </p>
          </div>
        </section>

        {/* Finance options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-border border-b border-border">
          {[
            {
              num: '01',
              title: 'Consumer Loan',
              body: 'A straightforward car loan for personal use. Fixed repayments, competitive rates, terms from 1–7 years. Available for most vehicle types.',
            },
            {
              num: '02',
              title: 'Commercial Finance',
              body: 'Business vehicle finance with potential tax advantages. Chattel mortgages, finance leases, and novated leases structured for your needs.',
            },
            {
              num: '03',
              title: 'Pre-Approval',
              body: 'Know your budget before you shop. Our brokers can arrange finance pre-approval quickly, giving you confidence at the negotiating table.',
            },
          ].map(({ num, title, body }) => (
            <div key={num} className="bg-bg-2 px-9 py-11">
              <div className="font-mono-custom text-[9px] tracking-[0.3em] text-gold-lo mb-5">{num}</div>
              <div className="font-display text-[28px] font-[400] mb-3">{title}</div>
              <p className="text-[13px] text-text-2 leading-[1.85] mb-8">{body}</p>
            </div>
          ))}
        </div>

        {/* CTA to enquire */}
        <section className="px-[52px] py-20 border-b border-border max-md:px-6 max-md:py-12">
          <div className="max-w-[540px]">
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-4">
              Get Started
            </div>
            <h2
              className="font-display font-[300] leading-[1.1] mb-5"
              style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}
            >
              Ready to discuss <em className="italic text-gold-hi">your options?</em>
            </h2>
            <p className="text-[14px] text-text-2 leading-[1.8] mb-8">
              Contact {BUSINESS.director} today and we&apos;ll get you in touch with the right
              finance partner for your situation.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-gold text-bg font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[500] hover:bg-gold-hi transition-colors no-underline"
              >
                Enquire Now
              </Link>
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex items-center justify-center bg-transparent text-text-2 font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[300] border border-border-2 hover:border-gold-lo hover:text-gold transition-all no-underline"
              >
                Call {BUSINESS.phone}
              </a>
            </div>
          </div>
        </section>

        <CTABand />
      </main>
      <Footer />
    </>
  );
}
