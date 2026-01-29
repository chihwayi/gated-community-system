import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, FlatList, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import QRCode from 'react-native-qrcode-svg';
import { ChevronLeft, Users } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';
import { Storage } from '../utils/storage';
import { API_URL, ENDPOINTS } from '../config/api';

const { width } = Dimensions.get('window');

export default function MyQRCodeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [household, setHousehold] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await Storage.getToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Profile
      const profileRes = await fetch(`${API_URL}${ENDPOINTS.RESIDENT_PROFILE}`, { headers });
      let userData = null;
      if (profileRes.ok) {
        userData = await profileRes.json();
        setUser(userData);
      }

      // Fetch Household
      const householdRes = await fetch(`${API_URL}${ENDPOINTS.HOUSEHOLD}`, { headers });
      if (householdRes.ok) {
        const householdData = await householdRes.json();
        // Filter out self if returned
        setHousehold(householdData.filter((m: any) => m.id !== userData?.id));
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const allPasses = user ? [user, ...household] : [];

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentIndex(Math.round(index));
  };

  const renderCard = ({ item }: any) => {
    const qrData = JSON.stringify({
      id: item?.id || 'unknown',
      type: 'resident',
      timestamp: Date.now()
    });

    return (
      <View style={{ width: width - SPACING.l * 2, alignItems: 'center' }}>
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={item.id === user?.id ? ['#4f46e5', '#7c3aed'] : ['#059669', '#10b981']}
                style={styles.cardGradient}
            >
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardLabel}>RESIDENT PASS</Text>
                        <Text style={styles.cardName}>{item?.full_name || 'Resident'}</Text>
                        {item?.id !== user?.id && (
                          <Text style={styles.relationText}>Family Member</Text>
                        )}
                    </View>
                    <View style={styles.houseBadge}>
                        <Text style={styles.houseText}>#{item?.house_address || user?.house_address || '00'}</Text>
                    </View>
                </View>

                <View style={styles.qrContainer}>
                    <View style={styles.qrWrapper}>
                        <QRCode
                            value={qrData}
                            size={180}
                            color="black"
                            backgroundColor="white"
                        />
                    </View>
                </View>

                <Text style={styles.expiryText}>Auto-renews daily • Valid for Entry</Text>
            </LinearGradient>
        </View>
      </View>
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Digital Pass</Text>
            <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
            <FlatList
              data={allPasses}
              renderItem={renderCard}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ alignItems: 'center' }}
              style={{ flexGrow: 0, marginBottom: 20 }}
            />

            {/* Pagination Dots */}
            {allPasses.length > 1 && (
              <View style={styles.pagination}>
                {allPasses.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      currentIndex === index && styles.paginationDotActive
                    ]}
                  />
                ))}
              </View>
            )}

            <View style={styles.actions}>
                <TouchableOpacity 
                    style={[styles.actionBtn, { width: '100%', justifyContent: 'center' }]}
                    onPress={() => navigation.navigate('VisitorRegistration')}
                >
                    <Users color="#fff" size={20} />
                    <Text style={styles.actionText}>Create Guest Pass</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.note, { color: '#f59e0b', marginBottom: 8, fontWeight: 'bold' }]}>
                Private Access Code. Do not share.
            </Text>

            <Text style={styles.note}>
                Show this QR code at the gate scanner for automated entry.
            </Text>
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
  relationText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
});
