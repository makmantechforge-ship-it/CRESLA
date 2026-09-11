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

// PROFILE QUERIES
export type DbProfile = {
  id: string;
  full_name: string;
  account_type: string;
  avatar_url: string;
  bio: string;
  phone: string;
  city: string;
  country: string;
  verified: boolean;
  rating: number;
  properties_count: number;
  response_time: string;
  created_at: string;
};

export async function getUserProfile(userId: string): Promise<DbProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data as DbProfile;
}

export async function updateUserProfile(userId: string, updates: Partial<DbProfile>) {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// FAVORITES QUERIES
export async function getUserFavorites(userId: string): Promise<DbProperty[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('property_id, properties(*, profiles(id, full_name, avatar_url, verified, rating, properties_count, response_time))')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
  
  // Extract the nested property objects
  return data.map((fav: any) => fav.properties) as DbProperty[];
}

export async function addFavorite(userId: string, propertyId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, property_id: propertyId });
    
  if (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

export async function removeFavorite(userId: string, propertyId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId);
    
  if (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

// SCAM / ABUSE REPORT QUERIES
export async function submitReport(reportData: {
  reporter_id: string;
  property_id?: string;
  reported_user_id?: string;
  reason: string;
  details?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from('reports').insert(reportData);
  if (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
}

// AUTO-UPGRADE TENANT TO LANDLORD
export async function upgradeUserToLandlord(userId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ account_type: 'landlord' })
    .eq('id', userId);

  if (error) {
    console.error('Error upgrading account type:', error);
  }
}

// PROPERTY CRUD
export async function createProperty(propertyData: any): Promise<DbProperty> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .insert(propertyData)
    .select('*, profiles(id, full_name, avatar_url, verified, rating, properties_count, response_time)')
    .single();

  if (error) {
    console.error('Error creating property:', error);
    throw error;
  }

  if (propertyData.landlord_id) {
    await upgradeUserToLandlord(propertyData.landlord_id);
  }

  return data as DbProperty;
}

export async function updateProperty(id: string, updates: any): Promise<DbProperty> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, profiles(id, full_name, avatar_url, verified, rating, properties_count, response_time)')
    .single();

  if (error) {
    console.error('Error updating property:', error);
    throw error;
  }

  return data as DbProperty;
}

export async function deleteProperty(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting property:', error);
    throw error;
  }

  return true;
}

export async function getUserProperties(userId: string): Promise<DbProperty[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*, profiles(id, full_name, avatar_url, verified, rating, properties_count, response_time)')
    .eq('landlord_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user properties:', error);
    return [];
  }

  return (data || []) as DbProperty[];
}

export async function getUserPropertyCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('landlord_id', userId);

  if (error) {
    console.error('Error getting user property count:', error);
    return 0;
  }

  return count || 0;
}

// MESSAGING
export type DbMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  property_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  property?: {
    id: string;
    title: string;
    price: number;
    images: string[];
  };
};

export async function sendMessage(data: {
  senderId: string;
  receiverId: string;
  content: string;
  propertyId?: string;
}): Promise<DbMessage> {
  const supabase = createClient();
  const payload: any = {
    sender_id: data.senderId,
    receiver_id: data.receiverId,
    content: data.content,
  };
  if (data.propertyId) {
    payload.property_id = data.propertyId;
  }

  const { data: newMsg, error } = await supabase
    .from('messages')
    .insert(payload)
    .select('*, sender:profiles!sender_id(id, full_name, avatar_url), receiver:profiles!receiver_id(id, full_name, avatar_url)')
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return newMsg as DbMessage;
}

export async function markMessagesAsRead(senderId: string, receiverId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking messages read:', error);
  }
}

