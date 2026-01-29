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
  Alert,
  RefreshControl
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
  Check,
  List,
  LayoutGrid
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import { getImageUrl } from '../utils/image';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

export default function AmenitiesScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'amenities' | 'bookings'>('amenities');
  
  const [amenities, setAmenities] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [newHours, setNewHours] = useState('');
  const [creating, setCreating] = useState(false);

  // Booking State
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState(new Date());
  const [bookingStartTime, setBookingStartTime] = useState('');
  const [bookingEndTime, setBookingEndTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchData();
  }, [activeTab]);

  const checkAdminStatus = async () => {
    const user = await Storage.getUser();
    setIsAdmin(user?.role === 'admin');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'amenities') {
        await fetchAmenities();
      } else {
        await fetchBookings();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAmenities = async () => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.AMENITIES}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load amenities');
      const data = await response.json();
      const formatted = data.map((a: any) => ({
        id: a.id?.toString(),
        name: a.name,
        description: a.description,
        status: a.status,
        hours: a.open_hours || '—',
        capacity: a.capacity?.toString() || '—',
        image: getImageUrl(a.image_url),
      }));
      setAmenities(formatted);
    } catch (e) {
      console.error('Amenities fetch error:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load amenities' });
    }
  };

  const fetchBookings = async () => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.BOOKINGS}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load bookings');
      const data = await response.json();
      setBookings(data);
    } catch (e) {
      console.error('Bookings fetch error:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load bookings' });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCreateAmenity = async () => {
    if (!newName) {
      Toast.show({ type: 'error', text1: 'Missing Information', text2: 'Please enter an amenity name' });
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

      Toast.show({ type: 'success', text1: 'Amenity Created', text2: `${newName} added successfully` });
      setModalVisible(false);
      setNewName('');
      setNewDescription('');
      setNewCapacity('');
      setNewHours('');
      fetchAmenities();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Creation Failed', text2: e.message });
    } finally {
      setCreating(false);
    }
  };

  const handleBookAmenity = async () => {
    if (!bookingStartTime || !bookingEndTime) {
      Toast.show({ type: 'error', text1: 'Missing Information', text2: 'Please select start and end times' });
      return;
    }

    setBookingLoading(true);
    try {
      const dateStr = bookingDate.toISOString().split('T')[0];
      const startDateTime = new Date(`${dateStr}T${bookingStartTime}:00`).toISOString();
      const endDateTime = new Date(`${dateStr}T${bookingEndTime}:00`).toISOString();

      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.BOOKINGS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amenity_id: parseInt(selectedAmenity.id),
          start_time: startDateTime,
          end_time: endDateTime,
          notes: bookingNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create booking');
      }

      Toast.show({ type: 'success', text1: 'Booking Requested', text2: 'Submitted for approval' });
      setBookingModalVisible(false);
      setBookingStartTime('');
      setBookingEndTime('');
      setBookingNotes('');
      setSelectedAmenity(null);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Booking Failed', text2: e.message });
    } finally {
      setBookingLoading(false);
    }
  };

  const renderAmenityItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => {
        if (!isAdmin && item.status === 'available') {
            setSelectedAmenity(item);
            setBookingModalVisible(true);
        }
    }}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
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

  const renderBookingItem = ({ item }: any) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingTitle}>{item.amenity?.name || 'Unknown Amenity'}</Text>
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: 
              item.status === 'confirmed' ? 'rgba(16, 185, 129, 0.2)' : 
              item.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 
              'rgba(239, 68, 68, 0.2)'
          }
        ]}>
          <Text style={[
            styles.statusText, 
            { 
              color: 
                item.status === 'confirmed' ? '#10b981' : 
                item.status === 'pending' ? '#f59e0b' : 
                '#ef4444' 
            }
          ]}>
            {item.status?.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.bookingRow}>
          <Calendar size={14} color="#94a3b8" />
          <Text style={styles.bookingText}>
            {new Date(item.start_time).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.bookingRow}>
          <Clock size={14} color="#94a3b8" />
          <Text style={styles.bookingText}>
            {new Date(item.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
            {new Date(item.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>
        {item.notes && (
          <View style={styles.bookingRow}>
            <Info size={14} color="#94a3b8" />
            <Text style={styles.bookingText}>{item.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const BlurContainer = Platform.OS === 'ios' ? BlurView : View;
  const blurProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Amenities</Text>
          {isAdmin ? (
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Plus color="#fff" size={24} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Tabs */}
        {!isAdmin && (
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'amenities' && styles.activeTab]}
              onPress={() => setActiveTab('amenities')}
            >
              <LayoutGrid size={16} color={activeTab === 'amenities' ? '#fff' : '#94a3b8'} />
              <Text style={[styles.tabText, activeTab === 'amenities' && styles.activeTabText]}>Explore</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
              onPress={() => setActiveTab('bookings')}
            >
              <List size={16} color={activeTab === 'bookings' ? '#fff' : '#94a3b8'} />
              <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>My Bookings</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={activeTab === 'amenities' ? amenities : bookings}
          renderItem={activeTab === 'amenities' ? renderAmenityItem : renderBookingItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Loading...' : activeTab === 'amenities' ? 'No amenities found' : 'No bookings found'}
              </Text>
            </View>
          }
        />

        {/* Add Amenity Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
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

                  <TouchableOpacity style={styles.submitButton} onPress={handleCreateAmenity} disabled={creating}>
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

        {/* Booking Modal */}
        <Modal
          visible={bookingModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setBookingModalVisible(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <BlurContainer {...blurProps} style={[styles.modalBlur, Platform.OS === 'android' && styles.androidModal]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Book {selectedAmenity?.name}</Text>
                  <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                    <X color="#94a3b8" size={24} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.formScroll}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Start Time</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="HH:MM (24h)"
                            placeholderTextColor="#64748b"
                            value={bookingStartTime}
                            onChangeText={setBookingStartTime}
                            keyboardType="numbers-and-punctuation"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>End Time</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="HH:MM (24h)"
                            placeholderTextColor="#64748b"
                            value={bookingEndTime}
                            onChangeText={setBookingEndTime}
                            keyboardType="numbers-and-punctuation"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Any special requests?"
                            placeholderTextColor="#64748b"
                            value={bookingNotes}
                            onChangeText={setBookingNotes}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleBookAmenity} disabled={bookingLoading}>
                        <LinearGradient
                            colors={['#3b82f6', '#2563eb']}
                            style={styles.submitGradient}
                        >
                            {bookingLoading ? (
                                <Text style={styles.submitText}>Booking...</Text>
                            ) : (
                                <Text style={styles.submitText}>Confirm Booking</Text>
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
  container: { flex: 1, backgroundColor: '#0f172a' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1f5f9' },
  addButton: { padding: 8 },
  
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.m,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },

  listContent: { padding: SPACING.l },
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
  cardImage: { width: '100%', height: '100%' },
  cardGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
  cardContent: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: SPACING.m },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.s },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  detailsRow: { flexDirection: 'row', gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: '#e2e8f0', fontSize: 14 },
  
  bookingCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bookingDetails: {
    gap: 8,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingText: {
    color: '#94a3b8',
    fontSize: 14,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },

  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { height: '80%', backgroundColor: 'transparent' },
  modalBlur: { flex: 1, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.l, overflow: 'hidden' },
  androidModal: { backgroundColor: '#1e293b' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.l },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  formScroll: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  submitButton: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
  submitGradient: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
