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
    Image,
    Platform,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ─── Hero Carousel Images ─────────────────────────────────────────────────────
const HERO_IMAGES = [
    {
        id: '1',
        source: require('../assets/screening_system/image 9.jpg'),
        title: 'Maternal Wellness Check',
        subtitle: 'Your mental health matters during this special journey',
    },
    {
        id: '2',
        source: require('../assets/screening_system/image 4.jpg'),
        title: 'Bonding with Your Baby',
        subtitle: 'Nurturing the beautiful connection between mother and child',
    },
    {
        id: '3',
        source: require('../assets/screening_system/image 10.jpg'),
        title: 'You Are Not Alone',
        subtitle: 'Support is available every step of the way',
    },
];

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

// ─── Hero Carousel Component ──────────────────────────────────────────────────
function HeroCarousel() {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    const autoScrollTimer = useRef(null);

    // Auto-scroll logic
    useEffect(() => {
        if (isAutoScrolling) {
            autoScrollTimer.current = setInterval(() => {
                const nextIndex = (activeIndex + 1) % HERO_IMAGES.length;
                flatListRef.current?.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });
                setActiveIndex(nextIndex);
            }, 4000);
        }
        return () => {
            if (autoScrollTimer.current) {
                clearInterval(autoScrollTimer.current);
            }
        };
    }, [activeIndex, isAutoScrolling]);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    const renderItem = ({ item }) => (
        <View style={styles.heroSlide}>
            <Image
                source={item.source}
                style={styles.heroImage}
                resizeMode="cover"
            />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>{t('Official Screening Tool')}</Text>
                </View>
                <Text style={styles.heroTitle}>{t(item.title)}</Text>
                <Text style={styles.heroSub}>{t(item.subtitle)}</Text>
            </View>
        </View>
    );

    const renderDots = () => (
        <View style={styles.dotsContainer}>
            {HERO_IMAGES.map((_, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.dot,
                        index === activeIndex && styles.activeDot,
                    ]}
                    onPress={() => {
                        flatListRef.current?.scrollToIndex({
                            index,
                            animated: true,
                        });
                        setActiveIndex(index);
                        // Reset auto-scroll timer
                        if (autoScrollTimer.current) {
                            clearInterval(autoScrollTimer.current);
                            autoScrollTimer.current = setInterval(() => {
                                const nextIndex = (index + 1) % HERO_IMAGES.length;
                                flatListRef.current?.scrollToIndex({
                                    index: nextIndex,
                                    animated: true,
                                });
                                setActiveIndex(nextIndex);
                            }, 4000);
                        }
                    }}
                />
            ))}
        </View>
    );

    return (
        <View style={styles.carouselContainer}>
            <FlatList
                ref={flatListRef}
                data={HERO_IMAGES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                keyExtractor={(item) => item.id}
                onTouchStart={() => setIsAutoScrolling(false)}
                onTouchEnd={() => setIsAutoScrolling(true)}
            />
            {renderDots()}
        </View>
    );
}

