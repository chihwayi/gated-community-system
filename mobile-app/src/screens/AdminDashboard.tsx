import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  Alert,
  Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Storage } from '../utils/storage';
import { API_URL, ENDPOINTS } from '../config/api';
import { scheduleLocalNotification, registerForPushNotificationsAsync, updateUserPushToken } from '../utils/notifications';
import { webSocketService } from '../services/WebSocketService';
import {
  AlertTriangle,
  Users,
  FileText,
  CheckCircle,
  Radio,
  Shield,
  Activity,
  Menu,
  Bell,
  Search,
  ChevronRight,
  DollarSign,
  Package,
  Car,
  Vote,
  LifeBuoy,
  Wrench,
  Umbrella,
  Folder,
  Briefcase,
  LayoutGrid,
  ShoppingBag
} from 'lucide-react-native';
import { SPACING } from '../constants/theme';
import { getImageUrl } from '../utils/image';

const { width } = Dimensions.get('window');

const METRICS = [
  { id: '1', label: 'Visitors', value: '24', sub: '8 Active', icon: Users, color: '#3b82f6' },
  { id: '2', label: 'Pending Bills', value: '$12.5k', sub: '15 overdue', icon: FileText, color: '#f59e0b' },
  { id: '3', label: 'Open Incidents', value: '3', sub: '1 Critical', icon: AlertTriangle, color: '#ef4444' },
  { id: '4', label: 'Tickets', value: '5', sub: '2 New', icon: LifeBuoy, color: '#10b981' },
];

const MODULES = [
  { id: 'residents', title: 'Residents', icon: Users, color: '#3b82f6', route: 'Residents' },
  { id: 'vehicles', title: 'Vehicles', icon: Car, color: '#8b5cf6', route: 'Vehicles' },
  { id: 'parcels', title: 'Parcels', icon: Package, color: '#f59e0b', route: 'Parcels' },
  { id: 'financials', title: 'Financials', icon: DollarSign, color: '#10b981', route: 'FinancialDashboard', params: { mode: 'admin' } },
  { id: 'security', title: 'Security', icon: Shield, color: '#ef4444', route: 'SecurityMonitor' },
  { id: 'broadcast', title: 'Notices', icon: Bell, color: '#f97316', route: 'Broadcast' },
  { id: 'incidents', title: 'Incidents', icon: AlertTriangle, color: '#dc2626', route: 'Incidents' },
  { id: 'visitors', title: 'Visitors', icon: CheckCircle, color: '#6366f1', route: 'Visitors' },
  { id: 'tickets', title: 'Tickets', icon: Wrench, color: '#0ea5e9', route: 'ServiceRequest', params: { mode: 'admin' } },
  { id: 'amenities', title: 'Amenities', icon: Umbrella, color: '#14b8a6', route: 'Amenities' },
  { id: 'documents', title: 'Documents', icon: Folder, color: '#8b5cf6', route: 'Documents' },
  { id: 'staff', title: 'Staff', icon: Briefcase, color: '#64748b', route: 'Staff' },
  { id: 'marketplace', title: 'Market', icon: ShoppingBag, color: '#f59e0b', route: 'Marketplace' },
  { id: 'community', title: 'Polls', icon: Vote, color: '#f43f5e', route: 'Community', params: { mode: 'admin' } },
];

