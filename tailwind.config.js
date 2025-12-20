export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Fredoka', 'sans-serif'],
      },
      colors: {
        brand: {
          beige: '#E8DCCA',
          mustard: '#D4A574',
          wood: '#5D4037',
          bronze: '#B08D57',
          cream: '#FDFBF7',
          dark: '#2C1810',
          pastel: {
            peach: '#FFDAB9',
            mint: '#98FF98',
            lavender: '#E6E6FA',
            corn: '#FFF8DC'
          }
        }
      },
    },
  },
  plugins: [],
}
