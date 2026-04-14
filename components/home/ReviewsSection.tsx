import { GOOGLE_REVIEWS, BUSINESS } from '@/lib/constants';

// Locations parallel to GOOGLE_REVIEWS
const LOCATIONS = [
  'Sydney, NSW',
  'Surry Hills, NSW',
  'Melbourne, VIC',
  'Perth, WA',
  'Brisbane, QLD',
  'Sydney, NSW',
];

function StarShape() {
  return (
    <div
      className="w-[10px] h-[10px] bg-gold flex-shrink-0"
      style={{
        clipPath:
          'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      }}
    />
  );
}

export default function ReviewsSection() {
  return (
    <section
      className="relative border-t border-border border-b overflow-hidden"
      style={{ background: '#0e0e0c' }}
    >
      {/* Decorative giant quote mark */}
      <div
        className="absolute top-4 left-8 font-display font-[400] leading-none pointer-events-none select-none"
        style={{ fontSize: 260, color: 'rgba(201,168,76,0.04)' }}
        aria-hidden
      >
        &ldquo;
      </div>

      {/* Header */}
      <div className="relative px-[52px] pt-[56px] pb-10 flex items-end justify-between flex-wrap gap-6 max-md:px-6">
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
            Real Stories,{' '}
            <em className="italic text-gold-hi">Real Results</em>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-display text-[72px] font-[300] text-gold leading-none">
            {BUSINESS.reviewScore}
          </div>
          <div>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => <StarShape key={i} />)}
            </div>
            <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3">
              {BUSINESS.reviewCount} Reviews · Google
            </div>
          </div>
        </div>
      </div>

      {/* Reviews grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-border">
        {GOOGLE_REVIEWS.map((review, i) => (
          <div
            key={i}
            className="bg-bg-2 px-8 py-9 relative overflow-hidden group hover:bg-bg-3 transition-colors duration-300"
          >
            {/* Stars row */}
            <div className="flex gap-[5px] mb-5">
              {[...Array(review.stars)].map((_, j) => <StarShape key={j} />)}
            </div>

            {/* Quote text */}
            <p className="font-display text-[17px] font-[300] italic text-text-2 leading-[1.75] mb-6">
              &ldquo;{review.text}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-5 border-t border-border">
              <div className="w-8 h-8 bg-bg-4 border border-border flex items-center justify-center font-display text-[15px] text-gold-lo flex-shrink-0">
                {review.author.charAt(0)}
              </div>
              <div>
                <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-2">
                  {review.author}
                </div>
                <div className="font-mono-custom text-[8px] text-text-3 tracking-[0.12em] mt-[3px]">
                  {LOCATIONS[i] ?? 'Sydney, NSW'} · Google Review
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
