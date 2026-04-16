import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import SearchSection from '@/components/home/SearchSection';
import FeaturedStock from '@/components/home/FeaturedStock';
import CarSourcingSection from '@/components/home/CarSourcingSection';
import FinanceBanner from '@/components/home/FinanceBanner';
import TradeInSection from '@/components/home/TradeInSection';
import ServicesSection from '@/components/home/ServicesSection';
import ReviewsSection from '@/components/home/ReviewsSection';
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

        {/* 2. Search / filter bar */}
        <SearchSection />

        {/* 3. Featured inventory (bento grid) */}
        <FeaturedStock vehicles={featuredVehicles} />

        {/* 4. Car sourcing — can't find it, we'll source it */}
        <CarSourcingSection />

        {/* 5. Finance banner */}
        <FinanceBanner />

        {/* 6. Trade-in / valuation section */}
        <TradeInSection />

        {/* 7. Why Us — 6-panel grid */}
        <ServicesSection />

        {/* 8. Reviews / testimonials */}
        <ReviewsSection />
      </main>
      <Footer />
      <ChatBubble />
    </>
  );
}
