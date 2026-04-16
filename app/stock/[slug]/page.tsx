import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import PhotoGallery from '@/components/stock/PhotoGallery';
import SimilarVehicles from '@/components/stock/SimilarVehicles';
import VehicleDetailPanel from '@/components/stock/VehicleDetailPanel';
import EnquiryForm from '@/components/forms/EnquiryForm';
import { getVehicleBySlug } from '@/lib/supabase/vehicles';
import { formatPrice, formatKm } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const vehicle = await getVehicleBySlug(slug);
    if (!vehicle) return {};
    return {
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''} | MB Auto Collective`,
      description: `${vehicle.year} ${vehicle.make} ${vehicle.model} — ${formatPrice(vehicle.price)}${vehicle.kilometres ? `, ${formatKm(vehicle.kilometres)}` : ''}. Available at MB Auto Collective, Waterloo NSW.`,
    };
  } catch {
    return {};
  }
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const vehicle = await getVehicleBySlug(slug).catch(() => null);
  if (!vehicle) notFound();

  const whatsappText = encodeURIComponent(
    `Hi ${BUSINESS.director}, I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}. Could you please get in touch?`
  );
  const whatsappUrl = `${BUSINESS.whatsappHref}?text=${whatsappText}`;

  const mailtoUrl = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(
    `Enquiry: ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`
  )}&body=${encodeURIComponent(
    `Hi ${BUSINESS.director},\n\nI'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}.\n\nCould you please get in touch?\n\nThanks`
  )}`;

  // Up to 6 standout specs shown as headline badges beneath the gallery
  const headlineBadges = [
    { label: 'Year', value: String(vehicle.year) },
    vehicle.body_type ? { label: 'Body', value: vehicle.body_type } : null,
    vehicle.kilometres != null ? { label: 'Odometer', value: formatKm(vehicle.kilometres) } : null,
    vehicle.transmission ? { label: 'Transmission', value: vehicle.transmission } : null,
    vehicle.fuel_type ? { label: 'Fuel', value: vehicle.fuel_type } : null,
    vehicle.engine ? { label: 'Engine', value: vehicle.engine } : null,
    vehicle.seats ? { label: 'Seats', value: `${vehicle.seats} Seats` } : null,
  ].filter((b): b is { label: string; value: string } => b !== null).slice(0, 6);

  return (
    <>
      <Navbar />
      <main className="pt-[76px]">

        {/* Breadcrumb */}
        <div className="px-[52px] py-4 border-b border-border flex items-center gap-3 max-md:px-6">
          <Link
            href="/stock"
            className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3 hover:text-gold transition-colors no-underline"
          >
            ← Back to Stock
          </Link>
        </div>

        {/* Photo gallery */}
        <div className="relative">
          <PhotoGallery
            photos={vehicle.photos ?? []}
            make={vehicle.make}
            model={vehicle.model}
            year={vehicle.year}
          />
          <div className="absolute top-5 left-5 z-10 pointer-events-none">
            <Badge status={vehicle.status} />
          </div>
          {vehicle.status === 'available' && (
            <div className="absolute top-5 right-5 z-10 font-mono-custom text-[8px] tracking-[0.25em] uppercase px-[14px] py-[6px] border border-gold-lo text-gold bg-[rgba(0,0,0,0.6)] pointer-events-none">
              Available Now
            </div>
          )}
        </div>

        {/* Headline spec badges */}
        {headlineBadges.length > 0 && (
          <div className="flex overflow-x-auto border-b border-border bg-bg-2">
            {headlineBadges.map(({ label, value }, i) => (
              <div
                key={i}
                className="flex-1 min-w-[110px] px-5 py-5 text-center border-r border-border last:border-r-0"
              >
                <div className="font-mono-custom text-[8px] tracking-[0.22em] uppercase text-text-3 mb-[5px]">
                  {label}
                </div>
                <div className="font-body text-[13px] font-[500] text-text">{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] border-b border-border">

          {/* Left — vehicle details */}
          <div className="px-[48px] py-11 border-r border-border max-md:px-6 max-lg:border-r-0">
            <div className="font-mono-custom text-[9px] tracking-[0.32em] uppercase text-gold mb-2">
              {vehicle.make}
            </div>
            <h1
              className="font-display font-[300] leading-[0.97]"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
            >
              {vehicle.model}
            </h1>
            {(vehicle.variant || vehicle.year || vehicle.colour) && (
              <div className="text-[13px] text-text-2 mt-[6px] mb-7 tracking-[0.04em]">
                {[vehicle.variant, vehicle.year, vehicle.colour].filter(Boolean).join(' · ')}
              </div>
            )}

            {vehicle.description && (
              <p className="text-[14px] text-text-2 leading-[1.92] mb-10 max-w-[680px]">
                {vehicle.description}
              </p>
            )}

            {/* Tabbed panel: Details / Features / Optional Extras */}
            <VehicleDetailPanel vehicle={vehicle} />
          </div>

          {/* Right — enquiry sidebar */}
          <div className="px-8 py-9 flex flex-col max-md:px-6 max-md:border-t max-md:border-border">

            {/* Price */}
            <div className="font-mono-custom text-[8px] tracking-[0.3em] uppercase text-text-3 mb-[6px]">
              Asking Price
            </div>
            <div className="font-display text-[44px] font-[300] text-gold-hi mb-7">
              {formatPrice(vehicle.price)}
            </div>

            {/* Three CTA buttons */}
            <div className="flex flex-col gap-3 mb-7">

              {/* Call */}
              <a
                href={BUSINESS.phoneHref}
                className="flex items-center justify-center gap-[10px] w-full border border-gold text-gold font-body text-[11px] tracking-[0.2em] uppercase px-6 py-[14px] font-[500] hover:bg-gold hover:text-bg transition-all no-underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-[15px] h-[15px] flex-shrink-0"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Call {BUSINESS.director}
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-[10px] w-full bg-gold text-white font-body text-[11px] tracking-[0.2em] uppercase px-6 py-[14px] font-[500] hover:bg-gold-hi transition-colors no-underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-[15px] h-[15px] flex-shrink-0"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp {BUSINESS.director}
              </a>

              {/* Email */}
              <a
                href={mailtoUrl}
                className="flex items-center justify-center gap-[10px] w-full bg-bg-3 border border-border text-text-2 font-body text-[11px] tracking-[0.2em] uppercase px-6 py-[14px] font-[500] hover:border-gold hover:text-gold transition-all no-underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-[15px] h-[15px] flex-shrink-0"
                  aria-hidden="true"
                >
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
                Email {BUSINESS.director}
              </a>
            </div>

            <div className="h-px bg-border mb-7" />

            {/* Email enquiry form */}
            <div className="font-display text-[20px] font-[300] mb-[5px]">Send an Enquiry</div>
            <p className="text-[12px] text-text-2 mb-5 leading-[1.7]">
              Fill in your details and {BUSINESS.director} will be in touch promptly.
            </p>

            <EnquiryForm vehicle={vehicle} compact />

            <div className="h-px bg-border my-5" />

            {/* Contact details */}
            <div className="flex flex-col gap-[10px]">
              <a
                href={BUSINESS.phoneHref}
                className="flex items-center gap-[10px] text-[12px] text-text hover:text-gold transition-colors no-underline"
              >
                <span className="w-1 h-1 bg-gold-lo rounded-full flex-shrink-0" />
                {BUSINESS.phone}
              </a>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="flex items-center gap-[10px] text-[12px] text-text hover:text-gold transition-colors no-underline"
              >
                <span className="w-1 h-1 bg-gold-lo rounded-full flex-shrink-0" />
                {BUSINESS.email}
              </a>
              <div className="flex items-center gap-[10px] text-[12px] text-text-3">
                <span className="w-1 h-1 bg-gold-lo rounded-full flex-shrink-0" />
                {BUSINESS.address}
              </div>
            </div>
          </div>
        </div>

        {/* Similar vehicles */}
        <Suspense fallback={null}>
          <SimilarVehicles
            currentSlug={vehicle.slug}
            bodyType={vehicle.body_type}
            make={vehicle.make}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
