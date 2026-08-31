import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import exerciseService from '../services/exerciseService';
import ScreenContainer from '../components/ScreenContainer';

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function ExerciseProgressScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language === 'si';

    const filters = [
        { key: 'weekly', label: isSinhala ? 'සතිපතා' : 'Weekly' },
        { key: 'monthly', label: isSinhala ? 'මාසික' : 'Monthly' },
        { key: 'last3months', label: isSinhala ? 'මාස 3' : '3 Months' },
        { key: 'last6months', label: isSinhala ? 'මාස 6' : '6 Months' },
        { key: 'yearly', label: isSinhala ? 'වාර්ෂික' : 'Yearly' }
    ];

    const [progress, setProgress] = useState(null);
    const [detectedMood, setDetectedMood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('weekly');
    const [showDropdown, setShowDropdown] = useState(false);

    // Chart width measured from the card it lives in (progressContainer padding 22
    // + trendlineCard padding 16), so charts fit the centered column at any width.
    const [chartW, setChartW] = useState(0);
    const onProgressLayout = (e) => {
        const w = e.nativeEvent.layout.width - 44 /* progressContainer padding */ - 32 /* trendlineCard padding */;
        setChartW((prev) => (Math.abs(prev - w) > 1 ? Math.max(0, w) : prev));
    };

    const getChartData = (dataArray, filter) => {
        if (!dataArray || dataArray.length === 0) return [];
        const limit = filter === 'weekly' ? 7 : filter === 'monthly' ? 30 : filter === 'last3months' ? 90 : filter === 'last6months' ? 180 : 365;
        const sliced = dataArray.slice(-limit);

        if (sliced.length <= 8) return sliced;

        const sampled = [];
        const step = (sliced.length - 1) / 7;
        for (let i = 0; i < 8; i++) {
            const index = Math.round(i * step);
            if (sliced[index]) {
                sampled.push(sliced[index]);
            }
        }
        return sampled;
    };

    // Shared trend chart — renders nothing until the container has been measured
    // (chart-kit needs a real numeric width or it renders a broken SVG).
    const TrendChart = ({ data, chartConfig }) =>
        chartW > 0 ? (
            <LineChart
                data={data}
                width={chartW}
                height={180}
                fromZero
                bezier
                chartConfig={chartConfig}
                style={{ marginVertical: 8, borderRadius: 16 }}
            />
        ) : null;

    useEffect(() => {
        const loadData = async () => {
            try {
                const progData = await exerciseService.getProgress(365);
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
            ? getChartData(progress.progressData, selectedFilter)
            : [];

        if (trendData.length === 0) {
            return (
                <View style={styles.trendlineCard}>
                    <Text style={styles.trendlineTitle}>{isSinhala ? 'ප්‍රගති ප්‍රවණතාවය' : "Progress Trendline"}</Text>
                    <View style={styles.trendlinePlaceholder}>
                        <Text style={styles.trendlinePlaceholderText}>
                            {isSinhala ? 'ප්‍රගති ප්‍රවණතාවය පෙන්වීමට ප්‍රමාණවත් දත්ත නැත. ව්‍යායාම සම්පූර්ණ කරන්න!' : "Complete exercises to view the progress trendline!"}
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
                <Text style={styles.trendlineTitle}>{isSinhala ? 'ප්‍රගති ප්‍රවණතාවය (පසුගිය සැසි)' : "Progress Trendline (Recent Sessions)"}</Text>
                <TrendChart
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
                    chartConfig={{
                        backgroundColor: '#F8FAFC',
                        backgroundGradientFrom: '#F8FAFC',
                        backgroundGradientTo: '#F8FAFC',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
                        style: { borderRadius: 16 },
                        propsForDots: { r: "5", strokeWidth: "2", stroke: "#6366F1" }
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
            ? getChartData(progress.movementTrendData, selectedFilter)
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
                        <TrendChart
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
                            chartConfig={{
                                backgroundColor: '#FFF',
                                backgroundGradientFrom: '#FFF',
                                backgroundGradientTo: '#FFF',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: { r: "5", strokeWidth: "2", stroke: "#10B981" }
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
                        <TrendChart
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
                            chartConfig={{
                                backgroundColor: '#FFF',
                                backgroundGradientFrom: '#FFF',
                                backgroundGradientTo: '#FFF',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: { r: "5", strokeWidth: "2", stroke: "#7C3AED" }
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

    const header = (
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
    );

    return (
        <ScreenContainer
            gradient={['#EEF2FF', '#FFFFFF', '#F1F5F9']}
            edges={['top', 'bottom']}
            header={header}
            maxWidth="wide"
            contentContainerStyle={{ paddingTop: 8 }}
        >
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loadingText}>Loading progress data...</Text>
                </View>
            ) : progress ? (
                <View style={styles.progressContainer} onLayout={onProgressLayout}>
                    {/* Dropdown Time Filter Selector at Top of Container */}
                    <View style={{ position: 'relative', zIndex: 100, marginBottom: 8 }}>
                        <TouchableOpacity
                            style={styles.dropdownHeader}
                            onPress={() => setShowDropdown(!showDropdown)}
                        >
                            <Text style={styles.dropdownHeaderText}>
                                📅 {filters.find(f => f.key === selectedFilter)?.label}
                            </Text>
                            <Text style={styles.dropdownHeaderArrow}>{showDropdown ? '▲' : '▼'}</Text>
                        </TouchableOpacity>

                        {showDropdown && (
                            <View style={styles.dropdownList}>
                                {filters.map(item => (
                                    <TouchableOpacity
                                        key={item.key}
                                        style={[
                                            styles.dropdownItem,
                                            selectedFilter === item.key && styles.dropdownItemActive
                                        ]}
                                        onPress={() => {
                                            setSelectedFilter(item.key);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            selectedFilter === item.key && styles.dropdownItemTextActive
                                        ]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
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
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        width: '100%',
    },
    dropdownHeaderText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    dropdownHeaderArrow: {
        fontSize: 10,
        color: '#64748B',
    },
    dropdownList: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        elevation: 6,
        shadowColor: '#4F46E5',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        zIndex: 100,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    dropdownItemActive: {
        backgroundColor: '#EEF2FF',
    },
    dropdownItemText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    dropdownItemTextActive: {
        color: '#4F46E5',
        fontWeight: '800',
    },
});
