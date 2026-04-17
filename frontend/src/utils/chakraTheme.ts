/**
 * This file contains a custom theme override for the ChakraProvider
 * to ensure dark mode and transparent backgrounds
 */
import { extendTheme } from '@chakra-ui/react';

// Extend the theme to include custom colors, fonts, etc
const bertieDarkTheme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      'html, body': {
        backgroundColor: '#111827',
        color: 'white',
      },
      '*': {
        backgroundColor: 'transparent',
      },
      '#root': {
        minHeight: '100vh',
        backgroundColor: '#111827',
      },
    },
  },
  colors: {
    // Match the tailwind primary colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    // Match the tailwind secondary colors
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
  },
});

export default bertieDarkTheme;
