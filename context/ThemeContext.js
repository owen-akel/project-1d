import React, { createContext, useState, useContext, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const LIGHT_COLORS = {
  background: '#ffffff',
  backgroundSecondary: '#f4f6f8',
  card: '#ffffff',
  cardBorder: '#e6eaee',
  cardElevated: '#ffffff',
  textPrimary: '#0d1117',
  textSecondary: '#5b6673',
  textTertiary: '#8b95a3',
  primary: '#0f9d8f',
  primaryMuted: 'rgba(15, 157, 143, 0.11)',
  primaryPressed: '#0b7a70',
  accent: '#6366f1',
  border: '#e6eaee',
  borderStrong: '#d2d9e0',
  overlay: 'rgba(13, 17, 23, 0.45)',
  shadow: '#0d1117',
  error: '#dc2626',
  errorMuted: 'rgba(220, 38, 38, 0.10)',
  success: '#059669',
  onPrimary: '#ffffff',
  dim: 'rgba(13, 17, 23, 0.35)',
};

// Deep, low-chroma neutrals so the teal accent and content carry the eye.
// Canvas is the darkest layer; headers sit slightly above it, cards above that.
const DARK_COLORS = {
  background: '#101620',
  backgroundSecondary: '#080B11',
  card: '#161D28',
  cardBorder: '#232C3A',
  cardElevated: '#1B232F',
  textPrimary: '#EEF2F7',
  textSecondary: '#95A2B5',
  textTertiary: '#616E82',
  primary: '#2DD4BF',
  primaryMuted: 'rgba(45, 212, 191, 0.15)',
  primaryPressed: '#14b8a6',
  accent: '#818cf8',
  border: '#1E2632',
  borderStrong: '#2E3949',
  overlay: 'rgba(3, 5, 9, 0.72)',
  shadow: '#000000',
  error: '#f87171',
  errorMuted: 'rgba(248, 113, 113, 0.15)',
  success: '#34d399',
  onPrimary: '#04211d',
  dim: 'rgba(238, 242, 247, 0.28)',
};

// 4pt spacing scale. Use these instead of ad-hoc numbers so screens line up.
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

const typography = {
  display: { fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  heading: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '500' },
  label: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500' },
};

const buildShadows = (shadowColor, isDarkMode) => ({
  none: {},
  sm: {
    shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDarkMode ? 0.3 : 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.4 : 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDarkMode ? 0.5 : 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
});

export const ThemeProvider = ({ children }) => {
  // Dark is the app's default look; light stays available via the profile toggle.
  const [isDarkMode, setIsDarkMode] = useState(true);

  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  const value = useMemo(
    () => ({
      colors,
      spacing,
      radius,
      typography,
      shadows: buildShadows(colors.shadow, isDarkMode),
      isDarkMode,
      toggleDarkMode: () => setIsDarkMode((prev) => !prev),
    }),
    [colors, isDarkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export { spacing, radius, typography };
