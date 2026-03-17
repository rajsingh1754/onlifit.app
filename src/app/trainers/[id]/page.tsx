"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Trainer, Plan, Review } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const PLAN_LABEL: Record<string, string> = {
  offline: "Onlifit Regular",
  virtual: "Onlifit Live",
  elite: "Onlifit Elite",
};

const DURATION_OPTIONS = [
  { months: 1, label: "1 Month" },
  { months: 3, label: "3 Months" },
  { months: 6, label: "6 Months" },
  { months: 12, label: "12 Months" },
];

interface SlotData {
  id: string;
  day: string;
  time: string;
  is_available: boolean;
}

interface BookedSlot {
  booked_slot: string;
}

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function formatTime(t: string) {
  const [h] = t.split(":");
  const hr = parseInt(h);
  if (hr === 0) return "12 AM";
  if (hr < 12) return `${hr} AM`;
  if (hr === 12) return "12 PM";
  return `${hr - 12} PM`;
}

export default function TrainerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, [id]);

  async function fetchData() {
    const [trainerRes, plansRes, reviewsRes, slotsRes] = await Promise.all([
      supabase.from("trainer_profiles").select("*").eq("id", id).single(),
      supabase.from("plans").select("*").order("price"),
      supabase.from("reviews").select("*, profile:profiles(full_name, avatar_url)").eq("trainer_id", id).order("created_at", { ascending: false }).limit(10),
      supabase.from("trainer_slots").select("*").eq("trainer_id", id).eq("is_available", true).order("time"),
    ]);

    setTrainer(trainerRes.data);
    setPlans(plansRes.data || []);
    setReviews(reviewsRes.data || []);
    setSlots(slotsRes.data || []);

    // Fetch currently booked slots for this trainer (active/confirmed/pending bookings)
    try {
      const { data: bookedData } = await supabase
        .from("bookings")
        .select("booked_slot")
        .eq("trainer_id", id)
        .in("status", ["active", "confirmed", "pending"])
        .not("booked_slot", "is", null);
      
      const taken = new Set<string>();
      (bookedData || []).forEach((b: BookedSlot) => {
        if (b.booked_slot) taken.add(b.booked_slot);
      });
      setBookedSlots(taken);
    } catch {
      // Column may not exist yet
    }

    setLoading(false);
  }

  async function handleSubmitReview() {
    if (!currentUser) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/trainers/${id}`)}`);
      return;
    }
    setSubmittingReview(true);

    // Check if user has a booking with this trainer
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("user_id", currentUser.id)
      .eq("trainer_id", id)
      .limit(1);

    if (!bookings || bookings.length === 0) {
      alert("You can only rate a trainer after completing a booking with them.");
      setSubmittingReview(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      user_id: currentUser.id,
      trainer_id: id,
      booking_id: bookings[0].id,
      rating: reviewRating,
      comment: reviewComment,
    });

    if (error) {
      alert("Failed to submit review. Please try again.");
    } else {
      setShowReviewForm(false);
      setReviewComment("");
      setReviewRating(5);
      fetchData();
    }
    setSubmittingReview(false);
  }

  function handleBook(planId: string) {
    if (!selectedSlot) {
      alert("Please select an available time slot");
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      const params = `trainer=${trainer!.id}&plan=${planId}&duration=${selectedDuration}&slot=${encodeURIComponent(selectedSlot)}`;
      if (user) {
        router.push(`/booking?${params}`);
      } else {
        router.push(`/auth/login?redirect=${encodeURIComponent(`/booking?${params}`)}`);
      }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading trainer...</div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 text-lg mb-2">Trainer not found</p>
          <Link href="/trainers" className="text-accent text-sm hover:underline">Browse all trainers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-bg-2/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-gray-900">
            Onli<em className="text-accent italic">fit</em>
          </Link>
          <Link href="/trainers" className="text-sm text-muted hover:text-gray-900 transition-colors">
            ← All trainers
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-12">
        {/* Trainer profile */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="w-28 h-28 rounded-2xl bg-bg-3 border border-border flex items-center justify-center text-4xl text-muted overflow-hidden flex-shrink-0">
            {trainer.avatar_url ? (
              <img src={trainer.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              trainer.full_name?.charAt(0) || "T"
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-serif text-4xl text-gray-900 tracking-tight">{trainer.full_name}</h1>
              {trainer.is_verified && (
                <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-full">Verified</span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-2">
              {trainer.plan_types?.map((pt) => (
                <span key={pt} className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  pt === "offline" ? "bg-accent/10 text-accent" :
                  pt === "virtual" ? "bg-orange/10 text-orange" :
                  "bg-gold/10 text-gold"
                }`}>
                  {PLAN_LABEL[pt] || pt}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-gold text-sm">{"★".repeat(Math.round(trainer.rating))}</span>
              <span className="text-muted text-sm">{trainer.rating} rating · {trainer.total_reviews} reviews</span>
              <span className="text-muted text-sm">· {trainer.experience_years} years exp</span>
            </div>
            <p className="text-muted text-[15px] leading-relaxed max-w-xl mb-4">{trainer.bio}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {trainer.specializations?.map((spec) => (
                <span key={spec} className="text-xs font-semibold text-muted bg-bg-3 border border-border rounded-full px-3 py-1">
                  {spec}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {trainer.certifications?.map((cert) => (
                <span key={cert} className="text-xs font-semibold text-accent/60 bg-accent/5 border border-accent/10 rounded-full px-3 py-1">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Available Time Slots */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl text-gray-900 mb-2">Available Slots</h2>
          <p className="text-muted text-sm mb-5">Pick an hourly slot — booked slots are shown in red</p>
          
          {slots.length === 0 ? (
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 text-center">
              <p className="text-muted text-sm">This trainer hasn&apos;t set their availability yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {DAYS_ORDER.map((day) => {
                const daySlots = slots.filter((s) => s.day === day);
                if (daySlots.length === 0) return null;
                return (
                  <div key={day} className="bg-white shadow-sm border border-gray-100 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 capitalize">{day}</h4>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((s) => {
                        const slotKey = `${s.day}:${s.time}`;
                        const isBooked = bookedSlots.has(slotKey);
                        const isSelected = selectedSlot === slotKey;
                        return (
                          <button
                            key={s.id}
                            disabled={isBooked}
                            onClick={() => setSelectedSlot(isSelected ? "" : slotKey)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                              isBooked
                                ? "bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed line-through"
                                : isSelected
                                  ? "bg-accent text-bg ring-2 ring-accent/40"
                                  : "bg-bg-3 border border-border text-gray-900 hover:border-accent/40"
                            }`}
                          >
                            {formatTime(s.time)}
                            {isBooked && " ✕"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedSlot && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-xl">
              <p className="text-sm text-accent font-semibold">
                ✓ Selected: <span className="capitalize">{selectedSlot.split(":")[0]}</span> at {formatTime(selectedSlot.split(":").slice(1).join(":"))}
              </p>
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl text-gray-900 mb-2">Duration</h2>
          <p className="text-muted text-sm mb-5">How long do you want to train?</p>
          <div className="flex flex-wrap gap-3">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d.months}
                onClick={() => setSelectedDuration(d.months)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  selectedDuration === d.months
                    ? "bg-accent text-bg ring-2 ring-accent/40"
                    : "bg-white shadow-sm border border-gray-100 text-gray-900 hover:border-accent/40"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan & Book */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-gray-900 mb-6">Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.filter((plan) => trainer.plan_types?.includes(plan.slug)).map((plan) => {
              const totalPrice = plan.price * selectedDuration;
              return (
                <div
                  key={plan.id}
                  className="bg-white shadow-sm border border-gray-100 hover:border-border-2 rounded-2xl p-6 transition-all"
                >
                  <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${
                    plan.slug === "offline" ? "bg-accent/10 text-accent" :
                    plan.slug === "virtual" ? "bg-orange/10 text-orange" :
                    "bg-gold/10 text-gold"
                  }`}>
                    {PLAN_LABEL[plan.slug] || plan.name}
                  </span>
                  <div className="font-serif text-3xl text-gray-900 mb-1">
                    <sup className="text-lg">₹</sup>{totalPrice.toLocaleString("en-IN")}
                  </div>
                  <p className="text-muted text-xs mb-1">
                    {selectedDuration > 1
                      ? `₹${plan.price.toLocaleString("en-IN")}/mo × ${selectedDuration} months`
                      : "per month"}
                  </p>
                  <p className="text-muted text-xs mb-4">{plan.sessions_per_month} sessions/mo · {plan.schedule}</p>
                  <div className="border-t border-border pt-4">
                    <ul className="space-y-2">
                      {plan.features?.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm text-gray-900/60">
                          <span className="text-accent text-xs mt-0.5">✓</span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => handleBook(plan.id)}
                    className="w-full mt-5 py-3 rounded-lg font-bold text-sm transition-all bg-accent text-bg hover:bg-accent-dark"
                  >
                    Book Trainer{selectedSlot ? "" : " – Select slot first"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rating Overview */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-gray-900">Ratings & Reviews</h2>
            <button
              onClick={() => {
                if (!currentUser) {
                  router.push(`/auth/login?redirect=${encodeURIComponent(`/trainers/${id}`)}`);
                } else {
                  setShowReviewForm(!showReviewForm);
                }
              }}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-accent text-bg hover:bg-accent-dark transition-all"
            >
              Write a review
            </button>
          </div>

          {/* Rating summary */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="font-serif text-[48px] text-gray-900 leading-none">{trainer.rating}</div>
                <div className="text-gold text-sm mt-1">{"★".repeat(Math.round(trainer.rating))}</div>
                <p className="text-muted text-xs mt-1">{trainer.total_reviews} review{trainer.total_reviews !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted w-3">{star}</span>
                      <span className="text-gold text-xs">★</span>
                      <div className="flex-1 h-2 bg-bg-3 rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review form */}
          {showReviewForm && (
            <div className="bg-card border border-accent/20 rounded-2xl p-6 mb-6">
              <h3 className="text-gray-900 font-semibold text-sm mb-4">Rate this trainer</h3>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`text-2xl transition-all ${star <= reviewRating ? "text-gold" : "text-gray-900/15"} hover:scale-110`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-muted text-sm ml-2">{reviewRating}/5</span>
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this trainer..."
                rows={3}
                className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-900/25 focus:outline-none focus:border-accent/40 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewComment.trim()}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold bg-accent text-bg hover:bg-accent-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium border border-border text-muted hover:text-gray-900 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Review list */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white shadow-sm border border-gray-100 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-bg-3 border border-border flex items-center justify-center text-sm text-muted">
                      {(review.profile as any)?.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-semibold">{(review.profile as any)?.full_name}</p>
                      <span className="text-gold text-xs">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    </div>
                  </div>
                  <p className="text-muted text-sm leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-8 text-center">
              <p className="text-muted text-sm">No reviews yet. Be the first to rate this trainer!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
