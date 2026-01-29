import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Save, User, Phone, Mail } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import { CustomAlert } from '../components/CustomAlert';
import Toast from 'react-native-toast-message';

export default function EditProfileScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    id: 0,
  });

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    onConfirm: () => {},
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', onConfirm?: () => void) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertVisible(false)),
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const user = await Storage.getUser();
      // Fetch latest from API to be sure
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.RESIDENT_PROFILE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
            full_name: data.full_name || '',
            email: data.email || '',
            phone_number: data.phone_number || '',
            id: data.id,
        });
      } else {
        // Fallback to local storage
        setFormData({
            full_name: user.full_name || '',
            email: user.email || '',
            phone_number: user.phone_number || '',
            id: user.id,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showAlert('Error', 'Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      showAlert('Error', 'Full Name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const token = await Storage.getToken();
      // Handle potential double slash
      const endpoint = ENDPOINTS.USERS.endsWith('/')
        ? `${ENDPOINTS.USERS}${formData.id}`
        : `${ENDPOINTS.USERS}/${formData.id}`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      await Storage.saveUser(updatedUser); // Update local storage

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your changes have been saved successfully.',
      });
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showAlert('Error', error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
             {saving ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Save color={COLORS.primary} size={24} />}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputContainer}>
                        <User color="#94a3b8" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={formData.full_name}
                            onChangeText={(text) => setFormData({...formData, full_name: text})}
                            placeholder="Enter your full name"
                            placeholderTextColor="#64748b"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address (Read Only)</Text>
                    <View style={[styles.inputContainer, styles.disabledInput]}>
                        <Mail color="#64748b" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: '#64748b' }]}
                            value={formData.email}
                            editable={false}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputContainer}>
                        <Phone color="#94a3b8" size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={formData.phone_number}
                            onChangeText={(text) => setFormData({...formData, phone_number: text})}
                            placeholder="Enter your phone number"
                            placeholderTextColor="#64748b"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>

        <CustomAlert 
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertVisible(false)}
          onConfirm={alertConfig.onConfirm}
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
  content: { padding: SPACING.lg },
  inputGroup: { marginBottom: SPACING.lg },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    height: 50,
    paddingHorizontal: SPACING.md,
  },
  disabledInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputIcon: { marginRight: SPACING.sm },
  input: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 16,
  },
});
