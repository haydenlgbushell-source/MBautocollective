import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import StockTicker from '@/components/home/StockTicker';
import FeaturedStock from '@/components/home/FeaturedStock';
import FinanceBanner from '@/components/home/FinanceBanner';
import AboutStrip from '@/components/home/AboutStrip';
import ServicesSection from '@/components/home/ServicesSection';
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
    // Fetch up to 4 featured vehicles for the bento grid
    featuredVehicles = await getVehicles({ featured: true, status: 'available', limit: 4 });
    // Fall back to most recent vehicles if no featured ones exist
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
        <Hero availableCount={availableCount} />
        <StockTicker vehicles={vehicles} />
        <FeaturedStock vehicles={featuredVehicles} />
        <FinanceBanner />
        <AboutStrip />
        <ServicesSection />
        <ReviewsSection />
        <CTABand />
      </main>
      <Footer />
      <ChatBubble />
    </>
  );
}
