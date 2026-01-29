import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Search, Car, User, MapPin, Plus, Trash2, X } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import Toast from 'react-native-toast-message';
import { CustomAlert } from '../components/CustomAlert';

export default function VehiclesScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Add Vehicle State
  const [modalVisible, setModalVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    license_plate: '',
    make: '',
    model: '',
    color: '',
  });

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    showCancel: false,
    onConfirm: () => {},
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', showCancel = false, onConfirm?: () => void, confirmText = 'OK', cancelText = 'Cancel') => {
    setAlertConfig({
      title,
      message,
      type,
      showCancel,
      onConfirm: onConfirm || (() => setAlertVisible(false)),
      confirmText,
      cancelText
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchVehicles();
    setRefreshing(false);
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = await Storage.getToken();
      const user = await Storage.getUser();
      setCurrentUser(user);

      const response = await fetch(`${API_URL}${ENDPOINTS.VEHICLES}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        setVehicles(data);
      } catch (e) {
        console.error('Error parsing vehicles JSON:', text.substring(0, 100));
        throw new Error('Invalid JSON response');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load vehicles',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.license_plate || !newVehicle.make || !newVehicle.model) {
        showAlert('Error', 'Please fill all required fields', 'error');
        return;
    }

    setAdding(true);
    try {
        const token = await Storage.getToken();
        const response = await fetch(`${API_URL}${ENDPOINTS.VEHICLES}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newVehicle),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to add vehicle');
        }

        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Vehicle added successfully',
        });
        
        setModalVisible(false);
        setNewVehicle({
            license_plate: '',
            make: '',
            model: '',
            color: '',
        });
        fetchVehicles();
    } catch (error: any) {
        showAlert('Error', error.message, 'error');
    } finally {
        setAdding(false);
    }
  };

  const handleDeleteVehicle = (vehicle: any) => {
      showAlert(
          'Delete Vehicle',
          `Are you sure you want to remove vehicle ${vehicle.license_plate}?`,
          'warning',
          true,
          async () => {
              setAlertVisible(false);
              try {
                  const token = await Storage.getToken();
                  // Handle potential double slash
                  const endpoint = ENDPOINTS.VEHICLES.endsWith('/')
                    ? `${ENDPOINTS.VEHICLES}${vehicle.id}`
                    : `${ENDPOINTS.VEHICLES}/${vehicle.id}`;

                  const response = await fetch(`${API_URL}${endpoint}`, {
                      method: 'DELETE',
                      headers: {
                          'Authorization': `Bearer ${token}`,
                      },
                  });

                  if (!response.ok) {
                      throw new Error('Failed to delete vehicle');
                  }

                  Toast.show({
                      type: 'success',
                      text1: 'Success',
                      text2: 'Vehicle removed successfully',
                  });
                  fetchVehicles();
              } catch (error) {
                  showAlert('Error', 'Failed to delete vehicle', 'error');
              }
          },
          'Delete',
          'Cancel'
      );
  };

  const filteredVehicles = vehicles.filter(v => 
    v.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.owner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.owner?.house_address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};
    
    // Check ownership
    const isOwner = currentUser?.id === item.user_id || currentUser?.role === 'admin';

    return (
      <Container {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Car size={24} color="#8b5cf6" />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.plate}>{item.license_plate}</Text>
            <Text style={styles.model}>{item.make} {item.model}</Text>
          </View>
          {isOwner && (
              <TouchableOpacity onPress={() => handleDeleteVehicle(item)} style={styles.deleteButton}>
                  <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <User size={14} color="#94a3b8" />
            <Text style={styles.detailText}>{item.owner?.full_name || 'Unknown Owner'}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={14} color="#94a3b8" />
            <Text style={styles.detailText}>{item.owner?.house_address || 'N/A'}</Text>
          </View>
        </View>
      </Container>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicles</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748b"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredVehicles}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No vehicles found</Text>
              </View>
            }
          />
        )}

        {/* Add Vehicle Modal */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <BlurView intensity={20} tint="dark" style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Vehicle</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <X color="#94a3b8" size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>License Plate *</Text>
                            <TextInput
                                style={styles.input}
                                value={newVehicle.license_plate}
                                onChangeText={(text) => setNewVehicle({...newVehicle, license_plate: text})}
                                placeholder="Enter license plate"
                                placeholderTextColor="#64748b"
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Make *</Text>
                            <TextInput
                                style={styles.input}
                                value={newVehicle.make}
                                onChangeText={(text) => setNewVehicle({...newVehicle, make: text})}
                                placeholder="e.g. Toyota"
                                placeholderTextColor="#64748b"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Model *</Text>
                            <TextInput
                                style={styles.input}
                                value={newVehicle.model}
                                onChangeText={(text) => setNewVehicle({...newVehicle, model: text})}
                                placeholder="e.g. Corolla"
                                placeholderTextColor="#64748b"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Color</Text>
                            <TextInput
                                style={styles.input}
                                value={newVehicle.color}
                                onChangeText={(text) => setNewVehicle({...newVehicle, color: text})}
                                placeholder="e.g. Silver"
                                placeholderTextColor="#64748b"
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.submitButton}
                            onPress={handleAddVehicle}
                            disabled={adding}
                        >
                            {adding ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Add Vehicle</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </BlurView>
            </View>
        </Modal>

        <CustomAlert 
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertVisible(false)}
          showCancel={alertConfig.showCancel}
          onConfirm={alertConfig.onConfirm}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { padding: SPACING.xs },
  addButton: { padding: SPACING.xs },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1f5f9' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    height: 48,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, fontSize: 16, color: '#f1f5f9' },
  listContainer: { padding: SPACING.lg, paddingTop: SPACING.sm },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  model: {
    fontSize: 12,
    color: '#94a3b8',
  },
  deleteButton: {
      padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: SPACING.md,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: SPACING.lg,
  },
  modalContent: {
      backgroundColor: '#1e293b',
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      maxHeight: '80%',
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.lg,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
  },
  inputGroup: {
      marginBottom: SPACING.md,
  },
  label: {
      color: '#94a3b8',
      marginBottom: SPACING.xs,
      fontSize: 14,
  },
  input: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      color: '#fff',
      fontSize: 16,
  },
  submitButton: {
      backgroundColor: COLORS.primary,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      marginTop: SPACING.md,
  },
  submitButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
  },
});
