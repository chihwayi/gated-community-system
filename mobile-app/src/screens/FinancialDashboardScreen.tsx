import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, DollarSign, TrendingUp, TrendingDown, FileText, PieChart, CreditCard, Clock, CheckCircle } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

const ADMIN_STATS = [
  {
    id: '1',
    title: 'Total Revenue',
    value: '$153,890',
    sub: 'This month',
    trend: '+12.5%',
    trendUp: true,
    icon: DollarSign,
    gradient: ['#667eea', '#764ba2'], // Purple/Blue
  },
  {
    id: '2',
    title: 'Collection Rate',
    value: '98.5%',
    sub: 'Target met',
    trend: '+3.2%',
    trendUp: true,
    icon: PieChart,
    gradient: ['#f093fb', '#f5576c'], // Pink/Red
  },
  {
    id: '3',
    title: 'Arrears',
    value: '$4,250',
    sub: '12 Households',
    trend: '-2.4%',
    trendUp: false,
    icon: TrendingDown,
    gradient: ['#fa709a', '#fee140'], // Orange/Yellow
  },
  {
    id: '4',
    title: 'Outstanding',
    value: '$1,200',
    sub: 'Due this week',
    trend: 'Stable',
    trendUp: true,
    icon: FileText,
    gradient: ['#30cfd0', '#330867'], // Teal/Purple
  },
];

const RESIDENT_STATS = [
  {
    id: '1',
    title: 'Balance Due',
    value: '$150.00',
    sub: 'Due by 30th',
    trend: 'Pending',
    trendUp: false,
    icon: DollarSign,
    gradient: ['#f5576c', '#f093fb'], // Red/Pink
  },
  {
    id: '2',
    title: 'Last Payment',
    value: '$150.00',
    sub: 'Paid on 1st',
    trend: 'Success',
    trendUp: true,
    icon: CheckCircle,
    gradient: ['#10b981', '#34d399'], // Green
  },
];

export default function FinancialDashboardScreen({ navigation, route }: any) {
  const { mode } = route.params || { mode: 'admin' };
  const isResident = mode === 'resident';

  const stats = isResident ? RESIDENT_STATS : ADMIN_STATS;

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
          <LinearGradient
            colors={['#f5f7fa', '#c3cfe2']}
            style={styles.background}
          />
      </View>
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ChevronLeft color="#1f2937" size={24} />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>{isResident ? 'My Finances' : 'Financial Dashboard'}</Text>
                <Text style={styles.headerSubtitle}>{isResident ? 'Manage your payments' : 'Manage estate finances & payments'}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>{isResident ? 'Statement' : 'Export'}</Text>
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Key Metrics Grid */}
            <View style={styles.grid}>
                {stats.map((card) => (
                    <LinearGradient
                        key={card.id}
                        colors={card.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.card, isResident && styles.cardFullWidth]}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.iconContainer}>
                                <card.icon color="#fff" size={20} />
                            </View>
                            <View style={[styles.trendBadge, card.trendUp ? styles.trendUp : styles.trendDown]}>
                                <Text style={[styles.trendText, card.trendUp ? styles.trendTextUp : styles.trendTextDown]}>
                                    {card.trend}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.cardLabel}>{card.title}</Text>
                        <Text style={styles.cardValue}>{card.value}</Text>
                        <Text style={styles.cardSub}>{card.sub}</Text>
                        
                        {/* Progress Bar for Collection Rate (Admin Only) */}
                        {!isResident && card.id === '2' && (
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '98.5%' }]} />
                            </View>
                        )}
                        
                         {/* Pay Now Button (Resident Only - Balance Due) */}
                        {isResident && card.id === '1' && (
                            <TouchableOpacity style={styles.payBtn}>
                                <Text style={styles.payBtnText}>PAY NOW</Text>
                            </TouchableOpacity>
                        )}
                    </LinearGradient>
                ))}
            </View>

            {/* Chart Area (Admin Only) */}
            {!isResident && (
                <View style={styles.chartContainer}>
                    <Text style={styles.sectionTitle}>Revenue Overview</Text>
                    <View style={styles.chartPlaceholder}>
                        {[60, 80, 45, 90, 75, 85, 100].map((height, index) => (
                            <View key={index} style={styles.barContainer}>
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    style={[styles.bar, { height: `${height}%` }]}
                                />
                                <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Recent Payments */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>{isResident ? 'Payment History' : 'Recent Transactions'}</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>View All</Text>
                    </TouchableOpacity>
                </View>
                
                {[1, 2, 3].map((i) => (
                    <View key={i} style={styles.listItem}>
                        <View style={styles.listIcon}>
                            <DollarSign color="#059669" size={20} />
                        </View>
                        <View style={styles.listInfo}>
                            <Text style={styles.listTitle}>{isResident ? 'Monthly Levy' : `Levy Payment - House #${88 + i}`}</Text>
                            <Text style={styles.listSub}>Today, 10:3{i} AM</Text>
                        </View>
                        <Text style={styles.listAmount}>-$150.00</Text>
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
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  background: {
    flex: 1,
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
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardFullWidth: {
      width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
  },
  trendUp: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  trendDown: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  trendTextUp: {
    color: '#fff',
  },
  trendTextDown: {
    color: '#fff',
  },
  cardLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  chartContainer: {
    marginHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  barContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 20,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  listContainer: {
    paddingHorizontal: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  listSub: {
    fontSize: 13,
    color: '#6b7280',
  },
  listAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  payBtn: {
      marginTop: 16,
      backgroundColor: '#fff',
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
  },
  payBtnText: {
      color: '#f5576c',
      fontWeight: 'bold',
      fontSize: 12,
  }
});
