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
        // Dark theme colors inspired by cult.fit
        bg: { DEFAULT: "#0F0F13", 2: "#171A26", 3: "#1E2235" },
        card: "#1A1D2E",
        accent: { DEFAULT: "#FF3278", dark: "#E02A6A", light: "#FF5A93" },
        yellow: "#FFDB17",
        pink: "#FF3278",
        blue: "#3888FF",
        teal: "#14B8A6",
        gold: "#F8BA00",
        muted: "#9CA3AF",
        border: { DEFAULT: "#2A2D3E", 2: "#3A3D4E" },
        glass: "rgba(255, 255, 255, 0.05)",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-accent': 'linear-gradient(135deg, #FFDB17 0%, #FF3278 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glow-pink': '0 0 60px rgba(255, 50, 120, 0.3)',
        'glow-yellow': '0 0 60px rgba(255, 219, 23, 0.3)',
        'glow-blue': '0 0 60px rgba(56, 136, 255, 0.3)',
      },
    },
  },
  plugins: [],
};
export default config;
