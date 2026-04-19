const WHAT_WE_OFFER = [
  {
    num: '01',
    title: 'Experience',
    body: 'We have over 15 years in the automotive industry, with extensive knowledge of all brands & models.',
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
