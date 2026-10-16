// Shared building blocks for the exercise screens, matching the PeriCare exercise mockups:
// purple/pink theme, Poppins headings + Inter body, soft cards, big touch targets (>= 44px).
import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../../theme';

// Text styles. On the phone the exact Poppins/Inter files loaded by useFonts in App.js are used;
// on web those font files are not registered, so use a sans-serif stack with the matching weight.
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const font = (nativeFamily, webFamily, weight) => Platform.select({
    web: { fontFamily: `'${webFamily}', ${SANS}`, fontWeight: weight },
    default: { fontFamily: nativeFamily },
});
export const T = {
    heading: font('Poppins_700Bold', 'Poppins', '700'),
    headingSemi: font('Poppins_600SemiBold', 'Poppins', '600'),
    body: font('Inter_400Regular', 'Inter', '400'),
    medium: font('Inter_500Medium', 'Inter', '500'),
    semi: font('Inter_600SemiBold', 'Inter', '600'),
    bold: font('Inter_700Bold', 'Inter', '700'),
};

export const C = {
    bg: colors.screenBg,            // #FAF2FA
    card: colors.cardBg,
    border: colors.cardBorder,      // #F5D3EE
    control: colors.accent,         // #EABDE6
    tint: colors.bgTint,            // #FFDFEF
    soft: colors.softGray,          // #F8EFF7
    primary: colors.primary,        // #AA60C8
    primaryDark: colors.primaryDark, // #873CA6
    secondary: colors.secondary,    // #D69ADE
    text: colors.textPrimary,       // #2C1A35
    textSub: colors.textSecondary,  // #6A4D77
    danger: colors.riskHighDark,    // #C62828
    dangerBg: colors.riskHigh,      // #FFEBEE
    success: colors.riskLowDark,    // #2E7D32
    successBg: colors.riskLow,      // #E8F5E9
    warnBg: colors.riskMedium,      // #FFF8E1
    video: '#2C1A35',
};

export const GRADIENT = [C.primaryDark, C.primary, '#BD83CE'];

export const cardShadow = {
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 3,
};

// ---------- Icons (stroke SVG, no emoji) ----------
const ICONS = {
    back: (c) => <Path d="M15 18l-6-6 6-6" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    close: (c) => <Path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth={2.2} strokeLinecap="round" fill="none" />,
    check: (c) => <Path d="M5 13l4 4L19 7" stroke={c} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    play: (c) => <Path d="M8 5v14l11-7z" fill={c} />,
    pause: (c) => <>{[6, 14].map(x => <Rect key={x} x={x} y={5} width={4} height={14} rx={1} fill={c} />)}</>,
    heart: (c) => <Path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" stroke={c} strokeWidth={2} strokeLinejoin="round" fill="none" />,
    camera: (c) => <><Path d="M4 8h3l2-3h6l2 3h3v11H4z" stroke={c} strokeWidth={2} strokeLinejoin="round" fill="none" /><Circle cx={12} cy={13} r={3.5} stroke={c} strokeWidth={2} fill="none" /></>,
    info: (c) => <><Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" /><Path d="M12 8v5M12 16h.01" stroke={c} strokeWidth={2} strokeLinecap="round" /></>,
    chat: (c) => <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={c} strokeWidth={2} strokeLinejoin="round" fill="none" />,
    clock: (c) => <><Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" /><Path d="M12 7v5l3 2" stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" /></>,
    chart: (c) => <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" />,
    form: (c) => <><Rect x={5} y={4} width={14} height={17} rx={2} stroke={c} strokeWidth={2} fill="none" /><Path d="M9 4h6v3H9zM9 12h6M9 16h4" stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" /></>,
    search: (c) => <><Circle cx={11} cy={11} r={7} stroke={c} strokeWidth={2.2} fill="none" /><Path d="M20 20l-3.5-3.5" stroke={c} strokeWidth={2.2} strokeLinecap="round" /></>,
};

export const Icon = ({ name, size = 20, color = C.text }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" pointerEvents="none">
        {ICONS[name] ? ICONS[name](color) : null}
    </Svg>
);

// ---------- Layout ----------
export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;

export const SectionTitle = ({ children, style }) => <Text style={[s.sectionTitle, style]}>{children}</Text>;

export const Label = ({ children, style }) => <Text style={[s.label, style]}>{children}</Text>;

export const GradientCard = ({ children, style }) => (
    <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.4 }} style={[s.gradientCard, style]}>
        {children}
    </LinearGradient>
);

export const CircleButton = ({ icon, onPress, label, size = 44 }) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
        style={({ hovered }) => [s.circleBtn, { width: size, height: size, borderRadius: size / 2 }, hovered && s.hover]}>
        <Icon name={icon} size={20} color={C.text} />
    </Pressable>
);

// ---------- Choice controls ----------
// One option in a row of equal buttons (single choice)
export const Option = ({ label, selected, onPress, disabled, style }) => (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ selected, disabled }}
        style={({ hovered }) => [s.option, selected && s.optionOn, hovered && !selected && s.hover, disabled && { opacity: 0.6 }, style]}>
        <Text style={[s.optionText, selected && s.optionTextOn]} numberOfLines={2}>{label}</Text>
    </Pressable>
);

