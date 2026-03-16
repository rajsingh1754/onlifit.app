"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Trainer } from "@/types";
import Link from "next/link";

const SPECIALIZATIONS = ["Weight Loss", "Muscle Building", "Yoga", "CrossFit", "Cardio", "Strength Training", "Calisthenics"];
const PLAN_TYPES = ["offline", "virtual", "elite"];

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchTrainers();
  }, [specFilter, planFilter]);

  async function fetchTrainers() {
    setLoading(true);
    let query = supabase.from("trainer_profiles").select("*").eq("is_available", true);

    if (specFilter) {
      query = query.contains("specializations", [specFilter]);
    }
    if (planFilter) {
      query = query.contains("plan_types", [planFilter]);
    }

    const { data } = await query.order("rating", { ascending: false });
    setTrainers(data || []);
    setLoading(false);
  }

  const filtered = trainers.filter((t) =>
    t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.bio?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-bg-2/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-white">
            Onli<em className="text-accent italic">fit</em>
          </Link>
          <div className="flex gap-3">
            <Link href="/dashboard" className="text-sm text-muted hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-12">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-[11px] font-bold text-accent uppercase tracking-[0.14em] mb-3">Browse trainers</p>
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-3 tracking-tight">
            Find your <em className="text-accent italic">perfect</em> trainer
          </h1>
          <p className="text-muted text-base max-w-lg">Verified trainers with real ratings. Pick your match, choose your plan, and start training.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trainers..."
            className="px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-accent/40 placeholder:text-white/20 w-64"
          />
          <select
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-accent/40 appearance-none"
          >
            <option value="" className="bg-bg-3">All specializations</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s} className="bg-bg-3">{s}</option>
            ))}
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-accent/40 appearance-none"
          >
            <option value="" className="bg-bg-3">All plan types</option>
            {PLAN_TYPES.map((p) => (
              <option key={p} value={p} className="bg-bg-3 capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Trainer grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-white/5" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/5 rounded w-32 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-20" />
                  </div>
                </div>
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">No trainers found</p>
            <p className="text-white/20 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((trainer) => (
              <Link
                key={trainer.id}
                href={`/trainers/${trainer.id}`}
                className="bg-card border border-border rounded-2xl p-6 hover:border-border-2 hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-bg-3 border border-border flex items-center justify-center text-xl text-muted overflow-hidden">
                    {trainer.avatar_url ? (
                      <img src={trainer.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      trainer.full_name?.charAt(0) || "T"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-[15px] truncate">{trainer.full_name}</h3>
                      {trainer.is_verified && (
                        <span className="text-accent text-xs">✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-gold text-xs">{"★".repeat(Math.round(trainer.rating))}</span>
                      <span className="text-muted text-xs">{trainer.rating} · {trainer.total_reviews} reviews</span>
                    </div>
                  </div>
                </div>

                <p className="text-muted text-sm line-clamp-2 mb-4 leading-relaxed">{trainer.bio}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {trainer.specializations?.slice(0, 3).map((spec) => (
                    <span key={spec} className="text-[11px] font-semibold text-muted bg-bg-3 border border-border rounded-full px-2.5 py-0.5">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {trainer.plan_types?.map((plan) => (
                    <span
                      key={plan}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        plan === "offline" ? "bg-accent/10 text-accent" :
                        plan === "virtual" ? "bg-orange/10 text-orange" :
                        "bg-gold/10 text-gold"
                      }`}
                    >
                      {plan}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
