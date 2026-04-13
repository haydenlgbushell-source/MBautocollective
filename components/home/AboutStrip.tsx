import { BUSINESS } from '@/lib/constants';

export default function AboutStrip() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-border">
      {/* Left — Copy */}
      <div className="bg-bg-2 px-[60px] py-20 max-md:px-6 max-md:py-12">
        <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-[14px]">
          About MB Auto Collective
        </div>
        <h2
          className="font-display font-[300] leading-[1.05] mb-7"
          style={{ fontSize: 'clamp(36px, 4.5vw, 56px)' }}
        >
          Your Premier <em className="italic text-gold-hi">Destination</em>
        </h2>
        <p className="text-[15px] text-text-2 leading-[1.9] mb-8">
          At MB Auto Collective, we pride ourselves on being your premier destination for all types
          of prestige and performance vehicles. Our guarantee to you is an unparalleled experience,
          supported by our director&apos;s extensive expertise and a commitment to building lasting
          connections within the automotive industry.
        </p>
        <p className="text-[15px] text-text-2 leading-[1.9] mb-8">
          We understand that the journey doesn&apos;t end with a purchase. Our hallmark is efficient
          aftersales service, ensuring every transaction is as simple and uncomplicated as possible.
        </p>
        <div className="font-display text-[26px] italic text-gold-hi mt-3">{BUSINESS.director}</div>
        <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-text-3 mt-1">
          Director, MB Auto Collective
        </div>
      </div>

      {/* Right — Stats */}
      <div className="bg-bg-3 px-[60px] py-20 flex flex-col justify-center max-md:px-6 max-md:py-12">
        <div className="grid grid-cols-2 gap-[1px] bg-border">
          {[
            ['126', 'Google Reviews'],
            ['5★', 'Average Rating'],
            ['12+', 'Years Experience'],
            ['100%', 'Finance Options'],
          ].map(([num, label]) => (
            <div key={label} className="bg-bg-3 px-9 py-8">
              <div className="font-display text-[44px] font-[300] text-gold leading-none">{num}</div>
              <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3 mt-[6px]">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
