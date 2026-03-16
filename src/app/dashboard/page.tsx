"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Booking, Profile, Plan } from "@/types";
import Link from "next/link";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, bookingsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("bookings")
        .select("*, trainer:trainers(*, profile:profiles(full_name, avatar_url)), plan:plans(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    setProfile(profileRes.data);
    setBookings(bookingsRes.data || []);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading dashboard...</div>
      </div>
    );
  }

  const activeBookings = bookings.filter((b) => ["pending", "confirmed", "active"].includes(b.status));
  const pastBookings = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-bg-2/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-white">
            Onli<em className="text-accent italic">fit</em>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/trainers" className="text-sm text-muted hover:text-white transition-colors">
              Browse trainers
            </Link>
            <button onClick={handleSignOut} className="text-sm text-muted hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-white mb-2 tracking-tight">
            Hey, <em className="text-accent italic">{profile?.full_name || "there"}</em>
          </h1>
          <p className="text-muted">Here&apos;s your training overview</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-muted text-xs font-bold uppercase tracking-wider mb-2">Active bookings</p>
            <p className="font-serif text-3xl text-white">{activeBookings.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-muted text-xs font-bold uppercase tracking-wider mb-2">Total sessions</p>
            <p className="font-serif text-3xl text-white">
              {activeBookings.reduce((sum, b) => sum + ((b.plan as unknown as Plan)?.sessions_per_month || 0), 0)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-muted text-xs font-bold uppercase tracking-wider mb-2">This month</p>
            <p className="font-serif text-3xl text-accent">Active</p>
          </div>
        </div>

        {/* Active bookings */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl text-white mb-5">Active bookings</h2>
          {activeBookings.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-muted mb-4">No active bookings yet</p>
              <Link href="/trainers" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-bg font-bold text-sm rounded-lg hover:bg-accent-dark transition-all">
                Find a trainer →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => {
                const trainerProfile = (booking.trainer as any)?.profile;
                const plan = booking.plan as any;
                return (
                  <div key={booking.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-bg-3 border border-border flex items-center justify-center text-lg text-muted">
                        {trainerProfile?.full_name?.charAt(0) || "T"}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-[15px]">{trainerProfile?.full_name}</h3>
                        <p className="text-muted text-sm">{plan?.name} · {plan?.schedule}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        booking.status === "active" ? "bg-accent/10 text-accent" :
                        booking.status === "confirmed" ? "bg-teal/10 text-teal" :
                        "bg-gold/10 text-gold"
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-muted text-sm">₹{plan?.price?.toLocaleString("en-IN")}/mo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl text-white mb-5">Past bookings</h2>
            <div className="space-y-3">
              {pastBookings.map((booking) => {
                const trainerProfile = (booking.trainer as any)?.profile;
                const plan = booking.plan as any;
                return (
                  <div key={booking.id} className="bg-card/50 border border-border rounded-xl p-4 flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-3 border border-border flex items-center justify-center text-sm text-muted">
                        {trainerProfile?.full_name?.charAt(0) || "T"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{trainerProfile?.full_name}</h3>
                        <p className="text-muted text-xs">{plan?.name}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted uppercase">{booking.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
