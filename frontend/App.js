import './i18n'; // Initialize i18next with Sinhala translations
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from './context/AuthContext';
import { navigationRef } from './navigation/navigationRef';
import { AppProvider } from './services/AppContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import DashboardScreenCopy from './screens/DashboardScreen copy';
import AppNavigator from './navigation/AppNavigator';
import DiaryScreen from './screens/DiaryScreen';
import PlanScreen from './screens/PlanScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import MidwifeDashboardScreen from './screens/MidwifeDashboardScreen';
import ExerciseScreen from './screens/ExerciseScreen';
import ProgressScreen from './screens/ProgressScreen';
import ExerciseProgressScreen from './screens/ExerciseProgressScreen';
import BabyDevelopmentScreen from './screens/BabyDevelopmentScreen';
import BabyActivityDetailScreen from './screens/BabyActivityDetailScreen';
import BabyCategoryScreen from './screens/BabyCategoryScreen';
import MovementTrackingScreen from './screens/MovementTrackingScreen';
import ChatScreen from './screens/ChatScreen';
import EPDSScreeningScreen from './screens/EPDSScreeningScreen';

const Stack = createNativeStackNavigator();

const routeForRole = (role) => {
  if (role === 'admin') return 'AdminDashboard';
  if (role === 'midwife') return 'MidwifeDashboard';
  return 'Dashboard';
};

function RootNavigator() {
  const { token, user, restoring } = useAuth();

  // Hold rendering until the persisted session has been read, so we don't
  // flash the Login screen before jumping to a dashboard on reload.
  if (restoring) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const initialRouteName = token ? routeForRole(user?.role) : 'Login';

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DashboardCopy" component={DashboardScreenCopy} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={AppNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Diary" component={DiaryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Plan" component={PlanScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MidwifeDashboard" component={MidwifeDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Exercise" component={ExerciseScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Progress" component={ProgressScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ExerciseProgress" component={ExerciseProgressScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MovementTracking" component={MovementTrackingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BabyDevelopment" component={BabyDevelopmentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BabyActivityDetail" component={BabyActivityDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BabyCategory" component={BabyCategoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EPDSScreening" component={EPDSScreeningScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <SafeAreaProvider>
          <RootNavigator />
          {/* Global Toast */}
          <Toast />
        </SafeAreaProvider>
      </AppProvider>
    </AuthProvider>
  );
}
