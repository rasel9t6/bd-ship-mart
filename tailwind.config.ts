import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        // Your custom colors can remain as they are
        "bondi-blue": {
          DEFAULT: "#00ABB3",
          "50": "#99FAFF",
          "100": "#80F9FF",
          "200": "#4DF7FF",
          "300": "#1AF5FF",
          "400": "#00DBE6",
          "500": "#00ABB3",
          "600": "#00888F",
          "650": "#00656B" /* Added for smoother transition */,
          "700": "#00436B",
          "800": "#002147",
          "900": "#000A24",
          "950": "#000412",
        },
        "blaze-orange": {
          DEFAULT: "#FE6C08",
          "50": "#FFD9BF",
          "100": "#FFCDAB",
          "200": "#FEB582",
          "300": "#FE9C59",
          "400": "#FE8431",
          "500": "#FE6C08",
          "600": "#CD5401",
          "700": "#953D01",
          "800": "#5D2600",
          "900": "#250F00",
          "950": "#0A0400",
        },
        gray: {
          DEFAULT: "#616161",
          "50": "#F8F8F8" /* Renamed from white-1 */,
          "100": "#E5E7EB" /* Renamed from gray-2 */,
          "200": "#D1D5DB",
          "300": "#9CA3AF",
          "400": "#6B7280",
          "500": "#616161" /* Renamed from gray-1 */,
          "600": "#4B5563",
          "700": "#374151",
          "800": "#1F2937",
          "900": "#111827",
          "950": "#030712",
        },
        blue: {
          DEFAULT: "#005EBE" /* Renamed from blue-1 */,
          "50": "#F5F7F9" /* Renamed from blue-3 */,
          "100": "#E9F5FE" /* Renamed from blue-2 */,
          "200": "#BFDBFE",
          "300": "#93C5FD",
          "400": "#60A5FA",
          "500": "#3B82F6",
          "600": "#005EBE" /* Renamed from blue-1 */,
          "700": "#1D4ED8",
          "800": "#1E40AF",
          "900": "#1E3A8A",
          "950": "#172554",
        },
        success: {
          DEFAULT: "#10B981",
          "50": "#ECFDF5",
          "100": "#D1FAE5",
          "200": "#A7F3D0",
          "300": "#6EE7B7",
          "400": "#34D399",
          "500": "#10B981",
          "600": "#059669",
          "700": "#047857",
          "800": "#065F46",
          "900": "#064E3B",
          "950": "#022C22",
        },
        warning: {
          DEFAULT: "#F59E0B",
          "50": "#FFFBEB",
          "100": "#FEF3C7",
          "200": "#FDE68A",
          "300": "#FCD34D",
          "400": "#FBBF24",
          "500": "#F59E0B",
          "600": "#D97706",
          "700": "#B45309",
          "800": "#92400E",
          "900": "#78350F",
          "950": "#451A03",
        },
        danger: {
          DEFAULT: "#EF4444" /* Renamed from red-1 */,
          "50": "#FEF2F2",
          "100": "#FEE2E2",
          "200": "#FECACA",
          "300": "#FCA5A5",
          "400": "#F87171",
          "500": "#EF4444",
          "600": "#DC2626",
          "700": "#B91C1C",
          "800": "#991B1B",
          "900": "#7F1D1D",
          "950": "#450A0A",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        "heading1-bold": [
          "50px",
          {
            lineHeight: "100%",
            fontWeight: "700",
          },
        ],
        "heading2-bold": [
          "30px",
          {
            lineHeight: "100%",
            fontWeight: "700",
          },
        ],
        "heading3-bold": [
          "24px",
          {
            lineHeight: "100%",
            fontWeight: "700",
          },
        ],
        "heading4-bold": [
          "20px",
          {
            lineHeight: "100%",
            fontWeight: "700",
          },
        ],
        "body-bold": [
          "18px",
          {
            lineHeight: "100%",
            fontWeight: "700",
          },
        ],
        "body-semibold": [
          "18px",
          {
            lineHeight: "100%",
            fontWeight: "600",
          },
        ],
        "body-medium": [
          "18px",
          {
            lineHeight: "100%",
            fontWeight: "500",
          },
        ],
        "base-bold": [
          "16px",
          {
            lineHeight: "100%",
            fontWeight: "600",
          },
        ],
        "base-medium": [
          "16px",
          {
            lineHeight: "100%",
            fontWeight: "500",
          },
        ],
        "small-bold": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "small-medium": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
      },
      fontFamily: {
        Noto_Sans_Bengali: ["var(--font-notosansbangla)", "sans-serif"],
      },
      backgroundImage: {
        "custom-radial": "radial-gradient(circle, #00ADB5, #00888F)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-in",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
};

export default config;
