import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Radio, Send, Users, Shield } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING } from '../constants/theme';

export default function BroadcastScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!title || !message) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please enter a title and message.',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Broadcast Sent',
        text2: `Message sent to ${target === 'all' ? 'All Residents' : target === 'staff' ? 'Staff' : 'Security'}.`,
      });
      navigation.goBack();
    }, 1500);
  };

  const targets = [
    { id: 'all', label: 'All Residents', icon: Users },
    { id: 'security', label: 'Security Team', icon: Shield },
    { id: 'staff', label: 'Staff', icon: Users },
  ];

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
          <Text style={styles.headerTitle}>Broadcast Message</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content}>
            
            <View style={styles.iconHeader}>
                <View style={styles.iconCircle}>
                    <Radio color="#f59e0b" size={40} />
                </View>
                <Text style={styles.subTitle}>Send Announcement</Text>
            </View>

            <Text style={styles.label}>Target Audience</Text>
            <View style={styles.targetContainer}>
                {targets.map((t) => (
                    <TouchableOpacity
                        key={t.id}
                        style={[
                            styles.targetCard,
                            target === t.id && styles.targetCardActive
                        ]}
                        onPress={() => setTarget(t.id)}
                    >
                        <t.icon color={target === t.id ? '#f59e0b' : '#94a3b8'} size={24} />
                        <Text style={[
                            styles.targetText,
                            target === t.id && styles.targetTextActive
                        ]}>{t.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Water Supply Maintenance"
                placeholderTextColor="#64748b"
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Message</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Type your message here..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={6}
                value={message}
                onChangeText={setMessage}
                textAlignVertical="top"
            />

          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
                style={styles.sendBtn}
                onPress={handleSend}
                disabled={loading}
            >
                <LinearGradient
                    colors={['#f59e0b', '#d97706']}
                    style={styles.sendGradient}
                >
                    {loading ? (
                        <Text style={styles.sendText}>Sending...</Text>
                    ) : (
                        <>
                            <Text style={styles.sendText}>Send Broadcast</Text>
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
  iconHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  subTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  targetContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  targetCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  targetCardActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b',
  },
  targetText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  targetTextActive: {
    color: '#f59e0b',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
  },
  textArea: {
    minHeight: 120,
  },
  footer: {
    padding: SPACING.l,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  sendBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sendGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
