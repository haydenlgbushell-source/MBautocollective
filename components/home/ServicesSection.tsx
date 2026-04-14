const WHY_US = [
  {
    num: '01',
    title: 'Hand-Selected Inventory',
    body: 'Every vehicle passes a rigorous inspection before it reaches our showroom. We buy right so you can buy with confidence.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="20" stroke="#c9a84c" strokeWidth="1.5" />
        <path d="M16 24 L21 29 L32 18" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Transparent Pricing',
    body: "No hidden fees, no dealer delivery charges on top. The price you see includes everything — we don't play games.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="8" y="14" width="32" height="22" rx="2" stroke="#c9a84c" strokeWidth="1.5" />
        <path d="M16 14 L16 10 C16 9 17 8 18 8 L30 8 C31 8 32 9 32 10 L32 14" stroke="#c9a84c" strokeWidth="1.5" />
        <line x1="24" y1="20" x2="24" y2="30" stroke="#c9a84c" strokeWidth="1.5" />
        <line x1="19" y1="25" x2="29" y2="25" stroke="#c9a84c" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Finance In-House',
    body: 'Access to 15+ lenders with competitive rates from 2.99% p.a. Get pre-approved before you set foot in the showroom.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <path d="M24 8 C24 8 12 14 12 24 C12 32 18 38 24 40 C30 38 36 32 36 24 C36 14 24 8 24 8Z" stroke="#c9a84c" strokeWidth="1.5" />
        <path d="M19 24 L22 27 L29 20" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Personal Service',
    body: "You'll deal with the same person from first enquiry to handover. No call centres, no runaround — ever.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="20" r="8" stroke="#c9a84c" strokeWidth="1.5" />
        <path d="M12 40 C12 33 17 28 24 28 C31 28 36 33 36 40" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '05',
    title: 'Nationwide Delivery',
    body: 'Based in Sydney, delivering everywhere. Door-to-door transport arranged, fully insured, at a flat rate.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="6" y="18" width="26" height="16" rx="2" stroke="#c9a84c" strokeWidth="1.5" />
        <path d="M32 22 L40 22 L44 30 L44 34 L32 34 Z" stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="14" cy="36" r="4" stroke="#c9a84c" strokeWidth="1.5" />
        <circle cx="37" cy="36" r="4" stroke="#c9a84c" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    num: '06',
    title: '5.0★ on Google',
    body: 'Over 126 verified reviews from real buyers across Sydney and beyond. Our reputation is everything to us.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="16" stroke="#c9a84c" strokeWidth="1.5" />
        <path d="M24 16 L26.5 21 L32 21.5 L28 25.5 L29 31 L24 28 L19 31 L20 25.5 L16 21.5 L21.5 21 Z" stroke="#c9a84c" strokeWidth="1.2" fill="none" />
      </svg>
    ),
  },
];

export default function ServicesSection() {
  return (
    <>
      <section className="px-[52px] pb-0 pt-24 max-md:px-6 max-md:pt-16">
        <div className="mb-[52px]">
          <div className="flex items-center gap-3 mb-[14px]">
            <div className="w-7 h-px bg-gold" />
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold">
              The MB Standard
            </div>
          </div>
          <h2
            className="font-display font-[300] leading-[1.05] max-w-[440px]"
            style={{ fontSize: 'clamp(36px, 4.5vw, 58px)' }}
          >
            Why Buyers Choose{' '}
            <em className="italic text-gold-hi">Us</em>
          </h2>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-border">
        {WHY_US.map(({ num, icon, title, body }) => (
          <div
            key={num}
            className="group bg-bg-2 px-10 py-12 relative overflow-hidden transition-colors duration-300 hover:bg-bg-3"
          >
            {/* Gold sweep bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left" />

            {/* Ghost number */}
            <div
              className="absolute top-5 right-7 font-display text-[72px] font-[300] leading-none pointer-events-none select-none"
              style={{ color: 'rgba(245,242,237,0.025)' }}
              aria-hidden
            >
              {num}
            </div>

            {/* Icon */}
            <div className="opacity-65 group-hover:opacity-95 transition-opacity duration-300 mb-6">
              {icon}
            </div>

            <div className="w-8 h-px bg-gold-lo mb-4 group-hover:bg-gold transition-colors duration-300" />
            <div className="font-display text-[22px] font-[400] mb-3 leading-tight">{title}</div>
            <p className="text-[13px] text-text-2 leading-[1.85]">{body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
