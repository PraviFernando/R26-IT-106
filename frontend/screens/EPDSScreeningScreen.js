import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    ActivityIndicator,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

// ─── EPDS Questions ───────────────────────────────────────────────────────────
const getQuestions = (t) => [
    {
        id: 1,
        text: t('I have been able to laugh and see the funny side of things'),
        options: [
            { label: t('As much as I always could'), score: 0 },
            { label: t('Not quite so much now'), score: 1 },
            { label: t('Definitely not so much now'), score: 2 },
            { label: t('Not at all'), score: 3 },
        ],
        emoji: '😄',
    },
    {
        id: 2,
        text: t('I have looked forward with enjoyment to things'),
        options: [
            { label: t('As much as I ever did'), score: 0 },
            { label: t('Rather less than I used to'), score: 1 },
            { label: t('Definitely less than I used to'), score: 2 },
            { label: t('Hardly at all'), score: 3 },
        ],
        emoji: '🌟',
    },
    {
        id: 3,
        text: t('I have blamed myself unnecessarily when things went wrong'),
        options: [
            { label: t('No, never'), score: 0 },
            { label: t('Not very often'), score: 1 },
            { label: t('Yes, some of the time'), score: 2 },
            { label: t('Yes, most of the time'), score: 3 },
        ],
        emoji: '💭',
        reversed: true,
    },
    {
        id: 4,
        text: t('I have been anxious or worried for no good reason'),
        options: [
            { label: t('No, not at all'), score: 0 },
            { label: t('Hardly ever'), score: 1 },
            { label: t('Yes, sometimes'), score: 2 },
            { label: t('Yes, very often'), score: 3 },
        ],
        emoji: '😟',
        reversed: true,
    },
    {
        id: 5,
        text: t('I have felt scared or panicky for no very good reason'),
        options: [
            { label: t('No, not at all'), score: 0 },
            { label: t('No, not much'), score: 1 },
            { label: t('Yes, sometimes'), score: 2 },
            { label: t('Yes, quite a lot'), score: 3 },
        ],
        emoji: '😰',
        reversed: true,
    },
    {
        id: 6,
        text: t('Things have been getting on top of me'),
        options: [
            { label: t('No, I have been coping as well as ever'), score: 0 },
            { label: t('No, most of the time I have coped quite well'), score: 1 },
            { label: t("Yes, sometimes I haven't been coping as well as usual"), score: 2 },
            { label: t("Yes, most of the time I haven't been able to cope at all"), score: 3 },
        ],
        emoji: '😔',
        reversed: true,
    },
    {
        id: 7,
        text: t('I have been so unhappy that I have had difficulty sleeping'),
        options: [
            { label: t('No, not at all'), score: 0 },
            { label: t('Not very often'), score: 1 },
            { label: t('Yes, sometimes'), score: 2 },
            { label: t('Yes, most of the time'), score: 3 },
        ],
        emoji: '😴',
        reversed: true,
    },
    {
        id: 8,
        text: t('I have felt sad or miserable'),
        options: [
            { label: t('No, not at all'), score: 0 },
            { label: t('Not very often'), score: 1 },
            { label: t('Yes, quite often'), score: 2 },
            { label: t('Yes, most of the time'), score: 3 },
        ],
        emoji: '😢',
        reversed: true,
    },
    {
        id: 9,
        text: t('I have been so unhappy that I have been crying'),
        options: [
            { label: t('No, never'), score: 0 },
            { label: t('Only occasionally'), score: 1 },
            { label: t('Yes, quite often'), score: 2 },
            { label: t('Yes, most of the time'), score: 3 },
        ],
        emoji: '😭',
        reversed: true,
    },
    {
        id: 10,
        text: t('The thought of harming myself has occurred to me'),
        options: [
            { label: t('Never'), score: 0 },
            { label: t('Hardly ever'), score: 1 },
            { label: t('Sometimes'), score: 2 },
            { label: t('Yes, quite often'), score: 3 },
        ],
        emoji: '🆘',
        reversed: true,
        sensitive: true,
    },
];

