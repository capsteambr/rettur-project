/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'main': withOpacity('--bg-main'),
        'card': withOpacity('--bg-card'),
        'card-hover': withOpacity('--bg-card-hover'),
        'secondary-bg': withOpacity('--bg-secondary'),
        'primary-text': withOpacity('--primary-text'),
        'secondary-text': withOpacity('--secondary-text'),
        'border-custom': withOpacity('--border-color'),
        'accent': withOpacity('--accent-color'),
        'accent-hover': withOpacity('--accent-hover'),
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
