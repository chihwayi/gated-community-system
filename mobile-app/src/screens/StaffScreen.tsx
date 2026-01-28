import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  ChevronLeft,
  Phone,
  Mail,
  MoreHorizontal,
  Plus
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Mock Data
const STAFF = [
  { id: '1', name: 'John Smith', role: 'Security Manager', phone: '+1234567890', status: 'On Duty', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '2', name: 'Maria Garcia', role: 'Concierge', phone: '+1987654321', status: 'On Duty', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '3', name: 'Robert Johnson', role: 'Maintenance Lead', phone: '+1122334455', status: 'Off Duty', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: '4', name: 'Sarah Wilson', role: 'Gardener', phone: '+1555666777', status: 'On Duty', image: 'https://randomuser.me/api/portraits/women/4.jpg' },
];

export default function StaffScreen({ navigation }: any) {
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.image }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>{item.role}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal color={COLORS.textSecondary} size={20} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.actions}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'On Duty' ? '#dcfce7' : '#f1f5f9' }]}>
            <Text style={[styles.statusText, { color: item.status === 'On Duty' ? '#16a34a' : '#64748b' }]}>
                {item.status}
            </Text>
        </View>
        
        <View style={styles.contactActions}>
            <TouchableOpacity style={styles.actionButton}>
                <Phone size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
                <Mail size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, '#f8fafc']}
        style={styles.background}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Directory</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={STAFF}
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
  addButton: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.m,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  moreButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: SPACING.m,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
