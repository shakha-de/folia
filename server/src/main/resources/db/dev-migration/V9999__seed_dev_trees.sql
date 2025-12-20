INSERT INTO trees (public_id, species, common_name, location, soil_moisture_level, health_status, metadata, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Acer platanoides', 'Norway maple',
   ST_SetSRID(ST_MakePoint(13.4050, 52.5200), 4326),
  'MODERATE', 'HEALTHY', '{}'::jsonb, now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'Tilia cordata', 'Small-leaved lime',
  ST_SetSRID(ST_MakePoint(13.4095, 52.5206), 4326),
  'DRY', 'STRESSED', '{}'::jsonb, now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Quercus robur', 'English oak',
  ST_SetSRID(ST_MakePoint(13.3777, 52.5163), 4326),
  'WET', 'HEALTHY', '{}'::jsonb, now(), now())
ON CONFLICT (public_id) DO NOTHING;