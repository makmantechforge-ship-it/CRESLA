import { createClient } from '@/utils/supabase/client';

export type DbProperty = {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: string;
  currency: string;
  type: string;
  category: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  size: number;
  size_unit: string;
  furnished: boolean;
  pet_friendly: boolean;
  images: string[];
  address: string;
  suburb: string;
  city: string;
  province: string;
  country: string;
  lat: number;
  lng: number;
  amenities: string[];
  available: boolean;
  available_date: string;
  date_posted: string;
  views: number;
  saves: number;
  rating: number;
  review_count: number;
  verified: boolean;
  featured: boolean;
  landlord_id: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url: string;
    verified: boolean;
    rating: number;
    properties_count: number;
    response_time: string;
  };
};

export async function getProperties(options?: {
  featured?: boolean;
  limit?: number;
  search?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}): Promise<DbProperty[]> {
  const supabase = createClient();

  let query = supabase
    .from('properties')
    .select('*, profiles(id, full_name, avatar_url, verified, rating, properties_count, response_time)')
    .eq('available', true)
    .order('date_posted', { ascending: false });

  if (options?.featured) {
    query = query.eq('featured', true);
  }
  if (options?.type && options.type !== 'All') {
    query = query.eq('type', options.type);
  }
  if (options?.minPrice) {
    query = query.gte('price', options.minPrice);
  }
  if (options?.maxPrice) {
    query = query.lte('price', options.maxPrice);
  }
  if (options?.bedrooms && options.bedrooms > 0) {
    query = query.gte('bedrooms', options.bedrooms);
  }
  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,city.ilike.%${options.search}%,suburb.ilike.%${options.search}%,country.ilike.%${options.search}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }

  return (data || []) as DbProperty[];
}

export async function getPropertyById(id: string): Promise<DbProperty | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('properties')
    .select('*, profiles(id, full_name, avatar_url, verified, rating, properties_count, response_time)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching property:', error);
    return null;
  }

  return data as DbProperty;
}
