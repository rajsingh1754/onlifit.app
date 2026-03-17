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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-pink border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden flex items-center justify-center px-5">
      {/* Blur circle decorations */}
      <div className="blur-circle blur-circle-1" />
      <div className="blur-circle blur-circle-2" />
      <div className="blur-circle blur-circle-3" />

      <div className="w-full max-w-[480px] relative z-10">
        <Link href="/" className="block text-center mb-10">
          <span className="text-3xl font-bold text-white">
            Onli<em className="gradient-text italic">fit</em>
          </span>
        </Link>

        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center text-4xl mx-auto mb-6">
            ⏳
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Application Under Review</h1>
          <p className="text-gray-400 text-[15px] leading-relaxed max-w-md mx-auto mb-8">
            Your trainer application is being reviewed by our team. You&apos;ll receive access to your trainer dashboard once approved. This usually takes 24–48 hours.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8 text-left">
            <h3 className="text-white font-semibold text-sm mb-3">Review Process</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-pink/20 flex items-center justify-center">
                  <span className="text-pink text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-400">Application submitted</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-gold text-xs animate-pulse">●</span>
                </div>
                <span className="text-sm text-white">Under review by Onlifit team</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white/30 text-xs">3</span>
                </div>
                <span className="text-sm text-white/30">Profile goes live</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="btn-outline-gradient px-6 py-2.5 font-semibold text-sm rounded-lg"
            >
              Back to home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="btn-gradient px-6 py-2.5 font-semibold text-sm rounded-lg"
            >
              Check status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
