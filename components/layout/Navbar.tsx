'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BUSINESS } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/stock', label: 'Stock' },
  { href: '/about', label: 'About Us' },
  { href: '/finance', label: 'Finance' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? 'shadow-[0_1px_0_var(--border)]' : ''
      }`}
    >
      <div
        className={`flex items-center justify-between px-[52px] h-[76px] border-b transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(8,8,7,0.94)] backdrop-blur-[16px] border-border'
            : 'bg-transparent border-transparent'
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[14px] no-underline group">
          <div className="w-9 h-9 border border-gold-lo flex items-center justify-center transition-colors group-hover:border-gold">
            <span className="font-display text-base font-[500] text-gold leading-none">MB</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-[18px] font-[400] tracking-[0.1em] text-text leading-[1.1]">
              Auto Collective
            </span>
            <span className="font-mono-custom text-[8px] tracking-[0.3em] text-text-3 uppercase mt-[2px]">
              Waterloo, Sydney
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`font-body text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 font-[400] no-underline ${
                pathname === href ? 'text-gold' : 'text-text-2 hover:text-gold'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/car-valuation"
            className={`font-body text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 font-[400] no-underline ${
              pathname === '/car-valuation' ? 'text-gold' : 'text-text-2 hover:text-gold'
            }`}
          >
            Free Valuation
          </Link>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-5">
          <a
            href={BUSINESS.phoneHref}
            className="font-mono-custom text-[11px] text-text-2 tracking-[0.08em] hover:text-gold transition-colors"
          >
            {BUSINESS.phone}
          </a>
          <Link
            href="/contact"
            className="font-body text-[10px] tracking-[0.2em] uppercase px-[26px] py-[10px] border border-gold-lo text-gold bg-transparent hover:bg-gold hover:text-bg hover:border-gold transition-all duration-200"
          >
            Enquire
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-[1px] bg-text-2 transition-all duration-200 ${
              mobileOpen ? 'rotate-45 translate-y-[6px]' : ''
            }`}
          />
          <span
            className={`block w-6 h-[1px] bg-text-2 transition-all duration-200 ${
              mobileOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-[1px] bg-text-2 transition-all duration-200 ${
              mobileOpen ? '-rotate-45 -translate-y-[6px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[rgba(8,8,7,0.97)] backdrop-blur-[16px] border-b border-border">
          <div className="px-6 py-6 flex flex-col gap-4">
            {[...NAV_LINKS, { href: '/car-valuation', label: 'Free Valuation' }].map(
              ({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`font-body text-[12px] tracking-[0.18em] uppercase transition-colors no-underline py-2 border-b border-border ${
                    pathname === href ? 'text-gold' : 'text-text-2 hover:text-gold'
                  }`}
                >
                  {label}
                </Link>
              )
            )}
            <a
              href={BUSINESS.phoneHref}
              className="font-mono-custom text-[12px] text-text-2 tracking-[0.08em] hover:text-gold transition-colors pt-2"
            >
              {BUSINESS.phone}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
