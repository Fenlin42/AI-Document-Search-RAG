// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#050508",
          900: "#0a0a0f",
          800: "#0f0f18",
          700: "#161622",
          600: "#1e1e30",
          500: "#2a2a40",
        },
        neon: {
          DEFAULT: "#00f0ff",
          light: "#66f7ff",
          dark: "#00b8c4",
          muted: "#00f0ff22",
          glow: "#00f0ff33",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 240, 255, 0.15)",
        "neon-lg": "0 0 40px rgba(0, 240, 255, 0.2)",
        "neon-sm": "0 0 10px rgba(0, 240, 255, 0.1)",
      },
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(0, 240, 255, 0.1)" },
          "50%": { boxShadow: "0 0 25px rgba(0, 240, 255, 0.25)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
