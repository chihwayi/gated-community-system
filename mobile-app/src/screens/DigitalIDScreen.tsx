import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
  Image,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import QRCode from 'react-native-qrcode-svg';
import { ChevronLeft, ShieldCheck, User, MapPin } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Storage } from '../utils/storage';
import { getImageUrl } from '../utils/image';

const { width } = Dimensions.get('window');

export default function DigitalIDScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await Storage.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // QR Payload
  const qrData = JSON.stringify({
    type: 'digital_id',
    userId: user?.id,
    tenantId: user?.tenant_id,
    role: user?.role,
    timestamp: Date.now() // Prevent replay attacks if checked strictly
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.secondary, COLORS.primary]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Digital ID</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.idCardContainer}>
            <BlurView intensity={20} tint="light" style={styles.idCard}>
              {/* ID Header */}
              <View style={styles.cardHeader}>
                <View style={styles.logoContainer}>
                  <ShieldCheck color={COLORS.primary} size={24} />
                </View>
                <View>
                  <Text style={styles.communityName}>Gated Community</Text>
                  <Text style={styles.cardLabel}>Resident Identity Card</Text>
                </View>
              </View>

              {/* Photo & Details */}
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                   {user?.profile_picture ? (
                      <Image source={{ uri: getImageUrl(user.profile_picture) }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.placeholderAvatar]}>
                        <Text style={styles.avatarText}>
                          {user?.full_name?.charAt(0) || 'U'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.activeBadge} />
                </View>
                
                <Text style={styles.userName}>{user?.full_name || 'Resident Name'}</Text>
                <Text style={styles.userRole}>{user?.role?.replace('_', ' ').toUpperCase()}</Text>
                
                <View style={styles.infoRow}>
                    <MapPin size={14} color={COLORS.textSecondary} />
                    <Text style={styles.infoText}>{user?.house_address || 'No Address'}</Text>
                </View>
              </View>

              {/* QR Code */}
              <View style={styles.qrSection}>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={qrData}
                    size={180}
                    color="#000"
                    backgroundColor="#fff"
                  />
                </View>
                <Text style={styles.qrHint}>Scan at Guard House</Text>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>ID: #{user?.id?.toString().padStart(6, '0')}</Text>
                <Text style={styles.footerText}>Valid</Text>
              </View>
            </BlurView>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  idCardContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  idCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  communityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  placeholderAvatar: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  activeBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  qrWrapper: {
    padding: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: SPACING.sm,
  },
  qrHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: SPACING.md,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  }
});
