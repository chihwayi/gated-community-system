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
import { ChevronLeft, Search, Car, User, MapPin, CheckCircle, XCircle } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';

const MOCK_VEHICLES = [
  { id: '1', plate: 'ABC-1234', model: 'Toyota Camry', owner: 'John Doe', unit: 'A-101', status: 'Approved' },
  { id: '2', plate: 'XYZ-9876', model: 'Honda CR-V', owner: 'Jane Smith', unit: 'B-205', status: 'Pending' },
  { id: '3', plate: 'LMN-4567', model: 'Ford Mustang', owner: 'Robert Johnson', unit: 'C-304', status: 'Rejected' },
];

export default function VehiclesScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);

  const renderItem = ({ item }: any) => (
    <BlurView intensity={20} tint="light" style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Car size={24} color="#fff" />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.plate}>{item.plate}</Text>
          <Text style={styles.model}>{item.model}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Approved' ? '#d1fae5' : item.status === 'Pending' ? '#fef3c7' : '#fee2e2' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Approved' ? '#059669' : item.status === 'Pending' ? '#d97706' : '#dc2626' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <User size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.owner}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.unit}</Text>
        </View>
      </View>

      {item.status === 'Pending' && (
        <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10b981', marginRight: 8 }]}>
                <CheckCircle size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ef4444' }]}>
                <XCircle size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
        </View>
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
          <Text style={styles.headerTitle}>Vehicles</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Search color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <FlatList
          data={vehicles}
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
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  model: {
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
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
  }
});
