import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import nextDynamic from "next/dynamic";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

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
      <body className={`${poppins.className} antialiased min-h-screen`}>
        {children}
        <SupportChat />
      </body>
    </html>
  );
}
