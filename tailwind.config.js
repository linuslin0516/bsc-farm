/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        binance: {
          yellow: '#F0B90B',
          gold: '#FCD535',
          dark: '#0B0E11',
          gray: '#1E2026',
          'gray-light': '#2B3139',
        },
        farm: {
          green: '#22C55E',
          'green-light': '#4ADE80',
          'green-dark': '#15803D',
          soil: '#5D4E37',
          'soil-light': '#8B7355',
          sky: '#0EA5E9',
          'sky-light': '#7DD3FC',
          'sky-dawn': '#FB923C',
          'sky-dusk': '#A855F7',
          'sky-night': '#1E1B4B',
          grass: '#84CC16',
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
        'cloud-drift': 'cloud-drift 60s linear infinite',
        'cloud-drift-slow': 'cloud-drift 90s linear infinite',
        'cloud-drift-fast': 'cloud-drift 40s linear infinite',
        'sky-transition': 'sky-transition 2s ease-out',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #F0B90B, 0 0 10px #F0B90B' },
          '50%': { boxShadow: '0 0 20px #F0B90B, 0 0 30px #F0B90B' },
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
        'cloud-drift': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        'sky-transition': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
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
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
