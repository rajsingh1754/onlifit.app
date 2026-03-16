"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Trainer, Plan, Review } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function TrainerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    const [trainerRes, plansRes, reviewsRes] = await Promise.all([
      supabase.from("trainer_profiles").select("*").eq("id", id).single(),
      supabase.from("plans").select("*").order("price"),
      supabase.from("reviews").select("*, profile:profiles(full_name, avatar_url)").eq("trainer_id", id).order("created_at", { ascending: false }).limit(10),
    ]);

    setTrainer(trainerRes.data);
    setPlans(plansRes.data || []);
    setReviews(reviewsRes.data || []);
    setLoading(false);
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
          <p className="text-white text-lg mb-2">Trainer not found</p>
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
          <Link href="/" className="font-serif text-2xl text-white">
            Onli<em className="text-accent italic">fit</em>
          </Link>
          <Link href="/trainers" className="text-sm text-muted hover:text-white transition-colors">
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
              <h1 className="font-serif text-4xl text-white tracking-tight">{trainer.full_name}</h1>
              {trainer.is_verified && (
                <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-full">Verified</span>
              )}
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

        {/* Available plans */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-white mb-6">Choose a plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isAvailable = trainer.plan_types?.includes(plan.slug);
              return (
                <div
                  key={plan.id}
                  className={`border rounded-2xl p-6 transition-all ${
                    isAvailable
                      ? "bg-card border-border hover:border-border-2 cursor-pointer"
                      : "bg-bg-2 border-border opacity-40 cursor-not-allowed"
                  } ${plan.is_popular ? "ring-1 ring-accent" : ""}`}
                  onClick={() => isAvailable && router.push(`/booking?trainer=${trainer.id}&plan=${plan.id}`)}
                >
                  {plan.is_popular && (
                    <span className="text-[10px] font-extrabold bg-accent text-bg px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-serif text-xl text-white mt-3 mb-1">{plan.name}</h3>
                  <div className="font-serif text-3xl text-white mb-1">
                    <sup className="text-lg">₹</sup>{plan.price.toLocaleString("en-IN")}
                  </div>
                  <p className="text-muted text-xs mb-4">{plan.sessions_per_month} sessions · {plan.schedule}</p>
                  <div className="border-t border-border pt-4">
                    <ul className="space-y-2">
                      {plan.features?.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm text-white/60">
                          <span className="text-accent text-xs mt-0.5">✓</span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {isAvailable && (
                    <button className={`w-full mt-5 py-3 rounded-lg font-bold text-sm transition-all ${
                      plan.is_popular
                        ? "bg-accent text-bg hover:bg-accent-dark"
                        : "border border-border-2 text-white hover:border-white/30"
                    }`}>
                      Select plan
                    </button>
                  )}
                  {!isAvailable && (
                    <p className="text-center text-muted text-xs mt-5">Not available with this trainer</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl text-white mb-6">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-bg-3 border border-border flex items-center justify-center text-sm text-muted">
                      {(review.profile as any)?.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{(review.profile as any)?.full_name}</p>
                      <span className="text-gold text-xs">{"★".repeat(review.rating)}</span>
                    </div>
                  </div>
                  <p className="text-muted text-sm leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
