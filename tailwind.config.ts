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
      colors: {
        // Updated SaaS aesthetic colors with new soft-blue palette
        saas: {
          navy: "#0d1017",      // Deep navy for backgrounds
          white: "#FFFFFF",     // Pure white for text & sections
          lavender: "#5C7CFF",  // Updated primary color (soft-blue)
          sage: "#6FA8FF",      // Updated secondary color (mist-blue)
          pink: "#FF6BCB",      // Legacy fuchsia-pink kept for backward compatibility
          teal: "#5C7CFF",      // Renamed but points to soft-blue for backward compatibility
          text: {
            headline: "#555555", // Dark grey for headlines
            body: "#666666",     // Grey for body text
          },
          grey: {
            100: "#F5F7FA",     // Lightest grey
            200: "#E4E7EB",     // Light grey
            300: "#CBD2D9",     // Medium light grey
            400: "#9AA5B1",     // Medium grey
            500: "#7B8794",     // Standard grey
            600: "#616E7C",     // Medium dark grey
            700: "#52606D",     // Dark grey
            800: "#3E4C5A",     // Very dark grey
          }
        },
        // Legacy colors kept for backward compatibility
        digital: {
          background: "#0d1017", // page background
          panel: "rgba(255,255,255,0.06)", // glass cards & modals
          primary: "#27E6F7", // neon-cyan buttons, focus rings, glows
          secondary: "#ff6bcb", // secondary CTAs, hover hue-shift  
          text: "#e6ecf3", // primary copy
          muted: "#8a96ad", // helper text
        },
        pirate: {
          background: "#001426", // weather-worn midnight-blue
          secondary: "#2b1e14", // dark ship-timber brown
          accent: "#b68f40", // raw brass
          action: "#7c0a02", // deep-crimson sail
          text: "#c7dbd6", // moonlit-foam
        },
        netflix: {
          background: "#141414",
          red: "#E50914",
          hover: "#181818",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
      },
      fontFamily: {
        'regola': ['FT Regola Neue', 'Graphik', 'Space Grotesk', 'Inter', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'sans': ['FT Regola Neue', 'Graphik', 'Space Grotesk', 'Inter', 'sans-serif'],
        'heading': ['FT Regola Neue', 'Graphik', 'Space Grotesk', 'sans-serif'],
        'cinzel': ['Cinzel', 'serif'], // kept for backward compatibility
      },
      boxShadow: {
        'saas': '0 6px 24px rgba(0, 0, 0, 0.06)',
        'saas-hover': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'saas-primary': '0 0 8px rgba(92, 124, 255, 0.45)', // Updated for soft-blue
        'saas-secondary': '0 0 8px rgba(111, 168, 255, 0.45)', // Updated for mist-blue
        'saas-disabled': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'digital': '0 4px 20px rgba(39, 230, 247, 0.15)',
        'digital-hover': '0 8px 30px rgba(39, 230, 247, 0.3)',
        'digital-secondary': '0 4px 20px rgba(255, 107, 203, 0.15)',
        'digital-glow': '0 0 15px rgba(39, 230, 247, 0.6)',
        'pirate': '0 4px 10px rgba(0, 0, 0, 0.6)', // kept for backward compatibility
      },
      backgroundImage: {
        'saas-gradient': 'linear-gradient(135deg, #0d1017 0%, #1A202C 100%)',
        'saas-light-gradient': 'linear-gradient(135deg, #F5F7FA 0%, #E4E7EB 100%)',
        'saas-primary-gradient': 'linear-gradient(135deg, #5C7CFF 0%, #4A6AE0 100%)', // Updated
        'saas-secondary-gradient': 'linear-gradient(135deg, #6FA8FF 0%, #5A93E8 100%)', // Updated
        'saas-charcoal-gradient': 'radial-gradient(circle at center, rgba(108,140,255,0.28) 0%, #ffffff 80%)', // Updated to soft-blue wash
        'saas-lavender-gradient': 'radial-gradient(circle at center, rgba(108,140,255,0.28) 0%, #ffffff 80%)', // Updated to soft-blue
        'saas-lavender-dual-gradient': 'radial-gradient(circle at top center, rgba(108,140,255,0.28) 0%, rgba(255,255,255,0) 70%), radial-gradient(circle at bottom center, rgba(108,140,255,0.28) 0%, rgba(255,255,255,0) 70%)', // Updated
        'space-gradient': 'linear-gradient(135deg, #0d1017 0%, #141b2d 100%)',
        'digital-glow': 'linear-gradient(135deg, rgba(39, 230, 247, 0.4) 0%, rgba(39, 230, 247, 0) 50%)',
        'digital-panel': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'digital-banner': 'linear-gradient(135deg, rgba(39, 230, 247, 0.3) 0%, rgba(255, 107, 203, 0.3) 100%)',
        'wood-texture': "url('/wood-texture.png')", // kept for backward compatibility
        'canvas-grain': "linear-gradient(45deg, rgba(0,0,0,.08) 25%, transparent 25%, transparent 50%, rgba(0,0,0,.08) 50%, rgba(0,0,0,.08) 75%, transparent 75%, transparent)",
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
