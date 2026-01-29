import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Info,
  X,
  Check
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import { getImageUrl } from '../utils/image';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

export default function AmenitiesScreen({ navigation }: any) {
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [newHours, setNewHours] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchAmenities();
  }, []);

  const checkAdminStatus = async () => {
    const user = await Storage.getUser();
    setIsAdmin(user?.role === 'admin');
  };

  const fetchAmenities = async () => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.AMENITIES}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to load amenities');
      }
      const data = await response.json();
      const formatted = data.map((a: any) => ({
        id: a.id?.toString(),
        name: a.name,
        description: a.description,
        status: a.status, // available | maintenance | closed
        hours: a.open_hours || '—',
        capacity: a.capacity?.toString() || '—',
        image: getImageUrl(a.image_url),
      }));
      setAmenities(formatted);
    } catch (e) {
      console.error('Amenities fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAmenity = async () => {
    if (!newName) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter an amenity name',
      });
      return;
    }

    setCreating(true);
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.AMENITIES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
          capacity: newCapacity ? parseInt(newCapacity) : null,
          open_hours: newHours,
          status: 'available',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create amenity');
      }

      Toast.show({
        type: 'success',
        text1: 'Amenity Created',
        text2: `${newName} has been added successfully`,
      });

      setModalVisible(false);
      setNewName('');
      setNewDescription('');
      setNewCapacity('');
      setNewHours('');
      fetchAmenities();
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Creation Failed',
        text2: e.message,
      });
    } finally {
      setCreating(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardGradient}
      />
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'available' ? '#10b981' : item.status === 'maintenance' ? '#f59e0b' : '#ef4444' }
          ]}>
            <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Clock size={14} color="#e2e8f0" />
            <Text style={styles.detailText}>{item.hours}</Text>
          </View>
          <View style={styles.detailItem}>
            <MapPin size={14} color="#e2e8f0" />
            <Text style={styles.detailText}>Capacity: {item.capacity}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const BlurContainer = Platform.OS === 'ios' ? BlurView : View;
  const blurProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

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
          <Text style={styles.headerTitle}>Amenities</Text>
          {isAdmin ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Plus color="#fff" size={24} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <FlatList
          data={amenities}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Add Amenity Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <BlurContainer {...blurProps} style={[styles.modalBlur, Platform.OS === 'android' && styles.androidModal]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Amenity</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <X color="#94a3b8" size={24} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.formScroll}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Swimming Pool"
                      placeholderTextColor="#64748b"
                      value={newName}
                      onChangeText={setNewName}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Brief description..."
                      placeholderTextColor="#64748b"
                      multiline
                      numberOfLines={3}
                      value={newDescription}
                      onChangeText={setNewDescription}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.label}>Capacity</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 50"
                        placeholderTextColor="#64748b"
                        keyboardType="numeric"
                        value={newCapacity}
                        onChangeText={setNewCapacity}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.label}>Open Hours</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 8am - 10pm"
                        placeholderTextColor="#64748b"
                        value={newHours}
                        onChangeText={setNewHours}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleCreateAmenity}
                    disabled={creating}
                  >
                    <LinearGradient
                      colors={['#0891b2', '#06b6d4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitGradient}
                    >
                      {creating ? (
                         <Text style={styles.submitText}>Creating...</Text>
                      ) : (
                        <>
                          <Text style={styles.submitText}>Create Amenity</Text>
                          <Check color="#fff" size={20} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </BlurContainer>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  addButton: {
    padding: 8,
  },
  listContent: {
    padding: SPACING.l,
  },
  card: {
    height: 200,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.l,
    backgroundColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  cardContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.m,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: height * 0.7,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalBlur: {
    flex: 1,
    padding: SPACING.l,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
  },
  androidModal: {
    backgroundColor: '#1e293b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  formScroll: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.l,
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.l,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: SPACING.m,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 40,
  },
  submitGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
