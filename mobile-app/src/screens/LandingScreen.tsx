import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  SafeAreaView,
  StatusBar,
  TextInput,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Building, ArrowRight, Search } from 'lucide-react-native';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import { getImageUrl } from '../utils/image';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }: any) {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    fetchTenants(0, true);
  }, []);

  const fetchTenants = async (pageNum: number, refresh = false) => {
    if (!refresh && (!hasMore || loadingMore)) return;
    
    try {
      if (refresh) setLoading(true);
      else setLoadingMore(true);

      const skip = pageNum * LIMIT;
      // Append query params for pagination
      const response = await fetch(`${API_URL}${ENDPOINTS.TENANTS}?skip=${skip}&limit=${LIMIT}`);
      
      if (!response.ok) throw new Error('Failed to fetch communities');
      const data = await response.json();
      
      if (data.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setTenants(prev => refresh ? data : [...prev, ...data]);
      setPage(pageNum + 1);
    } catch (err) {
      console.error(err);
      if (refresh) {
        setError('Could not load communities. Please check your connection.');
        // Fallback data for demo
        setTenants([
          { id: 1, name: 'Sunrise Apartments', slug: 'sunrise', logo_url: null },
          { id: 2, name: 'Golden Valley Estate', slug: 'golden-valley', logo_url: null },
        ]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore && searchQuery === '') {
      fetchTenants(page);
    }
  };

  const handleSelectTenant = async (tenant: any) => {
    await Storage.saveTenant(tenant);
    navigation.replace('Login', { tenant });
  };

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => handleSelectTenant(item)}
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            {item.logo_url ? (
              <Image source={{ uri: getImageUrl(item.logo_url) }} style={styles.logo} />
            ) : (
              <Building color={COLORS.primary} size={24} />
            )}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.tenantName}>{item.name}</Text>
            <Text style={styles.tenantSlug}>{item.slug}.gated.community</Text>
          </View>

          <View style={styles.actionIcon}>
             <ArrowRight color={COLORS.primary} size={20} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Gated Community</Text>
          <Text style={styles.subtitle}>Select your community to continue</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search communities..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor={COLORS.primary}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredTenants}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={{ padding: 20 }}>
                  <ActivityIndicator color={COLORS.primary} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No communities found</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.l,
    paddingTop: Platform.OS === 'android' ? SPACING.xl + 20 : SPACING.l,
    paddingBottom: SPACING.l,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    // Fallback to solid color or basic gradient
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  searchContainer: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.l,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.m,
    paddingVertical: Platform.OS === 'ios' ? SPACING.m : SPACING.s,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    marginRight: SPACING.s,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    height: 40,
  },
  listContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.xl,
  },
  cardContainer: {
    marginBottom: SPACING.m,
    borderRadius: BORDER_RADIUS.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
    elevation: 9,
  },
  card: {
    padding: SPACING.l,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  tenantSlug: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionIcon: {
    padding: SPACING.s,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.full,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
