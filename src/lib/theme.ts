// Theme utilities and color definitions

export type Theme = 'light' | 'dark' | 'pooh';

export const themeColors = {
  light: {
    primary: '#14b8a6', // Teal
    secondary: '#0d9488',
    background: '#f9fafb', // gray-50
    surface: '#ffffff',
    text: '#111827', // gray-900
    textSecondary: '#6b7280', // gray-500
    border: '#e5e7eb', // gray-200
  },
  dark: {
    primary: '#2dd4bf', // teal-300
    secondary: '#14b8a6', // teal-500
    background: '#111827', // gray-900
    surface: '#1f2937', // gray-800
    text: '#f9fafb', // gray-50
    textSecondary: '#9ca3af', // gray-400
    border: '#374151', // gray-700
  },
  pooh: {
    primary: '#FFD700', // Honey Yellow
    secondary: '#F4A460', // Sandy Brown
    accent: '#FF6B6B', // Pooh Red
    accentDark: '#FF8C8C', // Light Pooh Red
    brown: '#8B4513', // Saddle Brown
    brownLight: '#A0522D', // Sienna
    background: '#FFF8DC', // Cornsilk
    backgroundAlt: '#F5F5DC', // Beige
    surface: '#FFEFD5', // Papaya Whip
    text: '#654321', // Dark Brown
    textSecondary: '#5C4033', // Darker Brown
    border: '#DEB887', // Burlywood
  },
};

export function getThemeClasses(theme: Theme) {
  const baseClasses = 'transition-colors duration-200';
  
  switch (theme) {
    case 'dark':
      return `${baseClasses} dark`;
    case 'pooh':
      return `${baseClasses} pooh-theme`;
    default:
      return `${baseClasses} light`;
  }
}

