import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const colors = isDarkMode
    ? {
        // Dark mode colors
        background: '#0f172a',
        backgroundSecondary: '#1e293b',
        card: '#334155',
        cardBorder: '#475569',
        textPrimary: '#f1f5f9',
        textSecondary: '#cbd5e1',
        textTertiary: '#94a3b8',
        primary: '#14b8a6',
        border: '#334155',
        shadow: '#000',
        error: '#ef4444',
      }
    : {
        // Light mode colors
        background: '#ffffff',
        backgroundSecondary: '#f8fafc',
        card: '#ffffff',
        cardBorder: '#e2e8f0',
        textPrimary: '#0f172a',
        textSecondary: '#64748b',
        textTertiary: '#94a3b8',
        primary: '#14b8a6',
        border: '#e2e8f0',
        shadow: '#000',
        error: '#ef4444',
      };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ colors, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};


