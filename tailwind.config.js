/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF6B00',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        golden: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4AF37',
          600: '#B8860B',
          700: '#92400E',
          800: '#78350F',
          900: '#5C2D0E',
        },
        festival: {
          500: '#E53935',
          600: '#D32F2F',
        },
        temple: {
          bg: '#FFFDF7',
          card: '#FFFFFF',
          text: '#1F2937',
          muted: '#6B7280',
          border: '#E5E7EB',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Gujarati', 'Noto Sans Devanagari', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'gradient-temple': 'linear-gradient(135deg, #FF6B00 0%, #D4AF37 100%)',
        'gradient-golden': 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
      },
      boxShadow: {
        'temple': '0 4px 20px -2px rgba(255, 107, 0, 0.15)',
        'temple-lg': '0 10px 40px -3px rgba(255, 107, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(255, 255, 255, 0.25)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 107, 0, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 107, 0, 0.6)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
