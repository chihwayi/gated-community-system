import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import ResidentDashboard from './src/screens/ResidentDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import GuardDashboard from './src/screens/GuardDashboard';
import VisitorRegistrationScreen from './src/screens/VisitorRegistrationScreen';
import FinancialDashboardScreen from './src/screens/FinancialDashboardScreen';
import ServiceRequestScreen from './src/screens/ServiceRequestScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import BroadcastScreen from './src/screens/BroadcastScreen';
import SecurityMonitorScreen from './src/screens/SecurityMonitorScreen';
import MyQRCodeScreen from './src/screens/MyQRCodeScreen';
import ResidentsScreen from './src/screens/ResidentsScreen';
import ParcelsScreen from './src/screens/ParcelsScreen';
import VehiclesScreen from './src/screens/VehiclesScreen';
import IncidentsScreen from './src/screens/IncidentsScreen';
import VisitorsScreen from './src/screens/VisitorsScreen';
import AmenitiesScreen from './src/screens/AmenitiesScreen';
import DocumentsScreen from './src/screens/DocumentsScreen';
import StaffScreen from './src/screens/StaffScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import { Storage } from './src/utils/storage';
import { COLORS } from './src/constants/theme';
import Toast from 'react-native-toast-message';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [initialParams, setInitialParams] = useState<any>(null);

  useEffect(() => {
    checkPersistence();
  }, []);

  const checkPersistence = async () => {
    try {
      const tenant = await Storage.getTenant();
      if (tenant) {
        setInitialParams({ tenant });
        // Go to Login, assuming session is not persisted yet, just tenant context
        setInitialRoute('Login'); 
      } else {
        setInitialRoute('Landing');
      }
    } catch (e) {
      console.error(e);
      setInitialRoute('Landing');
    }
  };

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator 
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: COLORS.background }
            }}
          >
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              initialParams={initialRoute === 'Login' ? initialParams : undefined}
            />
            <Stack.Screen name="ResidentDashboard" component={ResidentDashboard} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="GuardDashboard" component={GuardDashboard} />
            <Stack.Screen name="VisitorRegistration" component={VisitorRegistrationScreen} />
            <Stack.Screen name="FinancialDashboard" component={FinancialDashboardScreen} />
            <Stack.Screen name="ServiceRequest" component={ServiceRequestScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="Broadcast" component={BroadcastScreen} />
            <Stack.Screen name="SecurityMonitor" component={SecurityMonitorScreen} />
            <Stack.Screen name="MyQRCode" component={MyQRCodeScreen} />
            <Stack.Screen name="Residents" component={ResidentsScreen} />
            <Stack.Screen name="Parcels" component={ParcelsScreen} />
            <Stack.Screen name="Vehicles" component={VehiclesScreen} />
            <Stack.Screen name="Incidents" component={IncidentsScreen} />
            <Stack.Screen name="Visitors" component={VisitorsScreen} />
            <Stack.Screen name="Amenities" component={AmenitiesScreen} />
            <Stack.Screen name="Documents" component={DocumentsScreen} />
            <Stack.Screen name="Staff" component={StaffScreen} />
            <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
