import { BUSINESS } from '@/lib/constants';

export default function AboutStrip() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-border">
      {/* Left — Copy */}
      <div className="bg-bg-2 px-[60px] py-20 max-md:px-6 max-md:py-12">
        <div className="flex items-center gap-3 mb-[14px]">
          <div className="w-7 h-px bg-gold" />
          <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold">
            About MB Auto Collective
          </div>
        </div>

        <h2
          className="font-display font-[300] leading-[1.05] mb-7"
          style={{ fontSize: 'clamp(34px, 4vw, 52px)' }}
        >
          Your Premier{' '}
          <em className="italic text-gold-hi">Destination</em>
        </h2>

        <p className="text-[15px] text-text-2 leading-[1.9] mb-6">
          At MB Auto Collective, we pride ourselves on being your premier destination for all types
          of prestige and performance vehicles. Our guarantee to you is an unparalleled experience,
          supported by our director&apos;s extensive expertise and a commitment to building lasting
          connections within the automotive industry.
        </p>
        <p className="text-[15px] text-text-2 leading-[1.9] mb-10">
          We understand that the journey doesn&apos;t end with a purchase. Our hallmark is efficient
          aftersales service, ensuring every transaction is as simple and uncomplicated as possible.
        </p>

        {/* Credential card */}
        <div className="border border-border bg-bg-3 px-7 py-6 inline-block min-w-[280px]">
          <div className="flex items-center gap-3 mb-[14px]">
            {/* Pulsing green dot */}
            <span className="relative flex h-[8px] w-[8px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex rounded-full h-[8px] w-[8px] bg-emerald-400" />
            </span>
            <span className="font-mono-custom text-[8px] tracking-[0.25em] uppercase text-emerald-400">
              Actively Operating
            </span>
          </div>
          <div className="font-display text-[26px] italic text-gold-hi leading-tight">
            {BUSINESS.director}
          </div>
          <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-text-3 mt-[6px]">
            Director, MB Auto Collective
          </div>
          <div className="mt-4 pt-4 border-t border-border flex gap-5">
            <div>
              <div className="font-mono-custom text-[8px] tracking-[0.18em] uppercase text-text-3 mb-1">Licence</div>
              <div className="font-mono-custom text-[10px] text-text-2">{BUSINESS.licence}</div>
            </div>
            <div>
              <div className="font-mono-custom text-[8px] tracking-[0.18em] uppercase text-text-3 mb-1">Est.</div>
              <div className="font-mono-custom text-[10px] text-text-2">2012</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Stats grid */}
      <div className="bg-bg-3 px-[60px] py-20 flex flex-col justify-center max-md:px-6 max-md:py-12">
        <div className="grid grid-cols-2 gap-[1px] bg-border">
          {[
            ['126', 'Google Reviews'],
            ['5★', 'Average Rating'],
            ['12+', 'Years Experience'],
            ['100%', 'Finance Options'],
          ].map(([num, label]) => (
            <div key={label} className="bg-bg-3 px-9 py-9 group relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gold-lo scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              <div className="font-display text-[48px] font-[300] text-gold leading-none">{num}</div>
              <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3 mt-[8px]">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
