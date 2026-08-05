import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

export default function EmptyState({ icon, title, message, actionLabel, onAction, style }) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl }, style]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[typography.heading, { color: colors.textPrimary, textAlign: 'center' }]}>
        {title}
      </Text>
      {message ? (
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
          ]}
        >
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={{ marginTop: spacing.lg }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 34,
    marginBottom: 10,
  },
});