// ─── Answers Breakdown Component ──────────────────────────────────────────────
function AnswersBreakdown({ answers, questions, t }) {
    if (!answers || !Array.isArray(answers) || answers.length === 0) return null;

    return (
        <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>📝 {t('Question Answers Breakdown')}</Text>
            {questions.map((q, idx) => {
                const score = answers[idx];
                const selectedOpt = q.options.find((opt) => opt.score === score);
                return (
                    <View key={q.id} style={styles.breakdownItem}>
                        <View style={styles.breakdownItemHeader}>
                            <Text style={styles.breakdownNum}>Q{idx + 1}.</Text>
                            <Text style={styles.breakdownText}>{q.text}</Text>
                        </View>
                        <View style={styles.breakdownAnswerRow}>
                            <Text style={styles.breakdownAnswerLabel}>
                                {selectedOpt ? selectedOpt.label : t('Not answered')}
                            </Text>
                            <View style={styles.breakdownScoreBadge}>
                                <Text style={styles.breakdownScoreText}>+{score ?? 0}</Text>
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
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
                    <View style={[styles.riskBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                        <Text style={styles.riskEmoji}>{cfg.emoji}</Text>
                        <Text style={[styles.riskLabel, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>

                    <View style={[styles.scoreRing, { borderColor: cfg.color }]}>
                        <Text style={[styles.scoreNumber, { color: cfg.color }]}>{score}</Text>
                        <Text style={styles.scoreMax}>/30</Text>
                    </View>
                    <Text style={styles.scoreCaption}>{t('Your EPDS Score')}</Text>

                    <Text style={styles.resultMessage}>{cfg.message}</Text>

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
function HistoryModal({ visible, history, questions, onClose }) {
    const { t } = useTranslation();
    const riskConfig = getRiskConfig(t);
    const [expandedIdx, setExpandedIdx] = useState(null);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>{t('📅 Screening History')}</Text>
                        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                            <Text style={styles.historyClose}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {history.length === 0 && (
                            <Text style={styles.historyEmpty}>{t('No past screenings yet.')}</Text>
                        )}
                        {history.map((item, i) => {
                            const cfg = riskConfig[item.riskLevel] || riskConfig.low;
                            const monthParts = item.month ? item.month.split(' ') : [];
                            const translatedMonth = monthParts.length > 1 ? `${t(monthParts[0])} ${monthParts[1]}` : t(item.month || 'Past Screening');
                            const isExpanded = expandedIdx === i;

                            return (
                                <View key={i} style={[styles.historyRowCard, { borderLeftColor: cfg.color }]}>
                                    <TouchableOpacity
                                        style={styles.historyRowHeader}
                                        onPress={() => setExpandedIdx(isExpanded ? null : i)}
                                        activeOpacity={0.7}
                                    >
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
                                        <Text style={{ fontSize: 16, color: '#9CA3AF', marginLeft: 8 }}>
                                            {isExpanded ? '▲' : '▼'}
                                        </Text>
                                    </TouchableOpacity>

                                    {isExpanded && item.answers && (
                                        <AnswersBreakdown answers={item.answers} questions={questions} t={t} />
                                    )}
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

    const [viewMode, setViewMode] = useState('intro');
    const [currentQIndex, setCurrentQIndex] = useState(0);

    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [alreadyDone, setAlreadyDone] = useState(null);
    const [showAnswersInIntro, setShowAnswersInIntro] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    const [hasDoneCurrentCycle, setHasDoneCurrentCycle] = useState(false);
    const [nextAvailableDate, setNextAvailableDate] = useState(null);

    // Personal Details
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [district, setDistrict] = useState('');
    const [village, setVillage] = useState('');

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const answeredCount = Object.keys(answers).length;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: (currentQIndex + 1) / questions.length,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [currentQIndex]);

    // ─── Fetch initial data ──────────────────────────────────────────────────
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                const profileRes = await api.get('/user/me').catch(() => null);
                if (profileRes?.data) {
                    if (profileRes.data.fullName) setFullName(profileRes.data.fullName);
                    if (profileRes.data.age) setAge(String(profileRes.data.age));
                    if (profileRes.data.district) setDistrict(profileRes.data.district);
                    if (profileRes.data.village) setVillage(profileRes.data.village);
                }

                const statusRes = await api.get('/epds/my-status').catch(() => null);
                if (statusRes?.data) {
                    setHasDoneCurrentCycle(statusRes.data.hasDoneCurrentCycle);
                    setNextAvailableDate(statusRes.data.nextAvailableDate);
                    if (statusRes.data.currentScreening) {
                        setAlreadyDone(statusRes.data.currentScreening);
                    }
                }

                const histRes = await api.get('/epds/history').catch(() => null);
                if (histRes?.data) {
                    setHistory(histRes.data);
                }
            } catch (_) {
                /* non-critical */
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/epds/history');
            setHistory(res.data || []);
        } catch (_) {
            setHistory([]);
        }
    };

    const handleSelectOption = (questionId, score) => {
        setAnswers((prev) => ({ ...prev, [questionId]: score }));
        if (currentQIndex < questions.length - 1) {
            setTimeout(() => {
                goToQuestion(currentQIndex + 1);
            }, 220);
        }
    };

    const goToQuestion = (nextIndex) => {
        if (nextIndex < 0 || nextIndex >= questions.length) return;
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.3, duration: 100, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        setCurrentQIndex(nextIndex);
    };

    const startScreening = () => {
        if (hasDoneCurrentCycle) {
            Toast.show({
                type: 'info',
                text1: t('⏳ Already Completed'),
                text2: nextAvailableDate
                    ? t(`You can take the screening again on ${nextAvailableDate}`)
                    : t('You can take the screening again in the next 2-week cycle.'),
                position: 'top',
                visibilityTime: 4000,
            });
            return;
        }

        if (!fullName.trim() || !age.trim() || !district.trim() || !village.trim()) {
            Toast.show({
                type: 'error',
                text1: t('⚠️ Incomplete Profile'),
                text2: t('Please fill in your personal details before starting.'),
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        if (alreadyDone?.answers && Object.keys(answers).length === 0) {
            const initialMap = {};
            alreadyDone.answers.forEach((score, idx) => {
                initialMap[questions[idx].id] = score;
            });
            setAnswers(initialMap);
        }
        setCurrentQIndex(0);
        setViewMode('questions');
    };

    const handleSubmit = async () => {
        if (!fullName.trim() || !age.trim() || !district.trim() || !village.trim()) {
            Toast.show({
                type: 'error',
                text1: t('⚠️ Incomplete'),
                text2: t('Please fill in your personal details on the intro screen first.'),
                position: 'top',
            });
            return;
        }

        if (answeredCount < questions.length) {
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
            const answerArray = questions.map((q) => answers[q.id]);
            const res = await api.post('/epds/submit', {
                answers: answerArray,
                fullName: fullName.trim(),
                age: Number(age),
                district: district.trim(),
                village: village.trim(),
            });

            setResult(res.data.screening);
            setAlreadyDone(res.data.screening);
            setHasDoneCurrentCycle(true);
            setNextAvailableDate(getNextCycleDate());
            await fetchHistory();
            setShowResult(true);
        } catch (err) {
            const msg = err.response?.data?.message || t('Submission failed. Please try again.');
            Toast.show({
                type: 'error',
                text1: t('❌ Error'),
                text2: msg,
                position: 'top',
                visibilityTime: 4000,
            });
            if (err.response?.data?.alreadySubmitted) {
                setHasDoneCurrentCycle(true);
                if (err.response?.data?.nextAvailableDate) {
                    setNextAvailableDate(err.response.data.nextAvailableDate);
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getNextCycleDate = () => {
        const d = new Date();
        let nextDate;
        if (d.getDate() <= 15) {
            nextDate = new Date(d.getFullYear(), d.getMonth(), 16);
        } else {
            nextDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        }
        return nextDate.toISOString().split('T')[0];
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

    const currentQuestion = questions[currentQIndex];
    const currentSelectedScore = answers[currentQuestion?.id];

    return (
        <SafeAreaView style={styles.safe}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (viewMode === 'questions') {
                            setViewMode('intro');
                        } else {
                            navigation.goBack();
                        }
                    }}
                    style={styles.backBtn}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>🌸 {t('Maternal Wellness Check')}</Text>
                    <Text style={styles.headerSub}>{t('Edinburgh Postnatal Depression Scale')}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TouchableOpacity
                        onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')}
                    >
                        <Text style={styles.langBtn}>
                            {i18n.language === 'en' ? 'සිං' : 'EN'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={async () => {
                            await fetchHistory();
                            setShowHistory(true);
                        }}
                        style={styles.historyBtn}
                    >
                        <Text style={styles.historyBtnText}>📊</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ════════════════════ VIEW MODE: INTRO ════════════════════ */}
            {viewMode === 'intro' && (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    style={styles.scrollView}
                >
                    {/* ─── Hero Carousel ─── */}
                    <HeroCarousel />

                    {/* ─── 2-Week Cycle Status ─────────────────────────────────── */}
                    {hasDoneCurrentCycle && (
                        <View style={[styles.introCard, { borderColor: '#db56b8ff', borderWidth: 2, backgroundColor: '#ffebf8ff' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Text style={{ fontSize: 28 }}>⏳</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.introTitle, { color: '#b15085ff' }]}>
                                        {t('Screening Already Completed')}
                                    </Text>
                                    <Text style={[styles.introSub, { color: '#92400E' }]}>
                                        {nextAvailableDate
                                            ? t(`📅 Next available on: ${nextAvailableDate}`)
                                            : t('Please wait for the next 2-week cycle.')}
                                    </Text>
                                    <Text style={[styles.introSub, { color: '#92400E', marginTop: 4 }]}>
                                        {t('You can take the screening once every 2 weeks.')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* ─── Previous Completed Risk Card ────────────────────────── */}
                    {alreadyDone && !hasDoneCurrentCycle && (
                        <View
                            style={[
                                styles.previousRiskCard,
                                {
                                    backgroundColor: riskConfig[alreadyDone.riskLevel]?.bg || '#ECFDF5',
                                    borderColor: riskConfig[alreadyDone.riskLevel]?.border || '#6EE7B7',
                                },
                            ]}
                        >
                            <View style={styles.prevRiskHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.prevRiskTag}>{t('Previous Completed Screening')}</Text>
                                    <Text style={[styles.prevRiskLabel, { color: riskConfig[alreadyDone.riskLevel]?.color }]}>
                                        {riskConfig[alreadyDone.riskLevel]?.emoji} {riskConfig[alreadyDone.riskLevel]?.label}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.prevScoreCircle,
                                        { borderColor: riskConfig[alreadyDone.riskLevel]?.color },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.prevScoreNum,
                                            { color: riskConfig[alreadyDone.riskLevel]?.color },
                                        ]}
                                    >
                                        {alreadyDone.totalScore}
                                    </Text>
                                    <Text style={styles.prevScoreMax}>/30</Text>
                                </View>
                            </View>

                            <Text style={styles.prevRiskMsg}>
                                {riskConfig[alreadyDone.riskLevel]?.message}
                            </Text>

                            {alreadyDone.answers && (
                                <TouchableOpacity
                                    style={styles.toggleAnswersBtn}
                                    onPress={() => setShowAnswersInIntro(!showAnswersInIntro)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.toggleAnswersText}>
                                        {showAnswersInIntro
                                            ? t('🔼 Hide Previous Question Answers')
                                            : t('👁️ View Previous Question Answers')}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {showAnswersInIntro && alreadyDone.answers && (
                                <AnswersBreakdown answers={alreadyDone.answers} questions={questions} t={t} />
                            )}
                        </View>
                    )}

                    {/* ─── Personal Details Form ───────────────────────────────── */}
                    <View style={styles.introCard}>
                        <Text style={styles.introTitle}>📋 {t('Personal Details')}</Text>
                        <Text style={styles.introSub}>{t('Please fill in your information before starting')}</Text>

                        <TextInput
                            style={[styles.inputField, !fullName.trim() && styles.inputFieldRequired]}
                            placeholder={t('Full Name *')}
                            placeholderTextColor={!fullName.trim() ? '#EF4444' : '#9CA3AF'}
                            value={fullName}
                            onChangeText={setFullName}
                        />
                        <TextInput
                            style={[styles.inputField, !age.trim() && styles.inputFieldRequired]}
                            placeholder={t('Age *')}
                            placeholderTextColor={!age.trim() ? '#EF4444' : '#9CA3AF'}
                            value={age}
                            onChangeText={setAge}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={[styles.inputField, !district.trim() && styles.inputFieldRequired]}
                            placeholder={t('District (e.g., Colombo) *')}
                            placeholderTextColor={!district.trim() ? '#EF4444' : '#9CA3AF'}
                            value={district}
                            onChangeText={setDistrict}
                        />
                        <TextInput
                            style={[styles.inputField, !village.trim() && styles.inputFieldRequired]}
                            placeholder={t('Village (e.g., Battaramulla) *')}
                            placeholderTextColor={!village.trim() ? '#EF4444' : '#9CA3AF'}
                            value={village}
                            onChangeText={setVillage}
                        />
                        <Text style={styles.requiredHint}>* {t('Required fields')}</Text>
                    </View>

                    {/* ─── Screening Overview Guidelines ────────────────────────── */}
                    <View style={styles.introCard}>
                        <Text style={styles.introTitle}>ℹ️ {t('Screening Instructions')}</Text>
                        <Text style={styles.introText}>
                            • {t('Questions are answered one by one for maximum clarity and focus.')}{'\n'}
                            • {t('Choose the response that best describes how you felt over the past 7 days.')}{'\n'}
                            • {t('All answers remain confidential between you and your healthcare provider.')}{'\n'}
                            • {t('You can take this screening once every 2 weeks.')}
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

                    {/* ─── Action Button ────────────────────────────────────────── */}
                    <TouchableOpacity
                        style={[
                            styles.startBtn,
                            hasDoneCurrentCycle && styles.startBtnDisabled
                        ]}
                        onPress={startScreening}
                        activeOpacity={0.85}
                        disabled={hasDoneCurrentCycle}
                    >
                        <Text style={styles.startBtnText}>
                            {hasDoneCurrentCycle
                                ? `${t('Wait for Next Cycle')}`
                                : alreadyDone
                                    ? `${t('Retake EPDS Screening')}`
                                    : `${t('Start EPDS Screening')}`
                            }
                        </Text>
                        {!hasDoneCurrentCycle && (
                            <Text style={styles.startBtnSub}>
                                {t('10 Questions • One by One Flow')}
                            </Text>
                        )}
                        {hasDoneCurrentCycle && nextAvailableDate && (
                            <Text style={styles.startBtnSub}>
                                {t(`Available on: ${nextAvailableDate}`)}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 30 }} />
                </ScrollView>
            )}

            {/* ════════════════════ VIEW MODE: QUESTIONS ════════════════════ */}
            {viewMode === 'questions' && currentQuestion && (
                <View style={styles.questionFlowContainer}>
                    {/* Stepper Header & Progress */}
                    <View style={styles.stepperContainer}>
                        <View style={styles.stepperTop}>
                            <Text style={styles.stepperTitle}>
                                {t('Question')} <Text style={{ color: PURPLE, fontWeight: '800' }}>{currentQIndex + 1}</Text> / {questions.length}
                            </Text>
                            <Text style={styles.stepperSub}>
                                {answeredCount}/{questions.length} {t('answered')}
                            </Text>
                        </View>

                        <View style={styles.progressTrack}>
                            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                        </View>

                        {/* Pagination Dots */}
                        <View style={styles.dotsRow}>
                            {questions.map((q, idx) => {
                                const isCurrent = idx === currentQIndex;
                                const isAnswered = answers[q.id] !== undefined;
                                return (
                                    <TouchableOpacity
                                        key={q.id}
                                        onPress={() => goToQuestion(idx)}
                                        style={[
                                            styles.dotItem,
                                            isAnswered && styles.dotAnswered,
                                            isCurrent && styles.dotCurrent,
                                        ]}
                                    >
                                        <Text style={[styles.dotText, (isCurrent || isAnswered) && styles.dotTextActive]}>
                                            {idx + 1}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Single Question View */}
                    <Animated.View style={[styles.singleQuestionCard, { opacity: fadeAnim }]}>
                        <View style={styles.qCardHeader}>
                            <View style={styles.qBadge}>
                                <Text style={styles.qBadgeText}>{t('Question')} {currentQIndex + 1}</Text>
                            </View>
                            <Text style={styles.qEmoji}>{currentQuestion.emoji}</Text>
                            {currentQuestion.sensitive && (
                                <View style={styles.sensitiveBadge}>
                                    <Text style={styles.sensitiveText}>{t('Sensitive')}</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.qText}>{currentQuestion.text}</Text>

                        {/* Option buttons */}
                        <View style={styles.optionsList}>
                            {currentQuestion.options.map((opt, i) => {
                                const isSelected = currentSelectedScore === opt.score;
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                                        onPress={() => handleSelectOption(currentQuestion.id, opt.score)}
                                        activeOpacity={0.75}
                                    >
                                        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                                            {isSelected && <View style={styles.radioDot} />}
                                        </View>
                                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Animated.View>

                    {/* Bottom Navigation Bar */}
                    <View style={styles.bottomNav}>
                        <TouchableOpacity
                            style={[styles.navControlBtn, currentQIndex === 0 && styles.navControlDisabled]}
                            onPress={() => goToQuestion(currentQIndex - 1)}
                            disabled={currentQIndex === 0}
                        >
                            <Text style={styles.navControlText}>← {t('Previous')}</Text>
                        </TouchableOpacity>

                        {currentQIndex < questions.length - 1 ? (
                            <TouchableOpacity
                                style={[
                                    styles.navControlBtnPrimary,
                                    currentSelectedScore === undefined && styles.navControlDisabled,
                                ]}
                                onPress={() => goToQuestion(currentQIndex + 1)}
                            >
                                <Text style={styles.navControlTextPrimary}>{t('Next')} →</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.submitScreeningBtn,
                                    (submitting || answeredCount < questions.length) && styles.navControlDisabled,
                                ]}
                                onPress={handleSubmit}
                                disabled={submitting || answeredCount < questions.length}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitScreeningText}>✓ {t('Submit Screening')}</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* ── Modals ── */}
            {result && (
                <ResultModal
                    visible={showResult}
                    score={result.totalScore}
                    riskLevel={result.riskLevel}
                    onClose={() => {
                        setShowResult(false);
                        setViewMode('intro');
                    }}
                    onViewHistory={() => {
                        setShowResult(false);
                        setShowHistory(true);
                    }}
                />
            )}

            <HistoryModal
                visible={showHistory}
                history={history}
                questions={questions}
                onClose={() => setShowHistory(false)}
            />

            <Toast />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#EDE9FE';

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F3F4F6'
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 15
    },
    scrollView: {
        flex: 1,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: screenWidth > 768 ? 24 : 16,
        paddingVertical: screenWidth > 768 ? 16 : 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        gap: 12,
    },
    backBtn: {
        padding: 4
    },
    backIcon: {
        fontSize: screenWidth > 768 ? 26 : 22,
        color: PURPLE,
        fontWeight: '700'
    },
    headerTitle: {
        fontSize: screenWidth > 768 ? 20 : 16,
        fontWeight: '800',
        color: '#111827'
    },
    headerSub: {
        fontSize: screenWidth > 768 ? 13 : 11,
        color: '#6B7280',
        marginTop: 1
    },
    langBtn: {
        fontWeight: '700',
        fontSize: screenWidth > 768 ? 14 : 12,
        color: PURPLE,
        backgroundColor: PURPLE_LIGHT,
        paddingHorizontal: screenWidth > 768 ? 12 : 9,
        paddingVertical: screenWidth > 768 ? 8 : 5,
        borderRadius: 12,
    },
    historyBtn: {
        backgroundColor: PURPLE_LIGHT,
        borderRadius: 10,
        padding: screenWidth > 768 ? 10 : 6,
    },
    historyBtnText: {
        fontSize: screenWidth > 768 ? 22 : 18
    },

    // ── Scroll Content (Intro) ──
    scrollContent: {
        padding: screenWidth > 768 ? 24 : 16,
        gap: screenWidth > 768 ? 20 : 14,
        paddingBottom: 40,
    },

    // ── Carousel ──
    carouselContainer: {
        height: screenWidth > 768 ? 300 : 200,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 4,
    },
    heroSlide: {
        width: screenWidth - (screenWidth > 768 ? 48 : 32),
        height: screenWidth > 768 ? 300 : 200,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        position: 'absolute'
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(106, 106, 106, 0.65)',
    },
    heroContent: {
        flex: 1,
        padding: screenWidth > 768 ? 30 : 18,
        justifyContent: 'flex-end',
    },
    heroBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignSelf: 'flex-start',
        paddingHorizontal: screenWidth > 768 ? 14 : 10,
        paddingVertical: screenWidth > 768 ? 6 : 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    heroBadgeText: {
        color: '#fff',
        fontSize: screenWidth > 768 ? 13 : 11,
        fontWeight: '700'
    },
    heroTitle: {
        fontSize: screenWidth > 768 ? 26 : 19,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 6
    },
    heroSub: {
        fontSize: screenWidth > 768 ? 15 : 12,
        color: 'rgba(255, 255, 255, 0.95)',
        lineHeight: screenWidth > 768 ? 22 : 17
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 24,
        height: 8,
        borderRadius: 4,
    },

    // ── Previous Completed Risk Card ──
    previousRiskCard: {
        borderRadius: 18,
        borderWidth: 1.5,
        padding: screenWidth > 768 ? 20 : 16,
        gap: 10,
    },
    prevRiskHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    prevRiskTag: {
        fontSize: screenWidth > 768 ? 13 : 11,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase'
    },
    prevRiskLabel: {
        fontSize: screenWidth > 768 ? 20 : 17,
        fontWeight: '900',
        marginTop: 2
    },
    prevScoreCircle: {
        width: screenWidth > 768 ? 60 : 52,
        height: screenWidth > 768 ? 60 : 52,
        borderRadius: screenWidth > 768 ? 30 : 26,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    prevScoreNum: {
        fontSize: screenWidth > 768 ? 20 : 18,
        fontWeight: '900'
    },
    prevScoreMax: {
        fontSize: screenWidth > 768 ? 12 : 10,
        color: '#9CA3AF',
        marginTop: 4
    },
    prevRiskMsg: {
        fontSize: screenWidth > 768 ? 14 : 12,
        color: '#374151',
        lineHeight: screenWidth > 768 ? 22 : 18
    },
    toggleAnswersBtn: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 9,
        paddingHorizontal: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    toggleAnswersText: {
        color: PURPLE,
        fontWeight: '700',
        fontSize: screenWidth > 768 ? 14 : 12
    },

    // ── Answers Breakdown ──
    breakdownContainer: {
        marginTop: 10,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
        paddingTop: 10,
    },
    breakdownTitle: {
        fontSize: screenWidth > 768 ? 15 : 13,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4
    },
    breakdownItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    breakdownItemHeader: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 4
    },
    breakdownNum: {
        fontSize: screenWidth > 768 ? 14 : 12,
        fontWeight: '800',
        color: PURPLE
    },
    breakdownText: {
        fontSize: screenWidth > 768 ? 14 : 12,
        color: '#111827',
        flex: 1,
        fontWeight: '600'
    },
    breakdownAnswerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: PURPLE_LIGHT,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    breakdownAnswerLabel: {
        fontSize: screenWidth > 768 ? 13 : 11,
        color: PURPLE,
        fontWeight: '700',
        flex: 1
    },
    breakdownScoreBadge: {
        backgroundColor: PURPLE,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    breakdownScoreText: {
        fontSize: screenWidth > 768 ? 12 : 10,
        color: '#fff',
        fontWeight: '800'
    },

    // ── Intro Card ──
    introCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: screenWidth > 768 ? 20 : 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
    },
    introTitle: {
        fontSize: screenWidth > 768 ? 18 : 15,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 2
    },
    introSub: {
        fontSize: screenWidth > 768 ? 14 : 12,
        color: '#6B7280',
        marginBottom: 10
    },
    introText: {
        fontSize: screenWidth > 768 ? 14 : 12,
        color: '#374151',
        lineHeight: screenWidth > 768 ? 22 : 19
    },
    inputField: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: screenWidth > 768 ? 14 : 11,
        marginTop: 8,
        backgroundColor: '#F9FAFB',
        fontSize: screenWidth > 768 ? 15 : 13,
        color: '#111827',
    },
    inputFieldRequired: {
        borderColor: '#EF4444',
        borderWidth: 2,
    },
    requiredHint: {
        fontSize: screenWidth > 768 ? 13 : 11,
        color: '#EF4444',
        marginTop: 4,
        fontStyle: 'italic',
    },
    riskLegend: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 12,
        flexWrap: 'wrap'
    },
    legendChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: screenWidth > 768 ? 12 : 9,
        paddingVertical: screenWidth > 768 ? 5 : 3,
    },
    legendText: {
        fontSize: screenWidth > 768 ? 13 : 11,
        fontWeight: '700'
    },

    startBtn: {
        backgroundColor: PURPLE,
        borderRadius: 16,
        padding: screenWidth > 768 ? 20 : 16,
        alignItems: 'center',
        elevation: 4,
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    startBtnDisabled: {
        backgroundColor: '#9CA3AF',
        opacity: 0.7,
    },
    startBtnText: {
        color: '#fff',
        fontSize: screenWidth > 768 ? 20 : 16,
        fontWeight: '800'
    },
    startBtnSub: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: screenWidth > 768 ? 13 : 11,
        marginTop: 2
    },

    // ════════ QUESTION FLOW STYLES ════════
    questionFlowContainer: {
        flex: 1,
        padding: screenWidth > 768 ? 24 : 14,
        justifyContent: 'space-between',
    },
    stepperContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: screenWidth > 768 ? 20 : 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    stepperTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepperTitle: {
        fontSize: screenWidth > 768 ? 16 : 14,
        fontWeight: '600',
        color: '#374151'
    },
    stepperSub: {
        fontSize: screenWidth > 768 ? 13 : 11,
        color: '#6B7280'
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
        backgroundColor: PURPLE,
        borderRadius: 4
    },

    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dotItem: {
        width: screenWidth > 768 ? 28 : 24,
        height: screenWidth > 768 ? 28 : 24,
        borderRadius: screenWidth > 768 ? 14 : 12,
        backgroundColor: '#F3F4F6',
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotAnswered: {
        backgroundColor: PURPLE_LIGHT,
        borderColor: PURPLE
    },
    dotCurrent: {
        backgroundColor: PURPLE,
        borderColor: PURPLE,
        transform: [{ scale: 1.15 }]
    },
    dotText: {
        fontSize: screenWidth > 768 ? 12 : 10,
        fontWeight: '700',
        color: '#9CA3AF'
    },
    dotTextActive: {
        color: '#fff'
    },

    singleQuestionCard: {
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: screenWidth > 768 ? 28 : 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        marginVertical: 10,
    },
    qCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12
    },
    qBadge: {
        backgroundColor: PURPLE_LIGHT,
        borderRadius: 12,
        paddingHorizontal: screenWidth > 768 ? 14 : 10,
        paddingVertical: screenWidth > 768 ? 6 : 4,
    },
    qBadgeText: {
        fontSize: screenWidth > 768 ? 13 : 11,
        fontWeight: '800',
        color: PURPLE
    },
    qEmoji: {
        fontSize: screenWidth > 768 ? 28 : 24
    },
    sensitiveBadge: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        paddingHorizontal: screenWidth > 768 ? 10 : 8,
        paddingVertical: screenWidth > 768 ? 4 : 3,
        marginLeft: 'auto',
    },
    sensitiveText: {
        fontSize: screenWidth > 768 ? 12 : 10,
        color: '#EF4444',
        fontWeight: '700'
    },
    qText: {
        fontSize: screenWidth > 768 ? 18 : 15,
        fontWeight: '700',
        color: '#111827',
        lineHeight: screenWidth > 768 ? 26 : 22,
        marginBottom: 16,
    },

    optionsList: {
        gap: screenWidth > 768 ? 12 : 10
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        padding: screenWidth > 768 ? 16 : 13,
        backgroundColor: '#FAFAFA',
        gap: 12,
    },
    optionCardSelected: {
        borderColor: PURPLE,
        backgroundColor: PURPLE_LIGHT,
    },
    radioCircle: {
        width: screenWidth > 768 ? 24 : 22,
        height: screenWidth > 768 ? 24 : 22,
        borderRadius: screenWidth > 768 ? 12 : 11,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        borderColor: PURPLE
    },
    radioDot: {
        width: screenWidth > 768 ? 12 : 10,
        height: screenWidth > 768 ? 12 : 10,
        borderRadius: screenWidth > 768 ? 6 : 5,
        backgroundColor: PURPLE
    },
    optionLabel: {
        fontSize: screenWidth > 768 ? 15 : 13,
        color: '#374151',
        flex: 1,
        lineHeight: screenWidth > 768 ? 22 : 18,
        fontWeight: '500'
    },
    optionLabelSelected: {
        color: PURPLE,
        fontWeight: '700'
    },

    bottomNav: {
        flexDirection: 'row',
        gap: 12,
    },
    navControlBtn: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        paddingVertical: screenWidth > 768 ? 16 : 14,
        alignItems: 'center',
    },
    navControlDisabled: {
        opacity: 0.4
    },
    navControlText: {
        fontSize: screenWidth > 768 ? 16 : 14,
        fontWeight: '700',
        color: '#374151'
    },
    navControlBtnPrimary: {
        flex: 1,
        backgroundColor: PURPLE,
        borderRadius: 14,
        paddingVertical: screenWidth > 768 ? 16 : 14,
        alignItems: 'center',
    },
    navControlTextPrimary: {
        fontSize: screenWidth > 768 ? 16 : 14,
        fontWeight: '800',
        color: '#fff'
    },
    submitScreeningBtn: {
        flex: 1.2,
        backgroundColor: '#10B981',
        borderRadius: 14,
        paddingVertical: screenWidth > 768 ? 16 : 14,
        alignItems: 'center',
    },
    submitScreeningText: {
        fontSize: screenWidth > 768 ? 16 : 15,
        fontWeight: '900',
        color: '#fff'
    },

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
        padding: screenWidth > 768 ? 32 : 24,
        width: screenWidth > 768 ? '60%' : '100%',
        maxWidth: 500,
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
        marginBottom: 16,
    },
    riskEmoji: {
        fontSize: 20
    },
    riskLabel: {
        fontSize: 16,
        fontWeight: '800'
    },
    scoreRing: {
        width: screenWidth > 768 ? 120 : 100,
        height: screenWidth > 768 ? 120 : 100,
        borderRadius: screenWidth > 768 ? 60 : 50,
        borderWidth: 5,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    scoreNumber: {
        fontSize: screenWidth > 768 ? 42 : 36,
        fontWeight: '900'
    },
    scoreMax: {
        fontSize: screenWidth > 768 ? 18 : 15,
        color: '#9CA3AF',
        marginTop: 12
    },
    scoreCaption: {
        fontSize: screenWidth > 768 ? 14 : 12,
        color: '#6B7280',
        marginTop: 6,
        marginBottom: 12
    },
    resultMessage: {
        fontSize: screenWidth > 768 ? 15 : 13,
        color: '#374151',
        textAlign: 'center',
        lineHeight: screenWidth > 768 ? 22 : 19,
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
    crisisText: {
        fontSize: screenWidth > 768 ? 15 : 13,
        color: '#EF4444',
        fontWeight: '700',
        textAlign: 'center'
    },
    resultActions: {
        flexDirection: 'row',
        gap: 10,
        width: '100%'
    },
    resultBtn: {
        flex: 1,
        borderRadius: 12,
        padding: screenWidth > 768 ? 16 : 13,
        alignItems: 'center',
    },
    resultBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: screenWidth > 768 ? 16 : 14
    },
    resultBtnOutline: {
        flex: 1,
        borderRadius: 12,
        padding: screenWidth > 768 ? 16 : 13,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    resultBtnOutlineText: {
        fontWeight: '700',
        fontSize: screenWidth > 768 ? 16 : 14
    },

    // ── History Modal ──
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: screenWidth > 768 ? 24 : 20,
        width: screenWidth > 768 ? '70%' : '100%',
        maxWidth: 600,
        maxHeight: '80%',
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
    historyTitle: {
        fontSize: screenWidth > 768 ? 20 : 17,
        fontWeight: '800',
        color: '#111827'
    },
    historyClose: {
        fontSize: screenWidth > 768 ? 22 : 18,
        color: '#374151',
        padding: 4
    },
    historyEmpty: {
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 20,
        fontSize: screenWidth > 768 ? 16 : 14
    },
    historyRowCard: {
        borderLeftWidth: 4,
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: screenWidth > 768 ? 16 : 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    historyRowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyMonth: {
        fontSize: screenWidth > 768 ? 16 : 14,
        fontWeight: '700',
        color: '#111827'
    },
    historyRisk: {
        fontSize: screenWidth > 768 ? 14 : 12,
        marginTop: 2,
        fontWeight: '600'
    },
    historyScoreBadge: {
        width: screenWidth > 768 ? 44 : 40,
        height: screenWidth > 768 ? 44 : 40,
        borderRadius: screenWidth > 768 ? 22 : 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyScore: {
        fontSize: screenWidth > 768 ? 19 : 17,
        fontWeight: '900'
    },
});