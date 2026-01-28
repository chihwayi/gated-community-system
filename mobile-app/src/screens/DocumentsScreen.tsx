import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  ChevronLeft,
  FileText,
  Folder,
  Download,
  MoreVertical,
  Search
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Mock Data
const DOCUMENTS = [
  { id: '1', name: 'Community Guidelines.pdf', type: 'file', size: '2.4 MB', date: 'Oct 24, 2023' },
  { id: '2', name: 'Financial Reports 2023', type: 'folder', items: '12 items', date: 'Dec 01, 2023' },
  { id: '3', name: 'Meeting Minutes', type: 'folder', items: '5 items', date: 'Nov 15, 2023' },
  { id: '4', name: 'Pool Rules.pdf', type: 'file', size: '1.1 MB', date: 'Sep 10, 2023' },
  { id: '5', name: 'Architectural Guidelines.pdf', type: 'file', size: '5.6 MB', date: 'Aug 05, 2023' },
];

export default function DocumentsScreen({ navigation }: any) {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.itemContainer}>
      <BlurView intensity={20} tint="light" style={styles.itemBlur}>
        <View style={styles.iconContainer}>
          {item.type === 'folder' ? (
            <Folder color="#fbbf24" size={24} />
          ) : (
            <FileText color="#60a5fa" size={24} />
          )}
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemMeta}>
            {item.type === 'folder' ? item.items : item.size} • {item.date}
          </Text>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical color={COLORS.textSecondary} size={20} />
        </TouchableOpacity>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, '#f1f5f9']}
        style={styles.background}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Documents</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Search color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>156</Text>
                <Text style={styles.statLabel}>Total Files</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Folders</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>1.2GB</Text>
                <Text style={styles.statLabel}>Used Space</Text>
            </View>
        </View>

        <FlatList
          data={DOCUMENTS}
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
  searchButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.l,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.xl,
  },
  itemContainer: {
    marginBottom: SPACING.m,
    borderRadius: BORDER_RADIUS.l,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  moreButton: {
    padding: 8,
  },
});
