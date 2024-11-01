/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,css,ts}',
    './src/index.html',
    './src/styles.css'],

  theme: {
    extend: {
      colors: {
        fblack: '#0a0f0e80',
        accent: '#4EFFEF',
        accent2: '#B534FF',
        accent3: '#ff3333'
      }
    },
  },
  plugins: [],
}

