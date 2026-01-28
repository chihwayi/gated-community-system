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
import { ChevronLeft, Search, AlertTriangle, Clock, MapPin } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';

const MOCK_INCIDENTS = [
  { id: '1', title: 'Suspicious Vehicle', location: 'Gate 2', time: '10:30 AM', status: 'Open', priority: 'High' },
  { id: '2', title: 'Noise Complaint', location: 'Block C', time: '09:15 AM', status: 'Resolved', priority: 'Low' },
  { id: '3', title: 'Water Leak', location: 'Block A Parking', time: 'Yesterday', status: 'In Progress', priority: 'Medium' },
];

export default function IncidentsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);

  const renderItem = ({ item }: any) => (
    <BlurView intensity={20} tint="light" style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.priority === 'High' ? '#fee2e2' : item.priority === 'Medium' ? '#fef3c7' : '#e0f2fe' }]}>
          <AlertTriangle size={24} color={item.priority === 'High' ? '#dc2626' : item.priority === 'Medium' ? '#d97706' : '#0ea5e9'} />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.priority} Priority</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Resolved' ? '#d1fae5' : '#f3f4f6' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Resolved' ? '#059669' : '#4b5563' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <MapPin size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.location}</Text>
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
          <Text style={styles.headerTitle}>Incidents</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Search color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search incidents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <FlatList
          data={incidents}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
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
});
