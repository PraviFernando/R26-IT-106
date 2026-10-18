// Shared building blocks for the exercise screens, matching the PeriCare dashboard look:
// warm off-white page, serif headings + Inter body, thin-bordered white cards, pill buttons,
// big touch targets (>= 44px).
import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useFonts } from 'expo-font';
import { Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { colors, typography } from '../../theme';

// Fonts: Poppins (headings) + Inter (body), loaded by the exercise screens themselves under
// names only these screens use (ExPoppins700, ...). Other screens are not affected.
// shared look of the exercise part (fonts, colours C, text styles T, cards, buttons, chips, bar chart).
// It follows the PeriCare theme. These are used only inside the exercise screens.
export const useExerciseFonts = () => {
    const [loaded] = useFonts({
        ExPoppins700: Poppins_700Bold,
        ExPoppins600: Poppins_600SemiBold,
        ExInter400: Inter_400Regular,
        ExInter500: Inter_500Medium,
        ExInter600: Inter_600SemiBold,
        ExInter700: Inter_700Bold,
    });
    return loaded;
};

const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
// On web a fallback stack + weight keeps text sans-serif until the font file has loaded
const font = (family, weight) => Platform.select({
    web: { fontFamily: family + ', ' + SANS, fontWeight: weight },
    default: { fontFamily: family },
});
// Serif headings, the same as the dashboard (SERIF in DashboardScreen)
const SERIF = Platform.select({
    web: { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: '400' },
    ios: { fontFamily: 'Georgia' },
    default: { fontFamily: 'serif' },
});
// Same font families as the dashboard (theme typography): Inter for text, serif for headings.
// On the web the dashboard shows Inter at regular weight, so no extra bold weight is added here.
export const T = {
    heading: SERIF,
    headingSemi: { fontFamily: typography.subTopicFont },
    body: { fontFamily: typography.bodyFont },
    medium: { fontFamily: typography.mediumFont },
    semi: { fontFamily: typography.subTopicFont },
    bold: { fontFamily: typography.boldFont },
};

export const C = {
    bg: '#FCF8F5',                  // warm off-white page, as on the dashboard
    card: colors.cardBg,
    border: '#F3D9F0',              // thin card border
    control: '#E7CDE9',             // option / input border
    lilac: '#F5E6FB',               // soft lilac panels and selected options
    peach: '#FFF2EB',               // gentle notices
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
    warnBg: '#FFF2EB',
    video: '#2C1A35',
};

export const GRADIENT = [C.primaryDark, C.primary, '#BD83CE'];

// The dashboard cards have no shadow, only a thin border
export const cardShadow = {};

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

// Soft lilac panel (replaces the old purple gradient panel)
export const SoftCard = ({ children, style }) => <View style={[s.softCard, style]}>{children}</View>;

// Progress ring, e.g. "1/3 done today"
export const Ring = ({ value, total, size = 120, label, sub }) => {
    const stroke = Math.round(size * 0.12);
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const pct = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
    return (
        <View accessible accessibilityRole="image" accessibilityLabel={`${value}/${total}`} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
                <Circle cx={size / 2} cy={size / 2} r={r} stroke="#FFFFFF" strokeWidth={stroke} fill="none" />
                {pct > 0 && (
                    <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.primary} strokeWidth={stroke} fill="none" strokeLinecap="round"
                        strokeDasharray={`${circ * pct} ${circ}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
                )}
            </Svg>
            <Text style={{ ...T.heading, fontSize: size >= 120 ? 32 : 22, color: C.text }}>{label}</Text>
            {sub ? <Text style={{ ...T.medium, fontSize: 12, color: C.textSub }}>{sub}</Text> : null}
        </View>
    );
};

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
        <LinearGradient colors={[C.primary, C.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primary}>
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

// Simple bar chart (0–100 scores). The latest bar is highlighted; empty days show a thin stub.
export const BarChart = ({ data, height = 180, accessibilityLabel }) => (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={[s.chart, { height }]}>
        {data.map((d, i) => {
            const last = i === data.length - 1;
            const pct = Math.max(0, Math.min(100, Number(d.value) || 0));
            return (
                <View key={d.key || i} style={s.barCol}>
                    <Text style={[s.barValue, last && { color: C.primaryDark }]}>{pct ? Math.round(pct) : ''}</Text>
                    <View style={s.barTrack}>
                        <View style={[s.bar, { height: pct ? `${pct}%` : 3 }, last ? s.barLast : null]} />
                    </View>
                    <Text style={[s.barLabel, last && s.barLabelLast]} numberOfLines={1}>{d.label}</Text>
                </View>
            );
        })}
    </View>
);

const s = StyleSheet.create({
    chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingTop: 6 },
    barCol: { flex: 1, height: '100%', alignItems: 'center', gap: 4 },
    barValue: { ...T.semi, fontSize: 11, color: C.textSub, minHeight: 14 },
    barTrack: { flex: 1, width: '100%', maxWidth: 44, justifyContent: 'flex-end' },
    bar: { width: '100%', backgroundColor: C.secondary, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
    barLast: { backgroundColor: C.primary },
    barLabel: { ...T.semi, fontSize: 11, color: C.textSub },
    barLabelLast: { ...T.bold, color: C.primaryDark },
    card: { backgroundColor: C.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border },
    softCard: { backgroundColor: C.lilac, borderRadius: 28, padding: 24 },
    gradientCard: { borderRadius: 24, padding: 18, shadowColor: C.primaryDark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 5 },
    sectionTitle: { ...T.headingSemi, fontSize: 16, color: C.text },
    label: { ...T.semi, fontSize: 13, color: C.textSub },
    circleBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
    hover: { backgroundColor: C.soft },
    optionRow: { flexDirection: 'row', gap: 8 },
    option: { flex: 1, minHeight: 46, borderRadius: 999, borderWidth: 1, borderColor: C.control, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
    optionOn: { borderColor: C.primary, backgroundColor: C.lilac },
    optionText: { ...T.semi, fontSize: 14, color: C.text, textAlign: 'center' },
    optionTextOn: { ...T.bold, color: C.primaryDark },
    chip: { minHeight: 46, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1, borderColor: C.control, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 6 },
    primaryWrap: { borderRadius: 999 },
    primary: { minHeight: 48, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24 },
    primaryText: { ...T.semi, fontSize: 14, color: '#FFFFFF' },
    secondary: { minHeight: 48, borderRadius: 999, borderWidth: 1, borderColor: C.secondary, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 22 },
    secondaryText: { ...T.semi, fontSize: 14, color: C.primaryDark },
    badge: { alignSelf: 'flex-start', ...T.bold, fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
    stat: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 18, borderWidth: 1, borderColor: C.border, gap: 2 },
    statValue: { ...T.heading, fontSize: 24, color: C.text },
    statLabel: { ...T.semi, fontSize: 12, color: C.textSub },
    notice: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#FFD9C2' },
    noticeText: { flex: 1, ...T.medium, fontSize: 14, lineHeight: 20 },
});
