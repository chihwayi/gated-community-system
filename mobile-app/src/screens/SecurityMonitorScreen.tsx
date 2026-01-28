import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Video, AlertTriangle, UserCheck, Clock } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

const INCIDENTS = [
  { id: '1', title: 'Perimeter Breach Warning', time: '10 min ago', type: 'high', location: 'North Fence' },
  { id: '2', title: 'Unauthorized Parking', time: '1 hr ago', type: 'medium', location: 'Block C' },
];

const LOGS = [
  { id: '1', event: 'Guard Shift Change', time: '08:00 AM', user: 'Mike T.' },
  { id: '2', event: 'System Check', time: '07:30 AM', user: 'Auto' },
];

export default function SecurityMonitorScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a1628', '#020617']}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security Monitor</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          <Text style={styles.sectionTitle}>Live Feeds</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.feedsContainer}>
            {[1, 2, 3].map((i) => (
                <View key={i} style={styles.feedCard}>
                    <View style={styles.feedPlaceholder}>
                        <Video color="#475569" size={32} />
                    </View>
                    <View style={styles.feedLabelContainer}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.feedLabel}>Cam {i} - Main Gate</Text>
                    </View>
                </View>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Recent Incidents</Text>
          <View style={styles.list}>
            {INCIDENTS.map((inc) => (
              <View key={inc.id} style={styles.incidentCard}>
                <View style={[styles.incidentIcon, { backgroundColor: inc.type === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)' }]}>
                    <AlertTriangle color={inc.type === 'high' ? '#ef4444' : '#f59e0b'} size={20} />
                </View>
                <View style={styles.incidentContent}>
                    <Text style={styles.incidentTitle}>{inc.title}</Text>
                    <Text style={styles.incidentSub}>{inc.location} • {inc.time}</Text>
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>Review</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Security Logs</Text>
          <View style={styles.list}>
            {LOGS.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <Clock color="#94a3b8" size={16} style={{ marginRight: 12 }} />
                <View style={styles.logContent}>
                    <Text style={styles.logEvent}>{log.event}</Text>
                    <Text style={styles.logTime}>{log.time} • {log.user}</Text>
                </View>
              </View>
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
    backgroundColor: '#050810',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
  },
  feedsContainer: {
    marginHorizontal: -SPACING.l,
    paddingHorizontal: SPACING.l,
    marginBottom: 24,
  },
  feedCard: {
    width: 200,
    height: 120,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  feedPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  feedLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  feedLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  list: {
    gap: 12,
    marginBottom: 24,
  },
  incidentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  incidentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incidentContent: {
    flex: 1,
  },
  incidentTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  incidentSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  logContent: {
    flex: 1,
  },
  logEvent: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  logTime: {
    color: '#64748b',
    fontSize: 12,
  },
});
