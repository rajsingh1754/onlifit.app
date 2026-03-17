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

    if (data.user) {
      await supabase
        .from("profiles")
        .update({ role: "user", phone, city, full_name: fullName })
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
          <h1 className="font-serif text-3xl text-white mb-2">Join Onlifit</h1>
          <p className="text-muted text-sm mb-6">Create your account to find a trainer and start training</p>

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

          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-center text-muted text-xs mb-3">Are you a trainer?</p>
            <Link
              href="/trainer/apply?ref=home"
              className="block w-full py-3 text-center border border-accent/30 text-accent font-bold text-[14px] rounded-lg hover:bg-accent/5 transition-all"
            >
              ✦ Apply as a Trainer
            </Link>
          </div>

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
