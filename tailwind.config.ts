import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        'heading1-bold': [
          '50px',
          {
            lineHeight: '100%',
            fontWeight: '700',
          },
        ],
        'heading2-bold': [
          '30px',
          {
            lineHeight: '100%',
            fontWeight: '700',
          },
        ],
        'heading3-bold': [
          '24px',
          {
            lineHeight: '100%',
            fontWeight: '700',
          },
        ],
        'heading4-bold': [
          '20px',
          {
            lineHeight: '100%',
            fontWeight: '700',
          },
        ],
        'body-bold': [
          '18px',
          {
            lineHeight: '100%',
            fontWeight: '700',
          },
        ],
        'body-semibold': [
          '18px',
          {
            lineHeight: '100%',
            fontWeight: '600',
          },
        ],
        'body-medium': [
          '18px',
          {
            lineHeight: '100%',
            fontWeight: '500',
          },
        ],
        'base-bold': [
          '16px',
          {
            lineHeight: '100%',
            fontWeight: '600',
          },
        ],
        'base-medium': [
          '16px',
          {
            lineHeight: '100%',
            fontWeight: '500',
          },
        ],
        'small-bold': [
          '14px',
          {
            lineHeight: '140%',
            fontWeight: '700',
          },
        ],
        'small-medium': [
          '14px',
          {
            lineHeight: '140%',
            fontWeight: '500',
          },
        ],
      },
      fontFamily: {
        Noto_Sans_Bengali: ['var(--font-notosansbangla)', 'sans-serif'],
      },
      backgroundImage: {
        // #003366
        'custom-radial': 'radial-gradient(circle, #00ADB5, #00888F)',
      },
      colors: {
        'bondi-blue': {
          DEFAULT: '#00ABB3',
          50: '#99FAFF',
          100: '#80F9FF',
          200: '#4DF7FF',
          300: '#1AF5FF',
          400: '#00DBE6',
          500: '#00ABB3',
          600: '#00888F',
          700: '#00436B',
          800: '#002147',
          900: '#000A24',
          950: '#000412',
        },
        'blaze-orange': {
          DEFAULT: '#FE6C08',
          50: '#FFD9BF',
          100: '#FFCDAB',
          200: '#FEB582',
          300: '#FE9C59',
          400: '#FE8431',
          500: '#FE6C08',
          600: '#CD5401',
          700: '#953D01',
          800: '#5D2600',
          900: '#250F00',
          950: '#0A0400',
        },
        'custom-gray': {
          DEFAULT: '#616161',
        },
        'white-1': '#F8F8F8',
        'gray-1': '#616161',
        'gray-2': '#E5E7EB',
        'blue-1': '#005EBE',
        'blue-2': '#E9F5FE',
        'blue-3': '#F5F7F9',
        'red-1': '#FF0000',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in',
      },
    },
  },
};

export default config;
