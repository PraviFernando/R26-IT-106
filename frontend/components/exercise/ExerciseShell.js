// Layout + menu for the exercise screens only, in the same style as the dashboard:
// burger + logo + PeriCare + language pill + avatar on top, and the four exercise sections as pill tabs.
// It only links between the exercise screens; the app's own navigation is untouched.
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { C, T } from './ui';
import { goToSection } from '../../utils/exerciseNavigation';

// page frame of the exercise part - header and four section tabs (Exercise today, Health form, Progress,
// Watch history). Menu clicks go through utils/exerciseNavigation.js.
export const SIDEBAR_BREAKPOINT = 1024;

export const EXERCISE_SECTIONS = [
    { key: 'today', icon: 'heart', en: 'Exercise today', si: 'අද ව්‍යායාම', short: 'Today', shortSi: 'අද' },
    { key: 'form', icon: 'form', en: 'Health form', si: 'සෞඛ්‍ය පෝරමය', short: 'Health form', shortSi: 'පෝරමය' },
    { key: 'progress', icon: 'chart', en: 'Progress', si: 'ප්‍රගතිය', short: 'Progress', shortSi: 'ප්‍රගතිය' },
    { key: 'history', icon: 'clock', en: 'Watch history', si: 'නැරඹූ ඉතිහාසය', short: 'History', shortSi: 'ඉතිහාසය' },
];

const ExerciseShell = ({ active, navigation, isSinhala, onLocal, children }) => {
    const { i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const sidePad = width >= 744 ? 24 : 16; // same side spacing as the page content
    const { user } = useAuth();
    const go = (key) => goToSection(navigation, key, onLocal);
    const initials = String(user?.username || user?.name || user?.email || 'PC').slice(0, 2).toUpperCase();

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={[s.headerWrap, { paddingHorizontal: sidePad }]}>
                <View style={s.header}>
                    {/* Burger: back to the dashboard, where the app menu lives */}
                    <Pressable
                        onPress={() => navigation.navigate('Dashboard')}
                        accessibilityRole="button"
                        accessibilityLabel={isSinhala ? 'මෙනුව විවෘත කරන්න' : 'Open menu'}
                        style={({ hovered }) => [s.burger, hovered && { backgroundColor: C.lilac }]}
                    >
                        {[0, 1, 2].map(i => <View key={i} style={s.menuLine} />)}
                    </Pressable>
                    <View style={s.logo}><Text style={s.logoEmoji}>🌸</Text></View>
                    <Text style={s.brand}>PeriCare</Text>
                    <View style={{ flex: 1 }} />
                    <Pressable
                        onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')}
                        accessibilityRole="button"
                        accessibilityLabel={isSinhala ? 'භාෂාව මාරු කරන්න' : 'Switch language'}
                        style={({ hovered }) => [s.lang, hovered && { backgroundColor: C.lilac }]}
                    >
                        <Text style={s.langText}>{i18n.language === 'en' ? 'සිං' : 'EN'}</Text>
                    </Pressable>
                    <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs} accessibilityRole="tablist">
                    {EXERCISE_SECTIONS.map(item => {
                        const on = active === item.key;
                        return (
                            <Pressable
                                key={item.key}
                                onPress={() => go(item.key)}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: on }}
                                style={({ hovered }) => [s.tab, on && s.tabOn, hovered && !on && { backgroundColor: C.lilac }]}
                            >
                                <Text style={[s.tabText, on && s.tabTextOn]} numberOfLines={1}>{isSinhala ? item.si : item.en}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>
            <View style={{ flex: 1 }}>{children}</View>
        </View>
    );
};

const s = StyleSheet.create({
    headerWrap: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 12, gap: 12 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    burger: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    menuLine: { width: 18, height: 2, borderRadius: 2, marginVertical: 2, backgroundColor: '#2C1A35' },
    logo: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.lilac, alignItems: 'center', justifyContent: 'center' },
    logoEmoji: { fontSize: 17 },
    brand: { ...T.heading, fontSize: 20, color: C.text },
    lang: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: C.border, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    langText: { ...T.medium, fontSize: 13, color: C.text },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.lilac, alignItems: 'center', justifyContent: 'center' },
    avatarText: { ...T.semi, fontSize: 13, color: C.primaryDark },
    tabs: { gap: 8, paddingBottom: 4, paddingRight: 8 },
    tab: { minHeight: 44, paddingHorizontal: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
    tabOn: { backgroundColor: C.lilac, borderColor: C.secondary },
    tabText: { ...T.semi, fontSize: 14, color: C.textSub },
    tabTextOn: { color: C.primaryDark },
});

export default ExerciseShell;
