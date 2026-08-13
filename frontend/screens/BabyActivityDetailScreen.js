import React, { useState, useEffect } from 'react';
import { 
    View, Text, ScrollView, TouchableOpacity, StyleSheet, 
    Dimensions, ActivityIndicator, Platform, Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { Video, ResizeMode } from 'expo-av';
import { useTranslation } from 'react-i18next';
import babyActivityService from '../services/babyActivityService';

const { width } = Dimensions.get('window');

// Design tokens
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
    mint: '#ECFDF5',
    lavender: '#F5F3FF',
};

const RADIUS = { card: 24, pill: 20, circle: 18 };
const SHADOW_PINK = {
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
};

// Skeleton loader component for loading state
const SkeletonBlock = ({ height = 20, width: w = '100%', radius = 10, style }) => {
    const anim = React.useRef(new Animated.Value(0.4)).current;
    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    return (
        <Animated.View
            style={[
                { height, width: w, borderRadius: radius, backgroundColor: '#FECDD3', opacity: anim },
                style,
            ]}
        />
    );
};

const LoadingSkeleton = () => (
    <View style={{ padding: 20 }}>
        <SkeletonBlock height={220} radius={24} style={{ marginBottom: 18 }} />
        <SkeletonBlock height={28} width="70%" radius={12} style={{ marginBottom: 10 }} />
        <SkeletonBlock height={16} radius={8} style={{ marginBottom: 6 }} />
        <SkeletonBlock height={16} width="80%" radius={8} style={{ marginBottom: 20 }} />
        <SkeletonBlock height={42} radius={12} style={{ marginBottom: 8 }} />
        <SkeletonBlock height={16} radius={8} style={{ marginBottom: 6 }} />
        <SkeletonBlock height={16} width="60%" radius={8} />
    </View>
);

