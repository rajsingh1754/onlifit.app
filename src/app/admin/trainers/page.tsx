"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useAdmin } from "../admin-context";

const PLAN_LABEL: Record<string, string> = { offline: "Regular", virtual: "Live", elite: "Elite" };
const PLAN_COLOR: Record<string, string> = {
  offline: "bg-accent/10 text-accent border-accent/30",
  virtual: "bg-orange/10 text-orange border-orange/30",
  elite: "bg-gold/10 text-gold border-gold/30",
};
const TRAINER_EARNING: Record<string, number> = { offline: 5100, virtual: 6000, elite: 11000 };

interface Trainer {
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
  profile: { full_name: string; email: string; phone: string; city: string; avatar_url: string | null };
  monthlyBookings: number;
  monthlyEarnings: number;
}

export default function TrainersPage() {
  const supabase = createClient();
  const { refreshCounts } = useAdmin();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => { fetchTrainers(); }, []);

  async function fetchTrainers() {
    setLoading(true);
    const { data: active } = await supabase
      .from("trainers").select("*").eq("is_available", true).order("created_at", { ascending: false });

    if (!active || active.length === 0) { setTrainers([]); setLoading(false); return; }

    const pids = active.map((t: any) => t.profile_id);
    const tids = active.map((t: any) => t.id);
    const som = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [{ data: profiles }, { data: bookings }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, phone, city, avatar_url").in("id", pids),
      supabase.from("bookings").select("id, trainer_id, status, plans(slug, price)").in("trainer_id", tids).gte("created_at", som),
    ]);

    const pMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    // Monthly stats per trainer
    const bMap = new Map<string, { count: number; earnings: number }>();
    (bookings || []).forEach((b: any) => {
      if (!["active", "confirmed", "pending"].includes(b.status)) return;
      const cur = bMap.get(b.trainer_id) || { count: 0, earnings: 0 };
      cur.count++;
      cur.earnings += TRAINER_EARNING[b.plans?.slug] || 0;
      bMap.set(b.trainer_id, cur);
    });

    setTrainers(active.map((t: any) => ({
      ...t,
      profile: pMap.get(t.profile_id) || { full_name: "Unknown", email: "", phone: "", city: "", avatar_url: null },
      monthlyBookings: bMap.get(t.id)?.count || 0,
      monthlyEarnings: bMap.get(t.id)?.earnings || 0,
    })));
    setLoading(false);
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this trainer? They will no longer be visible to users.")) return;
    setActionId(id);
    await supabase.from("trainers").update({ is_available: false }).eq("id", id);
    await fetchTrainers();
    refreshCounts();
    setActionId(null);
  }

  const filtered = trainers.filter((t) => {
    const matchSearch = !search || t.profile.full_name.toLowerCase().includes(search.toLowerCase()) || t.profile.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || t.plan_types?.includes(planFilter);
    return matchSearch && matchPlan;
  });

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-white mb-1">Trainers</h1>
        <p className="text-muted text-sm">{trainers.length} active trainer{trainers.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2.5 bg-card border border-border rounded-xl text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/40 sm:w-72"
        />
        <div className="flex gap-1 bg-bg-2 rounded-xl p-1">
          {["all", "offline", "virtual", "elite"].map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                planFilter === p ? "bg-accent text-bg" : "text-muted hover:text-white"
              }`}
            >
              {p === "all" ? "All" : PLAN_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <p className="text-4xl mb-3">💪</p>
          <p className="text-white font-semibold text-lg">No trainers found</p>
          <p className="text-muted text-sm mt-1">{search ? "Try a different search term." : "No active trainers yet."}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-2xl p-5 hover:border-white/10 transition-all">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-bg-3 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {t.profile.avatar_url ? (
                    <img src={t.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : <span className="text-muted text-lg">👤</span>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link href={`/admin/trainers/${t.id}`} className="text-white font-semibold text-lg hover:text-accent transition-colors">
                      {t.profile.full_name}
                    </Link>
                    {t.plan_types?.map((pt) => (
                      <span key={pt} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${PLAN_COLOR[pt] || "text-muted border-border"}`}>
                        {PLAN_LABEL[pt] || pt}
                      </span>
                    ))}
                    {t.is_verified && <span className="text-accent text-xs">✓ Verified</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted mb-3">
                    <span>📧 {t.profile.email}</span>
                    <span>📞 {t.profile.phone || "—"}</span>
                    <span>📍 {t.profile.city || t.cities?.[0] || "—"}</span>
                    <span>💼 {t.experience_years}y exp</span>
                    <span>⭐ {t.rating > 0 ? `${t.rating} (${t.total_reviews})` : "No reviews"}</span>
                  </div>

                  {/* Monthly Stats */}
                  <div className="flex gap-4">
                    <div className="px-3 py-2 bg-bg-3/50 border border-border rounded-lg">
                      <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">This Month</p>
                      <p className="text-white text-sm font-semibold">{t.monthlyBookings} booking{t.monthlyBookings !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="px-3 py-2 bg-bg-3/50 border border-border rounded-lg">
                      <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Est. Earnings</p>
                      <p className="text-accent text-sm font-semibold">₹{t.monthlyEarnings.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/trainers/${t.id}`}
                    className="px-5 py-2.5 bg-accent/10 text-accent border border-accent/20 rounded-xl text-xs font-bold hover:bg-accent/20 transition-all text-center"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleDeactivate(t.id)}
                    disabled={actionId === t.id}
                    className="px-5 py-2.5 bg-orange/10 text-orange border border-orange/20 rounded-xl text-xs font-bold hover:bg-orange/20 transition-all disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
