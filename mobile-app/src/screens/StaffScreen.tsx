import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  ChevronLeft,
  Phone,
  Mail,
  MoreHorizontal,
  Plus,
  X,
  Lock
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import Toast from 'react-native-toast-message';
import { getImageUrl } from '../utils/image';
import { CustomAlert } from '../components/CustomAlert';

const { width } = Dimensions.get('window');

export default function StaffScreen({ navigation }: any) {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Add Staff Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newStaff, setNewStaff] = useState({
    full_name: '',
    phone_number: '',
    staff_type: 'maid', // Default
  });
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'guards' | 'helpers'>('guards');
  
  // Guard State
  const [guards, setGuards] = useState<any[]>([]);
  const [newGuard, setNewGuard] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: 'Password123!',
  });

  // Password Reset State
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (activeTab === 'guards') {
      fetchGuards();
    } else {
      fetchStaff();
    }
  }, [activeTab]);

  const fetchGuards = async () => {
    setLoading(true);
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.USERS}?role=guard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch guards');

      const data = await response.json();
      setGuards(data);
    } catch (error) {
      console.error('Error fetching guards:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load guards',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.STAFF}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }

      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load staff list',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (activeTab === 'guards') {
        if (!newGuard.full_name || !newGuard.email || !newGuard.password) {
            showAlert('Error', 'Please fill all required fields', 'error');
            return;
        }
        await createGuard();
    } else {
        if (!newStaff.full_name || !newStaff.phone_number) {
            showAlert('Error', 'Please fill all required fields', 'error');
            return;
        }
        await createStaff();
    }
  };

  const createGuard = async () => {
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
                ...newGuard,
                role: 'guard'
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create guard');
        }

        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Guard created successfully',
        });
        
        setModalVisible(false);
        setNewGuard({
            full_name: '',
            email: '',
            phone_number: '',
            password: 'Password123!',
        });
        fetchGuards();
    } catch (error: any) {
        showAlert('Error', error.message, 'error');
    } finally {
        setAdding(false);
    }
  };

  const createStaff = async () => {
    setAdding(true);
    try {
        const token = await Storage.getToken();
        const response = await fetch(`${API_URL}${ENDPOINTS.STAFF}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newStaff),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create staff');
        }

        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Staff created successfully',
        });
        
        setModalVisible(false);
        setNewStaff({
            full_name: '',
            phone_number: '',
            staff_type: 'maid',
        });
        fetchStaff();
    } catch (error: any) {
        showAlert('Error', error.message, 'error');
    } finally {
        setAdding(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassword || !selectedUserId) {
      showAlert('Error', 'Please enter a new password', 'error');
      return;
    }

    setResetting(true);
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.USERS}/${selectedUserId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_password: resetPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reset password');
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password reset successfully',
      });
      
      setResetModalVisible(false);
      setResetPassword('');
      setSelectedUserId(null);
    } catch (error: any) {
      showAlert('Error', error.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  const openResetModal = (userId: string) => {
    setSelectedUserId(userId);
    setResetPassword('');
    setResetModalVisible(true);
  };

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};
    const isGuard = activeTab === 'guards';

    return (
      <Container {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard]}>
        <View style={styles.cardHeader}>
          {item.photo_url ? (
            <Image 
              source={{ uri: getImageUrl(item.photo_url) }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {item.full_name?.substring(0, 2)?.toUpperCase() || (isGuard ? 'GD' : 'ST')}
              </Text>
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.role}>{isGuard ? 'Security Guard' : item.staff_type}</Text>
            {isGuard && <Text style={styles.email}>{item.email}</Text>}
          </View>
          <TouchableOpacity style={styles.moreButton}>
              <MoreHorizontal color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.actions}>
          <View style={[styles.statusBadge, { backgroundColor: (item.status === 'active' || item.is_active) ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)' }]}>
              <Text style={[styles.statusText, { color: (item.status === 'active' || item.is_active) ? '#4ade80' : '#94a3b8' }]}>
                  {(item.status || (item.is_active ? 'active' : 'inactive'))}
              </Text>
          </View>
          
          <View style={styles.contactActions}>
              {isGuard && (
                <TouchableOpacity style={styles.actionButton} onPress={() => openResetModal(item.id.toString())}>
                    <Lock size={18} color="#cbd5e1" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionButton}>
                  <Phone size={18} color="#cbd5e1" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                  <Mail size={18} color="#cbd5e1" />
              </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Staff Directory</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={staff}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No staff members found.</Text>
              </View>
            }
          />
        )}

        {/* Add Staff Modal */}
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
                        <Text style={styles.modalTitle}>Add New Staff</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <X color="#94a3b8" size={24} />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.formContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Jane Doe"
                            placeholderTextColor="#64748b"
                            value={newStaff.full_name}
                            onChangeText={(text) => setNewStaff({...newStaff, full_name: text})}
                        />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+1 234 567 8900"
                            placeholderTextColor="#64748b"
                            value={newStaff.phone_number}
                            onChangeText={(text) => setNewStaff({...newStaff, phone_number: text})}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.label}>Staff Type</Text>
                        <View style={styles.typeContainer}>
                            {['maid', 'driver', 'cook', 'gardener', 'other'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeButton,
                                        newStaff.staff_type === type && styles.typeButtonActive
                                    ]}
                                    onPress={() => setNewStaff({...newStaff, staff_type: type})}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        newStaff.staff_type === type && styles.typeButtonTextActive
                                    ]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity 
                            style={styles.submitButton}
                            onPress={handleAddStaff}
                            disabled={adding}
                        >
                            {adding ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Create Staff</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: SPACING.l,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: SPACING.m,
    gap: SPACING.m,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.m,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.l,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.xl,
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
    padding: SPACING.l,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
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
    marginBottom: SPACING.m,
    marginTop: SPACING.m,
  },
  input: {
    backgroundColor: '#334155',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    color: '#fff',
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.m,
    marginTop: SPACING.m,
  },
  typeButton: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    borderRadius: BORDER_RADIUS.l,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.l,
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)', // Darker background for Android fallback
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.m,
    backgroundColor: '#334155',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
    color: '#94a3b8',
  },
  moreButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: SPACING.m,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
