import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Image,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Users, Mail, Phone, Shield, Plus, X } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import Toast from 'react-native-toast-message';
import { CustomAlert } from '../components/CustomAlert';

export default function FamilyScreen({ navigation, route }: any) {
  const { targetUser } = route.params || {};
  
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Add Member Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newMember, setNewMember] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
  });
  const [adding, setAdding] = useState(false);

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
    fetchHousehold();
  }, [targetUser]);

  const fetchHousehold = async () => {
    try {
      const token = await Storage.getToken();
      const user = await Storage.getUser();
      setCurrentUser(user);

      // Determine whose household to fetch
      // If targetUser is provided (Admin viewing resident), we might need a specific endpoint or query
      // However, the current backend might only support "my household" via /users/household
      // OR we can list users with the same address/tenant_id if we are admin.
      
      // If we are admin and targetUser is set, we should probably search users by address/tenant_id
      // But let's check if there is a specific endpoint. 
      // If not, we can use the general GET /users endpoint with filtering if the backend supports it.
      // Based on ResidentsScreen, we can fetch all residents.
      
      let url = '';
      if (targetUser) {
        // If we are admin viewing a specific user's household
        // We can filter users by tenant_id and potentially match the address
        // But the backend might not have a direct "get household of user X" endpoint.
        // Let's try to query users with the same house_address if possible, or just use the generic list and filter client side (not ideal but works for small lists)
        // OR: If the backend has `GET /users?house_address=...`
        
        // For now, let's assume we can fetch all residents and filter by address on client side if no better endpoint exists.
        // Wait, ResidentsScreen fetches `GET /users?role=resident`.
        
        // Let's try to fetch all residents and filter by the target user's address.
        url = `${API_URL}${ENDPOINTS.USERS}?role=resident`;
      } else {
        // Default behavior: fetch my household
        const endpoint = ENDPOINTS.USERS.endsWith('/') 
            ? `${ENDPOINTS.USERS}household` 
            : `${ENDPOINTS.USERS}/household`;
        url = `${API_URL}${endpoint}`;
      }
        
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch household members');
      }

      const data = await response.json();
      
      if (targetUser) {
          // Filter by address and tenant_id
          const householdMembers = data.filter((u: any) => 
              u.house_address === targetUser.house_address && 
              u.tenant_id === targetUser.tenant_id
          );
          setMembers(householdMembers);
      } else {
          setMembers(data);
      }
      
    } catch (error) {
      console.error('Error fetching household:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load household members',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.full_name || !newMember.email || !newMember.password) {
        showAlert('Error', 'Please fill all required fields', 'error');
        return;
    }

    const addressToUse = targetUser ? targetUser.house_address : currentUser?.house_address;
    const tenantIdToUse = targetUser ? targetUser.tenant_id : currentUser?.tenant_id;

    if (!addressToUse) {
        showAlert('Error', 'No house address associated with this account.', 'error');
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
                ...newMember,
                house_address: addressToUse,
                role: 'family_member',
                tenant_id: tenantIdToUse
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create member');
        }

        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Family member added successfully',
        });
        
        setModalVisible(false);
        setNewMember({
            full_name: '',
            email: '',
            phone_number: '',
            password: '',
        });
        fetchHousehold();
    } catch (error: any) {
        showAlert('Error', error.message, 'error');
    } finally {
        setAdding(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};
    const isMe = currentUser?.id === item.id;

    return (
      <Container {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard, isMe && styles.myCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
             <Text style={styles.avatarText}>
                {item.full_name?.substring(0, 2).toUpperCase() || 'US'}
             </Text>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.name}>{item.full_name}</Text>
                {isMe && (
                    <View style={styles.meBadge}>
                        <Text style={styles.meBadgeText}>You</Text>
                    </View>
                )}
            </View>
            <Text style={styles.role}>{item.role}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Mail size={14} color="#94a3b8" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
          {item.phone_number && (
            <View style={styles.detailRow}>
                <Phone size={14} color="#94a3b8" />
                <Text style={styles.detailText}>{item.phone_number}</Text>
            </View>
          )}
        </View>
      </Container>
    );
  };

  const canAddMembers = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

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
          <Text style={styles.headerTitle}>
            {targetUser ? `${targetUser.full_name}'s Household` : 'Household Members'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={members}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
                canAddMembers ? (
                    <TouchableOpacity 
                        style={[styles.card, styles.addCard]}
                        onPress={() => setModalVisible(true)}
                    >
                        <View style={styles.addCardContent}>
                            <View style={styles.addIconContainer}>
                                <Plus size={24} color="#6366f1" />
                            </View>
                            <Text style={styles.addCardTitle}>Add Family Member</Text>
                            <Text style={styles.addCardText}>
                                Add a new member to {targetUser ? "this" : "your"} household.
                            </Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={[styles.card, styles.addCard]}
                        onPress={() => {
                            Toast.show({
                                type: 'info',
                                text1: 'Add Family Member',
                                text2: 'Please contact administration to add new members.',
                                visibilityTime: 4000,
                            });
                        }}
                    >
                        <View style={styles.addCardContent}>
                            <View style={styles.addIconContainer}>
                                <Users size={24} color="#6366f1" />
                            </View>
                            <Text style={styles.addCardTitle}>Add Family Member</Text>
                            <Text style={styles.addCardText}>
                                Contact administration to add new household members to this address.
                            </Text>
                        </View>
                    </TouchableOpacity>
                )
            }
          />
        )}

        {/* Add Member Modal */}
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
                        <Text style={styles.modalTitle}>Add Family Member</Text>
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
                            value={newMember.full_name}
                            onChangeText={(text) => setNewMember({...newMember, full_name: text})}
                        />

                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="john@example.com"
                            placeholderTextColor="#64748b"
                            value={newMember.email}
                            onChangeText={(text) => setNewMember({...newMember, email: text})}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+1 234 567 8900"
                            placeholderTextColor="#64748b"
                            value={newMember.phone_number}
                            onChangeText={(text) => setNewMember({...newMember, phone_number: text})}
                            keyboardType="phone-pad"
                        />
                        
                        <Text style={styles.label}>Temporary Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter password"
                            placeholderTextColor="#64748b"
                            value={newMember.password}
                            onChangeText={(text) => setNewMember({...newMember, password: text})}
                            secureTextEntry
                        />

                        <TouchableOpacity 
                            style={styles.submitButton}
                            onPress={handleAddMember}
                            disabled={adding}
                        >
                            {adding ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Add Member</Text>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1f5f9' },
  listContainer: { padding: SPACING.lg },
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
  myCard: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  avatarText: {
    color: '#a78bfa',
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  role: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  meBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  meBadgeText: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.md,
  },
  detailsContainer: {
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  addCard: {
    borderStyle: 'dashed',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  addCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  addIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  addCardTitle: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  addCardText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 200,
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
