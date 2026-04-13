import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/stock', label: 'Stock' },
  { href: '/about', label: 'About Us' },
  { href: '/finance', label: 'Finance' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/car-valuation', label: 'Free Valuation' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-[52px] px-[52px] py-16 pb-12 max-md:px-6 max-md:gap-8">
        {/* Brand */}
        <div>
          <div className="font-display text-[22px] font-[400] mb-[6px]">
            MB <span className="text-gold">Auto</span> Collective
          </div>
          <div className="font-mono-custom text-[8px] tracking-[0.28em] uppercase text-text-3 mb-[18px]">
            Est. 2012 · Waterloo, Sydney
          </div>
          <p className="text-[13px] text-text-3 leading-[1.8]">
            MB Auto Collective prides itself on the best possible experience through trustworthy and
            reliable customer engagement.
          </p>
        </div>

        {/* Navigate */}
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-[14px] pb-[10px] border-b border-border">
            Navigate
          </div>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block text-[12px] text-text-3 mb-[9px] hover:text-text-2 transition-colors no-underline font-[300]"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-[14px] pb-[10px] border-b border-border">
            Contact
          </div>
          <a
            href={BUSINESS.phoneHref}
            className="block text-[12px] text-text-3 mb-[9px] hover:text-text-2 transition-colors no-underline"
          >
            {BUSINESS.phone}
          </a>
          <a
            href={`mailto:${BUSINESS.email}`}
            className="block text-[12px] text-text-3 mb-[9px] hover:text-text-2 transition-colors no-underline"
          >
            {BUSINESS.email}
          </a>
          <a
            href={BUSINESS.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-[12px] text-text-3 mb-[9px] hover:text-text-2 transition-colors no-underline leading-[1.6]"
          >
            {BUSINESS.address}
          </a>
        </div>

        {/* Legal */}
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-[14px] pb-[10px] border-b border-border">
            Legal
          </div>
          <div className="text-[12px] text-text-3 mb-[9px] font-[300]">ABN: {BUSINESS.abn}</div>
          <div className="text-[12px] text-text-3 mb-[9px] font-[300]">
            Dealer Licence: {BUSINESS.licence}
          </div>
          <div className="mt-4 text-[11px] text-text-3 leading-[1.7]">
            Licensed motor vehicle dealer operating in NSW.
          </div>
        </div>
      </div>

      {/* Base bar */}
      <div className="border-t border-border px-[52px] py-5 flex flex-wrap justify-between items-center gap-5 max-md:px-6">
        <div className="font-mono-custom text-[9px] tracking-[0.18em] text-text-3">
          © {year} MB Auto Collective Pty Ltd · All Rights Reserved
        </div>
        <div className="font-mono-custom text-[9px] tracking-[0.18em] text-text-3">
          mbautocollective.com · Waterloo, NSW 2017
        </div>
      </div>
    </footer>
  );
}
