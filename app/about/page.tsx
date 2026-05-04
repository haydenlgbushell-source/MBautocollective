import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CTABand from '@/components/home/CTABand';
import ServicesSection from '@/components/home/ServicesSection';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About Us | MB Auto Collective',
  description:
    "Learn about MB Auto Collective — Sydney's premier prestige pre-owned car dealership in Waterloo NSW. Trusted by hundreds of satisfied customers.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[76px]">
        {/* Page hero */}
        <div className="px-[52px] py-[52px] pb-[52px] border-b border-border max-md:px-6">
          <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-[14px]">
            Our Story
          </div>
          <h1
            className="font-display font-[300] leading-[1.0]"
            style={{ fontSize: 'clamp(44px, 6vw, 72px)' }}
          >
            Why <em className="italic text-gold-hi">Us</em>
          </h1>
        </div>

        {/* About content */}
        <section className="px-[52px] py-24 max-md:px-6 max-md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px]">
            <div>
              <div className="font-mono-custom text-[9px] tracking-[0.35em] uppercase text-gold mb-[14px]">
                Our Philosophy
              </div>
              <p className="text-[15px] text-text-2 leading-[1.9] mb-8">
                At MB Auto Collective, we pride ourselves on being your premier destination for all
                types of cars. Our guarantee to you is an unparalleled experience, supported by our
                director&apos;s extensive expertise and a commitment to building lasting connections
                within the automotive industry.
              </p>
              <p className="text-[15px] text-text-2 leading-[1.9] mb-8">
                We understand that the journey doesn&apos;t end with a purchase. Our hallmark is
                efficient aftersales service, ensuring every transaction is as simple and
                uncomplicated as possible. This commitment is reinforced by the continued repeat
                business we enjoy with both the general public and dealers alike.
              </p>
              <p className="text-[15px] text-text-2 leading-[1.9]">
                Whether you&apos;re buying your first prestige vehicle or your fifth, you can expect
                honest, transparent communication and a seamless process from first enquiry through
                to delivery and beyond.
              </p>

              <div className="font-display text-[26px] italic text-gold-hi mt-8">
                {BUSINESS.director}
              </div>
              <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-text-3 mt-1">
                Director, MB Auto Collective
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-[1px] bg-border self-start">
              {[
                ['126', 'Google Reviews'],
                ['5.0★', 'Average Rating'],
                ['12+', 'Years Experience'],
                ['100%', 'Finance Available'],
              ].map(([num, label]) => (
                <div key={label} className="bg-bg-3 px-9 py-8">
                  <div className="font-display text-[44px] font-[300] text-gold leading-none">
                    {num}
                  </div>
                  <div className="font-mono-custom text-[9px] tracking-[0.22em] uppercase text-text-3 mt-[6px]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Buyers Choose Us — 6-panel grid */}
        <ServicesSection />

        <CTABand />
      </main>
      <Footer />
    </>
  );
}
