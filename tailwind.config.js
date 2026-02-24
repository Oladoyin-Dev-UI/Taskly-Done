/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 🟢 This tells Tailwind to listen for our dark mode switch!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}