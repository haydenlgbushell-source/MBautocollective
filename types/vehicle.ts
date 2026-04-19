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
  engine_capacity?: number | null;
  cylinders?: string | null;
  fuel_type?: FuelType | null;
  seats?: number | null;
  doors?: number | null;
  description?: string | null;
  short_description?: string | null;
  features?: string[] | null;
  photos?: string[] | null;
  status: VehicleStatus;
  featured: boolean;
  stock_number?: string | null;
  vin?: string | null;
  reg_plate?: string | null;
  reg_expiry?: string | null;
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
  engine_capacity?: number;
  cylinders?: string;
  fuel_type?: FuelType;
  seats?: number;
  doors?: number;
  description?: string;
  short_description?: string;
  features?: string[];
  photos?: string[];
  status?: VehicleStatus;
  featured?: boolean;
  stock_number?: string;
  vin?: string;
  reg_plate?: string;
  reg_expiry?: string;
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
