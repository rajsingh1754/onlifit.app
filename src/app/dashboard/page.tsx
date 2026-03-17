"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Profile } from "@/types";
import Link from "next/link";

const PLAN_LABEL: Record<string, string> = {
  offline: "Onlifit Regular",
  virtual: "Onlifit Live",
  elite: "Onlifit Elite",
};

const PLAN_GRADIENT: Record<string, string> = {
  offline: "from-accent/20 to-accent/5",
  virtual: "from-orange/20 to-orange/5",
  elite: "from-gold/20 to-gold/5",
};

const PLAN_ACCENT: Record<string, string> = {
  offline: "text-accent",
  virtual: "text-orange",
  elite: "text-gold",
};

const PLAN_BORDER: Record<string, string> = {
  offline: "border-accent/20",
  virtual: "border-orange/20",
  elite: "border-gold/20",
};

const PLAN_BG: Record<string, string> = {
  offline: "bg-accent/10 text-accent",
  virtual: "bg-orange/10 text-orange",
  elite: "bg-gold/10 text-gold",
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
  completed: { bg: "bg-white/5", text: "text-muted", dot: "bg-white/30" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
};

interface DashboardBooking {
  id: string;
  status: string;
  start_date: string;
  duration_months: number;
  time_preference: string;
  booked_slot: string;
  created_at: string;
  trainer: {
    id: string;
    bio: string;
    specializations: string[];
    experience_years: number;
    rating: number;
    plan_types: string[];
    profile: {
      full_name: string;
      avatar_url: string | null;
      phone: string;
    };
  };
  plan: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sessions_per_month: number;
    schedule: string;
  };
}

/* ─── Animated Progress Ring ─── */
function ProgressRing({ percent, size = 56, stroke = 4, accentClass = "stroke-accent" }: { percent: number; size?: number; stroke?: number; accentClass?: string }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        className={accentClass}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={mounted ? offset : circ}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />
    </svg>
  );
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

