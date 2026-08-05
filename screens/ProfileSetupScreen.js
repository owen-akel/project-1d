import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { MAJOR_US_CITIES } from '../src/data/cities';
import { INTERESTS_BY_CATEGORY, CATEGORY_ICONS, ALL_INTERESTS } from '../src/data/interests';
import {
  Screen,
  ScreenHeader,
  Card,
  Button,
  Chip,
  Avatar,
  SearchInput,
  BottomSheet,
} from '../src/ui';

/**
 * Second step of sign up: fill in the profile before landing in the app.
 * Everything here is optional except the name, which sign up already collected.
 */
export default function ProfileSetupScreen({ route }) {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation();
  const { user, updateUser, setResidence } = useUser();

  const signupName = route?.params?.name;

  const [form, setForm] = useState({
    name: signupName || user.name || '',
    hometown: '',
    college: '',
    age: '',
  });
  const [interests, setInterests] = useState([]);
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [interestsSheetOpen, setInterestsSheetOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [interestQuery, setInterestQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [residence, setLocalResidence] = useState('');

  const filteredCities = useMemo(() => {
    const query = cityQuery.trim().toLowerCase();
    if (!query) return MAJOR_US_CITIES;
    return MAJOR_US_CITIES.filter((city) => city.name.toLowerCase().includes(query));
  }, [cityQuery]);

  const interestSearchResults = useMemo(() => {
    const query = interestQuery.trim().toLowerCase();
    if (!query) return null;
    return ALL_INTERESTS.filter((interest) => interest.toLowerCase().includes(query));
  }, [interestQuery]);

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    );
  };

  const handleContinue = () => {
    updateUser({
      name: form.name.trim() || user.name,
      hometown: form.hometown.trim(),
      college: form.college.trim(),
      age: form.age ? parseInt(form.age, 10) || null : null,
      interests,
    });
    if (residence) setResidence(residence);

    navigation.replace('InviteContacts', { onboarding: true });
  };

  const fields = [
    { key: 'name', label: 'Name', placeholder: 'Alex Johnson' },
    { key: 'hometown', label: '📍 Hometown', placeholder: 'San Francisco, CA' },
    { key: 'college', label: '🎓 College', placeholder: 'Dartmouth College' },
    { key: 'age', label: '📅 Grad year', placeholder: '2026', numeric: true },
  ];

  return (
    <Screen>
      <ScreenHeader
        title="Set up your profile"
        subtitle="This is what people see when they find you"
        right={
          <Button
            label="Skip"
            variant="ghost"
            size="sm"
            onPress={() => navigation.replace('InviteContacts', { onboarding: true })}
          />
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.avatarBlock, { marginBottom: spacing.xl }]}>
            <Avatar name={form.name || 'You'} size="xl" />
            <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.sm }]}>
              Your initials for now
            </Text>
          </View>

          <Card>
            {fields.map((field, index) => (
              <View key={field.key} style={index > 0 ? { marginTop: spacing.lg } : null}>
                <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                  {field.label}
                </Text>
                <TextInput
                  style={[
                    typography.body,
                    styles.input,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      borderRadius: radius.md,
                    },
                  ]}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textTertiary}
                  value={form[field.key]}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, [field.key]: text }))}
                  keyboardType={field.numeric ? 'number-pad' : 'default'}
                />
              </View>
            ))}

            <View style={{ marginTop: spacing.lg }}>
              <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                📍 Where you live
              </Text>
              <TouchableOpacity
                onPress={() => setCitySheetOpen(true)}
                style={[
                  styles.input,
                  styles.picker,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.body,
                    { color: residence ? colors.textPrimary : colors.textTertiary },
                  ]}
                >
                  {residence || 'Choose your city'}
                </Text>
                <Text style={[typography.body, { color: colors.textTertiary }]}>›</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <Card style={{ marginTop: spacing.lg }}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.heading, { color: colors.textPrimary }]}>Interests</Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  {interests.length > 0
                    ? `${interests.length} selected`
                    : 'Helps people find things in common with you'}
                </Text>
              </View>
              <Button label="Add" variant="secondary" size="sm" onPress={() => setInterestsSheetOpen(true)} />
            </View>
            {interests.length > 0 ? (
              <View style={[styles.chipWrap, { marginTop: spacing.md }]}>
                {interests.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    selected
                    onPress={() => toggleInterest(interest)}
                  />
                ))}
              </View>
            ) : null}
          </Card>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.md,
              paddingBottom: spacing.xl,
            },
          ]}
        >
          <Button label="Continue" onPress={handleContinue} fullWidth />
        </View>
      </KeyboardAvoidingView>

      <BottomSheet
        visible={citySheetOpen}
        onClose={() => {
          setCitySheetOpen(false);
          setCityQuery('');
        }}
        title="Where do you live?"
        subtitle="Events and people are shown for this city"
      >
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
          <SearchInput value={cityQuery} onChangeText={setCityQuery} placeholder="Search cities" />
        </View>
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.md }}
        >
          {filteredCities.map((city) => {
            const selected = residence === city.name;
            return (
              <TouchableOpacity
                key={city.name}
                onPress={() => {
                  setLocalResidence(city.name);
                  setCitySheetOpen(false);
                  setCityQuery('');
                }}
                style={[
                  styles.cityRow,
                  {
                    borderRadius: radius.md,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.md,
                    backgroundColor: selected ? colors.primaryMuted : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    typography.body,
                    {
                      color: selected ? colors.primary : colors.textPrimary,
                      fontWeight: selected ? '700' : '500',
                    },
                  ]}
                >
                  {city.name}
                </Text>
                {selected ? <Text style={[typography.body, { color: colors.primary }]}>✓</Text> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BottomSheet>

      <BottomSheet
        visible={interestsSheetOpen}
        onClose={() => {
          setInterestsSheetOpen(false);
          setInterestQuery('');
          setExpandedCategories({});
        }}
        title="Pick your interests"
        subtitle={`${interests.length} selected`}
        footer={
          <Button
            label="Done"
            fullWidth
            onPress={() => {
              setInterestsSheetOpen(false);
              setInterestQuery('');
              setExpandedCategories({});
            }}
          />
        }
      >
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
          <SearchInput
            value={interestQuery}
            onChangeText={setInterestQuery}
            placeholder="Search interests"
          />
        </View>
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.md }}
        >
          {interestSearchResults ? (
            <View style={styles.chipWrap}>
              {interestSearchResults.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  selected={interests.includes(interest)}
                  onPress={() => toggleInterest(interest)}
                />
              ))}
            </View>
          ) : (
            Object.keys(INTERESTS_BY_CATEGORY).map((category) => {
              const expanded = expandedCategories[category];
              return (
                <View key={category} style={{ marginBottom: spacing.md }}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() =>
                      setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }))
                    }
                  >
                    <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                      {CATEGORY_ICONS[category] || '📌'}  {category}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textTertiary }]}>
                      {expanded ? '▾' : '▸'}
                    </Text>
                  </TouchableOpacity>
                  {expanded ? (
                    <View style={[styles.chipWrap, { marginTop: spacing.sm }]}>
                      {INTERESTS_BY_CATEGORY[category].map((interest) => (
                        <Chip
                          key={interest}
                          label={interest}
                          selected={interests.includes(interest)}
                          onPress={() => toggleInterest(interest)}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  avatarBlock: {
    alignItems: 'center',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sheetScroll: {
    flexGrow: 0,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
