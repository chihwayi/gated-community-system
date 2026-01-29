import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import QRCode from 'react-native-qrcode-svg';
import { ChevronLeft, Share2, Copy } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';
import { Storage } from '../utils/storage';
import { API_URL, ENDPOINTS } from '../config/api';

const { width } = Dimensions.get('window');

export default function MyQRCodeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await Storage.getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}${ENDPOINTS.RESIDENT_PROFILE}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (e) {
      console.error(e);
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

  // Fallback data if API fails or user is incomplete
  const qrData = JSON.stringify({
    id: user?.id || 'unknown',
    type: 'resident',
    timestamp: Date.now()
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Digital Pass</Text>
            <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
            <View style={styles.cardContainer}>
                <LinearGradient
                    colors={['#4f46e5', '#7c3aed']}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardLabel}>RESIDENT PASS</Text>
                            <Text style={styles.cardName}>{user?.full_name || 'Resident'}</Text>
                        </View>
                        <View style={styles.houseBadge}>
                            <Text style={styles.houseText}>#{user?.house_address || '00'}</Text>
                        </View>
                    </View>

                    <View style={styles.qrContainer}>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={qrData}
                                size={200}
                                color="black"
                                backgroundColor="white"
                            />
                        </View>
                    </View>

                    <Text style={styles.expiryText}>Auto-renews daily • Valid for Entry</Text>
                </LinearGradient>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn}>
                    <Share2 color="#fff" size={20} />
                    <Text style={styles.actionText}>Share Pass</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.copyBtn]}>
                    <Copy color="#fff" size={20} />
                    <Text style={styles.actionText}>Copy Link</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.note}>
                Show this QR code at the gate scanner for automated entry.
            </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.l,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: SPACING.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: '100%',
    aspectRatio: 0.65,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    elevation: 10,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  cardGradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  houseBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  houseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    alignSelf: 'center',
  },
  qrWrapper: {
    overflow: 'hidden',
  },
  expiryText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  copyBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  note: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
    maxWidth: 260,
  },
});
