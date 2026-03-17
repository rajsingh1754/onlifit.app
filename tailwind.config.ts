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
        bg: { DEFAULT: "#FFFFFF", 2: "#F8FAFC", 3: "#F1F5F9" },
        card: "#FFFFFF",
        accent: { DEFAULT: "#4F46E5", dark: "#4338CA" },
        orange: "#F97316",
        teal: "#14B8A6",
        gold: "#F59E0B",
        muted: "#64748B",
        border: { DEFAULT: "#E2E8F0", 2: "#CBD5E1" },
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
