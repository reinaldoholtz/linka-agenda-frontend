/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdbff',
          300: '#8ec4ff',
          400: '#59a4ff',
          500: '#3182f6',
          600: '#1f63dd',
          700: '#1c4fb3',
          800: '#1c4390',
          900: '#1c3a72',
        },
      },
    },
  },
  plugins: [],
}
