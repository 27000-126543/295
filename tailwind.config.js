/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        coral: {
          DEFAULT: "#FF6B6B",
          light: "#FF8E8E",
          dark: "#E55555",
        },
        mint: {
          DEFAULT: "#4ECDC4",
          light: "#6FE0D9",
          dark: "#3BB8B0",
        },
        cream: {
          DEFAULT: "#FFF8F0",
          dark: "#F5EDE3",
        },
        charcoal: {
          DEFAULT: "#2D3436",
          light: "#636E72",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(45, 52, 54, 0.08)",
        "card-hover": "0 8px 25px rgba(45, 52, 54, 0.12)",
        coral: "0 4px 15px rgba(255, 107, 107, 0.35)",
        mint: "0 4px 15px rgba(78, 205, 196, 0.35)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
