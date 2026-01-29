import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  RefreshControl
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
  Search,
  Plus,
  X,
  Upload,
  FileUp,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
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
  const [stats, setStats] = useState({ files: 0, folders: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Upload Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
    fetchDocuments();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDocuments().then(() => setRefreshing(false));
  }, []);

  const checkAdminStatus = async () => {
    const user = await Storage.getUser();
    setIsAdmin(user?.role === 'admin' || user?.role === 'super_admin');
  };

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
      
      // Group by category
      const grouped = data.reduce((acc: any, doc: any) => {
        const cat = doc.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push({
          id: doc.id?.toString(),
          name: doc.title,
          type: 'file',
          date: new Date(doc.created_at).toLocaleDateString(),
          url: doc.file_url,
          category: cat,
          size: '—'
        });
        return acc;
      }, {});

      const folderCount = Object.keys(grouped).length;
      const fileCount = data.length;
      setStats({ files: fileCount, folders: folderCount });

      // Create folder items
      const folders: DocumentItem[] = Object.keys(grouped).map(cat => ({
        id: `folder-${cat}`,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        type: 'folder',
        date: '—',
        items: `${grouped[cat].length} items`,
        category: cat
      }));

      setDocuments([...folders, ...Object.values(grouped).flat() as any]);
    } catch (e) {
      console.error('Documents fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const getVisibleDocuments = () => {
    if (!currentFolder) {
      return documents.filter(d => d.type === 'folder');
    }
    return documents.filter(d => d.type === 'file' && (d as any).category === currentFolder);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setSelectedFile(result.assets[0]);
    } catch (e) {
      console.error('Pick document error:', e);
      Toast.show({
        type: 'error',
        text1: 'Selection Failed',
        text2: 'Could not select document',
      });
    }
  };

  const handleUpload = async () => {
    if (!newTitle) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter a document title',
      });
      return;
    }

    if (!selectedFile) {
      Toast.show({
        type: 'error',
        text1: 'Missing File',
        text2: 'Please select a document to upload',
      });
      return;
    }

    setUploading(true);
    try {
      const token = await Storage.getToken();

      // 1. Upload File
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream',
      } as any);

      const uploadResponse = await fetch(`${API_URL}/api/v1/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`File upload failed: ${errorText}`);
      }

      const uploadData = await uploadResponse.json();
      const fileUrl = uploadData.url;

      // 2. Create Document Record
      const docResponse = await fetch(`${API_URL}${ENDPOINTS.DOCUMENTS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          file_url: fileUrl,
        }),
      });

      if (!docResponse.ok) {
        const errorData = await docResponse.json();
        throw new Error(errorData.detail || 'Failed to create document record');
      }

      Toast.show({
        type: 'success',
        text1: 'Document Uploaded',
        text2: `${newTitle} has been uploaded successfully`,
      });

      setModalVisible(false);
      resetForm();
      fetchDocuments();

    } catch (e: any) {
      console.error('Upload error:', e);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: e.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewCategory('general');
    setSelectedFile(null);
  };

  const renderItem = ({ item }: any) => {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

    return (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => {
        if (item.type === 'folder') {
          setCurrentFolder((item as any).category);
        } else {
          // Handle file download/view
          if (item.url) {
             Toast.show({
               type: 'info',
               text1: 'Opening Document',
               text2: `Opening ${item.name}...`
             });
          }
        }
      }}
    >
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
          <TouchableOpacity 
            onPress={() => {
              if (currentFolder) {
                setCurrentFolder(null);
              } else {
                navigation.goBack();
              }
            }} 
            style={styles.backButton}
          >
            <ChevronLeft color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentFolder ? currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1) : 'Documents'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {isAdmin && (
              <TouchableOpacity style={styles.searchButton} onPress={() => setModalVisible(true)}>
                <Plus color={COLORS.textPrimary} size={24} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.searchButton}>
              <Search color={COLORS.textPrimary} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.files}</Text>
                <Text style={styles.statLabel}>Total Files</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.folders}</Text>
                <Text style={styles.statLabel}>Folders</Text>
            </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={getVisibleDocuments()}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
            ListEmptyComponent={
              <View style={{ padding: SPACING.l }}>
                <Text style={{ color: COLORS.textSecondary }}>
                  {currentFolder ? 'No documents in this folder' : 'No documents found'}
                </Text>
              </View>
            }
          />
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Upload Document</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X color={COLORS.textSecondary} size={24} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalForm}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Document Title"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Optional description..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  multiline
                  numberOfLines={3}
                />
                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. general, legal, notices"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newCategory}
                  onChangeText={setNewCategory}
                  autoCapitalize="none"
                />
                <Text style={styles.inputLabel}>File</Text>
                <TouchableOpacity
                  style={styles.filePickerButton}
                  onPress={handlePickDocument}
                >
                  {selectedFile ? (
                    <View style={styles.selectedFileContainer}>
                      <FileUp color={COLORS.primary} size={24} />
                      <Text style={styles.selectedFileName} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Upload color={COLORS.textSecondary} size={24} />
                      <Text style={styles.uploadPlaceholderText}>Select File</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, uploading && styles.disabledButton]}
                  onPress={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Upload Document</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.l,
    maxHeight: '80%',
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
    color: COLORS.textPrimary,
  },
  modalForm: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.s,
    marginTop: SPACING.m,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  filePickerButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.l,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: SPACING.s,
  },
  uploadPlaceholderText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.m,
  },
  selectedFileName: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 200,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
