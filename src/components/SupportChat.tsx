"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";

/* ═══════════════════════════════════════════════════════
   ONLIFIT KNOWLEDGE BASE — powers the smart chatbot
   ═══════════════════════════════════════════════════════ */

interface KBEntry {
  keywords: string[];
  response: string;
  followUp?: string;
}

const KNOWLEDGE_BASE: KBEntry[] = [
  // ── Plans & Pricing ──
  {
    keywords: ["plan", "plans", "pricing", "price", "cost", "how much", "fee", "charges", "subscription", "package"],
    response: "We offer 3 plans:\n\n💪 **Onlifit Regular** — ₹5,999/mo\nIn-person training at your gym. 16 sessions/month (Mon–Fri).\n\n📹 **Onlifit Live** — ₹7,999/mo\nLive 1-on-1 video sessions. 20 sessions/month (Mon–Fri).\n\n👑 **Onlifit Elite** — ₹14,999/mo\nPremium tier with top-certified trainers. 20 sessions/month.",
    followUp: "Would you like to know more about any specific plan?",
  },
  {
    keywords: ["regular", "offline", "gym", "in-person", "5999"],
    response: "**Onlifit Regular — ₹5,999/month**\n\n• In-person training at your own gym\n• 16 sessions/month (Mon–Fri)\n• Morning (6–10AM), Afternoon (12–4PM), or Evening (5–9PM)\n• Certified trainer matched to your area\n• Cancel anytime after 1st month",
  },
  {
    keywords: ["live", "virtual", "video", "online", "7999"],
    response: "**Onlifit Live — ₹7,999/month**\n\n• Live 1-on-1 video sessions from home\n• 20 sessions/month (Mon–Fri)\n• No commute — train from anywhere\n• Screen-shared workout plans\n• Perfect for busy professionals",
  },
  {
    keywords: ["elite", "premium", "top", "best", "14999"],
    response: "**Onlifit Elite — ₹14,999/month**\n\n• Our premium tier with top-certified trainers\n• 20 sessions/month (Mon–Fri)\n• Trainers with 8+ years experience & advanced certifications\n• Priority support & personalized nutrition guidance\n• For those who want the absolute best results",
  },
  {
    keywords: ["duration", "how long", "months", "commitment", "contract"],
    response: "You can subscribe for **1, 3, 6, or 12 months**. Longer commitments mean better consistency & results! There's no lock-in — you can cancel after your minimum period ends.",
  },
  {
    keywords: ["discount", "offer", "coupon", "deal", "cheaper"],
    response: "We occasionally run promotions for new members. Currently, the best way to save is by choosing a longer duration (3, 6, or 12 months). Follow us on Instagram for exclusive offers!",
  },

  // ── Booking & Getting Started ──
  {
    keywords: ["book", "booking", "start", "begin", "join", "sign up", "register", "get started", "how to"],
    response: "Getting started is easy! 🚀\n\n1️⃣ Browse trainers at /trainers\n2️⃣ Pick a trainer that matches your goals\n3️⃣ Choose your time preference (Morning/Afternoon/Evening)\n4️⃣ Select duration (1–12 months)\n5️⃣ Confirm & you're all set!\n\nYour trainer will reach out within 24 hours to schedule your first session.",
  },
  {
    keywords: ["cancel", "cancellation", "stop", "pause", "freeze"],
    response: "You can cancel your subscription anytime from your dashboard. Here's how it works:\n\n• Cancel before your next billing cycle\n• Current month sessions remain active until period ends\n• No cancellation fees\n• You can pause & resume within 7 days\n\nNeed help cancelling? Just say 'talk to support' and I'll connect you.",
  },
  {
    keywords: ["reschedule", "change time", "change slot", "switch time", "different time"],
    response: "To change your training time preference:\n\n1. Go to your Dashboard\n2. Find your active booking\n3. Contact your trainer directly via the phone number shown\n\nTime changes take effect from the next week. Your trainer will confirm the new slot.",
  },

  // ── Trainers ──
  {
    keywords: ["trainer", "trainers", "coach", "instructor", "find trainer", "browse"],
    response: "All Onlifit trainers are **verified & certified professionals**. You can browse them at /trainers.\n\n🔍 Filter by plan type (Regular/Live/Elite)\n⭐ Check ratings & reviews from real clients\n💪 See specializations (weight loss, muscle gain, HIIT, yoga, etc.)\n📍 Find trainers near your area\n\nEach trainer has a detailed profile with experience, certifications, and reviews.",
  },
  {
    keywords: ["change trainer", "switch trainer", "different trainer", "new trainer"],
    response: "Want to switch trainers? No problem!\n\n1. Contact our support team (say 'talk to support')\n2. We'll help you transition to a new trainer\n3. Your remaining sessions transfer automatically\n4. No extra charges for switching\n\nWe want you to have the best experience possible!",
  },
  {
    keywords: ["become trainer", "apply trainer", "join as trainer", "trainer application", "earn"],
    response: "Want to join as a trainer? Great! 🎯\n\n**Earnings:**\n• Onlifit Regular: ₹4,800/client + ₹300 travel\n• Onlifit Live: ₹6,000/client\n• Onlifit Elite: ₹11,000/client\n\nWith just 10 clients, you can earn **₹70,000+/month**!\n\n👉 Apply at the homepage → 'Apply as a trainer' button.\n\nRequirements: Valid certification, 1+ year experience, passion for fitness.",
  },

  // ── Sessions & Schedule ──
  {
    keywords: ["session", "sessions", "schedule", "timing", "time", "when", "slot", "morning", "afternoon", "evening"],
    response: "**Training Schedule:**\n\n🌅 Morning — 6 AM to 10 AM\n☀️ Afternoon — 12 PM to 4 PM\n🌙 Evening — 5 PM to 9 PM\n\nSessions run **Monday to Friday**. Each session is approximately 45–60 minutes. You choose your preferred time window when booking!",
  },
  {
    keywords: ["missed", "absent", "skip", "holiday", "leave"],
    response: "If you miss a session:\n\n• Inform your trainer at least 2 hours in advance\n• Missed sessions can be made up on Saturday (subject to trainer availability)\n• Unexcused no-shows cannot be rescheduled\n• Trainer illness/emergency → automatic session credit\n\nWe recommend maintaining consistency for best results! 💪",
  },

  // ── Payment ──
  {
    keywords: ["payment", "pay", "razorpay", "upi", "card", "billing", "invoice", "refund", "money"],
    response: "**Payment Info:**\n\n💳 We accept UPI, credit/debit cards, and net banking\n📅 Billing is monthly, charged at the start of each cycle\n🧾 Invoices are sent to your registered email\n💰 Refunds processed within 5–7 business days\n\nFor payment issues, say 'talk to support' and our team will help immediately.",
  },
  {
    keywords: ["refund"],
    response: "**Refund Policy:**\n\n• Full refund if cancelled within 48 hours of first purchase\n• Pro-rated refund for unused complete weeks\n• Refunds processed within 5–7 business days to original payment method\n• No refund for partially used weeks\n\nNeed a refund? Say 'talk to support' and we'll process it right away.",
  },

  // ── Results & Fitness ──
  {
    keywords: ["result", "results", "progress", "transformation", "lose weight", "weight loss", "muscle", "gain"],
    response: "Results depend on consistency & dedication! Here's what our members typically see:\n\n📊 **Month 1:** Improved stamina, better form, routine established\n📊 **Month 3:** Visible body composition changes, strength gains\n📊 **Month 6:** Significant transformation, sustainable habits\n\nYour trainer will create a personalized plan based on your goals. Nutrition guidance included with Elite plans!",
  },
  {
    keywords: ["diet", "nutrition", "food", "meal", "eat"],
    response: "**Nutrition Support:**\n\n🥗 Elite plan includes personalized nutrition guidance\n📋 Regular & Live trainers provide basic dietary tips\n🍎 We recommend tracking your meals for best results\n\nFor comprehensive meal planning, our Elite trainers work with you on a weekly nutrition schedule tailored to your goals.",
  },

  // ── Account & Technical ──
  {
    keywords: ["account", "profile", "email", "password", "login", "sign in", "forgot"],
    response: "**Account Help:**\n\n🔑 Forgot password? Use 'Forgot Password' on the sign-in page\n👤 Update profile from your Dashboard\n📧 Change email? Contact support (say 'talk to support')\n📱 Same account works on web & mobile\n\nHaving trouble signing in? Try clearing your browser cache or using incognito mode.",
  },
  {
    keywords: ["app", "mobile", "android", "ios", "iphone", "download"],
    response: "Our mobile app is coming soon! 📱\n\nCurrently, Onlifit works beautifully on mobile browsers — just visit onlifit.app on your phone. Add it to your home screen for an app-like experience!\n\nWe'll notify all members when the native app launches.",
  },

  // ── About & Trust ──
  {
    keywords: ["about", "what is", "onlifit", "who", "company"],
    response: "**Onlifit** is Hyderabad's premium personal training marketplace. 🏋️\n\nWe connect you with verified, certified trainers for daily 1-on-1 sessions — at your gym or via live video.\n\n✅ All trainers background-verified\n✅ Structured Mon–Fri schedule\n✅ No gym membership needed (for Live plans)\n✅ Cancel anytime\n\nReal training. Real results.",
  },
  {
    keywords: ["safe", "trust", "legit", "reliable", "verified", "certified"],
    response: "Your safety & trust are our top priority:\n\n✅ All trainers are **background verified**\n✅ Certifications validated before approval\n✅ Real reviews from real clients\n✅ Secure payments via Razorpay\n✅ Admin-approved trainers only\n✅ Dedicated support team\n\nWe reject 60% of trainer applications to maintain quality.",
  },

  // ── Hyderabad Specific ──
  {
    keywords: ["hyderabad", "city", "location", "area", "where", "available"],
    response: "We're currently available in **Hyderabad** 📍\n\nOnlifit Regular trainers cover major areas including Banjara Hills, Jubilee Hills, Gachibowli, HITEC City, Kondapur, Madhapur, Kukatpally, and more.\n\nOnlifit Live is available **anywhere** — train from any city via video!\n\nExpanding to more cities soon. Stay tuned! 🚀",
  },

  // ── Greetings & Small Talk ──
  {
    keywords: ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "sup", "yo"],
    response: "Hey there! 👋 Welcome to Onlifit support. I'm here to help with anything — plans, bookings, trainers, or any questions. What can I help you with today?",
  },
  {
    keywords: ["thanks", "thank you", "thx", "ty", "appreciate"],
    response: "You're welcome! 😊 Happy to help. Is there anything else I can assist you with?",
  },
  {
    keywords: ["bye", "goodbye", "see you", "done", "that's all"],
    response: "Glad I could help! 💪 Remember, consistency is key. See you at your next session! If you need anything, I'm always here.",
  },

  // ── Support Escalation ──
  {
    keywords: ["support", "human", "agent", "talk to someone", "real person", "complaint", "issue", "problem", "help me", "escalate", "talk to support"],
    response: "I'll connect you with our support team right away. Please describe your issue below and tap **'Send to Support'** — our team typically responds within 2 hours. 🙏",
  },
];

