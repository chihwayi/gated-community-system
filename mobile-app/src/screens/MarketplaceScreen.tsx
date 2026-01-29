import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Search, Filter, Tag, Trash2, Edit2, ShoppingBag } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import Toast from 'react-native-toast-message';
import { getImageUrl } from '../utils/image';

const { width } = Dimensions.get('window');

export default function MarketplaceScreen({ route, navigation }: any) {
  const { mode } = route.params || {};
  const isAdmin = mode === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.MARKETPLACE}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load marketplace listings',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};
    const imageUrl = item.image_urls?.[0] ? getImageUrl(item.image_urls[0]) : null;
    const price = `$${(item.price / 100).toFixed(2)}`;
    const sellerName = item.seller?.full_name || 'Unknown';

    return (
      <Container {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
        )}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.price}>{price}</Text>
          </View>
          <Text style={styles.seller}>By {sellerName}</Text>
          <View style={styles.footerRow}>
              <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.category}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'available' ? '#10b981' : '#f59e0b' }]}>
                  <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
              </View>
          </View>
          
          {/* Admin Actions */}
          {isAdmin && (
          <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn}>
                  <Edit2 size={16} color="#3b82f6" />
                  <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                  <Trash2 size={16} color="#ef4444" />
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>Remove</Text>
              </TouchableOpacity>
          </View>
          )}
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
            <ChevronLeft color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Marketplace</Text>
          {isAdmin && (
          <TouchableOpacity style={styles.addButton}>
            <ShoppingBag color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchContainer}>
          <Search color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search listings..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
          <TouchableOpacity>
            <Filter color={COLORS.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={fetchListings}
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.l,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 8,
  },
  listContent: {
    padding: SPACING.l,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#334155',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  price: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seller: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#cbd5e1',
    fontSize: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
});
