/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          DEFAULT: '#0095f6',
          hover: '#1877f2',
        },
        danger: '#ed4956',
        success: '#2ecc71',
        warning: '#f5a623',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.06)',
        card: '0 2px 12px -2px rgba(0, 0, 0, 0.08)',
        popover: '0 8px 24px -4px rgba(0, 0, 0, 0.12)',
        modal: '0 16px 48px -8px rgba(0, 0, 0, 0.28)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        150: '150ms',
        250: '250ms',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'scale-in': 'scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
