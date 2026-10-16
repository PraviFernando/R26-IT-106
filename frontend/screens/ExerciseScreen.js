import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Modal, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContentWell } from '../components/ScreenContainer';
import Toast from 'react-native-toast-message';
import exerciseService from '../services/exerciseService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import styles from '../components/exercise/exerciseStyles';
import HealthDataForm from '../components/exercise/HealthDataForm';
import ExerciseCard from '../components/exercise/ExerciseCard';
import { C, T, Card, GradientCard, CircleButton, PrimaryButton, SecondaryButton, Notice, Icon } from '../components/exercise/ui';
import { videoFocusLabel } from '../utils/exerciseMessages';
import { todayStr, durationToMinutes, getYoutubeId, matchesExercise } from '../utils/exerciseUtils';
import {
    WATCH_COMPLETE_PERCENT, TODO_VISIBLE_COUNT, WATCH_SAVE_INTERVAL_MS, WATCH_NEW_SESSION_MS
} from '../utils/exerciseConfig';

let promptShownDate = null;

// Main Exercise Screen
export default function ExerciseScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const { width: windowWidth } = useWindowDimensions();
    const isWideScreen = windowWidth > 900;
    const isSinhala = i18n.language === 'si';
    const { user } = useAuth();
    const scrollViewRef = useRef(null);
    const [hasData, setHasData] = useState(false);
    const [initialHealthData, setInitialHealthData] = useState(null);
    const [showHealthPromptModal, setShowHealthPromptModal] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [safetyStatus, setSafetyStatus] = useState(null);
    const [safetyMessage, setSafetyMessage] = useState('');
    const [safetyMessageSi, setSafetyMessageSi] = useState('');
    const [detectedMood, setDetectedMood] = useState(null);
    // 'rule_fallback' when the ML service was unavailable and simple rules chose the exercise level
    const [predictionSource, setPredictionSource] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [showForm, setShowForm] = useState(true);
    const [activeTab, setActiveTab] = useState('todo');
    const [latestUser, setLatestUser] = useState(null);

    useEffect(() => {
        loadProgress();
        checkTodayData();
        fetchLatestUser();
    }, []);

    // Refresh when coming back from another screen (e.g. Movement Tracking saved a completed session)
    const hasFocusedRef = useRef(false);
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (!hasFocusedRef.current) {
                hasFocusedRef.current = true;
                return;
            }
            loadRecommendations();
            loadProgress();
        });
        return unsubscribe;
    }, [navigation]);

    // Latest recommendations for callbacks that may have been created in an earlier render
    const recommendationsRef = useRef(recommendations);
    recommendationsRef.current = recommendations;
    // Exercises already auto-completed in this session, so completion is saved only once
    const autoCompletedRef = useRef(new Set());

    const fetchLatestUser = async () => {
        try {
            const response = await api.get('/user/me');
            if (response.data) {
                setLatestUser(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch user me:', err);
        }
    };

    const loadProgress = async () => {
        try {
            const data = await exerciseService.getProgress(30);
            setProgress(data);
        } catch (err) {
            console.error('Failed to load progress:', err);
        }
    };

    const checkTodayData = async () => {
        try {
            const data = await exerciseService.getHealthData(todayStr());
            if (data.healthData) {
                setInitialHealthData(data.healthData);
            } else if (data.recommendedExercises) {
                setInitialHealthData(data);
            }

            const userId = user?.id || user?._id || user?.email || 'default';
            const storageKey = `exercise_prompt_shown_${userId}`;
            const lastShownDate = await AsyncStorage.getItem(storageKey);
            const isFirstTimeToday = lastShownDate !== todayStr();

            if (data.exists) {
                setHasData(true);
                await loadRecommendations();

                if (isFirstTimeToday) {
                    await AsyncStorage.setItem(storageKey, todayStr());
                    setShowHealthPromptModal(true);
                }
            } else {
                setHasData(false);
                if (isFirstTimeToday) {
                    await AsyncStorage.setItem(storageKey, todayStr());
                    setShowForm(false);
                    setShowHealthPromptModal(true);
                } else {
                    setShowForm(true);
                }
            }
        } catch (err) {
            console.error('Failed to check data:', err);
        }
    };

    const loadRecommendations = async () => {
        try {
            const data = await exerciseService.getRecommendations(todayStr());
            if (data.hasData) {
                setRecommendations(data.recommendations || []);
                setSafetyStatus(data.safetyStatus);
                setSafetyMessage(data.safetyMessage || '');
                setSafetyMessageSi(data.safetyMessageSi || '');
                setDetectedMood(data.detectedMood || null);
                setPredictionSource(data.predictionSource || null);
                setShowForm(false);
            }
        } catch (err) {
            console.error('Failed to load recommendations:', err);
        }
    };

    const handleSubmitHealthData = async (healthData) => {
        setLoading(true);
        try {
            const response = await exerciseService.submitHealthData(healthData);
            if (response.success) {
                setInitialHealthData(healthData);
                setSafetyStatus(response.safetyStatus);
                setSafetyMessage(response.safetyMessage);
                setSafetyMessageSi(response.safetyMessageSi);
                setDetectedMood(response.detectedMood || null);
                setPredictionSource(response.predictionSource || null);
                // Reset completed tab by forcing completed: false and watchPercentage: 0 for new session
                const resetRecs = (response.recommendedExercises || []).map(rec => ({
                    ...rec,
                    completed: false,
                    watchPercentage: 0
                }));
                setRecommendations(resetRecs);
                autoCompletedRef.current.clear();
                setActiveTab('todo');
                setHasData(true);
                setShowForm(false);

                // Scroll to top of the exercise page after submitting health form
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                }, 100);

                // Show safety status in a toast notification for 2 seconds
                Toast.show({
                    type: response.safetyStatus === 'blocked' ? 'error' : 'success',
                    text1: isSinhala
                        ? (response.safetyStatus === 'blocked' ? 'අවවාදයයි' : 'ආරක්ෂිතයි')
                        : (response.safetyStatus === 'blocked' ? 'Warning' : 'Safe'),
                    text2: isSinhala ? response.safetyMessageSi : response.safetyMessage,
                    position: 'top',
                    visibilityTime: 2000
                });
            }
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: `❌ ${t('Error')}`,
                text2: err.response?.data?.message || t('Failed to save data'),
                position: 'top'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteExercise = async (exercise, feedbackData = {}) => {
        try {
            await exerciseService.saveExerciseRecord({
                date: todayStr(),
                exerciseId: exercise.exerciseId || null,
                customActivityName: exercise.customName || exercise.name,
                status: 'completed',
                // Video durations can be "mm:ss"; convert to minutes so the backend can store a number
                durationCompleted: durationToMinutes(exercise.duration) || 15,
                liked: true,
                ...feedbackData
            });

            setRecommendations(prev =>
                prev.map(rec => {
                    return matchesExercise(rec, exercise) ? { ...rec, completed: true } : rec;
                })
            );

            Toast.show({
                type: 'success',
                text1: `🎉 ${t('Exercise Completed!')}`,
                position: 'top'
            });

            loadProgress();
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: t('Failed to save'),
                position: 'top'
            });
        }
    };

    // Watch history: remember when each video was last saved so we only hit the API every ~10s
    const watchHistoryRef = useRef({});

    const logWatchHistory = (exercise, percentage) => {
        const details = exercise.exerciseDetails || {};
        const videoUrl = exercise.videoUrl || details.videoUrl;
        if (!videoUrl) return;

        const videoId = getYoutubeId(videoUrl);
        const now = Date.now();
        const last = watchHistoryRef.current[videoUrl];
        const pct = Math.min(100, Math.round(percentage));

        const payload = {
            videoId,
            videoUrl,
            title: exercise.customName || exercise.name || details.name,
            thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null,
            channelTitle: exercise.channelTitle,
            category: exercise.category || details.category,
            // Minutes or "mm:ss" — the backend normalises it
            duration: exercise.duration || details.duration || undefined,
            watchPercentage: pct,
            newSession: false
        };

        // Save on first progress tick (new session), then every 10s, and always on finish
        const isNewSession = !last || now - last.time > WATCH_NEW_SESSION_MS;
        if (!isNewSession && now - last.time < WATCH_SAVE_INTERVAL_MS && !(pct >= 100 && last.pct < 100)) {
            // Throttled: keep the latest progress and save it when the 10s window ends
            last.pending = payload;
            if (!last.timer) {
                last.timer = setTimeout(() => flushWatchHistory(videoUrl), WATCH_SAVE_INTERVAL_MS - (now - last.time));
            }
            return;
        }
        if (last && last.timer) clearTimeout(last.timer);
        watchHistoryRef.current[videoUrl] = { time: now, pct };
        sendWatchHistory({ ...payload, newSession: isNewSession });
    };

    const sendWatchHistory = (payload) => {
        exerciseService.saveWatchHistory(payload)
            .catch(err => console.error('Failed to save watch history:', err.message));
    };

    const flushWatchHistory = (videoUrl) => {
        const entry = watchHistoryRef.current[videoUrl];
        if (!entry || !entry.pending) return;
        const payload = entry.pending;
        watchHistoryRef.current[videoUrl] = { time: Date.now(), pct: payload.watchPercentage };
        sendWatchHistory(payload);
    };

    // Save any throttled progress when leaving the screen
    useEffect(() => () => {
        Object.keys(watchHistoryRef.current).forEach(url => {
            const entry = watchHistoryRef.current[url];
            if (entry.timer) clearTimeout(entry.timer);
            flushWatchHistory(url);
        });
    }, []);

    const handleProgressUpdate = async (exercise, percentage) => {
        logWatchHistory(exercise, percentage);
        setRecommendations(prev =>
            prev.map(rec => {
                return matchesExercise(rec, exercise) ? { ...rec, watchPercentage: Math.round(percentage) } : rec;
            })
        );

        // If user watched more than 80% of the video, automatically mark it as completed!
        // Read the latest list through a ref (this callback can be from an older render) and
        // remember auto-completions so the save and toast happen only once per exercise.
        const completionKey = exercise.exerciseId || exercise.videoUrl || exercise.customName;
        const isAlreadyCompleted = autoCompletedRef.current.has(completionKey) ||
            recommendationsRef.current.some(rec => matchesExercise(rec, exercise) && rec.completed);

        if (percentage >= WATCH_COMPLETE_PERCENT && !isAlreadyCompleted) {
            autoCompletedRef.current.add(completionKey);
            console.log(`[Progress Track] Auto-completing exercise: ${exercise.customName || exercise.name} at ${percentage.toFixed(1)}%`);

            // Instantly update local state so the card moves to the Completed tab in the exact same millisecond
            setRecommendations(prev =>
                prev.map(rec => {
                    return matchesExercise(rec, exercise) ? { ...rec, completed: true, watchPercentage: 100 } : rec;
                })
            );

            // Execute backend saves in the background
            exerciseService.updateRecommendationProgress({
                date: todayStr(),
                videoUrl: exercise.videoUrl,
                customName: exercise.customName || exercise.name,
                watchPercentage: 100
            }).catch(err => console.error('Failed to save completion progress:', err.message));

            handleCompleteExercise(exercise).catch(err => console.error('Failed to complete exercise:', err.message));
        }
    };

    const tr = (en, si) => (isSinhala ? si : en);
    const CATEGORY_NAMES = {
        1: tr('Rest & Breathing', 'විවේකය සහ ශ්වසනය'),
        2: tr('Gentle Mobility', 'මෘදු චලනය'),
        3: tr('Strength & Core', 'ශක්තිය සහ උදර මාංශ'),
        4: tr('Full Functional', 'පූර්ණ ව්‍යායාම'),
    };
    const todoRecs = recommendations.filter(rec => !rec.completed);
    const doneRecs = recommendations.filter(rec => rec.completed);
    const visibleRecs = activeTab === 'todo' ? todoRecs.slice(0, TODO_VISIBLE_COUNT) : doneRecs;
    const levelCategory = recommendations[0]?.category;
    const focusLabels = [...new Set(recommendations.map(r => r.focus).filter(Boolean))].map(f => videoFocusLabel(f, isSinhala));
    const levelReason = (isSinhala ? safetyMessageSi : safetyMessage) ||
        (focusLabels.length
            ? tr(`Chosen for you: ${focusLabels.join(', ').toLowerCase()}.`, `ඔබ සඳහා තෝරා ඇත: ${focusLabels.join(', ')}.`)
            : tr('Chosen from today\'s health form. Short and safe.', 'අද සෞඛ්‍ය පෝරමය අනුව තෝරා ඇත. කෙටි සහ ආරක්ෂිතයි.'));
    const todayLabel = new Date().toLocaleDateString(isSinhala ? 'si-LK' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const cardWidthStyle = { width: isWideScreen ? '31.5%' : '100%', minWidth: isWideScreen ? 260 : undefined };

    const renderCard = (rec, idx) => (
        <View key={rec.exerciseId || rec.videoUrl || rec.customName || idx} style={cardWidthStyle}>
            <ExerciseCard
                exercise={rec}
                onComplete={handleCompleteExercise}
                isCompleted={rec.completed}
                onProgressUpdate={handleProgressUpdate}
                navigation={navigation}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
            <View style={ui.header}>
                <CircleButton icon="back" onPress={() => navigation.goBack()} label={tr('Back', 'ආපසු')} />
                <View style={{ flex: 1 }}>
                    <Text style={ui.headerTitle} numberOfLines={1}>{tr('Postpartum exercise', 'ප්‍රසූතියෙන් පසු ව්‍යායාම')}</Text>
                    <Text style={ui.headerSub} numberOfLines={1}>{todayLabel}</Text>
                </View>
                <Pressable
                    onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')}
                    accessibilityRole="button"
                    accessibilityLabel={tr('Switch language', 'භාෂාව මාරු කරන්න')}
                    style={({ hovered }) => [ui.langPill, hovered && { backgroundColor: C.soft }]}
                >
                    <Text style={ui.langText}>{i18n.language === 'en' ? 'සිංහල' : 'English'}</Text>
                </Pressable>
            </View>

            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <ContentWell maxWidth="wide">
                <View style={ui.page}>
                    {(showForm || !hasData) && (
                        <>
                            <HealthDataForm
                                onSubmit={handleSubmitHealthData}
                                loading={loading}
                                user={latestUser || user}
                                initialData={initialHealthData}
                            />
                            {hasData && (
                                <SecondaryButton title={tr('Back to my exercises', 'මගේ ව්‍යායාම වෙත ආපසු')} onPress={() => setShowForm(false)} />
                            )}
                        </>
                    )}

                    {!showForm && hasData && safetyStatus !== 'blocked' && (
                        <>
                            <GradientCard style={ui.banner}>
                                <View style={ui.bannerText}>
                                    <Text style={ui.bannerKicker}>{tr('Your level today', 'අද ඔබේ මට්ටම')}</Text>
                                    <Text style={ui.bannerTitle}>{CATEGORY_NAMES[levelCategory] || tr('Your exercises', 'ඔබේ ව්‍යායාම')}</Text>
                                    <Text style={ui.bannerBody}>{levelReason}</Text>
                                </View>
                                <View style={ui.bannerStats}>
                                    <View style={ui.bannerStat}>
                                        <Text style={ui.bannerStatValue}>{progress?.currentStreak ?? 0} {tr('days', 'දින')}</Text>
                                        <Text style={ui.bannerStatLabel}>{tr('Streak', 'අඛණ්ඩව')}</Text>
                                    </View>
                                    <View style={ui.bannerStat}>
                                        <Text style={ui.bannerStatValue}>{doneRecs.length}</Text>
                                        <Text style={ui.bannerStatLabel}>{tr('Done today', 'අද අවසන්')}</Text>
                                    </View>
                                </View>
                            </GradientCard>

                            {predictionSource === 'rule_fallback' && (
                                <Notice
                                    tone="warn"
                                    text={tr('The AI recommendation service is unavailable right now, so these exercises were chosen using basic safety rules.',
                                        'AI නිර්දේශ සේවාව දැනට ලබාගත නොහැක. මූලික ආරක්ෂිත නීති මත පදනම්ව ව්‍යායාම තෝරා ඇත.')}
                                />
                            )}

                            {recommendations.length > 0 ? (
                                <>
                                    <View style={ui.tabs} accessibilityRole="tablist">
                                        {[
                                            { key: 'todo', label: `${tr('To do', 'කිරීමට ඇති')} (${Math.min(TODO_VISIBLE_COUNT, todoRecs.length)})` },
                                            { key: 'completed', label: `${tr('Completed', 'අවසන් කළ')} (${doneRecs.length})` },
                                        ].map(tab => (
                                            <Pressable
                                                key={tab.key}
                                                accessibilityRole="tab"
                                                accessibilityState={{ selected: activeTab === tab.key }}
                                                onPress={() => setActiveTab(tab.key)}
                                                style={[ui.tab, activeTab === tab.key && ui.tabOn]}
                                            >
                                                <Text style={[ui.tabText, activeTab === tab.key && ui.tabTextOn]}>{tab.label}</Text>
                                            </Pressable>
                                        ))}
                                    </View>

                                    {visibleRecs.length > 0 ? (
                                        <View style={ui.grid}>{visibleRecs.map(renderCard)}</View>
                                    ) : (
                                        <Card style={ui.empty}>
                                            <Text style={ui.emptyTitle}>
                                                {activeTab === 'todo' ? tr('All done for today', 'අද සඳහා සියල්ල අවසන්') : tr('Nothing completed yet', 'තවම කිසිවක් අවසන් කර නැත')}
                                            </Text>
                                            <Text style={ui.emptyText}>
                                                {activeTab === 'todo'
                                                    ? tr('You have completed all exercise recommendations for today. Lovely work.', 'අද සඳහා සියලු ව්‍යායාම ඔබ අවසන් කළා. ඉතා හොඳයි.')
                                                    : tr('Start a video from the To do tab to see it here.', 'මෙහි දැකීමට "කිරීමට ඇති" ටැබයෙන් වීඩියෝවක් අරඹන්න.')}
                                            </Text>
                                        </Card>
                                    )}
                                </>
                            ) : (
                                <Card style={ui.empty}>
                                    <Text style={ui.emptyTitle}>{tr('A rest day', 'විවේක දිනයක්')}</Text>
                                    <Text style={ui.emptyText}>{tr('Based on your current condition, no exercise is recommended today. Rest and hydration are important.', 'ඔබේ වත්මන් තත්ත්වය අනුව අද ව්‍යායාම නිර්දේශ නොකෙරේ. විවේකය සහ ජලය පානය වැදගත්ය.')}</Text>
                                </Card>
                            )}
                        </>
                    )}

                    {!showForm && safetyStatus === 'blocked' && (
                        <View style={ui.blocked}>
                            <Icon name="info" size={26} color={C.danger} />
                            <View style={{ flex: 1, gap: 4 }}>
                                <Text style={ui.blockedTitle}>{tr('Medical advice needed', 'වෛද්‍ය උපදෙස් අවශ්‍යයි')}</Text>
                                <Text style={ui.blockedText}>{(isSinhala ? safetyMessageSi : safetyMessage) || tr('Please consult your doctor before starting any exercise.', 'ව්‍යායාම ආරම්භ කිරීමට පෙර ඔබේ වෛද්‍යවරයා හමුවන්න.')}</Text>
                            </View>
                        </View>
                    )}

                    {!showForm && hasData && (
                        <View style={ui.links}>
                            <SecondaryButton style={ui.linkBtn} icon="form" title={tr('Update health form', 'සෞඛ්‍ය පෝරමය යාවත්කාලීන කරන්න')} onPress={() => setShowForm(true)} />
                            <SecondaryButton style={ui.linkBtn} icon="chart" title={tr('My progress', 'මගේ ප්‍රගතිය')} onPress={() => navigation.navigate('ExerciseProgress')} />
                            <SecondaryButton style={ui.linkBtn} icon="clock" title={tr('Watch history', 'නැරඹූ ඉතිහාසය')} onPress={() => navigation.navigate('ExerciseProgress', { tab: 'history' })} />
                        </View>
                    )}

                    {!showForm && hasData && safetyStatus !== 'blocked' && (
                        <Notice tone="warn" text={tr('Stop if anything hurts, you feel dizzy, or bleeding increases. Always follow your doctor\'s or midwife\'s advice.', 'වේදනාවක්, කරකැවිල්ලක් හෝ ලේ ගැලීම වැඩි වුවහොත් නවතින්න. සැමවිටම ඔබේ වෛද්‍යවරයාගේ හෝ වින්නඹු මාතාවගේ උපදෙස් අනුගමනය කරන්න.')} />
                    )}
                </View>
                <View style={{ height: 40 }} />
              </ContentWell>
            </ScrollView>

            {/* Health Condition Change Prompt Modal */}
            <Modal visible={showHealthPromptModal} transparent animationType="fade" onRequestClose={() => setShowHealthPromptModal(false)}>
                <View style={ui.overlay}>
                    <View style={ui.dialog}>
                        <View style={ui.dialogIcon}><Icon name="form" size={28} color={C.primaryDark} /></View>
                        <Text style={ui.dialogTitle}>{tr('Any change in how you feel?', 'ඔබේ සෞඛ්‍ය තත්ත්වයේ වෙනසක් තිබේද?')}</Text>
                        <Text style={ui.dialogText}>
                            {tr('Update today\'s health form so we can choose safe exercises for you.', 'ඔබට ආරක්ෂිත ව්‍යායාම තෝරා ගැනීමට අද සෞඛ්‍ය පෝරමය යාවත්කාලීන කරන්න.')}
                        </Text>
                        <PrimaryButton
                            style={{ alignSelf: 'stretch' }}
                            title={tr('Yes, update the form', 'ඔව්, පෝරමය යාවත්කාලීන කරන්න')}
                            onPress={() => {
                                setShowForm(true);
                                setShowHealthPromptModal(false);
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                                }, 100);
                            }}
                        />
                        <SecondaryButton
                            style={{ alignSelf: 'stretch' }}
                            title={tr('No change, show exercises', 'වෙනසක් නැත, ව්‍යායාම පෙන්වන්න')}
                            onPress={async () => {
                                setShowHealthPromptModal(false);
                                if (!hasData) {
                                    const hData = initialHealthData || {};
                                    const payload = {
                                        date: todayStr(),
                                        weeksAfterDelivery: hData.weeksAfterDelivery !== undefined ? parseInt(hData.weeksAfterDelivery) : 0,
                                        deliveryType: hData.deliveryType || 'normal',
                                        pelvicPain: hData.pelvicPain || false,
                                        backPain: hData.backPain || false,
                                        abdominalPain: hData.abdominalPain || false,
                                        bleedingComplications: hData.bleedingComplications || false,
                                        doctorRestrictions: hData.doctorRestrictions || false,
                                        fatigueLevel: hData.fatigueLevel || 'low',
                                        mobilityLevel: hData.mobilityLevel || 'normal',
                                        muscleWeakness: hData.muscleWeakness || false,
                                        willingnessToExercise: hData.willingnessToExercise || 'medium'
                                    };
                                    await handleSubmitHealthData(payload);
                                } else {
                                    setShowForm(false);
                                    setTimeout(() => {
                                        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                                    }, 100);
                                }
                            }}
                        />
                    </View>
                </View>
            </Modal>
            <Toast />
        </SafeAreaView>
    );
}

