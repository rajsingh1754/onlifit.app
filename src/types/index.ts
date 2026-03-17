export type UserRole = "user" | "trainer" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  city: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Trainer {
  id: string;
  profile_id: string;
  bio: string;
  specializations: string[];
  certifications: string[];
  experience_years: number;
  rating: number;
  total_reviews: number;
  plan_types: string[];
  cities: string[];
  is_verified: boolean;
  is_available: boolean;
  avatar_url: string | null;
  full_name: string;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  sessions_per_month: number;
  schedule: string;
  description: string;
  features: string[];
  is_popular: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  trainer_id: string;
  plan_id: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  start_date: string;
  created_at: string;
  trainer?: Trainer;
  plan?: Plan;
}

export interface TrainerSlot {
  id: string;
  trainer_id: string;
  day: string; // 'monday' | 'tuesday' | ...
  time: string; // '06:00' | '07:00' | ...
  is_available: boolean;
}

export interface Review {
  id: string;
  user_id: string;
  trainer_id: string;
  booking_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profile?: Profile;
}
