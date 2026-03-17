"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-accent/10 text-accent", confirmed: "bg-teal-500/10 text-teal-400",
  pending: "bg-gold/10 text-gold", completed: "bg-gray-50 text-muted", cancelled: "bg-red-500/10 text-red-400",
};
const PLAN_LABEL: Record<string, string> = { offline: "Regular", virtual: "Live", elite: "Elite" };

interface Booking {
  id: string;
  user_id: string;
  trainer_id: string;
  status: string;
  start_date: string;
  booked_slot: string;
  duration_months: number;
  created_at: string;
  userName: string;
  trainerName: string;
  trainerId: string;
  planName: string;
  planSlug: string;
  planPrice: number;
}

export default function BookingsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*, plans(name, slug, price)")
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) { setBookings([]); setLoading(false); return; }

    const uids = [...new Set(data.map((b: any) => b.user_id))];
    const tids = [...new Set(data.map((b: any) => b.trainer_id))];

    const [{ data: userProfiles }, { data: trainerRecords }] = await Promise.all([
      supabase.from("profiles").select("id, full_name").in("id", uids),
      supabase.from("trainers").select("id, profile_id").in("id", tids),
    ]);

    const uMap = new Map((userProfiles || []).map((p: any) => [p.id, p.full_name]));
    const tpids = (trainerRecords || []).map((t: any) => t.profile_id);
    let tMap = new Map<string, string>();
    if (tpids.length > 0) {
      const { data: tp } = await supabase.from("profiles").select("id, full_name").in("id", tpids);
      const tpMap = new Map((tp || []).map((p: any) => [p.id, p.full_name]));
      tMap = new Map((trainerRecords || []).map((t: any) => [t.id, tpMap.get(t.profile_id) || "Unknown"]));
    }

    setBookings(data.map((b: any) => ({
      ...b,
      userName: uMap.get(b.user_id) || "Unknown",
      trainerName: tMap.get(b.trainer_id) || "Unknown",
      trainerId: b.trainer_id,
      planName: b.plans?.name || "—",
      planSlug: b.plans?.slug || "",
      planPrice: b.plans?.price || 0,
    })));
    setLoading(false);
  }

  const statuses = ["all", "pending", "confirmed", "active", "completed", "cancelled"];
  const counts: Record<string, number> = { all: bookings.length };
  statuses.slice(1).forEach((s) => { counts[s] = bookings.filter((b) => b.status === s).length; });

  const filtered = bookings.filter((b) => {
    const matchStatus = filter === "all" || b.status === filter;
    const matchSearch = !search || b.userName.toLowerCase().includes(search.toLowerCase()) || b.trainerName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Summary stats
  const totalRevenue = bookings.filter(b => ["active", "confirmed"].includes(b.status)).reduce((s, b) => s + b.planPrice, 0);

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-gray-900 mb-1">Bookings</h1>
          <p className="text-muted text-sm">{bookings.length} total · ₹{totalRevenue.toLocaleString("en-IN")} active revenue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by user or trainer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2.5 bg-white shadow-sm border border-gray-100 rounded-xl text-gray-900 text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/40 sm:w-64"
        />
        <div className="flex gap-1 bg-bg-2 rounded-xl p-1 overflow-x-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize whitespace-nowrap ${
                filter === s ? "bg-accent text-bg" : "text-muted hover:text-gray-900"
              }`}
            >
              {s} ({counts[s] || 0})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white shadow-sm border border-gray-100 rounded-2xl">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-900 font-semibold text-lg">No bookings found</p>
          <p className="text-muted text-sm mt-1">{search ? "Try a different search." : "No bookings yet."}</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-[10px] text-muted uppercase tracking-wider font-semibold">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Trainer</div>
            <div className="col-span-2">Plan</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Slot</div>
            <div className="col-span-1">Start</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Date</div>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((b) => (
              <div key={b.id} className="px-5 py-3 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center flex flex-col gap-2 hover:bg-gray-50 transition-colors">
                <div className="col-span-3">
                  <p className="text-gray-900 text-sm font-medium">{b.userName}</p>
                  <p className="text-muted text-[11px] lg:hidden">with {b.trainerName}</p>
                </div>
                <div className="col-span-2 hidden lg:block">
                  <Link href={`/admin/trainers/${b.trainerId}`} className="text-gray-900 text-sm hover:text-accent transition-colors">
                    {b.trainerName}
                  </Link>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-900 text-sm">{b.planName}</span>
                </div>
                <div className="col-span-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLE[b.status] || "bg-gray-50 text-muted"}`}>
                    {b.status}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-muted text-xs">{b.booked_slot || "—"}</span>
                </div>
                <div className="col-span-1">
                  <span className="text-muted text-xs">{b.start_date ? new Date(b.start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</span>
                </div>
                <div className="col-span-1">
                  <span className="text-gray-900 text-xs font-medium">₹{b.planPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="col-span-1">
                  <span className="text-muted text-[11px]">{new Date(b.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
