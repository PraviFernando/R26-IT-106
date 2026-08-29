import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    useWindowDimensions, ActivityIndicator, Modal, TextInput, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { LineChart, BarChart } from 'react-native-chart-kit';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { COLORS, SHADOWS } from '../constants/theme';

// ── Growth Status Helper ──────────────────────────────────────────────────────
function calculateGrowthStatus(currentWeight, currentLength, ageInMonths, t) {
    const w = parseFloat(currentWeight) || 3.5;
    const l = parseFloat(currentLength) || 50;
    const months = Math.max(0, Math.min(12, ageInMonths || 1));

    // Approximate WHO median & standard ranges
    const expectedWeightMin = 3.0 + months * 0.5;
    const expectedWeightMax = 4.8 + months * 0.8;

    if (w < expectedWeightMin) {
        return {
            status: t('Underweight'),
            color: COLORS.warning,
            bg: COLORS.cardYellow,
            border: COLORS.borderYellow,
            emoji: '⚠️',
            desc: t('Weight is below expected average for age. Consult your midwife or healthcare provider for tailored nutritional support.'),
        };
    } else if (w > expectedWeightMax) {
        return {
            status: t('Above Expected Range'),
            color: COLORS.primary,
            bg: COLORS.cardPurple,
            border: COLORS.borderPurple,
            emoji: '📈',
            desc: t('Weight is above average expected range. Baby is growing rapidly! Continue balanced feeding and routine midwife checks.'),
        };
    } else {
        return {
            status: t('Normal'),
            color: COLORS.success,
            bg: COLORS.cardGreen,
            border: COLORS.borderGreen,
            emoji: '✅',
            desc: t('Baby is growing at a healthy and consistent pace within standard expected percentile limits!'),
        };
    }
}

