import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Settings, Video, Car, Check, X, Clock, User, Home, FileText, AlertTriangle, Shield 
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

const PulseIndicator = ({ color = COLORS.error }: { color?: string }) => {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.pulseIndicator,
        { backgroundColor: color, transform: [{ scale: anim }] },
      ]}
    />
  );
};

const CameraFeed = ({ 
  title, 
  status, 
  statusColor, 
  active, 
  vehicle, 
  camId 
}: { 
  title: string; 
  status: string; 
  statusColor: string; 
  active: boolean; 
  vehicle?: any; 
  camId: string; 
}) => {
  return (
    <View style={styles.cameraContainer}>
      <View style={styles.cameraHeader}>
        <View style={styles.cameraTitleRow}>
          <Video color={active ? COLORS.primary : COLORS.success} size={20} />
          <Text style={styles.cameraTitle}>{title}</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: `${statusColor}20` }]}>
          {active && <PulseIndicator color={statusColor} />}
          {!active && <View style={[styles.staticIndicator, { backgroundColor: statusColor }]} />}
          <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>

      <View style={styles.feedPlaceholder}>
        <LinearGradient
          colors={['#1e293b', '#0f172a']}
          style={styles.feedGradient}
        >
          <View style={styles.feedContent}>
            {active ? (
              <>
                <Car color={COLORS.textSecondary} size={48} />
                <Text style={styles.feedText}>Vehicle approaching...</Text>
                <Text style={styles.feedSubText}>License plate detection active</Text>
              </>
            ) : (
              <Text style={styles.feedText}>No activity detected</Text>
            )}
          </View>
          
          <View style={styles.feedOverlay}>
            <BlurView intensity={20} tint="dark" style={styles.overlayTag}>
              <Text style={styles.overlayText}>{camId}</Text>
            </BlurView>
            <BlurView intensity={20} tint="dark" style={styles.overlayTag}>
              <Text style={styles.overlayText}>{new Date().toLocaleTimeString('en-US', { hour12: false })}</Text>
            </BlurView>
          </View>
        </LinearGradient>

        {/* Scanline Effect Overlay (Simulated) */}
        <View style={styles.scanlineOverlay} pointerEvents="none" />
      </View>

      {active && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
            onPress={() => {
                Toast.show({
                    type: 'success',
                    text1: 'Access Granted',
                    text2: `Gate opened for ${camId}`,
                });
            }}
          >
            <Check color="#fff" size={20} />
            <Text style={styles.actionBtnText}>GRANT ACCESS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: COLORS.error }]}
            onPress={() => {
                Toast.show({
                    type: 'error',
                    text1: 'Access Denied',
                    text2: `Gate remains closed for ${camId}`,
                });
            }}
          >
            <X color="#fff" size={20} />
            <Text style={styles.actionBtnText}>DENY ACCESS</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const StatBox = ({ label, value, color, subLabel }: { label: string; value: string; color: string; subLabel?: string }) => (
  <LinearGradient
    colors={[`${color}10`, `${color}05`]}
    style={[styles.statBox, { borderColor: `${color}30` }]}
  >
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    {subLabel && <Text style={styles.statSubLabel}>{subLabel}</Text>}
  </LinearGradient>
);

const VehicleCard = ({ plate, model, owner, house, type }: { plate: string; model: string; owner: string; house: string; type: string }) => (
  <LinearGradient
    colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']}
    style={styles.vehicleCard}
  >
    <View style={styles.vehicleHeader}>
      <View>
        <Text style={styles.plateNumber}>{plate}</Text>
        <Text style={styles.vehicleModel}>{model}</Text>
      </View>
      <PulseIndicator color={COLORS.error} />
    </View>

    <View style={styles.vehicleDetails}>
      <View style={styles.detailRow}>
        <User size={16} color={COLORS.primary} />
        <Text style={styles.detailText}>{owner}</Text>
      </View>
      <View style={styles.detailRow}>
        <Home size={16} color={COLORS.success} />
        <Text style={styles.detailText}>{house}</Text>
      </View>
      <View style={styles.detailRow}>
        <FileText size={16} color={COLORS.accent} />
        <Text style={styles.detailText}>{type}</Text>
      </View>
    </View>

    <View style={styles.cardActions}>
      <TouchableOpacity style={[styles.cardBtn, { backgroundColor: COLORS.success }]}>
        <Text style={styles.cardBtnText}>ALLOW</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.cardBtn, { backgroundColor: COLORS.error }]}>
        <Text style={styles.cardBtnText}>DENY</Text>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

