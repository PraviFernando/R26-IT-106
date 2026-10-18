import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Modal, Image, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import { useTranslation } from 'react-i18next';
import styles from './exerciseStyles';
import ExerciseVideoPlayer from './ExerciseVideoPlayer';
import { C, T, cardShadow, Card, SoftCard, SectionTitle, OptionRow, PrimaryButton, SecondaryButton, CircleButton, Badge, Notice, Icon } from './ui';
import { durationToSeconds, formatTime, getYoutubeId } from '../../utils/exerciseUtils';
import { getTranslatedFeedback, feedbackText, videoFocusLabel } from '../../utils/exerciseMessages';
import { LOW_ADHERENCE_PERCENT } from '../../utils/exerciseConfig';

// Exercise Recommendation Card Component
// variant: 'full' (thumbnail card) or 'compact' (small row used for the "Up next" list on phones)
// =====================================================================================
// EXERCISE CARD = one recommended video.
// Tap -> popup with the video player, the stopwatch and the camera button.
//   Stopwatch Start / I am done -> 3 questions (pain, difficulty, feeling) -> result -> onComplete (saved by ExerciseScreen).
//   Camera button -> handleStartTracking -> MovementTrackingScreen.
// Video progress (watch %) goes up through onProgressUpdate; at 80% the card is completed.
// =====================================================================================

