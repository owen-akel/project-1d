import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getFavorites, removeFavorite } from '../services/favorites';
import { useAuth } from '../context/AuthContext';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user, isGuest } = useAuth();
  const [favorites, setFavorites] = useState([]);

  const loadFavorites = useCallback(async () => {
    const data = await getFavorites(!isGuest ? user?.id : null);
    setFavorites(data);
  }, [isGuest, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {favorites.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No favorites yet. Add spots from the map.
          </Text>
        )}
        {favorites.map((fav) => (
          <TouchableOpacity
            key={fav.id}
            style={[styles.item, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => {
              navigation.navigate('Main', {
                screen: 'Home',
                params: { favoriteSegmentId: fav.id },
              });
            }}
            activeOpacity={0.8}
          >
            <View>
              <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{fav.name}</Text>
              <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                {fav.latitude?.toFixed(4)}, {fav.longitude?.toFixed(4)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                const updated = await removeFavorite(fav.id, !isGuest ? user?.id : null);
                setFavorites(updated);
              }}
            >
              <Text style={[styles.deleteText, { color: colors.error ?? '#ef4444' }]}>Remove</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  backText: {
    fontSize: 22,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: { flex: 1 },
  contentInner: {
    padding: 20,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  item: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemSubtitle: {
    marginTop: 4,
    fontSize: 12,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
