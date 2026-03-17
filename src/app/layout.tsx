import type { Metadata } from "next";
import "./globals.css";
import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const SupportChat = nextDynamic(() => import("@/components/SupportChat"), { ssr: false });

export const metadata: Metadata = {
  title: "Onlifit — Real Training. Real Results.",
  description: "Daily live sessions with certified personal trainers — virtual or at your own gym.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
        <SupportChat />
      </body>
    </html>
  );
}