/* ═══════════════════════════════════════════════════════
   CHATBOT ENGINE
   ═══════════════════════════════════════════════════════ */

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  timestamp: Date;
  isTyping?: boolean;
  isEscalation?: boolean;
}

function matchQuery(input: string): KBEntry | null {
  const lower = input.toLowerCase().replace(/[?!.,]/g, "");
  const words = lower.split(/\s+/);

  let bestMatch: KBEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (keyword.includes(" ")) {
        // multi-word keyword — check phrase
        if (lower.includes(keyword)) score += 3;
      } else {
        // single word — check exact word match
        if (words.includes(keyword)) score += 2;
        // partial match
        else if (lower.includes(keyword)) score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

function formatBotText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "⟨b⟩$1⟨/b⟩") // bold markers
    .replace(/\n/g, "\n");
}

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */

const QUICK_ACTIONS = [
  { label: "📋 Plans & Pricing", query: "What plans do you offer?" },
  { label: "🚀 How to Book", query: "How do I book a trainer?" },
  { label: "👤 Find Trainers", query: "Tell me about trainers" },
  { label: "💰 Payment Info", query: "How does payment work?" },
  { label: "🎯 Become a Trainer", query: "How to become a trainer?" },
  { label: "🆘 Talk to Support", query: "I need to talk to support" },
];

