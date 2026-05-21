/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void:    '#0A0E16',
        surface: '#0F1219',
        elevated:'#141820',
        neural: {
          cyan:   '#06b6d4',
          indigo: '#6366f1',
          purple: '#a855f7',
        },
      },
      backgroundImage: {
        'gradient-neural':
          'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)',
      },
      boxShadow: {
        'glow-cyan':   '0 0 32px -8px rgba(6,182,212,0.35)',
        'glow-indigo': '0 0 32px -8px rgba(99,102,241,0.40)',
        'glow-purple': '0 0 32px -8px rgba(168,85,247,0.35)',
        'stark':       '0 4px 24px -6px rgba(0,0,0,0.5)',
        'stark-lg':    '0 8px 40px -8px rgba(0,0,0,0.6)',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease both',
        'pulse-slow':'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
