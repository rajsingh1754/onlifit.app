"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Trainer } from "@/types";
import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Decorative blur circles */}
      <div className="blur-circle pink w-[400px] h-[400px] -top-40 -right-40 opacity-20 fixed" />
      <div className="blur-circle yellow w-[300px] h-[300px] bottom-40 -left-40 opacity-20 fixed" />

      {/* Header */}
      <div className="border-b border-border bg-bg-2/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-white">
            Onli<em className="gradient-text italic">fit</em>
          </Link>
          <div className="flex gap-3">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-12 relative z-10">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-[11px] font-bold gradient-text uppercase tracking-[0.14em] mb-3">Browse trainers</p>
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-3 tracking-tight">
            Find your <em className="gradient-text italic">perfect</em> trainer
          </h1>
          <p className="text-gray-400 text-base max-w-lg">Verified trainers with real ratings. Pick your match, choose your plan, and start training.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trainers..."
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-pink/40 placeholder:text-gray-600 w-64"
          />
          <select
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-pink/40 appearance-none"
          >
            <option value="" className="bg-bg-2">All specializations</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s} className="bg-bg-2">{s}</option>
            ))}
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-pink/40 appearance-none"
          >
            <option value="" className="bg-bg-2">All plan types</option>
            {PLAN_TYPES.map((p) => (
              <option key={p} value={p} className="bg-bg-2 capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Trainer grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-20" />
                  </div>
                </div>
                <div className="h-3 bg-white/10 rounded w-full mb-2" />
                <div className="h-3 bg-white/10 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No trainers found</p>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((trainer) => (
              <Link
                key={trainer.id}
                href={`/trainers/${trainer.id}`}
                className="glass-card rounded-2xl p-6 hover:border-pink/30 hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink/20 to-yellow/20 border border-white/10 flex items-center justify-center text-xl text-white overflow-hidden">
                    {trainer.avatar_url ? (
                      <Image src={trainer.avatar_url} alt="" width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      trainer.full_name?.charAt(0) || "T"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-[15px] truncate group-hover:text-pink transition-colors">{trainer.full_name}</h3>
                      {trainer.is_verified && (
                        <span className="text-pink text-xs">✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-yellow text-xs">{"★".repeat(Math.round(trainer.rating))}</span>
                      <span className="text-gray-500 text-xs">{trainer.rating} · {trainer.total_reviews} reviews</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{trainer.bio}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {trainer.specializations?.slice(0, 3).map((spec) => (
                    <span key={spec} className="text-[11px] font-semibold text-gray-300 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {trainer.plan_types?.map((plan) => (
                    <span
                      key={plan}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        plan === "offline" ? "bg-blue/20 text-blue" :
                        plan === "virtual" ? "bg-pink/20 text-pink" :
                        "bg-yellow/20 text-yellow"
                      }`}
                    >
                      {plan === "offline" ? "Regular" : plan === "virtual" ? "Live" : plan === "elite" ? "Elite" : plan}
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
