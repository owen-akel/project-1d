import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function MyVehiclesScreen({ navigation }) {
  const { colors } = useTheme();
  const [vehicles, setVehicles] = useState([
    { id: 1, make: 'Honda', model: 'Civic', year: '2020', plate: 'ABC-1234', color: 'Silver' },
    { id: 2, make: 'Toyota', model: 'Camry', year: '2019', plate: 'XYZ-5678', color: 'Blue' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    plate: '',
    color: '',
  });

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setFormData({
      make: '',
      model: '',
      year: '',
      plate: '',
      color: '',
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(vehicles.map(v =>
        v.id === editingVehicle.id ? { ...formData, id: v.id } : v
      ));
    } else {
      // Add new vehicle
      const newId = Math.max(...vehicles.map(v => v.id), 0) + 1;
      setVehicles([...vehicles, { ...formData, id: newId }]);
    }
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    setVehicles(vehicles.filter(v => v.id !== id));
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Vehicles</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {vehicles.map((vehicle) => (
          <View key={vehicle.id} style={[styles.vehicleCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.vehicleIcon}>
              <View style={[styles.carIconBody, { backgroundColor: colors.primary }]} />
              <View style={styles.carIconWheel1} />
              <View style={styles.carIconWheel2} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Text>
              <Text style={[styles.vehicleDetail, { color: colors.textSecondary }]}>
                Plate: {vehicle.plate}
              </Text>
              <Text style={[styles.vehicleDetail, { color: colors.textSecondary }]}>
                Color: {vehicle.color}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primaryBg, borderColor: colors.border }]}
                onPress={() => handleEdit(vehicle)}
              >
                <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}
                onPress={() => handleDelete(vehicle.id)}
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
          <Text style={styles.addButtonText}>+ Add New Vehicle</Text>
        </TouchableOpacity>
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
                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
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
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Make</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="e.g., Honda"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.make}
                  onChangeText={(text) => setFormData({ ...formData, make: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Model</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="e.g., Civic"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.model}
                  onChangeText={(text) => setFormData({ ...formData, model: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Year</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="e.g., 2020"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.year}
                  onChangeText={(text) => setFormData({ ...formData, year: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>License Plate</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="e.g., ABC-1234"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.plate}
                  onChangeText={(text) => setFormData({ ...formData, plate: text })}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Color</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="e.g., Silver"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.color}
                  onChangeText={(text) => setFormData({ ...formData, color: text })}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>
                  {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
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
  vehicleCard: {
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
  vehicleIcon: {
    width: 60,
    height: 40,
    position: 'relative',
    marginBottom: 12,
  },
  carIconBody: {
    width: 50,
    height: 28,
    borderRadius: 8,
  },
  carIconWheel1: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#334155',
    bottom: -2,
    left: 8,
  },
  carIconWheel2: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#334155',
    bottom: -2,
    right: 8,
  },
  vehicleInfo: {
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  vehicleDetail: {
    fontSize: 14,
    marginBottom: 3,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
  },
  addButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
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
