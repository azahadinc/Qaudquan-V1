/** @type {import('tailwindcss').Config} */

const { tokens } = require('./config/tokens.js');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        up: tokens.colors.up,
        down: tokens.colors.down,
        neutral: tokens.colors.neutral,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        error: tokens.colors.error,
        primary: tokens.colors.primary,
        secondary: tokens.colors.secondary,
        surface: tokens.colors.surface,
        'surface-primary': tokens.colors.surface.bg,
        'surface-secondary': tokens.colors.surface.variant,
        'surface-tertiary': tokens.colors.surfaceVariant.border,
        'surface-variant': tokens.colors.surfaceVariant,
      },
      spacing: tokens.spacing,
      fontSize: tokens.typography.fontSize,
      fontFamily: tokens.typography.fontFamily,
      borderRadius: tokens.borderRadius,
      zIndex: tokens.zIndex,
    },
  },
  plugins: [],
};
