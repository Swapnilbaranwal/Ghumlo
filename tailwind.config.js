/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        heritage: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a0938e',
          600: '#8a7a72',
          700: '#6b5b52',
          800: '#4a3f3a',
          900: '#2d2420',
        },
        // gold/saffron are deliberately darker than a typical "marketing" gold/orange.
        // The lighter originals (#c9a227 / #ff9933) measured ~2.1-2.4:1 contrast
        // against white — below the WCAG AA 4.5:1 text minimum — for every place
        // they're used as text or button labels. These shades were chosen to clear
        // 4.5:1 in both directions (dark-on-white and white-on-solid-fill) while
        // staying in the same warm palette. See tailwind.config.js history / README
        // Accessibility section for the contrast math.
        gold: '#8a6914',
        'gold-light': '#c9a227',
        saffron: '#b35900',
        indiaGreen: '#138808',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 162, 39, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201, 162, 39, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
