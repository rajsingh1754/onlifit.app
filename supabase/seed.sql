-- Seed data for Onlifit

-- Plans
insert into public.plans (name, slug, price, sessions_per_month, schedule, description, features, is_popular) values
(
  'Dedicated Offline',
  'offline',
  7999,
  16,
  'Mon–Thu',
  'Your trainer physically comes to your gym. QR check-in per session. Trainer carries an official Onlifit ID card.',
  ARRAY['Trainer visits your gym in person', '4 sessions per week, Mon–Thu', 'QR check-in per session', 'Works at your existing gym', 'Official Onlifit trainer ID'],
  false
),
(
  'Standard Virtual',
  'virtual',
  4999,
  20,
  'Mon–Fri',
  'Live 1-on-1 video every weekday. Real-time form correction. Train from home or gym.',
  ARRAY['Live 1-on-1 video every weekday', 'Real-time form correction', 'Session recordings available', 'Train from home or gym', 'Cheapest daily training option'],
  true
),
(
  'Elite',
  'elite',
  14999,
  20,
  'Mon–Fri',
  'Top certified trainers with proven track records. Custom plan before you pay. Nutrition guidance included.',
  ARRAY['Top certified trainers only', 'Custom plan before you pay', 'Nutrition guidance included', 'Priority support & trainer matching', 'Proven track record trainers'],
  false
);
