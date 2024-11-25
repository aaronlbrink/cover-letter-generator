/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  content: ["./entrypoints/popup/**/*.{html,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        'header': '2rem',
      },
      fontWeight: {
        'header': '700',
      },
      fontFamily: {
        'header': 'sans-serif',
        'sans-serif': ['"Inter"', ...defaultTheme.fontFamily.serif]
      }
    },
    spacing: {
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '24px',
      '6': '32px',
    },
    borderRadius: {
      DEFAULT: '4px',
    }
  },
  plugins: [],
}

