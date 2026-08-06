import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFriends } from '../context/FriendsContext';
import { useUser } from '../context/UserContext';
import { USERS_BY_ID } from '../src/mock/users';
import { FRIENDS_BY_USER_ID } from '../src/mock/graph';
import { MAJOR_US_CITIES } from '../src/data/cities';
import { INTERESTS_BY_CATEGORY, CATEGORY_ICONS, ALL_INTERESTS } from '../src/data/interests';
import {
  getConnectionStats,
  getFriendsWithPeers,
  getReachablePeople,
  getMutualFriendCount,
} from '../src/social/connections';
import { canViewUser, CURRENT_USER_ID } from '../src/social/visibility';
import useOpenChat from '../src/hooks/useOpenChat';
import { GearIcon } from '../src/ui/icons';
import { useSettings } from '../context/SettingsContext';
import {
  Screen,
  Card,
  Button,
  Chip,
  Avatar,
  SegmentedControl,
  StatTile,
  EmptyState,
  SearchInput,
  PersonRow,
  BottomSheet,
  ConnectionWeb,
} from '../src/ui';

export default function ProfileScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation();
  const { friends, removeFriend, pendingRequestCount } = useFriends();
  const { user, updateUser, setResidence } = useUser();
  const { openDirectMessage } = useOpenChat();
  const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState('profile');
  const [webCity, setWebCity] = useState('all');
  const [focusedFriendId, setFocusedFriendId] = useState(null);
  const [citySheetPeopleOpen, setCitySheetPeopleOpen] = useState(false);

  const [interestsSheetOpen, setInterestsSheetOpen] = useState(false);
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const [interestQuery, setInterestQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [editForm, setEditForm] = useState({ name: '', hometown: '', college: '', age: '' });

  // Filters inside the "people in this city" sheet
  const [peopleInterestFilters, setPeopleInterestFilters] = useState([]);
  const [peopleDegreeFilter, setPeopleDegreeFilter] = useState('all');

  const stats = useMemo(() => getConnectionStats(friends), [friends]);
  const webFriends = useMemo(() => getFriendsWithPeers(friends), [friends]);
  const reachable = useMemo(() => getReachablePeople(friends), [friends]);

  // Cities across the whole network — direct and indirect — since highlighting
  // covers both degrees.
  const webCities = useMemo(() => {
    const counts = new Map();
    reachable.forEach(({ user: person }) => {
      if (!person.city) return;
      counts.set(person.city, (counts.get(person.city) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([city, count]) => ({ city, count }));
  }, [reachable]);

  /** Everyone in the selected city, with degree, connectors and mutual count. */
  const cityPeople = useMemo(() => {
    if (webCity === 'all') return [];
    return reachable
      .filter(({ user: person }) => person.city === webCity)
      .map((entry) => ({
        ...entry,
        mutualCount: getMutualFriendCount(entry.user.id, friends),
      }))
      .sort((a, b) => {
        if (a.degree !== b.degree) return a.degree - b.degree;
        if (b.mutualCount !== a.mutualCount) return b.mutualCount - a.mutualCount;
        return a.user.name.localeCompare(b.user.name);
      });
  }, [reachable, webCity, friends]);

  const highlightedIds = useMemo(
    () => new Set(cityPeople.map(({ user: person }) => person.id)),
    [cityPeople]
  );

  // Interests actually present among the people in this city, so the filter
  // never offers a chip that matches nobody.
  const cityInterestOptions = useMemo(() => {
    const counts = new Map();
    cityPeople.forEach(({ user: person }) => {
      (person.interests || []).forEach((interest) => {
        counts.set(interest, (counts.get(interest) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 24)
      .map(([interest]) => interest);
  }, [cityPeople]);

  const filteredCityPeople = useMemo(() => {
    return cityPeople.filter(({ user: person, degree }) => {
      if (peopleDegreeFilter === 'friends' && degree !== 1) return false;
      if (peopleDegreeFilter === 'fof' && degree !== 2) return false;
      if (peopleInterestFilters.length === 0) return true;
      return (person.interests || []).some((interest) => peopleInterestFilters.includes(interest));
    });
  }, [cityPeople, peopleDegreeFilter, peopleInterestFilters]);

  const focusedFriend = useMemo(
    () => (focusedFriendId ? USERS_BY_ID.get(focusedFriendId) : null),
    [focusedFriendId]
  );

  const focusedPeerCount = useMemo(() => {
    if (!focusedFriendId) return 0;
    return (FRIENDS_BY_USER_ID.get(focusedFriendId) || []).filter(
      (peerId) => peerId !== CURRENT_USER_ID && canViewUser(peerId, friends)
    ).length;
  }, [focusedFriendId, friends]);

  const friendRows = useMemo(
    () =>
      friends
        .map((friendId) => {
          const friend = USERS_BY_ID.get(friendId);
          if (!friend) return null;
          return { ...friend, mutualCount: getMutualFriendCount(friendId, friends) };
        })
        .filter(Boolean),
    [friends]
  );

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

  const selectWebCity = (city) => {
    setWebCity(city);
    setFocusedFriendId(null);
    setPeopleInterestFilters([]);
    setPeopleDegreeFilter('all');
  };

  const toggleInterest = (interest) => {
    const current = user.interests || [];
    updateUser({
      interests: current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    });
  };

  const openEditSheet = () => {
    setEditForm({
      name: user.name || '',
      hometown: user.hometown || '',
      college: user.college || '',
      age: user.age ? String(user.age) : '',
    });
    setEditSheetOpen(true);
  };

  const saveProfile = () => {
    updateUser({
      name: editForm.name.trim() || user.name,
      hometown: editForm.hometown.trim() || user.hometown,
      college: editForm.college.trim() || user.college,
      age: editForm.age ? parseInt(editForm.age, 10) || user.age : user.age,
    });
    setEditSheetOpen(false);
  };

  const confirmRemoveFriend = (friend) => {
    Alert.alert('Remove friend', `Remove ${friend.name} from your friends?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFriend(friend.id) },
    ]);
  };

  const goToAddFriends = () => navigation.navigate('FriendRequests', { tab: 'discover' });

  const infoRows = [
    user.hometown && { icon: '📍', label: 'Hometown', value: user.hometown },
    user.college && { icon: '🎓', label: 'College', value: user.college },
    user.age && { icon: '📅', label: 'Grad year', value: String(user.age) },
  ].filter(Boolean);

  const rowDivider = (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginLeft: spacing.md * 2 + 48,
      }}
    />
  );

  return (
    <Screen>
      {/* Identity */}
      <View
        style={[
          styles.identity,
          {
            backgroundColor: colors.background,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.identityRow}>
          <Avatar name={user.name} uri={user.photo} size="lg" />
          <View style={[styles.identityText, { marginLeft: spacing.lg }]}>
            <Text style={[typography.title, { color: colors.textPrimary }]} numberOfLines={1}>
              {user.name}
            </Text>
            <TouchableOpacity
              onPress={() => setCitySheetOpen(true)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel="Change residence"
            >
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 3 }]}>
                {settings.showCity ? `📍 ${user.residence || 'Set residence'}` : 'City hidden'} ›
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.headerButtons, { gap: spacing.sm }]}>
            <Button label="Edit" variant="secondary" size="sm" onPress={openEditSheet} />
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={[styles.gearButton, { backgroundColor: colors.backgroundSecondary }]}
              accessibilityRole="button"
              accessibilityLabel="Settings"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <GearIcon color={colors.textSecondary} size={19} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.identityActions, { marginTop: spacing.lg, gap: spacing.sm }]}>
          <Button label="＋  Add friends" onPress={goToAddFriends} style={{ flex: 1 }} />
          <Button
            label="Invite contacts"
            variant="secondary"
            onPress={() => navigation.navigate('InviteContacts')}
            style={{ flex: 1 }}
          />
        </View>

        <SegmentedControl
          style={{ marginTop: spacing.md }}
          value={activeTab}
          onChange={setActiveTab}
          segments={[
            { key: 'profile', label: 'Profile' },
            { key: 'friends', label: 'Friends', badge: pendingRequestCount || undefined },
          ]}
        />
      </View>

      {activeTab === 'profile' ? (
        <ScrollView
          style={styles.body}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
          showsVerticalScrollIndicator={false}
        >
          {infoRows.length > 0 ? (
            <Card>
              {infoRows.map((row, index) => (
                <View
                  key={row.label}
                  style={[
                    styles.infoRow,
                    index > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: colors.border,
                      marginTop: spacing.md,
                      paddingTop: spacing.md,
                    },
                  ]}
                >
                  <Text style={[typography.body, { color: colors.textSecondary }]}>
                    {row.icon}  {row.label}
                  </Text>
                  <Text
                    style={[typography.body, { color: colors.textPrimary, fontWeight: '600', flexShrink: 1 }]}
                    numberOfLines={1}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}

          <Card style={{ marginTop: spacing.lg }}>
            <View style={styles.cardHeader}>
              <Text style={[typography.heading, { color: colors.textPrimary }]}>Interests</Text>
              <Button label="Edit" variant="ghost" size="sm" onPress={() => setInterestsSheetOpen(true)} />
            </View>
            {user.interests?.length > 0 ? (
              <View style={[styles.chipWrap, { marginTop: spacing.md }]}>
                {user.interests.map((interest) => (
                  <Chip key={interest} label={interest} selected />
                ))}
              </View>
            ) : (
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                No interests yet — tap Edit to pick a few.
              </Text>
            )}
          </Card>

        </ScrollView>
      ) : (
        <ScrollView
          style={styles.body}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.statRow, { gap: spacing.md }]}>
            <StatTile value={stats.directCount} label="Friends" emphasis />
            <StatTile value={stats.secondDegreeCount} label="Friends of friends" />
            <StatTile value={stats.totalReach} label="Total reach" />
          </View>

          <Card style={{ marginTop: spacing.lg }}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.heading, { color: colors.textPrimary }]}>
                  {focusedFriend ? focusedFriend.name : 'Your web'}
                </Text>
                <Text
                  style={[typography.caption, { color: colors.textSecondary, marginTop: 2, lineHeight: 18 }]}
                >
                  {focusedFriend
                    ? `${focusedPeerCount} ${
                        focusedPeerCount === 1 ? 'connection' : 'connections'
                      }${focusedPeerCount > 10 ? ' · showing 10' : ''} · tap a circle to open a profile`
                    : `${stats.directCount} direct ${
                        stats.directCount === 1 ? 'friend' : 'friends'
                      } connect you to ${stats.secondDegreeCount} more people across ${
                        stats.cityCount
                      } ${stats.cityCount === 1 ? 'city' : 'cities'}.`}
                </Text>
              </View>

              {focusedFriend ? (
                <Button label="Back" variant="secondary" size="sm" onPress={() => setFocusedFriendId(null)} />
              ) : webCity !== 'all' ? (
                // Total in the highlighted city; opens the full list.
                <TouchableOpacity
                  onPress={() => setCitySheetPeopleOpen(true)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Show all ${cityPeople.length} people in ${webCity}`}
                  style={[
                    styles.countPill,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: radius.pill,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm - 2,
                    },
                  ]}
                >
                  <Text style={[typography.label, { color: colors.onPrimary }]}>
                    {cityPeople.length}
                  </Text>
                  <Text style={[typography.caption, { color: colors.onPrimary, fontSize: 11 }]}>
                    in {webCity} ›
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {!focusedFriend && webCities.length > 1 ? (
              <View style={[styles.chipWrap, { marginTop: spacing.md }]}>
                <Chip
                  label="All"
                  selected={webCity === 'all'}
                  onPress={() => selectWebCity('all')}
                />
                {webCities.map(({ city, count }) => (
                  <Chip
                    key={city}
                    label={`${city} · ${count}`}
                    selected={webCity === city}
                    onPress={() => selectWebCity(city)}
                  />
                ))}
              </View>
            ) : null}

            {webFriends.length > 0 ? (
              <ConnectionWeb
                friends={webFriends}
                size={286}
                focusedFriendId={focusedFriendId}
                highlightedIds={highlightedIds}
                onFocusFriend={setFocusedFriendId}
                onOpenProfile={(userId) => navigation.navigate('FriendProfile', { userId })}
              />
            ) : (
              <EmptyState
                icon="🕸️"
                title="No connections yet"
                message="Add a few friends and your web will fill in here."
                actionLabel="Add friends"
                onAction={goToAddFriends}
              />
            )}

            {focusedFriend ? (
              <View style={[styles.webActions, { marginTop: spacing.sm, gap: spacing.sm }]}>
                <Button
                  label="View profile"
                  variant="secondary"
                  size="sm"
                  style={{ flex: 1 }}
                  onPress={() => navigation.navigate('FriendProfile', { userId: focusedFriend.id })}
                />
                <Button
                  label="Message"
                  size="sm"
                  style={{ flex: 1 }}
                  onPress={() => openDirectMessage(focusedFriend.id)}
                />
              </View>
            ) : (
              <View style={[styles.legend, { marginTop: spacing.sm, gap: spacing.lg }]}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {webCity === 'all' ? 'Friends · tap to zoom' : `In ${webCity}`}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.textTertiary }]} />
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {webCity === 'all' ? 'Friends of friends' : 'Elsewhere'}
                  </Text>
                </View>
              </View>
            )}
          </Card>

          <Card style={{ marginTop: spacing.lg }} onPress={() => navigation.navigate('FriendRequests')}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.heading, { color: colors.textPrimary }]}>Friend requests</Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  {pendingRequestCount > 0
                    ? `${pendingRequestCount} waiting on you`
                    : 'Find people and send requests'}
                </Text>
              </View>
              {pendingRequestCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.primary, borderRadius: radius.pill }]}>
                  <Text style={[typography.caption, { color: colors.onPrimary, fontWeight: '700' }]}>
                    {pendingRequestCount}
                  </Text>
                </View>
              ) : (
                <Text style={[typography.body, { color: colors.textTertiary }]}>›</Text>
              )}
            </View>
          </Card>

          <View style={[styles.cardHeader, { marginTop: spacing.xl, marginBottom: spacing.sm }]}>
            <Text style={[typography.heading, { color: colors.textPrimary }]}>
              Friends · {friendRows.length}
            </Text>
            <Button label="Add friends" variant="ghost" size="sm" onPress={goToAddFriends} />
          </View>

          {friendRows.length > 0 ? (
            <Card padded={false} style={{ paddingVertical: spacing.xs }}>
              {friendRows.map((friend, index) => (
                <View key={friend.id}>
                  {index > 0 ? rowDivider : null}
                  <PersonRow
                    name={friend.name}
                    subtitle={friend.city}
                    meta={
                      friend.mutualCount > 0
                        ? `${friend.mutualCount} mutual ${friend.mutualCount === 1 ? 'friend' : 'friends'}`
                        : undefined
                    }
                    onPress={() => navigation.navigate('FriendProfile', { userId: friend.id })}
                    onMessage={() => openDirectMessage(friend.id)}
                    right={
                      <TouchableOpacity
                        onPress={() => confirmRemoveFriend(friend)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${friend.name}`}
                      >
                        <Text style={[typography.caption, { color: colors.textTertiary }]}>Remove</Text>
                      </TouchableOpacity>
                    }
                  />
                </View>
              ))}
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon="👋"
                title="No friends yet"
                message="Send a few requests to start building your web."
                actionLabel="Add friends"
                onAction={goToAddFriends}
              />
            </Card>
          )}
        </ScrollView>
      )}

      {/* People in the highlighted city */}
      <BottomSheet
        visible={citySheetPeopleOpen}
        onClose={() => setCitySheetPeopleOpen(false)}
        title={`${webCity} · ${cityPeople.length} ${cityPeople.length === 1 ? 'person' : 'people'}`}
        subtitle="Everyone in your network who lives here"
      >
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
          <View style={styles.chipWrap}>
            {[
              { key: 'all', label: `All · ${cityPeople.length}` },
              {
                key: 'friends',
                label: `Friends · ${cityPeople.filter((p) => p.degree === 1).length}`,
              },
              {
                key: 'fof',
                label: `Friends of friends · ${cityPeople.filter((p) => p.degree === 2).length}`,
              },
            ].map((option) => (
              <Chip
                key={option.key}
                label={option.label}
                selected={peopleDegreeFilter === option.key}
                onPress={() => setPeopleDegreeFilter(option.key)}
              />
            ))}
          </View>

          {cityInterestOptions.length > 0 ? (
            <>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textTertiary, marginTop: spacing.md, marginBottom: spacing.sm },
                ]}
              >
                Filter by interest
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={[styles.chipWrap, { paddingRight: spacing.xl }]}>
                  {cityInterestOptions.map((interest) => (
                    <Chip
                      key={interest}
                      label={interest}
                      selected={peopleInterestFilters.includes(interest)}
                      onPress={() =>
                        setPeopleInterestFilters((prev) =>
                          prev.includes(interest)
                            ? prev.filter((item) => item !== interest)
                            : [...prev, interest]
                        )
                      }
                    />
                  ))}
                </View>
              </ScrollView>
            </>
          ) : null}
        </View>

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
        >
          {filteredCityPeople.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Nobody matches"
              message="Try clearing a filter."
              actionLabel="Clear filters"
              onAction={() => {
                setPeopleInterestFilters([]);
                setPeopleDegreeFilter('all');
              }}
            />
          ) : (
            filteredCityPeople.map(({ user: person, degree, connectors, mutualCount }, index) => (
              <View key={person.id}>
                {index > 0 ? rowDivider : null}
                <PersonRow
                  name={person.name}
                  subtitle={(person.interests || []).slice(0, 3).join(' · ')}
                  meta={
                    degree === 1
                      ? `Friend${mutualCount > 0 ? ` · ${mutualCount} mutual` : ''}`
                      : undefined
                  }
                  connectors={connectors}
                  onPress={() => {
                    setCitySheetPeopleOpen(false);
                    navigation.navigate('FriendProfile', { userId: person.id });
                  }}
                  onMessage={() => {
                    setCitySheetPeopleOpen(false);
                    openDirectMessage(person.id);
                  }}
                />
              </View>
            ))
          )}
        </ScrollView>
      </BottomSheet>

      {/* Interests editor */}
      <BottomSheet
        visible={interestsSheetOpen}
        onClose={() => {
          setInterestsSheetOpen(false);
          setInterestQuery('');
          setExpandedCategories({});
        }}
        title="Interests"
        subtitle={`${user.interests?.length || 0} selected`}
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
          <SearchInput value={interestQuery} onChangeText={setInterestQuery} placeholder="Search interests" />
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
                  selected={user.interests?.includes(interest)}
                  onPress={() => toggleInterest(interest)}
                />
              ))}
              {interestSearchResults.length === 0 ? (
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  No interests match “{interestQuery}”.
                </Text>
              ) : null}
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
                    accessibilityRole="button"
                    accessibilityState={{ expanded: !!expanded }}
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
                          selected={user.interests?.includes(interest)}
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

      {/* Residence picker */}
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
            const selected = user.residence === city.name;
            return (
              <TouchableOpacity
                key={city.name}
                onPress={() => {
                  setResidence(city.name);
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
          {filteredCities.length === 0 ? (
            <Text style={[typography.body, { color: colors.textSecondary }]}>No cities found.</Text>
          ) : null}
        </ScrollView>
      </BottomSheet>

      {/* Profile editor */}
      <BottomSheet
        visible={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        title="Edit profile"
        footer={<Button label="Save" fullWidth onPress={saveProfile} />}
      >
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={{ padding: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          {[
            { key: 'name', label: 'Name', placeholder: 'Alex Johnson' },
            { key: 'hometown', label: '📍 Hometown', placeholder: 'San Francisco, CA' },
            { key: 'college', label: '🎓 College', placeholder: 'Dartmouth College' },
            { key: 'age', label: '📅 Grad year', placeholder: '2026', numeric: true },
          ].map((field) => (
            <View key={field.key} style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.label, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
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
                value={editForm[field.key]}
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, [field.key]: text }))}
                keyboardType={field.numeric ? 'number-pad' : 'default'}
              />
            </View>
          ))}
        </ScrollView>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    width: '100%',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  identityActions: {
    flexDirection: 'row',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gearButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
  statRow: {
    flexDirection: 'row',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  webActions: {
    flexDirection: 'row',
  },
  countPill: {
    alignItems: 'center',
    marginLeft: 12,
  },
  badge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
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
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