// ─── Risk Config ─────────────────────────────────────────────────────────────
const getRiskConfig = (t) => ({
    low: {
        label: t('Low Risk'),
        color: '#10B981',
        bg: '#ECFDF5',
        border: '#6EE7B7',
        emoji: '💚',
        message: t('Your score suggests low risk. Keep practising self-care and reach out to your midwife if you ever feel down.'),
    },
    medium: {
        label: t('Medium Risk'),
        color: '#F59E0B',
        bg: '#FFFBEB',
        border: '#FCD34D',
        emoji: '💛',
        message: t('Your score suggests moderate risk. Please speak to your healthcare provider soon — support is available.'),
    },
    high: {
        label: t('High Risk'),
        color: '#EF4444',
        bg: '#FEF2F2',
        border: '#FCA5A5',
        emoji: '❤️',
        message: t('Your score suggests high risk. Please contact your midwife or doctor today. You are not alone — help is here.'),
    },
});

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ question, selectedScore, onSelect, index, total }) {
    const { t } = useTranslation();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.questionHeader}>
                <View style={styles.questionNumberBadge}>
                    <Text style={styles.questionNumberText}>{index + 1}/{total}</Text>
                </View>
                <Text style={styles.questionEmoji}>{question.emoji}</Text>
                {question.sensitive && (
                    <View style={styles.sensitiveBadge}>
                        <Text style={styles.sensitiveText}>{t('Sensitive')}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.questionText}>{question.text}</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {question.options.map((opt, i) => {
                    const isSelected = selectedScore === opt.score;
                    return (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.optionBtn,
                                isSelected && styles.optionBtnSelected,
                            ]}
                            onPress={() => onSelect(question.id, opt.score)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]}>
                                {isSelected && <View style={styles.optionRadioDot} />}
                            </View>
                            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </Animated.View>
    );
}

