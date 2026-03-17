"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Trainer } from "@/types";

const PLAN_LABEL: Record<string, string> = {
  offline: "Onlifit Regular",
  virtual: "Onlifit Live",
  elite: "Onlifit Elite",
};

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
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] h-[68px] bg-bg/90 backdrop-blur-2xl border-b border-border">
        <div className="font-serif text-[26px] text-white">
          Onli<em className="text-accent italic">fit</em>
        </div>
        <div className="hidden md:flex gap-8">
          <a href="#how" className="text-sm font-medium text-muted hover:text-white transition-colors">How it works</a>
          <a href="#plans" className="text-sm font-medium text-muted hover:text-white transition-colors">Plans</a>
          <Link href="/trainers" className="text-sm font-medium text-muted hover:text-white transition-colors">Trainers</Link>
          <a href="#trainers" className="text-sm font-medium text-muted hover:text-white transition-colors">For trainers</a>
        </div>
        <div className="flex gap-2.5">
          <Link href="/auth/login" className="px-5 py-2.5 border border-border-2 rounded-md text-sm font-semibold text-white/85 hover:border-white/30 hover:text-white transition-all">
            Sign in
          </Link>
          <a href="#how" className="px-5 py-2.5 bg-accent rounded-md text-sm font-bold text-bg hover:bg-accent-dark transition-all">
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-[5%] pt-[120px] pb-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-[0.18] grayscale-[30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/50 to-bg" />
        </div>

        <div className="relative z-10 max-w-[860px]">
          <div className="inline-flex items-center gap-2 border border-border-2 rounded-full px-4 py-1.5 text-xs font-semibold text-muted mb-8">
            <div className="w-[7px] h-[7px] rounded-full bg-accent animate-pulse" />
            Now live in Hyderabad
          </div>

          <h1 className="font-serif text-[clamp(52px,8vw,96px)] leading-[1.0] text-white mb-6 tracking-[-1.5px]">
            Real training.<br />
            <em className="text-accent italic">Every day.</em><br />
            <span className="text-muted font-light">Half the price.</span>
          </h1>

          <p className="text-lg text-muted max-w-[560px] mx-auto mb-10 leading-[1.7]">
            Daily live sessions with certified personal trainers — virtual or at your own gym. Not a diet plan. Not a weekly check-in. A real trainer, watching you, every weekday.
          </p>

          <div className="flex gap-3.5 justify-center flex-wrap mb-14">
            <a href="#how" className="px-8 py-3.5 bg-accent rounded-lg text-[15px] font-bold text-bg hover:bg-accent-dark transition-all hover:-translate-y-0.5">
              Get started
            </a>
            <a href="#plans" className="px-8 py-3.5 border border-border-2 rounded-lg text-[15px] font-semibold text-white/85 hover:border-white/30 transition-all">
              View plans
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="font-serif text-[32px] text-white leading-none">20</div>
              <div className="text-xs text-muted font-medium mt-1">sessions / month</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="font-serif text-[32px] text-white leading-none">₹4,999</div>
              <div className="text-xs text-muted font-medium mt-1">starting price</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="font-serif text-[32px] text-white leading-none">Mon–Fri</div>
              <div className="text-xs text-muted font-medium mt-1">structured schedule</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="px-[5%] py-7 border-t border-b border-border bg-bg-2 flex items-center justify-center gap-3 flex-wrap">
        <span className="text-[11px] font-bold text-muted uppercase tracking-[0.12em] mr-2">Trusted by users across</span>
        {["Hyderabad", "Bangalore", "Chennai", "Mumbai", "Delhi", "+ All India virtual"].map((city) => (
          <span key={city} className="px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold text-muted">
            {city}
          </span>
        ))}
      </div>

      {/* THE ONLIFIT DIFFERENCE */}
      <section className="px-[5%] py-24" id="difference">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold text-accent uppercase tracking-[0.14em] mb-3.5">The Onlifit Difference</p>
            <h2 className="font-serif text-[clamp(36px,4.5vw,58px)] text-white leading-[1.1] tracking-[-0.8px] mb-4">
              Three plans. One platform.<br /><em className="text-accent italic">Zero compromise.</em>
            </h2>
            <p className="text-base text-muted max-w-[560px] mx-auto leading-[1.75]">
              Most platforms give you a diet plan with a weekly check-in call. We give you a real trainer, live, every single weekday.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { num: "01", icon: "→", title: "Onlifit Regular", desc: "Your trainer physically comes to your gym. 16 sessions a month, Mon–Thu. QR check-in per session. Trainer carries an official Onlifit ID card.", color: "accent" },
              { num: "02", icon: "⫸", title: "Onlifit Live", desc: "Live video session every weekday. Your trainer watches your form in real time, corrects you, and pushes you — just like in-person but from anywhere.", color: "orange" },
              { num: "03", icon: "✦", title: "Onlifit Elite", desc: "Top certified trainers with proven track records only. You get a full custom training plan before you pay a single rupee. 20 live sessions a month.", color: "gold" },
            ].map((item) => (
              <div key={item.num} className="bg-card border border-border rounded-2xl p-7 hover:border-border-2 transition-all hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-bold text-muted">{item.num}</span>
                  <span className={`text-2xl ${
                    item.color === "accent" ? "text-accent" :
                    item.color === "orange" ? "text-orange" :
                    "text-gold"
                  }`}>{item.icon}</span>
                </div>
                <h3 className="font-serif text-[22px] text-white mb-3">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-[5%] py-24 bg-bg-2" id="how">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold text-accent uppercase tracking-[0.14em] mb-3.5">How it works</p>
            <h2 className="font-serif text-[clamp(36px,4.5vw,58px)] text-white leading-[1.1] tracking-[-0.8px]">
              Three steps to <em className="text-accent italic">real training.</em>
            </h2>
          </div>

          <div className="space-y-20">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">01</span>
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Step One</span>
                </div>
                <h3 className="font-serif text-[28px] text-white mb-4 leading-tight">Pick your plan and get matched with the right trainer</h3>
                <p className="text-[15px] text-muted leading-relaxed mb-6">
                  Browse verified trainer profiles, check their ratings and specializations, and choose the plan that fits your goals. Pick your trainer, lock in your schedule, and start training.
                </p>
                <Link href="/trainers" className="inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline">
                  Browse trainers →
                </Link>
              </div>
              <div className="flex-1 max-w-md">
                <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80&fit=crop" alt="Choose a trainer" className="w-full h-48 object-cover rounded-xl opacity-80" />
                  <p className="text-xs text-muted mt-3 text-center">Choose a trainer</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">02</span>
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Step Two</span>
                </div>
                <h3 className="font-serif text-[28px] text-white mb-4 leading-tight">Gym check — we handle the awkward part</h3>
                <p className="text-[15px] text-muted leading-relaxed mb-6">
                  For the Offline plan, your app asks one question: does your gym allow freelance trainers? If yes, your trainer walks in with an official Onlifit ID card. Most Hyderabad gyms allow it — no partnership needed.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["QR check-in per session", "Official trainer ID", "No gym partnership needed"].map((tag) => (
                    <span key={tag} className="text-xs font-semibold text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&fit=crop" alt="In gym session" className="w-full h-48 object-cover rounded-xl opacity-80" />
                  <p className="text-xs text-muted mt-3 text-center">In gym session</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">03</span>
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Step Three</span>
                </div>
                <h3 className="font-serif text-[28px] text-white mb-4 leading-tight">Pay once. Train every weekday for the month.</h3>
                <p className="text-[15px] text-muted leading-relaxed mb-6">
                  Happy with your trial? Pay for the month, lock in your schedule, and start. Your trainer shows up every Mon–Fri — live on video or physically at your gym. Sat–Sun off, because rest days matter.
                </p>
                <a href="#plans" className="inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline">
                  See pricing →
                </a>
              </div>
              <div className="flex-1 max-w-md">
                <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&q=80&fit=crop" alt="Training session" className="w-full h-48 object-cover rounded-xl opacity-80" />
                  <p className="text-xs text-muted mt-3 text-center">Training session</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-[5%] py-24" id="plans">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-4">
            <div>
              <p className="text-[11px] font-bold text-accent uppercase tracking-[0.14em] mb-3.5">Pricing</p>
              <h2 className="font-serif text-[clamp(36px,4.5vw,58px)] text-white leading-[1.1] tracking-[-0.8px]">
                Plans built for<br /><em className="text-accent italic">real Indians.</em>
              </h2>
            </div>
            <p className="text-base text-muted max-w-[360px] leading-[1.75]">
              All plans include a free trial session. Mon–Fri schedule. No credit card to start.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {[
              { name: "Onlifit Regular", tag: "Onlifit Regular", price: "7,999", schedule: "per month · 16 sessions · Mon–Thu", color: "accent", cta: "Start free trial", features: ["Trainer visits your gym in person", "4 sessions per week, Mon–Thu", "QR check-in per session", "Works at your existing gym", "Official Onlifit trainer ID"] },
              { name: "Onlifit Live", tag: "Onlifit Live", price: "4,999", schedule: "per month · 20 sessions · Mon–Fri", color: "orange", cta: "Start free trial", features: ["Live 1-on-1 video every weekday", "Real-time form correction", "Session recordings available", "Train from home or gym", "Cheapest daily live training in India"], popular: true },
              { name: "Onlifit Elite", tag: "Onlifit Elite", price: "14,999", schedule: "per month · 20 sessions · Mon–Fri", color: "gold", cta: "See your plan first", features: ["Top certified trainers only", "Custom plan before you pay", "Nutrition guidance included", "Priority support & trainer matching", "Proven track record trainers"] },
            ].map((plan) => (
              <div key={plan.name} className={`bg-card border rounded-2xl p-7 relative transition-all hover:-translate-y-1 ${plan.popular ? "border-accent bg-gradient-to-br from-accent/5 to-card" : "border-border hover:border-border-2"}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-7 bg-accent text-bg text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most popular
                  </span>
                )}
                <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${
                  plan.color === "accent" ? "bg-accent/10 text-accent" :
                  plan.color === "orange" ? "bg-orange/10 text-orange" :
                  "bg-gold/10 text-gold"
                }`}>
                  {plan.tag}
                </span>
                <h3 className="font-serif text-[26px] text-white mb-1">{plan.name}</h3>
                <div className="font-serif text-[52px] text-white leading-none my-3.5">
                  <sup className="text-[22px] align-super font-sans font-semibold">₹</sup>{plan.price}
                </div>
                <p className="text-sm text-muted mb-6">{plan.schedule}</p>
                <div className="h-px bg-border my-5" />
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 ${
                        plan.color === "accent" ? "bg-accent/10 text-accent" :
                        plan.color === "orange" ? "bg-orange/10 text-orange" :
                        "bg-gold/10 text-gold"
                      }`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/trainers"
                  className={`block w-full py-3.5 rounded-lg text-sm font-bold text-center transition-all ${
                    plan.popular
                      ? "bg-accent text-bg hover:bg-accent-dark"
                      : "border border-border-2 text-white hover:border-white/30"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers section */}
      <section className="px-[5%] py-24 bg-bg-2" id="trainers-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-12">
            <div>
              <p className="text-[11px] font-bold text-accent uppercase tracking-[0.14em] mb-3.5">Trainers</p>
              <h2 className="font-serif text-[clamp(36px,4.5vw,58px)] text-white leading-[1.1] tracking-[-0.8px]">
                Meet our <em className="text-accent italic">top trainers.</em>
              </h2>
            </div>
            <Link href="/trainers" className="text-sm text-accent font-semibold hover:underline">
              View all trainers →
            </Link>
          </div>

          {loadingTrainers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-white/5" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/5 rounded w-32 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-20" />
                    </div>
                  </div>
                  <div className="h-3 bg-white/5 rounded w-full mb-2" />
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainers.map((trainer) => (
                <Link
                  key={trainer.id}
                  href={`/trainers/${trainer.id}`}
                  className="bg-card border border-border rounded-2xl p-6 hover:border-border-2 hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-bg-3 border border-border flex items-center justify-center text-xl text-muted overflow-hidden">
                      {trainer.avatar_url ? (
                        <img src={trainer.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        trainer.full_name?.charAt(0) || "T"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-[15px] truncate">{trainer.full_name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-gold text-xs">{"★".repeat(Math.round(trainer.rating))}</span>
                        <span className="text-muted text-xs">{trainer.rating} · {trainer.experience_years}y exp</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trainer.plan_types?.map((plan) => (
                      <span
                        key={plan}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          plan === "offline" ? "bg-accent/10 text-accent" :
                          plan === "virtual" ? "bg-orange/10 text-orange" :
                          "bg-gold/10 text-gold"
                        }`}
                      >
                        {PLAN_LABEL[plan] || plan}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOR TRAINERS */}
      <section className="px-[5%] py-24" id="trainers">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1">
              <p className="text-[11px] font-bold text-accent uppercase tracking-[0.14em] mb-3.5">For Trainers</p>
              <h2 className="font-serif text-[clamp(36px,4.5vw,58px)] text-white leading-[1.1] tracking-[-0.8px] mb-4">
                Earn more.<br /><em className="text-accent italic">Own your schedule.</em>
              </h2>
              <p className="text-base text-muted leading-relaxed max-w-lg mb-8">
                Stop chasing clients on Instagram and WhatsApp. Onlifit gives you guaranteed monthly income with a structured Mon–Fri schedule and zero gym cut.
              </p>
              <div className="bg-card border border-accent/20 rounded-2xl p-6 inline-block mb-8">
                <p className="text-xs text-muted mb-1">avg monthly earnings</p>
                <p className="font-serif text-[42px] text-accent leading-none">₹70,000</p>
                <p className="text-xs text-muted mt-1">with 10 clients</p>
              </div>
              <div>
                <Link href="/trainer/apply?ref=home" className="inline-block px-8 py-3.5 bg-accent rounded-lg text-[15px] font-bold text-bg hover:bg-accent-dark transition-all hover:-translate-y-0.5">
                  Apply as a trainer →
                </Link>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "💰", title: "₹45,000–70,000/month", desc: "With 8–10 clients. No gym commission, no middleman, no deductions." },
                { icon: "📅", title: "Mon–Fri only", desc: "Weekends are yours. Predictable schedule, predictable income, every month." },
                { icon: "⭐", title: "Grow to Elite tier", desc: "Top-rated trainers get promoted — earn ₹6,000–8,000 per client per month." },
                { icon: "🪪", title: "Official Onlifit ID card", desc: "Walk into any partnered gym with your verified ID. No awkward conversations." },
              ].map((item) => (
                <div key={item.title} className="bg-card border border-border rounded-xl p-5 hover:border-border-2 transition-all">
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <h4 className="text-white font-bold text-sm mb-2">{item.title}</h4>
                  <p className="text-muted text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS / Testimonials */}
      <section className="px-[5%] py-24 bg-bg-2" id="results">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold text-accent uppercase tracking-[0.14em] mb-3.5">Results</p>
            <h2 className="font-serif text-[clamp(36px,4.5vw,58px)] text-white leading-[1.1] tracking-[-0.8px] mb-4">
              Real people.<br /><em className="text-accent italic">Real results.</em>
            </h2>
            <p className="text-base text-muted max-w-[500px] mx-auto leading-[1.75]">
              Users across Hyderabad training daily with Onlifit — not once a week, not on a diet plan. Every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { name: "Aditya Kumar", plan: "Standard plan · Hyderabad", stars: 5, quote: "Ravi corrects my form every single day on video. My gym PT used to do that once a week and charge three times more. This is the future of fitness — I've lost 8kg in two months." },
              { name: "Sowmya Rao", plan: "Offline · Banjara Hills", stars: 5, quote: "Mohan walks in with his ID card. My gym allows it — zero hassle. Like having a PT without Gold's Gym pricing." },
              { name: "Vishal Patel", plan: "Elite · Jubilee Hills", stars: 5, quote: "Anjali sent me a full plan before I paid anything. That one detail told me this platform was serious." },
            ].map((r) => (
              <div key={r.name} className="bg-card border border-border rounded-2xl p-6 hover:border-border-2 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-bg-3 border border-border flex items-center justify-center text-sm font-bold text-muted">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{r.name}</p>
                    <p className="text-muted text-xs">{r.plan}</p>
                  </div>
                </div>
                <div className="text-gold text-xs mb-3">{"★".repeat(r.stars)}</div>
                <p className="text-muted text-sm leading-relaxed italic">&ldquo;{r.quote}&rdquo;</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/trainers" className="text-sm text-accent font-semibold hover:underline">
              Start your journey →
            </Link>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="px-[5%] py-24" id="compare">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold text-accent uppercase tracking-[0.14em] mb-3.5">Comparison</p>
            <h2 className="font-serif text-[clamp(36px,4.5vw,58px)] text-white leading-[1.1] tracking-[-0.8px] mb-4">
              Why Onlifit wins<br /><em className="text-accent italic">every time.</em>
            </h2>
            <p className="text-base text-muted max-w-[560px] mx-auto leading-[1.75]">
              We&apos;re not cheaper by cutting quality. We&apos;re cheaper because we cut out every single middleman between you and your trainer.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card border-b border-border">
                  <th className="text-left py-4 px-5 text-muted font-semibold text-xs uppercase tracking-wider"></th>
                  <th className="py-4 px-5 text-accent font-bold text-xs uppercase tracking-wider">Onlifit Standard</th>
                  <th className="py-4 px-5 text-muted font-semibold text-xs uppercase tracking-wider">Others</th>
                  <th className="py-4 px-5 text-muted font-semibold text-xs uppercase tracking-wider">Gold&apos;s Gym PT</th>
                  <th className="py-4 px-5 text-muted font-semibold text-xs uppercase tracking-wider">Freelancer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Price / month", values: ["₹4,999", "₹7,500–15,000", "₹8,000–18,000", "₹5,000–12,000"] },
                  { label: "Daily live sessions", values: ["✓", "✗ Weekly only", "✓", "Maybe"] },
                  { label: "In-person option", values: ["✓ Offline plan", "✗", "✓", "✓"] },
                  { label: "Real-time form correction", values: ["✓", "✗", "✓", "Maybe"] },
                  { label: "Verified trainer profile", values: ["✓", "✓", "✓", "✗"] },
                  { label: "Free trial session", values: ["✓", "✗", "✗", "Rarely"] },
                  { label: "Works without gym membership", values: ["✓ Virtual plan", "✓", "✗", "Varies"] },
                ].map((row, i) => (
                  <tr key={row.label} className={`border-b border-border ${i % 2 === 0 ? "bg-bg" : "bg-card/50"}`}>
                    <td className="py-3.5 px-5 text-white font-medium text-sm">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td key={j} className={`py-3.5 px-5 text-center text-sm ${
                        j === 0
                          ? val.startsWith("✓") ? "text-accent font-bold" : "text-white font-semibold"
                          : val.startsWith("✓") ? "text-white/60" : val.startsWith("✗") ? "text-white/25" : "text-white/40"
                      }`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* LIMITED SPOTS CTA */}
      <section className="px-[5%] py-24 bg-bg-2">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-bold text-accent uppercase tracking-[0.14em] mb-3.5">Limited Spots · Hyderabad</p>
          <h2 className="font-serif text-[clamp(36px,4.5vw,58px)] text-white leading-[1.1] tracking-[-0.8px] mb-5">
            Stop paying<br /><em className="text-accent italic">for less.</em>
          </h2>
          <p className="text-base text-muted max-w-[480px] mx-auto leading-[1.75] mb-10">
            Your first session is completely free. Meet your trainer, see the platform, then decide. No card required.
          </p>
          <div className="flex gap-3.5 justify-center flex-wrap mb-8">
            <Link href="/auth/signup" className="px-8 py-3.5 bg-accent rounded-lg text-[15px] font-bold text-bg hover:bg-accent-dark transition-all hover:-translate-y-0.5">
              Get my free session
            </Link>
            <Link href="/trainer/apply?ref=home" className="px-8 py-3.5 border border-border-2 rounded-lg text-[15px] font-semibold text-white/85 hover:border-white/30 transition-all">
              Join as trainer
            </Link>
          </div>
          <p className="text-xs text-muted">No credit card · Free trial · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg border-t border-border px-[5%] py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 pb-10 border-b border-border">
            <div>
              <div className="font-serif text-[28px] text-white">Onli<em className="text-accent italic">fit</em></div>
              <p className="text-sm text-muted mt-3 max-w-[280px] leading-relaxed">
                Hyderabad&apos;s first daily live personal training platform. Real trainer, every weekday.
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-muted">
                <p>📍 Hyderabad, Telangana, India</p>
                <p>📞 +91 XXXXX XXXXX</p>
                <p>✉️ hello@onlifit.in</p>
              </div>
            </div>
            <div className="flex gap-12 md:gap-16 flex-wrap">
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</p>
                <div className="space-y-2.5">
                  <a href="#how" className="block text-sm text-muted hover:text-white transition-colors">How it works</a>
                  <a href="#plans" className="block text-sm text-muted hover:text-white transition-colors">Pricing</a>
                  <a href="#compare" className="block text-sm text-muted hover:text-white transition-colors">Compare</a>
                  <span className="block text-sm text-white/25">App (coming soon)</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Trainers</p>
                <div className="space-y-2.5">
                  <Link href="/trainer/apply?ref=home" className="block text-sm text-muted hover:text-white transition-colors">Join as trainer</Link>
                  <a href="#trainers" className="block text-sm text-muted hover:text-white transition-colors">Trainer earnings</a>
                  <a href="#trainers" className="block text-sm text-muted hover:text-white transition-colors">Elite program</a>
                  <a href="#trainers" className="block text-sm text-muted hover:text-white transition-colors">Trainer ID card</a>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Company</p>
                <div className="space-y-2.5">
                  <a href="#" className="block text-sm text-muted hover:text-white transition-colors">About us</a>
                  <a href="#" className="block text-sm text-muted hover:text-white transition-colors">Contact</a>
                  <a href="#" className="block text-sm text-muted hover:text-white transition-colors">Privacy policy</a>
                  <a href="#" className="block text-sm text-muted hover:text-white transition-colors">Terms of service</a>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-6 flex-wrap gap-3">
            <p className="text-sm text-white/25">© 2025 Onlifit · All rights reserved</p>
            <div className="flex gap-2">
              <span className="text-[11px] font-bold text-white/30 border border-border rounded-full px-2.5 py-1">Made in India</span>
              <span className="text-[11px] font-bold text-white/30 border border-border rounded-full px-2.5 py-1">Hyderabad</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