export default function GrowthChartScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const { width: windowWidth } = useWindowDimensions();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Dynamic responsive chart width calculation for high responsiveness on all screen sizes
    const chartWidth = Math.max(280, windowWidth - 44);

    // New entry state
    const [newWeight, setNewWeight] = useState('');
    const [newLength, setNewLength] = useState('');
    const [newHead, setNewHead] = useState('');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [newNotes, setNewNotes] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await api.get('/user/me');
            if (res.data) {
                setUser(res.data);
            }
        } catch (err) {
            Toast.show({ type: 'error', text1: t('Error'), text2: t('Failed to load growth data') });
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = async () => {
        if (!newWeight.trim() && !newLength.trim()) {
            Toast.show({ type: 'error', text1: t('Required'), text2: t('Please enter weight or height.') });
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/user/growth-record', {
                date: newDate,
                weight: newWeight.trim(),
                length: newLength.trim(),
                headCircumference: newHead.trim(),
                notes: newNotes.trim() || t('Follow-up visit'),
            });
            Toast.show({ type: 'success', text1: `🎉 ${t('Record Added')}`, text2: t('Growth record logged successfully!') });
            setAddModalVisible(false);
            setNewWeight(''); setNewLength(''); setNewHead(''); setNewNotes('');
            if (res.data?.user) {
                setUser(res.data.user);
            } else {
                fetchUserData();
            }
        } catch (err) {
            Toast.show({ type: 'error', text1: t('Error'), text2: err.response?.data?.message || t('Submission failed. Please try again.') });
        } finally {
            setSubmitting(false);
        }
    };

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en');
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, styles.centered]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>{t('Loading...')}</Text>
            </SafeAreaView>
        );
    }

    const babyName = user?.babyName || t('Patient');
    const gender = user?.gender || t('Patient');
    const currentWeight = user?.currentWeight || user?.birthWeight || '3.5';
    const currentLength = user?.currentLength || user?.birthLength || '50';

    // Calculate age in months
    let ageInMonths = 1;
    if (user?.deliveryDate) {
        const birth = new Date(user.deliveryDate);
        const diffMs = Date.now() - birth.getTime();
        ageInMonths = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44)));
    }

    const growthStatus = calculateGrowthStatus(currentWeight, currentLength, ageInMonths, t);

    // Chart Data Preparation
    const history = user?.growthHistory && user.growthHistory.length > 0
        ? user.growthHistory
        : [
            { date: 'Birth', weight: user?.birthWeight || '3.2', length: user?.birthLength || '50' },
            { date: 'Current', weight: currentWeight, length: currentLength },
        ];

    const chartLabels = history.map((item, idx) => {
        if (!item.date) return `V${idx + 1}`;
        if (item.date.length > 10) return item.date.slice(5, 10);
        return item.date;
    });

    const weightSeries = history.map(item => parseFloat(item.weight) || 3.5);
    const lengthSeries = history.map(item => parseFloat(item.length) || 50);

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: { r: '5', strokeWidth: '2', stroke: COLORS.primary },
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <View style={styles.backCircle}>
                        <Text style={styles.backIcon}>‹</Text>
                    </View>
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 8 }}>
                    <Text style={styles.headerTitle} numberOfLines={1}>👶 {babyName}'s {t('Child Growth Chart')}</Text>
                    <Text style={styles.headerSub}>{gender} • {ageInMonths} {t('Month(s) Old')}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
                        <Text style={styles.langTxt}>{i18n.language === 'en' ? 'සිං' : 'EN'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.addRecordIconBtn}>
                        <Text style={{ fontSize: 18, color: COLORS.textWhite, fontWeight: 'bold' }}>＋</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Hero Image Banner */}
                <View style={styles.heroImageCard}>
                    <Image source={require('../assets/screening_system/image 8.jpg')} style={styles.heroImage} resizeMode="cover" />
                    <View style={styles.heroOverlay} />
                    <View style={styles.heroContent}>
                        <Text style={styles.heroBadge}>👶 {t('Baby\'s Growth Chart')}</Text>
                        <Text style={styles.heroTitle}>{t('Track baby\'s growth progress with interactive charts and percentile tracking.')}</Text>
                    </View>
                </View>

                {/* Status Badge Banner */}
                <View style={[styles.statusCard, { backgroundColor: growthStatus.bg, borderColor: growthStatus.border }]}>
                    <View style={styles.statusHeaderRow}>
                        <Text style={styles.statusEmoji}>{growthStatus.emoji}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.statusTitleTag}>{t('Growth Status')}</Text>
                            <Text style={[styles.statusMainLabel, { color: growthStatus.color }]}>
                                {growthStatus.status}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.statusDesc}>{growthStatus.desc}</Text>
                </View>

                {/* Responsive Summary Stat Cards */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { borderLeftColor: COLORS.primary }]}>
                        <Text style={styles.statIcon}>⚖️</Text>
                        <Text style={styles.statNumber}>{currentWeight} kg</Text>
                        <Text style={styles.statLabel}>{t('Current Weight')}</Text>
                        <Text style={styles.statSub}>{t('Birth:')} {user?.birthWeight || '—'} kg</Text>
                    </View>

                    <View style={[styles.statBox, { borderLeftColor: '#0EA5E9' }]}>
                        <Text style={styles.statIcon}>📏</Text>
                        <Text style={styles.statNumber}>{currentLength} cm</Text>
                        <Text style={styles.statLabel}>{t('Current Height/Length')}</Text>
                        <Text style={styles.statSub}>{t('Birth:')} {user?.birthLength || '—'} cm</Text>
                    </View>
                </View>

                {/* Responsive Weight Trend Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>📊 {t('Weight Progress Trajectory (kg)')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: '100%' }}>
                        <LineChart
                            data={{
                                labels: chartLabels,
                                datasets: [{ data: weightSeries.length > 0 ? weightSeries : [3.5, 4.2] }],
                            }}
                            width={chartWidth}
                            height={210}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </ScrollView>
                </View>

                {/* Responsive Length Trend Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>📐 {t('Height/Length Trajectory (cm)')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: '100%' }}>
                        <BarChart
                            data={{
                                labels: chartLabels,
                                datasets: [{ data: lengthSeries.length > 0 ? lengthSeries : [50, 55] }],
                            }}
                            width={chartWidth}
                            height={200}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
                            }}
                            style={styles.chart}
                            showValuesOnTopOfBars
                            fromZero
                        />
                    </ScrollView>
                </View>

                {/* Logged Measurements History */}
                <View style={styles.card}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.cardTitle}>📋 {t('Measurement History')}</Text>
                        <TouchableOpacity style={styles.addBtnSmall} onPress={() => setAddModalVisible(true)}>
                            <Text style={styles.addBtnSmallTxt}>{t('+ Log Visit')}</Text>
                        </TouchableOpacity>
                    </View>

                    {history.map((record, i) => (
                        <View key={i} style={styles.historyRow}>
                            <View style={styles.historyDot} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.historyDate}>{record.date}</Text>
                                <Text style={styles.historyDetails}>
                                    {t('Weight (kg)')}: <Text style={styles.boldTxt}>{record.weight} kg</Text> • {t('Height / Length (cm)')}: <Text style={styles.boldTxt}>{record.length} cm</Text>
                                </Text>
                                {record.notes ? <Text style={styles.historyNote}>{record.notes}</Text> : null}
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* ── Add Measurement Modal ────────────────────────────────────── */}
            <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>🩺 {t('Log Follow-up Visit Measurements')}</Text>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>{t('Visit Date')}</Text>
                        <TextInput style={styles.input} value={newDate} onChangeText={setNewDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted} />

                        <Text style={styles.label}>{t('Weight (kg)')}</Text>
                        <TextInput style={styles.input} value={newWeight} onChangeText={setNewWeight} placeholder="e.g. 4.8" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />

                        <Text style={styles.label}>{t('Height / Length (cm)')}</Text>
                        <TextInput style={styles.input} value={newLength} onChangeText={setNewLength} placeholder="e.g. 57" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />

                        <Text style={styles.label}>{t('Head Circumference (cm)')}</Text>
                        <TextInput style={styles.input} value={newHead} onChangeText={setNewHead} placeholder="e.g. 36" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />

                        <Text style={styles.label}>{t('Notes / Observations')}</Text>
                        <TextInput style={styles.input} value={newNotes} onChangeText={setNewNotes} placeholder={t('Brief note about this activity...')} placeholderTextColor={COLORS.textMuted} />

                        <TouchableOpacity style={styles.submitModalBtn} onPress={handleAddRecord} disabled={submitting}>
                            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitModalBtnTxt}>{t('Save Measurement')}</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Toast />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.background, // Light Purple Screen Background
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textMuted,
        fontSize: 15,
        fontWeight: '600',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.background,
    },
    backBtn: {
        padding: 4,
    },
    backCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.card,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        marginTop: -3,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    headerSub: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 1,
        textAlign: 'center',
    },
    langBtn: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    langTxt: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.primary,
    },
    addRecordIconBtn: {
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.button,
    },

    scroll: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },

    // Hero Image Card
    heroImageCard: {
        height: 160,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOWS.card,
    },
    heroImage: { width: '100%', height: '100%', position: 'absolute' },
    heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17, 24, 39, 0.42)' },
    heroContent: { flex: 1, padding: 16, justifyContent: 'flex-end' },
    heroBadge: {
        backgroundColor: COLORS.primary,
        color: COLORS.textWhite,
        fontSize: 11,
        fontWeight: '800',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    heroTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textWhite, lineHeight: 20 },

    statusCard: {
        borderRadius: 18,
        borderWidth: 1.5,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.card,
    },
    statusHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    statusEmoji: {
        fontSize: 28,
    },
    statusTitleTag: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusMainLabel: {
        fontSize: 18,
        fontWeight: '800',
    },
    statusDesc: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 19,
    },

    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        padding: 14,
        borderLeftWidth: 4,
        ...SHADOWS.card,
    },
    statIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    statSub: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginTop: 4,
    },

    chartCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        ...SHADOWS.card,
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    chart: {
        borderRadius: 12,
    },

    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.card,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    addBtnSmall: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    addBtnSmallTxt: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },

    historyRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    historyDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginTop: 4,
    },
    historyDate: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    historyDetails: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    boldTxt: {
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    historyNote: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontStyle: 'italic',
        marginTop: 2,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.cardBg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    modalClose: {
        fontSize: 20,
        color: COLORS.textMuted,
        padding: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 4,
        marginTop: 10,
    },
    input: {
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
        borderRadius: 12,
        padding: 11,
        fontSize: 14,
        backgroundColor: COLORS.background,
        color: COLORS.textPrimary,
    },
    submitModalBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        marginTop: 20,
        ...SHADOWS.button,
    },
    submitModalBtnTxt: {
        color: COLORS.textWhite,
        fontSize: 15,
        fontWeight: 'bold',
    },
});
