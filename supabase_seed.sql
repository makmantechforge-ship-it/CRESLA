-- ============================================
-- CRESLA Zimbabwe Seed Data
-- Run this AFTER supabase_schema.sql on project udfzxkxcmoinbetuzfag
-- ============================================

-- Insert sample profiles
insert into public.profiles (id, full_name, account_type, avatar_url, verified, rating, properties_count, response_time, city, country) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567001', 'Tinashe Moyo', 'landlord', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true, 4.9, 5, '< 1 hour', 'Harare', 'Zimbabwe'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567002', 'Chipo Sibanda', 'landlord', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', true, 4.8, 3, '< 2 hours', 'Bulawayo', 'Zimbabwe'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567003', 'Farai Ncube', 'agent', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', true, 4.7, 8, '< 1 hour', 'Harare', 'Zimbabwe'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567004', 'Rudo Mutasa', 'landlord', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150', true, 5.0, 2, '< 3 hours', 'Victoria Falls', 'Zimbabwe'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567005', 'Tendai Chikore', 'landlord', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', true, 4.6, 4, '< 2 hours', 'Mutare', 'Zimbabwe');

-- Insert Zimbabwe properties with USD pricing and real Zimbabwe coordinates
insert into public.properties (title, description, price, price_type, currency, type, category, bedrooms, bathrooms, parking, size, size_unit, furnished, pet_friendly, images, address, suburb, city, province, country, lat, lng, amenities, available, available_date, views, saves, rating, review_count, verified, featured, landlord_id) values
(
  'Modern 3-Bed House in Borrowdale',
  'Executive 3-bedroom house in Borrowdale, Harare. Features modern solar power system, reliable borehole, lush garden, 24/7 security guard, and spacious open plan lounge. Solar power runs all lights and refrigeration.',
  1200, 'rent', '$', 'House', 'Residential', 3, 2, 2, 250, 'sqm', false, true,
  ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  '12 Borrowdale Road', 'Borrowdale', 'Harare', 'Harare Province', 'Zimbabwe', -17.7511, 31.0967,
  ARRAY['Solar Panels','Borehole','Security','Garden','Fibre Internet','Backup Power','Electric Gate'],
  true, '2026-08-15', 1540, 112, 4.9, 28, true, true,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567001'
),
(
  'Luxury Apartment in Avondale',
  'Upmarket 2-bedroom furnished apartment in Avondale, close to Avondale Shopping Centre. Borehole water, invertor backup, fiber internet, and 24-hour security included.',
  750, 'rent', '$', 'Apartment', 'Residential', 2, 1, 1, 95, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
  '45 King George Road', 'Avondale', 'Harare', 'Harare Province', 'Zimbabwe', -17.7981, 31.0378,
  ARRAY['Furnished','Borehole','Backup Power','Fibre Internet','Security'],
  true, '2026-09-01', 980, 75, 4.8, 19, true, true,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567003'
),
(
  'Spacious Family Home in Kumalo, Bulawayo',
  'Charming 4-bedroom family home in quiet Kumalo neighborhood. Large grounds with swimming pool, prolific borehole, staff quarters, and electric fencing.',
  900, 'rent', '$', 'House', 'Residential', 4, 3, 2, 320, 'sqm', false, true,
  ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'],
  '18 Coghlan Avenue', 'Kumalo', 'Bulawayo', 'Bulawayo Province', 'Zimbabwe', -20.1583, 28.6078,
  ARRAY['Pool','Borehole','Garden','Staff Quarters','Pet Friendly','Security'],
  true, '2026-08-20', 820, 64, 4.7, 14, true, true,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567002'
),
(
  'Prime Commercial Office Space - CBD Harare',
  'Renovated open-plan commercial office suite in central Harare. Solar backup, high-speed fiber, kitchenette, and dedicated parking bay.',
  600, 'rent', '$', 'Office', 'Commercial', 0, 2, 2, 120, 'sqm', false, false,
  ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800'],
  'Sam Nujoma Street', 'CBD', 'Harare', 'Harare Province', 'Zimbabwe', -17.8292, 31.0522,
  ARRAY['Fibre Internet','Backup Power','Air Conditioning','Reception','Security'],
  true, '2026-08-01', 450, 32, 4.5, 8, true, false,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567003'
),
(
  'Victoria Falls Safari Lodge Villa',
  'Stunning 3-bedroom holiday villa overlooking the Zambezi national park area. Swimming pool, outdoor deck, fully furnished, solar powered.',
  250000, 'sale', '$', 'Villa', 'Luxury', 3, 3, 2, 220, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
  'Squire Cummings Avenue', 'Victoria Falls', 'Victoria Falls', 'Matabeleland North', 'Zimbabwe', -17.9244, 25.8364,
  ARRAY['Pool','Solar Panels','Borehole','Furnished','National Park View','BBQ Area'],
  true, '2026-10-01', 3120, 245, 5.0, 42, true, true,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567004'
),
(
  'Cozy 2-Bed Townhouse in Mt Pleasant',
  'Modern complex townhouse in Mt Pleasant, walking distance to UZ. Prolific borehole, 5kVA solar system, walled and gated.',
  500, 'rent', '$', 'Townhouse', 'Residential', 2, 1, 1, 80, 'sqm', false, false,
  ARRAY['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
  '7 Pendennis Road', 'Mount Pleasant', 'Harare', 'Harare Province', 'Zimbabwe', -17.7681, 31.0489,
  ARRAY['Solar Panels','Borehole','Electric Gate','Security'],
  true, '2026-08-10', 1100, 95, 4.6, 21, true, false,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567001'
),
(
  'Scenic 3-Bed House in Greenside, Mutare',
  'Beautiful home nestled in Eastern Highlands hills. Breathtaking views, garden, borehole, and solar power.',
  450, 'rent', '$', 'House', 'Residential', 3, 2, 1, 190, 'sqm', false, true,
  ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
  '12 Hillside Road', 'Greenside', 'Mutare', 'Manicaland', 'Zimbabwe', -18.9728, 32.6694,
  ARRAY['Garden','Borehole','Solar Panels','Mountain View','Pet Friendly'],
  true, '2026-09-01', 620, 48, 4.8, 11, true, false,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567005'
);
