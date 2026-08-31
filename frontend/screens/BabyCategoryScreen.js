import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    TextInput, FlatList, Image, ActivityIndicator, Animated, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import babyActivityService from '../services/babyActivityService';
import { useAuth } from '../context/AuthContext';
import { ContentWell } from '../components/ScreenContainer';

const COLORS = {
    primary: '#EC4899',
    primaryLight: '#FFF0F3',
    primaryDark: '#DB2777',
    accent: '#D946EF',
    surface: '#FFFFFF',
    background: '#FFF5F7',
    text: '#1E293B',
    textMid: '#475569',
    textLight: '#94A3B8',
};

const SHADOW_PINK = {
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
};

// Skeleton card for loading state
const SkeletonCard = () => {
    const anim = useRef(new Animated.Value(0.4)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    const Skel = ({ h = 16, w = '100%', r = 8, m = 6 }) => (
        <Animated.View style={{ height: h, width: w, borderRadius: r, backgroundColor: '#FECDD3', opacity: anim, marginBottom: m }} />
    );
    return (
        <View style={styles.exerciseCard}>
            <Skel h={110} w="100%" r={12} m={8} />
            <View style={{ gap: 6 }}>
                <Skel h={14} w="90%" r={6} m={0} />
                <Skel h={10} w="60%" r={4} m={0} />
            </View>
        </View>
    );
};

export default function BabyCategoryScreen({ route, navigation }) {
    const { categoryKey, categoryName, categoryNameSi } = route.params;
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language === 'si';
    const { user } = useAuth();

    const getInitialAgeFilter = (deliveryDate) => {
        if (!deliveryDate) return '0–3 months';
        try {
            const birthDate = new Date(deliveryDate);
            const today = new Date();
            if (isNaN(birthDate.getTime())) return '0–3 months';
            const diffTime = today - birthDate;
            if (diffTime < 0) return '0–3 months';
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            const diffMonths = diffDays / 30;

            if (diffMonths >= 0 && diffMonths < 3) {
                return '0–3 months';
            } else if (diffMonths >= 3 && diffMonths < 6) {
                return '3–6 months';
            } else if (diffMonths >= 6 && diffMonths < 9) {
                return '6–9 months';
            } else if (diffMonths >= 9) {
                return '9–12 months';
            }
        } catch (e) {
            console.log("Error calculating age filter", e);
        }
        return '0–3 months';
    };

    const displayName = isSinhala ? (categoryNameSi || categoryName) : categoryName;

    const getCategoryQuote = (key) => {
        const quotes = {
            'tummy_time': {
                en: "Every minute of tummy time builds the strength to reach for the stars! 🌟",
                si: "පොඩ්ඩගේ සෑම ටමි ටයිම් විනාඩියක්ම, හෙට ලෝකය ජය ගන්නට ශක්තියක් වේ! 🌟"
            },
            'leg_movement': {
                en: "Kick, wiggle, and play—small steps lead to great adventures! 🦵💕",
                si: "කකුල් සලමින් කරන පුංචි සෙල්ලම්, හෙට දිනේ ලොකු ගමනකට පාර කියයි! 🦵💕"
            },
            'reaching_grasping': {
                en: "Reaching out is your baby's way of saying: 'I am ready to hold the world!' ✋🌸",
                si: "පුංචි අත දිගු කිරීම්, හෙට ලෝකය අල්ලන්නට කරන සුන්දර පෙරහුරුවකි! ✋🌸"
            },
            'rolling_positioning': {
                en: "Roll over, little explorer! A brand new perspective awaits you. 🔄✨",
                si: "පෙරළී බලන්න පුංචි පැටියෝ, අලුත් අපූරු ලෝකයක් ඔබට මග බලා සිටී. 🔄✨"
            },
            'gentle_arm': {
                en: "Waving hands and soft movements—growing and learning day by day. 🤲🌱",
                si: "පුංචි දෑත් සලමින් කරන චලන, දිනෙන් දින පොඩ්ඩගේ වැඩීමට උපකාරී වේ. 🤲🌱"
            }
        };

        const q = quotes[key] || {
            en: "Cherishing every milestone, growing stronger and happier day by day! 🌱💕",
            si: "සෑම සන්ධිස්ථානයක්ම ආදරයෙන් වැළඳගන්න, දිනෙන් දින ප්‍රීතිමත්ව වැඩෙන්න! 🌱💕"
        };
        return isSinhala ? q.si : q.en;
    };

    const getCategoryQuoteTheme = (key) => {
        const themes = {
            'tummy_time': {
                bg: ['#FFE4F0', '#FFF0F7'],
                text: '#DB2777',
                border: 'rgba(219,39,119,0.15)'
            },
            'leg_movement': {
                bg: ['#E0F2FE', '#F0F9FF'],
                text: '#0369A1',
                border: 'rgba(3,105,161,0.15)'
            },
            'reaching_grasping': {
                bg: ['#FEF9C3', '#FEFCE8'],
                text: '#A16207',
                border: 'rgba(161,98,7,0.15)'
            },
            'rolling_positioning': {
                bg: ['#ECFDF5', '#F0FDF4'],
                text: '#047857',
                border: 'rgba(4,120,87,0.15)'
            },
            'gentle_arm': {
                bg: ['#F5F3FF', '#FAF5FF'],
                text: '#6D28D9',
                border: 'rgba(109,40,217,0.15)'
            }
        };

        return themes[key] || {
            bg: ['#FFF0F3', '#FFF5F7'],
            text: '#EC4899',
            border: 'rgba(236,72,153,0.15)'
        };
    };

    const [search, setSearch] = useState('');
    const [ageFilter, setAgeFilter] = useState(() => getInitialAgeFilter(user?.deliveryDate));
    const [babyAgeFilter, setBabyAgeFilter] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, [ageFilter, search]);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const filters = { category: categoryKey };
            if (ageFilter !== 'All') filters.ageFilter = ageFilter;
            if (search) filters.search = search;

            const res = await babyActivityService.getActivities(filters);
            if (res.success) {
                setActivities(res.activities || []);
                if (res.babyAgeFilter) {
                    setBabyAgeFilter(res.babyAgeFilter);
                    setAgeFilter(res.babyAgeFilter);
                }
            }
        } catch (err) {
            console.error('Failed to load baby activities for category:', err);
        } finally {
            setLoading(false);
        }
    };

    const getYoutubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    };

    const renderActivityCard = ({ item, index }) => {
        const title = isSinhala ? (item.activity_name_sinhala || item.activity_name) : item.activity_name;
        const desc = isSinhala ? (item.short_description_sinhala || item.short_description) : item.short_description;
        const age = isSinhala ? (item.age_stage_sinhala || item.age_stage) : item.age_stage;

        const videoId = getYoutubeId(item.video_url);
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('BabyActivityDetail', { activityId: item._id })}
            >
                <View style={styles.exerciseCard}>
                    <View style={styles.thumbnailContainer}>
                        {thumbnailUrl ? (
                            <Image source={{ uri: thumbnailUrl }} style={styles.cardThumbnail} resizeMode="cover" />
                        ) : (
                            <View style={styles.thumbnailPlaceholder}>
                                <Text style={{ fontSize: 44 }}>▶️</Text>
                            </View>
                        )}
                        <View style={styles.durationBadge}>
                            <Text style={styles.durationBadgeText}>
                                {item.duration || '10:00'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cardDetailsRow}>
                        <View style={styles.cardTextContainer}>
                            <Text style={styles.videoTitle}>
                                {title}
                            </Text>
                            <Text style={styles.videoStats}>
                                {isSinhala ? 'ළදරු සංවර්ධනය' : 'Baby Development'} • {age}
                            </Text>
                        </View>
                        <View style={styles.menuContainer}>
                            <Text style={styles.menuIcon}>⋮</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const AGE_STAGES = [
        { key: 'All', labelEn: 'All Stage', labelSi: 'සියලුම පියවර' },
        { key: '0–3 months', labelEn: '0–3 Months', labelSi: 'මාස 0–3' },
        { key: '3–6 months', labelEn: '3–6 Months', labelSi: 'මාස 3–6' },
        { key: '6–9 months', labelEn: '6–9 Months', labelSi: 'මාස 6–9' },
        { key: '9–12 months', labelEn: '9–12 Months', labelSi: 'මාස 9–12' },
    ];

    return (
        <LinearGradient colors={['#FFF8FA', '#FFFDFE', '#FFF2F5']} style={styles.gradient}>
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <View style={styles.backCircle}>
                            <Text style={styles.backIcon}>←</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>{displayName}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() =>
                            i18n.changeLanguage(
                                i18n.language === 'en' ? 'si' : 'en'
                            )
                        }
                        style={{ width: 44, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text
                            style={{
                                fontWeight: '700',
                                fontSize: 13,
                                color: '#7C3AED',
                                backgroundColor: '#EDE9FE',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 12,
                            }}
                        >
                            {i18n.language === 'en' ? 'සිං' : 'EN'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                  <ContentWell maxWidth="wide" padded={false}>
                    <View style={styles.listHeader}>
                        {/* Safety Disclaimer */}
                        <View style={styles.safetyBox}>
                            <View style={styles.safetyTitleRow}>
                                <Text style={styles.safetyEmoji}>⚠️</Text>
                                <Text style={styles.safetyTitle}>
                                    {isSinhala ? 'ආරක්ෂිත දැනුම්දීම' : 'Safety Notice'}
                                </Text>
                            </View>
                            <Text style={styles.safetyText}>
                                {isSinhala
                                    ? 'මෙම ක්‍රියාකාරකම් සාමාන්‍ය අධ්‍යාපනික අරමුණු සඳහා වේ. සැමවිටම ඔබේ බිළිඳා දෙස බලා සිටින්න. බිළිඳා අපහසුවෙන් හෝ අසනීපයෙන් සිටී නම් නතර කරන්න.'
                                    : 'These activities are for general educational purposes only. Always supervise your baby. Stop if baby is fussy or unwell.'}
                            </Text>
                        </View>

                        <Text style={styles.sectionLabel}>
                            {isSinhala ? 'වීඩියෝ සහ ක්‍රියාකාරකම්' : 'Videos & Activities'}
                        </Text>
                    </View>

                    {loading ? (
                        <View style={styles.activityGrid}>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </View>
                    ) : activities.length > 0 ? (
                        <View style={styles.activityGrid}>
                            {activities.map((item, index) => renderActivityCard({ item, index }))}
                        </View>
                    ) : (
                        <View style={styles.emptyInner}>
                            <Text style={styles.emptyEmoji}>🌸</Text>
                            <Text style={styles.emptyText}>
                                {isSinhala
                                    ? 'ගැළපෙන ක්‍රියාකාරකම් කිසිවක් හමු නොවීය.'
                                    : 'No activities found.'}
                            </Text>
                            <Text style={styles.emptySub}>
                                {isSinhala
                                    ? 'කරුණාකර වෙනත් සෙවුම් පදයක් භාවිතා කරන්න.'
                                    : 'Please try another search term.'}
                            </Text>
                        </View>
                    )}

                    {/* Sweet Developmental Quote below videos */}
                    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
                        <LinearGradient
                            colors={getCategoryQuoteTheme(categoryKey).bg}
                            style={[
                                styles.quoteCard,
                                { borderColor: getCategoryQuoteTheme(categoryKey).border }
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={[styles.quoteText, { color: getCategoryQuoteTheme(categoryKey).text }]}>
                                {getCategoryQuote(categoryKey)}
                            </Text>
                        </LinearGradient>
                    </View>
                  </ContentWell>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    gradient: { flex: 1, backgroundColor: '#FFF8FA' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
        backgroundColor: 'transparent',
    },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    backBtnPlaceholder: { width: 44 },
    backCircle: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
        elevation: 3, shadowColor: COLORS.primary, shadowOpacity: 0.1,
        shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    },
    backIcon: { fontSize: 20, color: COLORS.primary, fontWeight: '900' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, textAlign: 'center' },

    // List header
    listHeader: { paddingHorizontal: 16, paddingTop: 14 },
    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginBottom: 16, backgroundColor: COLORS.surface,
        borderRadius: 24, paddingHorizontal: 16, paddingVertical: 2,
        borderWidth: 1.5, borderColor: 'rgba(236,72,153,0.08)',
        ...SHADOW_PINK,
    },
    searchIcon: { fontSize: 16 },
    searchInput: {
        flex: 1, paddingVertical: 10, color: COLORS.text, fontSize: 14,
    },
    clearBtn: {
        padding: 6,
    },
    clearIcon: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    sectionLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 14, marginTop: 4 },

    // Chips container
    chipsContainer: {
        marginBottom: 16,
    },
    chipsScrollContent: {
        gap: 8,
        paddingRight: 16,
    },
    chip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#FFF0F3', borderWidth: 1, borderColor: 'rgba(236,72,153,0.06)',
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 12, color: COLORS.primary, fontWeight: '700',
    },
    chipTextActive: {
        color: '#FFFFFF', fontWeight: '800',
    },

    // Exercise styled cards
    exerciseCard: {
        backgroundColor: 'transparent',
        flexGrow: 1,
        flexBasis: 160,
        maxWidth: 260,
        marginBottom: 10,
    },
    activityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        paddingHorizontal: 16,
    },
    thumbnailContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
        marginBottom: 8,
        ...SHADOW_PINK,
    },
    cardThumbnail: { width: '100%', height: '100%' },
    thumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#FFF0F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(15,23,42,0.85)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    durationBadgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    cardDetailsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 2,
    },
    cardTextContainer: {
        flex: 1,
    },
    videoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        lineHeight: 18,
        marginBottom: 2,
    },
    videoStats: {
        fontSize: 11,
        color: COLORS.textMid,
    },
    menuContainer: {
        paddingHorizontal: 2,
        paddingVertical: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIcon: {
        fontSize: 16,
        color: COLORS.textLight,
    },
    horizontalScrollContent: {
        paddingLeft: 16,
        paddingRight: 20,
    },
    emptyBox: { paddingTop: 16 },
    emptyInner: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 52, marginBottom: 16 },
    emptyText: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
    emptySub: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
    quoteCard: {
        backgroundColor: '#FFF0F3',
        padding: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(236,72,153,0.1)',
        marginBottom: 16,
        marginTop: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quoteText: {
        fontSize: 12.5,
        color: '#EC4899',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '700',
    },
    safetyBox: {
        backgroundColor: '#FFF1F2',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1.5,
        borderColor: '#FFE4E6',
        marginBottom: 20,
    },
    safetyTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    safetyEmoji: { fontSize: 16 },
    safetyTitle: { fontSize: 14, fontWeight: '800', color: '#E11D48' },
    safetyText: { fontSize: 12, color: '#9F1239', lineHeight: 19 },
});
