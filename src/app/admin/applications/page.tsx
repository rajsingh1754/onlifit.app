"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAdmin } from "../admin-context";

const PLAN_LABEL: Record<string, string> = { offline: "Onlifit Regular", virtual: "Onlifit Live", elite: "Onlifit Elite" };
const PLAN_COLOR: Record<string, string> = {
  offline: "bg-accent/10 text-accent border-accent/30",
  virtual: "bg-orange/10 text-orange border-orange/30",
  elite: "bg-gold/10 text-gold border-gold/30",
};
const DAY_SHORT: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

interface TrainerApp {
  id: string;
  profile_id: string;
  bio: string;
  specializations: string[];
  certifications: string[];
  experience_years: number;
  plan_types: string[];
  cities: string[];
  is_available: boolean;
  created_at: string;
  profile: { full_name: string; email: string; phone: string; city: string; avatar_url: string | null };
  slots: { day: string; time: string }[];
}

export default function ApplicationsPage() {
  const supabase = createClient();
  const { refreshCounts } = useAdmin();
  const [apps, setApps] = useState<TrainerApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => { fetchApps(); }, []);

  async function fetchApps() {
    setLoading(true);
    const { data: pending } = await supabase
      .from("trainers").select("*").eq("is_available", false).order("created_at", { ascending: false });

    if (!pending || pending.length === 0) { setApps([]); setLoading(false); return; }

    const pids = pending.map((t: any) => t.profile_id);
    const tids = pending.map((t: any) => t.id);

    const [{ data: profiles }, { data: slots }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, phone, city, avatar_url").in("id", pids),
      supabase.from("trainer_slots").select("trainer_id, day, time").in("trainer_id", tids).eq("is_available", true),
    ]);

    const pMap = new Map((profiles || []).map((p: any) => [p.id, p]));
    const sMap = new Map<string, { day: string; time: string }[]>();
    (slots || []).forEach((s: any) => {
      if (!sMap.has(s.trainer_id)) sMap.set(s.trainer_id, []);
      sMap.get(s.trainer_id)!.push({ day: s.day, time: s.time });
    });

    setApps(pending.map((t: any) => ({
      ...t,
      profile: pMap.get(t.profile_id) || { full_name: "Unknown", email: "", phone: "", city: "", avatar_url: null },
      slots: sMap.get(t.id) || [],
    })));
    setLoading(false);
  }

  async function handleApprove(id: string) {
    setActionId(id);
    await supabase.from("trainers").update({ is_available: true, is_verified: true }).eq("id", id);
    await fetchApps();
    refreshCounts();
    setActionId(null);
  }

  async function handleReject(id: string) {
    if (!confirm("Reject this application? This will permanently delete the trainer record.")) return;
    setActionId(id);
    await supabase.from("trainers").delete().eq("id", id);
    await fetchApps();
    refreshCounts();
    setActionId(null);
  }

  // Group slots by day
  function groupSlots(slots: { day: string; time: string }[]) {
    const grouped: Record<string, string[]> = {};
    slots.forEach((s) => {
      if (!grouped[s.day]) grouped[s.day] = [];
      grouped[s.day].push(s.time);
    });
    Object.values(grouped).forEach((times) => times.sort());
    return grouped;
  }

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-gray-900 mb-1">Applications</h1>
        <p className="text-muted text-sm">{apps.length} pending application{apps.length !== 1 ? "s" : ""} to review</p>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-20 bg-white shadow-sm border border-gray-100 rounded-2xl">
          <p className="text-4xl mb-3">✓</p>
          <p className="text-gray-900 font-semibold text-lg">All caught up!</p>
          <p className="text-muted text-sm mt-1">No pending applications right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => {
            const isExpanded = expanded === app.id;
            const grouped = groupSlots(app.slots);
            return (
              <div key={app.id} className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden transition-all">
                {/* Summary row */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : app.id)}
                  className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-bg-3 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {app.profile.avatar_url ? (
                      <img src={app.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : <span className="text-muted text-lg">👤</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-gray-900 font-semibold text-lg">{app.profile.full_name}</h3>
                      {app.plan_types?.map((pt) => (
                        <span key={pt} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${PLAN_COLOR[pt] || "text-muted border-border"}`}>
                          {PLAN_LABEL[pt] || pt}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 text-xs text-muted">
                      <span>📧 {app.profile.email}</span>
                      <span>💼 {app.experience_years}y exp</span>
                      <span>📍 {app.profile.city || app.cities?.[0] || "—"}</span>
                      <span>📅 Applied {new Date(app.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <span className={`text-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border px-6 py-6 bg-bg-2/30 space-y-6">
                    {/* Contact */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-1">Phone</p>
                        <p className="text-gray-900 text-sm">{app.profile.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-1">Cities</p>
                        <p className="text-gray-900 text-sm">{app.cities?.join(", ") || "Not specified"}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-2">Bio</p>
                      <p className="text-gray-900/80 text-sm leading-relaxed bg-bg-3/50 rounded-xl p-4 border border-border">{app.bio || "No bio provided."}</p>
                    </div>

                    {/* Specializations */}
                    <div>
                      <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.specializations?.length > 0 ? app.specializations.map((s) => (
                          <span key={s} className="px-3 py-1 bg-bg-3 border border-border rounded-lg text-xs text-gray-900">{s}</span>
                        )) : <span className="text-muted text-xs">None listed</span>}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.certifications?.length > 0 ? app.certifications.map((c) => (
                          <span key={c} className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg text-xs text-accent">{c}</span>
                        )) : <span className="text-muted text-xs">None listed</span>}
                      </div>
                    </div>

                    {/* Available Slots */}
                    {Object.keys(grouped).length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-2">Available Slots</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {Object.entries(grouped).map(([day, times]) => (
                            <div key={day} className="bg-bg-3/50 border border-border rounded-lg p-3">
                              <p className="text-gray-900 text-xs font-semibold mb-1.5">{DAY_SHORT[day] || day}</p>
                              <div className="flex flex-wrap gap-1">
                                {times.map((t) => (
                                  <span key={t} className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-medium rounded">{t}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleApprove(app.id)}
                        disabled={actionId === app.id}
                        className="flex-1 sm:flex-none px-8 py-3 bg-accent text-bg rounded-xl text-sm font-bold hover:bg-accent-dark transition-all disabled:opacity-50"
                      >
                        {actionId === app.id ? "Processing…" : "✓ Approve Trainer"}
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        disabled={actionId === app.id}
                        className="flex-1 sm:flex-none px-8 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
