// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a2e",
          600: "#242438",
        },
        accent: {
          DEFAULT: "#6c63ff",
          light: "#8b83ff",
          dark: "#4d45d4",
        },
      },
    },
  },
  plugins: [],
};
