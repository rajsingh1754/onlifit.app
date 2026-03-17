"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TrainerPendingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: trainer } = await supabase
        .from("trainers")
        .select("is_available")
        .eq("profile_id", user.id)
        .single();

      if (trainer?.is_available) {
        router.push("/trainer/dashboard");
        return;
      }
      setChecking(false);
    }
    checkStatus();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[480px]">
        <Link href="/" className="block text-center mb-10">
          <span className="font-serif text-3xl text-gray-900">
            Onli<em className="text-accent italic">fit</em>
          </span>
        </Link>

        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center text-4xl mx-auto mb-6">
            ⏳
          </div>
          <h1 className="font-serif text-3xl text-gray-900 mb-3">Application Under Review</h1>
          <p className="text-muted text-[15px] leading-relaxed max-w-md mx-auto mb-8">
            Your trainer application is being reviewed by our team. You&apos;ll receive access to your trainer dashboard once approved. This usually takes 24–48 hours.
          </p>

          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-8 text-left">
            <h3 className="text-gray-900 font-semibold text-sm mb-3">Review Process</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent text-xs">✓</span>
                </div>
                <span className="text-sm text-muted">Application submitted</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-gold text-xs animate-pulse">●</span>
                </div>
                <span className="text-sm text-gray-900">Under review by Onlifit team</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-900/30 text-xs">3</span>
                </div>
                <span className="text-sm text-gray-900/30">Profile goes live</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 border border-white/10 text-muted font-semibold text-sm rounded-lg hover:border-white/20 transition-all"
            >
              ← Back to home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-accent/10 text-accent font-semibold text-sm rounded-lg hover:bg-accent/20 transition-all"
            >
              Check status ↻
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
