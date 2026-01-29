import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Search, Car, User, MapPin, CheckCircle, XCircle } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import Toast from 'react-native-toast-message';

export default function VehiclesScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.VEHICLES}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        setVehicles(data);
      } catch (e) {
        console.error('Error parsing vehicles JSON:', text.substring(0, 100));
        throw new Error('Invalid JSON response');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load vehicles',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.owner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.owner?.house_address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

    return (
      <Container {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Car size={24} color="#8b5cf6" />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.plate}>{item.license_plate}</Text>
            <Text style={styles.model}>{item.make} {item.model}</Text>
          </View>
          {/* Status badge removed as backend doesn't support status yet */}
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <User size={14} color="#94a3b8" />
            <Text style={styles.detailText}>{item.owner?.full_name || 'Unknown Owner'}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={14} color="#94a3b8" />
            <Text style={styles.detailText}>{item.owner?.house_address || 'N/A'}</Text>
          </View>
        </View>
      </Container>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicles</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748b"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredVehicles}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No vehicles found</Text>
              </View>
            }
          />
        )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    height: 48,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, fontSize: 16, color: '#f1f5f9' },
  listContent: { padding: SPACING.lg, paddingTop: SPACING.sm },
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  model: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: SPACING.md,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actions: {
      flexDirection: 'row',
      marginTop: SPACING.xs,
  },
  actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6
  },
  actionButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14
  },
  listContainer: {
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.l,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});
