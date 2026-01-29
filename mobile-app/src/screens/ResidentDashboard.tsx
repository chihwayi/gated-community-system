import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Bell,
  Users,
  Wallet,
  AlertCircle,
  ShieldAlert,
  Key,
  CreditCard,
  Wrench,
  MessageSquare,
  LogOut,
  FileText,
  ShoppingBag,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import Toast from 'react-native-toast-message';
import { registerForPushNotificationsAsync, updateUserPushToken, simulatePanicNotification } from '../utils/notifications';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { id: '1', title: 'Gate Access', icon: Key, color: '#10b981' }, // Emerald
  { id: '2', title: 'Payments', icon: CreditCard, color: '#f59e0b' }, // Amber
  { id: '3', title: 'Service', icon: Wrench, color: '#3b82f6' }, // Blue
  { id: '4', title: 'Community', icon: Users, color: '#8b5cf6' }, // Violet
  { id: '5', title: 'Marketplace', icon: ShoppingBag, color: '#f43f5e' }, // Rose
];

export default function ResidentDashboard({ route, navigation }: any) {
  const { tenant } = route.params || {};
  const [user, setUser] = useState<any>(null);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pulse Animation for Panic Button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handlePanic = () => {
    Alert.alert(
      'Confirm Emergency',
      'Are you sure you want to trigger the panic alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'YES, HELP!', 
          style: 'destructive',
          onPress: async () => {
             try {
               const token = await Storage.getToken();
               const response = await fetch(`${API_URL}${ENDPOINTS.SOS}`, {
                 method: 'POST',
                 headers: {
                   'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json',
                 },
               });

               if (!response.ok) {
                 throw new Error('Failed to trigger SOS');
               }

               // Simulate Push Notification for local user (since Expo Go Android doesn't support remote push)
               await simulatePanicNotification();

               Toast.show({
                  type: 'error',
                  text1: 'EMERGENCY ALERT SENT',
                  text2: 'Security and Response Team have been notified.',
                  visibilityTime: 6000,
               });
             } catch (error) {
               console.error('SOS Error:', error);
               Toast.show({
                 type: 'error',
                 text1: 'Connection Error',
                 text2: 'Could not trigger digital alarm. Call 911/Emergency services immediately!',
                 visibilityTime: 10000,
               });
             }
          }
        }
      ]
    );
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    fetchData();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await updateUserPushToken(token);
      }
    } catch (error) {
      console.log('Error setting up notifications:', error);
    }
  };

  const fetchData = async () => {
    try {
      const token = await Storage.getToken();
      if (!token) {
        navigation.replace('Login', { tenant });
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch User Profile
      const userRes = await fetch(`${API_URL}${ENDPOINTS.RESIDENT_PROFILE}`, { headers });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      } else if (userRes.status === 401) {
        handleLogout();
        return;
      }

      // Fetch Recent Visitors
      const visitorsRes = await fetch(`${API_URL}${ENDPOINTS.MY_VISITORS}?limit=5`, { headers });
      if (visitorsRes.ok) {
        const visitorsData = await visitorsRes.json();
        setVisitors(visitorsData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await Storage.removeToken();
    navigation.replace('Login', { tenant });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const Container = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome Home</Text>
              <View style={styles.houseTag}>
                <View style={styles.statusDot} />
                <Text style={styles.houseText}>
                  {user?.house_address ? `House #${user.house_address}` : 'Unit Not Assigned'}
                </Text>
              </View>
            </View>
            <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
                    <Container {...containerProps} style={[styles.blurBtn, Platform.OS === 'android' && styles.androidCard]}>
                        <LogOut color="#fff" size={20} />
                    </Container>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconButton, { marginLeft: 8 }]}>
                    <Container {...containerProps} style={[styles.blurBtn, Platform.OS === 'android' && styles.androidCard]}>
                        <Bell color="#fff" size={20} />
                        <View style={styles.notificationDot} />
                    </Container>
                </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <Container {...containerProps} style={[styles.statsCard, Platform.OS === 'android' && styles.androidCard]}>
                <Users color="#60a5fa" size={24} style={styles.statsIcon} />
                <Text style={styles.statsValue}>{visitors.length}</Text>
                <Text style={styles.statsLabel}>Visitors</Text>
            </Container>
            <Container {...containerProps} style={[styles.statsCard, Platform.OS === 'android' && styles.androidCard]}>
                <Wallet color="#34d399" size={24} style={styles.statsIcon} />
                <Text style={styles.statsValue}>$0</Text>
                <Text style={styles.statsLabel}>Balance</Text>
            </Container>
            <Container {...containerProps} style={[styles.statsCard, Platform.OS === 'android' && styles.androidCard]}>
                <FileText color="#c084fc" size={24} style={styles.statsIcon} />
                <Text style={styles.statsValue}>2</Text>
                <Text style={styles.statsLabel}>Notices</Text>
            </Container>
          </View>

          {/* Emergency Panic Button Card */}
          <View style={styles.panicCardContainer}>
             <LinearGradient
                colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
                style={styles.panicCard}
             >
                <View style={styles.panicHeader}>
                    <Text style={styles.panicTitle}>Emergency Alert</Text>
                    <AlertCircle color="#ef4444" size={20} />
                </View>
                <Text style={styles.panicDescription}>
                    Tap in case of emergency. Security and response team will be notified immediately.
                </Text>

                <TouchableOpacity style={styles.panicBtnWrapper} activeOpacity={0.8} onPress={handlePanic}>
                    <Animated.View style={[styles.panicBtnOuter, { transform: [{ scale: pulseAnim }] }]}>
                        <LinearGradient
                            colors={['#ef4444', '#dc2626']}
                            style={styles.panicBtnInner}
                        >
                            <ShieldAlert color="#fff" size={48} />
                            <Text style={styles.panicBtnText}>PANIC</Text>
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
             </LinearGradient>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                style={styles.actionCard}
                onPress={() => {
                  if (action.id === '1') navigation.navigate('MyQRCode');
                  if (action.id === '2') navigation.navigate('VisitorRegistration');
                  if (action.id === '3') navigation.navigate('FinancialDashboard', { mode: 'resident' });
                  if (action.id === '4') navigation.navigate('ServiceRequest');
                }}
              >
                <BlurView intensity={20} tint="dark" style={styles.actionBlur}>
                  <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
                    <action.icon color={action.color} size={24} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Visitors */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Visitors</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {visitors.length > 0 ? (
            visitors.map((visitor) => (
              <View key={visitor.id} style={styles.visitorCard}>
                <BlurView intensity={10} tint="dark" style={styles.visitorBlur}>
                  <View style={styles.visitorInfo}>
                    <View style={[styles.visitorIcon, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                      <Users color={COLORS.textSecondary} size={20} />
                    </View>
                    <View>
                      <Text style={styles.visitorName}>{visitor.full_name}</Text>
                      <Text style={styles.visitorType}>{visitor.visitor_type}</Text>
                    </View>
                  </View>
                  <View style={[
                      styles.statusBadge, 
                      visitor.status === 'checked_in' ? styles.statusActive : 
                      visitor.status === 'expected' ? styles.statusPending : styles.statusInactive
                  ]}>
                      <Text style={[
                          styles.statusText,
                          visitor.status === 'checked_in' ? styles.textActive : 
                          visitor.status === 'expected' ? styles.textPending : styles.textInactive
                      ]}>
                          {visitor.status?.replace('_', ' ').toUpperCase()}
                      </Text>
                  </View>
                </BlurView>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No recent visitors</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
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
  scrollContent: {
    padding: SPACING.l,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.l,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  houseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
    marginRight: 8,
  },
  houseText: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'System', // Or monospace if available
  },
  headerButtons: {
      flexDirection: 'row',
  },
  iconButton: {
      width: 44,
      height: 44,
      borderRadius: 16,
      overflow: 'hidden',
  },
  blurBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  notificationDot: {
      position: 'absolute',
      top: 10,
      right: 12,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#ef4444',
      borderWidth: 1.5,
      borderColor: '#1e293b',
  },
  
  // Stats Grid
  statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: SPACING.l,
  },
  statsCard: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  statsIcon: {
      marginBottom: 8,
  },
  statsValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 4,
  },
  statsLabel: {
      fontSize: 12,
      color: '#94a3b8',
  },

  // Panic Card
  panicCardContainer: {
      marginBottom: SPACING.l,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  panicCard: {
      padding: 24,
  },
  panicHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  panicTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
  },
  panicDescription: {
      fontSize: 14,
      color: '#94a3b8',
      marginBottom: 24,
      lineHeight: 20,
  },
  panicBtnWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
  },
  panicBtnOuter: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  panicBtnInner: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#ef4444',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 10,
  },
  panicBtnText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: SPACING.m,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.m,
    marginBottom: SPACING.l,
  },
  actionCard: {
    width: (width - SPACING.l * 2 - SPACING.m) / 2,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionBlur: {
    flex: 1,
    padding: SPACING.m,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
  },
  visitorCard: {
    marginBottom: SPACING.s,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  visitorBlur: {
    padding: SPACING.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  visitorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  visitorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitorName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  visitorType: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
  },
  statusActive: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusPending: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusInactive: {
      backgroundColor: 'rgba(148, 163, 184, 0.15)',
      borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  statusText: {
      fontSize: 10,
      fontWeight: 'bold',
  },
  textActive: { color: '#10b981' },
  textPending: { color: '#f59e0b' },
  textInactive: { color: '#94a3b8' },
  
  emptyState: {
      padding: 20,
      alignItems: 'center',
  },
  emptyStateText: {
      color: COLORS.textSecondary,
  },
});
