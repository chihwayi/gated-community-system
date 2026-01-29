import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronLeft, 
  LogOut, 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Moon,
  ChevronRight
} from 'lucide-react-native';
import { Storage } from '../utils/storage';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import Toast from 'react-native-toast-message';

export default function SettingsScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await Storage.getUser();
    setUser(userData);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await Storage.clearAll();
            Toast.show({
              type: 'success',
              text1: 'Logged Out',
              text2: 'See you soon!',
            });
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const renderSettingItem = (icon: any, label: string, onPress: () => void, value?: string) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <ChevronRight size={20} color="#64748b" />
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.full_name?.substring(0, 2).toUpperCase() || 'US'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.full_name || 'User Name'}</Text>
            <Text style={styles.userRole}>{user?.role || 'Role'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          </View>

          {/* Settings Groups */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Preferences</Text>
            <View style={styles.sectionContent}>
              {renderSettingItem(<Bell size={20} color="#3b82f6" />, "Notifications", () => {})}
              {renderSettingItem(<Moon size={20} color="#8b5cf6" />, "Appearance", () => {}, "Dark")}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Security</Text>
            <View style={styles.sectionContent}>
              {renderSettingItem(<Shield size={20} color="#10b981" />, "Password & Security", () => {})}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Account</Text>
            <View style={styles.sectionContent}>
              {renderSettingItem(<User size={20} color="#3b82f6" />, "Edit Profile", () => {
                 Toast.show({
                   type: 'info',
                   text1: 'Coming Soon',
                   text2: 'Profile editing will be available shortly.',
                 });
              })}
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={20} color="#ef4444" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  content: {
    padding: SPACING.l,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.m,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: SPACING.s,
    marginLeft: SPACING.xs,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: BORDER_RADIUS.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.m,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  settingValue: {
    fontSize: 14,
    color: '#94a3b8',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.m,
    gap: SPACING.s,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
