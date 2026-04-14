import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import PhotoGallery from '@/components/stock/PhotoGallery';
import SimilarVehicles from '@/components/stock/SimilarVehicles';
import EnquiryForm from '@/components/forms/EnquiryForm';
import { getVehicleBySlug, getVehicles } from '@/lib/supabase/vehicles';
import { formatPrice, formatKm } from '@/lib/utils';
import { BUSINESS } from '@/lib/constants';

export const revalidate = 60;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const vehicles = await getVehicles();
    return vehicles.map((v) => ({ slug: v.slug }));
  } catch {
    return [];
  }
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

const SPEC_ROWS = [
  { key: 'year' as const, label: 'Year' },
  { key: 'kilometres' as const, label: 'Kilometres', format: (v: number) => formatKm(v) },
  { key: 'transmission' as const, label: 'Transmission' },
  { key: 'engine' as const, label: 'Engine' },
  { key: 'fuel_type' as const, label: 'Fuel Type' },
  { key: 'body_type' as const, label: 'Body Type' },
  { key: 'colour' as const, label: 'Colour' },
  { key: 'seats' as const, label: 'Seats' },
];

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let vehicle;
  try {
    vehicle = await getVehicleBySlug(slug);
  } catch {
    notFound();
  }

  if (!vehicle) notFound();

  const whatsappText = encodeURIComponent(
    `Hi ${BUSINESS.director}, I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}. Could you please get in touch?`
  );
  const whatsappUrl = `${BUSINESS.whatsappHref}?text=${whatsappText}`;

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
              <p className="text-[14px] text-text-2 leading-[1.92] mb-8 max-w-[680px]">
                {vehicle.description}
              </p>
            )}

            <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-4">
              Specifications
            </div>
            <div className="grid grid-cols-2 gap-[1px] bg-border mb-8">
              {SPEC_ROWS.map(({ key, label, format }) => {
                const raw = vehicle[key];
                if (raw == null) return null;
                const val = format
                  ? (format as (v: typeof raw) => string)(raw as never)
                  : String(raw);
                return (
                  <div key={key} className="bg-bg-2 px-[18px] py-[14px]">
                    <div className="font-mono-custom text-[8px] tracking-[0.22em] uppercase text-text-3 mb-1">
                      {label}
                    </div>
                    <div className="text-[13px] text-text">{val}</div>
                  </div>
                );
              })}
            </div>

            {vehicle.features && vehicle.features.length > 0 && (
              <div>
                <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-gold mb-4">
                  Key Features
                </div>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature) => (
                    <span
                      key={feature}
                      className="font-mono-custom text-[9px] tracking-[0.15em] uppercase px-3 py-[6px] border border-border text-text-2"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — enquiry sidebar */}
          <div className="px-8 py-9 flex flex-col max-md:px-6 max-md:border-t max-md:border-border">
            <div className="font-mono-custom text-[8px] tracking-[0.3em] uppercase text-text-3 mb-[6px]">
              Asking Price
            </div>
            <div className="font-display text-[44px] font-[300] text-gold-hi mb-7">
              {formatPrice(vehicle.price)}
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-[10px] w-full bg-[#25D366] text-white font-body text-[11px] tracking-[0.2em] uppercase px-6 py-[15px] font-[500] hover:bg-[#20b858] transition-colors no-underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[16px] h-[16px] flex-shrink-0" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp {BUSINESS.director}
            </a>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono-custom text-[8px] tracking-[0.25em] uppercase text-text-3">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="font-display text-[20px] font-[300] mb-[5px]">Send an Enquiry</div>
            <p className="text-[12px] text-text-2 mb-5 leading-[1.7]">
              Fill in your details and {BUSINESS.director} will be in touch promptly.
            </p>

            <EnquiryForm vehicle={vehicle} compact />

            <div className="h-px bg-border my-5" />

            <div className="flex flex-col gap-[10px]">
              <a href={BUSINESS.phoneHref} className="flex items-center gap-[10px] text-[12px] text-text hover:text-gold transition-colors no-underline">
                <span className="w-1 h-1 bg-gold-lo rounded-full flex-shrink-0" />
                {BUSINESS.phone}
              </a>
              <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-[10px] text-[12px] text-text hover:text-gold transition-colors no-underline">
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
