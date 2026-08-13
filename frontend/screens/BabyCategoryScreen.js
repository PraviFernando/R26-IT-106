import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, TouchableOpacity, StyleSheet, 
    TextInput, FlatList, Image, Dimensions, ActivityIndicator, Animated
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
        <View style={[styles.activityCard, { marginHorizontal: 20, marginVertical: 8 }]}>
            <Skel h={110} w={100} r={18} m={0} />
            <View style={{ flex: 1, marginLeft: 14, justifyContent: 'space-between' }}>
                <Skel h={18} w="80%" r={8} m={8} />
                <Skel h={14} r={6} m={6} />
                <Skel h={14} w="60%" r={6} m={12} />
                <Skel h={36} r={12} m={0} />
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
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;

        return (
            <TouchableOpacity 
                style={styles.activityCard}
                onPress={() => navigation.navigate('BabyActivityDetail', { activityId: item._id })}
                activeOpacity={0.82}
            >
                {thumbnailUrl && (
                    <View style={styles.thumbnailWrapper}>
                        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
                        <LinearGradient
                            colors={['transparent', 'rgba(236,72,153,0.18)']}
                            style={styles.thumbnailOverlay}
                        />
                        <View style={styles.playChip}>
                            <Text style={styles.playChipText}>▶</Text>
                        </View>
                    </View>
                )}
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{desc}</Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.ageBadge}>
                            <Text style={styles.ageBadgeText}>👶 {age}</Text>
                        </View>
                        <Text style={styles.durationText}>⏱️ {item.duration}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.watchBtn}
                        onPress={() => navigation.navigate('BabyActivityDetail', { activityId: item._id })}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.watchBtnText}>
                            {isSinhala ? 'නරඹන්න ▶' : 'Watch ▶'}
                        </Text>
                    </TouchableOpacity>
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
                        <Text style={styles.headerTitle}>{displayName}</Text>
                    </View>
                    <View style={styles.backBtnPlaceholder} />
                </View>

                <FlatList
                    data={loading ? [] : activities}
                    keyExtractor={(item) => item._id}
                    renderItem={renderActivityCard}
                    ListHeaderComponent={() => (
                        <View style={styles.listHeader}>
                            {/* Search */}
                            <View style={styles.searchBox}>
                                <Text style={styles.searchIcon}>🔍</Text>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder={isSinhala ? 'ක්‍රියාකාරකම් සොයන්න...' : 'Search activities...'}
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholderTextColor={COLORS.textLight}
                                />
                            </View>

                            <Text style={styles.sectionLabel}>
                                {isSinhala ? 'වීඩියෝ සහ ක්‍රියාකාරකම්' : 'Videos & Activities'}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyBox}>
                            {loading ? (
                                <>
                                    <SkeletonCard />
                                    <SkeletonCard />
                                    <SkeletonCard />
                                </>
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
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                />
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
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, textAlign: 'center' },

    // List header
    listHeader: { paddingHorizontal: 20, paddingTop: 8 },
    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginBottom: 20, backgroundColor: COLORS.surface,
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4,
        borderWidth: 1.5, borderColor: 'rgba(236,72,153,0.08)',
        ...SHADOW_PINK,
    },
    searchIcon: { fontSize: 16 },
    searchInput: {
        flex: 1, paddingVertical: 12, color: COLORS.text, fontSize: 14,
    },
    sectionLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 12 },

    // Activity card
    activityCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 14,
        marginHorizontal: 20,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(236,72,153,0.05)',
        ...SHADOW_PINK,
    },
    thumbnailWrapper: {
        width: 100, height: 112, borderRadius: 18,
        overflow: 'hidden', marginRight: 14, backgroundColor: '#F1F5F9',
    },
    thumbnail: { width: '100%', height: '100%' },
    thumbnailOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    },
    playChip: {
        position: 'absolute', bottom: 8, right: 8,
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
        elevation: 2,
    },
    playChipText: { color: '#FFF', fontSize: 11, fontWeight: '900' },

    cardInfo: { flex: 1, justifyContent: 'space-between' },
    cardTitle: { fontSize: 15, fontWeight: '900', color: COLORS.text, marginBottom: 4, lineHeight: 20 },
    cardDesc: { fontSize: 12, color: COLORS.textMid, marginBottom: 8, lineHeight: 17 },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    ageBadge: {
        backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    },
    ageBadgeText: { fontSize: 10, color: COLORS.primary, fontWeight: '700' },
    durationText: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
    watchBtn: {
        backgroundColor: COLORS.primary, paddingVertical: 9, borderRadius: 14,
        alignItems: 'center', elevation: 2,
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2, shadowRadius: 6,
    },
    watchBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12 },

    // Empty/loading states
    emptyBox: { paddingTop: 16 },
    emptyInner: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 52, marginBottom: 16 },
    emptyText: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
    emptySub: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },

    // Shared filter
    filterRow: { gap: 8, paddingBottom: 8 },
    filterChip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16,
        backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
    },
    filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterChipText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
    filterChipTextActive: { color: '#FFF', fontWeight: '800' },
});
