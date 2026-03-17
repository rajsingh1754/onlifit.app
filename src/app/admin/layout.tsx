"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminContext } from "./admin-context";

const NAV = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/applications", label: "Applications", icon: "📋", badgeKey: "pending" as const },
  { href: "/admin/trainers", label: "Trainers", icon: "💪" },
  { href: "/admin/bookings", label: "Bookings", icon: "📅" },
  { href: "/admin/support", label: "Support", icon: "💬", badgeKey: "tickets" as const },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [pendingCount, setPendingCount] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function refreshCounts() {
    const [{ count: pc }, { count: tc }] = await Promise.all([
      supabase.from("trainers").select("*", { count: "exact", head: true }).eq("is_available", false),
      supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    ]);
    setPendingCount(pc || 0);
    setOpenTickets(tc || 0);
  }

  useEffect(() => { refreshCounts(); }, []);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const badge = (key?: "pending" | "tickets") =>
    key === "pending" ? pendingCount : key === "tickets" ? openTickets : 0;

  return (
    <AdminContext.Provider value={{ pendingCount, openTickets, refreshCounts }}>
      <div className="min-h-screen flex bg-bg">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <Link href="/" className="font-serif text-xl text-white">Onli<em className="gradient-text italic">fit</em></Link>
            <span className="text-[9px] font-bold text-pink uppercase tracking-widest bg-pink/10 px-2 py-1 rounded-full">Admin</span>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href) ? "bg-pink/10 text-pink" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badgeKey && badge(item.badgeKey) > 0 && (
                  <span className="min-w-[20px] h-5 px-1 bg-orange text-[10px] text-white font-bold rounded-full flex items-center justify-center">
                    {badge(item.badgeKey)}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <Link href="/" className="flex items-center gap-2 text-gray-400 text-xs hover:text-white transition-colors">
              ← Back to site
            </Link>
          </div>
        </aside>

        {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />}

        <div className="flex-1 lg:ml-60 min-h-screen">
          <div className="lg:hidden sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="text-white text-xl">☰</button>
            <span className="font-serif text-lg text-white">Onli<em className="gradient-text italic">fit</em></span>
            <span className="text-[9px] font-bold text-pink uppercase tracking-widest bg-pink/10 px-2 py-1 rounded-full ml-auto">Admin</span>
          </div>
          <main className="p-5 lg:p-8 max-w-6xl">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
