import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import StockTicker from '@/components/home/StockTicker';
import SearchSection from '@/components/home/SearchSection';
import FeaturedStock from '@/components/home/FeaturedStock';
import ServicesSection from '@/components/home/ServicesSection';
import AboutStrip from '@/components/home/AboutStrip';
import CarSourcingSection from '@/components/home/CarSourcingSection';
import FinanceBanner from '@/components/home/FinanceBanner';
import TradeInSection from '@/components/home/TradeInSection';
import ReviewsSection from '@/components/home/ReviewsSection';
import CTABand from '@/components/home/CTABand';
import ChatBubble from '@/components/ui/ChatBubble';
import { getVehicles } from '@/lib/supabase/vehicles';

export const revalidate = 60;

export default async function HomePage() {
  let vehicles: Awaited<ReturnType<typeof getVehicles>> = [];
  let featuredVehicles: typeof vehicles = [];
  let availableCount = 0;

  try {
    vehicles = await getVehicles({ status: 'available' });
    featuredVehicles = await getVehicles({ featured: true, status: 'available', limit: 4 });
    if (featuredVehicles.length === 0) {
      featuredVehicles = await getVehicles({ status: 'available', limit: 4 });
    }
    availableCount = vehicles.length;
  } catch {
    // Supabase not yet configured — show empty state
  }

  return (
    <>
      <Navbar />
      <main>
        {/* 1. Full-screen hero */}
        <Hero availableCount={availableCount} />

        {/* 2. Live stock ticker */}
        <StockTicker vehicles={vehicles} />

        {/* 3. Search / filter bar */}
        <SearchSection />

        {/* 4. Featured inventory (bento grid) */}
        <FeaturedStock vehicles={featuredVehicles} />

        {/* 5. What we offer */}
        <ServicesSection />

        {/* 6. About MB Auto Collective */}
        <AboutStrip />

        {/* 7. Car sourcing — can't find it, we'll source it */}
        <CarSourcingSection />

        {/* 8. Finance banner */}
        <FinanceBanner />

        {/* 9. Trade-in / valuation section */}
        <TradeInSection />

        {/* 10. Reviews / testimonials */}
        <ReviewsSection />

        {/* 11. Final CTA */}
        <CTABand />
      </main>
      <Footer />
      <ChatBubble />
    </>
  );
}
