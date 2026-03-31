/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        night: {
          950: "#030712",
          900: "#0a0f1c",
          800: "#111827",
        },
      },
      backgroundImage: {
        "grid-subtle":
          "linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)",
        "mesh-brand":
          "radial-gradient(ellipse 90% 70% at 50% -25%, rgba(56,189,248,0.18), transparent 55%), radial-gradient(ellipse 55% 45% at 100% 0%, rgba(244,114,182,0.14), transparent 50%), radial-gradient(ellipse 45% 40% at 0% 100%, rgba(251,191,36,0.08), transparent 45%)",
      },
      backgroundSize: {
        grid: "44px 44px",
      },
      boxShadow: {
        "glow-sky": "0 0 80px -20px rgba(56, 189, 248, 0.45)",
        "card-dark": "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      },
      keyframes: {
        "page-enter": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.65" },
        },
      },
      animation: {
        "page-enter": "page-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.45s ease-out both",
        "fade-in-up": "fade-in-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-down": "slide-down 0.35s ease-out both",
        "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 5s ease-in-out infinite",
        "soft-pulse": "soft-pulse 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