function getDaysRemaining(startDate: string, months: number) {
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + months);
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function getProgress(startDate: string, months: number) {
  const start = new Date(startDate).getTime();
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + months);
  const total = end.getTime() - start;
  const elapsed = Date.now() - start;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "past">("active");
  const [mounted, setMounted] = useState(false);
  const greeting = useGreeting();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
    setMounted(true);
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, bookingsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("bookings")
        .select("*, trainer:trainers(id, bio, specializations, experience_years, rating, plan_types, profile:profiles(full_name, avatar_url, phone)), plan:plans(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    setProfile(profileRes.data);
    setBookings((bookingsRes.data as DashboardBooking[]) || []);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
          </div>
          <p className="text-muted text-sm animate-pulse">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const activeBookings = bookings.filter((b) => ["pending", "confirmed", "active"].includes(b.status));
  const pastBookings = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));
  const totalSessions = activeBookings.reduce((sum, b) => sum + ((b.plan?.sessions_per_month || 0) * (b.duration_months || 1)), 0);
  const monthlySpend = activeBookings.reduce((sum, b) => sum + (b.plan?.price || 0), 0);
  const nextBooking = activeBookings[0];
  const currentList = tab === "active" ? activeBookings : pastBookings;

  return (
    <div className="min-h-screen bg-bg">
      {/* ─── Sticky Header ─── */}
      <header className="border-b border-border bg-bg/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-white">
            Onli<em className="text-accent italic">fit</em>
          </Link>
          <div className="flex items-center gap-5">
            {profile?.role === "admin" && (
              <Link href="/admin" className="text-xs font-bold text-bg bg-accent px-3 py-1.5 rounded-md hover:bg-accent-dark transition-all">
                Admin
              </Link>
            )}
            {profile?.role === "trainer" && (
              <Link href="/trainer/dashboard" className="text-xs font-bold text-bg bg-accent px-3 py-1.5 rounded-md hover:bg-accent-dark transition-all">
                Trainer Dashboard
              </Link>
            )}
            <Link href="/trainers" className="text-sm text-muted hover:text-white transition-colors">
              Trainers
            </Link>
            <button onClick={handleSignOut} className="text-sm text-muted hover:text-white transition-colors">
              Sign out
            </button>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-accent text-xs font-bold">{profile?.full_name?.charAt(0) || "U"}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10">
        {/* ─── Greeting ─── */}
        <div className={`mb-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-muted text-sm font-medium mb-1">{greeting}</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white tracking-tight">
            {profile?.full_name?.split(" ")[0] || "there"}
            <span className="text-accent">.</span>
          </h1>
        </div>

        {/* ─── Stats Grid ─── */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {[
            { label: "Active Plans", value: activeBookings.length, icon: "⚡", gradient: "from-accent/10 via-transparent to-transparent" },
            { label: "Total Sessions", value: totalSessions, icon: "🏋️", gradient: "from-orange/10 via-transparent to-transparent" },
            { label: "Monthly Spend", value: monthlySpend, prefix: "₹", icon: "💰", gradient: "from-gold/10 via-transparent to-transparent", accent: true },
            { label: "Bookings", value: bookings.length, icon: "📊", gradient: "from-teal-500/10 via-transparent to-transparent" },
          ].map((stat) => (
            <div key={stat.label} className="group relative bg-card border border-border rounded-2xl p-5 overflow-hidden hover:border-border-2 transition-all duration-300 hover:-translate-y-0.5">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-muted text-[11px] font-bold uppercase tracking-widest">{stat.label}</p>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <p className={`font-serif text-3xl ${stat.accent ? "text-accent" : "text-white"}`}>
                  <AnimatedNumber value={stat.value} prefix={stat.prefix || ""} />
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Next Session Spotlight ─── */}
        {nextBooking && tab === "active" && (
          <div className={`mb-10 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <h2 className="text-white text-sm font-semibold uppercase tracking-wider">Current Plan</h2>
            </div>
            <div className={`relative rounded-3xl overflow-hidden border ${PLAN_BORDER[nextBooking.trainer?.plan_types?.[0] || "virtual"]} bg-gradient-to-r ${PLAN_GRADIENT[nextBooking.trainer?.plan_types?.[0] || "virtual"]} bg-card`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,241,53,0.05),transparent_60%)]" />
              <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
                {/* Trainer info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-bg-3 border border-border overflow-hidden flex-shrink-0 ring-2 ring-white/5">
                    {nextBooking.trainer?.profile?.avatar_url ? (
                      <img src={nextBooking.trainer.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-lg font-serif">{nextBooking.trainer?.profile?.full_name?.charAt(0) || "T"}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-white font-semibold text-lg truncate">{nextBooking.trainer?.profile?.full_name}</h3>
                      <span className="text-yellow-400 text-xs">★ {nextBooking.trainer?.rating?.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${PLAN_BG[nextBooking.trainer?.plan_types?.[0] || "virtual"]}`}>
                        {PLAN_LABEL[nextBooking.trainer?.plan_types?.[0] || "virtual"]}
                      </span>
                      <span className="text-muted text-xs">
                        {nextBooking.booked_slot
                          ? `🕐 ${formatSlotLabel(nextBooking.booked_slot)}`
                          : TIME_LABELS[nextBooking.time_preference]
                            ? `${TIME_LABELS[nextBooking.time_preference].icon} ${TIME_LABELS[nextBooking.time_preference].label}`
                            : "—"}
                      </span>
                    </div>
                    <p className="text-muted text-xs mt-1.5">
                      {nextBooking.plan?.sessions_per_month} sessions/month · {nextBooking.duration_months || 1} {(nextBooking.duration_months || 1) === 1 ? "month" : "months"}
                    </p>
                  </div>
                </div>

                {/* Progress ring + price */}
                <div className="flex items-center gap-5 flex-shrink-0">
                  {nextBooking.start_date && (
                    <div className="relative">
                      <ProgressRing
                        percent={getProgress(nextBooking.start_date, nextBooking.duration_months || 1)}
                        size={64} stroke={4}
                        accentClass={`stroke-current ${PLAN_ACCENT[nextBooking.trainer?.plan_types?.[0] || "virtual"]}`}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{getProgress(nextBooking.start_date, nextBooking.duration_months || 1)}%</span>
                      </div>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="font-serif text-3xl text-white">₹{((nextBooking.plan?.price || 0) * (nextBooking.duration_months || 1)).toLocaleString("en-IN")}</p>
                    <p className="text-muted text-[11px] mt-0.5">
                      {nextBooking.start_date ? `Ends ${getEndDate(nextBooking.start_date, nextBooking.duration_months || 1)}` : "Pending start"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {nextBooking.start_date && (
                <div className="px-6 sm:px-8 pb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-muted">{getDaysRemaining(nextBooking.start_date, nextBooking.duration_months || 1)} days left</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${nextBooking.trainer?.plan_types?.[0] === "elite" ? "bg-gold" : nextBooking.trainer?.plan_types?.[0] === "virtual" ? "bg-orange" : "bg-accent"}`}
                      style={{ width: `${Math.max(2, getProgress(nextBooking.start_date, nextBooking.duration_months || 1))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="border-t border-white/5 px-6 sm:px-8 py-3 flex items-center gap-4">
                <Link href={`/trainers/${nextBooking.trainer?.id}`} className="text-xs text-accent font-semibold hover:underline transition-all">
                  View profile →
                </Link>
                {nextBooking.trainer?.profile?.phone && (
                  <a href={`tel:${nextBooking.trainer.profile.phone}`} className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1">
                    📞 Call trainer
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Tabs ─── */}
        <div className={`flex items-center justify-between mb-6 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex gap-1 bg-bg-2 rounded-xl p-1">
            {(["active", "past"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t ? "bg-white text-bg shadow-lg shadow-white/5" : "text-muted hover:text-white"
                }`}
              >
                {t === "active" ? `Active (${activeBookings.length})` : `History (${pastBookings.length})`}
              </button>
            ))}
          </div>
          <Link href="/trainers" className="hidden sm:flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline">
            <span>Browse trainers</span>
            <span>→</span>
          </Link>
        </div>

        {/* ─── Booking Cards ─── */}
        <div className="space-y-4">
          {/* Empty states */}
          {tab === "active" && activeBookings.length === 0 && (
            <div className="relative rounded-3xl border border-dashed border-border-2 p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,241,53,0.04),transparent_70%)]" />
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🚀</span>
                </div>
                <h3 className="text-white font-serif text-3xl mb-3">Start your journey</h3>
                <p className="text-muted text-sm mb-8 max-w-md mx-auto leading-relaxed">
                  Connect with Hyderabad&apos;s top verified trainers. Choose a plan that fits your goals and schedule.
                </p>
                <Link href="/trainers" className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent text-bg font-bold text-sm rounded-xl hover:bg-accent-dark transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5">
                  Find your trainer
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>
            </div>
          )}

          {tab === "past" && pastBookings.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border-2 p-12 text-center">
              <p className="text-muted text-sm">No past bookings yet</p>
            </div>
          )}

          {/* Booking list (skip first active if shown in spotlight) */}
          {currentList.map((booking, i) => {
            if (tab === "active" && i === 0) return null; // shown in spotlight
            const tp = booking.trainer?.profile;
            const plan = booking.plan;
            const planType = booking.trainer?.plan_types?.[0] || "virtual";
            const progress = booking.start_date ? getProgress(booking.start_date, booking.duration_months || 1) : 0;
            const daysLeft = booking.start_date ? getDaysRemaining(booking.start_date, booking.duration_months || 1) : null;
            const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

            return (
              <div
                key={booking.id}
                className={`group bg-card border border-border rounded-2xl overflow-hidden hover:border-border-2 transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${300 + i * 80}ms` }}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Avatar + ring */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-bg-3 border border-border overflow-hidden">
                        {tp?.avatar_url ? (
                          <img src={tp.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted text-lg font-serif">{tp?.full_name?.charAt(0) || "T"}</span>
                          </div>
                        )}
                      </div>
                      {tab === "active" && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{tp?.full_name}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${PLAN_BG[planType]}`}>
                          {PLAN_LABEL[planType]}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text}`}>
                          <span className={`w-1 h-1 rounded-full ${status.dot}`} />
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-muted text-xs mb-3">
                        {plan?.sessions_per_month} sessions/mo · {booking.duration_months || 1}mo · {booking.booked_slot
                          ? `🕐 ${formatSlotLabel(booking.booked_slot)}`
                          : TIME_LABELS[booking.time_preference]
                            ? `${TIME_LABELS[booking.time_preference].icon} ${TIME_LABELS[booking.time_preference].label}`
                            : "—"}
                      </p>

                      {/* Meta pills */}
                      <div className="flex flex-wrap gap-2">
                        {booking.start_date && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-3 text-[11px] text-muted">
                            <span className="text-white/60">📅</span>
                            {new Date(booking.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {getEndDate(booking.start_date, booking.duration_months || 1)}
                          </span>
                        )}
                        {tab === "active" && daysLeft !== null && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-3 text-[11px] text-muted">
                            ⏳ {daysLeft}d left
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price + progress */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {tab === "active" && booking.start_date && (
                        <div className="relative hidden sm:block">
                          <ProgressRing percent={progress} size={48} stroke={3} accentClass={`stroke-current ${PLAN_ACCENT[planType]}`} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">{progress}%</span>
                          </div>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="font-serif text-xl text-white">₹{((plan?.price || 0) * (booking.duration_months || 1)).toLocaleString("en-IN")}</p>
                        <p className="text-muted text-[10px]">total</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expand bar on hover */}
                <div className="border-t border-border px-5 sm:px-6 py-2.5 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                  <Link href={`/trainers/${booking.trainer?.id}`} className="text-xs text-accent font-semibold hover:underline">
                    View profile →
                  </Link>
                  {tp?.phone && (
                    <a href={`tel:${tp.phone}`} className="text-xs text-muted hover:text-white transition-colors">📞 {tp.phone}</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
