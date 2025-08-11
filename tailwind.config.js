/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        amazon: {
          orange: '#FF9900',
          dark: '#232F3E',
          gray: '#37475A',
          light: '#F5F5F5'
        },
        severity: {
          A: '#B71C1C',
          B: '#FF5722',
          C: '#FFC107',
          D: '#4CAF50'
        }
      }
    }
  },
  plugins: [],
}
