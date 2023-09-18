const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.tsx'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      serif: ['serif'],
      heading: [
        'var(--font-family-heading)',
        'Inter',
        'SF Pro Text',
        'system-ui',
      ],
      sans: ['var(--font-family-sans)'],
      monospace: [`SF Mono`, `ui-monospace`, `Monaco`, 'Monospace'],
    },
    extend: {
      colors: {
        primary: {
          ...colors.indigo,
          contrast: '#fff',
        },
        dark: colors.gray,
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
