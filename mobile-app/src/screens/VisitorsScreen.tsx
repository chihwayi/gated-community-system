import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  ChevronLeft,
  Search,
  User,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Filter,
  MoreVertical
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';

const { width } = Dimensions.get('window');

export default function VisitorsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Exit Pass State
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [selectedVisitorId, setSelectedVisitorId] = useState<number | null>(null);
  const [allowedItems, setAllowedItems] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.VISITORS}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setVisitors(data);
      }
    } catch (e) {
      console.error('Error fetching visitors:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExitModal = (visitor: any) => {
    setSelectedVisitorId(visitor.id);
    setAllowedItems(visitor.allowed_items_out || '');
    setExitModalVisible(true);
  };

  const handleSubmitExitPass = async () => {
    if (!selectedVisitorId) return;
    setSubmitting(true);
    try {
        const token = await Storage.getToken();
        const response = await fetch(`${API_URL}${ENDPOINTS.VISITORS}/${selectedVisitorId}`, {
            method: 'PUT',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ allowed_items_out: allowedItems })
        });
        
        if (response.ok) {
            setVisitors(prev => prev.map(v => 
                v.id === selectedVisitorId ? { ...v, allowed_items_out: allowedItems } : v
            ));
            setExitModalVisible(false);
        } else {
            console.error('Failed to update exit pass');
        }
    } catch (e) {
        console.error('Error updating exit pass:', e);
    } finally {
        setSubmitting(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

    return (
    <Container {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: item.type === 'Delivery' ? '#f59e0b' : item.type === 'Contractor' ? '#6366f1' : '#3b82f6' }]}>
            <User size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.typeContainer}>
              <Text style={styles.type}>{item.type}</Text>
            </View>
          </View>
        </View>
        <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'Checked In' ? 'rgba(16, 185, 129, 0.2)' : item.status === 'Expected' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(75, 85, 99, 0.2)' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: item.status === 'Checked In' ? '#34d399' : item.status === 'Expected' ? '#fbbf24' : '#9ca3af' }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <User size={14} color="#94a3b8" />
          <Text style={styles.detailText}>Host: {item.host}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color="#94a3b8" />
          <Text style={styles.detailText}>{item.unit}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={14} color="#94a3b8" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
      </View>

      {['checked_in', 'Checked In'].includes(item.status) && (
        <TouchableOpacity
          style={{ marginTop: SPACING.m, backgroundColor: 'rgba(255,255,255,0.1)', padding: SPACING.s, borderRadius: BORDER_RADIUS.s, alignItems: 'center' }}
          onPress={() => handleOpenExitModal(item)}
        >
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{item.allowed_items_out ? 'Edit Exit Pass' : 'Generate Exit Pass'}</Text>
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
          <Text style={styles.headerTitle}>Visitors</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search visitors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748b"
          />
        </View>

        <FlatList
          data={visitors}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.l,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#f1f5f9',
    paddingVertical: 8,
  },
  listContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.s,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: SPACING.m,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
