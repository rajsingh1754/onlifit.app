"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const SPECIALIZATIONS = [
  "Weight Loss", "Muscle Building", "Strength Training", "HIIT",
  "Yoga", "CrossFit", "Calisthenics", "Functional Training",
  "Bodybuilding", "Cardio", "Flexibility", "Sports Conditioning",
];

const CERTIFICATIONS = [
  "ACE Certified", "NASM Certified", "ISSA Certified", "ACSM Certified",
  "CrossFit Level 1", "Yoga Alliance RYT", "NSCA-CPT", "Other",
];

const PLAN_OPTIONS = [
  { value: "offline", label: "Onlifit Regular", desc: "In-person training at client's gym", color: "accent" },
  { value: "virtual", label: "Onlifit Live", desc: "Live 1-on-1 video sessions", color: "orange" },
  { value: "elite", label: "Onlifit Elite", desc: "Premium tier for top trainers", color: "gold" },
];

const TIME_PREFERENCES = [
  { value: "morning", label: "Morning", range: "6 AM – 10 AM" },
  { value: "afternoon", label: "Afternoon", range: "12 PM – 4 PM" },
  { value: "evening", label: "Evening", range: "5 PM – 9 PM" },
];

const PLAN_EARNINGS: Record<string, { planPrice: string; sessions: number; perSession: number; trainerTotal: string; extras?: { label: string; amount: string }[] }> = {
  offline: {
    planPrice: "₹5,999",
    sessions: 16,
    perSession: 300,
    trainerTotal: "₹4,800",
    extras: [{ label: "Travel allowance", amount: "₹300" }],
  },
  virtual: {
    planPrice: "₹7,999",
    sessions: 20,
    perSession: 300,
    trainerTotal: "₹6,000",
  },
  elite: {
    planPrice: "₹14,999",
    sessions: 20,
    perSession: 550,
    trainerTotal: "₹11,000",
  },
};

const STEPS = ["Account", "Profile", "Plan & Schedule", "Review"];

function TrainerApplyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (searchParams.get("ref") === "home") {
      setAuthorized(true);
    } else {
      router.replace("/#trainers");
    }
  }, [searchParams, router]);

  const [userId, setUserId] = useState<string | null>(null);

  // Step 0: Account
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [city, setCity] = useState("Hyderabad");

  // Step 1: Profile
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [otherCert, setOtherCert] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Step 2: Plan & Schedule
  const [planType, setPlanType] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday"]);

  const DAYS = [
    { value: "monday", label: "Mon" }, { value: "tuesday", label: "Tue" },
    { value: "wednesday", label: "Wed" }, { value: "thursday", label: "Thu" },
    { value: "friday", label: "Fri" }, { value: "saturday", label: "Sat" },
    { value: "sunday", label: "Sun" },
  ];

  function toggleArray(arr: string[], val: string) {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  async function handleCreateAccount() {
    if (!fullName || !email || !password || !phone) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setUserId(data.user.id);
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          phone,
          city,
          gender,
          role: "trainer",
        });

        // Auto sign-in to establish session
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          console.log("Auto sign-in note:", signInError.message);
        }
      }

      setLoading(false);
      setStep(1);
    } catch (err) {
      setError("Network error — please check your internet connection and try again.");
      setLoading(false);
    }
  }

  async function handleSubmitProfile() {
    if (!bio || selectedSpecs.length === 0 || !experienceYears) {
      setError("Please fill bio, experience, and at least one specialization");
      return;
    }
    setError("");
    // Reset elite selection if no certifications
    if (planType === "elite" && selectedCerts.length === 0) {
      setPlanType("");
    }
    setStep(2);
  }

  async function handleSubmitApplication() {
    if (!planType || availableTimes.length === 0) {
      setError("Please select a plan type and at least one time preference");
      return;
    }
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    const activeUserId = user?.id || userId;
    if (!activeUserId) {
      setError("Session expired. Please refresh and try again.");
      setLoading(false);
      return;
    }

    // Upload avatar if provided
    let avatarUrl = "";
    if (avatarFile && activeUserId) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `trainers/${activeUserId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
        // Update profile with avatar
        await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", activeUserId);
      }
    }

    // Create trainer record
    const { data: trainerData, error: trainerError } = await supabase.from("trainers").insert({
      profile_id: activeUserId,
      bio,
      specializations: selectedSpecs,
      certifications: selectedCerts.includes("Other") && otherCert.trim()
        ? [...selectedCerts.filter(c => c !== "Other"), otherCert.trim()]
        : selectedCerts.filter(c => c !== "Other"),
      experience_years: parseInt(experienceYears),
      plan_types: [planType],
      cities: [city],
      is_verified: false,
      is_available: false, // pending review
    }).select("id").single();

    if (trainerError) {
      setError("Failed to create trainer profile: " + trainerError.message);
      setLoading(false);
      return;
    }

    // Create time slots
    if (trainerData) {
      const slots: { trainer_id: string; day: string; time: string }[] = [];
      const timeMap: Record<string, string[]> = {
        morning: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM"],
        afternoon: ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"],
        evening: ["5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"],
      };

      for (const day of availableDays) {
        for (const timePref of availableTimes) {
          const times = timeMap[timePref] || [];
          for (const time of times) {
            slots.push({ trainer_id: trainerData.id, day, time });
          }
        }
      }

      if (slots.length > 0) {
        await supabase.from("trainer_slots").insert(slots);
      }
    }

    setLoading(false);
    setStep(3);
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-bg-2/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-gray-900">
            Onli<em className="text-accent italic">fit</em>
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-gray-900 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-12">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i < step ? "bg-accent text-bg" :
                i === step ? "bg-accent/20 text-accent border border-accent" :
                "bg-bg-3 text-muted border border-border"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-gray-900" : "text-muted"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-accent" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Account */}
        {step === 0 && (
          <div>
            <h1 className="font-serif text-3xl text-gray-900 mb-2">Join as a Trainer</h1>
            <p className="text-muted text-sm mb-8">Create your account to get started</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Full Name</label>
                <input
                  type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-900/25 focus:outline-none focus:border-accent/40"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="trainer@example.com"
                  className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-900/25 focus:outline-none focus:border-accent/40"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Password</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-900/25 focus:outline-none focus:border-accent/40"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Phone</label>
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-900/25 focus:outline-none focus:border-accent/40"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Gender</label>
                <div className="flex gap-3">
                  {(["male", "female"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all capitalize ${
                        gender === g ? "bg-accent/10 border-accent/40 text-accent" : "bg-bg-3 border-border text-muted hover:text-gray-900"
                      }`}
                    >
                      {g === "male" ? "♂ Male" : "♀ Female"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">City</label>
                <input
                  type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-900/25 focus:outline-none focus:border-accent/40"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

            <button
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full mt-6 py-3.5 rounded-xl font-bold text-sm bg-accent text-bg hover:bg-accent-dark transition-all disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Continue →"}
            </button>

            <p className="text-muted text-xs text-center mt-4">
              Already have an account? <Link href="/auth/login" className="text-accent hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div>
            <h1 className="font-serif text-3xl text-gray-900 mb-2">Your Trainer Profile</h1>
            <p className="text-muted text-sm mb-8">Tell clients about yourself</p>

            <div className="space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-3 block">Profile Photo</label>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-bg-3 border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted text-2xl">📷</span>
                    )}
                  </div>
                  <div>
                    <label className="inline-block px-4 py-2 bg-bg-3 border border-border rounded-lg text-xs font-semibold text-gray-900 hover:border-accent/40 cursor-pointer transition-all">
                      Upload photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAvatarFile(file);
                            setAvatarPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    <p className="text-muted text-[11px] mt-1.5">JPG or PNG, max 2MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Bio</label>
                <textarea
                  value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell potential clients about your training philosophy, approach, and what makes you different..."
                  rows={4}
                  className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-900/25 focus:outline-none focus:border-accent/40 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Years of Experience</label>
                <input
                  type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="e.g. 5"
                  min="0" max="50"
                  className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-900/25 focus:outline-none focus:border-accent/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-3 block">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecs(toggleArray(selectedSpecs, spec))}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                        selectedSpecs.includes(spec)
                          ? "bg-accent text-bg"
                          : "bg-bg-3 border border-border text-muted hover:border-accent/40"
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-3 block">Certifications</label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map((cert) => (
                    <button
                      key={cert}
                      onClick={() => {
                        setSelectedCerts(toggleArray(selectedCerts, cert));
                        if (cert === "Other" && selectedCerts.includes("Other")) setOtherCert("");
                      }}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                        selectedCerts.includes(cert)
                          ? "bg-accent text-bg"
                          : "bg-bg-3 border border-border text-muted hover:border-accent/40"
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
                {selectedCerts.includes("Other") && (
                  <input
                    type="text"
                    value={otherCert}
                    onChange={(e) => setOtherCert(e.target.value)}
                    placeholder="Enter your certification name"
                    className="mt-3 w-full px-4 py-2.5 rounded-lg bg-bg-3 border border-border text-sm text-gray-900 placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
                  />
                )}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setError(""); setStep(0); }}
                className="px-6 py-3.5 rounded-xl font-medium text-sm border border-border text-muted hover:text-gray-900 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmitProfile}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-accent text-bg hover:bg-accent-dark transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Plan & Schedule */}
        {step === 2 && (
          <div>
            <h1 className="font-serif text-3xl text-gray-900 mb-2">Plan & Schedule</h1>
            <p className="text-muted text-sm mb-8">Choose your plan type and availability</p>

            <div className="space-y-8">
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-3 block">Plan Type</label>
                <p className="text-muted text-xs mb-4">Select the plan you want to offer</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PLAN_OPTIONS.map((plan) => {
                    const isEliteDisabled = plan.value === "elite" && selectedCerts.length === 0;
                    return (
                      <button
                        key={plan.value}
                        onClick={() => !isEliteDisabled && setPlanType(plan.value)}
                        disabled={isEliteDisabled}
                        className={`flex flex-col items-center gap-1.5 p-5 rounded-xl text-sm transition-all ${
                          isEliteDisabled
                            ? "bg-card/50 border border-border/50 text-muted/50 cursor-not-allowed opacity-50"
                            : planType === plan.value
                            ? `ring-2 ${plan.color === "accent" ? "bg-accent/10 ring-accent text-accent" : plan.color === "orange" ? "bg-orange/10 ring-orange text-orange" : "bg-gold/10 ring-gold text-gold"}`
                            : "bg-white shadow-sm border border-gray-100 text-gray-900 hover:border-border-2"
                        }`}
                      >
                        <span className="font-bold">{plan.label}</span>
                        <span className={`text-xs ${isEliteDisabled ? "text-muted/40" : planType === plan.value ? "opacity-70" : "text-muted"}`}>
                          {isEliteDisabled ? "Requires certification" : plan.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-3 block">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => setAvailableDays(toggleArray(availableDays, day.value))}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        availableDays.includes(day.value)
                          ? "bg-accent text-bg"
                          : "bg-bg-3 border border-border text-muted hover:border-accent/40"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-3 block">Available Time Slots</label>
                <p className="text-muted text-xs mb-4">Select all time windows you can train clients</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TIME_PREFERENCES.map((tp) => (
                    <button
                      key={tp.value}
                      onClick={() => setAvailableTimes(toggleArray(availableTimes, tp.value))}
                      className={`flex flex-col items-center gap-1 px-5 py-4 rounded-xl text-sm font-medium transition-all ${
                        availableTimes.includes(tp.value)
                          ? "bg-accent text-bg ring-2 ring-accent/40"
                          : "bg-white shadow-sm border border-gray-100 text-gray-900 hover:border-accent/40"
                      }`}
                    >
                      <span className="font-bold text-base">{tp.label}</span>
                      <span className={`text-xs ${availableTimes.includes(tp.value) ? "text-bg/70" : "text-muted"}`}>{tp.range}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Earnings Breakdown */}
              {planType && (
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-3 block">Your Earnings</label>
                  <p className="text-muted text-xs mb-4">What you take home per client per month</p>
                  <div className="bg-card border border-accent/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-gray-900 font-semibold text-sm">
                        {PLAN_OPTIONS.find(p => p.value === planType)?.label}
                      </span>
                      <span className="text-muted text-xs">Client pays {PLAN_EARNINGS[planType].planPrice}/mo</span>
                    </div>
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">{PLAN_EARNINGS[planType].sessions} sessions × ₹{PLAN_EARNINGS[planType].perSession}</span>
                        <span className="text-gray-900 font-medium">{PLAN_EARNINGS[planType].trainerTotal}</span>
                      </div>
                      {PLAN_EARNINGS[planType].extras?.map((extra, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted">{extra.label}</span>
                          <span className="text-gray-900 font-medium">{extra.amount}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-accent/20 pt-4 flex items-center justify-between">
                      <span className="text-accent font-bold text-sm">You earn per client</span>
                      <span className="text-accent font-serif text-2xl font-bold">
                        ₹{(PLAN_EARNINGS[planType].sessions * PLAN_EARNINGS[planType].perSession + (PLAN_EARNINGS[planType].extras?.reduce((sum, e) => sum + parseInt(e.amount.replace(/[₹,]/g, "")), 0) || 0)).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-muted text-[11px] mt-4 leading-relaxed">
                      💰 With 10 clients you earn <span className="text-gray-900 font-semibold">
                      ₹{((PLAN_EARNINGS[planType].sessions * PLAN_EARNINGS[planType].perSession + (PLAN_EARNINGS[planType].extras?.reduce((sum, e) => sum + parseInt(e.amount.replace(/[₹,]/g, "")), 0) || 0)) * 10).toLocaleString("en-IN")}
                      </span>/month. Payouts every 1st & 15th.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setError(""); setStep(1); }}
                className="px-6 py-3.5 rounded-xl font-medium text-sm border border-border text-muted hover:text-gray-900 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-accent text-bg hover:bg-accent-dark transition-all disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-4xl mx-auto mb-6">
              ✓
            </div>
            <h1 className="font-serif text-3xl text-gray-900 mb-3">Application Submitted!</h1>
            <p className="text-muted text-[15px] leading-relaxed max-w-md mx-auto mb-8">
              Thank you for applying to join Onlifit as a trainer. Our team will review your profile and get back to you within 24–48 hours.
            </p>
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 max-w-sm mx-auto mb-8 text-left">
              <h3 className="text-gray-900 font-semibold text-sm mb-3">What happens next?</h3>
              <ol className="space-y-2.5">
                <li className="flex items-start gap-2.5 text-sm text-muted">
                  <span className="text-accent font-bold">1.</span>
                  Our team reviews your profile & certifications
                </li>
                <li className="flex items-start gap-2.5 text-sm text-muted">
                  <span className="text-accent font-bold">2.</span>
                  You receive an approval email with your Onlifit ID
                </li>
                <li className="flex items-start gap-2.5 text-sm text-muted">
                  <span className="text-accent font-bold">3.</span>
                  Your profile goes live and clients can book you
                </li>
              </ol>
            </div>
            <Link href="/" className="text-accent font-semibold text-sm hover:underline">
              ← Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrainerApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" /></div>}>
      <TrainerApplyContent />
    </Suspense>
  );
}
