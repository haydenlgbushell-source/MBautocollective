// Meta Commerce Catalog API — WhatsApp Business vehicle catalogue

import type { Vehicle } from '@/types/vehicle';

const GRAPH = 'https://graph.facebook.com/v21.0';

export interface CatalogueResult {
  success: boolean;
  handles?: string[];
  error?: string;
}

const BODY_STYLE_MAP: Record<string, string> = {
  Sedan: 'SEDAN',
  SUV: 'SUV',
  'Coupé': 'COUPE',
  Convertible: 'CONVERTIBLE',
  Wagon: 'WAGON',
  Hatchback: 'HATCHBACK',
  Ute: 'TRUCK',
};

const FUEL_TYPE_MAP: Record<string, string> = {
  Petrol: 'GASOLINE',
  Diesel: 'DIESEL',
  Hybrid: 'HYBRID',
  Electric: 'ELECTRIC',
};

const AVAILABILITY_MAP: Record<string, string> = {
  available: 'AVAILABLE',
  sold: 'NOT_AVAILABLE',
  reserved: 'NOT_AVAILABLE',
};

function buildItemData(vehicle: Vehicle): Record<string, unknown> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mbautocollective.com';
  const photos = vehicle.photos ?? [];

  const fallbackDescription = [
    vehicle.year,
    vehicle.make,
    vehicle.model,
    vehicle.variant,
    vehicle.colour ? `· ${vehicle.colour}` : null,
    vehicle.transmission ? `· ${vehicle.transmission}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const item: Record<string, unknown> = {
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    description: vehicle.description || vehicle.short_description || fallbackDescription,
    price: `${vehicle.price} AUD`,
    availability: AVAILABILITY_MAP[vehicle.status] ?? 'NOT_AVAILABLE',
    url: `${siteUrl}/stock/${vehicle.slug}`,
    condition: 'USED',
  };

  if (photos.length > 0) item['image.url'] = photos[0];
  if (vehicle.variant) item.trim = vehicle.variant;
  if (vehicle.kilometres) {
    item['mileage.value'] = vehicle.kilometres;
    item['mileage.unit'] = 'KM';
  }
  if (vehicle.vin) item.vin = vehicle.vin;
  if (vehicle.body_type) item.body_style = BODY_STYLE_MAP[vehicle.body_type] ?? vehicle.body_type.toUpperCase();
  if (vehicle.fuel_type) item.fuel_type = FUEL_TYPE_MAP[vehicle.fuel_type] ?? vehicle.fuel_type.toUpperCase();
  if (vehicle.transmission) item.transmission = vehicle.transmission.toUpperCase();
  if (vehicle.colour) item.exterior_color = vehicle.colour;

  return item;
}

function getConfig(): { catalogId: string; accessToken: string } | null {
  const catalogId = process.env.WHATSAPP_CATALOG_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!catalogId || !accessToken) return null;
  return { catalogId, accessToken };
}

async function batchRequest(
  catalogId: string,
  accessToken: string,
  requests: unknown[]
): Promise<CatalogueResult> {
  const res = await fetch(`${GRAPH}/${catalogId}/items_batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ item_type: 'VEHICLE', requests }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message ?? `Catalog API ${res.status}`;
    return { success: false, error: msg };
  }

  const data = await res.json() as { handles?: string[] };
  return { success: true, handles: data.handles ?? [] };
}

export async function upsertVehicleInCatalogue(vehicle: Vehicle): Promise<CatalogueResult> {
  const config = getConfig();
  if (!config) return { success: false, error: 'WHATSAPP_CATALOG_ID or FACEBOOK_PAGE_ACCESS_TOKEN not set' };

  return batchRequest(config.catalogId, config.accessToken, [
    { method: 'UPDATE', retailer_id: vehicle.id, data: buildItemData(vehicle) },
  ]);
}

export async function deleteVehicleFromCatalogue(vehicleId: string): Promise<CatalogueResult> {
  const config = getConfig();
  if (!config) return { success: false, error: 'WHATSAPP_CATALOG_ID or FACEBOOK_PAGE_ACCESS_TOKEN not set' };

  return batchRequest(config.catalogId, config.accessToken, [
    { method: 'DELETE', retailer_id: vehicleId },
  ]);
}

// Batch-syncs up to 1000 vehicles per call. Vehicles are upserted (UPDATE acts as upsert).
export async function batchSyncCatalogue(vehicles: Vehicle[]): Promise<CatalogueResult> {
  const config = getConfig();
  if (!config) return { success: false, error: 'WHATSAPP_CATALOG_ID or FACEBOOK_PAGE_ACCESS_TOKEN not set' };

  const CHUNK = 100;
  const allHandles: string[] = [];

  for (let i = 0; i < vehicles.length; i += CHUNK) {
    const chunk = vehicles.slice(i, i + CHUNK);
    const result = await batchRequest(
      config.catalogId,
      config.accessToken,
      chunk.map((v) => ({ method: 'UPDATE', retailer_id: v.id, data: buildItemData(v) }))
    );
    if (!result.success) return result;
    allHandles.push(...(result.handles ?? []));
  }

  return { success: true, handles: allHandles };
}
