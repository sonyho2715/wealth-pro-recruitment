/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist for dynamically generated classes used in commission tiers and career stages
  safelist: [
    // Blue tier (New Agent)
    'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300',
    'border-blue-300', 'border-blue-400', 'border-blue-600',
    'text-blue-600', 'text-blue-700', 'text-blue-800', 'text-blue-900',
    'from-blue-50', 'to-blue-100', 'to-indigo-50',
    // Green tier (Qualified Agent)
    'bg-green-50', 'bg-green-100', 'bg-green-200', 'bg-green-300',
    'border-green-300', 'border-green-400', 'border-green-600',
    'text-green-600', 'text-green-700', 'text-green-800', 'text-green-900',
    'from-green-50', 'to-green-100', 'to-emerald-50',
    // Purple tier (Senior Agent)
    'bg-purple-50', 'bg-purple-100', 'bg-purple-200', 'bg-purple-300',
    'border-purple-300', 'border-purple-400', 'border-purple-600',
    'text-purple-600', 'text-purple-700', 'text-purple-800', 'text-purple-900',
    'from-purple-50', 'to-purple-100', 'to-pink-50',
    // Orange tier (Executive Agent)
    'bg-orange-50', 'bg-orange-100', 'bg-orange-200', 'bg-orange-300',
    'border-orange-300', 'border-orange-400', 'border-orange-600',
    'text-orange-600', 'text-orange-700', 'text-orange-800', 'text-orange-900',
    'from-orange-50', 'to-orange-100', 'to-red-50',
    // Indigo tier (Managing Partner)
    'bg-indigo-50', 'bg-indigo-100', 'bg-indigo-200', 'bg-indigo-300',
    'border-indigo-300', 'border-indigo-400', 'border-indigo-600',
    'text-indigo-600', 'text-indigo-700', 'text-indigo-800', 'text-indigo-900',
    'from-indigo-50', 'to-indigo-100',
    // Teal for schedule/calendar
    'bg-teal-50', 'bg-teal-100', 'bg-teal-200', 'bg-teal-300',
    'border-teal-300', 'border-teal-400', 'border-teal-600',
    'text-teal-600', 'text-teal-700', 'text-teal-800', 'text-teal-900',
    'from-teal-600', 'to-teal-700',
    // Red for apply
    'from-red-600', 'to-red-700',
    // Amber for disclaimers
    'bg-amber-50', 'bg-amber-100', 'border-amber-200', 'text-amber-600', 'text-amber-700', 'text-amber-800', 'text-amber-900',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-lg': '0 0 30px rgba(14, 165, 233, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      animation: {
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
