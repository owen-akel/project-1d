import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function HelpSupportScreen({ navigation }) {
  const { colors } = useTheme();
  const faqs = [
    {
      id: 1,
      question: 'How do I reserve a parking spot?',
      answer: 'Browse available spots on the map, tap on a spot, and click "Reserve Spot" to book it instantly.',
    },
    {
      id: 2,
      question: 'Can I cancel a reservation?',
      answer: 'Yes, you can cancel up to 15 minutes before your reservation time for a full refund.',
    },
    {
      id: 3,
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, debit cards, and digital wallets like Apple Pay and Google Pay.',
    },
    {
      id: 4,
      question: 'How do I add a new vehicle?',
      answer: 'Go to Profile > My Vehicles and tap "Add New Vehicle" to register your car details.',
    },
  ];

  const handleEmail = () => {
    Linking.openURL('mailto:support@parker.com');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+1-800-PARKING');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contact Us</Text>

          <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={handleEmail}>
            <View style={[styles.contactIcon, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.contactIconText, { color: colors.primary }]}>@</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Email Support</Text>
              <Text style={[styles.contactValue, { color: colors.textPrimary }]}>support@parker.com</Text>
            </View>
            <Text style={[styles.contactArrow, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={handlePhone}>
            <View style={[styles.contactIcon, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={[styles.phoneIcon, { borderColor: colors.primary }]} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Phone Support</Text>
              <Text style={[styles.contactValue, { color: colors.textPrimary }]}>+1-800-PARKING</Text>
            </View>
            <Text style={[styles.contactArrow, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Frequently Asked Questions</Text>

          {faqs.map((faq) => (
            <View key={faq.id} style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>{faq.question}</Text>
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.feedbackSection}>
          <TouchableOpacity style={styles.feedbackButton}>
            <Text style={styles.feedbackButtonText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backButtonText: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contactSection: {
    padding: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactIconText: {
    fontSize: 24,
    color: '#14b8a6',
    fontWeight: '700',
  },
  phoneIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#14b8a6',
    transform: [{ rotate: '20deg' }],
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  contactArrow: {
    fontSize: 24,
    color: '#94a3b8',
    fontWeight: '300',
  },
  faqSection: {
    padding: 20,
    paddingTop: 8,
  },
  faqCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    fontWeight: '500',
  },
  feedbackSection: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  feedbackButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  feedbackButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