const ExerciseCard = ({ exercise, onComplete, isCompleted, onProgressUpdate, navigation, variant = 'full' }) => {
    const { width: currentWidth } = useWindowDimensions();
    const isLargeScreen = currentWidth > 768;
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language === 'si';
    const [videoModal, setVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [watchPercentage, setWatchPercentage] = useState(exercise.watchPercentage || 0);

    const isSupportedForTracking = (nameStr) => {
        if (!nameStr) return false;
        const lower = nameStr.toLowerCase();
        if (lower.includes('breath') || lower.includes('breathing') || lower.includes('diaphragmatic')) {
            return false;
        }
        return true;
    };

    // maps a video title to a tracking exercise (Cat-Cow, Bird Dog, Glute Bridge, Modified Squats)
    const getTrackingExerciseName = (nameStr) => {
        if (!nameStr) return 'Postpartum Exercise';
        const lower = nameStr.toLowerCase();
        if (lower.includes('cat')) return 'Cat-Cow';
        if (lower.includes('bird')) return 'Bird Dog';
        if (lower.includes('bridge')) return 'Glute Bridge';
        if (lower.includes('squat')) return 'Modified Squats';
        return nameStr;
    };

    // Why the camera could not be used: 'denied' (blocked/refused) or 'unavailable' (no camera or insecure page)
    const [cameraProblem, setCameraProblem] = useState(null);

    // "Check my movements with the camera". On web it only reads the camera permission state (it does not open the camera);
    // on phones it asks for permission. Then it opens MovementTrackingScreen with the exercise details.
    const handleStartTracking = async () => {
        setCameraProblem(null);
        // A browser only offers the camera on a secure page (localhost or https) and when one exists
        if (Platform.OS === 'web' && !(typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            setCameraProblem('unavailable');
            return;
        }
        if (Platform.OS === 'web') {
            // Only read the permission state. The camera itself is opened once, by the tracking screen:
            // opening it here too could leave it held when the tracker asks for it.
            // (expo-camera reports every failure as "denied", so it is not used on the web.)
            try {
                const perm = navigator.permissions && await navigator.permissions.query({ name: 'camera' });
                if (perm && perm.state === 'denied') {
                    setCameraProblem('denied');
                    return;
                }
            } catch (e) { /* browsers without this query: the tracking screen asks for the camera */ }
        } else {
            let status;
            try {
                ({ status } = await Camera.requestCameraPermissionsAsync());
            } catch (e) {
                setCameraProblem('unavailable');
                return;
            }
            if (status !== 'granted') {
                // The popup stays open and shows how to allow the camera.
                setCameraProblem('denied');
                return;
            }
        }
        pauseStopwatch(); // do not leave the stopwatch running while on the tracking screen
        setVideoModal(false);
        // iOS ignores a navigation that starts while a Modal is still closing
        if (Platform.OS === 'ios') await new Promise(resolve => setTimeout(resolve, 350));
        navigation.navigate('MovementTracking', {
            exerciseId: exercise.exerciseId || 'EX_MOCK',
            exerciseName: getTrackingExerciseName(title),
            // The card's own name, so the saved record completes this card
            cardName: exercise.customName || exercise.name,
            videoUrl: videoUrl
        });
    };

    // STOPWATCH - counts the real exercise time; this time is used for the adherence score
    // Stopwatch states
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const stopwatchIntervalRef = useRef(null);

    // Stop the stopwatch if the card unmounts (e.g. it moves to the Completed tab)
    useEffect(() => () => clearInterval(stopwatchIntervalRef.current), []);

    // Feedback Questions state
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [painRating, setPainRating] = useState(null); // 'Yes' / 'No'
    const [difficultyRating, setDifficultyRating] = useState(null); // 'Easy' / 'Moderate' / 'Hard'
    const [feelingRating, setFeelingRating] = useState(null); // 'Better' / 'Same' / 'Tired'

    // Results state
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [results, setResults] = useState(null);

    const videoRef = useRef(null);

    const details = exercise.exerciseDetails || {};

    const isYoutubeCard = exercise.type === 'youtube_video' || exercise.type === 'youtube_fallback' || !exercise.exerciseId;

    const title = isYoutubeCard ? (exercise.customName || exercise.name) : (details.nameSi || details.name);
    const duration = isYoutubeCard ? (exercise.duration || 10) : (details.duration || exercise.duration);
    const videoUrl = isYoutubeCard ? (exercise.videoUrl) : (details.videoUrl);
    const channelName = isSinhala
        ? "ප්‍රසූති ව්‍යායාම නාලිකාව"
        : (isYoutubeCard ? (exercise.channelTitle || "Pregnancy & Postpartum TV") : "Pregnancy & Postpartum TV");

    const videoId = getYoutubeId(videoUrl);
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;

    const videoList = isYoutubeCard
        ? [{ url: videoUrl, title: title, duration: `${duration} ${t('min')}`, source: "YouTube" }]
        : (details.videos || (details.videoUrl ? [{ url: details.videoUrl, title: details.name, titleSi: details.nameSi, duration: `${details.duration} ${t('min')}`, source: "YouTube" }] : []));

    // Stopwatch control functions
    const startStopwatch = () => {
        if (!isStopwatchRunning) {
            setIsStopwatchRunning(true);
            setVideoPlaying(true);
            stopwatchIntervalRef.current = setInterval(() => {
                setStopwatchTime(prev => prev + 1);
            }, 1000);
        }
    };

    const pauseStopwatch = () => {
        if (isStopwatchRunning) {
            clearInterval(stopwatchIntervalRef.current);
            setIsStopwatchRunning(false);
            setVideoPlaying(false);
        }
    };

    const stopStopwatch = () => {
        clearInterval(stopwatchIntervalRef.current);
        setIsStopwatchRunning(false);
        setVideoPlaying(false);
        setVideoModal(false);

        // Open simple questions modal
        setPainRating(null);
        setDifficultyRating(null);
        setFeelingRating(null);
        setShowQuestionsModal(true);
    };

    // adherence = stopwatch minutes / recommended minutes x 100 (max 100). Feedback code: pain -> pain_rest,
    // below 50% -> stopped_early, otherwise excellent. The backend builds the final message the same way.
    const submitFeedbackQuestions = async () => {
        const actualMins = Math.round(stopwatchTime / 60 * 10) / 10;
        const recDurationSecs = durationToSeconds(duration);
        const recMins = Math.round(recDurationSecs / 60);

        const score = recMins > 0 ? Math.round((actualMins / recMins) * 100) : 100;
        const cappedScore = Math.min(score, 100);

        // Intelligent feedback generation
        let feedbackCode = 'excellent';
        if (painRating === "Yes") {
            feedbackCode = 'pain_rest';
        } else if (cappedScore < LOW_ADHERENCE_PERCENT) {
            feedbackCode = 'stopped_early';
        }

        const feedbackData = {
            actualDuration: actualMins, // real stopwatch time; 0 if stopped immediately
            recommendedDuration: recMins || 10,
            videoDuration: recMins || 10,
            pain: painRating || "No",
            difficulty: difficultyRating || "Easy",
            feelingAfter: feelingRating || "Better",
            adherenceScore: cappedScore,
            intelligentFeedback: feedbackText(feedbackCode, false),
            feedbackCode
        };

        setResults(feedbackData);
        setShowQuestionsModal(false);
        setShowResultsModal(true);
    };

    // closing the result popup saves the record (completes the card)
    // Save when the result is closed: saving marks the card completed and moves it to the
    // Completed tab, which would unmount this card (and its result popup) too early.
    const finishResults = async () => {
        setShowResultsModal(false);
        if (!results) return;
        try {
            await onComplete(exercise, results);
        } catch (e) {
            console.error("Failed to save exercise record:", e);
        }
    };

    const handleCloseVideoModal = () => {
        pauseStopwatch();
        setVideoModal(false);
    };

    const handleCardPress = () => {
        if (videoList.length > 0) {
            setSelectedVideo(videoList[0]);
            setStopwatchTime(0);
            setIsStopwatchRunning(false);
            setCameraProblem(null);
            setVideoModal(true);
        }
    };

    const tr = (en, si) => (isSinhala ? si : en);
    const durationLabel = String(duration).includes(':') ? duration : `${duration}:00`;
    const actualMinutesNow = Math.round(stopwatchTime / 60);
    const surveyReady = painRating && difficultyRating && feelingRating;

    const compactRow = (
        <Pressable
            onPress={handleCardPress}
            disabled={videoList.length === 0}
            accessibilityRole="button"
            accessibilityLabel={`${tr('Start exercise', 'ව්‍යායාමය අරඹන්න')}: ${title}`}
            style={({ hovered }) => [cs.row, hovered && cs.cardHover]}
        >
            <View style={cs.rowThumb}>
                {thumbnailUrl
                    ? <Image source={{ uri: thumbnailUrl }} style={cs.thumbImg} resizeMode="cover" />
                    : <View style={cs.thumbEmpty}><Icon name="play" size={22} color={C.primaryDark} /></View>}
                {watchPercentage > 0 && !isCompleted && (
                    <View style={cs.track}><View style={[cs.fill, { width: `${Math.min(100, watchPercentage)}%` }]} /></View>
                )}
            </View>
            <View style={cs.rowBody}>
                <Text style={cs.rowTitle} numberOfLines={2}>{title}</Text>
                <Text style={cs.channel} numberOfLines={1}>
                    {durationLabel}{exercise.focus ? ` · ${videoFocusLabel(exercise.focus, isSinhala)}` : ''}
                </Text>
            </View>
            <View style={cs.rowPlay}><Icon name="play" size={16} color="#FFFFFF" /></View>
        </Pressable>
    );

    return (
        <>
            {variant === 'compact' ? compactRow : (
            <Pressable
                onPress={handleCardPress}
                disabled={videoList.length === 0}
                accessibilityRole="button"
                accessibilityLabel={`${tr('Start exercise', 'ව්‍යායාමය අරඹන්න')}: ${title}`}
                style={({ hovered }) => [cs.card, hovered && cs.cardHover, isCompleted && cs.cardDone]}
            >
                <View style={cs.thumb}>
                    {thumbnailUrl ? (
                        <Image source={{ uri: thumbnailUrl }} style={cs.thumbImg} resizeMode="cover" />
                    ) : (
                        <View style={cs.thumbEmpty}><Icon name="play" size={34} color={C.primaryDark} /></View>
                    )}
                    {!!exercise.focus && <Badge text={videoFocusLabel(exercise.focus, isSinhala)} tone="white" style={cs.focus} />}
                    <Text style={cs.duration}>{durationLabel}</Text>
                </View>
                <View style={cs.body}>
                    <Text style={cs.title} numberOfLines={2}>{title}</Text>
                    {!!exercise.channelTitle && <Text style={cs.channel} numberOfLines={1}>{exercise.channelTitle}</Text>}
                    {isCompleted ? (
                        <Badge text={tr('Completed', 'අවසන්')} tone="success" />
                    ) : (
                        <>
                            <View style={cs.bar}><View style={[cs.barFill, { width: `${Math.min(100, Math.round(watchPercentage))}%` }]} /></View>
                            <View style={cs.cta}>
                                <Text style={cs.ctaMuted}>{Math.round(watchPercentage)}% {tr('watched', 'නැරඹුවා')}</Text>
                                <Text style={cs.ctaText}>{tr('Start exercise', 'ව්‍යායාමය අරඹන්න')} →</Text>
                            </View>
                        </>
                    )}
                </View>
            </Pressable>
            )}

            {/* Video + stopwatch */}
            <Modal visible={videoModal} transparent animationType="slide" onRequestClose={handleCloseVideoModal}>
                <View style={cs.overlay}>
                    <View style={[cs.sheet, isLargeScreen && cs.sheetWide]}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={cs.sheetContent}>
                            <View style={cs.sheetHeader}>
                                <CircleButton icon="close" onPress={handleCloseVideoModal} label={tr('Close video', 'වීඩියෝව වසන්න')} />
                                <View style={{ flex: 1 }}>
                                    <Text style={cs.sheetTitle} numberOfLines={2}>{title}</Text>
                                    {!!exercise.focus && <Text style={cs.sheetSub}>{videoFocusLabel(exercise.focus, isSinhala)} · {durationLabel}</Text>}
                                </View>
                                <Pressable
                                    onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')}
                                    accessibilityRole="button"
                                    accessibilityLabel={tr('Switch language', 'භාෂාව මාරු කරන්න')}
                                    style={cs.lang}
                                >
                                    <Text style={cs.langText}>{i18n.language === 'en' ? 'සිං' : 'EN'}</Text>
                                </Pressable>
                            </View>

                            {selectedVideo && (
                                <View style={[cs.split, isLargeScreen && cs.splitWide]}>
                                    <View style={[cs.playerCol, isLargeScreen && { flex: 1.5 }]}>
                                        {(selectedVideo.url.includes('youtube') || selectedVideo.url.includes('youtu.be')) ? (
                                            <ExerciseVideoPlayer
                                                url={selectedVideo.url}
                                                onProgress={(percentage) => {
                                                    setWatchPercentage(percentage);
                                                    if (onProgressUpdate) {
                                                        onProgressUpdate(exercise, percentage);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Video
                                                ref={videoRef}
                                                source={{ uri: selectedVideo.url }}
                                                rate={1.0}
                                                volume={1.0}
                                                isMuted={false}
                                                shouldPlay={videoPlaying}
                                                useNativeControls
                                                resizeMode={ResizeMode.CONTAIN}
                                                style={[styles.videoPlayer, { height: isLargeScreen ? 420 : 250 }]}
                                            />
                                        )}
                                        <View style={cs.watchRow}>
                                            <Text style={cs.watchText}>{Math.round(watchPercentage)}% {tr('watched', 'නැරඹුවා')}</Text>
                                            <Text style={cs.watchText}>{tr('Counts as done at 80%', '80% දී අවසන් ලෙස සැලකේ')}</Text>
                                        </View>
                                    </View>

                                    <View style={[cs.sideCol, isLargeScreen && { flex: 1 }]}>
                                        <Card style={cs.stopwatch}>
                                            <Text style={cs.kicker}>{tr('Stopwatch · your exercise time', 'කාල ගණකය · ඔබේ ව්‍යායාම කාලය')}</Text>
                                            <Text style={cs.time}>{formatTime(stopwatchTime)}</Text>
                                            <View style={cs.controls}>
                                                <View style={cs.control}>
                                                    <Pressable
                                                        onPress={isStopwatchRunning ? pauseStopwatch : startStopwatch}
                                                        accessibilityRole="button"
                                                        accessibilityLabel={isStopwatchRunning ? tr('Pause', 'නවත්වන්න') : tr('Start', 'අරඹන්න')}
                                                        style={[cs.roundBtn, { backgroundColor: C.primaryDark }]}
                                                    >
                                                        <Icon name={isStopwatchRunning ? 'pause' : 'play'} size={28} color="#FFFFFF" />
                                                    </Pressable>
                                                    <Text style={cs.controlText}>{isStopwatchRunning ? tr('Pause', 'නවත්වන්න') : tr('Start', 'අරඹන්න')}</Text>
                                                </View>
                                                <View style={cs.control}>
                                                    <Pressable
                                                        onPress={stopStopwatch}
                                                        accessibilityRole="button"
                                                        accessibilityLabel={tr("I'm done", 'මම අවසන්')}
                                                        style={[cs.roundBtn, { backgroundColor: C.tint }]}
                                                    >
                                                        <Icon name="check" size={28} color={C.primaryDark} />
                                                    </Pressable>
                                                    <Text style={cs.controlText}>{tr("I'm done", 'මම අවසන්')}</Text>
                                                </View>
                                            </View>
                                        </Card>

                                        {isSupportedForTracking(title) && (
                                            <SecondaryButton icon="camera" title={tr('Check my movements with the camera', 'කැමරාවෙන් මගේ චලන පරීක්ෂා කරන්න')} onPress={handleStartTracking} />
                                        )}
                                        {cameraProblem === 'denied' && (
                                            <Notice tone="warn" icon="camera" text={Platform.OS === 'web'
                                                ? tr('The camera is blocked for this page. Click the camera or lock icon in your browser\'s address bar, choose Allow, then press the button again. The camera is only used to detect body movement.',
                                                    'මෙම පිටුව සඳහා කැමරාව අවහිර කර ඇත. බ්‍රවුසරයේ ලිපින තීරුවේ කැමරා හෝ අගුලු නිරූපකය ක්ලික් කර Allow තෝරා, නැවත බොත්තම ඔබන්න. කැමරාව භාවිතා කරන්නේ ශරීර චලනය හඳුනා ගැනීමට පමණි.')
                                                : tr('Camera access is needed. Allow the camera for this app in your phone\'s Settings, then try again. It is only used to detect body movement.',
                                                    'කැමරා ප්‍රවේශය අවශ්‍යයි. ඔබේ දුරකථනයේ Settings තුළ මෙම යෙදුමට කැමරාව ඉඩ දී නැවත උත්සාහ කරන්න. එය භාවිතා කරන්නේ ශරීර චලනය හඳුනා ගැනීමට පමණි.')} />
                                        )}
                                        {cameraProblem === 'unavailable' && (
                                            <Notice tone="warn" icon="camera" text={tr('The camera is not available. Check that a camera is connected, and that this page is opened on localhost or a secure (https) address.',
                                                'කැමරාව ලබාගත නොහැක. කැමරාවක් සම්බන්ධ කර ඇත්දැයි සහ මෙම පිටුව localhost හෝ ආරක්ෂිත (https) ලිපිනයකින් විවෘත කර ඇත්දැයි පරීක්ෂා කරන්න.')} />
                                        )}
                                        <Notice tone="warn" text={tr('Stop if anything hurts or you feel dizzy. Rest is part of recovery.', 'වේදනාවක් හෝ කරකැවිල්ලක් දැනේ නම් නවතින්න. විවේකයද සුවයේ කොටසකි.')} />
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* How did it feel? */}
            <Modal visible={showQuestionsModal} transparent animationType="slide">
                <View style={cs.overlay}>
                    <View style={[cs.sheet, cs.sheetNarrow]}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={cs.sheetContent}>
                            <View style={cs.doneHead}>
                                <View style={cs.doneIcon}><Icon name="check" size={34} color={C.success} /></View>
                                <Text style={cs.doneTitle}>{tr('Well done', 'ඉතා හොඳයි')}</Text>
                                <Text style={cs.doneText}>
                                    {tr(`You moved for ${actualMinutesNow} minute${actualMinutesNow === 1 ? '' : 's'}. Three quick answers help us choose tomorrow's exercises.`,
                                        `ඔබ මිනිත්තු ${actualMinutesNow}ක් ව්‍යායාම කළා. හෙට ව්‍යායාම තෝරා ගැනීමට කෙටි පිළිතුරු තුනක් දෙන්න.`)}
                                </Text>
                            </View>
                            <Card style={cs.q}>
                                <SectionTitle>{tr('Did anything hurt?', 'කිසියම් වේදනාවක් දැනුණාද?')}</SectionTitle>
                                <OptionRow value={painRating} onChange={setPainRating} options={[
                                    { value: 'No', label: tr('No', 'නැත') },
                                    { value: 'Yes', label: tr('Yes', 'ඔව්') },
                                ]} />
                            </Card>
                            <Card style={cs.q}>
                                <SectionTitle>{tr('How hard was it?', 'කෙතරම් අපහසු වීද?')}</SectionTitle>
                                <OptionRow value={difficultyRating} onChange={setDifficultyRating} options={[
                                    { value: 'Easy', label: tr('Easy', 'පහසුයි') },
                                    { value: 'Moderate', label: tr('Okay', 'මධ්‍යම') },
                                    { value: 'Hard', label: tr('Hard', 'අපහසුයි') },
                                ]} />
                            </Card>
                            <Card style={cs.q}>
                                <SectionTitle>{tr('How do you feel now?', 'දැන් ඔබට දැනෙන්නේ කෙසේද?')}</SectionTitle>
                                <OptionRow value={feelingRating} onChange={setFeelingRating} options={[
                                    { value: 'Better', label: tr('Better', 'සුවදායකයි') },
                                    { value: 'Same', label: tr('Same', 'වෙනසක් නැත') },
                                    { value: 'Tired', label: tr('Tired', 'තෙහෙට්ටුයි') },
                                ]} />
                            </Card>
                            <PrimaryButton title={tr('Save and see my result', 'සුරකින්න සහ ප්‍රතිඵලය බලන්න')} onPress={submitFeedbackQuestions} disabled={!surveyReady} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Result */}
            <Modal visible={showResultsModal} transparent animationType="fade" onRequestClose={finishResults}>
                <View style={cs.overlay}>
                    <View style={[cs.sheet, cs.sheetNarrow]}>
                        <View style={cs.sheetContent}>
                            {results && (
                                <SoftCard style={{ gap: 6 }}>
                                    <Text style={cs.resultKicker}>{tr("Today's result", 'අද ප්‍රතිඵලය')}</Text>
                                    <Text style={cs.resultBig}>{results.adherenceScore}%</Text>
                                    <Text style={cs.resultSub}>
                                        {tr(`${results.actualDuration} of the planned ${results.recommendedDuration} minutes`, `සැලසූ විනාඩි ${results.recommendedDuration} න් ${results.actualDuration}`)}
                                    </Text>
                                    <Text style={cs.resultMsg}>{getTranslatedFeedback(results.intelligentFeedback, isSinhala, results.feedbackCode)}</Text>
                                </SoftCard>
                            )}
                            <PrimaryButton title={tr('Done', 'අවසන්')} onPress={finishResults} />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

// Card and session styles (PeriCare exercise mockups)
const cs = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
    cardHover: { borderColor: C.secondary },
    cardDone: { opacity: 0.85 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: C.border },
    rowThumb: { width: 96, height: 60, borderRadius: 14, overflow: 'hidden', backgroundColor: C.control },
    rowBody: { flex: 1, gap: 3 },
    rowTitle: { ...T.semi, fontSize: 14, lineHeight: 19, color: C.text },
    rowPlay: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
    thumb: { height: 170, backgroundColor: C.control, justifyContent: 'center', alignItems: 'center' },
    thumbImg: { width: '100%', height: '100%' },
    thumbEmpty: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', backgroundColor: C.tint },
    focus: { position: 'absolute', left: 12, top: 12 },
    duration: { position: 'absolute', right: 12, bottom: 12, backgroundColor: 'rgba(44,26,53,0.8)', color: '#FFFFFF', ...T.bold, fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },
    track: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, backgroundColor: 'rgba(255,255,255,0.6)' },
    fill: { height: 5, backgroundColor: C.primary },
    body: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 18, gap: 8 },
    bar: { height: 6, borderRadius: 99, backgroundColor: C.lilac, marginTop: 4 },
    barFill: { height: 6, borderRadius: 99, backgroundColor: C.primary },
    title: { ...T.semi, fontSize: 15, lineHeight: 21, color: C.text },
    channel: { ...T.medium, fontSize: 12, color: C.textSub },
    cta: { marginTop: 2, minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    ctaMuted: { ...T.medium, fontSize: 12, color: C.textSub },
    ctaText: { ...T.semi, fontSize: 14, color: C.primaryDark },
    overlay: { flex: 1, backgroundColor: 'rgba(44,26,53,0.45)', justifyContent: 'flex-end', alignItems: 'center' },
    sheet: { width: '100%', maxHeight: '96%', backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
    sheetWide: { maxWidth: 1100, borderRadius: 28, marginBottom: 'auto', marginTop: 'auto' },
    sheetNarrow: { maxWidth: 560 },
    sheetContent: { padding: 20, gap: 14 },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sheetTitle: { ...T.heading, fontSize: 20, lineHeight: 26, color: C.text },
    sheetSub: { ...T.medium, fontSize: 13, color: C.textSub },
    lang: { minHeight: 40, minWidth: 44, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
    langText: { ...T.bold, fontSize: 13, color: C.primaryDark },
    split: { gap: 14 },
    splitWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
    playerCol: { gap: 8 },
    sideCol: { gap: 12 },
    watchRow: { flexDirection: 'row', justifyContent: 'space-between' },
    watchText: { ...T.semi, fontSize: 12, color: C.textSub },
    stopwatch: { alignItems: 'center', gap: 12, paddingVertical: 20 },
    kicker: { ...T.semi, fontSize: 12, color: C.primaryDark, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
    time: { ...T.heading, fontSize: 52, color: C.text, fontVariant: ['tabular-nums'] },
    controls: { flexDirection: 'row', gap: 32 },
    control: { alignItems: 'center', gap: 6 },
    roundBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    controlText: { ...T.semi, fontSize: 13, color: C.text },
    doneHead: { alignItems: 'center', gap: 8, paddingTop: 6 },
    doneIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.successBg, alignItems: 'center', justifyContent: 'center' },
    doneTitle: { ...T.heading, fontSize: 24, color: C.text },
    doneText: { ...T.medium, fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 20 },
    q: { gap: 12 },
    resultKicker: { ...T.semi, fontSize: 12, color: C.primaryDark, textTransform: 'uppercase', letterSpacing: 1 },
    resultBig: { ...T.heading, fontSize: 40, color: C.text },
    resultSub: { ...T.semi, fontSize: 14, color: C.textSub },
    resultMsg: { ...T.body, fontSize: 15, lineHeight: 22, color: C.text, marginTop: 4 },
});

export default ExerciseCard;
