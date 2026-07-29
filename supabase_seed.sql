-- ============================================
-- CRESLA Seed Data
-- Run this AFTER supabase_schema.sql
-- ============================================

-- Insert sample landlord profiles (these are fake UUIDs for demo purposes)
-- In production, these would be created automatically when users sign up

insert into public.profiles (id, full_name, account_type, avatar_url, verified, rating, properties_count, response_time, city, country) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567001', 'Victoria Ndaba', 'landlord', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', true, 4.9, 12, '< 1 hour', 'Johannesburg', 'South Africa'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567002', 'James Mokoena', 'landlord', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true, 4.8, 8, '< 2 hours', 'Nairobi', 'Kenya'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567003', 'Amara Osei', 'landlord', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', true, 4.5, 3, '< 3 hours', 'Lagos', 'Nigeria'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567004', 'Stefan van der Merwe', 'landlord', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', true, 5.0, 6, '< 1 hour', 'Cape Town', 'South Africa'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567005', 'CRESLA Commercial Properties', 'agent', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', true, 4.6, 22, '< 4 hours', 'Accra', 'Ghana'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567006', 'Anele Mbeki', 'landlord', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', true, 4.7, 4, '< 2 hours', 'Kigali', 'Rwanda'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567007', 'Cairo Industrial Group', 'agent', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', true, 4.3, 18, '< 6 hours', 'Cairo', 'Egypt'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567008', 'Marrakech Hospitality Investments', 'agent', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', true, 4.8, 3, '< 3 hours', 'Marrakech', 'Morocco'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567009', 'Thabo Molefe', 'landlord', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', true, 4.4, 7, '< 1 hour', 'Abidjan', 'Ivory Coast'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567010', 'Nairobi Property Management', 'agent', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', true, 4.5, 34, '< 8 hours', 'Nairobi', 'Kenya'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567011', 'Lerato Dlamini', 'landlord', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150', true, 4.8, 5, '< 1 hour', 'Lagos', 'Nigeria'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567012', 'Zanzibar Retreats', 'agent', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', true, 4.9, 3, '< 2 hours', 'Zanzibar', 'Tanzania');