export default function SupportChat() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const [escalationSubject, setEscalationSubject] = useState("");
  const [escalationMessage, setEscalationMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "bot",
        text: "Hey! 👋 I'm Onlifit's AI assistant. I can help with plans, bookings, trainers, payments, and more. What would you like to know?",
        timestamp: new Date(),
      }]);
    }
    if (open) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function addBotMessage(text: string, isEscalation = false) {
    setIsTyping(true);
    const typingDelay = Math.min(400 + text.length * 8, 1800);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "bot",
        text,
        timestamp: new Date(),
        isEscalation,
      }]);
      if (!open) setHasNewMessage(true);
    }, typingDelay);
  }

  function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg) return;

    // Add user message
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: "user",
      text: msg,
      timestamp: new Date(),
    }]);
    setInput("");

    // Match response
    const match = matchQuery(msg);

    if (match) {
      const isEscalation = match.keywords.includes("support") || match.keywords.includes("human");
      addBotMessage(match.response, isEscalation);

      if (isEscalation) {
        setTimeout(() => setShowEscalation(true), 2000);
      } else if (match.followUp) {
        setTimeout(() => {
          addBotMessage(match.followUp!);
        }, 2500);
      }
    } else {
      // Fallback — smart fallback
      addBotMessage(
        "I'm not sure I have the exact answer for that, but I want to help! 🤔\n\nYou can:\n• Try rephrasing your question\n• Ask about **plans**, **bookings**, **trainers**, or **payments**\n• Say **'talk to support'** to reach our team directly\n\nI'm learning every day to serve you better!"
      );
    }
  }

  async function handleEscalation(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !escalationSubject.trim() || !escalationMessage.trim()) return;
    setSending(true);
    try {
      await supabase.from("support_tickets").insert({
        user_id: userId,
        subject: escalationSubject.trim(),
        message: escalationMessage.trim(),
        status: "open",
      });
      setShowEscalation(false);
      setEscalationSubject("");
      setEscalationMessage("");
      addBotMessage("✅ Your query has been sent to our support team! They'll get back to you within 2 hours via email. Is there anything else I can help with?");
    } catch {
      addBotMessage("Oops, couldn't send that right now. Please try again in a moment.");
    }
    setSending(false);
  }

  function renderFormattedText(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const boldPattern = /⟨b⟩(.*?)⟨\/b⟩/g;
      const elements: React.ReactNode[] = [];
      let lastIdx = 0;
      let match;
      let j = 0;

      while ((match = boldPattern.exec(line)) !== null) {
        if (match.index > lastIdx) {
          elements.push(<span key={`${i}-${j}-pre`}>{line.slice(lastIdx, match.index)}</span>);
        }
        elements.push(<strong key={`${i}-${j}-b`} className="text-white font-semibold">{match[1]}</strong>);
        lastIdx = match.index + match[0].length;
        j++;
      }

      if (elements.length === 0) {
        return <span key={i}>{line}{i < lines.length - 1 && <br />}</span>;
      }

      if (lastIdx < line.length) {
        elements.push(<span key={`${i}-rest`}>{line.slice(lastIdx)}</span>);
      }
      return <span key={i}>{elements}{i < lines.length - 1 && <br />}</span>;
    });
  }

  return (
    <>
      {/* ─── Floating Button ─── */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          open
            ? "bg-bg-2 backdrop-blur-xl border border-border"
            : "bg-gradient-to-r from-yellow to-pink shadow-pink/25"
        }`}
      >
        {open ? (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {!open && hasNewMessage && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-orange rounded-full border-2 border-bg animate-pulse" />
        )}
      </button>

      {/* ─── Chat Panel ─── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[100] w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-8rem)] rounded-2xl border border-border bg-bg-2/95 backdrop-blur-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          style={{ animation: "chatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-border bg-bg-2/80 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow/20 to-pink/20 border border-pink/30 flex items-center justify-center">
                <span className="gradient-text text-sm font-bold">AI</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">Onlifit Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse" />
                  <span className="text-muted text-[11px]">Always online</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMessages([]);
                  setShowEscalation(false);
                  setInput("");
                }}
                title="Restart chat"
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M1 4v6h6M23 20v-6h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="m6 9 6 6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-yellow to-pink text-black rounded-br-md"
                    : "bg-white/5 border border-white/10 text-gray-300 rounded-bl-md"
                }`}>
                  {msg.role === "bot" ? renderFormattedText(formatBotText(msg.text)) : msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-pink/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-pink/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-pink/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Escalation Form */}
            {showEscalation && (
              <div className="bg-white/5 border border-pink/20 rounded-2xl p-4">
                <p className="text-pink text-[11px] font-bold uppercase tracking-widest mb-3">📩 Send to Support Team</p>
                {!userId ? (
                  <div className="text-center py-2">
                    <p className="text-muted text-xs mb-2">Please sign in first</p>
                    <a href="/auth/login" className="text-pink text-xs font-semibold hover:underline">Sign in →</a>
                  </div>
                ) : (
                  <form onSubmit={handleEscalation} className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Subject (e.g. Booking issue)"
                      value={escalationSubject}
                      onChange={(e) => setEscalationSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-bg border border-white/10 rounded-lg text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-pink/30"
                      required
                    />
                    <textarea
                      placeholder="Describe your issue…"
                      value={escalationMessage}
                      onChange={(e) => setEscalationMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-gray-900 text-xs placeholder:text-muted/50 focus:outline-none focus:border-accent/30 resize-none"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEscalation(false)}
                        className="px-3 py-2 text-muted text-xs hover:text-gray-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={sending}
                        className="flex-1 py-2 btn-gradient text-xs rounded-lg transition-all disabled:opacity-50"
                      >
                        {sending ? "Sending…" : "Send to Support"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions — show only at start */}
          {messages.length <= 1 && !isTyping && (
            <div className="px-4 pb-2 flex-shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.query)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] text-gray-400 hover:text-white hover:border-white/20 transition-all"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-border bg-bg-2/50 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask me anything…"
                className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-pink/30 transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-gradient-to-r from-yellow to-pink rounded-xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30 flex-shrink-0"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
