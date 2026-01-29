import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
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
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';

const { width } = Dimensions.get('window');

type DocumentItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  date: string;
  size?: string;
  items?: string;
  url?: string;
};

export default function DocumentsScreen({ navigation }: any) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.DOCUMENTS}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      const data = await response.json();
      const formatted: DocumentItem[] = data.map((d: any) => ({
        id: d.id?.toString(),
        name: d.title,
        type: 'file',
        date: new Date(d.created_at).toLocaleDateString(),
        url: d.file_url,
      }));
      setDocuments(formatted);
    } catch (e) {
      console.error('Documents fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

    return (
    <TouchableOpacity style={styles.itemContainer}>
      <Container {...containerProps} style={[styles.itemBlur, Platform.OS === 'android' && styles.androidCard]}>
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
            {item.type === 'folder' ? item.items : item.size || '—'} • {item.date}
          </Text>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical color={COLORS.textSecondary} size={20} />
        </TouchableOpacity>
      </Container>
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Documents</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Search color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>{documents.length}</Text>
                <Text style={styles.statLabel}>Total Files</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>—</Text>
                <Text style={styles.statLabel}>Folders</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>—</Text>
                <Text style={styles.statLabel}>Used Space</Text>
            </View>
        </View>

        {loading ? (
          <View style={{ padding: SPACING.l }}>
            <Text style={{ color: COLORS.textSecondary }}>Loading documents...</Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ padding: SPACING.l }}>
                <Text style={{ color: COLORS.textSecondary }}>No documents found</Text>
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  itemContainer: {
    marginBottom: SPACING.m,
    marginHorizontal: SPACING.l,
  },
  itemBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.l,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: '#fff',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: '#94a3b8',
  },
  moreButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
});