export const OptionRow = ({ options, value, onChange, disabled }) => (
    <View style={s.optionRow}>
        {options.map(o => (
            <Option key={o.value} label={o.label} selected={value === o.value} disabled={disabled} onPress={() => onChange(o.value)} />
        ))}
    </View>
);

// Pill that toggles on/off (multi choice)
export const Chip = ({ label, selected, onPress }) => (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}
        style={({ hovered }) => [s.chip, selected && s.optionOn, hovered && !selected && s.hover]}>
        {selected && <Icon name="check" size={14} color={C.primaryDark} />}
        <Text style={[s.optionText, selected && s.optionTextOn]}>{label}</Text>
    </Pressable>
);

// ---------- Buttons ----------
export const PrimaryButton = ({ title, onPress, loading, disabled, icon, style }) => (
    <Pressable onPress={onPress} disabled={disabled || loading} accessibilityRole="button"
        style={({ hovered }) => [s.primaryWrap, (disabled || loading) && { opacity: 0.6 }, hovered && { transform: [{ translateY: -1 }] }, style]}>
        <LinearGradient colors={[C.primaryDark, C.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primary}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : (
                <>
                    {icon && <Icon name={icon} size={18} color="#FFFFFF" />}
                    <Text style={s.primaryText}>{title}</Text>
                </>
            )}
        </LinearGradient>
    </Pressable>
);

export const SecondaryButton = ({ title, onPress, icon, style, disabled }) => (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
        style={({ hovered }) => [s.secondary, hovered && s.hover, disabled && { opacity: 0.6 }, style]}>
        {icon && <Icon name={icon} size={18} color={C.primaryDark} />}
        <Text style={s.secondaryText}>{title}</Text>
    </Pressable>
);

// ---------- Small pieces ----------
export const Badge = ({ text, tone = 'tint', style }) => {
    const tones = {
        tint: { bg: C.tint, fg: C.primaryDark },
        white: { bg: '#FFFFFF', fg: C.primaryDark },
        success: { bg: C.successBg, fg: C.success },
        danger: { bg: C.dangerBg, fg: C.danger },
    };
    const t = tones[tone] || tones.tint;
    return <Text style={[s.badge, { backgroundColor: t.bg, color: t.fg }, style]}>{text}</Text>;
};

export const StatTile = ({ value, label, style }) => (
    <View style={[s.stat, style]}>
        <Text style={s.statValue}>{value}</Text>
        <Text style={s.statLabel}>{label}</Text>
    </View>
);

export const Notice = ({ text, tone = 'warn', icon = 'info' }) => {
    const bg = tone === 'warn' ? C.warnBg : tone === 'tint' ? C.tint : C.soft;
    const fg = tone === 'tint' ? C.primaryDark : C.text;
    return (
        <View style={[s.notice, { backgroundColor: bg }]}>
            <Icon name={icon} size={20} color={tone === 'warn' ? '#B45309' : C.primaryDark} />
            <Text style={[s.noticeText, { color: fg }]}>{text}</Text>
        </View>
    );
};

const s = StyleSheet.create({
    card: { backgroundColor: C.card, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: C.border, ...cardShadow },
    gradientCard: { borderRadius: 24, padding: 18, shadowColor: C.primaryDark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 5 },
    sectionTitle: { ...T.headingSemi, fontSize: 15, color: C.text },
    label: { ...T.semi, fontSize: 13, color: C.textSub },
    circleBtn: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: C.control, alignItems: 'center', justifyContent: 'center' },
    hover: { backgroundColor: C.soft },
    optionRow: { flexDirection: 'row', gap: 8 },
    option: { flex: 1, minHeight: 48, borderRadius: 16, borderWidth: 1.5, borderColor: C.control, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
    optionOn: { borderWidth: 2, borderColor: C.primary, backgroundColor: C.tint },
    optionText: { ...T.semi, fontSize: 14, color: C.text, textAlign: 'center' },
    optionTextOn: { ...T.bold, color: C.primaryDark },
    chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1.5, borderColor: C.control, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 6 },
    primaryWrap: { borderRadius: 28, shadowColor: C.primaryDark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 5 },
    primary: { minHeight: 54, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
    primaryText: { ...T.headingSemi, fontSize: 15, color: '#FFFFFF' },
    secondary: { minHeight: 52, borderRadius: 26, borderWidth: 2, borderColor: C.primary, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
    secondaryText: { ...T.bold, fontSize: 15, color: C.primaryDark },
    badge: { alignSelf: 'flex-start', ...T.bold, fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
    stat: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: C.border, gap: 2, ...cardShadow },
    statValue: { ...T.heading, fontSize: 20, color: C.text },
    statLabel: { ...T.semi, fontSize: 12, color: C.textSub },
    notice: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', borderRadius: 18, padding: 14 },
    noticeText: { flex: 1, ...T.medium, fontSize: 14, lineHeight: 20 },
});
