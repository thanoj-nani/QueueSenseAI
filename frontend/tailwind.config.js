/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070C1B',
          900: '#0B132B',
          800: '#1C2541',
          700: '#273456',
          600: '#3A506B',
          500: '#4F6D7A',
        },
        brand: {
          cyan: '#06B6D4',
          teal: '#14B8A6',
          blue: '#2563EB',
          sky: '#0284C7',
          dark: '#0F172A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
