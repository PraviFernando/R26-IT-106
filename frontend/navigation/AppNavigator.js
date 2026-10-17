// ================================================================
// APP NAVIGATOR — AppNavigator.js
// Bottom tabs with Sinhala labels + Art screen in stack
// ================================================================
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows, radius } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

import DashboardScreen from '../screens/DashboardScreen copy';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProgressScreen from '../screens/ProgressScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import ArtScreen from '../screens/ArtScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TABS = [
  { name: 'Home', icon: '🏠', labelSi: 'මුල් පිටුව', labelEn: 'Home', screen: DashboardScreen },
  { name: 'Recommendations', icon: '💜', labelSi: 'ආධාර', labelEn: 'Relief', screen: RecommendationsScreen },
  { name: 'Activity', icon: '🎮', labelSi: 'ක්‍රියාකාරකම්', labelEn: 'Activities', screen: ActivityScreen },
  { name: 'Progress', icon: '📊', labelSi: 'ප්‍රගතිය', labelEn: 'Progress', screen: ProgressScreen },
];

// Chat lives as a top-level stack screen (sibling of "Main" in App.js), not
// inside this Tab.Navigator — so it isn't a real route/state.routes entry.
// It's rendered as an extra tab-bar button that escapes up to that parent stack.
const CHAT_TAB = { name: 'Chat', icon: '💬', labelSi: 'කතාබහ', labelEn: 'Chat' };

const CustomTabBar = ({ state, navigation }) => {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const insets = useSafeAreaInsets();
  const { scale } = useResponsive();
  const labelStyle = { fontSize: scale(8, { min: 10 }) };

  const openChat = () => {
    // Escape this Tab.Navigator, then AppNavigator's own Stack.Navigator,
    // to reach "Chat" registered as a sibling of "Main" in App.js's root stack.
    const rootNav = navigation.getParent()?.getParent() || navigation.getParent() || navigation;
    rootNav.navigate('Chat');
  };

  return (
    <View style={[s.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={s.bar}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const tab = TABS.find(t => t.name === route.name);
          if (!tab) return null;
          const label = isSinhala ? tab.labelSi : tab.labelEn;
          return (
            <TouchableOpacity key={route.key} style={s.tab} activeOpacity={0.75}
              onPress={() => { if (!focused) navigation.navigate(route.name); }}>
              {focused ? (
                <LinearGradient colors={[colors.lavenderDark, colors.roseDark]} style={s.activeChip}>
                  <Text style={s.activeIcon}>{tab.icon}</Text>
                  <Text style={[s.activeLabel, labelStyle]} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
                </LinearGradient>
              ) : (
                <View style={s.inactiveChip}>
                  <Text style={s.inactiveIcon}>{tab.icon}</Text>
                  <Text style={[s.inactiveLabel, labelStyle]} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity key="chat-tab" style={s.tab} activeOpacity={0.75} onPress={openChat}>
          <View style={s.inactiveChip}>
            <Text style={s.inactiveIcon}>{CHAT_TAB.icon}</Text>
            <Text style={[s.inactiveLabel, labelStyle]} numberOfLines={1} adjustsFontSizeToFit>
              {isSinhala ? CHAT_TAB.labelSi : CHAT_TAB.labelEn}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TabsNavigator = () => (
  <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    {TABS.map(tab => (
      <Tab.Screen key={tab.name} name={tab.name} component={tab.screen} />
    ))}
  </Tab.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={TabsNavigator} />
    <Stack.Screen name="Preferences" component={PreferencesScreen} options={{ presentation: 'modal' }} />
    <Stack.Screen name="Art" component={ArtScreen} />
  </Stack.Navigator>
);

const s = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 14, paddingTop: 8 },
  bar: { flexDirection: 'row', width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 32, paddingVertical: 8, paddingHorizontal: 8, ...shadows.strong, alignItems: 'center' },
  tab: { flex: 1, alignItems: 'center' },
  activeChip: { borderRadius: 22, paddingVertical: 8, paddingHorizontal: 8, alignItems: 'center', minWidth: 52 },
  activeIcon: { fontSize: 16 },
  activeLabel: { fontSize: 8, color: colors.white, fontWeight: '800', marginTop: 2 },
  inactiveChip: { paddingVertical: 8, alignItems: 'center' },
  inactiveIcon: { fontSize: 18 },
  inactiveLabel: { fontSize: 8, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
});

export default AppNavigator;
