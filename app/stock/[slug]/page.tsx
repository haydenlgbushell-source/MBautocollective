import { notFound } from 'next/navigation';
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
  const { slug } = await params;
  try {
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

        {/* Gallery with status badges */}
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] border-b border-border">
          {/* Left — Details */}
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
            {vehicle.variant && (
              <div className="text-[13px] text-text-2 mt-[6px] mb-7 tracking-[0.04em]">
                {vehicle.variant} · {vehicle.year} · {vehicle.colour}
              </div>
            )}

            {vehicle.description && (
              <p className="text-[14px] text-text-2 leading-[1.92] mb-8 max-w-[680px]">
                {vehicle.description}
              </p>
            )}

            {/* Specs table */}
            <div className="grid grid-cols-2 gap-[1px] bg-border mb-8">
              {SPEC_ROWS.map(({ key, label, format }) => {
                const raw = vehicle[key];
                if (raw == null) return null;
                const val = format ? (format as (v: typeof raw) => string)(raw as never) : String(raw);
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

            {/* Features */}
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

          {/* Right — Enquiry sidebar */}
          <div className="px-8 py-9 flex flex-col max-md:px-6 max-md:border-t max-md:border-border">
            <div className="font-mono-custom text-[8px] tracking-[0.3em] uppercase text-text-3 mb-[6px]">
              Asking Price
            </div>
            <div className="font-display text-[44px] font-[300] text-gold-hi mb-7">
              {formatPrice(vehicle.price)}
            </div>

            <div className="font-display text-[24px] font-[300] mb-[6px]">Make an Enquiry</div>
            <p className="text-[12px] text-text-2 mb-5 leading-[1.7]">
              Interested? Send a message and {BUSINESS.director} will be in touch promptly.
            </p>

            <EnquiryForm vehicle={vehicle} compact />

            <div className="h-px bg-border my-5" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-[10px] text-[12px] text-text-2">
                <span className="w-1 h-1 bg-gold-lo rounded-full flex-shrink-0" />
                <a href={BUSINESS.phoneHref} className="text-text hover:text-gold transition-colors no-underline">
                  {BUSINESS.phone}
                </a>
              </div>
              <div className="flex items-center gap-[10px] text-[12px] text-text-2">
                <span className="w-1 h-1 bg-gold-lo rounded-full flex-shrink-0" />
                <a href={`mailto:${BUSINESS.email}`} className="text-text hover:text-gold transition-colors no-underline">
                  {BUSINESS.email}
                </a>
              </div>
              <div className="flex items-center gap-[10px] text-[12px] text-text-3">
                <span className="w-1 h-1 bg-gold-lo rounded-full flex-shrink-0" />
                {BUSINESS.address}
              </div>
            </div>
          </div>
        </div>

        <SimilarVehicles
          currentSlug={vehicle.slug}
          bodyType={vehicle.body_type}
          make={vehicle.make}
        />
      </main>
      <Footer />
    </>
  );
}
