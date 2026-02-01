/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vintage Wood + Modern Blend Theme Colors
        'dark-walnut': '#4E342E',
        'polished-mahogany': '#6D4C41', 
        'light-maple': '#D7CCC8',
        'brass-gold': '#C9A227',
        'soft-off-white': '#FDF6EC',
        'deep-charcoal': '#1C1C1C',
      },
      fontFamily: {
        'heading': ['Cinzel Decorative', 'serif'],
        'body': ['EB Garamond', 'serif'],
      },
        keyframes: {
        caretBlink: {
          "0%, 50%": { opacity: "1" },
          "50.01%, 100%": { opacity: "0" },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'caretBlink': 'caretBlink 1s steps(1) infinite',
      },
    },
  },
  plugins: [],
}
