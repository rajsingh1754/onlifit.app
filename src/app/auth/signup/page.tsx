"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"user" | "trainer">("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Update profile with role, phone, city
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ role, phone, city, full_name: fullName })
        .eq("id", data.user.id);
    }

    const redirectTo = searchParams.get("redirect") || "/dashboard";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="block text-center mb-10">
          <span className="font-serif text-3xl text-white">
            Onli<em className="text-accent italic">fit</em>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8">
          {/* Step indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-accent" : "bg-white/10"
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              <h1 className="font-serif text-3xl text-white mb-2">Join Onlifit</h1>
              <p className="text-muted text-sm mb-6">How do you want to use Onlifit?</p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setRole("user")}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    role === "user"
                      ? "border-accent bg-accent/5"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm ${
                      role === "user" ? "border-accent/30 bg-accent/10" : "border-white/10 bg-bg-3"
                    }`}>
                      →
                    </div>
                    <div>
                      <div className="font-bold text-white text-[15px]">I want to train</div>
                      <div className="text-muted text-xs mt-0.5">Find a trainer and start daily sessions</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setRole("trainer")}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    role === "trainer"
                      ? "border-accent bg-accent/5"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm ${
                      role === "trainer" ? "border-accent/30 bg-accent/10" : "border-white/10 bg-bg-3"
                    }`}>
                      ✦
                    </div>
                    <div>
                      <div className="font-bold text-white text-[15px]">I&apos;m a trainer</div>
                      <div className="text-muted text-xs mt-0.5">Earn ₹45,000–70,000/month with Onlifit</div>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-accent text-bg font-extrabold text-[15px] rounded-lg hover:bg-accent-dark transition-all"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="text-muted text-sm mb-4 hover:text-white transition-colors">
                ← Back
              </button>
              <h1 className="font-serif text-3xl text-white mb-2">Your details</h1>
              <p className="text-muted text-sm mb-6">
                {role === "trainer" ? "Set up your trainer account" : "Create your account to get started"}
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-accent/40 placeholder:text-white/20 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-accent/40 placeholder:text-white/20 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-accent/40 placeholder:text-white/20 transition-colors"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5">WhatsApp number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-accent/40 placeholder:text-white/20 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-accent/40 transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled className="bg-bg-3">Select your city</option>
                    <option value="Hyderabad" className="bg-bg-3">Hyderabad</option>
                    <option value="Bangalore" className="bg-bg-3">Bangalore</option>
                    <option value="Chennai" className="bg-bg-3">Chennai</option>
                    <option value="Mumbai" className="bg-bg-3">Mumbai</option>
                    <option value="Delhi" className="bg-bg-3">Delhi</option>
                    <option value="Other" className="bg-bg-3">Other (Virtual only)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-accent text-bg font-extrabold text-[15px] rounded-lg hover:bg-accent-dark transition-all disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-muted text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
