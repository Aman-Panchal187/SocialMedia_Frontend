/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0095f6',
          hover: '#1877f2',
        },
        danger: '#ed4956',
      },
    },
  },
  plugins: [],
}
