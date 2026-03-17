"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

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
    <div className="min-h-screen flex bg-bg relative overflow-hidden">
      {/* Decorative blur circles */}
      <div className="blur-circle yellow w-[400px] h-[400px] -top-40 -right-40 opacity-30" />
      <div className="blur-circle pink w-[300px] h-[300px] bottom-20 left-20 opacity-20" />

      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-5 relative z-10">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="block text-center mb-10">
            <span className="font-serif text-3xl text-white">
              Onli<em className="gradient-text italic">fit</em>
            </span>
          </Link>

          <div className="glass-card rounded-2xl p-8">
            <h1 className="font-serif text-3xl text-white mb-2">Join Onlifit</h1>
            <p className="text-gray-400 text-sm mb-6">Create your account to find a trainer and start training</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-pink/40 placeholder:text-gray-600 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-pink/40 placeholder:text-gray-600 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-pink/40 placeholder:text-gray-600 transition-colors"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">WhatsApp number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-pink/40 placeholder:text-gray-600 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-pink/40 transition-colors appearance-none"
                  required
                >
                  <option value="" disabled className="bg-bg-2 text-gray-400">Select your city</option>
                  <option value="Hyderabad" className="bg-bg-2">Hyderabad</option>
                  <option value="Bangalore" className="bg-bg-2">Bangalore</option>
                  <option value="Chennai" className="bg-bg-2">Chennai</option>
                  <option value="Mumbai" className="bg-bg-2">Mumbai</option>
                  <option value="Delhi" className="bg-bg-2">Delhi</option>
                  <option value="Other" className="bg-bg-2">Other (Virtual only)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 btn-gradient rounded-lg text-[15px] disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-center text-gray-500 text-xs mb-3">Are you a trainer?</p>
              <Link
                href="/trainer/apply?ref=home"
                className="block w-full py-3 text-center btn-outline-gradient rounded-lg text-[14px] font-bold hover:bg-white/5 transition-all"
              >
                ✦ Apply as a Trainer
              </Link>
            </div>

            <p className="text-center text-gray-400 text-sm mt-6">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-pink hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative w-1/2">
        <Image
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=1600&fit=crop"
          alt="Personal Training"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-bg" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
      </div>
    </div>
  );
}
