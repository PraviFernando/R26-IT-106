import './i18n'; // Initialize i18next with Sinhala translations
import React, { useState, useEffect } from 'react';

import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './services/AppContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [brightnessLevel, setBrightnessLevel] = useState(1.0);
  const [currentRouteName, setCurrentRouteName] = useState('');

  const getActiveRouteName = (state) => {
    if (!state) return null;
    const route = state.routes[state.index];
    if (route.state) {
      return getActiveRouteName(route.state);
    }
    return route.name;
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('app_theme');
        const storedBrightness = await AsyncStorage.getItem('app_brightness');
        setIsDarkMode(storedTheme === 'dark');
        if (storedBrightness) {
          setBrightnessLevel(parseFloat(storedBrightness));
        }
      } catch (e) {
        console.log('Error reading global theme preferences:', e);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <SafeAreaProvider>
          <View style={{ flex: 1 }}>
            <NavigationContainer
              theme={isDarkMode ? DarkTheme : DefaultTheme}
              onStateChange={(state) => {
                const routeName = getActiveRouteName(state);
                if (routeName) {
                  setCurrentRouteName(routeName);
                }
              }}
            >
              <StatusBar style={isDarkMode ? 'light' : 'dark'} />
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
                <Stack.Screen name="DashboardCopy" component={DashboardScreenCopy} options={{ headerShown: false }} />
                <Stack.Screen name="Main" component={AppNavigator} options={{ headerShown: false }} />
                <Stack.Screen name="Diary" component={DiaryScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Plan" component={PlanScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
                <Stack.Screen name="MidwifeDashboard" component={MidwifeDashboardScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Exercise" component={ExerciseScreen} options={{ headerShown: false }} />
                <Stack.Screen
                  name="Onboarding"
                  component={OnboardingScreen} options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="EPDSScreening"
                  component={EPDSScreeningScreen} options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="CareOverview"
                  component={CareOverviewScreen} options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Profile"
                  component={ProfileScreen} options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="GrowthChart"
                  component={GrowthChartScreen} options={{ headerShown: false }}
                />
                <Stack.Screen name="Progress" component={ProgressScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ExerciseProgress" component={ExerciseProgressScreen} options={{ headerShown: false }} />
                <Stack.Screen name="MovementTracking" component={MovementTrackingScreen} options={{ headerShown: false }} />
                <Stack.Screen name="BabyDevelopment" component={BabyDevelopmentScreen} options={{ headerShown: false }} />
                <Stack.Screen name="BabyActivityDetail" component={BabyActivityDetailScreen} options={{ headerShown: false }} />
                <Stack.Screen name="BabyCategory" component={BabyCategoryScreen} options={{ headerShown: false }} />
              </Stack.Navigator>
            </NavigationContainer>
            {/* Global Toast */}
            <Toast />



            {/* Global Brightness dimmer overlay */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#000',
                opacity: (1.0 - brightnessLevel) * 0.68,
                zIndex: 99999,
              }}
              pointerEvents="none"
            />
          </View>
        </SafeAreaProvider>
      </AppProvider>
    </AuthProvider>
  );
}