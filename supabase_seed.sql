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

-- Insert Zimbabwe properties (Houses, Hotels, Lodges, Guest Houses, Villas)
insert into public.properties (title, description, price, price_type, currency, type, category, bedrooms, bathrooms, parking, size, size_unit, furnished, pet_friendly, images, address, suburb, city, province, country, lat, lng, amenities, available, available_date, views, saves, rating, review_count, verified, featured) values
(
  'Modern 3-Bed House in Borrowdale',
  'Executive 3-bedroom house in Borrowdale, Harare. Features modern solar power system, reliable borehole, lush garden, 24/7 security guard, and spacious open plan lounge. Solar power runs all lights and refrigeration.',
  1200, 'rent', '$', 'House', 'Residential', 3, 2, 2, 250, 'sqm', false, true,
  ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  '12 Borrowdale Road', 'Borrowdale', 'Harare', 'Harare Province', 'Zimbabwe', -17.7511, 31.0967,
  ARRAY['Solar Panels','Borehole','Security','Garden','Fibre Internet','Backup Power','Electric Gate'],
  true, '2026-08-15', 1540, 112, 4.9, 28, true, true
),
(
  'Luxury Apartment in Avondale',
  'Upmarket 2-bedroom furnished apartment in Avondale, close to Avondale Shopping Centre. Borehole water, invertor backup, fiber internet, and 24-hour security included.',
  750, 'rent', '$', 'Apartment', 'Residential', 2, 1, 1, 95, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
  '45 King George Road', 'Avondale', 'Harare', 'Harare Province', 'Zimbabwe', -17.7981, 31.0378,
  ARRAY['Furnished','Borehole','Backup Power','Fibre Internet','Security'],
  true, '2026-09-01', 980, 75, 4.8, 19, true, true
),
(
  'Spacious Family Home in Kumalo, Bulawayo',
  'Charming 4-bedroom family home in quiet Kumalo neighborhood. Large grounds with swimming pool, prolific borehole, staff quarters, and electric fencing.',
  900, 'rent', '$', 'House', 'Residential', 4, 3, 2, 320, 'sqm', false, true,
  ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'],
  '18 Coghlan Avenue', 'Kumalo', 'Bulawayo', 'Bulawayo Province', 'Zimbabwe', -20.1583, 28.6078,
  ARRAY['Pool','Borehole','Garden','Staff Quarters','Pet Friendly','Security'],
  true, '2026-08-20', 820, 64, 4.7, 14, true, true
),
(
  'Victoria Falls Safari Lodge Villa',
  'Stunning 3-bedroom holiday villa overlooking the Zambezi national park area. Swimming pool, outdoor deck, fully furnished, solar powered.',
  250000, 'sale', '$', 'Villa', 'Luxury', 3, 3, 2, 220, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
  'Squire Cummings Avenue', 'Victoria Falls', 'Victoria Falls', 'Matabeleland North', 'Zimbabwe', -17.9244, 25.8364,
  ARRAY['Pool','Solar Panels','Borehole','Furnished','National Park View','BBQ Area'],
  true, '2026-10-01', 3120, 245, 5.0, 42, true, true
),
(
  'Zambezi Sunset Hotel & Luxury Suites',
  'Boutique riverside hotel and luxury suites overlooking the Zambezi River in Victoria Falls. Infinity pool, fine dining restaurant, solar power backup, and sunset river cruise dock.',
  180, 'rent', '$', 'Hotel', 'Hospitality', 2, 2, 4, 110, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
  'Parkway Drive', 'Zambezi Riverbank', 'Victoria Falls', 'Matabeleland North', 'Zimbabwe', -17.9150, 25.8450,
  ARRAY['Pool','Solar Panels','Air Conditioning','Restaurant','Fibre Internet','Borehole'],
  true, '2026-08-01', 2450, 189, 4.9, 36, true, true
),
(
  'Highlands Garden Boutique Guest House',
  'Charming 6-suite guest house in the leafy suburb of Highlands, Harare. Lush botanical garden, heated pool, gourmet breakfast included, 10kVA solar power system.',
  120, 'rent', '$', 'Guest House', 'Hospitality', 1, 1, 2, 45, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800','https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800'],
  '24 Enterprise Road', 'Highlands', 'Harare', 'Harare Province', 'Zimbabwe', -17.8012, 31.0894,
  ARRAY['Solar Panels','Borehole','Pool','Garden','Fibre Internet','Breakfast Included'],
  true, '2026-08-05', 1120, 94, 4.8, 22, true, false
),
(
  'Kariba Sun Bay Resort & Hotel Chalets',
  'Waterfront resort hotel and private self-catering chalets along Lake Kariba. Spectacular sunset views, private boat jetty, air conditioned rooms, and solar inverter system.',
  220, 'rent', '$', 'Hotel', 'Hospitality', 2, 2, 3, 130, 'sqm', true, true,
  ARRAY['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800','https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'],
  'Lake Heights Drive', 'Kariba Heights', 'Kariba', 'Mashonaland West', 'Zimbabwe', -16.5167, 28.8000,
  ARRAY['Pool','Solar Panels','Air Conditioning','Boat Cruise Jetty','Restaurant','Lake View'],
  true, '2026-08-10', 3200, 260, 4.9, 45, true, true
),
(
  'Nyanga Mountain Pine Lodge Chalet',
  'Rustic stone pine chalet surrounded by Nyanga mountain pine forests and natural waterfalls. Cozy stone fireplace, private balcony, full solar setup, and mountain hiking trails.',
  150, 'rent', '$', 'Lodge', 'Residential', 3, 2, 2, 180, 'sqm', true, true,
  ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800','https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800'],
  'Troutbeck Road', 'Troutbeck', 'Nyanga', 'Manicaland', 'Zimbabwe', -18.2833, 32.7500,
  ARRAY['Solar Panels','Fireplace','Mountain View','Garden','BBQ Area','Borehole'],
  true, '2026-08-12', 1890, 140, 4.9, 31, true, true
),
(
  'Executive 4-Bed House in Glen Lorne',
  'Prestige double-storey mansion in Glen Lorne, Harare. Prolific borehole, 15kVA solar system, sparkling swimming pool, floodlit tennis court, and staff accommodation.',
  1500, 'rent', '$', 'House', 'Residential', 4, 3, 3, 450, 'sqm', false, true,
  ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  '15 Fowey Road', 'Glen Lorne', 'Harare', 'Harare Province', 'Zimbabwe', -17.7400, 31.1250,
  ARRAY['Solar Panels','Borehole','Pool','Tennis Court','Security','Garden','Staff Quarters'],
  true, '2026-09-01', 1420, 110, 4.8, 16, true, false
),
(
  'Vumba Mist Boutique Hotel & Spa Suites',
  'Serene boutique hotel suites situated amidst the misty forests of Vumba mountains. On-site wellness spa, gourmet restaurant, private golf access, and solar backup.',
  140, 'rent', '$', 'Hotel', 'Hospitality', 1, 1, 2, 55, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800','https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'],
  'Bunga Forest Drive', 'Vumba Heights', 'Mutare', 'Manicaland', 'Zimbabwe', -19.0833, 32.7500,
  ARRAY['Solar Panels','Restaurant','Spa','Forest View','Fireplace','Fibre Internet'],
  true, '2026-08-15', 1650, 130, 4.9, 27, true, true
),
(
  'Modern Duplex Townhouse in Mt Pleasant',
  'Newly built 3-bedroom townhouse unit in Mount Pleasant, Harare. Solar power system, dedicated borehole connection, electric fencing, and open plan granite kitchen.',
  850, 'rent', '$', 'Townhouse', 'Residential', 3, 2, 2, 160, 'sqm', false, false,
  ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
  '8 Bond Street', 'Mount Pleasant', 'Harare', 'Harare Province', 'Zimbabwe', -17.7800, 31.0500,
  ARRAY['Solar Panels','Borehole','Security','Fibre Internet'],
  true, '2026-08-20', 940, 72, 4.7, 15, true, false
),
(
  'Hillside Executive Manor & Hotel Suites',
  'Upmarket hotel suites and executive residence in Hillside, Bulawayo. Landscaped grounds, swimming pool, solar power backup, high speed Wi-Fi, and 24-hour security.',
  95, 'rent', '$', 'Hotel', 'Hospitality', 1, 1, 2, 50, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800','https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
  '14 Cecil Avenue', 'Hillside', 'Bulawayo', 'Bulawayo Province', 'Zimbabwe', -20.1800, 28.6150,
  ARRAY['Pool','Solar Panels','Borehole','Fibre Internet','Furnished'],
  true, '2026-08-10', 890, 68, 4.8, 18, true, false
),
(
  'Luxury Golf Estate Villa in Borrowdale Brooke',
  'Palatial 5-bedroom villa inside the exclusive Borrowdale Brooke Golf Estate. Championship golf course views, heated pool, full solar system, and supreme 24-hour security.',
  350000, 'sale', '$', 'Villa', 'Luxury', 5, 5, 3, 580, 'sqm', true, true,
  ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
  'Brooke Fairway Drive', 'Borrowdale Brooke', 'Harare', 'Harare Province', 'Zimbabwe', -17.7200, 31.1400,
  ARRAY['Pool','Solar Panels','Golf Course View','Borehole','Security','Smart Home'],
  true, '2026-10-01', 4200, 310, 5.0, 50, true, true
),
(
  'Gweru Central Executive Hotel Suites',
  'Modern executive hotel suite in central Gweru. Air-conditioned, high-speed fiber Wi-Fi, solar inverter power, complimentary breakfast, and secure vehicle parking.',
  80, 'rent', '$', 'Hotel', 'Hospitality', 1, 1, 1, 40, 'sqm', true, false,
  ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
  'Main Street', 'CBD', 'Gweru', 'Midlands', 'Zimbabwe', -19.4500, 29.8167,
  ARRAY['Solar Panels','Air Conditioning','Fibre Internet','Furnished','Breakfast Included'],
  true, '2026-08-12', 750, 52, 4.7, 12, true, false
);
