import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get('window');

const FinancialDashboardScreen = ({ navigation, route }: any) => {
  const { mode } = route.params || { mode: 'admin' };
  const isResident = mode === 'resident';
  const [selectedPeriod, setSelectedPeriod] = useState('Month');

  const Container = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' as const } : {};
  const backButtonProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'light' as const } : {};

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Container
              {...backButtonProps}
              style={styles.blurButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Container>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isResident ? 'My Finances' : 'Financial Dashboard'}</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerRow}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodSelector}
          >
            {['Week', 'Month', 'Quarter', 'Year'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive,
                ]}>{period}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <Container {...containerProps} style={[styles.summaryCard, Platform.OS === 'android' && styles.androidCard]}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Ionicons name="arrow-up" size={24} color="#10b981" />
              </View>
              <Text style={styles.summaryLabel}>{isResident ? 'Balance Due' : 'Total Income'}</Text>
              <Text style={styles.summaryValue}>{isResident ? '$150.00' : '$24,500'}</Text>
              <Text style={styles.summaryTrend}>{isResident ? 'Due by 30th' : '+12% vs last month'}</Text>
              
              {isResident && (
                <TouchableOpacity style={styles.payBtn}>
                    <Text style={styles.payBtnText}>PAY NOW</Text>
                </TouchableOpacity>
              )}
            </Container>

            <Container {...containerProps} style={[styles.summaryCard, Platform.OS === 'android' && styles.androidCard]}>
              <View style={[styles.iconContainer, { backgroundColor: isResident ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                <Ionicons name={isResident ? "checkmark-circle" : "arrow-down"} size={24} color={isResident ? "#10b981" : "#ef4444"} />
              </View>
              <Text style={styles.summaryLabel}>{isResident ? 'Last Payment' : 'Expenses'}</Text>
              <Text style={styles.summaryValue}>{isResident ? '$150.00' : '$8,200'}</Text>
              <Text style={styles.summaryTrend}>{isResident ? 'Success' : '-5% vs last month'}</Text>
            </Container>
          </View>

          {/* Chart Section */}
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>{isResident ? 'Payment History' : 'Revenue Overview'}</Text>
            <LineChart
              data={{
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [
                  {
                    data: [
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100
                    ]
                  }
                ]
              }}
              width={width - 48} // from react-native
              height={220}
              yAxisLabel="$"
              yAxisSuffix="k"
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: "#1e293b",
                backgroundGradientTo: "#0f172a",
                decimalPlaces: 0, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#10b981"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {[1, 2, 3, 4, 5].map((item) => (
              <Container 
                key={item}
                {...containerProps}
                style={[styles.transactionItem, Platform.OS === 'android' && styles.androidCard]}
              >
                <View style={styles.transactionIcon}>
                  <Ionicons 
                    name={item % 2 === 0 ? "water" : "flash"} 
                    size={24} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {item % 2 === 0 ? "Water Bill Payment" : "Electricity Bill"}
                  </Text>
                  <Text style={styles.transactionDate}>Today, 10:23 AM</Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: item % 2 === 0 ? '#10b981' : '#ef4444' }
                ]}>
                  {item % 2 === 0 ? "+" : "-"}$45.00
                </Text>
              </Container>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRow: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'android' ? 'rgba(30, 41, 59, 0.8)' : 'transparent',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    paddingRight: 24,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  periodButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  periodText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  androidCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  summaryTrend: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  chartContainer: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  transactionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  payBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  payBtnText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 12,
  }
});

export default FinancialDashboardScreen;
