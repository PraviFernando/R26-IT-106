import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, radius, shadows } from '../theme';

const QUICK_ACTIONS = [
    { icon: '😟', en: "I'm feeling anxious", si: 'මට කාංසාවක් දැනෙනවා' },
    { icon: '😔', en: "I've been feeling really low lately", si: 'මට අද මොහොතක් දුකක් දැනෙනවා' },
    { icon: '💜', en: 'I feel really alone', si: 'මට හරිම තනිකමක් දැනෙනවා' },
    { icon: '😴', en: "I can't get enough sleep", si: 'මට හරියට නින්ද යන්නේ නැහැ' },
    { icon: '👶', en: "My baby won't stop crying", si: 'මගේ බබා නවත්තන්නම බැරි විදිහට අඬනවා' },
    { icon: '🍼', en: 'I need help with breastfeeding', si: 'මට කිරි දීම ගැන උදව් අවශ්‍යයි' },
    { icon: '🌊', en: 'I feel overwhelmed with everything', si: 'මට හැමදේම එකවර දරාගන්න බැරි වගේ' },
    { icon: '🆘', en: 'I need to talk to someone urgently', si: 'මට හදිසියේම කෙනෙක් එක්ක කතා කරන්න ඕනේ' },
];

export default function QuickActionsPanel({ isSinhala, onSelect, disabled }) {
    return (
        <View style={s.wrap}>
            <Text style={s.title}>{isSinhala ? 'ඉක්මන් ආරම්භයක්' : 'Quick start'}</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.row}
            >
                {QUICK_ACTIONS.map((action, i) => (
                    <TouchableOpacity
                        key={i}
                        style={s.chip}
                        disabled={disabled}
                        onPress={() => onSelect(isSinhala ? action.si : action.en)}
                        activeOpacity={0.7}
                    >
                        <Text style={s.chipIcon}>{action.icon}</Text>
                        <Text style={s.chipText} numberOfLines={2}>
                            {isSinhala ? action.si : action.en}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    wrap: { marginTop: spacing.md },
    title: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.sm,
        paddingHorizontal: 2,
    },
    row: { paddingRight: spacing.md, gap: spacing.sm },
    chip: {
        width: 150,
        backgroundColor: colors.lavenderLight,
        borderRadius: radius.lg,
        padding: spacing.sm,
        marginRight: spacing.sm,
        ...shadows.soft,
    },
    chipIcon: { fontSize: 20, marginBottom: 6 },
    chipText: { fontSize: 12, fontWeight: '600', color: colors.lavenderDark, lineHeight: 16 },
});
