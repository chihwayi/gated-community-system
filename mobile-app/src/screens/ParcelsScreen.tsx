import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Search, Package, Calendar, User, MapPin } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';

export default function ParcelsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.PARCELS}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setParcels(data);
      }
    } catch (e) {
      console.error('Error fetching parcels:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

    return (
      <Container {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Package size={24} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.courier}>{item.courier}</Text>
            <Text style={styles.tracking}>#{item.tracking}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'Collected' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
            <Text style={[styles.statusText, { color: item.status === 'Collected' ? '#34d399' : '#f87171' }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <User size={14} color="#94a3b8" />
            <Text style={styles.detailText}>{item.recipient}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={14} color="#94a3b8" />
            <Text style={styles.detailText}>{item.unit}</Text>
          </View>
          <View style={styles.detailRow}>
            <Calendar size={14} color="#94a3b8" />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
        </View>

        {item.status === 'Pending' && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Mark as Collected</Text>
          </TouchableOpacity>
        )}
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
          <Text style={styles.headerTitle}>Parcels</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search parcels..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748b"
          />
        </View>

        <FlatList
          data={parcels}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courier: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  tracking: {
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
    color: '#94a3b8',
  },
  actionButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
