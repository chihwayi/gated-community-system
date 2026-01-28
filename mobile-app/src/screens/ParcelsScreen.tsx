import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Search, Package, Calendar, User, MapPin } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';

const MOCK_PARCELS = [
  { id: '1', recipient: 'John Doe', unit: 'A-101', courier: 'Amazon', tracking: 'TBA123456789', status: 'Pending', date: '2023-10-25' },
  { id: '2', recipient: 'Jane Smith', unit: 'B-205', courier: 'FedEx', tracking: '123456789012', status: 'Collected', date: '2023-10-24' },
  { id: '3', recipient: 'Robert Johnson', unit: 'C-304', courier: 'DHL', tracking: 'JD01460000', status: 'Pending', date: '2023-10-25' },
];

export default function ParcelsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [parcels, setParcels] = useState(MOCK_PARCELS);

  const renderItem = ({ item }: any) => (
    <BlurView intensity={20} tint="light" style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Package size={24} color="#fff" />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.courier}>{item.courier}</Text>
          <Text style={styles.tracking}>#{item.tracking}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Collected' ? '#d1fae5' : '#fee2e2' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Collected' ? '#059669' : '#dc2626' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <User size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.recipient}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.unit}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
      </View>

      {item.status === 'Pending' && (
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Mark as Collected</Text>
        </TouchableOpacity>
      )}
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
          <Text style={styles.headerTitle}>Parcels</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Search color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search parcels..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    height: 48,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.textPrimary },
  listContent: { padding: SPACING.lg, paddingTop: SPACING.sm },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
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
    color: COLORS.textPrimary,
  },
  tracking: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
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
