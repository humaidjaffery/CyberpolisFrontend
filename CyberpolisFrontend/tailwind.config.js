/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,css,ts}',
    './src/index.html',
    './src/styles.css'],

  theme: {
    extend: {
      colors: {
        fblack: '#3b444b'
      }
    },
  },
  plugins: [],
}

