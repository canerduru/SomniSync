import React, { createContext, useContext } from 'react';

export interface ThemeTokens {
  bg: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  fontSerif: string;
  fontMono: string;
  fontSans: string;
}

const brutalistTokens: ThemeTokens = {
  bg: '#050505',
  surface: '#0d0d0d',
  border: '#222222',
  textPrimary: '#f5f5f5',
  textSecondary: '#a3a3a3',
  textMuted: '#525252',
  fontSerif: "'Cormorant Garamond', Georgia, serif",
  fontMono: "'JetBrains Mono', monospace",
  fontSans: "'Plus Jakarta Sans', sans-serif",
};

interface ThemeContextType {
  tokens: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextType>({ tokens: brutalistTokens });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ tokens: brutalistTokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
