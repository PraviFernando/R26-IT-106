import './i18n'; // Initialize i18next with Sinhala translations
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './context/AuthContext';
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
import OnboardingScreen from './screens/OnboardingScreen';
import CareOverviewScreen from './screens/CareOverviewScreen';
import GrowthChartScreen from './screens/GrowthChartScreen';
import EPDSScreeningScreen from './screens/EPDSScreeningScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="DashboardCopy" component={DashboardScreenCopy} />
              <Stack.Screen name="Main" component={AppNavigator} />
              <Stack.Screen name="Diary" component={DiaryScreen} />
              <Stack.Screen name="Plan" component={PlanScreen} />
              <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
              <Stack.Screen name="MidwifeDashboard" component={MidwifeDashboardScreen} />
              <Stack.Screen name="Exercise" component={ExerciseScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="EPDSScreening" component={EPDSScreeningScreen} />
              <Stack.Screen name="CareOverview" component={CareOverviewScreen} />
              <Stack.Screen name="GrowthChart" component={GrowthChartScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Progress" component={ProgressScreen} />
              <Stack.Screen name="ExerciseProgress" component={ExerciseProgressScreen} />
              <Stack.Screen name="MovementTracking" component={MovementTrackingScreen} />
              <Stack.Screen name="BabyDevelopment" component={BabyDevelopmentScreen} />
              <Stack.Screen name="BabyActivityDetail" component={BabyActivityDetailScreen} />
              <Stack.Screen name="BabyCategory" component={BabyCategoryScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <Toast />
        </SafeAreaProvider>
      </AppProvider>
    </AuthProvider>
  );
}