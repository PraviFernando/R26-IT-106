import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import './i18n';

import { AuthProvider } from './context/AuthContext';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import DiaryScreen from './screens/DiaryScreen';
import PlanScreen from './screens/PlanScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import MidwifeDashboardScreen from './screens/MidwifeDashboardScreen';
import EPDSScreeningScreen from './screens/EPDSScreeningScreen';
import ProfileScreen from './screens/ProfileScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import CareOverviewScreen from './screens/CareOverviewScreen';
import GrowthChartScreen from './screens/GrowthChartScreen';


const Stack = createNativeStackNavigator();


export default function App() {

  return (
    <AuthProvider>

      <SafeAreaProvider>

        <NavigationContainer>

          <StatusBar style="auto" />

          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false
            }}
          >

            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

            <Stack.Screen
              name="Signup"
              component={SignupScreen}
            />

            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
            />

            <Stack.Screen
              name="Diary"
              component={DiaryScreen}
            />

            <Stack.Screen
              name="Plan"
              component={PlanScreen}
            />

            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboardScreen}
            />

            <Stack.Screen
              name="MidwifeDashboard"
              component={MidwifeDashboardScreen}
            />

            <Stack.Screen
              name="EPDSScreening"
              component={EPDSScreeningScreen}
            />

            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
            />

            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
            />

            <Stack.Screen
              name="CareOverview"
              component={CareOverviewScreen}
            />

            <Stack.Screen
              name="GrowthChart"
              component={GrowthChartScreen}
            />

          </Stack.Navigator>


          <Toast />

        </NavigationContainer>

      </SafeAreaProvider>

    </AuthProvider>
  );
}