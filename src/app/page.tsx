import Link from "next/link";

export default function HomePage() {
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
          <a href="#trainers" className="text-sm font-medium text-muted hover:text-white transition-colors">For trainers</a>
        </div>
        <div className="flex gap-2.5">
          <Link href="/auth/login" className="px-5 py-2.5 border border-border-2 rounded-md text-sm font-semibold text-white/85 hover:border-white/30 hover:text-white transition-all">
            Sign in
          </Link>
          <Link href="/auth/signup" className="px-5 py-2.5 bg-accent rounded-md text-sm font-bold text-bg hover:bg-accent-dark transition-all">
            Get started
          </Link>
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
            <Link href="/auth/signup" className="px-8 py-3.5 bg-accent rounded-lg text-[15px] font-bold text-bg hover:bg-accent-dark transition-all hover:-translate-y-0.5">
              Get started
            </Link>
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

      {/* Plans section */}
      <section className="px-[5%] py-24 bg-bg-2" id="plans">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-12">
            <div>
              <p className="text-[11px] font-bold text-accent uppercase tracking-[0.14em] mb-3.5">Pricing</p>
              <h2 className="font-serif text-[clamp(36px,4.5vw,58px)] text-white leading-[1.1] tracking-[-0.8px]">
                Plans built for<br /><em className="text-accent italic">real Indians.</em>
              </h2>
            </div>
            <p className="text-base text-muted max-w-[360px] leading-[1.75]">
              All plans include Mon–Fri schedule. No credit card to start.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Offline Plan", tag: "Dedicated Offline", price: "7,999", schedule: "16 sessions · Mon–Thu", color: "accent", features: ["Trainer visits your gym in person", "4 sessions per week, Mon–Thu", "QR check-in per session", "Works at your existing gym", "Official Onlifit trainer ID"] },
              { name: "Standard Plan", tag: "Live Virtual", price: "4,999", schedule: "20 sessions · Mon–Fri", color: "orange", features: ["Live 1-on-1 video every weekday", "Real-time form correction", "Session recordings available", "Train from home or gym", "Cheapest daily training option"], popular: true },
              { name: "Elite Plan", tag: "Elite", price: "14,999", schedule: "20 sessions · Mon–Fri", color: "gold", features: ["Top certified trainers only", "Custom plan before you pay", "Nutrition guidance included", "Priority support & trainer matching", "Proven track record trainers"] },
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
                  href="/auth/signup"
                  className={`block w-full py-3.5 rounded-lg text-sm font-bold text-center transition-all ${
                    plan.popular
                      ? "bg-accent text-bg hover:bg-accent-dark"
                      : "border border-border-2 text-white hover:border-white/30"
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-2 border-t border-border px-[5%] py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 pb-10 border-b border-border">
            <div>
              <div className="font-serif text-[28px] text-white">Onli<em className="text-accent italic">fit</em></div>
              <p className="text-sm text-muted mt-3 max-w-[230px] leading-relaxed">
                Hyderabad&apos;s first daily live personal training platform. Real trainer, every weekday.
              </p>
            </div>
            <div className="flex gap-16 flex-wrap">
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</p>
                <div className="space-y-2.5">
                  <a href="#how" className="block text-sm text-muted hover:text-white transition-colors">How it works</a>
                  <a href="#plans" className="block text-sm text-muted hover:text-white transition-colors">Pricing</a>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Trainers</p>
                <div className="space-y-2.5">
                  <Link href="/auth/signup" className="block text-sm text-muted hover:text-white transition-colors">Join as trainer</Link>
                  <a href="#trainers" className="block text-sm text-muted hover:text-white transition-colors">Earnings</a>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Company</p>
                <div className="space-y-2.5">
                  <a href="#" className="block text-sm text-muted hover:text-white transition-colors">About</a>
                  <a href="#" className="block text-sm text-muted hover:text-white transition-colors">Contact</a>
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
