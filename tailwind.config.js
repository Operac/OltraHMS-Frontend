/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // User preferences
        "primary": "#2563EB", // Blue 600 - The requested primary color
        "primary-hover": "#1d4ed8", // Blue 700
        "slate-highlight": "#475569", // Slate 600
        "background-light": "#ffffff", // Pure White for max contrast
        "background-dark": "#0f172a", // Slate 900
        
        // Semantic aliases for LandingPage.tsx compliance
        "secondary": "#475569", // Maps to slate-highlight
        "cta": "#2563EB", // Maps to primary
        "background": "#f8fafc", // Maps to background-light
        "surface": "#FFFFFF",
        "text-main": "#0f172a", // Maps to background-dark
        "text-muted": "#475569", // Maps to slate-highlight
      },
      fontFamily: {
        "heading": ["Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "sans": ["Inter", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "0.5rem", "lg": "0.75rem", "xl": "1rem", "2xl": "1.5rem"},
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06)', // Blue shadow
        'glow': '0 0 15px rgba(37, 99, 235, 0.5)', // Blue glow
      }
    },
  },
  darkMode: "class",
  plugins: [],
}
