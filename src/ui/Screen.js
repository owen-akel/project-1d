import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

/**
 * Page container. Applies the app background and top safe-area inset so screens
 * don't each hand-roll a `paddingTop: 60`.
 */
export default function Screen({ children, style, edges = ['top'], tone = 'secondary' }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const background = tone === 'primary' ? colors.background : colors.backgroundSecondary;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: background },
        edges.includes('top') && { paddingTop: insets.top },
        edges.includes('bottom') && { paddingBottom: insets.bottom },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
