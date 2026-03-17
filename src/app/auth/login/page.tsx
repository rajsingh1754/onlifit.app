"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="block text-center mb-10">
          <span className="font-serif text-3xl text-white">
            Onli<em className="text-accent italic">fit</em>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h1 className="font-serif text-3xl text-white mb-2">Welcome back</h1>
          <p className="text-muted text-sm mb-6">Sign in to continue training</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5">
                Email
              </label>
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
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[15px] outline-none focus:border-accent/40 placeholder:text-white/20 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-accent text-bg font-extrabold text-[15px] rounded-lg hover:bg-accent-dark transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-accent hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
