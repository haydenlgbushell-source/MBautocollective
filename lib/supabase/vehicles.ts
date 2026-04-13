import { createClient } from './server';
import type { Vehicle, VehicleInsert, VehicleUpdate } from '@/types/vehicle';

export async function getVehicles(options?: {
  status?: string;
  featured?: boolean;
  limit?: number;
}): Promise<Vehicle[]> {
  const supabase = await createClient();
  let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.featured !== undefined) {
    query = query.eq('featured', options.featured);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Vehicle[];
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Vehicle;
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Vehicle;
}

export async function createVehicle(vehicle: VehicleInsert): Promise<Vehicle> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicle)
    .select()
    .single();

  if (error) throw error;
  return data as Vehicle;
}

export async function updateVehicle(id: string, vehicle: Partial<VehicleInsert>): Promise<Vehicle> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .update(vehicle)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Vehicle;
}

export async function deleteVehicle(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw error;
}

export async function getVehicleStats() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .select('status');

  if (error) return { total: 0, available: 0, reserved: 0, sold: 0 };

  const total = data.length;
  const available = data.filter((v) => v.status === 'available').length;
  const reserved = data.filter((v) => v.status === 'reserved').length;
  const sold = data.filter((v) => v.status === 'sold').length;

  return { total, available, reserved, sold };
}
