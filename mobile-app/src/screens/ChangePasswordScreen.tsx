import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';

export default function ChangePasswordScreen({ navigation, route }: any) {
  const { tenant, role: initialRole } = route.params || {};
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const Container = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'New passwords do not match',
      });
      return;
    }

    if (newPassword.length < 8) {
        Toast.show({
            type: 'error',
            text1: 'Weak Password',
            text2: 'Password must be at least 8 characters long',
        });
        return;
    }

    setLoading(true);
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to change password');
      }

      Toast.show({
        type: 'success',
        text1: 'Password Changed',
        text2: 'Your password has been updated successfully.',
      });

      // Navigate to dashboard
      const navigateToDashboard = (userRole: string) => {
          switch (userRole) {
            case 'admin':
              navigation.replace('AdminDashboard', { tenant });
              break;
            case 'guard':
              navigation.replace('GuardDashboard', { tenant });
              break;
            case 'resident':
            default:
              navigation.replace('ResidentDashboard', { tenant });
              break;
          }
      };

      if (initialRole) {
          navigateToDashboard(initialRole);
          return;
      }

      const profileResponse = await fetch(`${API_URL}${ENDPOINTS.RESIDENT_PROFILE}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          navigateToDashboard(profileData.role);
      } else {
           // Fallback
           navigation.replace('Login', { tenant });
      }

    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.headerContainer}>
                <View style={styles.iconWrapper}>
                    <Lock color="#fff" size={32} />
                </View>
                <Text style={styles.title}>Change Password</Text>
                <Text style={styles.subtitle}>
                    For your security, you must change your password before proceeding.
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Container {...containerProps} style={[styles.inputBlur, Platform.OS === 'android' && styles.androidCard]}>
                    <Lock color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Current Password"
                      placeholderTextColor={COLORS.textMuted}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry
                    />
                  </Container>
                </View>

                <View style={styles.inputContainer}>
                  <Container {...containerProps} style={[styles.inputBlur, Platform.OS === 'android' && styles.androidCard]}>
                    <CheckCircle color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="New Password"
                      placeholderTextColor={COLORS.textMuted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                  </Container>
                </View>

                <View style={styles.inputContainer}>
                  <Container {...containerProps} style={[styles.inputBlur, Platform.OS === 'android' && styles.androidCard]}>
                    <CheckCircle color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm New Password"
                      placeholderTextColor={COLORS.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </Container>
                </View>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleChangePassword}
                  disabled={loading}
                  style={styles.submitButtonContainer}
                >
                  <LinearGradient
                    colors={['#06b6d4', '#2563eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.submitButtonText}>Update Password</Text>
                        <ArrowRight color="#fff" size={20} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.xl,
  },
  headerContainer: {
      alignItems: 'center',
      marginBottom: SPACING.xl * 2,
  },
  iconWrapper: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.l,
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: SPACING.s,
  },
  subtitle: {
      fontSize: 14,
      color: COLORS.textSecondary,
      textAlign: 'center',
      paddingHorizontal: SPACING.l,
  },
  formContainer: {
      width: '100%',
  },
  inputContainer: {
    marginBottom: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    overflow: 'hidden',
  },
  inputBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  inputIcon: {
    marginRight: SPACING.m,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  submitButtonContainer: {
    borderRadius: BORDER_RADIUS.m,
    overflow: 'hidden',
    marginTop: SPACING.m,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.m,
    gap: SPACING.s,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