// ─── Result Modal ─────────────────────────────────────────────────────────────
function ResultModal({ visible, score, riskLevel, onClose, onViewHistory }) {
    const { t } = useTranslation();
    const riskConfig = getRiskConfig(t);
    const cfg = riskConfig[riskLevel] || riskConfig.low;
    const scaleAnim = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <Animated.View style={[styles.resultCard, { transform: [{ scale: scaleAnim }] }]}>
                    {/* Risk badge */}
                    <View style={[styles.riskBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                        <Text style={styles.riskEmoji}>{cfg.emoji}</Text>
                        <Text style={[styles.riskLabel, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>

                    {/* Score ring */}
                    <View style={[styles.scoreRing, { borderColor: cfg.color }]}>
                        <Text style={[styles.scoreNumber, { color: cfg.color }]}>{score}</Text>
                        <Text style={styles.scoreMax}>/30</Text>
                    </View>
                    <Text style={styles.scoreCaption}>{t('Your EPDS Score')}</Text>

                    <Text style={styles.resultMessage}>{cfg.message}</Text>

                    {/* Crisis line if high */}
                    {riskLevel === 'high' && (
                        <View style={styles.crisisBox}>
                            <Text style={styles.crisisText}>
                                {t('📞 Sri Lanka Mental Health Helpline: 1926')}
                            </Text>
                        </View>
                    )}

                    <View style={styles.resultActions}>
                        <TouchableOpacity
                            style={[styles.resultBtn, { backgroundColor: cfg.color }]}
                            onPress={onViewHistory}
                        >
                            <Text style={styles.resultBtnText}>{t('📊 View History')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.resultBtnOutline} onPress={onClose}>
                            <Text style={[styles.resultBtnOutlineText, { color: cfg.color }]}>{t('Done')}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

// ─── History Modal ────────────────────────────────────────────────────────────
function HistoryModal({ visible, history, onClose }) {
    const { t } = useTranslation();
    const riskConfig = getRiskConfig(t);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>{t('📅 Screening History')}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.historyClose}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {history.length === 0 && (
                            <Text style={styles.historyEmpty}>{t('No past screenings yet.')}</Text>
                        )}
                        {history.map((item, i) => {
                            const cfg = riskConfig[item.riskLevel] || riskConfig.low;
                            const monthParts = item.month.split(' ');
                            const translatedMonth = monthParts.length > 1 ? `${t(monthParts[0])} ${monthParts[1]}` : t(item.month);
                            return (
                                <View key={i} style={[styles.historyRow, { borderLeftColor: cfg.color }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.historyMonth}>{translatedMonth}</Text>
                                        <Text style={[styles.historyRisk, { color: cfg.color }]}>
                                            {cfg.emoji} {cfg.label}
                                        </Text>
                                    </View>
                                    <View style={[styles.historyScoreBadge, { backgroundColor: cfg.bg }]}>
                                        <Text style={[styles.historyScore, { color: cfg.color }]}>
                                            {item.totalScore}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function EPDSScreeningScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const questions = getQuestions(t);
    const riskConfig = getRiskConfig(t);

    const [answers, setAnswers] = useState({}); // { questionId: score }
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [alreadyDone, setAlreadyDone] = useState(null); // existing result this month
    const [showResult, setShowResult] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    // Personal Details
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [district, setDistrict] = useState('');
    const [village, setVillage] = useState('');

    const scrollRef = useRef(null);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const answered = Object.keys(answers).length;
    const progress = answered / questions.length;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    // Fetch current month result on mount
    useEffect(() => {
        const fetchCurrent = async () => {
            try {
                const res = await api.get('/epds/current');
                if (res.data) setAlreadyDone(res.data);
            } catch (_) { /* not authenticated yet or none */ }
            setLoading(false);
        };
        fetchCurrent();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/epds/history');
            setHistory(res.data || []);
        } catch (_) { setHistory([]); }
    };

    const handleSelect = (questionId, score) => {
        setAnswers((prev) => ({ ...prev, [questionId]: score }));
    };

    const handleSubmit = async () => {
        if (!fullName.trim() || !age.trim() || !district.trim() || !village.trim()) {
            Toast.show({
                type: 'error',
                text1: t('⚠️ Incomplete'),
                text2: t('Please fill in your personal details first.'),
                position: 'top',
            });
            return;
        }

        if (answered < questions.length) {
            Toast.show({
                type: 'error',
                text1: t('⚠️ Incomplete'),
                text2: t('Please answer all 10 questions before submitting.'),
                position: 'top',
            });
            return;
        }

        setSubmitting(true);
        try {
            // Build ordered answers array [q1, q2, … q10]
            const answerArray = questions.map((q) => answers[q.id]);
            const res = await api.post('/epds/submit', {
                answers: answerArray,
                fullName,
                age: Number(age),
                district,
                village
            });
            setResult(res.data.screening);
            await fetchHistory();
            setShowResult(true);
        } catch (err) {
            const msg = err.response?.data?.message || t('Submission failed. Please try again.');
            Toast.show({ type: 'error', text1: t('❌ Error'), text2: msg, position: 'top' });
        } finally {
            setSubmitting(false);
        }
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, styles.centered]}>
                <ActivityIndicator size="large" color={PURPLE} />
                <Text style={styles.loadingText}>{t('Loading…')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>🌸 {t('Maternal Wellness Check')}</Text>
                    <Text style={styles.headerSub}>{t('Edinburgh Postnatal Depression Scale')}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')} style={{ marginRight: 10 }}>
                        <Text style={{ fontWeight: '700', fontSize: 13, color: PURPLE, backgroundColor: PURPLE_LIGHT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                            {i18n.language === 'en' ? 'සිං' : 'EN'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={async () => { await fetchHistory(); setShowHistory(true); }}
                        style={styles.historyBtn}
                    >
                        <Text style={styles.historyBtnText}>📊</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Progress Bar ── */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
                <Text style={styles.progressText}>{answered}/{questions.length} {t('answered')}</Text>
            </View>

            {/* ── Already done banner ── */}
            {alreadyDone && (
                <View style={[styles.doneBanner, { backgroundColor: riskConfig[alreadyDone.riskLevel]?.bg || '#ECFDF5', borderColor: riskConfig[alreadyDone.riskLevel]?.border || '#6EE7B7' }]}>
                    <Text style={styles.doneBannerText}>
                        {riskConfig[alreadyDone.riskLevel]?.emoji} {t("You completed this month's screening.")}{' '}
                        {t('Score:')} <Text style={{ fontWeight: '800' }}>{alreadyDone.totalScore}/30</Text> —{' '}
                        <Text style={{ color: riskConfig[alreadyDone.riskLevel]?.color, fontWeight: '700' }}>
                            {riskConfig[alreadyDone.riskLevel]?.label}
                        </Text>
                    </Text>
                    <Text style={styles.doneBannerSub}>{t('You can retake it to update your result.')}</Text>
                </View>
            )}

            {/* ── Intro ── */}
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.introCard}>
                    <Text style={styles.introTitle}>{t('About This Screening')}</Text>
                    <Text style={styles.introText}>
                        <Text style={{ fontWeight: '700' }}>{t('Over the past 7 days')}</Text>, {t('how have you felt?')}
                        {'\n'}{t('Please answer all 10 questions honestly.')} {t('There are no right or wrong answers.')}
                    </Text>
                    <View style={styles.riskLegend}>
                        {Object.entries(riskConfig).map(([key, cfg]) => (
                            <View key={key} style={[styles.legendChip, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                                <Text style={{ fontSize: 12 }}>{cfg.emoji}</Text>
                                <Text style={[styles.legendText, { color: cfg.color }]}>{cfg.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Personal Details ── */}
                <View style={styles.introCard}>
                    <Text style={styles.introTitle}>{t('Personal Details')}</Text>
                    <TextInput
                        style={styles.inputField}
                        placeholder={t('Full Name')}
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    <TextInput
                        style={styles.inputField}
                        placeholder={t('Age')}
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.inputField}
                        placeholder={t('District (e.g., Colombo)')}
                        value={district}
                        onChangeText={setDistrict}
                    />
                    <TextInput
                        style={styles.inputField}
                        placeholder={t('Village (e.g., Battaramulla)')}
                        value={village}
                        onChangeText={setVillage}
                    />
                </View>

                {/* ── Questions ── */}
                {questions.map((q, index) => (
                    <QuestionCard
                        key={q.id}
                        question={q}
                        selectedScore={answers[q.id]}
                        onSelect={handleSelect}
                        index={index}
                        total={questions.length}
                    />
                ))}

                {/* ── Submit ── */}
                <TouchableOpacity
                    style={[
                        styles.submitBtn,
                        answered < questions.length && styles.submitBtnDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting}
                    activeOpacity={0.85}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.submitBtnText}>{t('Submit Screening')}</Text>
                            <Text style={styles.submitBtnSub}>
                                {answered < questions.length
                                    ? `${questions.length - answered} ${t('question(s) remaining')}`
                                    : t('All questions answered ✓')}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>

            {/* ── Modals ── */}
            {result && (
                <ResultModal
                    visible={showResult}
                    score={result.totalScore}
                    riskLevel={result.riskLevel}
                    onClose={() => { setShowResult(false); navigation.goBack(); }}
                    onViewHistory={() => { setShowResult(false); setShowHistory(true); }}
                />
            )}
            <HistoryModal
                visible={showHistory}
                history={history}
                onClose={() => setShowHistory(false)}
            />

            <Toast />
        </SafeAreaView>
    );
}

// ─── Constants & Styles ───────────────────────────────────────────────────────
const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#EDE9FE';

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F3F4F6' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#6B7280', fontSize: 15 },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        gap: 12,
    },
    backBtn: { padding: 6 },
    backIcon: { fontSize: 22, color: PURPLE, fontWeight: '700' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
    headerSub: { fontSize: 11, color: '#6B7280', marginTop: 1 },
    historyBtn: {
        marginLeft: 'auto',
        backgroundColor: PURPLE_LIGHT,
        borderRadius: 10,
        padding: 8,
    },
    historyBtnText: { fontSize: 18 },

    // ── Progress ──
    progressContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: PURPLE,
        borderRadius: 4,
    },
    progressText: { fontSize: 11, color: '#6B7280', textAlign: 'right' },

    // ── Done banner ──
    doneBanner: {
        margin: 12,
        borderRadius: 14,
        borderWidth: 1.5,
        padding: 12,
    },
    doneBannerText: { fontSize: 13, color: '#374151', lineHeight: 20 },
    doneBannerSub: { fontSize: 11, color: '#6B7280', marginTop: 4 },

    // ── Scroll ──
    scrollContent: { padding: 14, gap: 14 },

    // ── Intro Card ──
    introCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
    },
    inputField: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        marginTop: 10,
        backgroundColor: '#F9FAFB',
        fontSize: 14,
        color: '#111827',
    },
    introTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 6 },
    introText: { fontSize: 13, color: '#374151', lineHeight: 20 },
    riskLegend: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
    legendChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    legendText: { fontSize: 11, fontWeight: '700' },

    // ── Question Card ──
    questionCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
    },
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    questionNumberBadge: {
        backgroundColor: PURPLE_LIGHT,
        borderRadius: 20,
        paddingHorizontal: 9,
        paddingVertical: 3,
    },
    questionNumberText: { fontSize: 11, fontWeight: '700', color: PURPLE },
    questionEmoji: { fontSize: 22 },
    sensitiveBadge: {
        backgroundColor: '#FEF2F2',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginLeft: 'auto',
    },
    sensitiveText: { fontSize: 10, color: '#EF4444', fontWeight: '700' },
    questionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        lineHeight: 21,
        marginBottom: 14,
    },

    // ── Options ──
    optionsContainer: { gap: 8 },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#F9FAFB',
        gap: 10,
    },
    optionBtnSelected: {
        borderColor: PURPLE,
        backgroundColor: PURPLE_LIGHT,
    },
    optionRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
        flexShrink: 0,
    },
    optionRadioSelected: { borderColor: PURPLE },
    optionRadioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: PURPLE,
    },
    optionText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 19 },
    optionTextSelected: { color: PURPLE, fontWeight: '600' },

    // ── Submit Button ──
    submitBtn: {
        backgroundColor: PURPLE,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        elevation: 4,
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        marginTop: 6,
    },
    submitBtnDisabled: { opacity: 0.55 },
    submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
    submitBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 3 },

    // ── Result Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        alignItems: 'center',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    riskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 2,
        borderRadius: 30,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginBottom: 20,
    },
    riskEmoji: { fontSize: 20 },
    riskLabel: { fontSize: 16, fontWeight: '800' },
    scoreRing: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 6,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    scoreNumber: { fontSize: 38, fontWeight: '900' },
    scoreMax: { fontSize: 16, color: '#9CA3AF', marginTop: 14 },
    scoreCaption: { fontSize: 12, color: '#6B7280', marginTop: 8, marginBottom: 16 },
    resultMessage: {
        fontSize: 13,
        color: '#374151',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    crisisBox: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        marginBottom: 16,
    },
    crisisText: { fontSize: 13, color: '#EF4444', fontWeight: '700', textAlign: 'center' },
    resultActions: { flexDirection: 'row', gap: 10, width: '100%' },
    resultBtn: {
        flex: 1,
        borderRadius: 12,
        padding: 13,
        alignItems: 'center',
    },
    resultBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    resultBtnOutline: {
        flex: 1,
        borderRadius: 12,
        padding: 13,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    resultBtnOutlineText: { fontWeight: '700', fontSize: 14 },

    // ── History Modal ──
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        width: '100%',
        maxHeight: '75%',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    historyTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
    historyClose: { fontSize: 18, color: '#374151', padding: 4 },
    historyEmpty: { color: '#9CA3AF', textAlign: 'center', marginTop: 20, fontSize: 14 },
    historyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        paddingLeft: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 8,
    },
    historyMonth: { fontSize: 14, fontWeight: '600', color: '#111827' },
    historyRisk: { fontSize: 12, marginTop: 2, fontWeight: '600' },
    historyScoreBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyScore: { fontSize: 18, fontWeight: '900' },
});
