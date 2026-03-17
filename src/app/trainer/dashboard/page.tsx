"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Profile } from "@/types";
import Link from "next/link";

/* ─── Constants ─── */
const PLAN_LABEL: Record<string, string> = {
  offline: "Onlifit Regular",
  virtual: "Onlifit Live",
  elite: "Onlifit Elite",
};
const PLAN_ACCENT: Record<string, string> = {
  offline: "text-accent",
  virtual: "text-orange",
  elite: "text-gold",
};
const PLAN_BG: Record<string, string> = {
  offline: "bg-accent/10 text-accent",
  virtual: "bg-orange/10 text-orange",
  elite: "bg-gold/10 text-gold",
};
const PLAN_BORDER: Record<string, string> = {
  offline: "border-accent/20",
  virtual: "border-orange/20",
  elite: "border-gold/20",
};
const PLAN_GRADIENT: Record<string, string> = {
  offline: "from-accent/20 to-accent/5",
  virtual: "from-orange/20 to-orange/5",
  elite: "from-gold/20 to-gold/5",
};
const TIME_LABELS: Record<string, { label: string; icon: string }> = {
  morning: { label: "6 – 10 AM", icon: "🌅" },
  afternoon: { label: "12 – 4 PM", icon: "☀️" },
  evening: { label: "5 – 9 PM", icon: "🌙" },
};
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-accent/10", text: "text-accent", dot: "bg-accent" },
  confirmed: { bg: "bg-teal-500/10", text: "text-teal-400", dot: "bg-teal-400" },
  pending: { bg: "bg-gold/10", text: "text-gold", dot: "bg-gold" },
  completed: { bg: "bg-gray-50", text: "text-muted", dot: "bg-white/30" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
};

const TRAINER_EARNING: Record<string, number> = {
  offline: 5100,
  virtual: 6000,
  elite: 11000,
};

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_SHORT: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

/* ─── Types ─── */
interface TrainerRecord {
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
  created_at: string;
}

interface ClientBooking {
  id: string;
  user_id: string;
  status: string;
  start_date: string;
  duration_months: number;
  time_preference: string;
  booked_slot: string;
  created_at: string;
  profile: { full_name: string; avatar_url: string | null; email: string; phone: string };
  plan: { name: string; slug: string; price: number; sessions_per_month: number };
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profile: { full_name: string; avatar_url: string | null };
}

interface SlotItem {
  id: string;
  day: string;
  time: string;
  is_available: boolean;
}

/* ─── Animated Counter ─── */
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>{prefix}{display.toLocaleString("en-IN")}{suffix}</span>;
}

function formatSlotLabel(slot: string) {
  if (!slot) return "";
  const parts = slot.split(":");
  const day = parts[0];
  const time = parts.slice(1).join(":");
  const [h] = time.split(":");
  const hr = parseInt(h);
  const timeStr = hr === 0 ? "12 AM" : hr < 12 ? `${hr} AM` : hr === 12 ? "12 PM" : `${hr - 12} PM`;
  return `${day.charAt(0).toUpperCase() + day.slice(1)} ${timeStr}`;
}

/* ─── Progress Ring ─── */
function ProgressRing({ percent, size = 56, stroke = 4, accentClass = "stroke-accent" }: { percent: number; size?: number; stroke?: number; accentClass?: string }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className={accentClass} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={mounted ? offset : circ}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />
    </svg>
  );
}

function useGreeting() {
  const [greeting, setGreeting] = useState("Hey");
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);
  return greeting;
}

