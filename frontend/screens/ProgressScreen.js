import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import exerciseService from '../services/exerciseService';

const { width } = Dimensions.get('window');

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function ProgressScreen({ navigation }) {
    const { t } = useTranslation();
    const [progress, setProgress] = useState(null);
    const [detectedMood, setDetectedMood] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const progData = await exerciseService.getProgress(30);
                setProgress(progData);
                
                const healthData = await exerciseService.getHealthData(todayStr());
                if (healthData.exists) {
                    const recData = await exerciseService.getRecommendations(todayStr());
                    setDetectedMood(recData.detectedMood || null);
                }
            } catch (err) {
                console.error('Failed to load progress details:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient colors={['#F7F3FF', '#FDFBFF', '#EBE0FF']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <View style={styles.backCircle}>
                            <Text style={styles.backIcon}>←</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerEmoji}>📊</Text>
                        <Text style={styles.headerTitle}>
                            {t('ඔබේ ප්‍රගතිය')}
                        </Text>
                    </View>
                    <View style={styles.backBtnPlaceholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {loading ? (
                        <Text style={styles.loadingText}>Loading progress data...</Text>
                    ) : progress ? (
                        <View style={styles.progressContainer}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <Text style={styles.progressTitle}>
                                    ඔබේ ප්‍රගතිය
                                </Text>
                                {detectedMood && detectedMood !== 'happy' && detectedMood !== 'neutral' && (
                                    <View style={{ backgroundColor: 'rgba(124, 58, 237, 0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED' }}>
                                        <Text style={{ fontSize: 14, marginRight: 6 }}>
                                            {detectedMood === 'sad' ? '😔' : detectedMood === 'tired' ? '😪' : detectedMood === 'stressed' ? '😰' : detectedMood === 'angry' ? '😠' : '😌'}
                                        </Text>
                                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#7C3AED', textTransform: 'capitalize' }}>
                                            {t(detectedMood)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            
                            <View style={styles.statsGrid}>
                                <LinearGradient colors={['#FF9A9E', '#FECFEF']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.currentStreak}</Text>
                                    <Text style={styles.statLabel}>🔥 Current Streak</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#E9D5FF', '#F5F3FF']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.missedSessions ?? 0}</Text>
                                    <Text style={styles.statLabel}>⚠️ Missed (7d)</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#A7F3D0', '#ECFDF5']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.weeklyCompletionRate ?? 0}%</Text>
                                    <Text style={styles.statLabel}>📊 Weekly Rate</Text>
                                </LinearGradient>
                            </View>
                            
                            <View style={[styles.statsGrid, { marginTop: 10 }]}>
                                <LinearGradient colors={['#C2E9FB', '#FAFAFA']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.averageDuration ?? 0}m</Text>
                                    <Text style={styles.statLabel}>⏱️ Avg Duration</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#FDE68A', '#FFFBEB']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.totalExercises}</Text>
                                    <Text style={styles.statLabel}>🏋️ Total Completed</Text>
                                </LinearGradient>
                            </View>

                            {progress.recoveryTrend && (
                                <View style={styles.trendContainer}>
                                    <Text style={styles.trendTitle}>🩺 Recovery Trend Analysis</Text>
                                    <Text style={styles.trendText}>{progress.recoveryTrend}</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <Text style={styles.errorText}>No progress data available yet.</Text>
                    )}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F7F3FF' },
    gradient: { flex: 1 },
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
        elevation: 3, shadowColor: '#7C3AED', shadowOpacity: 0.1,
        shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    },
    backIcon: { fontSize: 20, color: '#7C3AED', fontWeight: '900' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
    headerEmoji: { fontSize: 24 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 },
    loadingText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 60 },
    errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center', marginTop: 60 },
    progressContainer: {
        backgroundColor: '#FFF', borderRadius: 28, padding: 22, marginTop: 8,
        elevation: 4, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08, shadowRadius: 20, borderWidth: 1,
        borderColor: 'rgba(124,58,237,0.06)',
    },
    progressTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statBox: {
        flex: 1, borderRadius: 22, paddingVertical: 20, paddingHorizontal: 10,
        alignItems: 'center', minWidth: (width - 60) / 3, elevation: 2,
        shadowColor: '#7C3AED', shadowOpacity: 0.1, shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
    },
    statValue: { fontSize: 26, fontWeight: '900', color: '#1E293B' },
    statLabel: { fontSize: 11, color: '#475569', fontWeight: '700', marginTop: 5, textAlign: 'center' },
    trendContainer: {
        marginTop: 20, backgroundColor: '#F5F3FF', padding: 18, borderRadius: 20,
        borderLeftWidth: 4, borderLeftColor: '#7C3AED',
        elevation: 1, borderWidth: 1, borderColor: 'rgba(124,58,237,0.08)',
    },
    trendTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
    trendText: { fontSize: 13, color: '#475569', lineHeight: 20 },
});