// Layout styles for the redesigned Today screen (PeriCare exercise mockups)
const ui = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: C.bg },
    headerTitle: { ...T.heading, fontSize: 20, color: C.text },
    headerSub: { ...T.medium, fontSize: 13, color: C.textSub },
    langPill: { minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1.5, borderColor: C.control, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    langText: { ...T.bold, fontSize: 13, color: C.primaryDark },
    page: { gap: 16, paddingTop: 4 },
    banner: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' },
    bannerText: { flexGrow: 1, flexShrink: 1, flexBasis: 260, gap: 6 },
    bannerKicker: { ...T.bold, fontSize: 12, color: C.tint, textTransform: 'uppercase', letterSpacing: 0.8 },
    bannerTitle: { ...T.heading, fontSize: 24, color: '#FFFFFF' },
    bannerBody: { ...T.medium, fontSize: 14, lineHeight: 20, color: '#FFFFFF' },
    bannerStats: { flexDirection: 'row', gap: 10 },
    bannerStat: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 16, minWidth: 104 },
    bannerStatValue: { ...T.heading, fontSize: 20, color: '#FFFFFF' },
    bannerStatLabel: { ...T.semi, fontSize: 12, color: C.tint },
    tabs: { flexDirection: 'row', gap: 8 },
    tab: { minHeight: 44, paddingHorizontal: 18, borderRadius: 22, borderWidth: 1.5, borderColor: C.control, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    tabOn: { backgroundColor: C.primaryDark, borderColor: C.primaryDark },
    tabText: { ...T.semi, fontSize: 14, color: C.textSub },
    tabTextOn: { ...T.bold, color: '#FFFFFF' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    empty: { alignItems: 'center', gap: 6, paddingVertical: 28 },
    emptyTitle: { ...T.heading, fontSize: 18, color: C.text, textAlign: 'center' },
    emptyText: { ...T.medium, fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 20, maxWidth: 460 },
    blocked: { flexDirection: 'row', gap: 14, backgroundColor: C.dangerBg, borderRadius: 22, padding: 18, alignItems: 'flex-start' },
    blockedTitle: { ...T.heading, fontSize: 17, color: C.danger },
    blockedText: { ...T.medium, fontSize: 14, color: C.text, lineHeight: 20 },
    links: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    linkBtn: { flexGrow: 1, flexBasis: 200 },
    overlay: { flex: 1, backgroundColor: 'rgba(44,26,53,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    dialog: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, alignItems: 'center', gap: 12 },
    dialogIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center' },
    dialogTitle: { ...T.heading, fontSize: 20, color: C.text, textAlign: 'center' },
    dialogText: { ...T.medium, fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 20, marginBottom: 6 },
});