function getEndDate(startDate: string, months: number) {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Star Rating ─── */
function Stars({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  return (
    <span className={`${size} inline-flex gap-0.5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "text-gold" : "text-gray-900/10"}>★</span>
      ))}
    </span>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function TrainerDashboard() {
  const supabase = createClient();
  const greeting = useGreeting();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [trainer, setTrainer] = useState<TrainerRecord | null>(null);
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"overview" | "clients" | "earnings" | "schedule" | "reviews">("overview");

  useEffect(() => {
    fetchAll();
    setMounted(true);
  }, []);

  async function fetchAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(prof);

      const { data: trainerData } = await supabase.from("trainers").select("*").eq("profile_id", user.id).single();
      if (!trainerData) { setLoading(false); return; }

      // Redirect to pending page if not approved
      if (!trainerData.is_available) {
        window.location.href = "/trainer/pending";
        return;
      }

      setTrainer(trainerData);

      const [bookingsRes, reviewsRes, slotsRes] = await Promise.all([
        supabase.from("bookings")
          .select("*, profile:profiles!bookings_user_id_fkey(full_name, avatar_url, email, phone), plan:plans(*)")
          .eq("trainer_id", trainerData.id)
          .order("created_at", { ascending: false }),
        supabase.from("reviews")
          .select("*, profile:profiles!reviews_user_id_fkey(full_name, avatar_url)")
          .eq("trainer_id", trainerData.id)
          .order("created_at", { ascending: false }),
        supabase.from("trainer_slots")
          .select("*")
          .eq("trainer_id", trainerData.id)
          .order("time", { ascending: true }),
      ]);

      setBookings((bookingsRes.data as ClientBooking[]) || []);
      setReviews((reviewsRes.data as ReviewItem[]) || []);
      setSlots((slotsRes.data as SlotItem[]) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  /* ─── Computed data ─── */
  const activeBookings = bookings.filter((b) => ["active", "confirmed", "pending"].includes(b.status));
  const planType = trainer?.plan_types?.[0] || "offline";

  const totalEarnings = bookings
    .filter((b) => ["active", "completed"].includes(b.status))
    .reduce((sum, b) => sum + (TRAINER_EARNING[planType] || 5100) * (b.duration_months || 1), 0);

  const thisMonthEarnings = bookings
    .filter((b) => {
      const d = new Date(b.created_at);
      const now = new Date();
      return ["active", "completed"].includes(b.status) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + (TRAINER_EARNING[planType] || 5100) * (b.duration_months || 1), 0);

  const totalSessions = bookings
    .filter((b) => ["active", "completed"].includes(b.status))
    .reduce((sum, b) => sum + (b.plan?.sessions_per_month || 16) * (b.duration_months || 1), 0);

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    pct: reviews.length ? Math.round((reviews.filter((rev) => rev.rating === r).length / reviews.length) * 100) : 0,
  }));

  // Schedule grouped by day
  const scheduleByDay = DAYS_ORDER.map((day) => ({
    day,
    label: DAY_SHORT[day],
    slots: slots.filter((s) => s.day === day && s.is_available),
  }));

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
          </div>
          <p className="text-muted text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  /* ─── No trainer record ─── */
  if (!trainer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-5">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🏋️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Trainer Profile Found</h2>
          <p className="text-muted mb-6">You haven&apos;t applied as a trainer yet. Join Onlifit and start your training journey.</p>
          <Link href="/trainer/apply?ref=home" className="px-6 py-3 bg-accent rounded-lg text-bg font-bold hover:bg-accent-dark transition-all">
            Apply as Trainer
          </Link>
        </div>
      </div>
    );
  }

  const TABS = [
    { key: "overview" as const, label: "Overview", icon: "📊" },
    { key: "clients" as const, label: "Clients", icon: "👥", count: activeBookings.length },
    { key: "earnings" as const, label: "Earnings", icon: "💰" },
    { key: "schedule" as const, label: "Schedule", icon: "📅" },
    { key: "reviews" as const, label: "Reviews", icon: "⭐", count: reviews.length },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-gray-900">Onlifit</Link>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${PLAN_BG[planType]}`}>
              {PLAN_LABEL[planType]} Trainer
            </span>
            {!trainer.is_available && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/10 text-gold">
                Pending Review
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-muted hover:text-gray-900 transition-colors">User Dashboard</Link>
            <button onClick={handleSignOut} className="text-sm text-muted hover:text-gray-900 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* ─── Greeting ─── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {greeting}, <span className={PLAN_ACCENT[planType]}>{profile?.full_name?.split(" ")[0] || "Trainer"}</span>
          </h1>
          <p className="text-muted text-sm">Here&apos;s your training business at a glance</p>
        </div>

        {/* ─── Tab Navigation ─── */}
        <div className="flex gap-1 bg-bg-2 rounded-xl p-1 mb-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                tab === t.key ? "bg-white text-bg shadow-sm" : "text-muted hover:text-gray-900"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key ? "bg-bg text-gray-900" : "bg-gray-100 text-gray-900/60"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {tab === "overview" && (
          <div className={`space-y-6 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active Clients", value: activeBookings.length, icon: "👥", accent: "text-accent", ring: "stroke-accent", max: 20 },
                { label: "Total Earnings", value: totalEarnings, icon: "💰", accent: "text-accent", ring: "stroke-accent", prefix: "₹", max: 500000 },
                { label: "Avg Rating", value: trainer.rating, icon: "⭐", accent: "text-gold", ring: "stroke-[#FBBF24]", suffix: "/5", max: 5, raw: true },
                { label: "Total Sessions", value: totalSessions, icon: "🏋️", accent: "text-teal-400", ring: "stroke-teal-400", max: 500 },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="bg-white shadow-sm border border-gray-100 rounded-2xl p-5 hover:border-border-2 transition-all group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-muted text-xs font-medium mb-1">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.accent}`}>
                        {stat.raw ? <span>{stat.prefix}{stat.value}{stat.suffix}</span> :
                          <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />}
                      </p>
                    </div>
                    <ProgressRing percent={Math.min(100, (stat.value / stat.max) * 100)} size={48} stroke={3} accentClass={stat.ring} />
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Card + Quick Stats */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Profile Card */}
              <div className={`lg:col-span-1 bg-gradient-to-br ${PLAN_GRADIENT[planType]} border ${PLAN_BORDER[planType]} rounded-2xl p-6`}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-bg-3 border-2 border-border flex items-center justify-center mb-4 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🏋️</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{profile?.full_name}</h3>
                  <p className={`text-sm font-semibold ${PLAN_ACCENT[planType]} mb-3`}>{PLAN_LABEL[planType]} Trainer</p>
                  <div className="flex items-center gap-1 mb-4">
                    <Stars rating={trainer.rating} />
                    <span className="text-xs text-muted ml-1">({trainer.total_reviews})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                    {trainer.specializations.map((s) => (
                      <span key={s} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-50 text-muted">{s}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full mt-2">
                    <div className="bg-bg/40 rounded-xl p-3">
                      <p className="text-lg font-bold text-gray-900">{trainer.experience_years}</p>
                      <p className="text-[10px] text-muted">Yrs Exp</p>
                    </div>
                    <div className="bg-bg/40 rounded-xl p-3">
                      <p className="text-lg font-bold text-gray-900">{trainer.cities.join(", ")}</p>
                      <p className="text-[10px] text-muted">City</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Clients */}
              <div className="lg:col-span-2 bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Clients</h3>
                {activeBookings.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted text-sm">No active clients yet</p>
                    <p className="text-muted/60 text-xs mt-1">Clients will appear here once you get bookings</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeBookings.slice(0, 5).map((b) => {
                      const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                      return (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-2 border border-border hover:border-border-2 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-bg-3 border border-border flex items-center justify-center overflow-hidden">
                              {b.profile.avatar_url ? (
                                <img src={b.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold text-accent">{b.profile.full_name?.[0]}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{b.profile.full_name}</p>
                              <p className="text-xs text-muted">
                                {b.duration_months}mo · {b.booked_slot ? `🕐 ${formatSlotLabel(b.booked_slot)}` : TIME_LABELS[b.time_preference]?.label || b.time_preference}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${sc.bg} ${sc.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {b.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Latest Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Latest Reviews</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {reviews.slice(0, 3).map((r) => (
                    <div key={r.id} className="bg-bg-2 border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-bg-3 flex items-center justify-center overflow-hidden">
                          {r.profile.avatar_url ? (
                            <img src={r.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-accent">{r.profile.full_name?.[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{r.profile.full_name}</p>
                          <Stars rating={r.rating} size="text-xs" />
                        </div>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{r.comment || "No comment"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ CLIENTS TAB ═══ */}
        {tab === "clients" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">Your Clients</h2>
              <span className="text-xs text-muted">{bookings.length} total bookings</span>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-12 text-center">
                <span className="text-4xl mb-4 block">👥</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No clients yet</h3>
                <p className="text-muted text-sm">Once users book your training, they&apos;ll appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={b.id} className="bg-white shadow-sm border border-gray-100 rounded-2xl p-5 hover:border-border-2 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-bg-3 border border-border flex items-center justify-center overflow-hidden">
                            {b.profile.avatar_url ? (
                              <img src={b.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-bold text-accent">{b.profile.full_name?.[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-base font-bold text-gray-900">{b.profile.full_name}</p>
                            <p className="text-xs text-muted">{b.profile.email}</p>
                            {b.profile.phone && <p className="text-xs text-muted">{b.profile.phone}</p>}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {b.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider">Plan</p>
                          <p className={`text-sm font-semibold ${PLAN_ACCENT[b.plan.slug] || "text-gray-900"}`}>{b.plan.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider">Duration</p>
                          <p className="text-sm font-semibold text-gray-900">{b.duration_months} month{b.duration_months > 1 ? "s" : ""}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider">Time</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {b.booked_slot ? `🕐 ${formatSlotLabel(b.booked_slot)}` : TIME_LABELS[b.time_preference]?.label || b.time_preference}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider">Starts</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {b.start_date ? new Date(b.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "TBD"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ EARNINGS TAB ═══ */}
        {tab === "earnings" && (
          <div className="space-y-6">
            {/* Earnings Summary */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
                <p className="text-xs text-muted font-medium mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-accent">
                  <AnimatedNumber value={totalEarnings} prefix="₹" />
                </p>
                <p className="text-xs text-muted mt-1">{bookings.filter((b) => ["active", "completed"].includes(b.status)).length} paid bookings</p>
              </div>
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
                <p className="text-xs text-muted font-medium mb-1">This Month</p>
                <p className="text-3xl font-bold text-teal-400">
                  <AnimatedNumber value={thisMonthEarnings} prefix="₹" />
                </p>
                <p className="text-xs text-muted mt-1">{new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
              </div>
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
                <p className="text-xs text-muted font-medium mb-1">Per Client / Month</p>
                <p className="text-3xl font-bold text-orange">
                  ₹{(TRAINER_EARNING[planType] || 5100).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted mt-1">{PLAN_LABEL[planType]} rate</p>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Earnings Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted text-xs uppercase tracking-wider border-b border-border">
                      <th className="pb-3 pr-4">Client</th>
                      <th className="pb-3 pr-4">Duration</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4 text-right">Earning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings
                      .filter((b) => ["active", "completed"].includes(b.status))
                      .map((b) => {
                        const earning = (TRAINER_EARNING[planType] || 5100) * (b.duration_months || 1);
                        const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                        return (
                          <tr key={b.id} className="border-b border-border/50">
                            <td className="py-3 pr-4">
                              <p className="font-semibold text-gray-900">{b.profile.full_name}</p>
                            </td>
                            <td className="py-3 pr-4 text-muted">{b.duration_months} mo</td>
                            <td className="py-3 pr-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{b.status}</span>
                            </td>
                            <td className="py-3 pr-4 text-right font-bold text-accent">₹{earning.toLocaleString("en-IN")}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {bookings.filter((b) => ["active", "completed"].includes(b.status)).length === 0 && (
                  <p className="text-center text-muted text-sm py-8">No earnings yet</p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-2">💡 How Payouts Work</h3>
              <p className="text-xs text-muted leading-relaxed">
                Earnings are calculated per client per month. As a <span className={`font-semibold ${PLAN_ACCENT[planType]}`}>{PLAN_LABEL[planType]}</span> trainer,
                you earn <span className="font-bold text-gray-900">₹{(TRAINER_EARNING[planType] || 5100).toLocaleString("en-IN")}</span> per client/month.
                {planType === "offline" && " This includes ₹300 travel allowance."}
                {" "}Payouts are processed monthly to your registered bank account.
              </p>
            </div>
          </div>
        )}

        {/* ═══ SCHEDULE TAB ═══ */}
        {tab === "schedule" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Your Schedule</h2>
              <span className="text-xs text-muted">{slots.filter((s) => s.is_available).length} active slots</span>
            </div>

            {slots.length === 0 ? (
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-12 text-center">
                <span className="text-4xl mb-4 block">📅</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No schedule set</h3>
                <p className="text-muted text-sm">Your availability slots will appear here once configured.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {scheduleByDay.map(({ day, label, slots: daySlots }) => (
                  <div key={day} className="bg-white shadow-sm border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900">{label}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        daySlots.length > 0 ? "bg-accent/10 text-accent" : "bg-gray-50 text-muted"
                      }`}>
                        {daySlots.length} slots
                      </span>
                    </div>
                    {daySlots.length === 0 ? (
                      <p className="text-xs text-muted/50">Day off</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {daySlots.map((s) => (
                          <span key={s.id} className="text-[11px] font-medium px-2 py-1 rounded-md bg-bg-2 text-muted border border-border">
                            {s.time}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Active Clients Schedule */}
            {activeBookings.length > 0 && (
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Client Preferences</h3>
                <div className="space-y-3">
                  {activeBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-2 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-bg-3 flex items-center justify-center">
                          <span className="text-xs font-bold text-accent">{b.profile.full_name?.[0]}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{b.profile.full_name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted">
                          {b.booked_slot ? `🕐 ${formatSlotLabel(b.booked_slot)}` : TIME_LABELS[b.time_preference]?.label || b.time_preference}
                        </span>
                        <span className="text-xs text-muted">
                          Until {b.start_date ? getEndDate(b.start_date, b.duration_months) : "TBD"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ REVIEWS TAB ═══ */}
        {tab === "reviews" && (
          <div className="space-y-6">
            {/* Rating Overview */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center">
                <p className="text-5xl font-bold text-gray-900 mb-1">{trainer.rating}</p>
                <Stars rating={trainer.rating} size="text-lg" />
                <p className="text-xs text-muted mt-2">{trainer.total_reviews} review{trainer.total_reviews !== 1 ? "s" : ""}</p>
              </div>
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Rating Distribution</h4>
                <div className="space-y-2">
                  {ratingDist.map((rd) => (
                    <div key={rd.star} className="flex items-center gap-2">
                      <span className="text-xs text-muted w-3">{rd.star}</span>
                      <span className="text-xs text-gold">★</span>
                      <div className="flex-1 h-2 rounded-full bg-bg-2 overflow-hidden">
                        <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${rd.pct}%` }} />
                      </div>
                      <span className="text-xs text-muted w-8 text-right">{rd.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* All Reviews */}
            {reviews.length === 0 ? (
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-12 text-center">
                <span className="text-4xl mb-4 block">⭐</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-muted text-sm">Reviews from your clients will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white shadow-sm border border-gray-100 rounded-2xl p-5 hover:border-border-2 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-bg-3 border border-border flex items-center justify-center overflow-hidden">
                          {r.profile.avatar_url ? (
                            <img src={r.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-accent">{r.profile.full_name?.[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{r.profile.full_name}</p>
                          <Stars rating={r.rating} size="text-xs" />
                        </div>
                      </div>
                      <span className="text-xs text-muted">
                        {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-muted leading-relaxed mt-3 pl-[52px]">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
