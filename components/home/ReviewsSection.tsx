import { GOOGLE_REVIEWS, BUSINESS } from '@/lib/constants';

export default function ReviewsSection() {
  return (
    <section className="bg-bg-2 border-t border-border border-b">
      {/* Header */}
      <div className="px-[52px] pt-[56px] pb-10 flex items-end justify-between flex-wrap gap-6 max-md:px-6">
        <div>
          <div className="flex items-center gap-3 mb-[14px]">
            <div className="w-7 h-px bg-gold" />
            <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold">
              What Our Customers Say
            </div>
          </div>
          <h2
            className="font-display font-[300] leading-[1.05]"
            style={{ fontSize: 'clamp(36px, 4.5vw, 58px)' }}
          >
            {BUSINESS.reviewCount} Google{' '}
            <em className="italic text-gold-hi">Reviews</em>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-display text-[72px] font-[300] text-gold leading-none">
            {BUSINESS.reviewScore}
          </div>
          <div>
            <div className="text-gold tracking-[3px] mb-1 text-sm">★★★★★</div>
            <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3">
              {BUSINESS.reviewCount} Reviews · Google
            </div>
          </div>
        </div>
      </div>

      {/* Reviews grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-border">
        {GOOGLE_REVIEWS.map((review, i) => (
          <div key={i} className="bg-bg-2 px-8 py-9 relative overflow-hidden group hover:bg-bg-3 transition-colors duration-300">
            {/* Decorative large quote */}
            <div
              className="absolute top-3 left-6 font-display text-[96px] font-[400] leading-none text-gold select-none pointer-events-none"
              style={{ opacity: 0.08 }}
              aria-hidden
            >
              &ldquo;
            </div>

            <div className="text-gold text-[13px] tracking-[3px] mb-5 relative z-10">
              {'★'.repeat(review.stars)}
            </div>

            <p className="font-display text-[15px] text-text-2 leading-[1.8] italic mb-6 relative z-10">
              &ldquo;{review.text}&rdquo;
            </p>

            <div className="flex items-center gap-3 pt-5 border-t border-border relative z-10">
              {/* Avatar initial */}
              <div className="w-8 h-8 bg-bg-4 border border-border flex items-center justify-center font-display text-[14px] text-gold-lo flex-shrink-0">
                {review.author.charAt(0)}
              </div>
              <div>
                <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-2">
                  {review.author}
                </div>
                <div className="font-mono-custom text-[8px] text-gold-lo tracking-[0.15em] mt-[3px]">
                  Google Review · Verified
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
