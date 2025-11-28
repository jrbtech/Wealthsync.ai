/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Primary - Deep Navy
        navy: {
          50: '#f0f3f7',
          100: '#e1e7ef',
          200: '#c3cfdf',
          300: '#a5b7cf',
          400: '#879fbf',
          500: '#6987af',
          600: '#4b6f9f',
          700: '#2d578f',
          800: '#1a2b4a',
          900: '#0f1929',
          950: '#070c14',
        },
        // Accent - Warm Gold
        gold: {
          50: '#faf8f3',
          100: '#f5f1e7',
          200: '#ebe3cf',
          300: '#e1d5b7',
          400: '#d7c79f',
          500: '#c9a962',
          600: '#b8923e',
          700: '#967530',
          800: '#745822',
          900: '#523b14',
          950: '#301f06',
        },
        // Background - Off White
        cream: {
          50: '#ffffff',
          100: '#fcfbfa',
          200: '#f8f7f5',
          300: '#f0efed',
          400: '#e8e7e5',
          500: '#d0cfcd',
          600: '#a8a7a5',
          700: '#80807e',
          800: '#585856',
          900: '#30302e',
          950: '#181817',
        },
        // Emerald for alternative accent
        emerald: {
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
          950: '#052e16',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
