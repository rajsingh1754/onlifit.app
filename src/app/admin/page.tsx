"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";

interface TrainerApplication {
  id: string;
  profile_id: string;
  bio: string;
  specializations: string[];
  certifications: string[];
  experience_years: number;
  plan_types: string[];
  cities: string[];
  is_available: boolean;
  is_verified: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
    city: string;
    avatar_url: string | null;
  };
}

const PLAN_LABEL: Record<string, string> = {
  offline: "Onlifit Regular",
  virtual: "Onlifit Live",
  elite: "Onlifit Elite",
};

const PLAN_COLOR: Record<string, string> = {
  offline: "bg-accent/10 text-accent border-accent/30",
  virtual: "bg-orange/10 text-orange border-orange/30",
  elite: "bg-gold/10 text-gold border-gold/30",
};

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export default function AdminDashboard() {
  const supabase = createClient();
  const [applications, setApplications] = useState<TrainerApplication[]>([]);
  const [activeTrainers, setActiveTrainers] = useState<TrainerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "active" | "support">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrainers();
  }, []);

  async function fetchTrainers() {
    setLoading(true);
    const { data: pending } = await supabase
      .from("trainers")
      .select("*, profiles!trainers_profile_id_fkey(full_name, email, phone, city, avatar_url)")
      .eq("is_available", false)
      .order("created_at", { ascending: false });

    const { data: active } = await supabase
      .from("trainers")
      .select("*, profiles!trainers_profile_id_fkey(full_name, email, phone, city, avatar_url)")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    setApplications((pending as TrainerApplication[]) || []);
    setActiveTrainers((active as TrainerApplication[]) || []);
    setLoading(false);
  }

  async function handleApprove(trainerId: string) {
    setActionLoading(trainerId);
    await supabase
      .from("trainers")
      .update({ is_available: true, is_verified: true })
      .eq("id", trainerId);
    await fetchTrainers();
    setActionLoading(null);
  }

  async function handleReject(trainerId: string) {
    setActionLoading(trainerId);
    await supabase.from("trainers").delete().eq("id", trainerId);
    await fetchTrainers();
    setActionLoading(null);
  }

  async function handleDeactivate(trainerId: string) {
    setActionLoading(trainerId);
    await supabase
      .from("trainers")
      .update({ is_available: false })
      .eq("id", trainerId);
    await fetchTrainers();
    setActionLoading(null);
  }

  async function fetchTickets() {
    setTicketsLoading(true);
    const { data } = await supabase
      .from("support_tickets")
      .select("*, profiles(full_name, email, avatar_url)")
      .order("created_at", { ascending: false });
    setTickets((data as SupportTicket[]) || []);
    setTicketsLoading(false);
  }

  useEffect(() => {
    if (tab === "support" && tickets.length === 0) fetchTickets();
  }, [tab]);

  async function handleReply(ticketId: string) {
    const text = replyText[ticketId]?.trim();
    if (!text) return;
    setReplyingId(ticketId);
    await supabase
      .from("support_tickets")
      .update({ admin_reply: text, status: "replied" })
      .eq("id", ticketId);
    setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
    setReplyingId(null);
    fetchTickets();
  }

  async function handleCloseTicket(ticketId: string) {
    await supabase
      .from("support_tickets")
      .update({ status: "closed" })
      .eq("id", ticketId);
    fetchTickets();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-bg-2/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-white">
            Onli<em className="text-accent italic">fit</em>
          </Link>
          <span className="text-xs font-bold text-accent uppercase tracking-wider bg-accent/10 px-3 py-1.5 rounded-full">
            Admin Dashboard
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10">
        <h1 className="font-serif text-3xl text-white mb-2">Trainer Management</h1>
        <p className="text-muted text-sm mb-8">Review applications, approve trainers, manage the platform.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted text-xs mb-1">Pending</p>
            <p className="text-white font-serif text-2xl">{applications.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted text-xs mb-1">Active Trainers</p>
            <p className="text-accent font-serif text-2xl">{activeTrainers.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted text-xs mb-1">Open Tickets</p>
            <p className="text-gold font-serif text-2xl">{tickets.filter(t => t.status === "open").length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted text-xs mb-1">Elite</p>
            <p className="text-gold font-serif text-2xl">{activeTrainers.filter(t => t.plan_types?.includes("elite")).length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-bg-2 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("pending")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "pending" ? "bg-accent text-bg" : "text-muted hover:text-white"
            }`}
          >
            Pending ({applications.length})
          </button>
          <button
            onClick={() => setTab("active")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "active" ? "bg-accent text-bg" : "text-muted hover:text-white"
            }`}
          >
            Active ({activeTrainers.length})
          </button>
          <button
            onClick={() => setTab("support")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
              tab === "support" ? "bg-accent text-bg" : "text-muted hover:text-white"
            }`}
          >
            Support
            {tickets.filter(t => t.status === "open").length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange text-[9px] text-white font-bold rounded-full flex items-center justify-center">
                {tickets.filter(t => t.status === "open").length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        ) : tab === "support" ? (
          /* ─── Support Tickets ─── */
          <div className="space-y-4">
            {ticketsLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <p className="text-3xl mb-3">💬</p>
                <p className="text-white font-semibold">No support queries</p>
                <p className="text-muted text-sm mt-1">All clear!</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* User avatar */}
                      <div className="w-10 h-10 rounded-full bg-bg-3 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                        {ticket.profiles?.avatar_url ? (
                          <img src={ticket.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-muted text-sm">{ticket.profiles?.full_name?.charAt(0) || "U"}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{ticket.profiles?.full_name || "User"}</h3>
                          <span className="text-muted text-xs">{ticket.profiles?.email}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ticket.status === "open" ? "bg-gold/10 text-gold" :
                            ticket.status === "replied" ? "bg-accent/10 text-accent" :
                            "bg-white/5 text-muted"
                          }`}>
                            {ticket.status}
                          </span>
                        </div>

                        <h4 className="text-white text-sm font-medium mb-1">{ticket.subject}</h4>
                        <p className="text-muted text-sm leading-relaxed mb-3">{ticket.message}</p>
                        <p className="text-muted text-[11px]">
                          {new Date(ticket.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>

                        {ticket.admin_reply && (
                          <div className="mt-3 p-3 bg-accent/5 border border-accent/10 rounded-lg">
                            <p className="text-accent text-[10px] font-bold uppercase tracking-wider mb-1">Your reply</p>
                            <p className="text-white text-sm">{ticket.admin_reply}</p>
                          </div>
                        )}

                        {/* Reply form */}
                        {ticket.status !== "closed" && (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              placeholder="Type a reply…"
                              value={replyText[ticket.id] || ""}
                              onChange={(e) => setReplyText((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                              className="flex-1 px-3 py-2 bg-bg-3 border border-border rounded-lg text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/40"
                            />
                            <button
                              onClick={() => handleReply(ticket.id)}
                              disabled={replyingId === ticket.id || !replyText[ticket.id]?.trim()}
                              className="px-4 py-2 bg-accent text-bg rounded-lg text-xs font-bold hover:bg-accent-dark transition-all disabled:opacity-50"
                            >
                              {replyingId === ticket.id ? "…" : "Reply"}
                            </button>
                            <button
                              onClick={() => handleCloseTicket(ticket.id)}
                              className="px-3 py-2 bg-white/5 text-muted rounded-lg text-xs font-semibold hover:bg-white/10 transition-all"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ─── Trainer Cards ─── */
          <div className="space-y-4">
            {tab === "pending" && applications.length === 0 && (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <p className="text-3xl mb-3">✓</p>
                <p className="text-white font-semibold">No pending applications</p>
                <p className="text-muted text-sm mt-1">All caught up!</p>
              </div>
            )}

            {tab === "active" && activeTrainers.length === 0 && (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <p className="text-3xl mb-3">👤</p>
                <p className="text-white font-semibold">No active trainers</p>
                <p className="text-muted text-sm mt-1">Approve applications to add trainers.</p>
              </div>
            )}

            {(tab === "pending" ? applications : activeTrainers).map((trainer) => (
              <div key={trainer.id} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="w-16 h-16 rounded-full bg-bg-3 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {trainer.profiles?.avatar_url ? (
                      <img src={trainer.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted text-xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-lg">{trainer.profiles?.full_name || "Unknown"}</h3>
                      {trainer.plan_types?.map((pt) => (
                        <span key={pt} className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${PLAN_COLOR[pt] || "text-muted border-border"}`}>
                          {PLAN_LABEL[pt] || pt}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted mb-3">
                      <span>📧 {trainer.profiles?.email}</span>
                      <span>📞 {trainer.profiles?.phone || "—"}</span>
                      <span>📍 {trainer.profiles?.city || trainer.cities?.[0] || "—"}</span>
                      <span>💼 {trainer.experience_years}y exp</span>
                      <span>📅 {new Date(trainer.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                    {trainer.bio && (
                      <p className="text-muted text-sm leading-relaxed mb-3 line-clamp-2">{trainer.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {trainer.specializations?.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-bg-3 border border-border rounded text-[11px] text-muted">{s}</span>
                      ))}
                    </div>
                    {trainer.certifications?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {trainer.certifications.map((c) => (
                          <span key={c} className="px-2 py-0.5 bg-accent/10 border border-accent/20 rounded text-[11px] text-accent">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    {tab === "pending" ? (
                      <>
                        <button
                          onClick={() => handleApprove(trainer.id)}
                          disabled={actionLoading === trainer.id}
                          className="px-5 py-2.5 bg-accent text-bg rounded-lg text-xs font-bold hover:bg-accent-dark transition-all disabled:opacity-50"
                        >
                          {actionLoading === trainer.id ? "..." : "✓ Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(trainer.id)}
                          disabled={actionLoading === trainer.id}
                          className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all disabled:opacity-50"
                        >
                          ✗ Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDeactivate(trainer.id)}
                        disabled={actionLoading === trainer.id}
                        className="px-5 py-2.5 bg-orange/10 text-orange border border-orange/20 rounded-lg text-xs font-bold hover:bg-orange/20 transition-all disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
