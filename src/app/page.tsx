"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Trainer } from "@/types";

const PLAN_LABEL: Record<string, string> = {
  offline: "Onlifit Regular",
  virtual: "Onlifit Live",
  elite: "Onlifit Elite",
};

/* Scroll-reveal hook */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("trainer_profiles")
      .select("*")
      .eq("is_available", true)
      .order("rating", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setTrainers(data || []);
        setLoadingTrainers(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] h-[68px] bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="font-serif text-[26px] text-gray-900">
          Onli<em className="text-accent italic">fit</em>
        </div>
        <div className="hidden md:flex gap-8">
          <a href="#how" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">How it works</a>
          <a href="#plans" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Plans</a>
          <Link href="/trainers" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Trainers</Link>
          <a href="#for-trainers" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">For trainers</a>
        </div>
        <div className="flex gap-2.5">
          <Link href="/auth/login" className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-all">
            Sign in
          </Link>
          <Link href="/auth/signup" className="px-5 py-2.5 bg-accent rounded-lg text-sm font-bold text-white hover:bg-accent-dark transition-all">
            Get started
          </Link>
        </div>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section className="min-h-screen flex items-center px-[5%] pt-[100px] pb-20 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 -right-20 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-orange/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-500 mb-6 animate-fade-in-up">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Now live in Hyderabad
            </div>

            <h1 className="font-serif text-[clamp(40px,6vw,72px)] leading-[1.05] text-gray-900 mb-6 tracking-[-1px] animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Real training.<br />
              <span className="text-accent">Every single day.</span>
            </h1>

            <p className="text-lg text-gray-500 max-w-[500px] mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              Daily live sessions with certified personal trainers — virtual or at your own gym. A real trainer, watching you, every weekday.
            </p>

            <div className="flex gap-3.5 flex-wrap mb-10 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <Link href="/auth/signup" className="px-8 py-3.5 bg-accent rounded-xl text-[15px] font-bold text-white hover:bg-accent-dark transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/20">
                Start your journey →
              </Link>
              <a href="#plans" className="px-8 py-3.5 border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
                View plans
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 flex-wrap animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              {[
                { val: "20", label: "sessions / month" },
                { val: "₹4,999", label: "starting price" },
                { val: "1:1", label: "personal training" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-serif text-2xl text-gray-900 leading-none">{s.val}</div>
                  <div className="text-[11px] text-gray-400 font-medium mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Fitness illustration grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-3xl p-8 text-center animate-float" style={{ animationDelay: "0s" }}>
                <span className="text-6xl">🏋️</span>
                <p className="text-sm font-semibold text-gray-700 mt-3">Strength Training</p>
              </div>
              <div className="bg-gradient-to-br from-orange/10 to-orange/5 rounded-3xl p-8 text-center animate-float" style={{ animationDelay: "1s" }}>
                <span className="text-6xl">🧘</span>
                <p className="text-sm font-semibold text-gray-700 mt-3">Yoga & Flexibility</p>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-gradient-to-br from-teal/10 to-teal/5 rounded-3xl p-8 text-center animate-float" style={{ animationDelay: "0.5s" }}>
                <span className="text-6xl">🏃</span>
                <p className="text-sm font-semibold text-gray-700 mt-3">Cardio & HIIT</p>
              </div>
              <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-3xl p-8 text-center animate-float" style={{ animationDelay: "1.5s" }}>
                <span className="text-6xl">💪</span>
                <p className="text-sm font-semibold text-gray-700 mt-3">Personal Coaching</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how" className="px-[5%] py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-accent text-sm font-bold uppercase tracking-wider mb-3">How it works</p>
            <h2 className="font-serif text-4xl text-gray-900 mb-4">Three simple steps</h2>
            <p className="text-gray-500 max-w-lg mb-16">Get started with your personal fitness journey in minutes.</p>
          </Section>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: "🔍", title: "Choose your trainer", desc: "Browse certified trainers by specialization, location, and availability. Read reviews and find your perfect match." },
              { step: "02", icon: "📅", title: "Book your plan", desc: "Pick a plan that fits your goals — offline gym, virtual training, or premium elite coaching with nutrition guidance." },
              { step: "03", icon: "🎯", title: "Train daily", desc: "Show up every weekday for your 1-on-1 session. Your trainer tracks your progress and adjusts your program." },
            ].map((item, i) => (
              <Section key={i} delay={i * 150}>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="text-5xl mb-5">{item.icon}</div>
                  <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Step {item.step}</div>
                  <h3 className="font-serif text-xl text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ PLANS ════════════ */}
      <section id="plans" className="px-[5%] py-24">
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-accent text-sm font-bold uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="font-serif text-4xl text-gray-900 mb-4">Plans for every goal</h2>
            <p className="text-gray-500 max-w-lg mb-16">All plans include 20 sessions/month, 1-on-1 training, and progress tracking.</p>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Onlifit Regular", price: "5,999", desc: "Train at your local gym with a certified trainer who comes to you.", tag: "offline", features: ["20 sessions / month", "Your gym, your schedule", "Certified trainer visits you", "Progress tracking"], color: "accent" },
              { name: "Onlifit Live", price: "7,999", desc: "Virtual 1-on-1 sessions from home. Same intensity, more flexibility.", tag: "virtual", features: ["20 sessions / month", "HD video sessions", "Screen sharing & form checks", "Flexible scheduling"], popular: true, color: "orange" },
              { name: "Onlifit Elite", price: "14,999", desc: "Premium coaching with nutrition plans, supplements, and priority support.", tag: "elite", features: ["20 sessions / month", "Nutrition & diet plans", "Supplement guidance", "Priority scheduling", "WhatsApp support"], color: "gold" },
            ].map((plan, i) => (
              <Section key={i} delay={i * 150}>
                <div className={`relative bg-white rounded-2xl p-8 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${plan.popular ? "border-accent shadow-md" : "border-gray-100 shadow-sm"}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-[11px] font-bold uppercase rounded-full tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-serif text-xl text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-5">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="font-serif text-4xl text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-400 text-sm">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <span className="text-accent">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signup" className={`block w-full py-3 rounded-xl text-sm font-bold text-center transition-all ${plan.popular ? "bg-accent text-white hover:bg-accent-dark" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    Get started
                  </Link>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TRAINERS PREVIEW ════════════ */}
      <section className="px-[5%] py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-accent text-sm font-bold uppercase tracking-wider mb-3">Our trainers</p>
            <h2 className="font-serif text-4xl text-gray-900 mb-4">Certified. Experienced. Passionate.</h2>
            <p className="text-gray-500 max-w-lg mb-16">Every Onlifit trainer is hand-picked, verified, and ready to help you crush your goals.</p>
          </Section>

          {loadingTrainers ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
          ) : trainers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((t, i) => (
                <Section key={t.id} delay={i * 100}>
                  <Link href={`/trainers/${t.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="h-48 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
                      {t.avatar_url ? (
                        <img src={t.avatar_url} alt={t.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-6xl">💪</span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 group-hover:text-accent transition-colors">{t.full_name}</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {t.plan_types?.map((pt: string) => PLAN_LABEL[pt] || pt).join(", ")} · {t.experience_years}y exp
                      </p>
                      {t.rating > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-gold text-sm">★</span>
                          <span className="text-sm font-medium text-gray-700">{t.rating}</span>
                          <span className="text-gray-400 text-xs">({t.total_reviews})</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </Section>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-5xl mb-3">💪</p>
              <p className="text-gray-900 font-semibold text-lg">Trainers coming soon</p>
              <p className="text-gray-400 text-sm mt-1">We&apos;re onboarding certified trainers in Hyderabad.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/trainers" className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all inline-flex items-center gap-2">
              Browse all trainers →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ WHAT YOU GET ════════════ */}
      <section className="px-[5%] py-24">
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-accent text-sm font-bold uppercase tracking-wider mb-3">Benefits</p>
            <h2 className="font-serif text-4xl text-gray-900 mb-16">Why people love Onlifit</h2>
          </Section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎯", title: "1-on-1 Training", desc: "Every session is personal. Your trainer watches your form, counts your reps, and pushes you." },
              { icon: "📊", title: "Progress Tracking", desc: "Track your gains, body measurements, and workout history — all in one place." },
              { icon: "🕐", title: "Flexible Timing", desc: "Pick your slot. Morning, afternoon, or evening — train when it suits you best." },
              { icon: "💰", title: "Half the Price", desc: "Personal training that costs less than ₹300/session. No contracts, cancel anytime." },
            ].map((item, i) => (
              <Section key={i} delay={i * 100}>
                <div className="text-center p-6">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section className="px-[5%] py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-accent text-sm font-bold uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="font-serif text-4xl text-gray-900 mb-16">What our members say</h2>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Ravi K.", city: "Hyderabad", text: "Lost 12kg in 3 months. My trainer keeps me accountable every single day. Best investment I've made.", rating: 5 },
              { name: "Sneha M.", city: "Hyderabad", text: "The virtual sessions are incredibly effective. My trainer corrects my form in real-time through video.", rating: 5 },
              { name: "Arjun P.", city: "Hyderabad", text: "Went from barely doing 5 pushups to 50. The daily consistency with a real trainer changes everything.", rating: 5 },
            ].map((review, i) => (
              <Section key={i} delay={i * 150}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-sm ${s <= review.rating ? "text-gold" : "text-gray-200"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">&ldquo;{review.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                    <p className="text-gray-400 text-xs">{review.city}</p>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FOR TRAINERS ════════════ */}
      <section id="for-trainers" className="px-[5%] py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Section>
              <div>
                <p className="text-accent text-sm font-bold uppercase tracking-wider mb-3">For trainers</p>
                <h2 className="font-serif text-4xl text-gray-900 mb-6">Earn ₹45,000–70,000/month</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Join Onlifit as a certified trainer. We handle clients, payments, and scheduling — you focus on what you do best: training.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Guaranteed client flow",
                    "Flexible schedule — you set your hours",
                    "Weekly payouts directly to your bank",
                    "Training materials & support provided",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-gray-700 text-sm">
                      <span className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/trainer/apply" className="inline-flex px-8 py-3.5 bg-accent rounded-xl text-[15px] font-bold text-white hover:bg-accent-dark transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/20">
                  Apply as a trainer →
                </Link>
              </div>
            </Section>

            <Section delay={200}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: "₹5,100", label: "per Regular client", icon: "🏋️" },
                  { val: "₹6,000", label: "per Live client", icon: "📱" },
                  { val: "₹11,000", label: "per Elite client", icon: "⭐" },
                  { val: "Weekly", label: "payouts", icon: "💰" },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 hover:shadow-sm transition-all">
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="font-serif text-xl text-gray-900">{s.val}</div>
                    <div className="text-gray-400 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="px-[5%] py-24">
        <Section>
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-accent to-accent-dark rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Ready to transform?</h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto">Join hundreds of people who train with Onlifit every day. Your first step starts here.</p>
              <Link href="/auth/signup" className="inline-flex px-8 py-3.5 bg-white rounded-xl text-[15px] font-bold text-accent hover:bg-gray-50 transition-all hover:-translate-y-0.5">
                Get started for free →
              </Link>
            </div>
          </div>
        </Section>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="px-[5%] py-12 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-xl text-gray-900">
            Onli<em className="text-accent italic">fit</em>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#how" className="hover:text-gray-700 transition-colors">How it works</a>
            <a href="#plans" className="hover:text-gray-700 transition-colors">Plans</a>
            <Link href="/trainers" className="hover:text-gray-700 transition-colors">Trainers</Link>
            <Link href="/trainer/apply" className="hover:text-gray-700 transition-colors">Apply as trainer</Link>
          </div>
          <p className="text-gray-300 text-xs">© 2026 Onlifit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
