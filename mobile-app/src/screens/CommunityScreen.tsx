import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  Vote, 
  Plus, 
  BarChart2, 
  X, 
  Check, 
  Trash2,
  Clock
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_URL, ENDPOINTS } from '../config/api';
import { Storage } from '../utils/storage';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

// --- Types ---
interface PollOption {
  id: number;
  text: string;
  vote_count: number;
}

interface Poll {
  id: number;
  question: string;
  status: 'open' | 'closed';
  options: PollOption[];
  user_has_voted: boolean;
  votes: any[];
  created_at: string;
  end_date?: string;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  expiry_date?: string;
}

const priorityColor = (p: Notice['priority']) => p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#10b981';

const DURATIONS = [
    { label: 'Manual Close', value: 0 },
    { label: '24 Hours', value: 24 },
    { label: '3 Days', value: 72 },
    { label: '1 Week', value: 168 },
];

export default function CommunityScreen({ navigation, route }: any) {
  const { mode } = route.params || {};
  const isAdmin = mode === 'admin';
  
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  
  // Create Poll State
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [duration, setDuration] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPolls();
    fetchNotices();
  }, []);

  const fetchPolls = async () => {
    try {
      const token = await Storage.getToken();
      if (!token) return;

      const response = await fetch(`${API_URL}${ENDPOINTS.POLLS}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPolls(data);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!newQuestion.trim()) {
      Toast.show({ type: 'error', text1: 'Question Required', text2: 'Please enter a question.' });
      return;
    }
    const validOptions = newOptions.filter(o => o.trim().length > 0);
    if (validOptions.length < 2) {
      Toast.show({ type: 'error', text1: 'Options Required', text2: 'Please provide at least 2 options.' });
      return;
    }

    setCreating(true);
    try {
      let endDate = null;
      if (duration > 0) {
          const date = new Date();
          date.setHours(date.getHours() + duration);
          endDate = date.toISOString();
      }

      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.POLLS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: newQuestion,
          options: validOptions,
          end_date: endDate
        })
      });

      if (response.ok) {
        setModalVisible(false);
        setNewQuestion('');
        setNewOptions(['', '']);
        setDuration(0);
        fetchPolls();
        Toast.show({ type: 'success', text1: 'Poll Created' });
      } else {
        Toast.show({ type: 'error', text1: 'Failed to create poll' });
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error creating poll' });
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (pollId: number, optionId: number) => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.POLLS}${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ option_id: optionId })
      });

      if (response.ok) {
        fetchPolls(); // Refresh to see results
        Toast.show({ type: 'success', text1: 'Vote Recorded' });
      } else {
        const err = await response.json();
        Toast.show({ type: 'error', text1: err.detail || 'Failed to vote' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClosePoll = async (pollId: number) => {
    Alert.alert('Close Poll', 'Are you sure you want to close this poll? Voting will stop.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Close', style: 'destructive', onPress: async () => {
            try {
                const token = await Storage.getToken();
                const response = await fetch(`${API_URL}${ENDPOINTS.POLLS}${pollId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'closed' })
                });
                if (response.ok) fetchPolls();
            } catch (e) { console.error(e); }
        }}
    ]);
  };

  const handleDeletePoll = async (pollId: number) => {
    Alert.alert('Delete Poll', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
                const token = await Storage.getToken();
                const response = await fetch(`${API_URL}${ENDPOINTS.POLLS}${pollId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) fetchPolls();
            } catch (e) { console.error(e); }
        }}
    ]);
  };

  const fetchNotices = async () => {
    try {
      const token = await Storage.getToken();
      const response = await fetch(`${API_URL}${ENDPOINTS.NOTICES}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const formatted: Notice[] = data.map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          priority: n.priority,
          created_at: n.created_at,
          expiry_date: n.expiry_date,
        }));
        setNotices(formatted);
      }
    } catch (e) {
      console.error('Error fetching notices:', e);
    }
  };

  const addOptionField = () => {
    if (newOptions.length < 5) {
        setNewOptions([...newOptions, '']);
    }
  };

  const updateOptionText = (text: string, index: number) => {
    const updated = [...newOptions];
    updated[index] = text;
    setNewOptions(updated);
  };

  const removeOptionField = (index: number) => {
    if (newOptions.length > 2) {
        const updated = [...newOptions];
        updated.splice(index, 1);
        setNewOptions(updated);
    }
  };

  const renderPollCard = (poll: Poll) => {
    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.vote_count, 0);
    const isExpired = poll.end_date && new Date() > new Date(poll.end_date);
    const isClosed = poll.status === 'closed' || isExpired;
    const showResults = poll.user_has_voted || isClosed || isAdmin;

    let timeStatus = isClosed ? 'Closed' : 'Active';
    if (!isClosed && poll.end_date) {
        const end = new Date(poll.end_date);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (days > 0) timeStatus = `Ends in ${days}d ${hours}h`;
            else timeStatus = `Ends in ${hours}h`;
        } else {
            timeStatus = 'Closing...';
        }
    }

    const Container = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};

    return (
        <Container key={poll.id} {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: isClosed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(139, 92, 246, 0.2)' }]}>
                    {isClosed ? <Clock color="#ef4444" size={20} /> : <Vote color="#8b5cf6" size={20} />}
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.cardTitle}>{poll.question}</Text>
                    <Text style={styles.cardDate}>
                        {totalVotes} votes • {timeStatus}
                    </Text>
                </View>
                {isAdmin && (
                    <View style={{flexDirection: 'row', gap: 8}}>
                        {!isClosed && (
                            <TouchableOpacity onPress={() => handleClosePoll(poll.id)}>
                                <Clock color="#f59e0b" size={18} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => handleDeletePoll(poll.id)}>
                            <Trash2 color="#ef4444" size={18} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.optionsContainer}>
                {poll.options.map((option) => {
                    const percent = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
                    
                    if (showResults) {
                        return (
                            <View key={option.id} style={styles.resultRow}>
                                <View style={styles.resultBarBg}>
                                    <View style={[styles.resultBarFill, { width: `${percent}%` }]} />
                                </View>
                                <View style={styles.resultTextContainer}>
                                    <Text style={styles.optionText}>{option.text}</Text>
                                    <Text style={styles.percentText}>{Math.round(percent)}% ({option.vote_count})</Text>
                                </View>
                            </View>
                        );
                    }

                    return (
                        <TouchableOpacity 
                            key={option.id} 
                            style={styles.voteOptionBtn}
                            onPress={() => handleVote(poll.id, option.id)}
                        >
                            <View style={styles.radioCircle} />
                            <Text style={styles.voteOptionText}>{option.text}</Text>
                        </TouchableOpacity>
                    );
                })}
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
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isAdmin ? 'Manage Community' : 'Community'}</Text>
          {isAdmin ? (
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Plus color="#fff" size={24} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Active Polls First - Priority */}
          <Text style={styles.sectionTitle}>Polls</Text>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <View style={styles.list}>
                {polls.length > 0 ? polls.map(renderPollCard) : (
                    <Text style={styles.emptyText}>No active polls.</Text>
                )}
            </View>
          )}

          <Text style={styles.sectionTitle}>Notices & Announcements</Text>
          <View style={styles.list}>
            {notices.map((notice: Notice) => {
              const Container = Platform.OS === 'ios' ? BlurView : View;
              const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};
              
              return (
                <Container key={notice.id} {...containerProps} style={[styles.card, Platform.OS === 'android' && styles.androidCard]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                      <MessageSquare color={priorityColor(notice.priority)} size={20} />
                    </View>
                    <View style={styles.headerText}>
                      <Text style={styles.cardTitle}>{notice.title}</Text>
                      <Text style={styles.cardDate}>
                        {new Date(notice.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardContent}>{notice.content}</Text>
                </Container>
              );
            })}
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Create Poll Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Create New Poll</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <X color="#94a3b8" size={24} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalScroll}>
                    <Text style={styles.label}>Question</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="Ask a question..."
                        placeholderTextColor="#64748b"
                        value={newQuestion}
                        onChangeText={setNewQuestion}
                    />

                    <Text style={styles.label}>Options</Text>
                    {newOptions.map((opt, idx) => (
                        <View key={idx} style={styles.optionInputRow}>
                            <TextInput 
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder={`Option ${idx + 1}`}
                                placeholderTextColor="#64748b"
                                value={opt}
                                onChangeText={(t) => updateOptionText(t, idx)}
                            />
                            {newOptions.length > 2 && (
                                <TouchableOpacity onPress={() => removeOptionField(idx)} style={styles.removeOptionBtn}>
                                    <X color="#ef4444" size={20} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {newOptions.length < 5 && (
                        <TouchableOpacity style={styles.addOptionBtn} onPress={addOptionField}>
                            <Plus color="#3b82f6" size={16} />
                            <Text style={styles.addOptionText}>Add Option</Text>
                        </TouchableOpacity>
                    )}

                    <Text style={[styles.label, { marginTop: 24 }]}>Duration</Text>
                    <View style={styles.durationContainer}>
                        {DURATIONS.map((d) => (
                            <TouchableOpacity 
                                key={d.label}
                                style={[styles.durationBtn, duration === d.value && styles.durationBtnActive]}
                                onPress={() => setDuration(d.value)}
                            >
                                <Text style={[styles.durationText, duration === d.value && styles.durationTextActive]}>
                                    {d.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <TouchableOpacity 
                    style={[styles.createBtn, creating && { opacity: 0.7 }]} 
                    onPress={handleCreatePoll}
                    disabled={creating}
                >
                    {creating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.createBtnText}>Create Poll</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
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
    backgroundColor: '#3b82f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: SPACING.l,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
  },
  list: {
    gap: 16,
    marginBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardDate: {
    color: '#94a3b8',
    fontSize: 12,
  },
  cardContent: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  voteOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94a3b8',
    marginRight: 12,
  },
  voteOptionText: {
    color: '#e2e8f0',
    fontSize: 15,
  },
  resultRow: {
    marginBottom: 4,
  },
  resultBarBg: {
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    width: '100%',
    position: 'absolute',
    overflow: 'hidden',
  },
  resultBarFill: {
    height: '100%',
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
  },
  resultTextContainer: {
    height: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  optionText: {
    color: '#fff',
    fontWeight: '500',
  },
  percentText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalScroll: {
    marginBottom: 20,
  },
  label: {
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  optionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  removeOptionBtn: {
    marginLeft: 8,
    padding: 8,
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 8,
  },
  addOptionText: {
    color: '#3b82f6',
    marginLeft: 8,
    fontWeight: '600',
  },
  createBtn: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  durationBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  durationBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  durationText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  durationTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});