-- Insert properties
insert into public.properties (title, description, price, price_type, currency, type, category, bedrooms, bathrooms, parking, size, size_unit, furnished, pet_friendly, images, address, suburb, city, province, country, lat, lng, amenities, available, available_date, views, saves, rating, review_count, verified, featured, landlord_id) values
(
  'Luxury Penthouse in Sandton Central',
  'Stunning 3-bedroom penthouse with panoramic views of the Johannesburg skyline. Features floor-to-ceiling windows, a private rooftop terrace, chef''s kitchen with Miele appliances, and 24/7 concierge service. Located in the heart of Sandton, walking distance to Sandton City and Gautrain station.',
  4500000, 'sale', 'R', 'Penthouse', 'Residential', 3, 2, 2, 180, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
  '42 Sandton Drive, Penthouse Suite', 'Sandton', 'Johannesburg', 'Gauteng', 'South Africa', -26.1076, 28.0567,
  ARRAY['Pool','Gym','Concierge','Security','Balcony','Air Conditioning','Fibre Internet','Parking Bay'],
  true, '2026-08-01', 1247, 89, 4.8, 24, true, true,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567001'
),
(
  'Modern Family Home in Secure Estate',
  'Beautiful 4-bedroom family home situated in a 24-hour security estate. Features an open-plan living area, modern kitchen, private garden, and swimming pool. Close to top schools and shopping centers.',
  3200000, 'sale', 'R', 'House', 'Residential', 4, 3, 2, 280, 'sqm', false, true,
  ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'],
  '15 Jacaranda Lane, Westlands', 'Westlands', 'Nairobi', 'Nairobi County', 'Kenya', -1.2635, 36.8030,
  ARRAY['Pool','Garden','Security Estate','Double Garage','Fibre Internet','Solar Panels','Borehole'],
  true, '2026-09-01', 2340, 156, 4.7, 31, true, true,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567002'
),
(
  'Cozy Studio Apartment Near Campus',
  'Perfect student accommodation! This fully furnished studio is a 5-minute walk from the university. Includes WiFi, study desk, kitchenette, and access to communal laundry.',
  4500, 'rent', 'R', 'Studio', 'Student', 1, 1, 0, 35, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
  '72 Herbert Macaulay Way, Yaba', 'Yaba', 'Lagos', 'Lagos State', 'Nigeria', 6.5095, 3.3711,
  ARRAY['WiFi','Study Desk','Laundry','Security','CCTV'],
  true, '2026-08-01', 876, 45, 4.3, 18, true, false,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567003'
),
(
  'Oceanfront Villa with Private Beach',
  'Magnificent 5-bedroom villa directly on the Atlantic coast. Features infinity pool, private beach access, outdoor entertainment area with built-in braai, lush tropical garden, and breathtaking sunset views.',
  15800000, 'sale', 'R', 'Villa', 'Luxury', 5, 4, 3, 450, 'sqm', true, true,
  ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
  '7 Ocean View Drive', 'Camps Bay', 'Cape Town', 'Western Cape', 'South Africa', -33.9506, 18.3782,
  ARRAY['Private Pool','Beach Access','Ocean View','Garden','BBQ Area','Smart Home','Wine Cellar','Home Cinema'],
  true, '2026-10-01', 4521, 312, 4.9, 42, true, true,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567004'
),
(
  'Prime Office Space in Business District',
  'Professional office space in the heart of the business district. Open plan layout with meeting rooms, kitchenette, and reception area. High-speed fibre, backup power, and ample parking.',
  18000, 'rent', 'R', 'Office', 'Commercial', 0, 2, 6, 200, 'sqm', false, false,
  ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800','https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800'],
  'High Street, Airport Residential Area', 'Airport Residential', 'Accra', 'Greater Accra', 'Ghana', 5.5914, -0.1724,
  ARRAY['Fibre Internet','Backup Power','Air Conditioning','Reception','Meeting Rooms','Kitchen','Security'],
  true, '2026-08-15', 654, 23, 4.4, 8, true, false,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567005'
),
(
  'Charming 2-Bed Apartment in Kigali',
  'Beautifully renovated apartment in the heart of Kigali. Walking distance to restaurants, galleries, and convention center. Features modern kitchen, and a sunny balcony overlooking the hills.',
  12500, 'rent', 'R', 'Apartment', 'Residential', 2, 1, 1, 85, 'sqm', true, true,
  ARRAY['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800','https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800'],
  '12 Boulevard de l''Umuganda', 'Kacyiru', 'Kigali', 'Kigali Province', 'Rwanda', -1.9403, 29.8739,
  ARRAY['Balcony','Hill View','Wooden Floors','Dishwasher','Secure Parking'],
  true, '2026-08-01', 543, 67, 4.6, 15, true, false,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567006'
),
(
  'Industrial Warehouse - Cairo',
  'Large industrial warehouse suitable for manufacturing, storage, or distribution. Features high ceilings, loading docks, office space, and excellent highway access.',
  35000, 'rent', 'R', 'Warehouse', 'Industrial', 0, 3, 10, 800, 'sqm', false, false,
  ARRAY['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800','https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800'],
  '10 Industrial Zone', '6th of October', 'Cairo', 'Cairo Governorate', 'Egypt', 29.9639, 30.9236,
  ARRAY['Loading Dock','Three-Phase Power','Office Space','Yard','Security','Highway Access'],
  true, '2026-09-01', 234, 12, 4.2, 5, true, false,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567007'
),
(
  'Boutique Guest House - Marrakech',
  'Exquisite 8-room guest house in the famous Marrakech Medina. Fully operational with excellent ratings. Includes manager''s cottage, swimming pool, manicured gardens, and rooftop terrace views.',
  12500000, 'sale', 'R', 'Guest House', 'Hospitality', 8, 8, 12, 650, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800','https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
  'Rue de la Bahia', 'Medina', 'Marrakech', 'Marrakech-Safi', 'Morocco', 31.6295, -7.9811,
  ARRAY['Pool','Garden','Rooftop Terrace','Restaurant','Bar','Conference Room','WiFi','Spa'],
  true, '2026-11-01', 1876, 198, 4.9, 67, true, true,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567008'
),
(
  'Spacious 3-Bed Flat in Abidjan',
  'Well-maintained 3-bedroom flat ideal for young professionals. Located in the vibrant Marcory area, close to shopping malls and business district. Secure complex with pool.',
  9800, 'rent', 'R', 'Flat', 'Residential', 3, 2, 1, 110, 'sqm', false, false,
  ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800','https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800'],
  'Boulevard de Marseille', 'Marcory', 'Abidjan', 'Lagunes', 'Ivory Coast', 5.3100, -4.0125,
  ARRAY['Pool','Security','Covered Parking','Near Business District'],
  true, '2026-08-01', 432, 34, 4.1, 12, true, false,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567009'
),
(
  'Retail Shop in Busy Shopping Center',
  'Prime retail space in a high-traffic shopping center in Nairobi. Corner position with excellent visibility and foot traffic.',
  22000, 'rent', 'R', 'Shop', 'Commercial', 0, 1, 0, 120, 'sqm', false, false,
  ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800','https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800'],
  'Shop 12, Westgate Mall', 'Westlands', 'Nairobi', 'Nairobi County', 'Kenya', -1.2581, 36.8043,
  ARRAY['High Foot Traffic','Corner Position','Air Conditioning','Storage Room','Mall Security'],
  true, '2026-09-15', 321, 15, 4.0, 6, true, false,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567010'
),
(
  'Eco-Friendly Townhouse in Lagos',
  'Modern eco-friendly townhouse featuring solar panels, rainwater harvesting, and energy-efficient design. Open-plan living with double-volume ceilings, private garden, and access to communal green spaces.',
  15500, 'rent', 'R', 'Townhouse', 'Residential', 3, 2, 2, 160, 'sqm', false, true,
  ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
  '45 Lekki Phase 1', 'Lekki', 'Lagos', 'Lagos State', 'Nigeria', 6.4541, 3.4615,
  ARRAY['Solar Panels','Rainwater Harvesting','Garden','Walking Trails','Security','Fibre Internet'],
  true, '2026-08-15', 678, 78, 4.7, 19, true, false,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567011'
),
(
  'Beach Lodge Retreat - Zanzibar',
  'Escape to this spectacular beach lodge in Zanzibar. 6 private chalets with en-suite bathrooms, central lodge with restaurant, water sports, and white sand beaches.',
  6800000, 'sale', 'R', 'Lodge', 'Hospitality', 6, 6, 15, 500, 'sqm', true, true,
  ARRAY['https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800','https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'],
  'Nungwi Beach Pass', 'Nungwi', 'Zanzibar', 'Zanzibar North', 'Tanzania', -5.7264, 39.2978,
  ARRAY['Restaurant','Beach Access','Water Sports','Ocean View','Swimming Pool','Spa','Conference Facility'],
  true, '2027-01-01', 2145, 234, 4.8, 56, true, true,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567012'
);

-- Done! Your database is now populated with sample data.
