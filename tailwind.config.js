/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          blue: '#0EA5E9',
          cyan: '#22D3EE',
          purple: '#8B5CF6',
          dark: '#0F172A',
          deep: '#050510',
          gray: '#1E293B',
          'gray-light': '#334155',
          glow: '#67E8F9',
          pink: '#EC4899',
          indigo: '#6366F1',
          'rock-dark': '#2a2a3a',
          'rock-mid': '#3d3d4d',
          'bio-cyan': '#00f5d4',
          'bio-purple': '#9b5de5',
          'energy-glow': '#00bbf9',
        },
        binance: {
          yellow: '#22D3EE',
          gold: '#67E8F9',
          dark: '#0F172A',
          gray: '#1E293B',
          'gray-light': '#334155',
        },
        farm: {
          green: '#22C55E',
          'green-light': '#4ADE80',
          'green-dark': '#15803D',
          soil: '#2D1B4E',
          'soil-light': '#4C3575',
          sky: '#0EA5E9',
          'sky-light': '#7DD3FC',
          'sky-dawn': '#8B5CF6',
          'sky-dusk': '#A855F7',
          'sky-night': '#0F172A',
          grass: '#22D3EE',
        },
      },
      fontFamily: {
        game: ['Comic Sans MS', 'Chalkboard', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'grow': 'grow 0.5s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'twinkle-slow': 'twinkle 5s ease-in-out infinite',
        'twinkle-fast': 'twinkle 2s ease-in-out infinite',
        'nebula-drift': 'nebula-drift 120s linear infinite',
        'nebula-drift-reverse': 'nebula-drift 150s linear infinite reverse',
        'crack-pulse': 'crack-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #22D3EE, 0 0 10px #22D3EE' },
          '50%': { boxShadow: '0 0 20px #22D3EE, 0 0 30px #8B5CF6' },
        },
        'grow': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'sway': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'nebula-drift': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.95)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        'crack-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
