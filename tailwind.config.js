/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "mehroon": "#B82E44",
        "dark-mehroon": "#7C1B2A",
        "deep-mehroon": "#5E121F",
        "peach": "#FFC7B8",
        "soft-peach": "#FFE2D8",
        "light-peach": "#FFF0EA",
        "rose-gold": "#E8A58A",
        "rose-gold-light": "#F3C2AE",
        "rose-gold-dark": "#C77D62",
        "gold": "#D4AF37",
        "gold-light": "#E6C766",
        "gold-dark": "#A77C18",
        "ivory": "#FFF8F0",
        "cream": "#F9EEE5",
        "warm-white": "#FFFDFC",
        "text-primary": "#35191C",
        "text-[#6F4A4A]": "#6F4A4A",
        "text-light": "#FFF8F0",
        "border-light": "#E8CFC5",
        "border-gold": "rgba(212,175,55,0.45)",
        // Brand tokens
        "keshar-gold": "#D4AF37",
        "keshar-gold-light": "#E6C766",
        "keshar-dark": "#480C14",
        "keshar-cream": "#FFF8F0",
        // Legacy compatibility aliases
        "vrs-gold": "#D4AF37",
        "vrs-gold-light": "#E6C766",
        "vrs-dark": "#480C14",
        "vrs-cream": "#FFF8F0",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-lato)", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
