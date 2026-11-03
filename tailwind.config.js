/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-black': '#0A0A0A',
        'secondary-black': '#141414',
        'surface-black': '#1C1C1C',
        'dark-grey': '#292929',
        'mid-grey': '#8C8C8C',
        'light-grey': '#C7C7C7',
        'primary-white': '#F5F5F5',
        'pure-white': '#FFFFFF',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  plugins: [],
}