export default function GuardDashboard() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <BlurView intensity={20} tint="dark" style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>GATE MONITORING</Text>
              <View style={styles.headerMeta}>
                <View style={styles.liveIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.liveText}>LIVE RECORDING</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.gateText}>Gate 1 & Gate 2</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsBtn}>
              <Settings color="#fff" size={20} />
              <Text style={styles.settingsText}>SETTINGS</Text>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Camera Feeds */}
        <View style={styles.section}>
          <CameraFeed 
            title="GATE 1 - MAIN ENTRANCE" 
            status="LIVE" 
            statusColor={COLORS.error} 
            active={true}
            camId="CAM-01-MAIN"
          />
          <CameraFeed 
            title="GATE 2 - SERVICE ENTRANCE" 
            status="CLEAR" 
            statusColor={COLORS.success} 
            active={false}
            camId="CAM-02-SERVICE"
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatBox label="TODAY'S ENTRIES" value="87" color={COLORS.primary} />
          <StatBox label="CURRENTLY INSIDE" value="28" color={COLORS.success} />
          <StatBox label="AVG. WAIT TIME" value="45s" color={COLORS.warning} />
        </View>

        {/* Pending Verification */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield color={COLORS.warning} size={20} />
            <Text style={styles.sectionTitle}>PENDING VERIFICATION</Text>
          </View>
          <VehicleCard 
            plate="ABC-5678" 
            model="Toyota Corolla • Silver" 
            owner="John Doe" 
            house="House #124" 
            type="Pre-registered"
          />
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.sectionHeader}>
            <Clock color={COLORS.primary} size={20} />
            <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          </View>
          
          {/* Timeline Items */}
          <View style={styles.timeline}>
            {[
              { time: '14:20', event: 'Guest Entry Approved', detail: 'House #89 • Sarah Smith', type: 'success' },
              { time: '14:15', event: 'Delivery Denied', detail: 'No valid code • Amazon', type: 'error' },
              { time: '14:10', event: 'Resident Entry', detail: 'House #12 • Mike Ross', type: 'info' },
            ].map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLine} />
                <View style={[styles.timelineDot, { borderColor: item.type === 'success' ? COLORS.success : item.type === 'error' ? COLORS.error : COLORS.primary }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTime}>{item.time}</Text>
                  <Text style={styles.timelineEvent}>{item.event}</Text>
                  <Text style={styles.timelineDetail}>{item.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.m,
  },
  header: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.l,
    marginBottom: SPACING.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(6, 182, 212, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  liveText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.surfaceHighlight,
  },
  gateText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHighlight,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    gap: SPACING.s,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  section: {
    marginBottom: SPACING.l,
    gap: SPACING.m,
  },
  cameraContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  cameraTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  cameraTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.s,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  staticIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  feedPlaceholder: {
    height: 200,
    borderRadius: BORDER_RADIUS.m,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: SPACING.m,
  },
  feedGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  feedText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.s,
  },
  feedSubText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'System', // Monospace if available, or default
    marginTop: 4,
    opacity: 0.7,
  },
  feedOverlay: {
    position: 'absolute',
    top: SPACING.m,
    left: SPACING.m,
    right: SPACING.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  overlayTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.s,
    overflow: 'hidden',
  },
  overlayText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
    // Simulate scanlines with repeating gradient if needed, or simple opacity
    opacity: 0.1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    gap: SPACING.s,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.s,
    marginBottom: SPACING.l,
  },
  statBox: {
    flex: 1,
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  statSubLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  vehicleCard: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.m,
  },
  plateNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.warning,
    letterSpacing: 2,
  },
  vehicleModel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  vehicleDetails: {
    gap: SPACING.s,
    marginBottom: SPACING.m,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  detailText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  cardBtn: {
    flex: 1,
    padding: SPACING.s,
    borderRadius: BORDER_RADIUS.s,
    alignItems: 'center',
  },
  cardBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  timeline: {
    marginLeft: SPACING.s,
  },
  timelineItem: {
    paddingLeft: SPACING.xl,
    paddingBottom: SPACING.l,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 10,
    bottom: -10,
    width: 2,
    backgroundColor: COLORS.surfaceHighlight,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: COLORS.background,
    zIndex: 1,
  },
  timelineContent: {
    gap: 2,
  },
  timelineTime: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'System',
  },
  timelineEvent: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  timelineDetail: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
