'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BUSINESS } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/stock',         label: 'Inventory' },
  { href: '/car-sourcing',  label: 'Source a Car' },
  { href: '/car-valuation', label: 'Trade-In' },
  { href: '/finance',       label: 'Finance' },
  { href: '/about',         label: 'About' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(10,10,10,0.96)'
          : 'linear-gradient(to bottom, rgba(10,10,10,0.92), transparent)',
        borderBottom: scrolled ? '1px solid rgba(184,150,62,0.2)' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
      }}
    >
      <div className="flex items-center justify-between px-[60px] h-[76px] max-md:px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[14px] no-underline group">
          <div
            className="w-9 h-9 flex items-center justify-center transition-all"
            style={{ border: '1px solid rgba(184,150,62,0.4)' }}
          >
            <span className="font-display text-base font-[500] text-gold leading-none">MB</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-[18px] font-[400] tracking-[0.12em] text-text leading-[1.1]">
              AUTO <span className="text-gold">COLLECTIVE</span>
            </span>
            <span className="font-mono-custom text-[7px] tracking-[0.3em] text-text-3 uppercase mt-[2px]">
              Waterloo, Sydney
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-10 list-none">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`font-body text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 font-[400] no-underline ${
                  pathname === href ? 'text-gold' : 'text-text-2 hover:text-gold'
                }`}
                style={{ letterSpacing: '0.2em' }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right — CTA */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/contact"
            className="font-body text-[10px] font-[500] tracking-[0.2em] uppercase px-6 py-[10px] text-gold transition-all duration-200 no-underline"
            style={{
              border: '1px solid #b8963e',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#b8963e';
              (e.currentTarget as HTMLElement).style.color = '#0a0a0a';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#b8963e';
            }}
          >
            Book Viewing
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-px bg-text-2 transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
          <span className={`block w-6 h-px bg-text-2 transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-px bg-text-2 transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ background: 'rgba(10,10,10,0.98)', borderColor: 'rgba(184,150,62,0.2)' }}>
          <div className="px-6 py-6 flex flex-col gap-1">
            {[...NAV_LINKS, { href: '/contact', label: 'Book Viewing' }].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-body text-[12px] tracking-[0.18em] uppercase transition-colors no-underline py-3 border-b ${
                  pathname === href ? 'text-gold' : 'text-text-2 hover:text-gold'
                }`}
                style={{ borderColor: 'rgba(184,150,62,0.15)' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
