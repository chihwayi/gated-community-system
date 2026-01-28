import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
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

const { width } = Dimensions.get('window');

// Mock Data
const MOCK_VISITORS = [
  { id: '1', name: 'James Wilson', type: 'Delivery', host: 'Sarah Williams', unit: 'A-101', time: '10:30 AM', status: 'Checked In' },
  { id: '2', name: 'Linda Brown', type: 'Guest', host: 'John Doe', unit: 'B-205', time: '11:15 AM', status: 'Expected' },
  { id: '3', name: 'Tech Solutions', type: 'Contractor', host: 'Estate Office', unit: 'Admin', time: '09:00 AM', status: 'Checked Out' },
  { id: '4', name: 'Uber Eats', type: 'Delivery', host: 'Emily Davis', unit: 'C-304', time: '12:45 PM', status: 'Checked In' },
  { id: '5', name: 'Mike Johnson', type: 'Guest', host: 'Robert Smith', unit: 'A-102', time: 'Yesterday', status: 'Checked Out' },
];

export default function VisitorsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visitors, setVisitors] = useState(MOCK_VISITORS);

  const renderItem = ({ item }: any) => (
    <BlurView intensity={20} tint="light" style={styles.card}>
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
            { backgroundColor: item.status === 'Checked In' ? '#d1fae5' : item.status === 'Expected' ? '#fef3c7' : '#f3f4f6' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: item.status === 'Checked In' ? '#059669' : item.status === 'Expected' ? '#d97706' : '#4b5563' }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <User size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>Host: {item.host}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.unit}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
      </View>
    </BlurView>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, '#eef2f3']}
        style={styles.background}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visitors</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search visitors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
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
    color: COLORS.textPrimary,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.l,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
    backgroundColor: 'rgba(0,0,0,0.05)',
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
    color: COLORS.textSecondary,
  },
});
