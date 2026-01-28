import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import { getImageUrl } from '../utils/image';

const { width } = Dimensions.get('window');

export default function LoginScreen({ route, navigation }: any) {
  const { tenant } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter both email and password',
      });
      return;
    }

    setLoading(true);
    try {
      // Use standard OAuth2 password flow with x-www-form-urlencoded
      const response = await fetch(`${API_URL}${ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      if (data.mfa_required) {
        setTempToken(data.temp_token);
        setIsMfaStep(true);
        setLoading(false);
        return;
      }
      
      await processLoginSuccess(data.access_token);

    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Please check your credentials and try again.',
      });
      setLoading(false);
    }
  };

  const handleMfaVerify = async () => {
    if (!otp || otp.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter a valid 6-digit code',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/mfa/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temp_token: tempToken,
          token: otp
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'MFA verification failed');
      }

      const data = await response.json();
      await processLoginSuccess(data.access_token);

    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message || 'Please check your code and try again.',
      });
      setLoading(false);
    }
  };

  const processLoginSuccess = async (token: string) => {
    try {
      // Save token
      await Storage.saveToken(token);

      // Fetch user profile to get role
      const profileResponse = await fetch(`${API_URL}${ENDPOINTS.RESIDENT_PROFILE}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await profileResponse.json();
      const role = profileData.role;

      // Navigate based on role
      switch (role) {
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
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Profile Error',
        text2: 'Failed to load user profile.',
      });
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isMfaStep) {
      setIsMfaStep(false);
      setOtp('');
      setTempToken(null);
      return;
    }
    // In a real scenario, we might want to allow clearing the persistent tenant selection here
    // For now, just go back
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft color={COLORS.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.logoContainer}>
              {tenant?.logo_url ? (
                <Image source={{ uri: getImageUrl(tenant.logo_url) }} style={styles.logo} />
              ) : (
                <View style={styles.placeholderLogo}>
                  <Text style={styles.placeholderLogoText}>
                    {tenant?.name?.substring(0, 2).toUpperCase() || 'GC'}
                  </Text>
                </View>
              )}
              <Text style={styles.tenantName}>{tenant?.name || 'Gated Community'}</Text>
              <Text style={styles.welcomeText}>
                {isMfaStep ? 'Security Check' : 'Welcome Back'}
              </Text>
              {isMfaStep && (
                <Text style={styles.subtitleText}>
                  Enter the code from your authenticator app
                </Text>
              )}
            </View>

            <View style={styles.formContainer}>
              {isMfaStep ? (
                <View style={styles.inputContainer}>
                  <BlurView intensity={20} tint="dark" style={styles.inputBlur}>
                    <ShieldCheck color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor={COLORS.textMuted}
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
                  </BlurView>
                </View>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <BlurView intensity={20} tint="dark" style={styles.inputBlur}>
                      <Mail color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor={COLORS.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </BlurView>
                  </View>

                  <View style={styles.inputContainer}>
                    <BlurView intensity={20} tint="dark" style={styles.inputBlur}>
                      <Lock color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={COLORS.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                      />
                    </BlurView>
                  </View>

                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={isMfaStep ? handleMfaVerify : handleLogin}
                disabled={loading}
                style={styles.loginButtonContainer}
              >
                <LinearGradient
                  colors={COLORS.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>
                        {isMfaStep ? 'Verify Code' : 'Sign In'}
                      </Text>
                      <ArrowRight color="#fff" size={20} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
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
  header: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.l,
    justifyContent: 'center',
    paddingBottom: SPACING.xxl * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.l,
    marginBottom: SPACING.m,
  },
  placeholderLogo: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.l,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.m,
  },
  placeholderLogoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  tenantName: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: SPACING.s,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: SPACING.s,
    textAlign: 'center',
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
  inputIcon: {
    marginRight: SPACING.m,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButtonContainer: {
    borderRadius: BORDER_RADIUS.m,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.m,
    gap: SPACING.s,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
