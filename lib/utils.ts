export function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-AU')}`;
}

export function formatKm(km: number): string {
  return `${km.toLocaleString('en-AU')} km`;
}

export function formatYear(year: number): string {
  return year.toString();
}

export function generateSlug(make: string, model: string, year: number, variant?: string): string {
  const base = variant
    ? `${year}-${make}-${model}-${variant}`
    : `${year}-${make}-${model}`;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
