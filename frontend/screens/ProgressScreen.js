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
            <LinearGradient colors={['#F4F0FB', '#FDFCFE']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerEmoji}>📊</Text>
                        <Text style={styles.headerTitle}>
                            {t('ඔබේ ප්‍රගතිය')}
                        </Text>
                    </View>
                    <View style={styles.backBtn} />
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
                                    <View style={{ backgroundColor: 'rgba(161,140,209,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#a18cd1' }}>
                                        <Text style={{ fontSize: 14, marginRight: 6 }}>
                                            {detectedMood === 'sad' ? '😔' : detectedMood === 'tired' ? '😪' : detectedMood === 'stressed' ? '😰' : detectedMood === 'angry' ? '😠' : '😌'}
                                        </Text>
                                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#a18cd1', textTransform: 'capitalize' }}>
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
                                <LinearGradient colors={['#fbc2eb', '#a6c1ee']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.missedSessions ?? 0}</Text>
                                    <Text style={styles.statLabel}>⚠️ Missed (7d)</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#84fab0', '#8fd3f4']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.weeklyCompletionRate ?? 0}%</Text>
                                    <Text style={styles.statLabel}>📊 Weekly Rate</Text>
                                </LinearGradient>
                            </View>
                            
                            <View style={[styles.statsGrid, { marginTop: 10 }]}>
                                <LinearGradient colors={['#a1c4fd', '#c2e9fb']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.averageDuration ?? 0}m</Text>
                                    <Text style={styles.statLabel}>⏱️ Avg Duration</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#f6d365', '#fda085']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.totalExercises}</Text>
                                    <Text style={styles.statLabel}>🏋️ Total Completed</Text>
                                </LinearGradient>
                            </View>

                            {progress.recoveryTrend && (
                                <View style={{ marginTop: 20, backgroundColor: '#FFF', padding: 16, borderRadius: 24, borderLeftWidth: 4, borderLeftColor: '#7C3AED', shadowColor: '#a18cd1', shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 4 }}>🩺 Recovery Trend Analysis</Text>
                                    <Text style={{ fontSize: 13, color: '#475569', lineHeight: 18 }}>{progress.recoveryTrend}</Text>
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
    safe: { flex: 1 },
    gradient: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
        backgroundColor: 'transparent',
    },
    backBtn: { padding: 8, width: 44, alignItems: 'center', justifyContent: 'center' },
    backIcon: { fontSize: 32, color: '#a18cd1', fontWeight: '900' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerEmoji: { fontSize: 26 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#334155' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    loadingText: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 40 },
    errorText: { fontSize: 16, color: '#EF4444', textAlign: 'center', marginTop: 40 },
    progressContainer: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 28,
        padding: 20,
        marginTop: 10,
        elevation: 4,
        shadowColor: '#a18cd1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
    },
    progressTitle: { fontSize: 20, fontWeight: '800', color: '#334155' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statBox: {
        flex: 1,
        borderRadius: 24,
        paddingVertical: 18,
        paddingHorizontal: 10,
        alignItems: 'center',
        minWidth: (width - 60) / 3,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowRadius: 10,
        shadowOffset: { height: 5, width: 0 },
    },
    statValue: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    statLabel: { fontSize: 11, color: '#FFF', fontWeight: '700', marginTop: 4, textAlign: 'center' },
});
