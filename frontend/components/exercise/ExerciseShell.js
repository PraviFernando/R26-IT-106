// Layout + menu for the exercise screens only (PeriCare exercise mockups):
// wide web screens get a left sidebar, phones get a section bar under the header.
// It only links between the exercise screens; the app's own navigation is untouched.
import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { C, T, Icon } from './ui';
import { goToSection } from '../../utils/exerciseNavigation';

// page frame of the exercise part - a side menu on wide screens (Exercise today, Health form, Progress,
// Watch history) and a top menu on phones. Menu clicks go through utils/exerciseNavigation.js.
export const SIDEBAR_BREAKPOINT = 1024;

export const EXERCISE_SECTIONS = [
    { key: 'today', icon: 'heart', en: 'Exercise today', si: 'අද ව්‍යායාම', short: 'Today', shortSi: 'අද' },
    { key: 'form', icon: 'form', en: 'Health form', si: 'සෞඛ්‍ය පෝරමය', short: 'Health form', shortSi: 'පෝරමය' },
    { key: 'progress', icon: 'chart', en: 'Progress', si: 'ප්‍රගතිය', short: 'Progress', shortSi: 'ප්‍රගතිය' },
    { key: 'history', icon: 'clock', en: 'Watch history', si: 'නැරඹූ ඉතිහාසය', short: 'History', shortSi: 'ඉතිහාසය' },
];


const ExerciseShell = ({ active, navigation, isSinhala, onLocal, header, children }) => {
    const { width } = useWindowDimensions();
    const wide = width >= SIDEBAR_BREAKPOINT;
    const go = (key) => goToSection(navigation, key, onLocal);

    if (wide) {
        return (
            <View style={s.row}>
                <View style={s.sidebar} accessibilityRole="navigation">
                    <Text style={s.brand}>PeriCare</Text>
                    <Text style={s.brandSub}>{isSinhala ? 'ප්‍රසූතියෙන් පසු ව්‍යායාම' : 'Postpartum exercise'}</Text>
                    {EXERCISE_SECTIONS.map(item => {
                        const on = active === item.key;
                        return (
                            <Pressable
                                key={item.key}
                                onPress={() => go(item.key)}
                                accessibilityRole="link"
                                accessibilityState={{ selected: on }}
                                style={({ hovered }) => [s.side, on && s.sideOn, hovered && !on && s.sideHover]}
                            >
                                <Icon name={item.icon} size={20} color={on ? C.primaryDark : C.textSub} />
                                <Text style={[s.sideText, on && s.sideTextOn]}>{isSinhala ? item.si : item.en}</Text>
                            </Pressable>
                        );
                    })}
                </View>
                <View style={s.main}>{header}{children}</View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {header}
            <View style={s.bar} accessibilityRole="tablist">
                {EXERCISE_SECTIONS.map(item => {
                    const on = active === item.key;
                    return (
                        <Pressable
                            key={item.key}
                            onPress={() => go(item.key)}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: on }}
                            style={[s.barItem, on && s.barItemOn]}
                        >
                            <Icon name={item.icon} size={18} color={on ? C.primaryDark : C.textSub} />
                            <Text style={[s.barText, on && s.barTextOn]} numberOfLines={1}>{isSinhala ? item.shortSi : item.short}</Text>
                        </Pressable>
                    );
                })}
            </View>
            <View style={{ flex: 1 }}>{children}</View>
        </View>
    );
};

const s = StyleSheet.create({
    row: { flex: 1, flexDirection: 'row' },
    sidebar: { width: 260, paddingHorizontal: 18, paddingVertical: 24, gap: 6, backgroundColor: '#FFFFFF', borderRightWidth: 1, borderRightColor: C.border },
    brand: { ...T.heading, fontSize: 22, color: C.primaryDark, paddingHorizontal: 12 },
    brandSub: { ...T.medium, fontSize: 13, color: C.textSub, paddingHorizontal: 12, marginBottom: 18 },
    side: { minHeight: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 },
    sideOn: { backgroundColor: C.tint },
    sideHover: { backgroundColor: C.soft },
    sideText: { ...T.semi, fontSize: 15, color: C.textSub },
    sideTextOn: { ...T.bold, color: C.primaryDark },
    main: { flex: 1, minWidth: 0 },
    bar: { flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: C.bg },
    barItem: { flex: 1, minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.border },
    barItemOn: { backgroundColor: C.tint, borderColor: C.primary },
    barText: { ...T.semi, fontSize: 11, color: C.textSub },
    barTextOn: { ...T.bold, color: C.primaryDark },
});

export default ExerciseShell;
