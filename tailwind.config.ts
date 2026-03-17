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
        bg: { DEFAULT: "#0D0D0D", 2: "#141414", 3: "#1A1A1A" },
        card: "#181818",
        accent: { DEFAULT: "#C8F135", dark: "#A8D420" },
        orange: "#FF6B35",
        teal: "#2DD4BF",
        gold: "#F5C842",
        muted: "rgba(255,255,255,0.42)",
        border: { DEFAULT: "rgba(255,255,255,0.08)", 2: "rgba(255,255,255,0.14)" },
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
