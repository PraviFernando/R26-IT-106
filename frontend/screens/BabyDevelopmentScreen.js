import React, { useState, useEffect } from 'react';
import { 
    View, Text, ScrollView, TouchableOpacity, StyleSheet, 
    TextInput, FlatList, Image, Dimensions, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import babyActivityService from '../services/babyActivityService';

import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// Local categories list
const CATEGORIES = [
    { key: 'tummy_time', name: 'Tummy Time', nameSi: 'Tummy Time', icon: '👶', desc: 'Simple supervised activities while awake.', descSi: 'බිළිඳා අවදිව සිටින විට සිදුකරන සරල ක්‍රියාකාරකම්.' },
    { key: 'leg_movement', name: 'Leg & Movement', nameSi: 'කකුල් සහ ශරීර සෙලවීම්', icon: '🦵', desc: 'Gentle activities encouraging leg movement.', descSi: 'කකුල් සහ ශරීරය සෙලවීමට දිරිමත් කරන සරල ක්‍රියාකාරකම්.' },
    { key: 'reaching_grasping', name: 'Reaching & Grasping', nameSi: 'අත දිගු කිරීම් සහ ඇල්ලීම්', icon: '✋', desc: 'Encouraging reaching and hand movement.', descSi: 'අත දිගු කර සෙල්ලම් බඩු ඇල්ලීම දිරිමත් කිරීම.' },
    { key: 'rolling_positioning', name: 'Rolling & Positioning', nameSi: 'පෙරළීම සහ පිහිටීම', icon: '🔄', desc: 'Encouraging rolling and body awareness.', descSi: 'පෙරළීම සහ ශරීරය පිළිබඳ දැනුවත්භාවය දිරිමත් කිරීම.' },
    { key: 'gentle_arm', name: 'Gentle Arm Movement', nameSi: 'මෘදු දෑත් චලනයන්', icon: '🤲', desc: 'Simple movements involving baby\'s arms.', descSi: 'දෑත් සහ උඩුකය චලනය කිරීමට උපකාරී වන සරල ක්‍රියාකාරකම්.' },
    { key: 'sensory_movement', name: 'Sensory & Play', nameSi: 'සංවේදී සහ සෙල්ලම් ක්‍රියා', icon: '🧸', desc: 'Interactive play supporting engagement.', descSi: 'සබඳතාවය සහ අවධානය දිරිමත් කරන අන්තර්ක්‍රියාකාරී සෙල්ලම්.' }
];

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
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;

        return (
            <TouchableOpacity 
                style={styles.activityCard}
                onPress={() => navigation.navigate('BabyActivityDetail', { activityId: item._id })}
            >
                {thumbnailUrl && (
                    <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
                )}
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{title}</Text>
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
            <LinearGradient colors={['#FDF2F8', '#FFFDFD']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerEmoji}>👶</Text>
                        <Text style={styles.headerTitle}>
                            {isSinhala ? 'ළදරු සංවර්ධනය සහ චලනය' : 'Baby Development & Movement'}
                        </Text>
                    </View>
                    <View style={styles.backBtn} />
                </View>

                <FlatList
                    data={activities}
                    keyExtractor={(item) => item._id}
                    renderItem={renderActivityCard}
                    ListHeaderComponent={() => (
                        <View style={styles.listHeader}>
                            {/* Subtitle */}
                            <Text style={styles.subtitle}>
                                {isSinhala 
                                    ? 'ඔබේ බිළිඳාගේ මුල් චලනයන් සහ සංවර්ධනය සඳහා මෘදු ක්‍රියාකාරකම්.' 
                                    : 'Gentle activities to support your baby\'s early movement and development.'}
                            </Text>

                            {/* Safety Disclaimer */}
                            <View style={styles.safetyBox}>
                                <Text style={styles.safetyTitle}>⚠️ {isSinhala ? 'ආරක්ෂිත දැනුම්දීම' : 'Safety Notice'}</Text>
                                <Text style={styles.safetyText}>
                                    {isSinhala 
                                        ? 'මෙම ක්‍රියාකාරකම් සාමාන්‍ය අධ්‍යාපනික අරමුණු සඳහා වේ. සැමවිටම ඔබේ බිළිඳා දෙස බලා සිටින්න. බිළිඳා අපහසුවෙන් හෝ අසනීපයෙන් සිටී නම් නතර කරන්න.'
                                        : 'These activities are for general educational purposes. Always supervise your baby during activities. Stop if your baby appears uncomfortable, distressed, or unwell.'}
                                </Text>
                            </View>

                            {/* Search */}
                            <View style={styles.searchBox}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder={isSinhala ? 'ළදරු ක්‍රියාකාරකම් සොයන්න...' : 'Search baby activities...'}
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>

                            {/* Categories */}
                            <Text style={styles.sectionLabel}>{isSinhala ? 'කාණ්ඩ' : 'Categories'}</Text>
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
                                        >
                                            <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                            <Text style={[styles.categoryName, active && styles.categoryNameActive]}>
                                                {isSinhala ? cat.nameSi : cat.name}
                                            </Text>
                                            <Text style={styles.categoryDesc} numberOfLines={2}>
                                                {isSinhala ? cat.descSi : cat.desc}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                                {isSinhala ? 'ක්‍රියාකාරකම්' : 'Activities'}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyBox}>
                            {loading ? (
                                <ActivityIndicator size="large" color="#EC4899" />
                            ) : (
                                <>
                                    <Text style={styles.emptyEmoji}>🌸</Text>
                                    <Text style={styles.emptyText}>
                                        {isSinhala 
                                            ? 'ගැළපෙන ක්‍රියාකාරකම් කිසිවක් හමු නොවීය.' 
                                            : 'No activities found.'}
                                    </Text>
                                    <Text style={styles.emptySub}>
                                        {isSinhala
                                            ? 'Tummy time, ශරීර සෙලවීම්, පෙරළීම්, හෝ අත දිගු කිරීම් වැනි වචන සොයා බලන්න.'
                                            : 'Try searching for tummy time, movement, reaching, rolling, or stretching.'}
                                    </Text>
                                </>
                            )}
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    gradient: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
    },
    backBtn: { padding: 8, width: 44, alignItems: 'center', justifyContent: 'center' },
    backIcon: { fontSize: 32, color: '#EC4899', fontWeight: '900' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    headerEmoji: { fontSize: 24 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
    listHeader: { paddingHorizontal: 20 },
    subtitle: { fontSize: 14, color: '#64748B', marginBottom: 16, lineHeight: 20 },
    safetyBox: {
        backgroundColor: '#FFF1F2',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FFE4E6',
        marginBottom: 18,
    },
    safetyTitle: { fontSize: 14, fontWeight: '800', color: '#E11D48', marginBottom: 4 },
    safetyText: { fontSize: 12, color: '#9F1239', lineHeight: 18 },
    searchBox: { marginBottom: 18 },
    searchInput: {
        borderWidth: 1.5,
        borderColor: '#F3E8FF',
        borderRadius: 16,
        padding: 12,
        backgroundColor: '#FFF',
        color: '#1F2937',
        fontSize: 14,
    },
    sectionLabel: { fontSize: 16, fontWeight: '800', color: '#475569', marginVertical: 10 },
    filterRow: { gap: 8, paddingBottom: 8 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterChipActive: {
        backgroundColor: '#EC4899',
        borderColor: '#EC4899',
    },
    filterChipText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
    filterChipTextActive: { color: '#FFF', fontWeight: '800' },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryTile: {
        width: (width - 50) / 2,
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#F3E8FF',
        elevation: 2,
    },
    categoryTileActive: {
        borderColor: '#EC4899',
        backgroundColor: '#FFFDFD',
    },
    categoryIcon: { fontSize: 32, marginBottom: 8 },
    categoryName: { fontSize: 14, fontWeight: '800', color: '#334155', marginBottom: 4 },
    categoryNameActive: { color: '#EC4899' },
    categoryDesc: { fontSize: 11, color: '#64748B', lineHeight: 16 },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 14,
        marginHorizontal: 20,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        elevation: 2,
    },
    thumbnail: {
        width: 90,
        height: 100,
        borderRadius: 16,
        backgroundColor: '#000',
        marginRight: 14,
    },
    cardInfo: { flex: 1, justifyContent: 'space-between' },
    cardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
    cardDesc: { fontSize: 12, color: '#64748B', marginVertical: 4, lineHeight: 16 },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    ageBadge: {
        backgroundColor: '#FCE4EC',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    ageBadgeText: { fontSize: 10, color: '#EC4899', fontWeight: '700' },
    durationText: { fontSize: 11, color: '#64748B' },
    watchBtn: {
        backgroundColor: '#EC4899',
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
    },
    watchBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
    emptyBox: { alignItems: 'center', padding: 40 },
    emptyEmoji: { fontSize: 44, marginBottom: 12 },
    emptyText: { fontSize: 15, fontWeight: '800', color: '#475569', marginBottom: 6 },
    emptySub: { fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 18 },
});
