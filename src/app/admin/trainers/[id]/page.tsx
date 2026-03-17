"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAdmin } from "../../admin-context";

const PLAN_LABEL: Record<string, string> = { offline: "Onlifit Regular", virtual: "Onlifit Live", elite: "Onlifit Elite" };
const PLAN_COLOR: Record<string, string> = {
  offline: "bg-accent/10 text-accent border-accent/30",
  virtual: "bg-orange/10 text-orange border-orange/30",
  elite: "bg-gold/10 text-gold border-gold/30",
};
const TRAINER_EARNING: Record<string, number> = { offline: 5100, virtual: 6000, elite: 11000 };
const STATUS_STYLE: Record<string, string> = {
  active: "bg-accent/10 text-accent", confirmed: "bg-teal-500/10 text-teal-400",
  pending: "bg-gold/10 text-gold", completed: "bg-white/5 text-muted", cancelled: "bg-red-500/10 text-red-400",
};
const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_SHORT: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

interface TrainerDetail {
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
  is_available: boolean;
  is_verified: boolean;
  created_at: string;
}

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  avatar_url: string | null;
}

interface BookingItem {
  id: string;
  user_id: string;
  status: string;
  start_date: string;
  booked_slot: string;
  duration_months: number;
  created_at: string;
  userName: string;
  planName: string;
  planSlug: string;
  planPrice: number;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  userName: string;
}

interface SlotItem {
  day: string;
  time: string;
}

