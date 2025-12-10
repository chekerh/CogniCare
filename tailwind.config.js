/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Winnie-the-Pooh theme colors
        pooh: {
          yellow: '#FFD700',
          'yellow-light': '#FFF8DC',
          'yellow-dark': '#F4A460',
          red: '#FF6B6B',
          'red-light': '#FF8C8C',
          brown: '#8B4513',
          'brown-light': '#A0522D',
          'brown-dark': '#654321',
          cream: '#FFF8DC',
          beige: '#F5F5DC',
          'papaya': '#FFEFD5',
          surface: '#FFEFD5',
          burlywood: '#DEB887',
        },
      },
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('pooh', '[data-theme="pooh"] &');
    },
  ],
};
