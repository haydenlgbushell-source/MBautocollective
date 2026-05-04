const WHAT_WE_OFFER = [
  {
    num: '01',
    title: 'Experience',
    body: 'We have over 15 years in the automotive industry, with extensive knowledge of all brands & models.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="16" stroke="#c9a84c" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="4" stroke="#c9a84c" strokeWidth="1.5" />
        <line x1="24" y1="8" x2="24" y2="20" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="11.5" y1="31" x2="20.5" y2="26" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="36.5" y1="31" x2="27.5" y2="26" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Relationships',
    body: 'We have built strong relationships in dealer land which allows us to source any new & used car you are looking for.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <path d="M6 28 L14 20 L20 22 L26 18 L34 22" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M34 22 L42 28 L34 36 L26 32 L20 34 L14 30 L6 28" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 22 L20 34" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M26 18 L26 32" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Competitive Pricing',
    body: 'We can purchase current vehicles at competitive prices by eliminating the Car Sales process. We also offer same day payment.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <path d="M8 28 L12 20 L20 18 L36 18 L42 24 L42 32 L8 32 Z" stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="15" cy="33" r="4" stroke="#c9a84c" strokeWidth="1.5" />
        <circle cx="35" cy="33" r="4" stroke="#c9a84c" strokeWidth="1.5" />
        <line x1="24" y1="14" x2="24" y2="10" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="21" y1="12" x2="27" y2="12" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Finance',
    body: 'We have access to a variety of Finance brokers who can secure you market leading finance on new & used vehicles.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="10" y="6" width="28" height="36" rx="2" stroke="#c9a84c" strokeWidth="1.5" />
        <line x1="16" y1="16" x2="32" y2="16" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="22" x2="32" y2="22" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M24 28 C21 28 19 29.5 19 31.5 C19 33.5 21 34.5 24 35 C27 35.5 29 36.5 29 38.5" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24" y1="26" x2="24" y2="40" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '05',
    title: 'Car Valuation',
    body: 'Want to know the market rate for a particular vehicle? We are currently offering free valuations.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="20" cy="20" r="12" stroke="#c9a84c" strokeWidth="1.5" />
        <line x1="29" y1="29" x2="40" y2="40" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 22 L15 17 L20 16 L27 16 L29 20 L29 24 L13 24 Z" stroke="#c9a84c" strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="16" cy="25" r="2.5" stroke="#c9a84c" strokeWidth="1.2" />
        <circle cx="26" cy="25" r="2.5" stroke="#c9a84c" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    num: '06',
    title: '24 Hour Contact',
    body: 'At MB Auto Collective we never stop and are always available for our clients. We are contactable 24/7.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="16" stroke="#c9a84c" strokeWidth="1.5" />
        <path d="M24 14 L24 24 L31 28" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
            What We{' '}
            <em className="italic text-gold-hi">Offer</em>
          </h2>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-border">
        {WHAT_WE_OFFER.map(({ num, icon, title, body }) => (
          <div
            key={num}
            className="group bg-bg-2 px-10 py-12 relative overflow-hidden transition-colors duration-300 hover:bg-bg-3"
          >
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left" />
            <div
              className="absolute top-5 right-7 font-display text-[72px] font-[300] leading-none pointer-events-none select-none"
              style={{ color: 'rgba(245,242,237,0.025)' }}
              aria-hidden
            >
              {num}
            </div>
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
