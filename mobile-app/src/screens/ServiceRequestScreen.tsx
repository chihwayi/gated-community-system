import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ArrowLeft, Wrench, Send, Camera, Filter, ChevronRight, CheckCircle, Clock } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';

const Container = Platform.OS === 'ios' ? BlurView : View;

export default function ServiceRequestScreen({ navigation, route }: any) {
  const { mode } = route.params || {};
  const isAdmin = mode === 'admin';

  const [category, setCategory] = useState('plumbing');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Open'); // For Admin: Open, Closed
  const [requests, setRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin, activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = await Storage.getToken();
      const status = activeTab === 'Open' ? 'open' : 'closed';
      // Adjust query param based on your backend API filtering capability
      // Assuming GET /tickets/?status=open
      const response = await fetch(`${API_URL}${ENDPOINTS.TICKETS}?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch service requests',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Description Required',
        text2: 'Please describe the issue.',
      });
      return;
    }

    setLoading(true);
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.TICKETS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${categories.find(c => c.id === category)?.label} Issue`,
          description,
          category,
          priority: 'medium', // Default
          status: 'open'
        }),
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Request Submitted',
          text2: 'Maintenance team has been notified.',
        });
        navigation.goBack();
      } else {
        throw new Error('Failed to submit ticket');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'appliance', label: 'Appliance' },
    { id: 'other', label: 'Other' },
  ];

  const renderAdminItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};
    
    return (
    <TouchableOpacity onPress={() => {}} activeOpacity={0.8}>
      <Container {...containerProps} style={[styles.requestCard, Platform.OS === 'android' && styles.androidCard]}>
        <View style={styles.requestHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
          <Text style={[
            styles.statusText,
            { color: item.status === 'Completed' ? '#10b981' : item.status === 'In Progress' ? '#3b82f6' : '#f59e0b' }
          ]}>{item.status}</Text>
        </View>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <Text style={styles.requestDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.requestFooter}>
          <View style={styles.footerItem}>
            <Text style={styles.footerText}>Unit {item.unit}</Text>
          </View>
          <View style={styles.footerItem}>
            <Clock size={12} color="#94a3b8" />
            <Text style={styles.footerText}>{item.date}</Text>
          </View>
        </View>
      </Container>
    </TouchableOpacity>
    );
  };

  if (isAdmin) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0f172a', '#1e293b']}
          style={styles.background}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Service Requests</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            {['Open', 'Closed'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={MOCK_REQUESTS}
            renderItem={renderAdminItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Request</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconHeader}>
                <View style={styles.iconCircle}>
                    <Wrench color="#3b82f6" size={40} />
                </View>
                <Text style={styles.subTitle}>What needs fixing?</Text>
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                <TouchableOpacity
                    key={cat.id}
                    style={[
                    styles.categoryChip,
                    category === cat.id && styles.categoryChipActive
                    ]}
                    onPress={() => setCategory(cat.id)}
                >
                    <Text style={[
                    styles.categoryText,
                    category === cat.id && styles.categoryTextActive
                    ]}>{cat.label}</Text>
                </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Description</Text>
            <Container 
                {...(Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {})} 
                style={[styles.inputContainer, Platform.OS === 'android' && styles.androidCard]}
            >
                <TextInput
                style={styles.input}
                placeholder="Describe the issue in detail..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={6}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
                />
            </Container>

            <TouchableOpacity style={styles.attachBtn}>
                <Camera color="#94a3b8" size={20} />
                <Text style={styles.attachText}>Add Photo (Optional)</Text>
            </TouchableOpacity>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#3b82f6', '#2563eb']}
                        style={styles.submitGradient}
                    >
                        {loading ? (
                            <Text style={styles.submitText}>Submitting...</Text>
                        ) : (
                            <>
                                <Text style={styles.submitText}>Submit Request</Text>
                                <Send color="#fff" size={20} style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: SPACING.l,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  subTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 12,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  categoryText: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#60a5fa',
    fontWeight: '600',
  },
  inputContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  input: {
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderStyle: 'dashed',
    marginBottom: 40,
  },
  attachText: {
    color: '#94a3b8',
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    padding: SPACING.l,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Admin Styles
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.l,
    paddingTop: 0,
  },
  requestCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  requestDesc: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
});