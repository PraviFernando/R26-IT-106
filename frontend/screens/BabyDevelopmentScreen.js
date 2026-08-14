import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, TouchableOpacity, StyleSheet, 
    TextInput, FlatList, Image, Dimensions, ActivityIndicator, Animated, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import babyActivityService from '../services/babyActivityService';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#EC4899',
    primaryLight: '#FFF0F3',
    primaryDark: '#DB2777',
    accent: '#D946EF',
    accentLight: '#FDF4FF',
    surface: '#FFFFFF',
    background: '#FFF5F7',
    backgroundAlt: '#FFEAEF',
    text: '#1E293B',
    textMid: '#475569',
    textLight: '#94A3B8',
    warning: '#E11D48',
    warningBg: '#FFF1F2',
    warningBorder: '#FFE4E6',
};

const SHADOW_PINK = {
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
};

// Local categories list
const CATEGORIES = [
    { key: 'tummy_time', name: 'Tummy Time', nameSi: 'ටමි ටයිම්', icon: '👶', desc: 'Simple supervised activities while awake.', descSi: 'බිළිඳා අවදිව සිටින විට සිදුකරන සරල ක්‍රියාකාරකම්.', color: ['#FFE4F0', '#FFF0F7'] },
    { key: 'leg_movement', name: 'Leg & Movement', nameSi: 'කකුල් සහ ශරීර සෙලවීම්', icon: '🦵', desc: 'Gentle activities encouraging leg movement.', descSi: 'කකුල් සහ ශරීරය සෙලවීමට දිරිමත් කරන සරල ක්‍රියාකාරකම්.', color: ['#E0F2FE', '#F0F9FF'] },
    { key: 'reaching_grasping', name: 'Reaching & Grasping', nameSi: 'අත දිගු කිරීම් සහ ඇල්ලීම්', icon: '✋', desc: 'Encouraging reaching and hand movement.', descSi: 'අත දිගු කර සෙල්ලම් බඩු ඇල්ලීම දිරිමත් කිරීම.', color: ['#FEF9C3', '#FEFCE8'] },
    { key: 'rolling_positioning', name: 'Rolling & Positioning', nameSi: 'පෙරළීම සහ පිහිටීම', icon: '🔄', desc: 'Encouraging rolling and body awareness.', descSi: 'පෙරළීම සහ ශරීරය පිළිබඳ දැනුවත්භාවය දිරිමත් කිරීම.', color: ['#ECFDF5', '#F0FDF4'] },
    { key: 'gentle_arm', name: 'Gentle Arm Movement', nameSi: 'මෘදු දෑත් චලනයන්', icon: '🤲', desc: "Simple movements involving baby's arms.", descSi: 'දෑත් සහ උඩුකය චලනය කිරීමට උපකාරී වන සරල ක්‍රියාකාරකම්.', color: ['#F5F3FF', '#FAF5FF'] },
    { key: 'sensory_movement', name: 'Sensory & Play', nameSi: 'සංවේදී සහ සෙල්ලම් ක්‍රියා', icon: '🧸', desc: 'Interactive play supporting engagement.', descSi: 'සබඳතාවය සහ අවධානය දිරිමත් කරන අන්තර්ක්‍රියාකාරී සෙල්ලම්.', color: ['#FEF3C7', '#FFFBEB'] },
];

// Skeleton card
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

