import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const parkingHistory = [
    {
      id: 1,
      name: 'Downtown Parking',
      date: 'Today, 2:30 PM',
      duration: '2h 15m',
      cost: '$11.25',
      status: 'active',
    },
    {
      id: 2,
      name: 'City Center Garage',
      date: 'Yesterday, 9:00 AM',
      duration: '4h 30m',
      cost: '$18.00',
      status: 'completed',
    },
    {
      id: 3,
      name: 'Shopping Mall',
      date: 'Oct 25, 3:45 PM',
      duration: '1h 45m',
      cost: '$5.25',
      status: 'completed',
    },
    {
      id: 4,
      name: 'Airport Parking',
      date: 'Oct 23, 6:00 AM',
      duration: '8h 00m',
      cost: '$64.00',
      status: 'completed',
    },
    {
      id: 5,
      name: 'Park & Ride',
      date: 'Oct 22, 11:30 AM',
      duration: '3h 15m',
      cost: '$6.50',
      status: 'completed',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>History</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Your parking sessions</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>24</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Parkings</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>32h</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Time Saved</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>$156</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Spent</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>

        {parkingHistory.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.statusIcon,
                    { borderColor: item.status === 'active' ? '#14b8a6' : '#e2e8f0' },
                  ]}
                />

                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{item.date}</Text>
                  <Text style={[styles.cardDuration, { color: colors.textSecondary }]}>{item.duration}</Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <Text style={[styles.cost, { color: colors.primary }]}>{item.cost}</Text>
                {item.status === 'active' && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.success }]}>
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {index < parkingHistory.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 5,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14b8a6',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#14b8a6',
    borderWidth: 3,
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '500',
  },
  cardDuration: {
    fontSize: 13,
    color: '#94a3b8',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cost: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  activeBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14b8a6',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  activeText: {
    fontSize: 12,
    color: '#14b8a6',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
});