export default function TrainerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { refreshCounts } = useAdmin();

  const [trainer, setTrainer] = useState<TrainerDetail | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"about" | "clients" | "schedule" | "reviews">("about");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (id) fetchAll(); }, [id]);

  async function fetchAll() {
    setLoading(true);

    // Fetch trainer
    const { data: t } = await supabase.from("trainers").select("*").eq("id", id).single();
    if (!t) { setLoading(false); return; }
    setTrainer(t);

    // Fetch profile
    const { data: p } = await supabase.from("profiles").select("full_name, email, phone, city, avatar_url").eq("id", t.profile_id).single();
    setProfile(p || { full_name: "Unknown", email: "", phone: "", city: "", avatar_url: null });

    // Fetch bookings, reviews, slots in parallel
    const [{ data: bData }, { data: rData }, { data: sData }] = await Promise.all([
      supabase.from("bookings").select("*, plans(name, slug, price)").eq("trainer_id", id).order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").eq("trainer_id", id).order("created_at", { ascending: false }),
      supabase.from("trainer_slots").select("day, time").eq("trainer_id", id).eq("is_available", true),
    ]);

    // Resolve user names for bookings
    if (bData && bData.length > 0) {
      const uids = [...new Set(bData.map((b: any) => b.user_id))];
      const { data: up } = await supabase.from("profiles").select("id, full_name").in("id", uids);
      const uMap = new Map((up || []).map((u: any) => [u.id, u.full_name]));
      setBookings(bData.map((b: any) => ({
        ...b,
        userName: uMap.get(b.user_id) || "Unknown",
        planName: b.plans?.name || "—",
        planSlug: b.plans?.slug || "",
        planPrice: b.plans?.price || 0,
      })));
    } else {
      setBookings([]);
    }

    // Resolve user names for reviews
    if (rData && rData.length > 0) {
      const rids = [...new Set(rData.map((r: any) => r.user_id))];
      const { data: rp } = await supabase.from("profiles").select("id, full_name").in("id", rids);
      const rMap = new Map((rp || []).map((u: any) => [u.id, u.full_name]));
      setReviews(rData.map((r: any) => ({ ...r, userName: rMap.get(r.user_id) || "User" })));
    } else {
      setReviews([]);
    }

    setSlots(sData || []);
    setLoading(false);
  }

  async function toggleAvailability() {
    if (!trainer) return;
    const newVal = !trainer.is_available;
    const msg = newVal ? "Reactivate this trainer?" : "Deactivate this trainer? They will be hidden from users.";
    if (!confirm(msg)) return;
    setActionLoading(true);
    await supabase.from("trainers").update({
      is_available: newVal,
      ...(newVal ? { is_verified: true } : {}),
    }).eq("id", trainer.id);
    setTrainer({ ...trainer, is_available: newVal, is_verified: newVal ? true : trainer.is_verified });
    refreshCounts();
    setActionLoading(false);
  }

  // Monthly stats
  const som = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthBookings = bookings.filter((b) => new Date(b.created_at) >= som);
  const activeClients = bookings.filter((b) => ["active", "confirmed"].includes(b.status)).length;
  const monthEarnings = monthBookings
    .filter((b) => ["active", "confirmed", "pending"].includes(b.status))
    .reduce((s, b) => s + (TRAINER_EARNING[b.planSlug] || 0), 0);

  // Group slots by day
  const groupedSlots: Record<string, string[]> = {};
  slots.forEach((s) => {
    if (!groupedSlots[s.day]) groupedSlots[s.day] = [];
    groupedSlots[s.day].push(s.time);
  });
  Object.values(groupedSlots).forEach((t) => t.sort());

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
    </div>
  );

  if (!trainer || !profile) return (
    <div className="text-center py-32">
      <p className="text-white text-lg font-semibold mb-2">Trainer not found</p>
      <Link href="/admin/trainers" className="text-accent text-sm hover:underline">← Back to trainers</Link>
    </div>
  );

  return (
    <div>
      {/* Back */}
      <Link href="/admin/trainers" className="text-muted text-sm hover:text-white transition-colors mb-6 inline-flex items-center gap-1">
        ← Back to trainers
      </Link>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 rounded-2xl bg-bg-3 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : <span className="text-muted text-3xl">👤</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="font-serif text-2xl text-white">{profile.full_name}</h1>
              {trainer.plan_types?.map((pt) => (
                <span key={pt} className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${PLAN_COLOR[pt] || "text-muted border-border"}`}>
                  {PLAN_LABEL[pt] || pt}
                </span>
              ))}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                trainer.is_available ? "bg-accent/10 text-accent" : "bg-red-500/10 text-red-400"
              }`}>
                {trainer.is_available ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted mb-3">
              <span>📧 {profile.email}</span>
              <span>📞 {profile.phone || "—"}</span>
              <span>📍 {profile.city || trainer.cities?.[0] || "—"}</span>
              <span>💼 {trainer.experience_years}y experience</span>
              <span>📅 Joined {new Date(trainer.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={actionLoading}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                trainer.is_available
                  ? "bg-orange/10 text-orange border border-orange/20 hover:bg-orange/20"
                  : "bg-accent text-bg hover:bg-accent-dark"
              }`}
            >
              {actionLoading ? "Processing…" : trainer.is_available ? "⚠ Deactivate Trainer" : "✓ Reactivate Trainer"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-2">Monthly Bookings</p>
          <p className="font-serif text-2xl text-white">{monthBookings.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-2">Active Clients</p>
          <p className="font-serif text-2xl text-teal-400">{activeClients}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-2">Monthly Earnings</p>
          <p className="font-serif text-2xl text-accent">₹{monthEarnings.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-2">Rating</p>
          <p className="font-serif text-2xl text-gold">
            {trainer.rating > 0 ? `${trainer.rating} ⭐` : "—"}
            {trainer.total_reviews > 0 && <span className="text-sm text-muted ml-1">({trainer.total_reviews})</span>}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-bg-2 rounded-xl p-1 w-fit">
        {(["about", "clients", "schedule", "reviews"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
              tab === t ? "bg-accent text-bg" : "text-muted hover:text-white"
            }`}
          >
            {t} {t === "clients" ? `(${bookings.length})` : t === "reviews" ? `(${reviews.length})` : ""}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "about" && (
        <div className="space-y-6">
          {/* Bio */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-3">Bio</h3>
            <p className="text-white/80 text-sm leading-relaxed">{trainer.bio || "No bio provided."}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Specializations */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-1.5">
                {trainer.specializations?.length > 0 ? trainer.specializations.map((s) => (
                  <span key={s} className="px-3 py-1 bg-bg-3 border border-border rounded-lg text-xs text-white">{s}</span>
                )) : <span className="text-muted text-xs">None listed</span>}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-1.5">
                {trainer.certifications?.length > 0 ? trainer.certifications.map((c) => (
                  <span key={c} className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg text-xs text-accent">{c}</span>
                )) : <span className="text-muted text-xs">None listed</span>}
              </div>
            </div>
          </div>

          {/* Cities */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-3">Service Cities</h3>
            <div className="flex flex-wrap gap-1.5">
              {trainer.cities?.length > 0 ? trainer.cities.map((c) => (
                <span key={c} className="px-3 py-1 bg-bg-3 border border-border rounded-lg text-xs text-white">📍 {c}</span>
              )) : <span className="text-muted text-xs">Not specified</span>}
            </div>
          </div>
        </div>
      )}

      {tab === "clients" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm">No bookings yet</div>
          ) : (
            <>
              <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-[10px] text-muted uppercase tracking-wider font-semibold">
                <div className="col-span-3">Client</div>
                <div className="col-span-2">Plan</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Slot</div>
                <div className="col-span-1">Start</div>
                <div className="col-span-1">Duration</div>
                <div className="col-span-2">Booked</div>
              </div>
              <div className="divide-y divide-border">
                {bookings.map((b) => (
                  <div key={b.id} className="px-5 py-3 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center flex flex-col gap-1.5 hover:bg-white/[0.01]">
                    <div className="col-span-3 text-white text-sm font-medium">{b.userName}</div>
                    <div className="col-span-2 text-white text-sm">{b.planName}</div>
                    <div className="col-span-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLE[b.status] || "bg-white/5 text-muted"}`}>{b.status}</span>
                    </div>
                    <div className="col-span-1 text-muted text-xs">{b.booked_slot || "—"}</div>
                    <div className="col-span-1 text-muted text-xs">{b.start_date ? new Date(b.start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</div>
                    <div className="col-span-1 text-muted text-xs">{b.duration_months}mo</div>
                    <div className="col-span-2 text-muted text-[11px]">{new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "schedule" && (
        <div className="bg-card border border-border rounded-2xl p-6">
          {slots.length === 0 ? (
            <div className="text-center py-8 text-muted text-sm">No available slots configured</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {DAYS_ORDER.filter((d) => groupedSlots[d]).map((day) => (
                <div key={day} className="bg-bg-3/50 border border-border rounded-xl p-4">
                  <p className="text-white text-sm font-semibold mb-2">{DAY_SHORT[day]}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {groupedSlots[day].map((t) => (
                      <span key={t} className="px-2.5 py-1 bg-accent/10 text-accent text-[11px] font-medium rounded-lg">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "reviews" && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted text-sm">No reviews yet</div>
          ) : reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-white text-sm font-medium">{r.userName}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={s <= r.rating ? "text-gold" : "text-white/10"}>★</span>
                  ))}
                </div>
                <span className="text-muted text-[11px] ml-auto">
                  {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              {r.comment && <p className="text-muted text-sm leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
