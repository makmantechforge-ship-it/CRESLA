export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'rent' | 'sale';
  currency: string;
  type: string;
  category: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  size: number;
  sizeUnit: string;
  furnished: boolean;
  petFriendly: boolean;
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
  availableDate: string;
  datePosted: string;
  views: number;
  saves: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  landlord: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    rating: number;
    properties: number;
    responseTime: string;
  };
}

export const properties: Property[] = [
  {
    id: 'prop-001',
    title: 'Modern 3-Bed House in Borrowdale',
    description: 'Executive 3-bedroom house in Borrowdale, Harare. Features modern solar power system, reliable borehole, lush garden, 24/7 security guard, and spacious open plan lounge. Solar power runs all lights and refrigeration.',
    price: 1200,
    priceType: 'rent',
    currency: '$',
    type: 'House',
    category: 'Residential',
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    size: 250,
    sizeUnit: 'sqm',
    furnished: false,
    petFriendly: true,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    address: '12 Borrowdale Road',
    suburb: 'Borrowdale',
    city: 'Harare',
    province: 'Harare Province',
    country: 'Zimbabwe',
    lat: -17.7511,
    lng: 31.0967,
    amenities: ['Solar Panels', 'Borehole', 'Security', 'Garden', 'Fibre Internet', 'Backup Power'],
    available: true,
    availableDate: '2026-08-15',
    datePosted: '2026-07-20',
    views: 1540,
    saves: 112,
    rating: 4.9,
    reviewCount: 28,
    verified: true,
    featured: true,
    landlord: {
      id: 'landlord-001',
      name: 'Tinashe Moyo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      verified: true,
      rating: 4.9,
      properties: 5,
      responseTime: '< 1 hour',
    },
  },
  {
    id: 'prop-002',
    title: 'Luxury Apartment in Avondale',
    description: 'Upmarket 2-bedroom furnished apartment in Avondale, close to Avondale Shopping Centre. Borehole water, invertor backup, fiber internet, and 24-hour security included.',
    price: 750,
    priceType: 'rent',
    currency: '$',
    type: 'Apartment',
    category: 'Residential',
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    size: 95,
    sizeUnit: 'sqm',
    furnished: true,
    petFriendly: false,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    address: '45 King George Road',
    suburb: 'Avondale',
    city: 'Harare',
    province: 'Harare Province',
    country: 'Zimbabwe',
    lat: -17.7981,
    lng: 31.0378,
    amenities: ['Furnished', 'Borehole', 'Backup Power', 'Fibre Internet', 'Security'],
    available: true,
    availableDate: '2026-09-01',
    datePosted: '2026-07-22',
    views: 980,
    saves: 75,
    rating: 4.8,
    reviewCount: 19,
    verified: true,
    featured: true,
    landlord: {
      id: 'landlord-002',
      name: 'Farai Ncube',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      verified: true,
      rating: 4.7,
      properties: 8,
      responseTime: '< 1 hour',
    },
  },
  {
    id: 'prop-003',
    title: 'Spacious Family Home in Kumalo, Bulawayo',
    description: 'Charming 4-bedroom family home in quiet Kumalo neighborhood. Large grounds with swimming pool, prolific borehole, staff quarters, and electric fencing.',
    price: 900,
    priceType: 'rent',
    currency: '$',
    type: 'House',
    category: 'Residential',
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    size: 320,
    sizeUnit: 'sqm',
    furnished: false,
    petFriendly: true,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    ],
    address: '18 Coghlan Avenue',
    suburb: 'Kumalo',
    city: 'Bulawayo',
    province: 'Bulawayo Province',
    country: 'Zimbabwe',
    lat: -20.1583,
    lng: 28.6078,
    amenities: ['Pool', 'Borehole', 'Garden', 'Staff Quarters', 'Pet Friendly'],
    available: true,
    availableDate: '2026-08-20',
    datePosted: '2026-07-18',
    views: 820,
    saves: 64,
    rating: 4.7,
    reviewCount: 14,
    verified: true,
    featured: true,
    landlord: {
      id: 'landlord-003',
      name: 'Chipo Sibanda',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      verified: true,
      rating: 4.8,
      properties: 3,
      responseTime: '< 2 hours',
    },
  },
  {
    id: 'prop-004',
    title: 'Victoria Falls Safari Lodge Villa',
    description: 'Stunning 3-bedroom holiday villa overlooking the Zambezi national park area. Swimming pool, outdoor deck, fully furnished, solar powered.',
    price: 250000,
    priceType: 'sale',
    currency: '$',
    type: 'Villa',
    category: 'Luxury',
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    size: 220,
    sizeUnit: 'sqm',
    furnished: true,
    petFriendly: false,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    ],
    address: 'Squire Cummings Avenue',
    suburb: 'Victoria Falls',
    city: 'Victoria Falls',
    province: 'Matabeleland North',
    country: 'Zimbabwe',
    lat: -17.9244,
    lng: 25.8364,
    amenities: ['Pool', 'Solar Panels', 'Borehole', 'Furnished', 'National Park View'],
    available: true,
    availableDate: '2026-10-01',
    datePosted: '2026-07-25',
    views: 3120,
    saves: 245,
    rating: 5.0,
    reviewCount: 42,
    verified: true,
    featured: true,
    landlord: {
      id: 'landlord-004',
      name: 'Rudo Mutasa',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150',
      verified: true,
      rating: 5.0,
      properties: 2,
      responseTime: '< 3 hours',
    },
  },
];

export const categories = [
  { id: 'cat-1', name: 'Houses', icon: 'Home', count: 184 },
  { id: 'cat-2', name: 'Apartments', icon: 'Building2', count: 142 },
  { id: 'cat-3', name: 'Student Rooms', icon: 'GraduationCap', count: 89 },
  { id: 'cat-4', name: 'Commercial', icon: 'Briefcase', count: 64 },
  { id: 'cat-5', name: 'Luxury Villas', icon: 'Crown', count: 35 },
];

export const popularCities = [
  { name: 'Harare', province: 'Harare Province', propertiesCount: 420, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500' },
  { name: 'Bulawayo', province: 'Bulawayo Province', propertiesCount: 210, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500' },
  { name: 'Victoria Falls', province: 'Matabeleland North', propertiesCount: 85, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500' },
  { name: 'Mutare', province: 'Manicaland', propertiesCount: 95, image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500' },
];
