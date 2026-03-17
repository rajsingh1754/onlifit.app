"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAdmin } from "../admin-context";

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
  profile: { full_name: string; email: string; avatar_url: string | null };
}

const STATUS_STYLE: Record<string, string> = {
  open: "bg-gold/10 text-gold", replied: "bg-accent/10 text-accent", closed: "bg-white/5 text-muted",
};

export default function SupportPage() {
  const supabase = createClient();
  const { refreshCounts } = useAdmin();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "replied" | "closed">("all");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  useEffect(() => { fetchTickets(); }, []);

  async function fetchTickets() {
    setLoading(true);
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const uids = [...new Set(data.map((t: any) => t.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, avatar_url").in("id", uids);
      const pMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      setTickets(data.map((t: any) => ({
        ...t,
        profile: pMap.get(t.user_id) || { full_name: "Unknown", email: "", avatar_url: null },
      })));
    } else {
      setTickets([]);
    }
    setLoading(false);
  }

  async function handleReply(ticketId: string) {
    const text = replyText[ticketId]?.trim();
    if (!text) return;
    setReplyingId(ticketId);
    await supabase.from("support_tickets").update({ admin_reply: text, status: "replied" }).eq("id", ticketId);
    setReplyText((p) => ({ ...p, [ticketId]: "" }));
    setReplyingId(null);
    fetchTickets();
    refreshCounts();
  }

  async function handleClose(ticketId: string) {
    await supabase.from("support_tickets").update({ status: "closed" }).eq("id", ticketId);
    fetchTickets();
    refreshCounts();
  }

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
  const counts = { all: tickets.length, open: tickets.filter(t => t.status === "open").length, replied: tickets.filter(t => t.status === "replied").length, closed: tickets.filter(t => t.status === "closed").length };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-white mb-1">Support</h1>
        <p className="text-muted text-sm">{counts.open} open ticket{counts.open !== 1 ? "s" : ""}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-bg-2 rounded-xl p-1 w-fit">
        {(["all", "open", "replied", "closed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
              filter === f ? "bg-accent text-bg" : "text-muted hover:text-white"
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-white font-semibold text-lg">No tickets</p>
          <p className="text-muted text-sm mt-1">{filter === "all" ? "No support queries yet." : `No ${filter} tickets.`}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ticket) => (
            <div key={ticket.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-bg-3 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {ticket.profile?.avatar_url ? (
                      <img src={ticket.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : <span className="text-muted text-sm">{ticket.profile?.full_name?.charAt(0) || "U"}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{ticket.profile?.full_name || "User"}</h3>
                      <span className="text-muted text-xs">{ticket.profile?.email}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[ticket.status] || "bg-white/5 text-muted"}`}>
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

                    {ticket.status !== "closed" && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type a reply…"
                          value={replyText[ticket.id] || ""}
                          onChange={(e) => setReplyText((p) => ({ ...p, [ticket.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleReply(ticket.id)}
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
                          onClick={() => handleClose(ticket.id)}
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
          ))}
        </div>
      )}
    </div>
  );
}
