import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple-inspired monochrome base
        apple: {
          white: "#FAFAFA",
          black: "#000000",
          charcoal: "#111111",
          "text-primary": "#1D1D1F",
          "text-secondary": "#86868B",
          "text-tertiary": "#AEAEB2",
          "surface-0": "#FFFFFF",
          "surface-50": "#F5F5F7",
          "surface-100": "#E8E8ED",
        },
        dark: {
          "surface-0": "#000000",
          "surface-50": "#111111",
          "surface-100": "#1C1C1E",
          "surface-200": "#2C2C2E",
          "text-primary": "#F5F5F7",
          "text-secondary": "#98989D",
        },
        clinical: {
          blue: "#0066CC",
          "blue-hover": "#004999",
          teal: "#0F766E",
          "teal-hover": "#0D5F58",
        },
        signal: {
          green: "#34C759",
          "green-bg": "#E8F8ED",
          amber: "#FF9500",
          "amber-bg": "#FFF3E0",
          red: "#FF3B30",
          "red-bg": "#FFEBEA",
        },
        category: {
          ai: "#5E5CE6",
          clinical: "#30D158",
          regulatory: "#FF9F0A",
          physics: "#0A84FF",
          guidelines: "#32ADE6",
          reimbursement: "#AC8E68",
          vendor: "#FF6961",
          research: "#BF5AF2",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "SF Pro Text", "system-ui", "sans-serif"],
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Fira Code", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.08em" }],
        "4xl": ["36px", { lineHeight: "40px", letterSpacing: "-0.02em" }],
        "5xl": ["48px", { lineHeight: "52px", letterSpacing: "-0.03em" }],
        "6xl": ["60px", { lineHeight: "64px", letterSpacing: "-0.04em" }],
        "7xl": ["72px", { lineHeight: "76px", letterSpacing: "-0.04em" }],
      },
      maxWidth: {
        reading: "680px",
        content: "1120px",
        wide: "1320px",
      },
      boxShadow: {
        "apple-sm": "0 2px 8px -2px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "apple-md": "0 8px 24px -6px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)",
        "apple-lg": "0 20px 48px -12px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.05)",
        "apple-xl": "0 40px 80px -20px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.06)",
        "apple-dark-md": "0 8px 24px -6px rgba(0,0,0,0.50)",
        "apple-dark-lg": "0 20px 48px -12px rgba(0,0,0,0.60)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
