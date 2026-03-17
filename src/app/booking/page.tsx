"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Plan, Trainer } from "@/types";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function BookingPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg"><div className="text-muted">Loading...</div></div>}>
      <BookingPage />
    </Suspense>
  );
}

function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const trainerId = searchParams.get("trainer");
  const planId = searchParams.get("plan");
  const duration = parseInt(searchParams.get("duration") || "1");
  const bookedSlot = searchParams.get("slot") || "";

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState("");
  const supabase = createClient();

  function formatSlotLabel(slot: string) {
    if (!slot) return "";
    const parts = slot.split(":");
    const day = parts[0];
    const time = parts.slice(1).join(":");
    const [h] = time.split(":");
    const hr = parseInt(h);
    const timeStr = hr === 0 ? "12 AM" : hr < 12 ? `${hr} AM` : hr === 12 ? "12 PM" : `${hr - 12} PM`;
    return `${day.charAt(0).toUpperCase() + day.slice(1)} at ${timeStr}`;
  }

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
      duration_months: duration,
      booked_slot: bookedSlot,
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
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!trainer || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <p className="text-white text-lg mb-2">Missing booking details</p>
          <Link href="/trainers" className="text-pink text-sm hover:underline">Browse trainers</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-bg">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-pink/10 border border-pink/20 mx-auto mb-6 flex items-center justify-center text-3xl text-pink">
            ✓
          </div>
          <h1 className="font-serif text-4xl text-white mb-3">Booking confirmed!</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Your booking with <span className="text-white font-semibold">{trainer.full_name}</span> on
            the <span className="text-white font-semibold">{plan.name}</span> plan is confirmed.
            We&apos;ll reach out on WhatsApp with your schedule.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard" className="px-6 py-3 btn-gradient font-bold rounded-lg text-sm transition-all">
              Go to dashboard
            </Link>
            <Link href="/trainers" className="px-6 py-3 border border-white/10 text-white rounded-lg text-sm hover:border-white/30 transition-all">
              Browse more trainers
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <Link href={`/trainers/${trainerId}`} className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to trainer
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-12 relative z-10">
        <p className="text-[11px] font-bold gradient-text uppercase tracking-[0.14em] mb-3">Confirm booking</p>
        <h1 className="font-serif text-4xl text-white mb-8 tracking-tight">
          Review & <em className="gradient-text italic">book</em>
        </h1>

        {/* Summary card */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/10">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink/20 to-yellow/20 border border-white/10 flex items-center justify-center text-xl text-white">
              {trainer.full_name?.charAt(0) || "T"}
            </div>
            <div>
              <h3 className="font-bold text-white">{trainer.full_name}</h3>
              <p className="text-gray-400 text-sm">{trainer.specializations?.join(", ")}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-semibold">{plan.name}</p>
              <p className="text-gray-400 text-sm">{plan.sessions_per_month} sessions/mo · {plan.schedule}</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl gradient-text">₹{(plan.price * duration).toLocaleString("en-IN")}</p>
              <p className="text-gray-500 text-xs">{duration} {duration === 1 ? "month" : "months"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Time Slot</p>
              <p className="text-white text-sm font-semibold">{formatSlotLabel(bookedSlot)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Duration</p>
              <p className="text-white text-sm font-semibold">{duration} {duration === 1 ? "Month" : "Months"}</p>
            </div>
          </div>

          {duration > 1 && (
            <div className="flex items-center justify-between text-sm pt-3 border-t border-white/10">
              <span className="text-gray-400">₹{plan.price.toLocaleString("en-IN")} × {duration} months</span>
              <span className="gradient-text font-bold">₹{(plan.price * duration).toLocaleString("en-IN")} total</span>
            </div>
          )}

          <ul className="space-y-1.5 pt-4 border-t border-white/10">
            {plan.features?.map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-pink text-xs">✓</span>{feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Start date */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
            When do you want to start?
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-pink/40 transition-colors"
            required
          />
        </div>

        {/* Book button */}
        <button
          onClick={handleBooking}
          disabled={booking || !startDate}
          className="w-full py-4 btn-gradient font-extrabold text-[15px] rounded-xl transition-all disabled:opacity-50"
        >
          {booking ? "Confirming..." : `Confirm booking · ₹${(plan.price * duration).toLocaleString("en-IN")}`}
        </button>
        <p className="text-center text-gray-600 text-xs mt-3">Payment integration coming soon. Booking is confirmed immediately.</p>
      </div>
    </div>
  );
}
