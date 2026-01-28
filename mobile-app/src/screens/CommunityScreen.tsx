import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ArrowLeft, MessageSquare, Calendar, Vote, Plus, BarChart2 } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

const NOTICES = [
  { id: '1', title: 'Pool Maintenance', date: 'Today, 10:00 AM', type: 'maintenance', content: 'The main swimming pool will be closed for scheduled maintenance until 2 PM.' },
  { id: '2', title: 'Community BBQ', date: 'Sat, 15 Jun', type: 'event', content: 'Join us for the annual summer BBQ at the clubhouse!' },
  { id: '3', title: 'Gate System Update', date: 'Yesterday', type: 'system', content: 'The main gate access system has been updated. Please use the new app version.' },
];

const POLLS = [
  { id: '1', question: 'New Gym Equipment', votes: 45, status: 'Active' },
];

export default function CommunityScreen({ navigation, route }: any) {
  const { mode } = route.params || {};
  const isAdmin = mode === 'admin';

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
          <Text style={styles.headerTitle}>{isAdmin ? 'Community Management' : 'Community'}</Text>
          {isAdmin ? (
            <TouchableOpacity style={styles.addButton}>
                <Plus color="#fff" size={24} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          <Text style={styles.sectionTitle}>Notices & Announcements</Text>
          <View style={styles.list}>
            {NOTICES.map((notice) => (
              <BlurView key={notice.id} intensity={20} tint="dark" style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    {notice.type === 'event' ? <Calendar color="#f59e0b" size={20} /> : 
                     notice.type === 'maintenance' ? <MessageSquare color="#ef4444" size={20} /> :
                     <MessageSquare color="#3b82f6" size={20} />}
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.cardTitle}>{notice.title}</Text>
                    <Text style={styles.cardDate}>{notice.date}</Text>
                  </View>
                  {isAdmin && (
                    <TouchableOpacity>
                        <Text style={{color: '#3b82f6', fontWeight: 'bold'}}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.cardContent}>{notice.content}</Text>
              </BlurView>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Active Polls</Text>
          <View style={styles.list}>
            {POLLS.map((poll) => (
              <BlurView key={poll.id} intensity={20} tint="dark" style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                    <Vote color="#8b5cf6" size={20} />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.cardTitle}>{poll.question}</Text>
                    <Text style={styles.cardDate}>{poll.votes} votes • {poll.status}</Text>
                  </View>
                </View>
                {isAdmin ? (
                    <TouchableOpacity style={[styles.voteBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                            <BarChart2 color="#fff" size={16} />
                            <Text style={styles.voteBtnText}>View Results</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.voteBtn}>
                        <Text style={styles.voteBtnText}>Vote Now</Text>
                    </TouchableOpacity>
                )}
              </BlurView>
            ))}
          </View>

        </ScrollView>
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
    backgroundColor: '#3b82f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: SPACING.l,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  voteBtn: {
    marginTop: 12,
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  voteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
