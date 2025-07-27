/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hospital-blue': '#1e40af',
        'hospital-green': '#059669',
        'hospital-yellow': '#d97706',
        'hospital-red': '#dc2626',
        'hospital-gray': '#6b7280',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s ease-in-out infinite alternate',
      },
      keyframes: {
        blink: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        }
      }
    },
  },
  plugins: [],
} 