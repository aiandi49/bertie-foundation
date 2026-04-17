/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'bertie-red': '#D9232D',
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      borderRadius: {
        'lg': '1rem',
        'xl': '1.5rem',
      },
      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'bounce-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3)'
          },
          '50%': {
            opacity: '0.9',
            transform: 'scale(1.1)'
          },
          '70%': {
            opacity: '0.95',
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: '0.8',
          },
          '50%': {
            opacity: '0.6',
          },
        }
      },
      animation: {
        'shimmer': 'shimmer 8s linear infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'fade-in-up-delay': 'fade-in-up 0.5s ease-out 0.2s',
        'bounce-in': 'bounce-in 1s cubic-bezier(0.36, 0, 0.66, -0.56) 0.5s',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
    },
    fontFamily: {
      sans: ['Inter var', 'sans-serif'],
      display: ['Plus Jakarta Sans', 'sans-serif'],
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
