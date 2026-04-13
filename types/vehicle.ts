export type VehicleStatus = 'available' | 'sold' | 'reserved';
export type Transmission = 'Automatic' | 'Manual';
export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
export type BodyType = 'Sedan' | 'SUV' | 'Coupé' | 'Convertible' | 'Wagon' | 'Hatchback' | 'Ute';

export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  variant?: string | null;
  year: number;
  price: number;
  kilometres?: number | null;
  colour?: string | null;
  transmission?: Transmission | null;
  body_type?: BodyType | null;
  engine?: string | null;
  fuel_type?: FuelType | null;
  seats?: number | null;
  description?: string | null;
  features?: string[] | null;
  photos?: string[] | null;
  status: VehicleStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleInsert {
  slug: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  kilometres?: number;
  colour?: string;
  transmission?: Transmission;
  body_type?: BodyType;
  engine?: string;
  fuel_type?: FuelType;
  seats?: number;
  description?: string;
  features?: string[];
  photos?: string[];
  status?: VehicleStatus;
  featured?: boolean;
}

export interface VehicleUpdate extends Partial<VehicleInsert> {
  id: string;
}

export interface Enquiry {
  id?: string;
  vehicle_id?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  created_at?: string;
}