export default function BabyActivityDetailScreen({ route, navigation }) {
    const { activityId } = route.params;
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language === 'si';

    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivityDetails();
    }, [activityId]);

    const loadActivityDetails = async () => {
        try {
            const res = await babyActivityService.getActivityById(activityId);
            if (res.success) {
                setActivity(res.activity);
            }
        } catch (err) {
            console.error('Failed to load activity details:', err);
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

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <LinearGradient colors={['#FFF5F7', '#FFEAEF']} style={styles.gradient}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
                            <View style={styles.backCircle}>
                                <Text style={styles.backIcon}>←</Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle} numberOfLines={1}>Loading...</Text>
                        <View style={styles.headerBackBtnPlaceholder} />
                    </View>
                    <LoadingSkeleton />
                </LinearGradient>
            </SafeAreaView>
        );
    }

    if (!activity) {
        return (
            <SafeAreaView style={styles.safe}>
                <LinearGradient colors={['#FFF5F7', '#FFEAEF']} style={styles.gradient}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
                            <View style={styles.backCircle}>
                                <Text style={styles.backIcon}>←</Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Error</Text>
                        <View style={styles.headerBackBtnPlaceholder} />
                    </View>
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorEmoji}>😕</Text>
                        <Text style={styles.errorTitle}>Activity Not Found</Text>
                        <Text style={styles.errorText}>We couldn't load the activity details. Please try again.</Text>
                        <TouchableOpacity style={styles.errorBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.errorBtnText}>← Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    const title = isSinhala ? (activity.activity_name_sinhala || activity.activity_name) : activity.activity_name;
    const desc = isSinhala ? (activity.short_description_sinhala || activity.short_description) : activity.short_description;
    const purpose = isSinhala ? (activity.purpose_sinhala || activity.purpose) : activity.purpose;
    const age = isSinhala ? (activity.age_stage_sinhala || activity.age_stage) : activity.age_stage;
    const safety = isSinhala ? (activity.safety_notes_sinhala || activity.safety_notes) : activity.safety_notes;
    const instructions = isSinhala 
        ? (activity.instructions_sinhala && activity.instructions_sinhala.length > 0 ? activity.instructions_sinhala : activity.instructions_english)
        : activity.instructions_english;

    const videoId = getYoutubeId(activity.video_url);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1&rel=0` : activity.video_url;

    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient colors={['#FFF5F7', '#FFFDFE', '#FFEAEF']} style={styles.gradient}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
                        <View style={styles.backCircle}>
                            <Text style={styles.backIcon}>←</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                    <View style={styles.headerBackBtnPlaceholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Video Player */}
                    <View style={styles.playerContainer}>
                        {videoId ? (
                            Platform.OS === 'web' ? (
                                <iframe
                                    src={embedUrl}
                                    style={{ width: '100%', height: 220, border: 'none', borderRadius: 24 }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <WebView
                                    source={{ uri: embedUrl }}
                                    style={styles.webView}
                                    allowsFullscreenVideo={true}
                                    allowsInlineMediaPlayback={true}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    startInLoadingState={true}
                                    renderLoading={() => (
                                        <View style={styles.videoLoading}>
                                            <ActivityIndicator size="large" color={COLORS.primary} />
                                            <Text style={styles.videoLoadingText}>Loading video...</Text>
                                        </View>
                                    )}
                                />
                            )
                        ) : (
                            <Video
                                source={{ uri: activity.video_url }}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                style={styles.video}
                            />
                        )}
                    </View>

                    {/* Metadata Card */}
                    <View style={styles.metaContainer}>
                        <Text style={styles.activityName}>{title}</Text>
                        <Text style={styles.activityDesc}>{desc}</Text>
                        <View style={styles.badgeRow}>
                            <View style={styles.ageBadge}>
                                <Text style={styles.ageBadgeText}>👶  {age}</Text>
                            </View>
                            <View style={styles.durationBadge}>
                                <Text style={styles.durationBadgeText}>⏱️  {activity.duration}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Purpose Section */}
                    {purpose && (
                        <View style={styles.section}>
                            <View style={styles.sectionTitleRow}>
                                <Text style={styles.sectionEmoji}>🎯</Text>
                                <Text style={styles.sectionTitle}>{isSinhala ? 'අරමුණ' : 'Purpose'}</Text>
                            </View>
                            <Text style={styles.sectionText}>{purpose}</Text>
                        </View>
                    )}

                    {/* How to Do It Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionEmoji}>📋</Text>
                            <Text style={styles.sectionTitle}>{isSinhala ? 'සිදුකරන ආකාරය' : 'How to do it'}</Text>
                        </View>
                        {instructions.map((inst, index) => (
                            <View key={index} style={styles.instructionStep}>
                                <LinearGradient
                                    colors={['#FFF0F3', '#FDF4FF']}
                                    style={styles.stepNumberContainer}
                                >
                                    <Text style={styles.stepNumber}>{index + 1}</Text>
                                </LinearGradient>
                                <Text style={styles.instructionText}>{inst}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Safety Notes Section */}
                    {safety && (
                        <View style={styles.safetySection}>
                            <View style={styles.sectionTitleRow}>
                                <Text style={styles.sectionEmoji}>⚠️</Text>
                                <Text style={styles.safetyTitle}>{isSinhala ? 'ආරක්ෂිත උපදෙස්' : 'Safety Notes'}</Text>
                            </View>
                            <Text style={styles.safetyText}>{safety}</Text>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerBackBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerBackBtnPlaceholder: { width: 44 },
    backCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    backIcon: { fontSize: 20, color: COLORS.primary, fontWeight: '900' },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 8,
    },

    // Scroll
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    // Video player
    playerContainer: {
        width: '100%',
        height: 230,
        borderRadius: RADIUS.card,
        overflow: 'hidden',
        backgroundColor: '#000',
        marginBottom: 20,
        ...SHADOW_PINK,
    },
    webView: { flex: 1 },
    video: { flex: 1 },
    videoLoading: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#111',
    },
    videoLoadingText: { color: '#FFF', marginTop: 10, fontSize: 13, opacity: 0.7 },

    // Metadata card
    metaContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.card,
        padding: 20,
        marginBottom: 14,
        ...SHADOW_PINK,
        borderWidth: 1,
        borderColor: 'rgba(236,72,153,0.05)',
    },
    activityName: { fontSize: 20, fontWeight: '900', color: COLORS.text, marginBottom: 8, lineHeight: 26 },
    activityDesc: { fontSize: 14, color: COLORS.textMid, lineHeight: 22, marginBottom: 16 },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    ageBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: RADIUS.pill,
        borderWidth: 1,
        borderColor: 'rgba(236,72,153,0.15)',
    },
    ageBadgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
    durationBadge: {
        backgroundColor: COLORS.accentLight,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: RADIUS.pill,
        borderWidth: 1,
        borderColor: 'rgba(217,70,239,0.15)',
    },
    durationBadgeText: { fontSize: 12, color: COLORS.accent, fontWeight: '700' },

    // Content sections
    section: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.card,
        padding: 20,
        marginBottom: 14,
        ...SHADOW_PINK,
        borderWidth: 1,
        borderColor: 'rgba(236,72,153,0.05)',
    },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    sectionEmoji: { fontSize: 18 },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
    sectionText: { fontSize: 14, color: COLORS.textMid, lineHeight: 22 },

    // Instruction steps
    instructionStep: { flexDirection: 'row', gap: 14, marginVertical: 7, alignItems: 'flex-start' },
    stepNumberContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    stepNumber: { fontSize: 13, fontWeight: '900', color: COLORS.primary },
    instructionText: { fontSize: 14, color: COLORS.textMid, flex: 1, lineHeight: 22, paddingTop: 3 },

    // Safety section
    safetySection: {
        backgroundColor: COLORS.warningBg,
        borderRadius: RADIUS.card,
        padding: 20,
        borderWidth: 1.5,
        borderColor: COLORS.warningBorder,
        marginBottom: 14,
    },
    safetyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.warning },
    safetyText: { fontSize: 13, color: '#9F1239', lineHeight: 20 },

    // Error state
    errorContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        padding: 32, marginTop: 40,
    },
    errorEmoji: { fontSize: 52, marginBottom: 16 },
    errorTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, marginBottom: 8 },
    errorText: { fontSize: 14, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    errorBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: RADIUS.pill,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    errorBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
