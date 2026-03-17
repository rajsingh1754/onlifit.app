"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";

const PLAN_LABEL: Record<string, string> = { offline: "Regular", virtual: "Live", elite: "Elite" };
const PLAN_COLOR: Record<string, string> = { offline: "text-accent", virtual: "text-orange", elite: "text-gold" };
const STATUS_STYLE: Record<string, string> = {
  active: "bg-accent/10 text-accent", confirmed: "bg-teal-500/10 text-teal-400",
  pending: "bg-gold/10 text-gold", completed: "bg-white/5 text-muted", cancelled: "bg-red-500/10 text-red-400",
};

export default function AdminOverview() {
  const supabase = createClient();
  const [stats, setStats] = useState({ users: 0, active: 0, pending: 0, bookingsMonth: 0, revenue: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOverview(); }, []);

  async function fetchOverview() {
    const som = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [{ count: uc }, { count: ac }, { count: pc }, { data: mb }, { data: rp }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
      supabase.from("trainers").select("*", { count: "exact", head: true }).eq("is_available", true),
      supabase.from("trainers").select("*", { count: "exact", head: true }).eq("is_available", false),
      supabase.from("bookings").select("id, status, plans(slug, price)").gte("created_at", som),
      supabase.from("trainers").select("*").eq("is_available", false).order("created_at", { ascending: false }).limit(5),
    ]);

    let revenue = 0;
    (mb || []).forEach((b: any) => {
      if (["active", "confirmed"].includes(b.status)) revenue += b.plans?.price || 0;
    });

    setStats({ users: uc || 0, active: ac || 0, pending: pc || 0, bookingsMonth: (mb || []).length, revenue });

    // Attach profiles to recent apps
    if (rp && rp.length > 0) {
      const ids = rp.map((t: any) => t.profile_id);
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, avatar_url").in("id", ids);
      const pm = new Map((profiles || []).map((p: any) => [p.id, p]));
      setRecentApps(rp.map((t: any) => ({ ...t, profile: pm.get(t.profile_id) || { full_name: "Unknown", email: "" } })));
    }

    // Recent bookings
    const { data: rb } = await supabase
      .from("bookings")
      .select("id, status, created_at, user_id, trainer_id, plans(name, slug)")
      .order("created_at", { ascending: false }).limit(5);

    if (rb && rb.length > 0) {
      const uids = [...new Set(rb.map((b: any) => b.user_id))];
      const tids = [...new Set(rb.map((b: any) => b.trainer_id))];
      const [{ data: up }, { data: tr }] = await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", uids),
        supabase.from("trainers").select("id, profile_id").in("id", tids),
      ]);
      const uMap = new Map((up || []).map((p: any) => [p.id, p.full_name]));
      const tpids = (tr || []).map((t: any) => t.profile_id);
      let tMap = new Map<string, string>();
      if (tpids.length > 0) {
        const { data: tp } = await supabase.from("profiles").select("id, full_name").in("id", tpids);
        const tpMap = new Map((tp || []).map((p: any) => [p.id, p.full_name]));
        tMap = new Map((tr || []).map((t: any) => [t.id, tpMap.get(t.profile_id) || "Unknown"]));
      }
      setRecentBookings(rb.map((b: any) => ({
        ...b, userName: uMap.get(b.user_id) || "Unknown", trainerName: tMap.get(b.trainer_id) || "Unknown",
      })));
    }

    setLoading(false);
  }

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
    </div>
  );

  const kpis = [
    { label: "Total Users", value: stats.users, color: "text-white", icon: "👥" },
    { label: "Active Trainers", value: stats.active, color: "text-accent", icon: "💪" },
    { label: "Pending Apps", value: stats.pending, color: "text-orange", icon: "📋", link: "/admin/applications" },
    { label: "Bookings (Month)", value: stats.bookingsMonth, color: "text-teal-400", icon: "📅" },
    { label: "Revenue (Month)", value: `₹${stats.revenue.toLocaleString("en-IN")}`, color: "text-gold", icon: "💰" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-white mb-1">Dashboard</h1>
        <p className="text-muted text-sm">Welcome back. Here&apos;s what&apos;s happening on Onlifit.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-5 hover:border-white/10 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-muted text-[11px] uppercase tracking-wider font-semibold">{k.label}</p>
              <span className="text-lg opacity-50 group-hover:opacity-80 transition-opacity">{k.icon}</span>
            </div>
            {k.link ? (
              <Link href={k.link} className={`font-serif text-2xl ${k.color} hover:underline`}>{k.value}</Link>
            ) : (
              <p className={`font-serif text-2xl ${k.color}`}>{k.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Recent Applications</h2>
            <Link href="/admin/applications" className="text-accent text-xs font-medium hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-border">
            {recentApps.length === 0 ? (
              <div className="p-10 text-center text-muted text-sm">No pending applications</div>
            ) : recentApps.map((app: any) => (
              <Link key={app.id} href="/admin/applications" className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-full bg-bg-3 border border-border flex items-center justify-center text-muted text-xs overflow-hidden flex-shrink-0">
                  {app.profile.avatar_url ? (
                    <img src={app.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (app.profile.full_name?.charAt(0) || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{app.profile.full_name}</p>
                  <p className="text-muted text-[11px] truncate">{app.profile.email} · {app.experience_years}y exp</p>
                </div>
                <div className="flex gap-1.5">
                  {app.plan_types?.map((pt: string) => (
                    <span key={pt} className={`text-[10px] font-bold ${PLAN_COLOR[pt] || "text-muted"}`}>
                      {PLAN_LABEL[pt] || pt}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-accent text-xs font-medium hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-border">
            {recentBookings.length === 0 ? (
              <div className="p-10 text-center text-muted text-sm">No bookings yet</div>
            ) : recentBookings.map((b: any) => (
              <div key={b.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{b.userName}</p>
                  <p className="text-muted text-[11px]">with {b.trainerName} · {b.plans?.name || "—"}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLE[b.status] || "bg-white/5 text-muted"}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/applications" className="px-5 py-2.5 bg-accent/10 text-accent border border-accent/20 rounded-xl text-xs font-bold hover:bg-accent/20 transition-all">
          📋 Review Applications
        </Link>
        <Link href="/admin/trainers" className="px-5 py-2.5 bg-white/5 text-white border border-border rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
          💪 Manage Trainers
        </Link>
        <Link href="/admin/bookings" className="px-5 py-2.5 bg-white/5 text-white border border-border rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
          📅 View All Bookings
        </Link>
      </div>
    </div>
  );
}
