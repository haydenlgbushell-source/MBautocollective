import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/forms/ContactForm';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us | MB Auto Collective',
  description:
    'Get in touch with MB Auto Collective. Visit us at 1/267 Young Street, Waterloo NSW or call 0400 003 994.',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[76px]">
        {/* Page hero */}
        <div className="px-[52px] py-[52px] border-b border-border max-md:px-6">
          <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-[14px]">
            Get in Touch
          </div>
          <h1
            className="font-display font-[300] leading-[1.0]"
            style={{ fontSize: 'clamp(44px, 6vw, 72px)' }}
          >
            Contact <em className="italic text-gold-hi">Us</em>
          </h1>
        </div>

        {/* Contact grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2px] bg-border mt-[2px]">
          {/* Info panel */}
          <div className="bg-bg-2 px-[52px] py-16 max-md:px-6 max-md:py-10">
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-8">
              MB Auto Collective
            </div>

            <div className="mb-8">
              <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-2">
                Phone
              </div>
              <div className="text-[14px] text-text-2 leading-[1.8]">
                <a
                  href={BUSINESS.phoneHref}
                  className="text-text hover:text-gold transition-colors no-underline"
                >
                  {BUSINESS.phone}
                </a>
              </div>
            </div>

            <div className="mb-8">
              <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-2">
                Email
              </div>
              <div className="text-[14px] text-text-2">
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="text-text hover:text-gold transition-colors no-underline"
                >
                  {BUSINESS.email}
                </a>
              </div>
            </div>

            <div className="mb-8">
              <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-2">
                Address
              </div>
              <div className="text-[14px] text-text-2">
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text hover:text-gold transition-colors no-underline leading-[1.7] block"
                >
                  {BUSINESS.address}
                </a>
              </div>
            </div>

            <div className="mb-8">
              <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-2">
                Hours
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-[13px] text-text-2">
                <dt className="text-text-3 font-mono-custom text-[10px] tracking-[0.12em]">Mon – Fri</dt>
                <dd>9:00am – 6:00pm</dd>
                <dt className="text-text-3 font-mono-custom text-[10px] tracking-[0.12em]">Saturday</dt>
                <dd>9:00am – 5:00pm</dd>
                <dt className="text-text-3 font-mono-custom text-[10px] tracking-[0.12em]">Sunday</dt>
                <dd>By Appointment</dd>
              </dl>
            </div>

            <div className="pt-7 border-t border-border flex gap-8 flex-wrap">
              <div className="font-mono-custom text-[9px] tracking-[0.18em] text-text-3">
                ABN{' '}
                <span className="block text-text-2 mt-[3px]">{BUSINESS.abn}</span>
              </div>
              <div className="font-mono-custom text-[9px] tracking-[0.18em] text-text-3">
                Dealer Licence{' '}
                <span className="block text-text-2 mt-[3px]">{BUSINESS.licence}</span>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="bg-bg-3 px-[52px] py-16 max-md:px-6 max-md:py-10">
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-6">
              Send a Message
            </div>
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
