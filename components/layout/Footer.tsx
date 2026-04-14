import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';

const STOCK_LINKS = [
  { href: '/stock', label: 'All Vehicles' },
  { href: '/stock?body_type=Sedan', label: 'Sedans & Coupes' },
  { href: '/stock?body_type=SUV', label: 'SUV & SAV' },
  { href: '/stock?body_type=Convertible', label: 'Convertibles' },
  { href: '/stock?body_type=Wagon', label: 'Wagons' },
];

const SERVICE_LINKS = [
  { href: '/finance', label: 'Finance' },
  { href: '/car-valuation', label: 'Free Car Valuation' },
  { href: '/contact', label: 'Nationwide Delivery' },
  { href: '/contact', label: 'Consignment' },
];

const COMPANY_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/stock', label: 'Google Reviews' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-[52px] px-[52px] py-16 pb-12 max-md:px-6 max-md:gap-8">
        {/* Brand */}
        <div>
          <div className="font-display text-[24px] font-[400] mb-[6px] tracking-[0.04em]">
            MB <span className="text-gold">Auto</span> Collective
          </div>
          <div className="font-mono-custom text-[8px] tracking-[0.28em] uppercase text-text-3 mb-5">
            Est. 2012 · Waterloo, Sydney
          </div>
          <p className="text-[13px] text-text-3 leading-[1.85] mb-7 max-w-[280px]">
            Sydney&apos;s home for hand-selected pre-owned luxury and performance vehicles. Trusted by buyers across Australia.
          </p>
          {/* Contact block */}
          <div className="flex flex-col gap-[10px]">
            <a
              href={BUSINESS.phoneHref}
              className="flex items-center gap-2 text-[12px] text-text-3 hover:text-gold transition-colors no-underline"
            >
              <span className="font-mono-custom text-[9px] text-gold-lo">TEL</span>
              {BUSINESS.phone}
            </a>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="flex items-center gap-2 text-[12px] text-text-3 hover:text-gold transition-colors no-underline"
            >
              <span className="font-mono-custom text-[9px] text-gold-lo">EMAIL</span>
              {BUSINESS.email}
            </a>
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 text-[12px] text-text-3 hover:text-gold transition-colors no-underline leading-[1.55]"
            >
              <span className="font-mono-custom text-[9px] text-gold-lo mt-[1px]">ADDR</span>
              {BUSINESS.address}
            </a>
          </div>
        </div>

        {/* Stock */}
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-[14px] pb-[10px] border-b border-border">
            Inventory
          </div>
          <div className="flex flex-col gap-[10px]">
            {STOCK_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-[12px] text-text-3 hover:text-text-2 transition-colors no-underline font-[300]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-[14px] pb-[10px] border-b border-border">
            Services
          </div>
          <div className="flex flex-col gap-[10px]">
            {SERVICE_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-[12px] text-text-3 hover:text-text-2 transition-colors no-underline font-[300]"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-[14px] pb-[10px] border-b border-border">
              Company
            </div>
            <div className="flex flex-col gap-[10px]">
              {COMPANY_LINKS.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-[12px] text-text-3 hover:text-text-2 transition-colors no-underline font-[300]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Legal */}
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-[14px] pb-[10px] border-b border-border">
            Legal
          </div>
          <div className="flex flex-col gap-[10px] mb-6">
            <div className="text-[12px] text-text-3 font-[300]">ABN: {BUSINESS.abn}</div>
            <div className="text-[12px] text-text-3 font-[300]">
              Dealer Licence: {BUSINESS.licence}
            </div>
          </div>
          <p className="text-[11px] text-text-3 leading-[1.75]">
            Licensed motor vehicle dealer operating in NSW. Prices are drive-away unless otherwise stated.
          </p>

          <div className="mt-8 border border-border p-4">
            <div className="font-mono-custom text-[8px] tracking-[0.2em] uppercase text-text-3 mb-1">
              Hours
            </div>
            <div className="text-[12px] text-text-2">Mon–Sat: 9am–6pm</div>
            <div className="text-[11px] text-text-3 mt-1">By appointment welcome</div>
          </div>
        </div>
      </div>

      {/* Base bar */}
      <div className="border-t border-border px-[52px] py-5 flex flex-wrap justify-between items-center gap-5 max-md:px-6">
        <div className="font-mono-custom text-[9px] tracking-[0.18em] text-text-3">
          © {year} MB Auto Collective Pty Ltd · All Rights Reserved
        </div>
        <div className="flex items-center gap-5">
          <div className="font-mono-custom text-[9px] tracking-[0.18em] text-text-3">
            {BUSINESS.domain}
          </div>
          <div className="font-mono-custom text-[9px] tracking-[0.18em] text-text-3">
            Waterloo, NSW 2017
          </div>
        </div>
      </div>
    </footer>
  );
}
