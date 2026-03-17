-- Onlifit Database Schema

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  phone text default '',
  city text default '',
  role text not null default 'user' check (role in ('user', 'trainer', 'admin')),
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trainers
create table public.trainers (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  bio text default '',
  specializations text[] default '{}',
  certifications text[] default '{}',
  experience_years int default 0,
  rating numeric(2,1) default 0.0,
  total_reviews int default 0,
  plan_types text[] default '{}', -- single value array: one of 'offline', 'virtual', 'elite'
  cities text[] default '{}',
  is_verified boolean default false,
  is_available boolean default true,
  created_at timestamptz default now()
);

alter table public.trainers enable row level security;

create policy "Trainers are viewable by everyone"
  on trainers for select using (true);

create policy "Trainers can update own record"
  on trainers for update using (auth.uid() = profile_id);

create policy "Users can create own trainer record"
  on trainers for insert with check (auth.uid() = profile_id);

-- Plans
create table public.plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  price int not null,
  sessions_per_month int not null,
  schedule text not null,
  description text default '',
  features text[] default '{}',
  is_popular boolean default false,
  created_at timestamptz default now()
);

alter table public.plans enable row level security;

create policy "Plans are viewable by everyone"
  on plans for select using (true);

-- Bookings
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  trainer_id uuid references public.trainers on delete cascade not null,
  plan_id uuid references public.plans on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  start_date date,
  duration_months int default 1,
  time_preference text default '' check (time_preference in ('', 'morning', 'afternoon', 'evening')),
  created_at timestamptz default now()
);

alter table public.bookings enable row level security;

create policy "Users can view own bookings"
  on bookings for select using (auth.uid() = user_id);

create policy "Users can create bookings"
  on bookings for insert with check (auth.uid() = user_id);

create policy "Trainers can view their bookings"
  on bookings for select using (
    auth.uid() in (select profile_id from trainers where id = bookings.trainer_id)
  );

-- Reviews
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  trainer_id uuid references public.trainers on delete cascade not null,
  booking_id uuid references public.bookings on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text default '',
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on reviews for select using (true);

create policy "Users can create reviews"
  on reviews for insert with check (auth.uid() = user_id);

-- Trainer weekly slots (set by trainer during profile creation)
create table public.trainer_slots (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.trainers on delete cascade not null,
  day text not null check (day in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  time text not null,
  is_available boolean default true,
  created_at timestamptz default now(),
  unique(trainer_id, day, time)
);

alter table public.trainer_slots enable row level security;

create policy "Slots are viewable by everyone"
  on trainer_slots for select using (true);

create policy "Trainers can manage own slots"
  on trainer_slots for all using (
    auth.uid() in (select profile_id from trainers where id = trainer_slots.trainer_id)
  );

create policy "Trainers can insert own slots"
  on trainer_slots for insert with check (
    auth.uid() in (select profile_id from trainers where id = trainer_slots.trainer_id)
  );

-- Trainer view with profile info (for browsing)
create or replace view public.trainer_profiles as
select
  t.*,
  p.full_name,
  p.avatar_url,
  p.city as profile_city,
  p.phone
from trainers t
join profiles p on t.profile_id = p.id
where t.is_available = true;
