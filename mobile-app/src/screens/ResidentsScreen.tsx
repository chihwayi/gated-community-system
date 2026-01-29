import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
  Alert,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Search, Phone, Mail, User, MapPin, Plus, X } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { Storage } from '../utils/storage';
import { API_URL, ENDPOINTS } from '../config/api';
import Toast from 'react-native-toast-message';

export default function ResidentsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Resident Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newResident, setNewResident] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    house_address: '',
    password: 'Password123!', // Default or input
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.USERS}?role=resident`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch residents');
      }

      const data = await response.json();
      const formattedData = data.map((user: any) => ({
        id: user.id.toString(),
        name: user.full_name,
        unit: user.house_address || 'N/A',
        phone: user.phone_number || 'N/A',
        email: user.email,
        status: user.is_active ? 'Active' : 'Inactive',
      }));
      setResidents(formattedData);
    } catch (error) {
      console.error('Error fetching residents:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load residents',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddResident = async () => {
    if (!newResident.full_name || !newResident.email || !newResident.password) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
    }

    setAdding(true);
    try {
        const token = await Storage.getToken();
        const response = await fetch(`${API_URL}${ENDPOINTS.USERS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...newResident,
                role: 'resident',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create resident');
        }

        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Resident created successfully',
        });
        
        setModalVisible(false);
        setNewResident({
            full_name: '',
            email: '',
            phone_number: '',
            house_address: '',
            password: 'Password123!',
        });
        fetchResidents();
    } catch (error: any) {
        Alert.alert('Error', error.message);
    } finally {
        setAdding(false);
    }
  };

  const filteredResidents = residents.filter(r => 
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.unit?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

    return (
    <Container {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <User size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.unitContainer}>
              <MapPin size={12} color="#94a3b8" />
              <Text style={styles.unit}>{item.unit}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : item.status === 'Pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Active' ? '#34d399' : item.status === 'Pending' ? '#fbbf24' : '#f87171' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Phone size={16} color="#3b82f6" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Mail size={16} color="#3b82f6" />
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Residents</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search residents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748b"
          />
        </View>

        <FlatList
          data={filteredResidents}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Add Resident Modal */}
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Resident</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <X color="#94a3b8" size={24} />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.formContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            placeholderTextColor="#64748b"
                            value={newResident.full_name}
                            onChangeText={(text) => setNewResident({...newResident, full_name: text})}
                        />

                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="john@example.com"
                            placeholderTextColor="#64748b"
                            value={newResident.email}
                            onChangeText={(text) => setNewResident({...newResident, email: text})}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+1 234 567 8900"
                            placeholderTextColor="#64748b"
                            value={newResident.phone_number}
                            onChangeText={(text) => setNewResident({...newResident, phone_number: text})}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.label}>House/Unit Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="A-101"
                            placeholderTextColor="#64748b"
                            value={newResident.house_address}
                            onChangeText={(text) => setNewResident({...newResident, house_address: text})}
                        />
                        
                        <Text style={styles.label}>Temporary Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Password123!"
                            placeholderTextColor="#64748b"
                            value={newResident.password}
                            onChangeText={(text) => setNewResident({...newResident, password: text})}
                            secureTextEntry
                        />

                        <TouchableOpacity 
                            style={styles.submitButton}
                            onPress={handleAddResident}
                            disabled={adding}
                        >
                            {adding ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Create Resident</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
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
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unit: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  actionText: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  addButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.full,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
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
  formContainer: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: '#334155',
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
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
