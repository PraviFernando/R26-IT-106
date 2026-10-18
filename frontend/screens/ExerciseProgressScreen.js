import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import exerciseService from '../services/exerciseService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContentWell } from '../components/ScreenContainer';
import ExerciseShell from '../components/exercise/ExerciseShell';
import ExerciseWatchHistory from './ExerciseWatchHistory';
import { toLocalDateStr, todayStr } from '../utils/exerciseUtils';
import { getTranslatedTrend, formatDays } from '../utils/exerciseMessages';
import { BarChart, C, T, cardShadow, Card, GradientCard, SectionTitle, StatTile, CircleButton, Icon, useExerciseFonts } from '../components/exercise/ui';


// =====================================================================================
// PROGRESS SCREEN = the "Progress" tab and the "Watch history" tab.
// Progress numbers come from GET /exercise/progress (backend getProgress): streak, this week, average time,
// missed sessions, recovery trend, daily score chart and the movement tracking statistics.
// The Watch history tab is the component in screens/ExerciseWatchHistory.js.
// =====================================================================================

export default function ExerciseProgressScreen({ navigation, route }) {
    const { t, i18n } = useTranslation();
    const fontsReady = useExerciseFonts();
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
    const [activeTab, setActiveTab] = useState(route?.params?.tab === 'history' ? 'history' : 'progress');
    useEffect(() => {
        if (route?.params?.tab) setActiveTab(route.params.tab === 'history' ? 'history' : 'progress');
    }, [route?.params?.tab, route?.params?.ts]);


    // keeps the points of the last 7 / 30 / 365 calendar days for the chart filter
    const getChartData = (dataArray, filter) => {
        if (!dataArray || dataArray.length === 0) return [];
        const limit = filter === 'weekly' ? 7 : filter === 'monthly' ? 30 : filter === 'last3months' ? 90 : filter === 'last6months' ? 180 : 365;
        // Keep entries from the last `limit` calendar days (not the last `limit` entries)
        const start = new Date();
        start.setDate(start.getDate() - (limit - 1));
        const startStr = toLocalDateStr(start);
        const sliced = dataArray.filter(item => item.date >= startStr);

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


    useEffect(() => {
        // loads one year of progress and today mood in one go
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


    const tr = (en, si) => (isSinhala ? si : en);
    const shortDate = (date) => {
        const p = String(date).split('-');
        return p.length >= 3 ? `${p[1]}/${p[2]}` : date;
    };
    // Weekly view: weekday names; longer ranges: month/day
    const barLabel = (date) => {
        if (selectedFilter !== 'weekly') return shortDate(date);
        if (date === toLocalDateStr(new Date())) return tr('Today', 'අද');
        const d = new Date(date + 'T00:00:00');
        return isNaN(d) ? shortDate(date) : d.toLocaleDateString(isSinhala ? 'si-LK' : 'en-US', { weekday: 'short' });
    };

    // Line chart inside a card; shows a friendly message when there is no data yet
    const ChartCard = ({ title, data, valueKey, emptyText }) => (
        <Card style={pg.chartCard}>
            <SectionTitle>{title}</SectionTitle>
            {data.length > 0 ? (
                <BarChart
                    accessibilityLabel={`${title}: ${data.map(d => `${barLabel(d.date)} ${Math.round(d[valueKey])}`).join(', ')}`}
                    data={data.map(d => ({ key: d.date, label: barLabel(d.date), value: d[valueKey] }))}
                />
            ) : (
                <Text style={pg.empty}>{emptyText}</Text>
            )}
        </Card>
    );

    const renderWeekStrip = () => {
        const completedDates = new Set((progress.progressData || []).map(r => r.date));
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = toLocalDateStr(d);
            const done = completedDates.has(dStr);
            days.push(
                <View key={dStr} style={pg.day}>
                    <Text style={[pg.dayName, i === 0 && pg.dayToday]}>
                        {i === 0 ? tr('Today', 'අද') : d.toLocaleDateString(isSinhala ? 'si-LK' : 'en-US', { weekday: 'short' })}
                    </Text>
                    <View style={[pg.dayCircle, done && pg.dayDone, !done && i === 0 && pg.dayPending]}
                        accessibilityLabel={done ? tr('Exercised', 'ව්‍යායාම කළා') : tr('No exercise', 'ව්‍යායාම නැත')}>
                        {done ? <Icon name="check" size={16} color={C.primaryDark} /> : <Text style={pg.dayNum}>{d.getDate()}</Text>}
                    </View>
                </View>
            );
        }
        return <View style={pg.week}>{days}</View>;
    };

    const header = (
        <View style={pg.header}>
            <CircleButton icon="back" onPress={() => navigation.goBack()} label={tr('Back', 'ආපසු')} />
            <Text style={pg.headerTitle} numberOfLines={1}>{tr('Your progress', 'ඔබේ ප්‍රගතිය')}</Text>
            <Pressable
                onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')}
                accessibilityRole="button"
                accessibilityLabel={tr('Switch language', 'භාෂාව මාරු කරන්න')}
                style={pg.lang}
            >
                <Text style={pg.langText}>{i18n.language === 'en' ? 'සිං' : 'EN'}</Text>
            </Pressable>
        </View>
    );

    const trendData = progress ? getChartData(progress.progressData, selectedFilter) : [];
    const movementTrend = progress ? getChartData(progress.movementTrendData, selectedFilter) : [];
    const accuracyTrend = progress && progress.weeklyAccuracyTrendData ? progress.weeklyAccuracyTrendData.slice(-7) : [];

    // Phones need the exercise fonts loaded before text uses them (web falls back to sans-serif)
    if (!fontsReady && Platform.OS !== 'web') return <View style={{ flex: 1, backgroundColor: C.bg }} />;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
          <ExerciseShell
            active={activeTab === 'history' ? 'history' : 'progress'}
            navigation={navigation}
            isSinhala={isSinhala}
            header={header}
            onLocal={(key) => {
                if (key === 'progress' || key === 'history') { setActiveTab(key); return true; }
                return false;
            }}
          >
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              <ContentWell maxWidth="wide">

            {/* tab switch. history -> watch history list, otherwise the progress page below */}
            {activeTab === 'history' ? (
                <ExerciseWatchHistory isSinhala={isSinhala} />
            ) : loading ? (
                <View style={pg.center}>
                    <ActivityIndicator size="large" color={C.primaryDark} />
                    <Text style={pg.empty}>{tr('Loading your progress...', 'ඔබේ ප්‍රගතිය පූරණය වෙමින්...')}</Text>
                </View>
            ) : progress ? (
                <View style={pg.page}>
                    <GradientCard style={{ gap: 14 }}>
                        <View style={pg.streakRow}>
                            <View>
                                <Text style={pg.streakLabel}>{tr('Current streak', 'වත්මන් අඛණ්ඩතාවය')}</Text>
                                <Text style={pg.streakValue}>{formatDays(progress.currentStreak, isSinhala)}</Text>
                            </View>
                            <Text style={pg.streakLabel}>{tr('Best', 'හොඳම')}: {formatDays(progress.bestStreak ?? 0, isSinhala)}</Text>
                        </View>
                        {renderWeekStrip()}
                    </GradientCard>

                    <View style={pg.stats}>
                        <StatTile value={`${progress.weeklyCompletionRate ?? 0}%`} label={tr('This week', 'මෙම සතිය')} style={pg.stat} />
                        <StatTile value={`${progress.averageDuration ?? 0} ${tr('min', 'මි.')}`} label={tr('Average time', 'සාමාන්‍ය කාලය')} style={pg.stat} />
                        <StatTile value={String(progress.totalExercises ?? 0)} label={tr('Completed', 'සම්පූර්ණ කළ')} style={pg.stat} />
                        <StatTile value={String(progress.missedSessions ?? 0)} label={tr('Missed (7 days)', 'මඟ හැරුණු (දින 7)')} style={pg.stat} />
                    </View>

                    {progress.recoveryTrend && (
                        <View style={pg.trend}>
                            <Text style={pg.trendKicker}>{tr('Recovery trend', 'සුවවීමේ ප්‍රවණතාවය')}</Text>
                            <Text style={pg.trendText}>{getTranslatedTrend(progress.recoveryTrend, isSinhala, progress.recoveryTrendCode)}</Text>
                        </View>
                    )}

                    <View style={pg.filterRow}>
                        <SectionTitle>{tr('Charts', 'ප්‍රස්ථාර')}</SectionTitle>
                        <View style={{ position: 'relative', zIndex: 100 }}>
                            <Pressable style={pg.filterBtn} onPress={() => setShowDropdown(!showDropdown)} accessibilityRole="button">
                                <Text style={pg.filterText}>{filters.find(f => f.key === selectedFilter)?.label}</Text>
                                <Text style={pg.filterText}>{showDropdown ? '▲' : '▼'}</Text>
                            </Pressable>
                            {showDropdown && (
                                <View style={pg.dropdown}>
                                    {filters.map(item => (
                                        <Pressable
                                            key={item.key}
                                            style={[pg.dropItem, selectedFilter === item.key && pg.dropItemOn]}
                                            onPress={() => { setSelectedFilter(item.key); setShowDropdown(false); }}
                                        >
                                            <Text style={[pg.filterText, selectedFilter === item.key && { color: C.primaryDark, ...T.bold }]}>{item.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <ChartCard
                        title={tr('Daily score', 'දෛනික ලකුණු')}
                        data={trendData}
                        valueKey="avgAccuracy"
                        emptyText={tr('Complete exercises to see your daily score.', 'දෛනික ලකුණු දැකීමට ව්‍යායාම සම්පූර්ණ කරන්න.')}
                    />

                    {/* statistics from the camera movement sessions (average form, best score, correct reps, sessions) */}
                    <SectionTitle style={{ marginTop: 4 }}>{tr('Movement tracking', 'චලන ලුහුබැඳීම')}</SectionTitle>
                    <View style={pg.stats}>
                        <StatTile value={`${progress.averageMovementAccuracy ?? 0}%`} label={tr('Average form', 'සාමාන්‍ය නිරවද්‍යතාව')} style={pg.stat} />
                        <StatTile value={`${progress.bestMovementScore ?? 0}%`} label={tr('Best score', 'හොඳම ලකුණ')} style={pg.stat} />
                        <StatTile value={String(progress.totalCorrectRepetitions ?? 0)} label={tr('Correct reps', 'නිවැරදි වාර')} style={pg.stat} />
                        <StatTile value={String(progress.completedMovementSessionsCount ?? 0)} label={tr('Sessions', 'සැසි')} style={pg.stat} />
                    </View>
                    <ChartCard
                        title={tr('Form accuracy', 'නිරවද්‍යතා ප්‍රවණතාවය')}
                        data={accuracyTrend}
                        valueKey="avgAccuracy"
                        emptyText={tr('Use camera tracking to see your form accuracy.', 'නිරවද්‍යතාව දැකීමට කැමරා ලුහුබැඳීම භාවිතා කරන්න.')}
                    />
                    <ChartCard
                        title={tr('Movement score', 'චලන ලකුණු')}
                        data={movementTrend}
                        valueKey="avgScore"
                        emptyText={tr('Use camera tracking to see your movement score.', 'චලන ලකුණු දැකීමට කැමරා ලුහුබැඳීම භාවිතා කරන්න.')}
                    />
                </View>
            ) : (
                <Card style={pg.center}><Text style={pg.empty}>{tr('No progress data yet. Complete an exercise to start.', 'තවම ප්‍රගති දත්ත නැත. ආරම්භ කිරීමට ව්‍යායාමයක් සම්පූර්ණ කරන්න.')}</Text></Card>
            )}
              </ContentWell>
            </ScrollView>
          </ExerciseShell>
        </SafeAreaView>
    );
}

// Layout for the redesigned progress screen (PeriCare exercise mockups)
const pg = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
    headerTitle: { flex: 1, ...T.heading, fontSize: 22, color: C.text },
    lang: { minHeight: 44, minWidth: 44, paddingHorizontal: 12, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: C.control, alignItems: 'center', justifyContent: 'center' },
    langText: { ...T.bold, fontSize: 13, color: C.primaryDark },
    tabs: { flexDirection: 'row', backgroundColor: C.border, borderRadius: 22, padding: 4, gap: 4, marginBottom: 14 },
    tab: { flex: 1, minHeight: 42, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    tabOn: { backgroundColor: '#FFFFFF' },
    tabText: { ...T.semi, fontSize: 14, color: C.textSub },
    tabTextOn: { ...T.bold, color: C.primaryDark },
    page: { gap: 14 },
    center: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 40 },
    empty: { ...T.medium, fontSize: 14, color: C.textSub, textAlign: 'center', paddingVertical: 24 },
    streakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    streakLabel: { ...T.semi, fontSize: 13, color: C.tint },
    streakValue: { ...T.heading, fontSize: 30, color: '#FFFFFF' },
    week: { flexDirection: 'row', justifyContent: 'space-between' },
    day: { alignItems: 'center', gap: 6 },
    dayName: { ...T.semi, fontSize: 12, color: C.tint },
    dayToday: { ...T.bold, color: '#FFFFFF' },
    dayCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
    dayDone: { backgroundColor: '#FFFFFF' },
    dayPending: { borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.7)', backgroundColor: 'transparent' },
    dayNum: { ...T.bold, fontSize: 13, color: '#FFFFFF' },
    stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    stat: { flexBasis: 150, flexGrow: 1 },
    trend: { backgroundColor: C.soft, borderRadius: 22, padding: 16, gap: 6 },
    trendKicker: { ...T.bold, fontSize: 12, color: C.primaryDark, textTransform: 'uppercase', letterSpacing: 0.8 },
    trendText: { ...T.medium, fontSize: 15, lineHeight: 22, color: C.text },
    filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 },
    filterBtn: { minHeight: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: C.control, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 8 },
    filterText: { ...T.semi, fontSize: 13, color: C.text },
    dropdown: { position: 'absolute', right: 0, top: 46, minWidth: 180, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingVertical: 6, ...cardShadow },
    dropItem: { minHeight: 40, paddingHorizontal: 14, justifyContent: 'center' },
    dropItemOn: { backgroundColor: C.tint },
    chartCard: { gap: 10, alignItems: 'stretch' },
});

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
    tabBar: {
        flexDirection: 'row', backgroundColor: '#EEF2FF', borderRadius: 16, padding: 4, gap: 4,
    },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
    tabBtnActive: {
        backgroundColor: '#FFF', elevation: 2, shadowColor: '#4F46E5', shadowOpacity: 0.12,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    },
    tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    tabTextActive: { color: '#4F46E5' },
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
