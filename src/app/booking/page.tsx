"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Plan, Trainer } from "@/types";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function BookingPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-muted">Loading...</div></div>}>
      <BookingPage />
    </Suspense>
  );
}

function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const trainerId = searchParams.get("trainer");
  const planId = searchParams.get("plan");

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (trainerId && planId) fetchData();
  }, [trainerId, planId]);

  async function fetchData() {
    const [trainerRes, planRes] = await Promise.all([
      supabase.from("trainer_profiles").select("*").eq("id", trainerId).single(),
      supabase.from("plans").select("*").eq("id", planId).single(),
    ]);
    setTrainer(trainerRes.data);
    setPlan(planRes.data);
    setLoading(false);
  }

  async function handleBooking() {
    if (!startDate) return;
    setBooking(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      trainer_id: trainerId,
      plan_id: planId,
      start_date: startDate,
      status: "pending",
    });

    if (error) {
      alert("Booking failed: " + error.message);
      setBooking(false);
      return;
    }

    setSuccess(true);
    setBooking(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!trainer || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-2">Missing booking details</p>
          <Link href="/trainers" className="text-accent text-sm hover:underline">Browse trainers</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 mx-auto mb-6 flex items-center justify-center text-3xl">
            ✓
          </div>
          <h1 className="font-serif text-4xl text-white mb-3">Booking confirmed!</h1>
          <p className="text-muted mb-8 leading-relaxed">
            Your booking with <span className="text-white font-semibold">{trainer.full_name}</span> on
            the <span className="text-white font-semibold">{plan.name}</span> plan is confirmed.
            We&apos;ll reach out on WhatsApp with your schedule.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard" className="px-6 py-3 bg-accent text-bg font-bold rounded-lg text-sm hover:bg-accent-dark transition-all">
              Go to dashboard
            </Link>
            <Link href="/trainers" className="px-6 py-3 border border-border-2 text-white rounded-lg text-sm hover:border-white/30 transition-all">
              Browse more trainers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-bg-2/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-white">
            Onli<em className="text-accent italic">fit</em>
          </Link>
          <Link href={`/trainers/${trainerId}`} className="text-sm text-muted hover:text-white transition-colors">
            ← Back to trainer
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-[11px] font-bold text-accent uppercase tracking-[0.14em] mb-3">Confirm booking</p>
        <h1 className="font-serif text-4xl text-white mb-8 tracking-tight">
          Review & <em className="text-accent italic">book</em>
        </h1>

        {/* Summary card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
            <div className="w-14 h-14 rounded-xl bg-bg-3 border border-border flex items-center justify-center text-xl text-muted">
              {trainer.full_name?.charAt(0) || "T"}
            </div>
            <div>
              <h3 className="font-bold text-white">{trainer.full_name}</h3>
              <p className="text-muted text-sm">{trainer.specializations?.join(", ")}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-semibold">{plan.name}</p>
              <p className="text-muted text-sm">{plan.sessions_per_month} sessions · {plan.schedule}</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl text-white">₹{plan.price.toLocaleString("en-IN")}</p>
              <p className="text-muted text-xs">per month</p>
            </div>
          </div>

          <ul className="space-y-1.5 pt-4 border-t border-border">
            {plan.features?.map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-sm text-white/60">
                <span className="text-accent text-xs">✓</span>{feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Start date */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-3">
            When do you want to start?
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-accent/40 transition-colors"
            required
          />
        </div>

        {/* Book button */}
        <button
          onClick={handleBooking}
          disabled={booking || !startDate}
          className="w-full py-4 bg-accent text-bg font-extrabold text-[15px] rounded-xl hover:bg-accent-dark transition-all disabled:opacity-50"
        >
          {booking ? "Confirming..." : `Confirm booking · ₹${plan.price.toLocaleString("en-IN")}/mo`}
        </button>
        <p className="text-center text-white/20 text-xs mt-3">Payment integration coming soon. Booking is confirmed immediately.</p>
      </div>
    </div>
  );
}
