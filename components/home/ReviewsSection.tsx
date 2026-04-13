import { GOOGLE_REVIEWS, BUSINESS } from '@/lib/constants';

export default function ReviewsSection() {
  return (
    <section className="bg-bg-2 border-t border-border border-b">
      {/* Header */}
      <div className="px-[52px] pt-[52px] pb-9 flex items-end justify-between flex-wrap gap-6 max-md:px-6">
        <div>
          <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-[14px]">
            What Our Customers Say
          </div>
          <h2
            className="font-display font-[300] leading-[1.05]"
            style={{ fontSize: 'clamp(36px, 4.5vw, 56px)' }}
          >
            {BUSINESS.reviewCount} Google <em className="italic text-gold-hi">Reviews</em>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-display text-[64px] font-[300] text-gold leading-none">
            {BUSINESS.reviewScore}
          </div>
          <div>
            <div className="text-gold text-base tracking-[2px] mb-1">★★★★★</div>
            <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3">
              {BUSINESS.reviewCount} Reviews · Google
            </div>
          </div>
        </div>
      </div>

      {/* Reviews grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-border">
        {GOOGLE_REVIEWS.map((review, i) => (
          <div key={i} className="bg-bg-2 px-7 py-8">
            <div className="text-gold text-[13px] tracking-[2px] mb-[14px]">
              {'★'.repeat(review.stars)}
            </div>
            <p className="font-display text-[14px] text-text-2 leading-[1.8] italic mb-[18px]">
              &ldquo;{review.text}&rdquo;
            </p>
            <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3">
              {review.author}
            </div>
            <div className="font-mono-custom text-[8px] text-gold-lo tracking-[0.15em] mt-1">
              Google Review · Verified
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
