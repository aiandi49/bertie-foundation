import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import React from 'react';

const theme = extendTheme({
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
    },
  },
});

interface ChakraThemeProviderProps {
  children: React.ReactNode;
}

/**
 * A wrapper around ChakraProvider that forces dark mode 
 * and transparent backgrounds
 */
export function ChakraThemeProvider({ children }: ChakraThemeProviderProps) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}