export default function BabyDevelopmentScreen({ navigation }) {
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

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [ageFilter, setAgeFilter] = useState(() => getInitialAgeFilter(user?.deliveryDate));
    const [babyAgeFilter, setBabyAgeFilter] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, [selectedCategory, ageFilter, search]);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (selectedCategory) filters.category = selectedCategory;
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
            console.error('Failed to load baby activities:', err);
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

    const renderActivityCard = ({ item }) => {
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
                            <Text style={styles.videoTitle} numberOfLines={2}>
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

    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient colors={['#FFF5F7', '#FFFDFE', '#FFEAEF']} style={styles.gradient}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <View style={styles.backCircle}>
                            <Text style={styles.backIcon}>←</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerEmoji}>👶</Text>
                        <Text style={styles.headerTitle}>
                            ළදරු සංවර්ධනය සහ චලනය
                        </Text>
                    </View>
                    <View style={styles.backBtnPlaceholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View style={styles.listHeader}>
                        {/* Subtitle */}
                        <Text style={styles.subtitle}>
                            ඔබේ බිළිඳාගේ මුල් චලනයන් සහ සංවර්ධනය සඳහා මෘදු ක්‍රියාකාරකම්.
                        </Text>

                        {/* Safety Disclaimer */}
                        <View style={styles.safetyBox}>
                            <View style={styles.safetyTitleRow}>
                                <Text style={styles.safetyEmoji}>⚠️</Text>
                                <Text style={styles.safetyTitle}>ආරක්ෂිත දැනුම්දීම</Text>
                            </View>
                            <Text style={styles.safetyText}>
                                මෙම ක්‍රියාකාරකම් සාමාන්‍ය අධ්‍යාපනික අරමුණු සඳහා වේ. සැමවිටම ඔබේ බිළිඳා දෙස බලා සිටින්න. බිළිඳා අපහසුවෙන් හෝ අසනීපයෙන් සිටී නම් නතර කරන්න.
                            </Text>
                        </View>

                        {/* Search */}
                        <View style={styles.searchBox}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="ළදරු ක්‍රියාකාරකම් සොයන්න..."
                                value={search}
                                onChangeText={setSearch}
                                placeholderTextColor={COLORS.textLight}
                            />
                        </View>

                        {/* Categories */}
                        <Text style={styles.sectionLabel}>කාණ්ඩ</Text>
                        <View style={styles.categoriesGrid}>
                            {CATEGORIES.map((cat) => {
                                const active = selectedCategory === cat.key;
                                return (
                                    <TouchableOpacity 
                                        key={cat.key}
                                        style={[styles.categoryTile, active && styles.categoryTileActive]}
                                        onPress={() => navigation.navigate('BabyCategory', { 
                                            categoryKey: cat.key, 
                                            categoryName: cat.name, 
                                            categoryNameSi: cat.nameSi 
                                        })}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={active ? [COLORS.primary, COLORS.primaryDark] : cat.color}
                                            style={styles.categoryTileGradient}
                                        >
                                            <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                            <Text style={[styles.categoryName, active && styles.categoryNameActive]}>
                                                {cat.nameSi}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    gradient: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    backBtnPlaceholder: { width: 44 },
    backCircle: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
        elevation: 3, shadowColor: COLORS.primary, shadowOpacity: 0.1,
        shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    },
    backIcon: { fontSize: 20, color: COLORS.primary, fontWeight: '900' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
    headerEmoji: { fontSize: 22 },
    headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, textAlign: 'center' },

    // List header
    listHeader: { paddingHorizontal: 20, paddingTop: 8 },
    subtitle: { fontSize: 13, color: COLORS.textMid, marginBottom: 16, lineHeight: 20, textAlign: 'center' },

    // Safety box
    safetyBox: {
        backgroundColor: COLORS.warningBg,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1.5,
        borderColor: COLORS.warningBorder,
        marginBottom: 20,
    },
    safetyTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    safetyEmoji: { fontSize: 16 },
    safetyTitle: { fontSize: 14, fontWeight: '800', color: COLORS.warning },
    safetyText: { fontSize: 12, color: '#9F1239', lineHeight: 19 },

    // Search
    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginBottom: 20, backgroundColor: COLORS.surface,
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4,
        borderWidth: 1.5, borderColor: 'rgba(236,72,153,0.08)',
        ...SHADOW_PINK,
    },
    searchIcon: { fontSize: 16 },
    searchInput: { flex: 1, paddingVertical: 12, color: COLORS.text, fontSize: 14 },
    sectionLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 12 },

    // Categories grid
    categoriesGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        rowGap: 12,
    },
    categoryTile: {
        width: '48%',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
    },
    categoryTileActive: {
        elevation: 5,
        shadowOpacity: 0.14,
    },
    categoryTileGradient: { 
        paddingVertical: 14, 
        paddingHorizontal: 14, 
        borderRadius: 24, 
        minHeight: 110,
    },
    categoryIcon: { fontSize: 26, marginBottom: 6 },
    categoryName: { fontSize: 13, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
    categoryNameActive: { color: '#FFF' },
    categoryDesc: { fontSize: 10, color: COLORS.textMid, lineHeight: 14 },
    categoryDescActive: { color: 'rgba(255,255,255,0.85)' },

    // Exercise styled cards
    exerciseCard: {
        backgroundColor: 'transparent',
        width: (width - 60) / 2.3,
        maxWidth: 400,
        marginRight: 14,
        marginBottom: 10,
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
        paddingLeft: 20,
        paddingRight: 20,
    },

    // Empty / loading
    emptyBox: { paddingTop: 8 },
    emptyInner: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 52, marginBottom: 16 },
    emptyText: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
    emptySub: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
});
