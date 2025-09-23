/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vintage theme colors from specification
        'dark-slate-gray': '#2F4F4F',
        'camel': '#C7925B',
        'bone': '#E4D8C4',
        'steel-blue': '#4B7F94',
        'burnt-sienna': '#A34234',
        'goldenrod': '#F2B950',
      },
      fontFamily: {
        'vintage': ['Fredoka One', 'cursive'],
        'dyslexic': ['OpenDyslexic', 'sans-serif'],
      },
      fontSize: {
        // TV-optimized font sizes
        'tv-base': '22px',
        'tv-lg': '28px',
        'tv-xl': '36px',
        'tv-2xl': '42px',
      },
      spacing: {
        // Custom spacing for large screen optimization
        'tv-sm': '0.75rem',
        'tv-md': '1.5rem',
        'tv-lg': '2.5rem',
        'tv-xl': '4rem',
      }
    },
  },
  plugins: [],
}