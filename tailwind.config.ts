import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Avenir Next", "Trebuchet MS", "sans-serif"],
        mono: ["IBM Plex Mono", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: "#12201f",
        moss: "#1d6b5a",
        mint: "#a9f0d1",
        ember: "#ff7a3d",
        sand: "#f5efe4",
      },
      boxShadow: {
        glow: "0 18px 70px rgba(32, 120, 101, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
