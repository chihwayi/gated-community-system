import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Platform,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Search, Filter, Trash2, Edit2, ShoppingBag, Plus, X, Camera, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import Toast from 'react-native-toast-message';
import { getImageUrl } from '../utils/image';
import { CustomAlert } from '../components/CustomAlert';

const { width } = Dimensions.get('window');

export default function MarketplaceScreen({ route, navigation }: any) {
  const { mode } = route.params || {};
  const [isAdmin, setIsAdmin] = useState(mode === 'admin');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Add/Edit Item Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    category: 'General',
    image_url: null as string | null
  });
  const [uploading, setUploading] = useState(false);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    showCancel: false,
    onConfirm: () => {},
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', showCancel = false, onConfirm?: () => void, confirmText = 'OK', cancelText = 'Cancel') => {
    setAlertConfig({
      title,
      message,
      type,
      showCancel,
      onConfirm: onConfirm || (() => setAlertVisible(false)),
      confirmText,
      cancelText
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    console.log('MarketplaceScreen mounted');
    fetchListings();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const user = await Storage.getUser();
      if (user) {
        setCurrentUserId(user.id);
        if (user.role === 'admin' || user.role === 'super_admin') {
          setIsAdmin(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchListings = async () => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.MARKETPLACE}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load marketplace listings',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image',
      });
    }
  };

  const handleUpload = async (uri: string) => {
    try {
      setUploading(true);
      const token = await Storage.getToken();
      
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${API_URL}/upload/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setNewItem(prev => ({ ...prev, image_url: data.url }));
        Toast.show({ type: 'success', text1: 'Image uploaded successfully' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Could not upload image',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.price || !newItem.description) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    try {
      setUploading(true);
      const token = await Storage.getToken();
      
      const payload = {
        title: newItem.title,
        description: newItem.description,
        price: parseFloat(newItem.price) * 100, // Convert to cents
        category: newItem.category,
        image_urls: newItem.image_url ? [newItem.image_url] : [],
        status: 'available'
      };

      let url = `${API_URL}${ENDPOINTS.MARKETPLACE}`;
      let method = 'POST';

      if (isEditing && editingId) {
        url = `${API_URL}${ENDPOINTS.MARKETPLACE}${editingId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Toast.show({ type: 'success', text1: isEditing ? 'Item Updated!' : 'Item Listed!' });
        setModalVisible(false);
        setNewItem({
          title: '',
          description: '',
          price: '',
          category: 'General',
          image_url: null
        });
        setIsEditing(false);
        setEditingId(null);
        fetchListings();
      } else {
        Toast.show({ type: 'error', text1: isEditing ? 'Failed to update item' : 'Failed to list item' });
      }
    } catch (error) {
      console.error('Error saving item:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong' });
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (item: any) => {
    setNewItem({
      title: item.title,
      description: item.description,
      price: (item.price / 100).toString(),
      category: item.category || 'General',
      image_url: item.image_urls?.[0] || null
    });
    setEditingId(item.id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const openAddModal = () => {
      setNewItem({
        title: '',
        description: '',
        price: '',
        category: 'General',
        image_url: null
      });
      setIsEditing(false);
      setEditingId(null);
      setModalVisible(true);
  };

  const handleDeleteListing = async (id: number) => {
    showAlert(
      'Remove Listing',
      'Are you sure you want to remove this listing?',
      'warning',
      true,
      async () => {
        setAlertVisible(false);
        try {
          setLoading(true);
          const token = await Storage.getToken();
          const response = await fetch(`${API_URL}${ENDPOINTS.MARKETPLACE}${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.ok) {
            Toast.show({ type: 'success', text1: 'Listing Removed' });
            fetchListings();
          } else {
            Toast.show({ type: 'error', text1: 'Failed to remove listing' });
          }
        } catch (e) {
          console.error(e);
          Toast.show({ type: 'error', text1: 'Error removing listing' });
        } finally {
          setLoading(false);
        }
      },
      'Remove',
      'Cancel'
    );
  };

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};
    const imageUrl = item.image_urls?.[0] ? getImageUrl(item.image_urls[0]) : null;
    const price = `$${(item.price / 100).toFixed(2)}`;
    const sellerName = item.seller?.full_name || 'Unknown';
    const isOwner = currentUserId === item.seller_id;
    const canDelete = isAdmin || isOwner;

    return (
      <Container {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }]}>
            <ShoppingBag color={COLORS.textSecondary} size={32} />
          </View>
        )}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.price}>{price}</Text>
          </View>
          <Text style={styles.seller}>By {sellerName}</Text>
          <View style={styles.footerRow}>
              <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.category}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'available' ? '#10b981' : '#f59e0b' }]}>
                  <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
              </View>
          </View>
          
          {/* Admin or Owner Actions */}
          {canDelete && (
          <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteListing(item.id)}>
                  <Trash2 size={16} color="#ef4444" />
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>Remove</Text>
              </TouchableOpacity>
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
            <ChevronLeft color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Plus color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search listings..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
          <TouchableOpacity>
            <Filter color={COLORS.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchListings();
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : (
                <>
                  <ShoppingBag color={COLORS.textSecondary} size={48} />
                  <Text style={styles.emptyText}>No listings available</Text>
                  <Text style={styles.emptySubText}>Check back later for new items</Text>
                </>
              )}
            </View>
          }
        />
        <CustomAlert 
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertVisible(false)}
          showCancel={alertConfig.showCancel}
          onConfirm={alertConfig.onConfirm}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
        />

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <BlurView intensity={50} tint="dark" style={styles.modalBlur}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Item</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <X color="#fff" size={24} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.formScroll}>
                  <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {newItem.image_url ? (
                      <Image source={{ uri: getImageUrl(newItem.image_url) }} style={styles.pickedImage} />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Camera color={COLORS.textSecondary} size={32} />
                        <Text style={styles.uploadText}>Add Photo</Text>
                      </View>
                    )}
                    {uploading && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.label}>Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Item Name"
                    placeholderTextColor={COLORS.textSecondary}
                    value={newItem.title}
                    onChangeText={(t) => setNewItem({ ...newItem, title: t })}
                  />

                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={newItem.price}
                    onChangeText={(t) => setNewItem({ ...newItem, price: t })}
                  />

                  <Text style={styles.label}>Category</Text>
                  <View style={styles.categoryRow}>
                    {['General', 'Electronics', 'Furniture', 'Vehicles'].map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryChip,
                          newItem.category === cat && styles.activeCategoryChip
                        ]}
                        onPress={() => setNewItem({ ...newItem, category: cat })}
                      >
                        <Text style={[
                          styles.categoryChipText,
                          newItem.category === cat && styles.activeCategoryChipText
                        ]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your item..."
                    placeholderTextColor={COLORS.textSecondary}
                    multiline
                    numberOfLines={4}
                    value={newItem.description}
                    onChangeText={(t) => setNewItem({ ...newItem, description: t })}
                  />

                  <TouchableOpacity 
                    style={[styles.submitBtn, uploading && styles.disabledBtn]}
                    onPress={handleAddItem}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Upload color="#fff" size={20} />
                        <Text style={styles.submitBtnText}>{isEditing ? 'Save Changes' : 'List Item'}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </BlurView>
          </KeyboardAvoidingView>
        </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.l,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 8,
  },
  listContent: {
    padding: SPACING.l,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#334155',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  price: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seller: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#cbd5e1',
    fontSize: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    padding: SPACING.l,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  formScroll: {
    flex: 1,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.l,
    overflow: 'hidden',
  },
  pickedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: COLORS.textSecondary,
    marginTop: 8,
    fontSize: 14,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: SPACING.l,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.l,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeCategoryChip: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  activeCategoryChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: SPACING.m,
    gap: 8,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  submitButton: {
    marginTop: SPACING.m,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
