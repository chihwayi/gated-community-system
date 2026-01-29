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
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ArrowLeft, Wrench, Send, Camera, Filter, ChevronRight, CheckCircle, Clock, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
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
  const [activeTab, setActiveTab] = useState(isAdmin ? 'Open' : 'New'); // Admin: Open/Closed, Resident: New/History
  const [requests, setRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch requests for both admin and resident (history)
    fetchRequests();
  }, [activeTab]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.TICKETS}`, {
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const token = await Storage.getToken();
      const formData = new FormData();
      
      const filename = uri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type: type,
      } as any);

      const response = await fetch(`${API_URL}/api/v1/upload/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
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
      let imageUrl = null;

      if (image) {
        imageUrl = await uploadImage(image);
        if (!imageUrl) {
            Toast.show({
                type: 'error',
                text1: 'Upload Failed',
                text2: 'Failed to upload image, submitting without it.',
            });
        }
      }

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
          status: 'open',
          image_url: imageUrl
        }),
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Request Submitted',
          text2: 'Maintenance team has been notified.',
        });
        setDescription('');
        setImage(null);
        // Switch to History tab to see the new request
        if (!isAdmin) {
            fetchRequests(); // Refresh list
            setActiveTab('History');
        } else {
            navigation.goBack();
        }
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

  const renderRequestItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};
    
    return (
    <TouchableOpacity onPress={() => {}} activeOpacity={0.8}>
      <Container {...containerProps} style={[styles.requestCard, Platform.OS === 'android' && styles.androidCard]}>
        <View style={styles.requestHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{(item.category || 'other')?.toString().toUpperCase()}</Text>
          </View>
          <Text style={[
            styles.statusText,
            { color: item.status === 'closed' ? '#10b981' : item.status === 'in_progress' ? '#3b82f6' : '#f59e0b' }
          ]}>{(item.status || 'open')?.toString().toUpperCase()}</Text>
        </View>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <Text style={styles.requestDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.requestFooter}>
          <View style={styles.footerItem}>
            <Text style={styles.footerText}>Location: {item.location || '-'}</Text>
          </View>
          <View style={styles.footerItem}>
            <Clock size={12} color="#94a3b8" />
            <Text style={styles.footerText}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        </View>
      </Container>
    </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (activeTab === 'New') {
        return (
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

                {image ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    <TouchableOpacity 
                      style={styles.removeImageBtn}
                      onPress={() => setImage(null)}
                    >
                      <X color="#fff" size={20} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
                    <Camera color="#94a3b8" size={20} />
                    <Text style={styles.attachText}>Add Photo (Optional)</Text>
                  </TouchableOpacity>
                )}

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
        );
    } else {
        // History or Admin List
        const filteredRequests = isAdmin 
            ? requests.filter(r => (activeTab === 'Open' ? r.status !== 'closed' : r.status === 'closed'))
            : requests; // Residents see all their history

        return (
            <FlatList
                data={filteredRequests}
                renderItem={renderRequestItem}
                keyExtractor={item => item.id?.toString?.() || String(item.id)}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                }
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ color: '#64748b' }}>No requests found</Text>
                    </View>
                }
            />
        );
    }
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
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isAdmin ? 'Service Requests' : 'Service Request'}</Text>
          {isAdmin ? (
            <TouchableOpacity style={styles.filterButton}>
              <Filter color="#fff" size={24} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <View style={styles.tabsContainer}>
          {(isAdmin ? ['Open', 'Closed'] : ['New', 'History']).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'New' ? 'New Request' : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderContent()}

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
  imagePreviewContainer: {
    marginBottom: 40,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    height: 200,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});