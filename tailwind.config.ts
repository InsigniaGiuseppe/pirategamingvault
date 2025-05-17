import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontSize: {
        "clamp-hero": "clamp(3.5rem, 6vw, 5rem)",
      },
      colors: {
        // Monochrome palette
        black: "#111111",
        white: "#FFFFFF",
        gray: {
          100: "#F8F8F8",
          200: "#EEEEEE",
          300: "#E0E0E0",
          400: "#BDBDBD",
          500: "#9E9E9E",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
        // Legacy colors kept but remapped to monochrome
        saas: {
          navy: "#111111",      // Mapped to near-black
          white: "#FFFFFF",     // Pure white
          lavender: "#111111",  // Mapped to near-black
          sage: "#111111",      // Mapped to near-black
          pink: "#111111",      // Mapped to near-black
          teal: "#111111",      // Mapped to near-black
          text: {
            headline: "#111111", // Near-black for headlines
            body: "#5A5A5A",     // Mid-grey for body text
          },
          grey: {
            100: "#F8F8F8",     // Lightest grey
            200: "#EEEEEE",     // Light grey
            300: "#E0E0E0",     // Medium light grey
            400: "#BDBDBD",     // Medium grey
            500: "#9E9E9E",     // Standard grey
            600: "#757575",     // Medium dark grey
            700: "#616161",     // Dark grey
            800: "#424242",     // Very dark grey
          }
        },
        // Legacy colors remapped to monochrome
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#111111",
          foreground: "#FFFFFF"
        },
        secondary: {
          DEFAULT: "#EEEEEE",
          foreground: "#111111"
        },
        destructive: {
          DEFAULT: "#111111",
          foreground: "#FFFFFF"
        },
        muted: {
          DEFAULT: "#EEEEEE",
          foreground: "#5A5A5A"
        },
        accent: {
          DEFAULT: "#EEEEEE",
          foreground: "#111111"
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#111111"
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111111"
        },
      },
      fontFamily: {
        'satoshi': ['Satoshi Variable', 'Space Grotesk', 'Inter', 'sans-serif'],
        'sans': ['Satoshi Variable', 'Space Grotesk', 'Inter', 'sans-serif'],
        'heading': ['Satoshi Variable', 'Space Grotesk', 'sans-serif'],
        // Keep legacy fonts for backward compatibility
        'regola': ['Satoshi Variable', 'Space Grotesk', 'Inter', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'cinzel': ['Cinzel', 'serif'],
      },
      boxShadow: {
        'saas': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'saas-hover': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'saas-primary': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'saas-secondary': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'saas-disabled': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'digital': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'digital-hover': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'digital-secondary': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'digital-glow': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'pirate': '0 4px 10px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'saas-gradient': 'linear-gradient(to bottom, rgba(0,0,0,0.015), rgba(0,0,0,0))',
        'saas-light-gradient': 'linear-gradient(to bottom, rgba(0,0,0,0.015), rgba(0,0,0,0))',
        'saas-primary-gradient': 'none',
        'saas-secondary-gradient': 'none',
        'saas-charcoal-gradient': 'none',
        'saas-lavender-gradient': 'none',
        'saas-lavender-dual-gradient': 'none',
        'space-gradient': 'linear-gradient(to bottom, rgba(0,0,0,0.015), rgba(0,0,0,0))',
        'digital-glow': 'none',
        'digital-panel': 'none',
        'digital-banner': 'none',
        'wood-texture': "url('/wood-texture.png')",
        'canvas-grain': "linear-gradient(45deg, rgba(0,0,0,.02) 25%, transparent 25%, transparent 50%, rgba(0,0,0,.02) 50%, rgba(0,0,0,.02) 75%, transparent 75%, transparent)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "flag-wave": {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(5deg)' },
          '50%': { transform: 'rotate(0deg)' },
          '75%': { transform: 'rotate(-5deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        "float": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        "glow": {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        "gradient-shift": {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        "tilt": {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(2deg)' },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" }
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "skull-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "ship-sailing": {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-5px) rotate(2deg)' },
          '50%': { transform: 'translateY(0px) rotate(0deg)' },
          '75%': { transform: 'translateY(5px) rotate(-2deg)' },
          '100%': { transform: 'translateY(0px) rotate(0deg)' }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "flag-wave": "flag-wave 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 15s ease infinite",
        "tilt": "tilt 0.2s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "fade-up": "fade-up 0.4s ease-out",
        "skull-spin": "skull-spin 1.5s linear infinite",
        "ship-sailing": "ship-sailing 3s ease-in-out infinite",
      },
      borderRadius: {
        'xl': '24px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
