import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#111827", 2: "#1F2937", 3: "#374151" },
        card: "#1F2937",
        accent: { DEFAULT: "#3B82F6", dark: "#2563EB" },
        orange: "#F97316",
        teal: "#2DD4BF",
        gold: "#FBBF24",
        muted: "rgba(255,255,255,0.50)",
        border: { DEFAULT: "rgba(255,255,255,0.10)", 2: "rgba(255,255,255,0.18)" },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