export default function AdminDashboard({ navigation }: any) {
  const [panicActive, setPanicActive] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const panicRef = useRef(false);

  useEffect(() => {
    loadTenant();
    setupNotifications();
    
    // Connect to WebSocket
    webSocketService.connect();
    
    // Listen for panic alerts
    const unsubscribe = webSocketService.addListener((data) => {
      if (data.type === 'panic_alert') {
        handlePanicAlert(data.incident);
      }
    });

    return () => {
      unsubscribe();
      webSocketService.disconnect();
      Vibration.cancel();
    };
  }, []);

  const handlePanicAlert = (incident: any) => {
    // Vibrate heavily (SOS pattern: ... --- ...)
    // Android: [wait, vibrate, wait, vibrate...]
    // iOS: Ignores pattern duration but vibrates. 
    // We set repeat=true to loop until acknowledged.
    const PATTERN = [0, 500, 200, 500, 200, 500, 500, 1000, 500, 1000, 500, 1000, 200, 500, 200, 500, 200, 500];
    Vibration.vibrate(PATTERN, true);
    
    setPanicActive(true);

    Alert.alert(
      '🚨 PANIC ALERT 🚨',
      `SOS from ${incident.reporter_name}\nLocation: ${incident.location || 'Unknown'}\n\n${incident.description}`,
      [
        {
          text: 'ACKNOWLEDGE',
          onPress: () => {
            Vibration.cancel();
            setPanicActive(false);
            navigation.navigate('Incidents');
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

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

  const loadTenant = async () => {
    const t = await Storage.getTenant();
    setTenant(t);
  };

  return (
    <View style={styles.container}>
      {/* Dark Background */}
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Community Logo Placeholder */}
              <View style={styles.logoContainer}>
                {tenant?.logo_url ? (
                  <Image source={{ uri: getImageUrl(tenant.logo_url) }} style={styles.communityLogo} />
                ) : (
                  <Text style={styles.logoText}>{tenant?.slug?.substring(0,2).toUpperCase() || 'GC'}</Text>
                )}
              </View>
              <View>
                <Text style={styles.headerTitle}>Estate Manager</Text>
                <Text style={styles.headerSubtitle}>Admin Dashboard</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.navigate('Settings')}>
                <Text style={styles.profileInitials}>AD</Text>
            </TouchableOpacity>
          </View>


          {/* Critical Alert Banner */}
          {panicActive && (
            <LinearGradient
                colors={['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.2)']}
                style={styles.alertBanner}
            >
                <View style={styles.alertContent}>
                    <View style={styles.alertIconContainer}>
                        <AlertTriangle color="#fff" size={24} />
                    </View>
                    <View style={styles.alertTextContainer}>
                        <View style={styles.alertHeader}>
                            <View style={styles.alertBadge}>
                                <Text style={styles.alertBadgeText}>EMERGENCY ALERT</Text>
                            </View>
                            <Text style={styles.alertTime}>2 MIN AGO</Text>
                        </View>
                        <Text style={styles.alertTitle}>Panic Button Activated - House #89</Text>
                        <Text style={styles.alertSubtitle}>Resident: Sarah Williams • Response team notified</Text>
                    </View>
                </View>
                <View style={styles.alertActions}>
                    <TouchableOpacity style={styles.respondBtn}>
                        <Text style={styles.respondBtnText}>RESPOND NOW</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dismissBtn} onPress={() => setPanicActive(false)}>
                        <Text style={styles.dismissBtnText}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
          )}

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {METRICS.map((metric) => (
                <View key={metric.id} style={styles.metricCard}>
                    <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
                        <metric.icon color={metric.color} size={20} />
                    </View>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricSub}>{metric.sub}</Text>
                </View>
            ))}
          </View>

          {/* Modules Grid */}
          <Text style={styles.sectionTitle}>Management Modules</Text>
          <View style={styles.actionsGrid}>
            {MODULES.map((module) => {
              const Container = Platform.OS === 'ios' ? BlurView : View;
              const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

              return (
                <TouchableOpacity 
                  key={module.id} 
                  style={styles.actionCard}
                  onPress={() => {
                    if (module.params) {
                      navigation.navigate(module.route, module.params);
                    } else {
                      navigation.navigate(module.route);
                    }
                  }}
                >
                    <Container 
                      {...containerProps} 
                      style={[styles.actionBlur, Platform.OS === 'android' && styles.androidCard]}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: module.color + '20' }]}>
                            <module.icon color={module.color} size={24} />
                        </View>
                        <Text style={styles.actionTitle}>{module.title}</Text>
                    </Container>
                </TouchableOpacity>
              );
            })}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
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
    alignItems: 'center',
    marginBottom: SPACING.l,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  communityLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#22d3ee', // Cyan-400
    letterSpacing: 1,
    textShadowColor: 'rgba(34, 211, 238, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    color: '#94a3b8', // Slate 400
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#67e8f9', // Cyan-300
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#0891b2', // Cyan-600
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  profileInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Alert Banner
  alertBanner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: SPACING.l,
    borderWidth: 2,
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  alertContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertBadge: {
    backgroundColor: '#ef4444', // Red-500 gradient simulation
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertTime: {
    color: '#fca5a5', // Red-300
    fontSize: 10,
  },
  alertTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  alertSubtitle: {
    color: '#fecaca', // Red-200
    fontSize: 12,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  respondBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  respondBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  dismissBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  dismissBtnText: {
    color: '#fff',
    fontSize: 14,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: SPACING.l,
  },
  metricCard: {
    width: (width - SPACING.l * 2 - 12) / 2,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    borderRadius: 20,
    padding: 16,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#a5f3fc', // Cyan-200
    fontSize: 14,
    fontWeight: '500',
  },
  metricSub: {
    color: '#67e8f9', // Cyan-400
    fontSize: 10,
    marginTop: 2,
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.m,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: SPACING.l,
  },
  actionCard: {
    width: (width - SPACING.l * 2 - 12) / 2,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  actionBlur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
