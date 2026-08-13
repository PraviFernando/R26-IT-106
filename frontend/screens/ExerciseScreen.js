import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, Modal, TextInput, Switch,
    Dimensions, Image, FlatList, Platform, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import exerciseService from '../services/exerciseService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// YouTube Player Component
const YouTubePlayer = ({ url, duration, style, onProgress }) => {
    const { t } = useTranslation();
    const [error, setError] = useState(false);
    const webViewRef = useRef(null);
    
    const parseDurationToSeconds = (durationStr) => {
        if (!durationStr) return 600; // default 10 mins
        const str = String(durationStr);
        if (str.includes(':')) {
            const parts = str.split(':');
            if (parts.length === 2) {
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            } else if (parts.length === 3) {
                return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            }
        }
        return parseInt(str) * 60 || 600;
    };

    const getEmbedUrl = (videoUrl) => {
        if (!videoUrl) return '';
        let videoId = '';
        
        if (videoUrl.includes('youtube.com/embed/')) {
            return videoUrl;
        }
        
        if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        } else if (videoUrl.includes('youtube.com/watch')) {
            try {
                const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
                videoId = urlParams.get('v');
            } catch (e) {
                console.log('Error parsing URL:', e);
            }
        }
        
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1&rel=0&modestbranding=1`;
        }
        
        return videoUrl;
    };
    
    const embedUrl = getEmbedUrl(url);
    const videoId = embedUrl.split('youtube.com/embed/')[1]?.split('?')[0];

    useEffect(() => {
        if (Platform.OS === 'web' && onProgress) {
            const totalSecs = parseDurationToSeconds(duration);
            let elapsed = 0;
            const timer = setInterval(() => {
                elapsed += 1;
                const pct = (elapsed / totalSecs) * 100;
                onProgress(pct);
                if (pct >= 100) {
                    clearInterval(timer);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [url, duration]);

    if (!embedUrl.includes('youtube.com/embed/')) {
        return (
            <View style={[styles.videoPlayer, styles.videoPlayerCentered]}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>
                    {t('Failed to load video')}
                </Text>
            </View>
        );
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                body, html, #player { width: 100%; height: 100%; margin: 0; padding: 0; background-color: #000; overflow: hidden; }
            </style>
        </head>
        <body>
            <div id="player"></div>
            <script>
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                var player;
                function onYouTubeIframeAPIReady() {
                    player = new YT.Player('player', {
                        height: '100%',
                        width: '100%',
                        videoId: '${videoId}',
                        playerVars: {
                            'playsinline': 1,
                            'controls': 1,
                            'rel': 0,
                            'modestbranding': 1
                        },
                        events: {
                            'onStateChange': onPlayerStateChange,
                            'onReady': onPlayerReady
                        }
                    });
                }

                var progressInterval;
                function onPlayerReady(event) {
                    progressInterval = setInterval(function() {
                        if (player && player.getCurrentTime) {
                            var currentTime = player.getCurrentTime();
                            var duration = player.getDuration();
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'progress',
                                currentTime: currentTime,
                                duration: duration
                            }));
                        }
                    }, 1000);
                }

                function onPlayerStateChange(event) {
                    if (event.data == YT.PlayerState.ENDED) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'ended'
                        }));
                    }
                }
            </script>
        </body>
        </html>
    `;

    const handleMessage = (event) => {
        try {
            const msgData = JSON.parse(event.nativeEvent.data);
            if (msgData.type === 'progress') {
                const percentage = msgData.duration > 0 ? (msgData.currentTime / msgData.duration) * 100 : 0;
                if (onProgress) {
                    onProgress(percentage);
                }
            } else if (msgData.type === 'ended') {
                if (onProgress) {
                    onProgress(100);
                }
            }
        } catch (e) {
            console.log('Error parsing player message:', e);
        }
    };
    
    return (
        <View style={[styles.videoPlayer, { overflow: 'hidden' }]}>
            {error && (
                <View style={styles.webViewErrorContainer}>
                    <Text style={styles.webViewErrorText}>
                        {t('Failed to load video')}
                    </Text>
                    <TouchableOpacity 
                        style={styles.webViewRetryBtn}
                        onPress={() => {
                            setError(false);
                            webViewRef.current?.reload();
                        }}
                    >
                        <Text style={styles.webViewRetryBtnText}>
                            {t('Retry')}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            {Platform.OS === 'web' ? (
                <iframe
                    src={embedUrl}
                    style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: htmlContent }}
                    style={styles.webView}
                    allowsFullscreenVideo={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    onMessage={handleMessage}
                    renderLoading={() => (
                        <View style={styles.webViewLoadingContainer}>
                            <ActivityIndicator size="large" color="#7C3AED" />
                        </View>
                    )}
                    onError={() => {
                        setError(true);
                    }}
                />
            )}
        </View>
    );
};

// Health Data Input Component
const HealthDataForm = ({ onSubmit, loading, initialData, user }) => {
    const { t } = useTranslation();
    
    const [deliveryDate, setDeliveryDate] = useState(user?.deliveryDate || '');
    const [weeks, setWeeks] = useState(initialData?.weeksAfterDelivery || '');
    const [deliveryType, setDeliveryType] = useState(initialData?.deliveryType || 'normal');
    
    useEffect(() => {
        if (deliveryDate && deliveryDate.length === 10) {
            try {
                const birthDate = new Date(deliveryDate);
                const today = new Date();
                if (!isNaN(birthDate.getTime())) {
                    const diffTime = Math.abs(today - birthDate);
                    const calculatedWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
                    setWeeks(String(calculatedWeeks));
                }
            } catch (e) {
                console.log("Date calculation error", e);
            }
        }
    }, [deliveryDate]);

    const [pelvicPain, setPelvicPain] = useState(initialData?.pelvicPain || false);
    const [backPain, setBackPain] = useState(initialData?.backPain || false);
    const [abdominalPain, setAbdominalPain] = useState(initialData?.abdominalPain || false);
    const [bleeding, setBleeding] = useState(initialData?.bleedingComplications || false);
    const [doctorRestrictions, setDoctorRestrictions] = useState(initialData?.doctorRestrictions || false);
    const [fatigue, setFatigue] = useState(initialData?.fatigueLevel || 'low');
    const [mobility, setMobility] = useState(initialData?.mobilityLevel || 'normal');
    const [muscleWeakness, setMuscleWeakness] = useState(initialData?.muscleWeakness || false);
    const [willingness, setWillingness] = useState(initialData?.willingnessToExercise || 'medium');
    
    useEffect(() => {
        if (initialData) {
            if (initialData.weeksAfterDelivery !== undefined && initialData.weeksAfterDelivery !== '') setWeeks(String(initialData.weeksAfterDelivery));
            if (initialData.deliveryType) setDeliveryType(initialData.deliveryType);
            if (initialData.pelvicPain !== undefined) setPelvicPain(initialData.pelvicPain);
            if (initialData.backPain !== undefined) setBackPain(initialData.backPain);
            if (initialData.abdominalPain !== undefined) setAbdominalPain(initialData.abdominalPain);
            if (initialData.bleedingComplications !== undefined) setBleeding(initialData.bleedingComplications);
            if (initialData.doctorRestrictions !== undefined) setDoctorRestrictions(initialData.doctorRestrictions);
            if (initialData.fatigueLevel) setFatigue(initialData.fatigueLevel);
            if (initialData.mobilityLevel) setMobility(initialData.mobilityLevel);
            if (initialData.muscleWeakness !== undefined) setMuscleWeakness(initialData.muscleWeakness);
            if (initialData.willingnessToExercise) setWillingness(initialData.willingnessToExercise);
        }
    }, [initialData]);
    
    const handleSubmit = () => {
        if (!weeks) {
            Toast.show({ type: 'error', text1: t('Please enter weeks after delivery') });
            return;
        }
        onSubmit({
            date: todayStr(),
            deliveryDate,
            weeksAfterDelivery: parseInt(weeks),
            deliveryType,
            pelvicPain,
            backPain,
            abdominalPain,
            bleedingComplications: bleeding,
            doctorRestrictions,
            fatigueLevel: fatigue,
            mobilityLevel: mobility,
            muscleWeakness,
            willingnessToExercise: willingness
        });
    };
    
    return (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.formTitle}>
                {t('Today\'s Health Status')}
            </Text>
            
            {(!user?.deliveryDate) && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        {t('Delivery Date')} ({t('YYYY-MM-DD')})
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t("2024-05-10")}
                        value={deliveryDate}
                        onChangeText={setDeliveryDate}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
            )}
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    {t('Weeks After Delivery')}
                </Text>
                <TextInput
                    style={[styles.input, deliveryDate ? { backgroundColor: '#F3F4F6', color: '#6B7280' } : {}]}
                    placeholder={t("e.g., 4")}
                    keyboardType="numeric"
                    value={String(weeks)}
                    onChangeText={setWeeks}
                    editable={!deliveryDate}
                    placeholderTextColor="#9CA3AF"
                />
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Delivery Type')}</Text>
                <View style={styles.rowButtons}>
                    <TouchableOpacity
                        style={[styles.optionBtn, deliveryType === 'normal' && styles.optionBtnActive]}
                        onPress={() => setDeliveryType('normal')}
                    >
                        <Text style={[styles.optionText, deliveryType === 'normal' && styles.optionTextActive]}>
                            {t('Normal')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.optionBtn, deliveryType === 'c-section' && styles.optionBtnActive]}
                        onPress={() => setDeliveryType('c-section')}
                    >
                        <Text style={[styles.optionText, deliveryType === 'c-section' && styles.optionTextActive]}>
                            {t('C-Section')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            <Text style={[styles.label, { marginTop: 8 }]}>
                {t('Pain Conditions')}
            </Text>
            <View style={styles.checkboxGroup}>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setPelvicPain(!pelvicPain)}>
                    <View style={[styles.checkbox, pelvicPain && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Pelvic Pain')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setBackPain(!backPain)}>
                    <View style={[styles.checkbox, backPain && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Back Pain')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setAbdominalPain(!abdominalPain)}>
                    <View style={[styles.checkbox, abdominalPain && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Abdominal Pain')}</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.checkboxGroup}>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setBleeding(!bleeding)}>
                    <View style={[styles.checkbox, bleeding && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Bleeding Complications')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setDoctorRestrictions(!doctorRestrictions)}>
                    <View style={[styles.checkbox, doctorRestrictions && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Doctor Restrictions')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setMuscleWeakness(!muscleWeakness)}>
                    <View style={[styles.checkbox, muscleWeakness && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Muscle Weakness')}</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Fatigue Level')}</Text>
                <View style={styles.rowButtons}>
                    {['low', 'medium', 'high'].map(level => (
                        <TouchableOpacity
                            key={level}
                            style={[styles.optionBtn, fatigue === level && styles.optionBtnActive]}
                            onPress={() => setFatigue(level)}
                        >
                            <Text style={[styles.optionText, fatigue === level && styles.optionTextActive]}>
                                {t(level.charAt(0).toUpperCase() + level.slice(1))}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Mobility Level')}</Text>
                <View style={styles.columnButtons}>
                    {['very_limited', 'limited', 'normal'].map(level => (
                        <TouchableOpacity
                            key={level}
                            style={[styles.optionBtnWide, mobility === level && styles.optionBtnActive]}
                            onPress={() => setMobility(level)}
                        >
                            <Text style={[styles.optionText, mobility === level && styles.optionTextActive]}>
                                {level === 'very_limited' ? t('Very Restricted') : level === 'limited' ? t('Restricted') : t('Normal Mobility')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Willingness to Exercise')}</Text>
                <View style={styles.rowButtons}>
                    {['low', 'medium', 'high'].map(level => (
                        <TouchableOpacity
                            key={level}
                            style={[styles.optionBtn, willingness === level && styles.optionBtnActive]}
                            onPress={() => setWillingness(level)}
                        >
                            <Text style={[styles.optionText, willingness === level && styles.optionTextActive]}>
                                {t(level.charAt(0).toUpperCase() + level.slice(1))}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitBtnText}>
                        {t('Get Exercise Recommendations')}
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

// Exercise Recommendation Card Component
const ExerciseCard = ({ exercise, onComplete, onUploadVideo, isCompleted, onProgressUpdate }) => {
    const { t } = useTranslation();
    const [videoModal, setVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [watchPercentage, setWatchPercentage] = useState(exercise.watchPercentage || 0);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    
    // Stopwatch states
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const stopwatchIntervalRef = useRef(null);

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
    const channelName = isYoutubeCard ? (exercise.channelTitle || "Pregnancy & Postpartum TV") : "Pregnancy & Postpartum TV";
    
    const parseDurationToSeconds = (durationStr) => {
        if (!durationStr) return 600; // default 10 mins
        const str = String(durationStr);
        if (str.includes(':')) {
            const parts = str.split(':');
            if (parts.length === 2) {
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            } else if (parts.length === 3) {
                return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            }
        }
        return parseInt(str) * 60 || 600;
    };

    const getYoutubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    };
    
    const videoId = getYoutubeId(videoUrl);
    const thumbnailUrl = isYoutubeCard && videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;

    const videoList = isYoutubeCard 
        ? [{ url: videoUrl, title: title, duration: `${duration} ${t('min')}`, source: "YouTube" }]
        : (details.videos || (details.videoUrl ? [{ url: details.videoUrl, title: details.name, titleSi: details.nameSi, duration: `${details.duration} ${t('min')}`, source: "YouTube" }] : []));
        
    const getExerciseIcon = (type) => {
        switch(type) {
            case 'breathing': return '🌬️';
            case 'pelvic_floor': return '💪';
            case 'stretching': return '🧘';
            case 'walking': return '🚶';
            default: return '🏋️';
        }
    };
    
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

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const submitFeedbackQuestions = async () => {
        const actualMins = Math.round(stopwatchTime / 60 * 10) / 10;
        const recDurationSecs = parseDurationToSeconds(duration);
        const recMins = Math.round(recDurationSecs / 60);
        
        const score = recMins > 0 ? Math.round((actualMins / recMins) * 100) : 100;
        const cappedScore = Math.min(score, 100);

        // Intelligent feedback generation
        let feedbackMsg = "";
        if (painRating === "Yes") {
            feedbackMsg = "You felt pain during exercise. Please rest. Tomorrow's exercises will be adjusted to lower intensity.";
        } else if (cappedScore < 50) {
            feedbackMsg = "You stopped early. Tomorrow’s exercises will be adjusted to lower intensity.";
        } else {
            feedbackMsg = "Excellent progress. You may continue with the current exercise plan.";
        }

        const feedbackData = {
            actualDuration: actualMins || 1, // ensure at least 1 min if completed
            recommendedDuration: recMins || 10,
            videoDuration: recMins || 10,
            pain: painRating || "No",
            difficulty: difficultyRating || "Easy",
            feelingAfter: feelingRating || "Better",
            adherenceScore: cappedScore,
            intelligentFeedback: feedbackMsg
        };

        setResults(feedbackData);
        setShowQuestionsModal(false);
        setShowResultsModal(true);

        try {
            await onComplete(exercise, feedbackData);
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
            setVideoModal(true);
        }
    };

    return (
        <>
            <TouchableOpacity 
                activeOpacity={0.85}
                onPress={handleCardPress}
                disabled={videoList.length === 0}
            >
                <LinearGradient
                    colors={isCompleted ? ['#E8F5E9', '#C8E6C9'] : ['#FFFFFF', '#F5F3FF']}
                    style={[styles.exerciseCard, isCompleted && styles.exerciseCardCompleted]}
                >
                    {isYoutubeCard && thumbnailUrl && (
                        <View style={styles.thumbnailContainer}>
                            <Image source={{ uri: thumbnailUrl }} style={styles.cardThumbnail} resizeMode="cover" />
                            <View style={styles.thumbnailPlayOverlay}>
                                <Text style={styles.playOverlayIcon}>▶️</Text>
                            </View>
                        </View>
                    )}
                    
                    <View style={styles.exerciseHeader}>
                        {!isYoutubeCard && <Text style={styles.exerciseIcon}>{getExerciseIcon(details.type)}</Text>}
                        <View style={styles.exerciseInfo}>
                            <Text style={styles.exerciseName}>
                                {title}
                            </Text>
                            <Text style={styles.exerciseMeta}>
                                ⏱️ {t('Duration')}: {String(duration).includes(':') ? duration : `${duration} ${t('min')}`}
                                {!isYoutubeCard && ` • 📊 ${t('Intensity')}: ${details.intensity === 'low' ? t('Low') : details.intensity === 'medium' ? t('Medium') : t('Controlled')}`}
                                {isYoutubeCard && ` • 🏷️ ${channelName}`}
                            </Text>
                        </View>
                        {watchPercentage > 0 && !isCompleted && (
                            <View style={styles.progressBadge}>
                                <Text style={styles.progressBadgeText}>{Math.round(watchPercentage)}%</Text>
                            </View>
                        )}
                        {isCompleted && (
                            <View style={styles.completedBadge}>
                                <Text style={styles.completedBadgeText}>✓ {t('Done')}</Text>
                            </View>
                        )}
                    </View>
                    
                    {!isYoutubeCard && (
                        <Text style={styles.exerciseDesc}>
                             {details.descriptionSi || details.description}
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
            
            {/* Video Modal with Stopwatch */}
            <Modal visible={videoModal} transparent animationType="slide" onRequestClose={handleCloseVideoModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.videoModalContent}>
                        <Text style={styles.modalTitle}>
                            {title}
                        </Text>
                        
                        {selectedVideo && (
                            <>
                                {(selectedVideo.url.includes('youtube') || selectedVideo.url.includes('youtu.be')) ? (
                                    <YouTubePlayer 
                                        url={selectedVideo.url} 
                                        duration={duration}
                                        style={styles.videoPlayer}
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
                                        style={styles.videoPlayer}
                                    />
                                )}
                                
                                {/* Stopwatch UI */}
                                <View style={styles.stopwatchContainer}>
                                    <Text style={styles.stopwatchLabel}>⏱️ Stopwatch</Text>
                                    <Text style={styles.stopwatchDisplay}>{formatTime(stopwatchTime)}</Text>
                                    <View style={styles.stopwatchRow}>
                                        {!isStopwatchRunning ? (
                                            <TouchableOpacity style={[styles.controlBtn, styles.startBtn]} onPress={startStopwatch}>
                                                <Text style={styles.controlBtnText}>▶ Start Exercise</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity style={[styles.controlBtn, styles.pauseBtn]} onPress={pauseStopwatch}>
                                                <Text style={styles.controlBtnText}>⏸ Pause</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity style={[styles.controlBtn, styles.stopBtn]} onPress={stopStopwatch}>
                                            <Text style={styles.controlBtnText}>⏹ Stop & Save</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        )}
                        
                        <TouchableOpacity style={styles.modalCloseBtn} onPress={handleCloseVideoModal}>
                            <Text style={styles.modalCloseText}>{t('Close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Simple Feedback Questions Modal */}
            <Modal visible={showQuestionsModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.questionsModalContent}>
                        <Text style={styles.feedbackEmojiTitle}>🩺</Text>
                        <Text style={styles.feedbackTitle}>Post-Exercise Survey</Text>
                        <Text style={styles.feedbackSubtitle}>Please answer these 3 simple questions to evaluate today's session:</Text>
                        
                        {/* Question 1: Pain */}
                        <Text style={styles.questionText}>1. Did you feel pain during exercise?</Text>
                        <View style={styles.btnRow}>
                            {['Yes', 'No'].map(ans => (
                                <TouchableOpacity 
                                    key={ans} 
                                    style={[styles.surveyBtn, painRating === ans && styles.surveyBtnActive]} 
                                    onPress={() => setPainRating(ans)}
                                >
                                    <Text style={[styles.surveyBtnText, painRating === ans && styles.surveyBtnTextActive]}>{ans}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Question 2: Difficulty */}
                        <Text style={styles.questionText}>2. How difficult was the exercise?</Text>
                        <View style={styles.btnRow}>
                            {['Easy', 'Moderate', 'Hard'].map(ans => (
                                <TouchableOpacity 
                                    key={ans} 
                                    style={[styles.surveyBtn, difficultyRating === ans && styles.surveyBtnActive]} 
                                    onPress={() => setDifficultyRating(ans)}
                                >
                                    <Text style={[styles.surveyBtnText, difficultyRating === ans && styles.surveyBtnTextActive]}>{ans}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Question 3: Feeling */}
                        <Text style={styles.questionText}>3. How do you feel after exercise?</Text>
                        <View style={styles.btnRow}>
                            {['Better', 'Same', 'Tired'].map(ans => (
                                <TouchableOpacity 
                                    key={ans} 
                                    style={[styles.surveyBtn, feelingRating === ans && styles.surveyBtnActive]} 
                                    onPress={() => setFeelingRating(ans)}
                                >
                                    <Text style={[styles.surveyBtnText, feelingRating === ans && styles.surveyBtnTextActive]}>{ans}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity 
                            style={[styles.submitSurveyBtn, (!painRating || !difficultyRating || !feelingRating) && { opacity: 0.5 }]} 
                            disabled={!painRating || !difficultyRating || !feelingRating}
                            onPress={submitFeedbackQuestions}
                        >
                            <Text style={styles.submitSurveyBtnText}>Submit & Get Feedback</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Smart Completion Results Modal */}
            <Modal visible={showResultsModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.resultsModalContent}>
                        <Text style={styles.feedbackEmojiTitle}>📊</Text>
                        <Text style={styles.feedbackTitle}>Session Summary</Text>
                        
                        {results && (
                            <View style={styles.resultsInfoBlock}>
                                <Text style={styles.resultsRowText}>⏱️ Recommended Duration: <Text style={{fontWeight: '800'}}>{results.recommendedDuration} mins</Text></Text>
                                <Text style={styles.resultsRowText}>⏱️ Actual Workout Duration: <Text style={{fontWeight: '800'}}>{results.actualDuration} mins</Text></Text>
                                <Text style={styles.resultsRowText}>📈 Adherence Score: <Text style={{fontWeight: '800', color: '#7C3AED'}}>{results.adherenceScore}%</Text></Text>
                                
                                <View style={styles.dividerLine} />
                                
                                <Text style={styles.resultsFeedbackTitle}>System Adaptation:</Text>
                                <Text style={styles.resultsFeedbackText}>"{results.intelligentFeedback}"</Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.resultsCloseBtn} onPress={() => setShowResultsModal(false)}>
                            <Text style={styles.resultsCloseBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

// Progress Dashboard Component
const ProgressDashboard = ({ progress, detectedMood }) => {
    const { t } = useTranslation();
    if (!progress) return null;
    
    return (
        <View style={styles.progressContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Text style={[styles.progressTitle, { marginBottom: 0 }]}>
                    {t('Your Progress')}
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
                <View style={{ marginTop: 14, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 18, borderLeftWidth: 4, borderLeftColor: '#7C3AED' }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#1E293B', marginBottom: 2 }}>🩺 Recovery Trend Analysis</Text>
                    <Text style={{ fontSize: 12, color: '#475569', lineHeight: 16 }}>{progress.recoveryTrend}</Text>
                </View>
            )}
        </View>
    );
};

// Safety Warning Component
const SafetyWarning = ({ safetyStatus, safetyMessage, safetyMessageSi }) => {
    const { t } = useTranslation();
    const message = safetyMessageSi || safetyMessage;
    
    if (safetyStatus === 'blocked') {
        return (
            <View style={styles.safetyBlocked}>
                <Text style={styles.safetyIcon}>⚠️</Text>
                <Text style={styles.safetyTitle}>{t('Warning')}</Text>
                <Text style={styles.safetyMessage}>{message}</Text>
                <Text style={styles.safetyAdvice}>
                    {t('Please consult your doctor')}
                </Text>
            </View>
        );
    }
    
    if (safetyStatus === 'limited') {
        return (
            <View style={styles.safetyLimited}>
                <Text style={styles.safetyIcon}>⚠️</Text>
                <Text style={styles.safetyTitle}>{t('Limited Exercise')}</Text>
                <Text style={styles.safetyMessage}>{message}</Text>
                <Text style={styles.safetySubtext}>
                    {t('Only gentle exercises are recommended')}
                </Text>
            </View>
        );
    }
    
    return (
        <View style={styles.safetySafe}>
            <Text style={styles.safetyIcon}>✅</Text>
            <Text style={styles.safetyTitle}>{t('Safe')}</Text>
            <Text style={styles.safetyMessage}>
                {t('Your condition is suitable for exercise')}
            </Text>
        </View>
    );
};

let promptShownDate = null;

// Main Exercise Screen
export default function ExerciseScreen({ navigation }) {
    const { t, i18n } = useTranslation();
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
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [showForm, setShowForm] = useState(true);
    const [activeTab, setActiveTab] = useState('todo');
    
    useEffect(() => {
        loadProgress();
        checkTodayData();
    }, []);
    
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
            if (data.exists) {
                setHasData(true);
                await loadRecommendations();
                
                const userId = user?.id || user?._id || user?.email || 'default';
                const storageKey = `exercise_prompt_shown_${userId}`;
                const lastShownDate = await AsyncStorage.getItem(storageKey);
                
                if (lastShownDate !== todayStr()) {
                    await AsyncStorage.setItem(storageKey, todayStr());
                    setShowHealthPromptModal(true);
                }
            } else {
                setHasData(false);
                setShowForm(true);
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
                
                // Reset completed tab by forcing completed: false and watchPercentage: 0 for new session
                const resetRecs = (response.recommendedExercises || []).map(rec => ({
                    ...rec,
                    completed: false,
                    watchPercentage: 0
                }));
                setRecommendations(resetRecs);
                setActiveTab('todo');
                setHasData(true);
                setShowForm(false);
                
                // Scroll to top of the exercise page after submitting health form
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                }, 100);
                
                Toast.show({
                    type: response.safetyStatus === 'blocked' ? 'error' : 'success',
                    text1: `✅ ${t('Information Saved')}`,
                    position: 'top'
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
                durationCompleted: exercise.duration || 15,
                liked: true,
                ...feedbackData
            });
            
            setRecommendations(prev =>
                prev.map(rec => {
                    const match = exercise.exerciseId 
                        ? rec.exerciseId === exercise.exerciseId
                        : (rec.customName === exercise.customName || rec.videoUrl === exercise.videoUrl);
                    return match ? { ...rec, completed: true } : rec;
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
    
    const handleProgressUpdate = async (exercise, percentage) => {
        setRecommendations(prev =>
            prev.map(rec => {
                const match = exercise.exerciseId 
                    ? rec.exerciseId === exercise.exerciseId
                    : (rec.customName === exercise.customName || rec.videoUrl === exercise.videoUrl);
                return match ? { ...rec, watchPercentage: Math.round(percentage) } : rec;
            })
        );

        // If user watched more than 80% of the video, automatically mark it as completed!
        const isAlreadyCompleted = recommendations.find(rec => {
            const match = exercise.exerciseId 
                ? rec.exerciseId === exercise.exerciseId
                : (rec.customName === exercise.customName || rec.videoUrl === exercise.videoUrl);
            return match && rec.completed;
        });

        if (percentage >= 80 && !isAlreadyCompleted) {
            console.log(`[Progress Track] Auto-completing exercise: ${exercise.customName || exercise.name} at ${percentage.toFixed(1)}%`);
            
            // Instantly update local state so the card moves to the Completed tab in the exact same millisecond
            setRecommendations(prev =>
                prev.map(rec => {
                    const match = exercise.exerciseId 
                        ? rec.exerciseId === exercise.exerciseId
                        : (rec.customName === exercise.customName || rec.videoUrl === exercise.videoUrl);
                    return match ? { ...rec, completed: true, watchPercentage: 100 } : rec;
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
    
    const handleUploadVideo = async (exerciseId, videoUri) => {
        try {
            const response = await exerciseService.uploadVideo({
                date: todayStr(),
                exerciseId,
                videoUri
            });
            return response;
        } catch (err) {
            throw err;
        }
    };
    
    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient colors={['#F4F0FB', '#FDFCFE']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerEmoji}>🏃‍♀️</Text>
                        <Text style={styles.headerTitle}>
                            {t('Postpartum Exercise')}
                        </Text>
                    </View>
                    <View style={styles.backBtn} />
                </View>
                <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity 
                        style={styles.viewProgressBtn}
                        onPress={() => navigation.navigate('Progress')}
                    >
                        <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.viewProgressBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text style={styles.viewProgressBtnEmoji}>📊</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.viewProgressBtnTitle}>ඔබේ ප්‍රගතිය (Your Progress)</Text>
                                <Text style={styles.viewProgressBtnSub}>View streaks, adherence & recovery trends →</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                    
                    {safetyStatus && (
                        <SafetyWarning
                            safetyStatus={safetyStatus}
                            safetyMessage={safetyMessage}
                            safetyMessageSi={safetyMessageSi}
                        />
                    )}
                    
                    {(showForm || !hasData) && (
                        <HealthDataForm
                            onSubmit={handleSubmitHealthData}
                            loading={loading}
                            user={user}
                            initialData={initialHealthData}
                        />
                    )}
                    
                    {!showForm && hasData && recommendations.length > 0 && safetyStatus !== 'blocked' && (
                        <View style={styles.recommendationsContainer}>
                            <Text style={styles.recommendationsTitle}>
                                {t("Today's Exercise Plan")}
                            </Text>

                            {/* Tab Switcher */}
                            <View style={styles.tabContainer}>
                                <TouchableOpacity 
                                    style={[styles.tabButton, activeTab === 'todo' && styles.tabButtonActive]}
                                    onPress={() => setActiveTab('todo')}
                                >
                                    <Text style={[styles.tabText, activeTab === 'todo' && styles.tabTextActive]}>
                                        📋 {i18n.language === 'si' ? 'කිරීමට ඇති' : t('To Do')} ({Math.min(5, recommendations.filter(rec => !rec.completed).length)})
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.tabButton, activeTab === 'completed' && styles.tabButtonActive]}
                                    onPress={() => setActiveTab('completed')}
                                >
                                    <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
                                        ✅ {i18n.language === 'si' ? 'අවසන් කළ' : t('Completed')} ({recommendations.filter(rec => rec.completed).length})
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {activeTab === 'todo' && (
                                recommendations.filter(rec => !rec.completed).slice(0, 5).length > 0 ? (
                                    recommendations.filter(rec => !rec.completed).slice(0, 5).map((rec, idx) => (
                                        <ExerciseCard
                                            key={idx}
                                            exercise={rec}
                                            onComplete={handleCompleteExercise}
                                            onUploadVideo={handleUploadVideo}
                                            isCompleted={rec.completed}
                                            onProgressUpdate={handleProgressUpdate}
                                        />
                                    ))
                                ) : (
                                    <View style={styles.emptyContainerSmall}>
                                        <Text style={styles.emptyTitleSmall}>🎉 {t('All Done!')}</Text>
                                        <Text style={styles.emptyTextSmall}>{t('You have completed all exercise recommendations for today.')}</Text>
                                    </View>
                                )
                            )}

                            {activeTab === 'completed' && (
                                recommendations.filter(rec => rec.completed).length > 0 ? (
                                    recommendations.filter(rec => rec.completed).map((rec, idx) => (
                                        <ExerciseCard
                                            key={idx}
                                            exercise={rec}
                                            onComplete={handleCompleteExercise}
                                            onUploadVideo={handleUploadVideo}
                                            isCompleted={rec.completed}
                                            onProgressUpdate={handleProgressUpdate}
                                        />
                                    ))
                                ) : (
                                    <View style={styles.emptyContainerSmall}>
                                        <Text style={styles.emptyTitleSmall}>🌸 {t('No Videos Completed')}</Text>
                                        <Text style={styles.emptyTextSmall}>{t('Start watching standard recommendations to see them here.')}</Text>
                                    </View>
                                )
                            )}
                        </View>
                    )}
                    
                    {!showForm && hasData && recommendations.length === 0 && safetyStatus !== 'blocked' && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>🌸</Text>
                            <Text style={styles.emptyTitle}>
                                {t('A Rest Day')}
                            </Text>
                            <Text style={styles.emptyText}>
                                {t('Based on your current condition, no exercise is recommended today. Rest and hydration are important.')}
                            </Text>
                        </View>
                    )}
                    
                    {safetyStatus === 'blocked' && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>🩺</Text>
                            <Text style={styles.emptyTitle}>
                                {t('Medical Advice Needed')}
                            </Text>
                            <Text style={styles.emptyText}>
                                {t('Please consult your doctor before starting any exercise.')}
                            </Text>
                        </View>
                    )}
                    
                    {!showForm && hasData && (
                        <TouchableOpacity
                            style={styles.addDataBtn}
                            onPress={() => setShowForm(true)}
                        >
                            <Text style={styles.addDataBtnText}>
                                {t('+ Enter New Health Data')}
                            </Text>
                        </TouchableOpacity>
                    )}
                    
                    <View style={{ height: 40 }} />
                </ScrollView>
            </LinearGradient>

            {/* Health Condition Change Prompt Modal */}
            <Modal visible={showHealthPromptModal} transparent animationType="fade" onRequestClose={() => setShowHealthPromptModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.promptModalContent}>
                        <Text style={styles.promptEmoji}>🩺</Text>
                        <Text style={styles.promptTitle}>
                            {isSinhala ? 'සෞඛ්‍ය තත්ත්වය වෙනස් කරනවාද?' : 'Change Health Condition?'}
                        </Text>
                        <Text style={styles.promptSubtitle}>
                            {isSinhala 
                                ? 'අද දින සඳහා ඔබේ සෞඛ්‍ය තත්ත්වයේ යම් වෙනසක් සිදුවී ඇත්ද?' 
                                : 'Would you like to update your health condition for today before viewing exercises?'}
                        </Text>
                        
                        <View style={styles.promptBtnRow}>
                            <TouchableOpacity 
                                style={[styles.promptBtn, styles.thumbsUpBtn]} 
                                onPress={() => {
                                    setShowForm(true);
                                    setShowHealthPromptModal(false);
                                    setTimeout(() => {
                                        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                                    }, 100);
                                }}
                            >
                                <Text style={styles.promptBtnEmoji}>👍</Text>
                                <Text style={styles.promptBtnTextActive}>
                                    {isSinhala ? 'ඔව්, වෙනස් කරන්න' : 'Yes, Update Form'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.promptBtn, styles.thumbsDownBtn]} 
                                onPress={() => {
                                    setShowForm(false);
                                    setShowHealthPromptModal(false);
                                    setTimeout(() => {
                                        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                                    }, 100);
                                }}
                            >
                                <Text style={styles.promptBtnEmoji}>👎</Text>
                                <Text style={styles.promptBtnText}>
                                    {isSinhala ? 'නැත, වීඩියෝ පෙන්වන්න' : 'No, Show Exercises'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Toast />
        </SafeAreaView>
    );
}

// Keep all existing styles as they are (they remain unchanged)
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

    // Progress
    progressContainer: {
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 28,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#a18cd1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
    },
    progressTitle: { fontSize: 20, fontWeight: '800', color: '#334155', marginBottom: 14 },
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
    chartContainer: { marginTop: 16 },
    chartTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 12 },
    barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100 },
    barItem: { alignItems: 'center', width: 35 },
    bar: { width: 24, backgroundColor: '#a18cd1', borderRadius: 6, marginBottom: 8, minHeight: 4 },
    barLabel: { fontSize: 9, color: '#6B7280' },

    // Safety
    safetyBlocked: {
        backgroundColor: '#FEE2E2',
        borderRadius: 28,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EF4444',
        elevation: 2,
        shadowColor: '#EF4444',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
    },
    safetyLimited: {
        backgroundColor: '#FEF3C7',
        borderRadius: 28,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F59E0B',
        elevation: 2,
        shadowColor: '#F59E0B',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
    },
    safetySafe: {
        backgroundColor: '#D1FAE5',
        borderRadius: 28,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#10B981',
        elevation: 2,
        shadowColor: '#10B981',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
    },
    safetyIcon: { fontSize: 36, marginBottom: 8 },
    safetyTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
    safetyMessage: { fontSize: 14, color: '#374151', textAlign: 'center', marginBottom: 8, lineHeight: 20 },
    safetySubtext: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
    safetyAdvice: { fontSize: 13, fontWeight: '700', color: '#EF4444' },

    // Form
    formContainer: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 32,
        padding: 24,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#a18cd1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
    },
    formTitle: { fontSize: 20, fontWeight: '800', color: '#334155', marginBottom: 18 },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
    input: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 14,
        fontSize: 14,
        backgroundColor: '#F1F5F9',
        color: '#1F2937',
    },
    rowButtons: { flexDirection: 'row', gap: 10 },
    columnButtons: { gap: 8 },
    optionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    optionBtnWide: {
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    optionBtnActive: { backgroundColor: '#a18cd1', borderColor: '#a18cd1' },
    optionText: { fontSize: 14, color: '#334155', fontWeight: '600' },
    optionTextActive: { color: '#fff', fontWeight: '700' },
    checkboxGroup: { marginBottom: 12 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 12,
        backgroundColor: '#fff',
    },
    checkboxChecked: { backgroundColor: '#a18cd1', borderColor: '#a18cd1' },
    checkboxLabel: { fontSize: 14, color: '#334155', fontWeight: '500' },
    submitBtn: {
        backgroundColor: '#a18cd1',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
        shadowColor: '#a18cd1',
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { height: 4, width: 0 },
    },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    // Exercise Cards
    recommendationsContainer: { marginBottom: 16 },
    recommendationsTitle: { fontSize: 20, fontWeight: '800', color: '#334155', marginBottom: 14 },
    exerciseCard: {
        borderRadius: 28,
        padding: 20,
        marginBottom: 14,
        elevation: 3,
        shadowColor: '#a18cd1',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    thumbnailContainer: {
        width: '100%',
        height: 160,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 12,
        position: 'relative',
        backgroundColor: '#000'
    },
    cardThumbnail: {
        width: '100%',
        height: '100%',
    },
    thumbnailPlayOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.15)'
    },
    playOverlayIcon: {
        fontSize: 36,
        color: '#fff',
    },
    exerciseCardCompleted: { opacity: 0.82 },
    exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    exerciseIcon: { fontSize: 34, marginRight: 14 },
    exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
    exerciseMeta: { fontSize: 12, color: '#64748B', marginTop: 3 },
    completeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#a18cd1',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#a18cd1',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { height: 3, width: 0 },
    },
    completeBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    completedBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
    },
    completedBadgeText: { fontSize: 12, color: '#fff', fontWeight: '700' },
    progressBadge: {
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressBadgeText: {
        color: '#7C3AED',
        fontSize: 12,
        fontWeight: '700',
    },
    exerciseDesc: { fontSize: 13, color: '#64748B', marginBottom: 12, lineHeight: 20 },
    stepsContainer: { marginBottom: 12 },
    stepsTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
    stepText: { fontSize: 12, color: '#64748B', marginLeft: 8, marginBottom: 3, lineHeight: 18 },

    // Video
    watchVideoBtn: {
        backgroundColor: '#a18cd1',
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
        shadowColor: '#a18cd1',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
    },
    watchVideoBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
    videoBtn: {
        backgroundColor: '#F1F5F9',
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    videoBtnText: { fontSize: 14, color: '#a18cd1', fontWeight: '700' },

    // Video Modal
    videoModalContent: { backgroundColor: '#fff', borderRadius: 32, padding: 24, width: width - 40, alignItems: 'center', maxHeight: '90%' },
    videoPlayer: { width: width - 80, height: 220, borderRadius: 16, marginBottom: 16, backgroundColor: '#000' },
    videoPlayerCentered: { justifyContent: 'center', alignItems: 'center' },
    videoControls: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
    playBtn: { backgroundColor: '#a18cd1', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
    playBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    videoList: { width: '100%', maxHeight: 400 },
    videoOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
    },
    videoOptionIcon: { fontSize: 24, marginRight: 12 },
    videoOptionInfo: { flex: 1 },
    videoOptionTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    videoOptionDuration: { fontSize: 11, color: '#64748B', marginTop: 2 },
    videoOptionArrow: { fontSize: 18, color: '#9CA3AF' },
    backToVideoList: { alignSelf: 'flex-start', marginBottom: 12 },
    backToVideoListText: { fontSize: 14, color: '#a18cd1', fontWeight: '700' },
    videoTitle: { fontSize: 14, color: '#334155', textAlign: 'center', marginBottom: 12, fontWeight: '600' },

    // WebView
    webView: { flex: 1 },
    webViewLoadingContainer: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#000', zIndex: 10,
    },
    webViewErrorContainer: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#000', zIndex: 10,
    },
    webViewErrorText: { color: '#fff', fontSize: 14, marginBottom: 15 },
    webViewRetryBtn: { backgroundColor: '#a18cd1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    webViewRetryBtnText: { color: '#fff', fontWeight: '700' },

    // Empty State
    emptyContainer: {
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 32,
        padding: 36,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#a18cd1',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { height: 4, width: 0 },
    },
    emptyEmoji: { fontSize: 52, marginBottom: 16 },
    emptyTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },

    // Add Data Button
    addDataBtn: {
        backgroundColor: 'rgba(161,140,209,0.08)',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#a18cd1',
        borderStyle: 'dashed',
        marginBottom: 16,
    },
    addDataBtnText: { fontSize: 14, color: '#a18cd1', fontWeight: '700' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', borderRadius: 32, padding: 24, width: width - 40, maxHeight: '80%' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8, textAlign: 'center' },
    modalSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 16, textAlign: 'center' },
    videoPreview: { width: '100%', height: 200, borderRadius: 16, marginBottom: 16 },
    pickVideoBtn: { backgroundColor: '#a18cd1', padding: 14, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
    pickVideoBtnText: { color: '#fff', fontWeight: '700' },
    modalCloseBtn: { alignItems: 'center', padding: 12 },
    modalCloseText: { color: '#64748B', fontSize: 14, fontWeight: '600' },

    // Feedback Modal Styles
    feedbackModalContent: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 26,
        alignItems: 'center',
        width: width - 50,
        elevation: 6,
        shadowColor: '#a18cd1',
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { height: 6, width: 0 },
    },
    feedbackEmojiTitle: { fontSize: 42, marginBottom: 10 },
    feedbackTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
    feedbackSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20, paddingHorizontal: 10 },
    ratingRow: { flexDirection: 'row', gap: 14, marginBottom: 22 },
    ratingBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    ratingEmoji: { fontSize: 26 },
    feedbackSkipBtn: { paddingVertical: 10, paddingHorizontal: 20 },
    feedbackSkipText: { color: '#94A3B8', fontWeight: '600', fontSize: 14 },

    // Tab Switcher Styles
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        padding: 4,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    tabButtonActive: {
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    tabTextActive: {
        color: '#7C3AED',
        fontWeight: '800',
    },

    // Small Empty State
    emptyContainerSmall: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    emptyTitleSmall: {
        fontSize: 15,
        fontWeight: '800',
        color: '#475569',
        marginBottom: 4,
    },
    emptyTextSmall: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
    },
    // Survey and Stopwatch Styles
    stopwatchContainer: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 16,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    stopwatchLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 4,
    },
    stopwatchDisplay: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: 2,
        marginBottom: 12,
    },
    stopwatchRow: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    controlBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startBtn: {
        backgroundColor: '#10B981',
    },
    pauseBtn: {
        backgroundColor: '#F59E0B',
    },
    stopBtn: {
        backgroundColor: '#EF4444',
    },
    controlBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
    },
    questionsModalContent: {
        backgroundColor: '#FFF',
        borderRadius: 32,
        padding: 24,
        width: width - 40,
        alignItems: 'stretch',
    },
    questionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
        marginTop: 14,
        marginBottom: 8,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    surveyBtn: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    surveyBtnActive: {
        borderColor: '#7C3AED',
        backgroundColor: '#F5F3FF',
    },
    surveyBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    surveyBtnTextActive: {
        color: '#7C3AED',
        fontWeight: '800',
    },
    submitSurveyBtn: {
        backgroundColor: '#7C3AED',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    submitSurveyBtnText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 15,
    },
    resultsModalContent: {
        backgroundColor: '#FFF',
        borderRadius: 32,
        padding: 24,
        width: width - 40,
        alignItems: 'center',
    },
    resultsInfoBlock: {
        width: '100%',
        marginVertical: 16,
    },
    resultsRowText: {
        fontSize: 14,
        color: '#475569',
        marginVertical: 4,
    },
    dividerLine: {
        height: 1.5,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
    },
    resultsFeedbackTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 6,
    },
    resultsFeedbackText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        fontStyle: 'italic',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    resultsCloseBtn: {
        backgroundColor: '#7C3AED',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
    },
    resultsCloseBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15,
    },
    viewProgressBtn: {
        marginHorizontal: 20,
        marginVertical: 14,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#7C3AED',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    viewProgressBtnGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        gap: 14,
    },
    viewProgressBtnEmoji: {
        fontSize: 28,
        color: '#FFF',
    },
    viewProgressBtnTitle: {
        fontSize: 15,
        fontWeight: '900',
        color: '#FFF',
    },
    viewProgressBtnSub: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.85)',
        marginTop: 2,
    },
    promptModalContent: {
        backgroundColor: '#FFF',
        borderRadius: 32,
        padding: 24,
        width: width - 40,
        alignItems: 'center',
        elevation: 5,
    },
    promptEmoji: {
        fontSize: 44,
        marginBottom: 10,
    },
    promptTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
        marginBottom: 8,
        textAlign: 'center',
    },
    promptSubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },
    promptBtnRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    promptBtn: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    thumbsUpBtn: {
        backgroundColor: '#F5F3FF',
        borderColor: '#7C3AED',
    },
    thumbsDownBtn: {
        backgroundColor: '#F8FAFC',
        borderColor: '#CBD5E1',
    },
    promptBtnEmoji: {
        fontSize: 26,
        marginBottom: 4,
    },
    promptBtnTextActive: {
        color: '#7C3AED',
        fontWeight: '800',
        fontSize: 12,
        textAlign: 'center',
    },
    promptBtnText: {
        color: '#64748B',
        fontWeight: '700',
        fontSize: 12,
        textAlign: 'center',
    },
    playIconButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#7C3AED',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        elevation: 3,
        shadowColor: '#7C3AED',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { height: 2, width: 0 },
    },
    playIconText: {
        fontSize: 16,
        color: '#FFF',
    },
});