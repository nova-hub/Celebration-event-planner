/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: {
          DEFAULT: '#111116',
          raised: '#171720',
          hover: '#1e1e2b',
          border: '#272738'
        },
        celebration: {
          purple: '#a855f7',
          deepPurple: '#7c3aed',
          pink: '#ec4899',
          softPink: '#f472b6',
          blush: '#fbcfe8',
          accent: '#c084fc'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': "linear-gradient(to right, rgba(168, 85, 247, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(168, 85, 247, 0.05) 1px, transparent 1px)",
        'glow-conic': 'conic-gradient(from 180deg at 50% 50%, #a855f7 0deg, #ec4899 180deg, #a855f7 360deg)'
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.45)',
        'glow-pink': '0 0 25px -5px rgba(236, 72, 153, 0.45)',
        'glow-card': '0 10px 30px -10px rgba(168, 85, 247, 0.15)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
