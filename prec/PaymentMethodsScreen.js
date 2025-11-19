import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function PaymentMethodsScreen({ navigation }) {
  const { colors } = useTheme();
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', cardholderName: 'John Doe', isDefault: true },
    { id: 2, type: 'Mastercard', last4: '8888', expiry: '09/24', cardholderName: 'John Doe', isDefault: false },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Visa',
    last4: '',
    expiry: '',
    cardholderName: '',
    isDefault: false,
  });

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData(method);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingMethod(null);
    setFormData({
      type: 'Visa',
      last4: '',
      expiry: '',
      cardholderName: '',
      isDefault: false,
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (editingMethod) {
      // Update existing payment method
      setPaymentMethods(paymentMethods.map(m =>
        m.id === editingMethod.id ? { ...formData, id: m.id } : m
      ));
    } else {
      // Add new payment method
      const newId = Math.max(...paymentMethods.map(m => m.id), 0) + 1;
      setPaymentMethods([...paymentMethods, { ...formData, id: newId }]);
    }
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    setPaymentMethods(paymentMethods.filter(m => m.id !== id));
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === id,
    })));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
        >
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentMethods.map((method) => (
          <View key={method.id} style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardIcon}>
              <View style={[styles.cardIconRect, { backgroundColor: colors.primary }]} />
              <View style={styles.cardIconChip} />
            </View>
            <View style={styles.paymentInfo}>
              <View style={styles.paymentHeader}>
                <Text style={[styles.paymentType, { color: colors.textPrimary }]}>{method.type}</Text>
                {method.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: colors.primaryBg, borderColor: colors.primary }]}>
                    <Text style={[styles.defaultText, { color: colors.primary }]}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.paymentNumber, { color: colors.textSecondary }]}>•••• •••• •••• {method.last4}</Text>
              <Text style={[styles.paymentExpiry, { color: colors.textTertiary }]}>Expires {method.expiry}</Text>
              <Text style={[styles.cardholderName, { color: colors.textSecondary }]}>{method.cardholderName}</Text>
            </View>
            <View style={styles.actionButtons}>
              {!method.isDefault && (
                <TouchableOpacity
                  style={[styles.defaultButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                  onPress={() => handleSetDefault(method.id)}
                >
                  <Text style={[styles.defaultButtonText, { color: colors.primary }]}>Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primaryBg, borderColor: colors.border }]}
                onPress={() => handleEdit(method)}
              >
                <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}
                onPress={() => handleDelete(method.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAdd}
        >
          <Text style={styles.addButtonText}>+ Add Payment Method</Text>
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: colors.primaryBg, borderColor: colors.primaryLight }]}>
          <Text style={[styles.infoTitle, { color: colors.primaryDark }]}>Secure Payments</Text>
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Your payment information is encrypted and stored securely. We never share your card details.
          </Text>
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary }]}
              >
                <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Card Type</Text>
                <View style={styles.cardTypeButtons}>
                  {['Visa', 'Mastercard', 'Amex', 'Discover'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.cardTypeButton,
                        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                        formData.type === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setFormData({ ...formData, type })}
                    >
                      <Text
                        style={[
                          styles.cardTypeText,
                          { color: colors.textPrimary },
                          formData.type === type && { color: '#ffffff' },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Cardholder Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="e.g., John Doe"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.cardholderName}
                  onChangeText={(text) => setFormData({ ...formData, cardholderName: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Last 4 Digits</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="e.g., 4242"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.last4}
                  onChangeText={(text) => setFormData({ ...formData, last4: text.slice(0, 4) })}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Expiry Date (MM/YY)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="e.g., 12/25"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.expiry}
                  onChangeText={(text) => {
                    // Auto-format as MM/YY
                    let formatted = text.replace(/\D/g, '');
                    if (formatted.length >= 2) {
                      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
                    }
                    setFormData({ ...formData, expiry: formatted });
                  }}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>
                  {editingMethod ? 'Save Changes' : 'Add Payment Method'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  paymentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 50,
    height: 36,
    marginBottom: 12,
    position: 'relative',
  },
  cardIconRect: {
    width: 50,
    height: 36,
    borderRadius: 6,
  },
  cardIconChip: {
    position: 'absolute',
    width: 18,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
    top: 8,
    left: 6,
  },
  paymentInfo: {
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  paymentType: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
    letterSpacing: -0.3,
  },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '700',
  },
  paymentNumber: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  paymentExpiry: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  cardholderName: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  defaultButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  defaultButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  addButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  cardTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardTypeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  cardTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
