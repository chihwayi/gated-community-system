import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Users, Mail, Phone, Shield } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import Toast from 'react-native-toast-message';

export default function FamilyScreen({ navigation }: any) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchHousehold();
  }, []);

  const fetchHousehold = async () => {
    try {
      const token = await Storage.getToken();
      const user = await Storage.getUser();
      setCurrentUser(user);

      // Handle potential double slash if ENDPOINTS.USERS ends with /
      const endpoint = ENDPOINTS.USERS.endsWith('/') 
        ? `${ENDPOINTS.USERS}household` 
        : `${ENDPOINTS.USERS}/household`;
        
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch household members');
      }

      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching household:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load household members',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};
    const isMe = currentUser?.id === item.id;

    return (
      <Container {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard, isMe && styles.myCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
             <Text style={styles.avatarText}>
                {item.full_name?.substring(0, 2).toUpperCase() || 'US'}
             </Text>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.name}>{item.full_name}</Text>
                {isMe && (
                    <View style={styles.meBadge}>
                        <Text style={styles.meBadgeText}>You</Text>
                    </View>
                )}
            </View>
            <Text style={styles.role}>{item.role}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Mail size={14} color="#94a3b8" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
          {item.phone_number && (
            <View style={styles.detailRow}>
                <Phone size={14} color="#94a3b8" />
                <Text style={styles.detailText}>{item.phone_number}</Text>
            </View>
          )}
        </View>
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
          <Text style={styles.headerTitle}>Household Members</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={members}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
                <TouchableOpacity 
                    style={[styles.card, styles.addCard]}
                    onPress={() => {
                        Toast.show({
                            type: 'info',
                            text1: 'Add Family Member',
                            text2: 'Please contact administration to add new members.',
                            visibilityTime: 4000,
                        });
                    }}
                >
                    <View style={styles.addCardContent}>
                        <View style={styles.addIconContainer}>
                            <Users size={24} color="#6366f1" />
                        </View>
                        <Text style={styles.addCardTitle}>Add Family Member</Text>
                        <Text style={styles.addCardText}>
                            Contact administration to add new household members to this address.
                        </Text>
                    </View>
                </TouchableOpacity>
            }
          />
        )}
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1f5f9' },
  listContainer: { padding: SPACING.lg },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  myCard: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  avatarText: {
    color: '#a78bfa',
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  role: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  meBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  meBadgeText: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.md,
  },
  detailsContainer: {
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  addCard: {
    borderStyle: 'dashed',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  addCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  addIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  addCardTitle: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  addCardText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 200,
  },
});
