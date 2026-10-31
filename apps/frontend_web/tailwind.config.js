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
        'main': 'var(--bg-main)',
        'card': 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
        'secondary-bg': 'var(--bg-secondary)',
        'primary-text': 'var(--primary-text)',
        'secondary-text': 'var(--secondary-text)',
        'border-custom': 'var(--border-color)',
        'accent': 'var(--accent-color)',
        'accent-hover': 'var(--accent-hover)',
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
