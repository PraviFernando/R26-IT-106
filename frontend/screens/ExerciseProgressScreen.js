import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import exerciseService from '../services/exerciseService';

const { width } = Dimensions.get('window');

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function ExerciseProgressScreen({ navigation }) {
    const { width } = useWindowDimensions();
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language === 'si';
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

    const getTranslatedTrend = (trendText) => {
        if (!trendText) return '';
        if (!isSinhala) return trendText;

        const translations = {
            "No data yet to detect recovery trend. Keep logging daily health inputs.": "සුවවීමේ ප්‍රවණතාව හඳුනා ගැනීමට තවමත් දත්ත ප්‍රමාණවත් නැත. දිනපතා සෞඛ්‍ය දත්ත ඇතුළත් කරන්න.",
            "Fantastic recovery trend detected! Over the past few weeks, your fatigue has decreased and your mobility has improved.": "විශිෂ්ට සුවවීමේ ප්‍රවණතාවක් හඳුනාගෙන ඇත! පසුගිය සති කිහිපය තුළ ඔබේ තෙහෙට්ටුව අඩු වී ඇති අතර චලන හැකියාව වර්ධනය වී ඇත.",
            "Positive trend: Your fatigue level has been decreasing over the last 3 weeks.": "යහපත් ප්‍රවණතාවක්: පසුගිය සති 3 තුළ ඔබේ තෙහෙට්ටුව මට්ටම ක්‍රමයෙන් අඩු වෙමින් පවතී.",
            "Positive trend: Your mobility is improving over the last 3 weeks.": "යහපත් ප්‍රවණතාවක්: පසුගිය සති 3 තුළ ඔබේ චලන හැකියාව වර්ධනය වෙමින් පවතී.",
            "Stable recovery pattern. Rest and follow recommendations daily.": "ස්ථාවර සුවවීමේ රටාවක් පවතී. දිනපතා විවේකය ලබාගෙන උපදෙස් අනුගමනය කරන්න."
        };

        return translations[trendText.trim()] || trendText;
    };

    const renderWeeklyGrid = () => {
        if (!progress) return null;
        const days = [];
        const today = new Date();
        const completedDates = new Set((progress.progressData || []).map(r => r.date));

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            const isCompleted = completedDates.has(dStr);
            const dayName = d.toLocaleDateString(i18n.language === 'si' ? 'si-LK' : 'en-US', { weekday: 'short' });
            const dayNum = d.getDate();

            days.push(
                <View key={dStr} style={styles.gridDayContainer}>
                    <Text style={styles.gridDayName}>{dayName}</Text>
                    <View style={[
                        styles.gridDayCircle,
                        isCompleted ? styles.gridDayCircleCompleted : styles.gridDayCirclePending
                    ]}>
                        {isCompleted ? (
                            <Text style={styles.gridDayCheck}>✓</Text>
                        ) : (
                            <Text style={styles.gridDayNumber}>{dayNum}</Text>
                        )}
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.weeklyGridCard}>
                <Text style={styles.weeklyGridTitle}>
                    {isSinhala ? 'පසුගිය දින 7ක ක්‍රියාකාරකම්' : 'Last 7 Days Activity'}
                </Text>
                <View style={styles.weeklyGridRow}>
                    {days}
                </View>
            </View>
        );
    };

    const renderTrendline = () => {
        const trendData = (progress && progress.progressData && progress.progressData.length > 0)
            ? progress.progressData.slice(-7)
            : [];

        if (trendData.length === 0) {
            return (
                <View style={styles.trendlineCard}>
                    <Text style={styles.trendlineTitle}>{isSinhala ? 'මවගේ ප්‍රගති ප්‍රවණතාවය' : "Mother's Progress Trendline"}</Text>
                    <View style={styles.trendlinePlaceholder}>
                        <Text style={styles.trendlinePlaceholderText}>
                            {isSinhala ? 'මවගේ ප්‍රගති ප්‍රවණතාවය පෙන්වීමට ප්‍රමාණවත් දත්ත නැත. ව්‍යායාම සම්පූර්ණ කරන්න!' : "Complete exercises to view the mother's progress trendline!"}
                        </Text>
                    </View>
                </View>
            );
        }

        const chartLabels = trendData.map(d => {
            const dateParts = d.date.split('-');
            return dateParts.length >= 3 ? `${dateParts[1]}/${dateParts[2]}` : d.date;
        });
        const chartValues = trendData.map(d => d.avgAccuracy);

        return (
            <View style={styles.trendlineCard}>
                <Text style={styles.trendlineTitle}>{isSinhala ? 'මවගේ ප්‍රගති ප්‍රවණතාවය (පසුගිය සැසි)' : "Mother's Progress Trendline (Recent Sessions)"}</Text>
                <LineChart
                    data={{
                        labels: chartLabels,
                        datasets: [
                            {
                                data: chartValues,
                                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                                strokeWidth: 3
                            }
                        ]
                    }}
                    width={width > 500 ? width - 120 : width - 90}
                    height={180}
                    fromZero={true}
                    chartConfig={{
                        backgroundColor: '#F8FAFC',
                        backgroundGradientFrom: '#F8FAFC',
                        backgroundGradientTo: '#F8FAFC',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                        propsForDots: {
                            r: "5",
                            strokeWidth: "2",
                            stroke: "#6366F1"
                        }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                />
            </View>
        );
    };

    const renderMovementPerformance = () => {
        if (!progress) return null;

        const avgScore = progress.averageMovementScore ?? 0;
        const bestScore = progress.bestMovementScore ?? 0;
        const totalReps = progress.totalMovementRepetitions ?? 0;
        const completedSessions = progress.completedMovementSessionsCount ?? 0;

        const avgAccuracy = progress.averageMovementAccuracy ?? 0;
        const bestAccuracy = progress.bestMovementAccuracy ?? 0;
        const correctReps = progress.totalCorrectRepetitions ?? 0;

        const trendData = (progress.movementTrendData && progress.movementTrendData.length > 0)
            ? progress.movementTrendData.slice(-7)
            : [];

        const accuracyTrendData = (progress.weeklyAccuracyTrendData && progress.weeklyAccuracyTrendData.length > 0)
            ? progress.weeklyAccuracyTrendData.slice(-7)
            : [];

        return (
            <View style={styles.movementSection}>
                <Text style={styles.movementTitle}>🤖 {isSinhala ? 'AI චලන කාර්ය සාධනය' : 'AI Movement Performance'}</Text>
                
                {/* Accuracy Stats */}
                <View style={styles.statsGrid}>
                    <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={styles.statValue}>{avgAccuracy}%</Text>
                        <Text style={styles.statLabel}>📊 {isSinhala ? 'සාමාන්‍ය නිරවද්‍යතාවය' : 'Avg Accuracy'}</Text>
                    </LinearGradient>
                    <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={styles.statValue}>{bestAccuracy}%</Text>
                        <Text style={styles.statLabel}>🏆 {isSinhala ? 'හොඳම නිරවද්‍යතාවය' : 'Best Accuracy'}</Text>
                    </LinearGradient>
                </View>

                {/* Repetitions Stats */}
                <View style={[styles.statsGrid, { marginTop: 12 }]}>
                    <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={styles.statValue}>{correctReps}</Text>
                        <Text style={styles.statLabel}>🎯 {isSinhala ? 'නිවැරදි වාර' : 'Correct Reps'}</Text>
                    </LinearGradient>
                    <LinearGradient colors={['#FFF0F5', '#FFE4E1']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={styles.statValue}>{totalReps}</Text>
                        <Text style={styles.statLabel}>🔄 {isSinhala ? 'මුළු වාර ගණන' : 'Total Reps'}</Text>
                    </LinearGradient>
                </View>

                {/* Overall Score Stats */}
                <View style={[styles.statsGrid, { marginTop: 12 }]}>
                    <LinearGradient colors={['#F5F3FF', '#EDE9FE']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={styles.statValue}>{avgScore}%</Text>
                        <Text style={styles.statLabel}>📈 {isSinhala ? 'සාමාන්‍ය ලකුණ' : 'Avg Score'}</Text>
                    </LinearGradient>
                    <LinearGradient colors={['#FAF5FF', '#F3E8FF']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={styles.statValue}>{bestScore}%</Text>
                        <Text style={styles.statLabel}>🥇 {isSinhala ? 'හොඳම ලකුණ' : 'Best Score'}</Text>
                    </LinearGradient>
                </View>

                {/* Weekly Accuracy Trend Graph */}
                <View style={[styles.trendlineCard, { marginTop: 16 }]}>
                    <Text style={styles.trendlineTitle}>{isSinhala ? 'සතිපතා නිරවද්‍යතා ප්‍රවණතාවය' : 'Weekly Accuracy Trend'}</Text>
                    {accuracyTrendData.length > 0 ? (
                        <LineChart
                            data={{
                                labels: accuracyTrendData.map(d => {
                                    const dateParts = d.date.split('-');
                                    return dateParts.length >= 3 ? `${dateParts[1]}/${dateParts[2]}` : d.date;
                                }),
                                datasets: [
                                    {
                                        data: accuracyTrendData.map(d => d.avgAccuracy),
                                        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                                        strokeWidth: 3
                                    }
                                ]
                            }}
                            width={width > 500 ? width - 120 : width - 90}
                            height={180}
                            fromZero={true}
                            chartConfig={{
                                backgroundColor: '#FFF',
                                backgroundGradientFrom: '#FFF',
                                backgroundGradientTo: '#FFF',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "5",
                                    strokeWidth: "2",
                                    stroke: "#10B981"
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    ) : (
                        <View style={styles.trendlinePlaceholder}>
                            <Text style={styles.trendlinePlaceholderText}>
                                {isSinhala ? 'නිරවද්‍යතා ප්‍රවණතාවය පෙන්වීමට ප්‍රමාණවත් දත්ත නොමැත.' : 'Complete tracking exercises to view your accuracy trend!'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Weekly Movement Score Trend Graph */}
                <View style={[styles.trendlineCard, { marginTop: 16 }]}>
                    <Text style={styles.trendlineTitle}>{isSinhala ? 'සතිපතා චලන ප්‍රවණතාවය' : 'Weekly Movement Trend'}</Text>
                    {trendData.length > 0 ? (
                        <LineChart
                            data={{
                                labels: trendData.map(d => {
                                    const dateParts = d.date.split('-');
                                    return dateParts.length >= 3 ? `${dateParts[1]}/${dateParts[2]}` : d.date;
                                }),
                                datasets: [
                                    {
                                        data: trendData.map(d => d.avgScore),
                                        color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                                        strokeWidth: 3
                                    }
                                ]
                            }}
                            width={width > 500 ? width - 120 : width - 90}
                            height={180}
                            fromZero={true}
                            chartConfig={{
                                backgroundColor: '#FFF',
                                backgroundGradientFrom: '#FFF',
                                backgroundGradientTo: '#FFF',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "5",
                                    strokeWidth: "2",
                                    stroke: "#7C3AED"
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    ) : (
                        <View style={styles.trendlinePlaceholder}>
                            <Text style={styles.trendlinePlaceholderText}>
                                {isSinhala ? 'චලන ප්‍රවණතාවය පෙන්වීමට ප්‍රමාණවත් දත්ත නොමැත.' : 'Complete tracking exercises to view your movement trend!'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient colors={['#EEF2FF', '#FFFFFF', '#F1F5F9']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <View style={styles.backCircle}>
                            <Text style={styles.backIcon}>←</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerEmoji}>📊</Text>
                        <Text style={styles.headerTitle}>
                            {isSinhala ? 'ඔබේ ප්‍රගතිය' : 'Your Progress'}
                        </Text>
                    </View>
                    <View style={styles.backBtnPlaceholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4F46E5" />
                            <Text style={styles.loadingText}>Loading progress data...</Text>
                        </View>
                    ) : progress ? (
                        <View style={styles.progressContainer}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                                <Text style={styles.progressTitle}>
                                    {isSinhala ? 'ප්‍රගති උපකරණ පුවරුව' : 'Progress Dashboard'}
                                </Text>
                                {detectedMood && detectedMood !== 'happy' && detectedMood !== 'neutral' && (
                                    <View style={styles.moodBadge}>
                                        <Text style={{ fontSize: 13, marginRight: 4 }}>
                                            {detectedMood === 'sad' ? '😔' : detectedMood === 'tired' ? '😪' : detectedMood === 'stressed' ? '😰' : detectedMood === 'angry' ? '😠' : '😌'}
                                        </Text>
                                        <Text style={styles.moodBadgeText}>
                                            {t(detectedMood)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Stats Grid Layout */}
                            <View style={styles.statsGrid}>
                                <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.currentStreak}</Text>
                                    <Text style={styles.statLabel}>🔥 {isSinhala ? 'වත්මන් දින දාමය' : 'Current Streak'}</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.weeklyCompletionRate ?? 0}%</Text>
                                    <Text style={styles.statLabel}>📊 {isSinhala ? 'සතිපතා ප්‍රතිශතය' : 'Weekly Rate'}</Text>
                                </LinearGradient>
                            </View>

                            <View style={[styles.statsGrid, { marginTop: 12 }]}>
                                <LinearGradient colors={['#F5F3FF', '#EDE9FE']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.averageDuration ?? 0}m</Text>
                                    <Text style={styles.statLabel}>⏱️ {isSinhala ? 'සාමාන්‍ය කාලය' : 'Avg Duration'}</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#FFFBEB', '#FEF3C7']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.totalExercises}</Text>
                                    <Text style={styles.statLabel}>🏋️ {isSinhala ? 'සම්පූර්ණ කළ ගණන' : 'Total Completed'}</Text>
                                </LinearGradient>
                            </View>

                            <View style={[styles.statsGrid, { marginTop: 12 }]}>
                                <LinearGradient colors={['#FFF1F2', '#FFE4E6']} style={[styles.statBox, { minWidth: '100%' }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.statValue}>{progress.missedSessions ?? 0}</Text>
                                    <Text style={styles.statLabel}>⚠️ {isSinhala ? 'මඟ හැරුණු ව්‍යායාම (දින 7)' : 'Missed Sessions (Last 7 Days)'}</Text>
                                </LinearGradient>
                            </View>

                            {/* Last 7 Days Activity Tracker */}
                            {renderWeeklyGrid()}



                            {/* Accuracy Trendline Chart */}
                            {renderTrendline()}

                            {/* Movement Performance Section */}
                            {renderMovementPerformance()}

                            {/* Recovery Trend Section */}
                            {progress.recoveryTrend && (
                                <View style={styles.trendContainer}>
                                    <Text style={styles.trendTitle}>🩺 {isSinhala ? 'සුවවීමේ ප්‍රවණතා විශ්ලේෂණය' : 'Recovery Trend Analysis'}</Text>
                                    <Text style={styles.trendText}>{getTranslatedTrend(progress.recoveryTrend)}</Text>
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
    safe: { flex: 1, backgroundColor: '#EEF2FF' },
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
        elevation: 3, shadowColor: '#4F46E5', shadowOpacity: 0.1,
        shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    },
    backIcon: { fontSize: 20, color: '#4F46E5', fontWeight: '900' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
    headerEmoji: { fontSize: 24 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 },
    loadingContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    loadingText: { fontSize: 14, color: '#64748B', marginTop: 12 },
    errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center', marginTop: 60 },
    progressContainer: {
        backgroundColor: '#FFF', borderRadius: 28, padding: 22, marginTop: 8,
        elevation: 4, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08, shadowRadius: 20, borderWidth: 1,
        borderColor: 'rgba(79,70,229,0.06)',
    },
    progressTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
    moodBadge: {
        backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 16, flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: '#6366F1'
    },
    moodBadgeText: { fontSize: 12, fontWeight: '800', color: '#4F46E5', textTransform: 'capitalize' },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    statBox: {
        flex: 1,
        borderRadius: 22, paddingVertical: 20, paddingHorizontal: 10,
        alignItems: 'center', elevation: 2,
        shadowColor: '#4F46E5', shadowOpacity: 0.08, shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
    },
    statValue: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
    statLabel: { fontSize: 11, color: '#475569', fontWeight: '700', marginTop: 5, textAlign: 'center' },

    // Weekly grid
    weeklyGridCard: {
        marginTop: 20, backgroundColor: '#F8FAFC', borderRadius: 20,
        padding: 16, borderWidth: 1, borderColor: '#E2E8F0',
    },
    weeklyGridTitle: { fontSize: 13, fontWeight: '800', color: '#475569', marginBottom: 14 },
    weeklyGridRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    gridDayContainer: { alignItems: 'center', flex: 1 },
    gridDayName: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 6 },
    gridDayCircle: {
        width: 34, height: 34, borderRadius: 17,
        alignItems: 'center', justifyContent: 'center',
    },
    gridDayCircleCompleted: { backgroundColor: '#10B981' },
    gridDayCirclePending: { backgroundColor: '#E2E8F0' },
    gridDayCheck: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    gridDayNumber: { color: '#475569', fontSize: 12, fontWeight: '700' },

    // Accuracy Card
    accuracyCard: {
        marginTop: 16, backgroundColor: '#F8FAFC', borderRadius: 20,
        padding: 16, borderWidth: 1, borderColor: '#E2E8F0',
    },
    accuracyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    accuracyTitle: { fontSize: 13, fontWeight: '800', color: '#475569' },
    accuracyValue: { fontSize: 14, fontWeight: '900', color: '#10B981' },
    accuracyBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
    accuracyBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },

    trendContainer: {
        marginTop: 20, backgroundColor: '#EEF2FF', padding: 18, borderRadius: 20,
        borderLeftWidth: 4, borderLeftColor: '#4F46E5',
        elevation: 1, borderWidth: 1, borderColor: 'rgba(79,70,229,0.08)',
    },
    trendTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
    trendText: { fontSize: 13, color: '#475569', lineHeight: 20 },
    trendlineCard: {
        marginTop: 16, backgroundColor: '#F8FAFC', borderRadius: 20,
        padding: 16, borderWidth: 1, borderColor: '#E2E8F0',
        alignItems: 'center', width: '100%'
    },
    trendlineTitle: { fontSize: 13, fontWeight: '800', color: '#475569', alignSelf: 'flex-start', marginBottom: 10 },
    trendlinePlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    trendlinePlaceholderText: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },
    movementSection: {
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9'
    },
    movementTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1E293B',
        marginBottom: 16
    },
});
