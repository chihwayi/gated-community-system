import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Search, Phone, Mail, User, MapPin } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';

// Mock data for now - will connect to API later
const MOCK_RESIDENTS = [
  { id: '1', name: 'John Doe', unit: 'A-101', phone: '+1234567890', email: 'john@example.com', status: 'Active' },
  { id: '2', name: 'Jane Smith', unit: 'B-205', phone: '+1987654321', email: 'jane@example.com', status: 'Active' },
  { id: '3', name: 'Robert Johnson', unit: 'C-304', phone: '+1122334455', email: 'robert@example.com', status: 'Pending' },
  { id: '4', name: 'Emily Davis', unit: 'A-102', phone: '+1555666777', email: 'emily@example.com', status: 'Active' },
  { id: '5', name: 'Michael Wilson', unit: 'D-401', phone: '+1999888777', email: 'michael@example.com', status: 'Inactive' },
];

export default function ResidentsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [residents, setResidents] = useState(MOCK_RESIDENTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch from API /api/v1/users?role=resident
  }, []);

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: any) => (
    <BlurView intensity={20} tint="light" style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <User size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.unitContainer}>
              <MapPin size={12} color={COLORS.textSecondary} />
              <Text style={styles.unit}>{item.unit}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#d1fae5' : item.status === 'Pending' ? '#fef3c7' : '#fee2e2' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Active' ? '#059669' : item.status === 'Pending' ? '#d97706' : '#dc2626' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Phone size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Mail size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Residents</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Search color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search residents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <FlatList
          data={filteredResidents}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
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
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unit: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
});
