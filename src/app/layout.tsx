import type { Metadata } from "next";
import "./globals.css";

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
      </body>
    </html>
  );
}
