import React, { useState } from 'react';
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

// Mock Data for Admin Mode
const MOCK_REQUESTS = [
  { id: '1', title: 'Leaking Faucet', category: 'Plumbing', unit: 'A-101', status: 'Pending', date: '2 hrs ago', description: 'Kitchen sink is leaking constantly.' },
  { id: '2', title: 'AC Not Cooling', category: 'Appliance', unit: 'B-205', status: 'In Progress', date: '5 hrs ago', description: 'Master bedroom AC is blowing warm air.' },
  { id: '3', title: 'Flickering Light', category: 'Electrical', unit: 'C-304', status: 'Completed', date: 'Yesterday', description: 'Hallway light keeps flickering.' },
  { id: '4', title: 'Broken Tile', category: 'Other', unit: 'A-102', status: 'Pending', date: 'Yesterday', description: 'Bathroom tile cracked.' },
];

export default function ServiceRequestScreen({ navigation, route }: any) {
  const { mode } = route.params || {};
  const isAdmin = mode === 'admin';

  const [category, setCategory] = useState('plumbing');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Open'); // For Admin: Open, Closed

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
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Request Submitted',
        text2: 'Maintenance team has been notified.',
      });
      navigation.goBack();
    }, 1500);
  };

  const categories = [
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'appliance', label: 'Appliance' },
    { id: 'other', label: 'Other' },
  ];

  const renderAdminItem = ({ item }: any) => (
    <TouchableOpacity style={styles.requestCard}>
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
    </TouchableOpacity>
  );

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
        colors={['#1a1a2e', '#16213e']}
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
            <BlurView intensity={20} tint="dark" style={styles.inputContainer}>
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
            </BlurView>

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
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  categoryText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#3b82f6',
  },
  inputContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  attachText: {
    color: '#94a3b8',
    marginLeft: 8,
  },
  footer: {
    padding: SPACING.l,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  submitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Admin Styles
  filterButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: SPACING.m,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    padding: SPACING.l,
  },
  requestCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
