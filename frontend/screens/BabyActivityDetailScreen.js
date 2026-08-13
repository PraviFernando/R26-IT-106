import React, { useState, useEffect } from 'react';
import { 
    View, Text, ScrollView, TouchableOpacity, StyleSheet, 
    Dimensions, ActivityIndicator, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { Video, ResizeMode } from 'expo-av';
import { useTranslation } from 'react-i18next';
import babyActivityService from '../services/babyActivityService';

const { width } = Dimensions.get('window');

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
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#EC4899" />
            </SafeAreaView>
        );
    }

    if (!activity) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load activity details.</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
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
            <LinearGradient colors={['#FDF2F8', '#FFFDFD']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                    <View style={styles.headerBackBtn} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Video Player */}
                    <View style={styles.playerContainer}>
                        {videoId ? (
                            Platform.OS === 'web' ? (
                                <iframe
                                    src={embedUrl}
                                    style={{ width: '100%', height: 220, border: 'none', borderRadius: 20 }}
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
                                            <ActivityIndicator size="large" color="#EC4899" />
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

                    {/* Metadata Header */}
                    <View style={styles.metaContainer}>
                        <Text style={styles.activityName}>{title}</Text>
                        <Text style={styles.activityDesc}>{desc}</Text>
                        <View style={styles.badgeRow}>
                            <View style={styles.ageBadge}>
                                <Text style={styles.ageBadgeText}>👶 {age}</Text>
                            </View>
                            <View style={styles.durationBadge}>
                                <Text style={styles.durationBadgeText}>⏱️ {activity.duration}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Purpose Section */}
                    {purpose && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🎯 {isSinhala ? 'අරමුණ' : 'Purpose'}</Text>
                            <Text style={styles.sectionText}>{purpose}</Text>
                        </View>
                    )}

                    {/* How to Do It Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📋 {isSinhala ? 'සිදුකරන ආකාරය' : 'How to do it'}</Text>
                        {instructions.map((inst, index) => (
                            <View key={index} style={styles.instructionStep}>
                                <View style={styles.stepNumberContainer}>
                                    <Text style={styles.stepNumber}>{index + 1}</Text>
                                </View>
                                <Text style={styles.instructionText}>{inst}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Safety Notes Section */}
                    {safety && (
                        <View style={styles.safetySection}>
                            <Text style={styles.safetyTitle}>⚠️ {isSinhala ? 'ආරක්ෂිත උපදෙස්' : 'Safety Notes'}</Text>
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
    safe: { flex: 1 },
    gradient: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF2F8' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 16, color: '#EF4444', marginBottom: 20 },
    backBtn: { backgroundColor: '#EC4899', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    backBtnText: { color: '#FFF', fontWeight: '800' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
    },
    headerBackBtn: { padding: 8, width: 44, alignItems: 'center', justifyContent: 'center' },
    backIcon: { fontSize: 32, color: '#EC4899', fontWeight: '900' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', flex: 1, textAlign: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    playerContainer: {
        width: '100%',
        height: 220,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#000',
        marginBottom: 18,
        elevation: 4,
    },
    webView: { flex: 1 },
    video: { flex: 1 },
    videoLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    metaContainer: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#a18cd1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    activityName: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
    activityDesc: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 14 },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    ageBadge: { backgroundColor: '#FCE4EC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    ageBadgeText: { fontSize: 11, color: '#EC4899', fontWeight: '700' },
    durationBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    durationBadgeText: { fontSize: 11, color: '#7C3AED', fontWeight: '700' },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: '#475569', marginBottom: 12 },
    sectionText: { fontSize: 13, color: '#475569', lineHeight: 20 },
    instructionStep: { flexDirection: 'row', gap: 12, marginVertical: 6, alignItems: 'flex-start' },
    stepNumberContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3E8FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumber: { fontSize: 12, fontWeight: '800', color: '#7C3AED' },
    instructionText: { fontSize: 13, color: '#475569', flex: 1, lineHeight: 20 },
    safetySection: {
        backgroundColor: '#FFF1F2',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#FFE4E6',
        marginBottom: 16,
    },
    safetyTitle: { fontSize: 14, fontWeight: '800', color: '#E11D48', marginBottom: 8 },
    safetyText: { fontSize: 12, color: '#9F1239', lineHeight: 18 },
});
