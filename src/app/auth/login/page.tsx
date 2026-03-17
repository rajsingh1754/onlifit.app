"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check user role to redirect appropriately
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "trainer") {
        // Check if trainer is approved
        const { data: trainer } = await supabase
          .from("trainers")
          .select("is_available")
          .eq("profile_id", data.user.id)
          .single();

        if (trainer?.is_available) {
          router.push("/trainer/dashboard");
        } else {
          router.push("/trainer/pending");
        }
        router.refresh();
        return;
      }
      if (profile?.role === "admin") {
        router.push("/admin");
        router.refresh();
        return;
      }
    }

    const redirectTo = searchParams.get("redirect") || "/dashboard";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-bg relative overflow-hidden">
      {/* Decorative blur circles */}
      <div className="blur-circle pink w-[400px] h-[400px] -top-40 -left-40 opacity-30" />
      <div className="blur-circle yellow w-[300px] h-[300px] bottom-20 right-20 opacity-20" />

      {/* Left side - Image */}
      <div className="hidden lg:block relative w-1/2">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=1600&fit=crop"
          alt="Fitness"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-bg" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-5 relative z-10">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="block text-center mb-10">
            <span className="font-serif text-3xl text-white">
              Onli<em className="gradient-text italic">fit</em>
            </span>
          </Link>

          <div className="glass-card rounded-2xl p-8">
            <h1 className="font-serif text-3xl text-white mb-2">Welcome back</h1>
            <p className="text-gray-400 text-sm mb-6">Sign in to continue training</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Email
                </label>
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
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-pink/40 placeholder:text-gray-600 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 btn-gradient rounded-lg text-[15px] disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-pink hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
