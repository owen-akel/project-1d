import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Button, SegmentedControl } from '../src/ui';

/**
 * iOS offers AutoFill on anything it recognises as a credential field, which
 * drops a blank strong-password sheet over the form and prompts to save on
 * submit. There's no real account backing this screen yet, so opt out.
 */
const NO_AUTOFILL = {
  textContentType: 'none',
  autoComplete: 'off',
  autoCorrect: false,
  spellCheck: false,
  importantForAutofill: 'no',
};

export default function AuthScreen({ navigation }) {
  const { colors, spacing, radius, typography } = useTheme();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const isLogin = mode === 'login';

  const handleAuth = () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please re-enter your password.');
      return;
    }

    // In a real app, this would authenticate with a backend.
    // Offer the contact invite step before dropping into the tabs.
    navigation.replace('InviteContacts', { onboarding: true });
  };

  const fieldStyle = [
    typography.body,
    styles.input,
    {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.border,
      color: colors.textPrimary,
      borderRadius: radius.md,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.xl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.logoContainer, { marginBottom: spacing.xxl }]}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={[typography.display, { color: colors.textPrimary, marginTop: spacing.md }]}>
            1D
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 2 }]}>
            One Degree
          </Text>
        </View>

        <SegmentedControl
          value={mode}
          onChange={setMode}
          segments={[
            { key: 'login', label: 'Log in' },
            { key: 'signup', label: 'Sign up' },
          ]}
          style={{ marginBottom: spacing.xl }}
        />

        {!isLogin ? (
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              Name
            </Text>
            <TextInput
              style={fieldStyle}
              placeholder="Your name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              {...NO_AUTOFILL}
            />
          </View>
        ) : null}

        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Email
          </Text>
          <TextInput
            style={fieldStyle}
            placeholder="you@example.com"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            {...NO_AUTOFILL}
          />
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Password
          </Text>
          <TextInput
            style={fieldStyle}
            placeholder="Your password"
            placeholderTextColor={colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            {...NO_AUTOFILL}
          />
        </View>

        {!isLogin ? (
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              Confirm password
            </Text>
            <TextInput
              style={fieldStyle}
              placeholder="Re-enter your password"
              placeholderTextColor={colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              {...NO_AUTOFILL}
            />
          </View>
        ) : null}

        <Button
          label={isLogin ? 'Log in' : 'Create account'}
          onPress={handleAuth}
          fullWidth
          style={{ marginTop: spacing.sm, paddingVertical: spacing.lg }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 78,
    height: 78,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
});
