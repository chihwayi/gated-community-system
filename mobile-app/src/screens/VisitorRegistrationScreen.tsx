import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Check, Share2, Copy } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function VisitorRegistrationScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [visitorData, setVisitorData] = useState({
    name: '',
    phone: '',
    email: '',
    purpose: 'Social',
    date: new Date().toISOString().split('T')[0],
  });

  const handleNext = () => {
    if (step === 1) {
      if (!visitorData.name || !visitorData.phone) {
        Toast.show({
          type: 'error',
          text1: 'Missing Information',
          text2: 'Please enter visitor name and phone number',
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setStep(3);
        Toast.show({
            type: 'success',
            text1: 'Visitor Registered',
            text2: 'QR Code generated successfully',
        });
      }, 1500);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
        <View style={styles.stepWrapper}>
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, step > 1 ? styles.stepCompleted : (step === 1 ? styles.stepActive : styles.stepPending)]}>
                    {step > 1 ? <Check color="#fff" size={16} /> : <Text style={[styles.stepText, step === 1 && styles.stepTextActive]}>1</Text>}
                </View>
                <Text style={[styles.stepLabel, step >= 1 ? styles.labelActive : styles.labelPending]}>Details</Text>
            </View>
            <View style={[styles.stepLine, step > 1 && styles.stepLineActive]} />
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, step > 2 ? styles.stepCompleted : (step === 2 ? styles.stepActive : styles.stepPending)]}>
                    {step > 2 ? <Check color="#fff" size={16} /> : <Text style={[styles.stepText, step === 2 && styles.stepTextActive]}>2</Text>}
                </View>
                <Text style={[styles.stepLabel, step >= 2 ? styles.labelActive : styles.labelPending]}>Review</Text>
            </View>
            <View style={[styles.stepLine, step > 2 && styles.stepLineActive]} />
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, step === 3 ? styles.stepActive : styles.stepPending]}>
                    <Text style={[styles.stepText, step === 3 && styles.stepTextActive]}>3</Text>
                </View>
                <Text style={[styles.stepLabel, step === 3 ? styles.labelActive : styles.labelPending]}>QR Code</Text>
            </View>
        </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Visitor Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>FULL NAME</Text>
        <TextInput
            style={styles.input}
            placeholder="Enter visitor name"
            placeholderTextColor="#9ca3af"
            value={visitorData.name}
            onChangeText={(text) => setVisitorData({...visitorData, name: text})}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>PHONE NUMBER</Text>
        <TextInput
            style={styles.input}
            placeholder="+263 7X XXX XXXX"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={visitorData.phone}
            onChangeText={(text) => setVisitorData({...visitorData, phone: text})}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>EMAIL (OPTIONAL)</Text>
        <TextInput
            style={styles.input}
            placeholder="visitor@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={visitorData.email}
            onChangeText={(text) => setVisitorData({...visitorData, email: text})}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.reviewContainer}>
        <Text style={styles.sectionTitle}>Review Details</Text>
        <View style={styles.reviewCard}>
            <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>FULL NAME</Text>
                <Text style={styles.reviewValue}>{visitorData.name}</Text>
            </View>
            <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>PHONE NUMBER</Text>
                <Text style={styles.reviewValue}>{visitorData.phone}</Text>
            </View>
            <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>EMAIL</Text>
                <Text style={styles.reviewValue}>{visitorData.email || 'Not provided'}</Text>
            </View>
            <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>PURPOSE</Text>
                <View style={styles.tagPurpose}>
                    <Text style={styles.tagTextPurpose}>{visitorData.purpose}</Text>
                </View>
            </View>
            <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>DATE</Text>
                <View style={styles.tagDate}>
                    <Text style={styles.tagTextDate}>{visitorData.date}</Text>
                </View>
            </View>
        </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.qrContainer}>
        <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>Visitor Access Pass</Text>
            <Text style={styles.qrSubtitle}>Share this code with your visitor</Text>
            
            <View style={styles.qrWrapper}>
                <QRCode
                    value={JSON.stringify(visitorData)}
                    size={200}
                    color="black"
                    backgroundColor="white"
                />
            </View>

            <View style={styles.visitorNameContainer}>
                <Text style={styles.visitorNameDisplay}>{visitorData.name}</Text>
                <Text style={styles.validityText}>Valid for {visitorData.date}</Text>
            </View>
        </View>

        <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn}>
                <Share2 color="#374151" size={20} />
                <Text style={styles.actionBtnText}>Share Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
                <Copy color="#374151" size={20} />
                <Text style={styles.actionBtnText}>Copy Link</Text>
            </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('ResidentDashboard')}>
            <Text style={styles.homeBtnText}>Return to Dashboard</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>Register Visitor</Text>
                <Text style={styles.headerSubtitle}>Complete the steps to generate a QR code</Text>
            </View>
        </View>

        {renderStepIndicator()}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
        </ScrollView>

        {step < 3 && (
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.nextButton}
                    onPress={handleNext}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.nextButtonText}>{step === 1 ? 'Review Details' : 'Generate Pass'}</Text>
                    )}
                </TouchableOpacity>
            </View>
        )}
      </SafeAreaView>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  stepContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stepItem: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepActive: {
    backgroundColor: '#3b82f6', // Blue matching dark theme
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stepCompleted: {
    backgroundColor: '#10b981', // Emerald
  },
  stepPending: {
    backgroundColor: 'rgba(255,255,255,0.1)', // Gray
  },
  stepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  stepTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  labelActive: {
    color: '#3b82f6',
  },
  labelPending: {
    color: '#94a3b8',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20, // Align with circle center (approx)
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#3b82f6',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  nextButton: {
    backgroundColor: '#3b82f6', // Use primary gradient color
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  reviewCard: {
    gap: 16,
  },
  reviewRow: {
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  tagPurpose: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tagTextPurpose: {
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: 14,
  },
  tagDate: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tagTextDate: {
    color: '#60a5fa',
    fontWeight: '600',
    fontSize: 14,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
  },
  visitorNameContainer: {
    alignItems: 'center',
  },
  visitorNameDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  validityText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  homeBtn: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  homeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
