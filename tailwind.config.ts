import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // AirAware Brand Palette
        brand: {
          mint: {
            DEFAULT: "#78D6B0",
            50: "#F0FAF5",
            100: "#E0F5EB",
            200: "#C1EBD7",
            300: "#9FE1C3",
            400: "#78D6B0",
            500: "#52C597",
            600: "#36A87C",
            700: "#278561",
            800: "#1C6449",
            900: "#175C48",
          },
          forest: {
            DEFAULT: "#175C48",
            50: "#E8F4F0",
            100: "#D1E9E1",
            200: "#A3D3C3",
            300: "#75BDA5",
            400: "#47A787",
            500: "#2B8C6C",
            600: "#207257",
            700: "#175C48",
            800: "#104434",
            900: "#0A2D22",
          },
          bg: "#F7FAF7",
          cream: {
            DEFAULT: "#FFF8E8",
            100: "#FFFDF6",
            200: "#FFF8E8",
            300: "#FFEFC4",
            400: "#FFE6A1",
          },
          sky: {
            DEFAULT: "#BFE8FF",
            100: "#F0F9FF",
            200: "#DFF2FF",
            300: "#BFE8FF",
            400: "#8DD4FF",
          },
          lavender: {
            DEFAULT: "#DCD3FF",
            100: "#F6F4FF",
            200: "#EAE5FF",
            300: "#DCD3FF",
            400: "#BEAFFC",
          },
          peach: {
            DEFAULT: "#FFD6BD",
            100: "#FFF5EF",
            200: "#FFE7D9",
            300: "#FFD6BD",
            400: "#FFB894",
          },
          yellow: {
            DEFAULT: "#FFE58A",
            100: "#FFFBEA",
            200: "#FFF4C2",
            300: "#FFE58A",
            400: "#FFD552",
          },
        },

        // Strict AQI Palette (Severity-aligned)
        aqi: {
          good: {
            DEFAULT: "#78D6B0",
            bg: "#F0FAF5",
            text: "#175C48",
            border: "#C1EBD7",
          },
          moderate: {
            DEFAULT: "#FFE58A",
            bg: "#FFFBEA",
            text: "#854D0E",
            border: "#FFF4C2",
          },
          sensitive: {
            DEFAULT: "#FB923C",
            bg: "#FFF7ED",
            text: "#9A3412",
            border: "#FFEDD5",
          },
          unhealthy: {
            DEFAULT: "#EF4444",
            bg: "#FEF2F2",
            text: "#991B1B",
            border: "#FEE2E2",
          },
          veryUnhealthy: {
            DEFAULT: "#A855F7",
            bg: "#FAF5FF",
            text: "#6B21A8",
            border: "#F3E8FF",
          },
          hazardous: {
            DEFAULT: "#881337",
            bg: "#FFF1F2",
            text: "#4C0519",
            border: "#FFE4E6",
          },
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "3xl": "1.5rem",
        "2xl": "1.25rem",
        xl: "1rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(23, 92, 72, 0.04), 0 8px 24px rgba(23, 92, 72, 0.06)",
        card: "0 4px 20px -2px rgba(23, 92, 72, 0.05), 0 2px 6px -1px rgba(23, 92, 72, 0.03)",
        "card-hover": "0 10px 30px -4px rgba(23, 92, 72, 0.1), 0 4px 12px -2px rgba(23, 92, 72, 0.05)",
        floating: "0 16px 40px -6px rgba(23, 92, 72, 0.15)",
      },
      keyframes: {
        "shimmer-slide": {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        shimmer: "shimmer-slide 2s infinite",
        "pulse-subtle": "pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
