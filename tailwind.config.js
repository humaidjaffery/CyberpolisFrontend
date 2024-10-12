/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,css,ts}',
    './src/index.html',
    './src/styles.css'],

  theme: {
    extend: {
      colors: {
        fblack: '#253634',
        accent: '#4EFFEF',
        accent2: '#B534FF',
        accent3: '#ff3333'
      }
    },
  },
  plugins: [],
}

