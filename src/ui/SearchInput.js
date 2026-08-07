import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SearchInput({ value, onChangeText, placeholder = 'Search', style, autoFocus }) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
    >
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={[typography.body, styles.input, { color: colors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        clearButtonMode="never"
      />
      {value ? (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Text style={[styles.clear, { color: colors.textTertiary }]}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    fontSize: 13,
    marginRight: 8,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
  },
  clear: {
    fontSize: 14,
    fontWeight: '600',
    paddingLeft: 8,
  },
});
