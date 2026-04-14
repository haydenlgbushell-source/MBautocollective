export default function ServicesSection() {
  const services = [
    {
      num: '01',
      title: 'Buy',
      body: 'Browse our handpicked selection of prestige and performance vehicles. Every car is inspected and prepared to the highest standard before it reaches our showroom.',
      icon: '◈',
    },
    {
      num: '02',
      title: 'Sell',
      body: "Looking to sell your vehicle? We offer fair, transparent valuations and a hassle-free process. Reach a qualified buyer without the headaches of private sale.",
      icon: '◇',
    },
    {
      num: '03',
      title: 'Finance',
      body: "We work with a network of trusted finance brokers to secure competitive rates tailored to your situation — whether you're buying your first prestige car or your fifth.",
      icon: '◉',
    },
  ];

  return (
    <>
      <section className="px-[52px] pb-0 pt-24 max-md:px-6 max-md:pt-16">
        <div className="flex items-end justify-between mb-[52px]">
          <div>
            <div className="flex items-center gap-3 mb-[14px]">
              <div className="w-7 h-px bg-gold" />
              <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold">
                What We Offer
              </div>
            </div>
            <h2
              className="font-display font-[300] leading-[1.05]"
              style={{ fontSize: 'clamp(36px, 4.5vw, 58px)' }}
            >
              Our <em className="italic text-gold-hi">Services</em>
            </h2>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-border">
        {services.map(({ num, title, body, icon }) => (
          <div
            key={num}
            className="group bg-bg-2 px-10 py-12 relative overflow-hidden transition-colors duration-300 hover:bg-bg-3"
          >
            {/* Gold bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left" />

            <div className="flex items-start justify-between mb-7">
              <div className="font-mono-custom text-[9px] tracking-[0.3em] text-gold-lo">{num}</div>
              <div className="font-display text-[22px] text-text-3 group-hover:text-gold-lo transition-colors duration-300">
                {icon}
              </div>
            </div>

            <div className="font-display text-[32px] font-[400] mb-4 leading-tight">{title}</div>
            <p className="text-[13px] text-text-2 leading-[1.9]">{body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
