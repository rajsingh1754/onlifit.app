"use client";

import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] h-[70px] bg-bg-2/80 backdrop-blur-xl border-b border-border">
        <div className="text-[28px] font-extrabold tracking-tight text-white">
          ONLI<span className="gradient-text">FIT</span>
        </div>
        <div className="hidden md:flex gap-8">
          <a href="#how" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">How it works</a>
          <a href="#plans" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Plans</a>
          <Link href="/trainers" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Trainers</Link>
          <a href="#for-trainers" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">For trainers</a>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/login" className="px-5 py-2.5 border border-border rounded-lg text-sm font-semibold text-white hover:border-gray-500 hover:bg-white/5 transition-all">
            Sign in
          </Link>
          <Link href="/auth/signup" className="btn-gradient px-5 py-2.5 rounded-lg text-sm">
            Get started
          </Link>
        </div>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section className="min-h-screen flex items-center px-[5%] pt-[100px] pb-20 relative overflow-hidden bg-black">
        {/* Decorative blur circles */}
        <div className="blur-circle pink w-[500px] h-[500px] -top-20 -right-40 animate-glow-pulse opacity-50" />
        <div className="blur-circle blue w-[300px] h-[300px] bottom-20 right-1/4 animate-glow-pulse opacity-50" style={{ animationDelay: "1s" }} />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 text-xs font-semibold text-gray-300 mb-6 animate-fade-in-up">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Now live in Hyderabad
            </div>

            <h1 className="font-serif text-[clamp(44px,6vw,76px)] leading-[1.05] text-white mb-6 tracking-[-1px] animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Real training.<br />
              <span className="gradient-text">Every single day.</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-[500px] mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              Daily live sessions with certified personal trainers — virtual or at your own gym. A real trainer, watching you, every weekday.
            </p>

            <div className="flex gap-4 flex-wrap mb-10 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <Link href="/auth/signup" className="btn-gradient px-8 py-4 rounded-xl text-[15px]">
                Start your journey →
              </Link>
              <a href="#plans" className="btn-outline-gradient px-8 py-4 rounded-xl text-[15px] font-semibold hover:bg-white/5 transition-all">
                View plans
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-10 flex-wrap animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              {[
                { val: "20", label: "sessions / month" },
                { val: "₹4,999", label: "starting price" },
                { val: "1:1", label: "personal training" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-serif text-3xl text-white leading-none">{s.val}</div>
                  <div className="text-[11px] text-gray-500 font-medium mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Fitness images grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden h-[220px] animate-float" style={{ animationDelay: "0s" }}>
                <Image
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop"
                  alt="Strength Training"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">Strength Training</p>
              </div>
              <div className="relative rounded-3xl overflow-hidden h-[180px] animate-float" style={{ animationDelay: "1s" }}>
                <Image
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop"
                  alt="Yoga"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">Yoga & Flexibility</p>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="relative rounded-3xl overflow-hidden h-[180px] animate-float" style={{ animationDelay: "0.5s" }}>
                <Image
                  src="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=250&fit=crop"
                  alt="Cardio"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">Cardio & HIIT</p>
              </div>
              <div className="relative rounded-3xl overflow-hidden h-[220px] animate-float" style={{ animationDelay: "1.5s" }}>
                <Image
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop"
                  alt="Personal Training"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">Personal Coaching</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how" className="px-[5%] py-28 bg-bg-2 relative overflow-hidden">
        <div className="blur-circle teal w-[300px] h-[300px] top-0 right-0 opacity-30" />

        <div className="max-w-5xl mx-auto relative z-10">
          <Section>
            <p className="gradient-text text-sm font-bold uppercase tracking-wider mb-3">How it works</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Three simple steps</h2>
            <p className="text-gray-400 max-w-lg mb-16">Get started with your personal fitness journey in minutes.</p>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop", title: "Choose your trainer", desc: "Browse certified trainers by specialization, location, and availability. Read reviews and find your perfect match." },
              { step: "02", img: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop", title: "Book your plan", desc: "Pick a plan that fits your goals — offline gym, virtual training, or premium elite coaching with nutrition guidance." },
              { step: "03", img: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop", title: "Train daily", desc: "Show up every weekday for your 1-on-1 session. Your trainer tracks your progress and adjusts your program." },
            ].map((item, i) => (
              <Section key={i} delay={i * 150}>
                <div className="glass-card rounded-2xl overflow-hidden hover:border-pink/30 transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-2 to-transparent" />
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gradient-to-r from-yellow to-pink flex items-center justify-center text-black font-bold text-sm">
                      {item.step}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-white mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ PLANS ════════════ */}
      <section id="plans" className="px-[5%] py-28 relative overflow-hidden">
        <div className="blur-circle pink w-[400px] h-[400px] -bottom-40 -left-40 opacity-30" />
        <div className="blur-circle yellow w-[300px] h-[300px] top-20 right-0 opacity-20" />

        <div className="max-w-5xl mx-auto relative z-10">
          <Section>
            <p className="gradient-text text-sm font-bold uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Plans for every goal</h2>
            <p className="text-gray-400 max-w-lg mb-16">All plans include 20 sessions/month, 1-on-1 training, and progress tracking.</p>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Onlifit Regular", price: "5,999", desc: "Train at your local gym with a certified trainer who comes to you.", tag: "offline", features: ["20 sessions / month", "Your gym, your schedule", "Certified trainer visits you", "Progress tracking"], color: "blue" },
              { name: "Onlifit Live", price: "7,999", desc: "Virtual 1-on-1 sessions from home. Same intensity, more flexibility.", tag: "virtual", features: ["20 sessions / month", "HD video sessions", "Screen sharing & form checks", "Flexible scheduling"], popular: true, color: "pink" },
              { name: "Onlifit Elite", price: "14,999", desc: "Premium coaching with nutrition plans, supplements, and priority support.", tag: "elite", features: ["20 sessions / month", "Nutrition & diet plans", "Supplement guidance", "Priority scheduling", "WhatsApp support"], color: "yellow" },
            ].map((plan, i) => (
              <Section key={i} delay={i * 150}>
                <div className={`relative glass-card rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 ${plan.popular ? "border-pink/50 glow-pink" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow to-pink text-black text-[11px] font-bold uppercase rounded-full tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-serif text-xl text-white mb-1">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-5">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="font-serif text-4xl gradient-text">₹{plan.price}</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                        <span className="text-pink">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signup" className={`block w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all ${plan.popular ? "btn-gradient" : "bg-white/10 text-white hover:bg-white/20"}`}>
                    Get started
                  </Link>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TRAINERS PREVIEW ════════════ */}
      <section className="px-[5%] py-28 bg-bg-2 relative overflow-hidden">
        <div className="blur-circle blue w-[350px] h-[350px] top-0 left-1/2 opacity-20" />

        <div className="max-w-5xl mx-auto relative z-10">
          <Section>
            <p className="gradient-text text-sm font-bold uppercase tracking-wider mb-3">Our trainers</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Certified. Experienced. Passionate.</h2>
            <p className="text-gray-400 max-w-lg mb-16">Every Onlifit trainer is hand-picked, verified, and ready to help you crush your goals.</p>
          </Section>

          {loadingTrainers ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-10 h-10 border-2 border-pink border-t-transparent rounded-full" />
            </div>
          ) : trainers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((t, i) => (
                <Section key={t.id} delay={i * 100}>
                  <Link href={`/trainers/${t.id}`} className="group glass-card rounded-2xl overflow-hidden hover:border-pink/30 transition-all duration-300">
                    <div className="h-52 relative">
                      {t.avatar_url ? (
                        <Image src={t.avatar_url} alt={t.full_name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink/20 to-yellow/20 flex items-center justify-center">
                          <span className="text-6xl">💪</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-2 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-white group-hover:text-pink transition-colors">{t.full_name}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {t.plan_types?.map((pt: string) => PLAN_LABEL[pt] || pt).join(", ")} · {t.experience_years}y exp
                      </p>
                      {t.rating > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-yellow text-sm">★</span>
                          <span className="text-sm font-medium text-white">{t.rating}</span>
                          <span className="text-gray-500 text-xs">({t.total_reviews})</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </Section>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card rounded-2xl">
              <p className="text-5xl mb-3">💪</p>
              <p className="text-white font-semibold text-lg">Trainers coming soon</p>
              <p className="text-gray-500 text-sm mt-1">We&apos;re onboarding certified trainers in Hyderabad.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/trainers" className="btn-outline-gradient px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 hover:bg-white/5 transition-all">
              Browse all trainers →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ WHAT YOU GET ════════════ */}
      <section className="px-[5%] py-28 relative overflow-hidden">
        <div className="blur-circle yellow w-[400px] h-[400px] top-1/2 -right-40 opacity-20" />

        <div className="max-w-5xl mx-auto relative z-10">
          <Section>
            <p className="gradient-text text-sm font-bold uppercase tracking-wider mb-3">Benefits</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-16">Why people love Onlifit</h2>
          </Section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎯", title: "1-on-1 Training", desc: "Every session is personal. Your trainer watches your form, counts your reps, and pushes you." },
              { icon: "📊", title: "Progress Tracking", desc: "Track your gains, body measurements, and workout history — all in one place." },
              { icon: "🕐", title: "Flexible Timing", desc: "Pick your slot. Morning, afternoon, or evening — train when it suits you best." },
              { icon: "💰", title: "Half the Price", desc: "Personal training that costs less than ₹300/session. No contracts, cancel anytime." },
            ].map((item, i) => (
              <Section key={i} delay={i * 100}>
                <div className="glass-card rounded-2xl p-6 text-center hover:border-pink/30 transition-all duration-300">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section className="px-[5%] py-28 bg-bg-2 relative overflow-hidden">
        <div className="blur-circle pink w-[300px] h-[300px] bottom-0 left-1/4 opacity-20" />

        <div className="max-w-5xl mx-auto relative z-10">
          <Section>
            <p className="gradient-text text-sm font-bold uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-16">What our members say</h2>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Ravi K.", city: "Hyderabad", text: "Lost 12kg in 3 months. My trainer keeps me accountable every single day. Best investment I've made.", rating: 5 },
              { name: "Sneha M.", city: "Hyderabad", text: "The virtual sessions are incredibly effective. My trainer corrects my form in real-time through video.", rating: 5 },
              { name: "Arjun P.", city: "Hyderabad", text: "Went from barely doing 5 pushups to 50. The daily consistency with a real trainer changes everything.", rating: 5 },
            ].map((review, i) => (
              <Section key={i} delay={i * 150}>
                <div className="glass-card rounded-2xl p-6 hover:border-pink/30 transition-all duration-300">
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-sm ${s <= review.rating ? "text-yellow" : "text-gray-600"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-5">&ldquo;{review.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-white text-sm">{review.name}</p>
                    <p className="text-gray-500 text-xs">{review.city}</p>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FOR TRAINERS ════════════ */}
      <section id="for-trainers" className="px-[5%] py-28 relative overflow-hidden">
        <div className="blur-circle blue w-[400px] h-[400px] top-0 -left-40 opacity-20" />
        <div className="blur-circle yellow w-[300px] h-[300px] bottom-0 right-0 opacity-20" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Section>
              <div>
                <p className="gradient-text text-sm font-bold uppercase tracking-wider mb-3">For trainers</p>
                <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Earn ₹45,000–70,000/month</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Join Onlifit as a certified trainer. We handle clients, payments, and scheduling — you focus on what you do best: training.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Guaranteed client flow",
                    "Flexible schedule — you set your hours",
                    "Weekly payouts directly to your bank",
                    "Training materials & support provided",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-gray-300 text-sm">
                      <span className="w-6 h-6 bg-gradient-to-r from-yellow to-pink rounded-full flex items-center justify-center text-black text-xs font-bold flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/trainer/apply" className="btn-gradient inline-flex px-8 py-4 rounded-xl text-[15px]">
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
                  <div key={i} className="glass-card rounded-2xl p-6 text-center hover:border-pink/30 transition-all duration-300">
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="font-serif text-xl gradient-text">{s.val}</div>
                    <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="px-[5%] py-28">
        <Section>
          <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=1200&h=600&fit=crop"
                alt="Fitness"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/90" />
            </div>

            <div className="relative z-10 p-12 md:p-20 text-center">
              <h2 className="font-serif text-3xl md:text-5xl text-white mb-4">Ready to transform?</h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">Join hundreds of people who train with Onlifit every day. Your first step starts here.</p>
              <Link href="/auth/signup" className="btn-gradient inline-flex px-8 py-4 rounded-xl text-[15px]">
                Get started for free →
              </Link>
            </div>
          </div>
        </Section>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="px-[5%] py-12 border-t border-border bg-bg-2">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-extrabold tracking-tight text-white">
            ONLI<span className="gradient-text">FIT</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#plans" className="hover:text-white transition-colors">Plans</a>
            <Link href="/trainers" className="hover:text-white transition-colors">Trainers</Link>
            <Link href="/trainer/apply" className="hover:text-white transition-colors">Apply as trainer</Link>
          </div>
          <p className="text-gray-600 text-xs">© 2026 Onlifit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
