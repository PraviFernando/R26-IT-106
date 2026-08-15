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

const getTranslatedFeedback = (feedback, isSinhala) => {
    if (!feedback) return '';
    if (!isSinhala) return feedback;

    const translations = {
        "You felt pain during exercise. Please rest. Tomorrow's exercises will be adjusted to lower intensity.": "ව්‍යායාම අතරතුර ඔබට වේදනාවක් දැනුණි. කරුණාකර විවේක ගන්න. හෙට දින ව්‍යායාම අඩු තීව්‍රතාවයකට සකස් කරනු ඇත.",
        "You may be experiencing fatigue. Tomorrow’s exercises will be adjusted to lower intensity.": "ඔබට තෙහෙට්ටුවක් දැනෙන්නට පුළුවන. හෙට දින ව්‍යායාම අඩු තීව්‍රතාවයකට සකස් කරනු ඇත.",
        "Excellent progress. You may continue with the current exercise plan.": "විශිෂ්ට ප්‍රගතියක්. ඔබට වත්මන් ව්‍යායාම සැලැස්ම සමඟ දිගටම කටයුතු කළ හැකිය."
    };

    return translations[feedback.trim()] || feedback;
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
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language === 'si';

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
            Toast.show({ type: 'error', text1: isSinhala ? 'කරුණාකර ප්‍රසූතියෙන් පසු ගතවූ සති ගණන ඇතුළත් කරන්න' : 'Please enter weeks after delivery' });
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
            {/* Form header */}
            <View style={styles.formHeaderRow}>
                <Text style={styles.formHeaderEmoji}>🩺</Text>
                <View style={{ flex: 1 }}>
                    <Text style={styles.formTitle}>
                        {isSinhala ? 'අද දින සෞඛ්‍ය තත්ත්වය' : "Today's Health Status"}
                    </Text>
                    <Text style={styles.formSubtitle}>
                        {isSinhala ? 'ඔබට වඩාත් ගැලපෙන ව්‍යායාම සැලසුම් කිරීමට උදවු වන්න' : 'Help us plan the exercises that suit you best'}
                    </Text>
                </View>
            </View>

            {/* Section: Delivery Info */}
            <View style={styles.formSection}>
                <Text style={styles.formSectionLabel}>{isSinhala ? '📅 දරු ප්‍රසූතිය පිළිබඳ තොරතුරු' : '📅 Delivery Information'}</Text>

                {(!user?.deliveryDate) && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            {isSinhala ? 'දරු ප්‍රසූත දිනය (YYYY-MM-DD)' : 'Delivery Date (YYYY-MM-DD)'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder={isSinhala ? 'උදා: 2024-05-10' : 'e.g. 2024-05-10'}
                            value={deliveryDate}
                            onChangeText={setDeliveryDate}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        {isSinhala ? 'දරු ප්‍රසූතියෙන් පසු ගතවූ සති ගණන' : 'Weeks After Delivery'}
                    </Text>
                    <TextInput
                        style={[styles.input, deliveryDate ? { backgroundColor: '#F3F4F6', color: '#6B7280' } : {}]}
                        placeholder={isSinhala ? 'උදා: 4' : 'e.g. 4'}
                        keyboardType="numeric"
                        value={String(weeks)}
                        onChangeText={setWeeks}
                        editable={!deliveryDate}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{isSinhala ? 'දරු ප්‍රසූති ක්‍රමය' : 'Delivery Method'}</Text>
                    <View style={styles.rowButtons}>
                        <TouchableOpacity
                            style={[styles.optionBtn, deliveryType === 'normal' && styles.optionBtnActive]}
                            onPress={() => setDeliveryType('normal')}
                        >
                            <Text style={[styles.optionText, deliveryType === 'normal' && styles.optionTextActive]}>
                                {isSinhala ? '🤱 සාමාන්‍ය' : '🤱 Normal'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.optionBtn, deliveryType === 'c-section' && styles.optionBtnActive]}
                            onPress={() => setDeliveryType('c-section')}
                        >
                            <Text style={[styles.optionText, deliveryType === 'c-section' && styles.optionTextActive]}>
                                {isSinhala ? '🏥 සිසේරියන්' : '🏥 C-Section'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Section: Pain Conditions */}
            <View style={styles.formSection}>
                <Text style={styles.formSectionLabel}>{isSinhala ? '⚡ වේදනා තත්ත්වයන්' : '⚡ Pain Conditions'}</Text>
                <View style={styles.checkboxGroup}>
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setPelvicPain(!pelvicPain)}>
                        <View style={[styles.checkbox, pelvicPain && styles.checkboxChecked]}>
                            {pelvicPain && <Text style={styles.checkboxTick}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>{isSinhala ? 'ශ්‍රෝණි වේදනාව (Pelvic Pain)' : 'Pelvic Pain'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setBackPain(!backPain)}>
                        <View style={[styles.checkbox, backPain && styles.checkboxChecked]}>
                            {backPain && <Text style={styles.checkboxTick}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>{isSinhala ? 'කොන්දේ අමාරුව (Back Pain)' : 'Back Pain'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setAbdominalPain(!abdominalPain)}>
                        <View style={[styles.checkbox, abdominalPain && styles.checkboxChecked]}>
                            {abdominalPain && <Text style={styles.checkboxTick}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>{isSinhala ? 'උදර වේදනාව (Abdominal Pain)' : 'Abdominal Pain'}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Section: Other Health Flags */}
            <View style={styles.formSection}>
                <Text style={styles.formSectionLabel}>{isSinhala ? '🚩 වෙනත් සෞඛ්‍ය ගැටළු' : '🚩 Other Health Conditions'}</Text>
                <View style={styles.checkboxGroup}>
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setBleeding(!bleeding)}>
                        <View style={[styles.checkbox, bleeding && styles.checkboxChecked]}>
                            {bleeding && <Text style={styles.checkboxTick}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>{isSinhala ? 'ලේ ගැලීමේ සංකූලතා' : 'Bleeding Complications'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setDoctorRestrictions(!doctorRestrictions)}>
                        <View style={[styles.checkbox, doctorRestrictions && styles.checkboxChecked]}>
                            {doctorRestrictions && <Text style={styles.checkboxTick}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>{isSinhala ? 'වෛද්‍ය සීමාවන්' : 'Medical Restrictions'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setMuscleWeakness(!muscleWeakness)}>
                        <View style={[styles.checkbox, muscleWeakness && styles.checkboxChecked]}>
                            {muscleWeakness && <Text style={styles.checkboxTick}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>{isSinhala ? 'මාංශ පේෂී දුර්වලතාවය' : 'Muscle Weakness'}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Section: Energy & Mobility */}
            <View style={styles.formSection}>
                <Text style={styles.formSectionLabel}>{isSinhala ? '⚡ ශක්තිය සහ චලන හැකියාව' : '⚡ Energy & Mobility'}</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{isSinhala ? 'තෙහෙට්ටුව මට්ටම' : 'Fatigue Level'}</Text>
                    <View style={styles.rowButtons}>
                        {['low', 'medium', 'high'].map(level => (
                            <TouchableOpacity
                                key={level}
                                style={[styles.optionBtn, fatigue === level && styles.optionBtnActive]}
                                onPress={() => setFatigue(level)}
                            >
                                <Text style={[styles.optionText, fatigue === level && styles.optionTextActive]}>
                                    {level === 'low' ? (isSinhala ? '😊 අඩුයි' : '😊 Low') : level === 'medium' ? (isSinhala ? '😐 මධ්‍යම' : '😐 Medium') : (isSinhala ? '😩 වැඩියි' : '😩 High')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{isSinhala ? 'චලන හැකියාව' : 'Mobility Level'}</Text>
                    <View style={styles.columnButtons}>
                        {['very_limited', 'limited', 'normal'].map(level => (
                            <TouchableOpacity
                                key={level}
                                style={[styles.optionBtnWide, mobility === level && styles.optionBtnActive]}
                                onPress={() => setMobility(level)}
                            >
                                <Text style={[styles.optionText, mobility === level && styles.optionTextActive]}>
                                    {level === 'very_limited' ? (isSinhala ? '🦽 ඉතා සීමිතයි' : '🦽 Very Limited') : level === 'limited' ? (isSinhala ? '🚶 සීමිතයි' : '🚶 Limited') : (isSinhala ? '🏃 සාමාන්‍යයි' : '🏃 Normal')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{isSinhala ? 'ව්‍යායාම කිරීමට ඇති කැමැත්ත' : 'Willingness to Exercise'}</Text>
                    <View style={styles.rowButtons}>
                        {['low', 'medium', 'high'].map(level => (
                            <TouchableOpacity
                                key={level}
                                style={[styles.optionBtn, willingness === level && styles.optionBtnActive]}
                                onPress={() => setWillingness(level)}
                            >
                                <Text style={[styles.optionText, willingness === level && styles.optionTextActive]}>
                                    {level === 'low' ? (isSinhala ? '😴 අඩුයි' : '😴 Low') : level === 'medium' ? (isSinhala ? '🙂 මධ්‍යම' : '🙂 Medium') : (isSinhala ? '💪 වැඩියි' : '💪 High')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Submit button */}
            <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={loading ? ['#F3E8FF', '#E9D5FF'] : ['#F3E8FF', '#E9D5FF']}
                    style={styles.submitBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.submitBtnEmoji}>✨</Text>
                            <Text style={styles.submitBtnText}>
                                {isSinhala ? 'ව්‍යායාම නිර්දේශ ලබා ගන්න' : 'Get Exercise Recommendations'}
                            </Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 24 }} />
        </ScrollView>
    );
};

// Exercise Recommendation Card Component
const ExerciseCard = ({ exercise, onComplete, onUploadVideo, isCompleted, onProgressUpdate }) => {
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language === 'si';
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
    const channelName = isSinhala
        ? "ප්‍රසූති ව්‍යායාම නාලිකාව"
        : (isYoutubeCard ? (exercise.channelTitle || "Pregnancy & Postpartum TV") : "Pregnancy & Postpartum TV");

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
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;

    const videoList = isYoutubeCard
        ? [{ url: videoUrl, title: title, duration: `${duration} ${t('min')}`, source: "YouTube" }]
        : (details.videos || (details.videoUrl ? [{ url: details.videoUrl, title: details.name, titleSi: details.nameSi, duration: `${details.duration} ${t('min')}`, source: "YouTube" }] : []));

    const getExerciseIcon = (type) => {
        switch (type) {
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
                activeOpacity={0.9}
                onPress={handleCardPress}
                disabled={videoList.length === 0}
            >
                <View style={[styles.exerciseCard, isCompleted && styles.exerciseCardCompleted]}>
                    <View style={styles.thumbnailContainer}>
                        {thumbnailUrl ? (
                            <Image source={{ uri: thumbnailUrl }} style={styles.cardThumbnail} resizeMode="cover" />
                        ) : (
                            <View style={styles.thumbnailPlaceholder}>
                                <Text style={{ fontSize: 44 }}>▶️</Text>
                            </View>
                        )}
                        <View style={styles.durationBadge}>
                            <Text style={styles.durationBadgeText}>
                                {String(duration).includes(':') ? duration : `${duration}:00`}
                            </Text>
                        </View>
                        {watchPercentage > 0 && !isCompleted && (
                            <View style={[styles.progressBar, { width: `${watchPercentage}%` }]} />
                        )}
                    </View>

                    <View style={styles.cardDetailsRow}>
                        <View style={styles.cardTextContainer}>
                        </View>
                        <View style={styles.menuContainer}>
                            {isCompleted ? (
                                <Text style={styles.completedCheck}>✓</Text>
                            ) : (
                                <Text style={styles.menuIcon}>⋮</Text>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Video Modal with Stopwatch */}
            <Modal visible={videoModal} transparent animationType="slide" onRequestClose={handleCloseVideoModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.videoModalContent}>
                        <View style={styles.modalTitleContainer}>
                            <Text style={styles.modalTitleText}>
                                {isSinhala
                                    ? '✨ වීඩියෝව නරඹන අතරතුර, මෙම කාල ගණකය මඟින් ඔබේ ව්‍යායාම කාලයද පහසුවෙන්ම මැන ගන්න!'
                                    : '✨ Don\'t just watch! Track your actual exercise duration simultaneously using the stopwatch!'}
                            </Text>
                        </View>

                        {selectedVideo && (
                            <View style={styles.modalSplitRow}>
                                <View style={styles.modalLeftColumn}>
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
                                </View>

                                <View style={styles.modalRightColumn}>
                                    {/* Stopwatch UI */}
                                    <View style={styles.stopwatchContainer}>
                                        <Text style={styles.stopwatchLabel}>{isSinhala ? '⏱️ කාල ගණකය' : '⏱️ Stopwatch'}</Text>
                                        <Text style={styles.stopwatchDisplay}>{formatTime(stopwatchTime)}</Text>
                                        <View style={styles.stopwatchRow}>
                                            <View style={styles.controlBtnWrapper}>
                                                {!isStopwatchRunning ? (
                                                    <TouchableOpacity style={[styles.controlCircleBtn, { backgroundColor: '#E8F5E9' }]} onPress={startStopwatch}>
                                                        <View style={{
                                                            width: 0,
                                                            height: 0,
                                                            backgroundColor: 'transparent',
                                                            borderStyle: 'solid',
                                                            borderLeftWidth: 16,
                                                            borderRightWidth: 0,
                                                            borderBottomWidth: 10,
                                                            borderTopWidth: 10,
                                                            borderLeftColor: '#2E7D32',
                                                            borderRightColor: 'transparent',
                                                            borderBottomColor: 'transparent',
                                                            borderTopColor: 'transparent',
                                                            marginLeft: 4,
                                                        }} />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <TouchableOpacity style={[styles.controlCircleBtn, { backgroundColor: '#FFF3E0' }]} onPress={pauseStopwatch}>
                                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                                            <View style={{ width: 6, height: 20, backgroundColor: '#EF6C00', borderRadius: 2 }} />
                                                            <View style={{ width: 6, height: 20, backgroundColor: '#EF6C00', borderRadius: 2 }} />
                                                        </View>
                                                    </TouchableOpacity>
                                                )}
                                                <Text style={styles.controlLabelText}>
                                                    {!isStopwatchRunning ? (isSinhala ? 'ආරම්භ කරන්න' : 'Start') : (isSinhala ? 'නවතන්න' : 'Pause')}
                                                </Text>
                                            </View>

                                            <View style={styles.controlBtnWrapper}>
                                                <TouchableOpacity style={[styles.controlCircleBtn, { backgroundColor: '#FFEBEE' }]} onPress={stopStopwatch}>
                                                    <View style={{ width: 18, height: 18, backgroundColor: '#C62828', borderRadius: 4 }} />
                                                </TouchableOpacity>
                                                <Text style={styles.controlLabelText}>
                                                    {isSinhala ? 'පිටවෙන්න' : 'Quit'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
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
                        <Text style={styles.feedbackTitle}>{isSinhala ? 'ව්‍යායාමයෙන් පසු ඇගයීම' : 'Post-Exercise Survey'}</Text>
                        <Text style={styles.feedbackSubtitle}>{isSinhala ? 'අද දින සැසිය ඇගයීම සඳහා මෙම සරල ප්‍රශ්න 3ට පිළිතුරු දෙන්න:' : "Please answer these 3 simple questions to evaluate today's session:"}</Text>

                        {/* Question 1: Pain */}
                        <Text style={styles.questionText}>{isSinhala ? '1. ව්‍යායාම අතරතුර ඔබට වේදනාවක් දැනුණාද?' : '1. Did you feel pain during exercise?'}</Text>
                        <View style={styles.btnRow}>
                            {['Yes', 'No'].map(ans => (
                                <TouchableOpacity
                                    key={ans}
                                    style={[styles.surveyBtn, painRating === ans && styles.surveyBtnActive]}
                                    onPress={() => setPainRating(ans)}
                                >
                                    <Text style={[styles.surveyBtnText, painRating === ans && styles.surveyBtnTextActive]}>
                                        {isSinhala ? (ans === 'Yes' ? 'ඔව්' : 'නැත') : ans}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Question 2: Difficulty */}
                        <Text style={styles.questionText}>{isSinhala ? '2. ව්‍යායාමය කෙතරම් අපහසු වීද?' : '2. How difficult was the exercise?'}</Text>
                        <View style={styles.btnRow}>
                            {['Easy', 'Moderate', 'Hard'].map(ans => (
                                <TouchableOpacity
                                    key={ans}
                                    style={[styles.surveyBtn, difficultyRating === ans && styles.surveyBtnActive]}
                                    onPress={() => setDifficultyRating(ans)}
                                >
                                    <Text style={[styles.surveyBtnText, difficultyRating === ans && styles.surveyBtnTextActive]}>
                                        {isSinhala ? (ans === 'Easy' ? 'පහසුයි' : ans === 'Moderate' ? 'මධ්‍යම' : 'අපහසුයි') : ans}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Question 3: Feeling */}
                        <Text style={styles.questionText}>{isSinhala ? '3. ව්‍යායාමයෙන් පසු ඔබට දැනෙන්නේ කෙසේද?' : '3. How do you feel after exercise?'}</Text>
                        <View style={styles.btnRow}>
                            {['Better', 'Same', 'Tired'].map(ans => (
                                <TouchableOpacity
                                    key={ans}
                                    style={[styles.surveyBtn, feelingRating === ans && styles.surveyBtnActive]}
                                    onPress={() => setFeelingRating(ans)}
                                >
                                    <Text style={[styles.surveyBtnText, feelingRating === ans && styles.surveyBtnTextActive]}>
                                        {isSinhala ? (ans === 'Better' ? 'සුවදායකයි' : ans === 'Same' ? 'වෙනසක් නැත' : 'තෙහෙට්ටුයි') : ans}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.submitSurveyBtn, (!painRating || !difficultyRating || !feelingRating) && { opacity: 0.5 }]}
                            disabled={!painRating || !difficultyRating || !feelingRating}
                            onPress={submitFeedbackQuestions}
                        >
                            <Text style={styles.submitSurveyBtnText}>{isSinhala ? 'තොරතුරු ඇතුළත් කරන්න' : 'Submit & Get Feedback'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Smart Completion Results Modal */}
            <Modal visible={showResultsModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.resultsModalContent}>
                        <Text style={styles.feedbackEmojiTitle}>📊</Text>
                        <Text style={styles.feedbackTitle}>{isSinhala ? 'ව්‍යායාම සැසියේ සාරාංශය' : 'Session Summary'}</Text>

                        {results && (
                            <View style={styles.resultsInfoBlock}>
                                <Text style={styles.resultsRowText}>
                                    {isSinhala ? '⏱️ නිර්දේශිත කාලය: ' : '⏱️ Recommended Duration: '}
                                    <Text style={{ fontWeight: '800' }}>{results.recommendedDuration} {isSinhala ? 'විනාඩි' : 'mins'}</Text>
                                </Text>
                                <Text style={styles.resultsRowText}>
                                    {isSinhala ? '⏱️ සැබෑ ව්‍යායාම කාලය: ' : '⏱️ Actual Workout Duration: '}
                                    <Text style={{ fontWeight: '800' }}>{results.actualDuration} {isSinhala ? 'විනාඩි' : 'mins'}</Text>
                                </Text>
                                <Text style={styles.resultsRowText}>
                                    {isSinhala ? '📈 අනුකූලතා ලකුණු: ' : '📈 Adherence Score: '}
                                    <Text style={{ fontWeight: '800', color: '#7C3AED' }}>{results.adherenceScore}%</Text>
                                </Text>

                                <View style={styles.dividerLine} />

                                <Text style={styles.resultsFeedbackTitle}>{isSinhala ? 'පද්ධති ස්වයංක්‍රීය ප්‍රතිචාරය:' : 'System Adaptation:'}</Text>
                                <Text style={styles.resultsFeedbackText}>"{getTranslatedFeedback(results.intelligentFeedback, isSinhala)}"</Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.resultsCloseBtn} onPress={() => setShowResultsModal(false)}>
                            <Text style={styles.resultsCloseBtnText}>{isSinhala ? 'අවසන්' : 'Done'}</Text>
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
                    <Text style={styles.statLabel}>🔥 {t('Current Streak')}</Text>
                </LinearGradient>
                <LinearGradient colors={['#fbc2eb', '#a6c1ee']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.statValue}>{progress.missedSessions ?? 0}</Text>
                    <Text style={styles.statLabel}>⚠️ {t('Missed (7d)')}</Text>
                </LinearGradient>
                <LinearGradient colors={['#84fab0', '#8fd3f4']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.statValue}>{progress.weeklyCompletionRate ?? 0}%</Text>
                    <Text style={styles.statLabel}>📊 {t('Weekly Rate')}</Text>
                </LinearGradient>
            </View>

            <View style={[styles.statsGrid, { marginTop: 10 }]}>
                <LinearGradient colors={['#a1c4fd', '#c2e9fb']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.statValue}>{progress.averageDuration ?? 0}m</Text>
                    <Text style={styles.statLabel}>⏱️ {t('Avg Duration')}</Text>
                </LinearGradient>
                <LinearGradient colors={['#f6d365', '#fda085']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.statValue}>{progress.totalExercises}</Text>
                    <Text style={styles.statLabel}>🏋️ {t('Total Completed')}</Text>
                </LinearGradient>
            </View>

            {progress.recoveryTrend && (
                <View style={{ marginTop: 14, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 18, borderLeftWidth: 4, borderLeftColor: '#7C3AED' }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#1E293B', marginBottom: 2 }}>🩺 {t('Recovery Trend Analysis')}</Text>
                    <Text style={{ fontSize: 12, color: '#475569', lineHeight: 16 }}>{t(progress.recoveryTrend)}</Text>
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
            <View style={[styles.safetyWarningRow, styles.safetyBlocked]}>
                <Text style={styles.safetyIconRow}>⚠️</Text>
                <View style={{ flex: 1 }}>
                    <Text style={styles.safetyTitleRow}>{t('Warning')}</Text>
                    <Text style={styles.safetyMessageRow}>{message}</Text>
                </View>
            </View>
        );
    }

    if (safetyStatus === 'limited') {
        return (
            <View style={[styles.safetyWarningRow, styles.safetyLimited]}>
                <Text style={styles.safetyIconRow}>⚠️</Text>
                <View style={{ flex: 1 }}>
                    <Text style={styles.safetyTitleRow}>{t('Limited Exercise')}</Text>
                    <Text style={styles.safetyMessageRow}>{message}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.safetyWarningRow, styles.safetySafe]}>
            <Text style={styles.safetyIconRow}>✅</Text>
            <View style={{ flex: 1 }}>
                <Text style={styles.safetyTitleRow}>{t('Safe')}</Text>
                <Text style={styles.safetyMessageRow}>{message}</Text>
            </View>
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
            <LinearGradient colors={['#F7F3FF', '#FDFBFF', '#EBE0FF']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <View style={styles.backCircle}>
                            <Text style={styles.backIcon}>←</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerEmoji}>🏃‍♀️</Text>
                        <Text style={styles.headerTitle}>
                            {t('Postpartum Exercise')}
                        </Text>
                    </View>
                    <View style={styles.backBtnPlaceholder} />
                </View>
                <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {!(showForm || !hasData) && (
                        <TouchableOpacity
                            style={styles.viewProgressBtn}
                            onPress={() => navigation.navigate('Progress')}
                        >
                            <LinearGradient colors={['#FAF5FF', '#F3E8FF']} style={styles.viewProgressBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <Text style={styles.viewProgressBtnEmoji}>📊</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.viewProgressBtnTitle}>{isSinhala ? 'ඔබේ ප්‍රගතිය' : 'Your Progress'}</Text>
                                    <Text style={styles.viewProgressBtnSub}>
                                        {isSinhala 
                                            ? 'ක්‍රියාකාරකම්, අනුකූලතාවය සහ සුවය ලැබීමේ ප්‍රවණතා බලන්න →' 
                                            : 'View activities, consistency and recovery trends →'}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
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
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
                                        {recommendations.filter(rec => !rec.completed).slice(0, 5).map((rec, idx) => (
                                            <ExerciseCard
                                                key={idx}
                                                exercise={rec}
                                                onComplete={handleCompleteExercise}
                                                onUploadVideo={handleUploadVideo}
                                                isCompleted={rec.completed}
                                                onProgressUpdate={handleProgressUpdate}
                                            />
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View style={styles.emptyContainerSmall}>
                                        <Text style={styles.emptyTitleSmall}>🎉 {t('All Done!')}</Text>
                                        <Text style={styles.emptyTextSmall}>{t('You have completed all exercise recommendations for today.')}</Text>
                                    </View>
                                )
                            )}

                            {activeTab === 'completed' && (
                                recommendations.filter(rec => rec.completed).length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
                                        {recommendations.filter(rec => rec.completed).map((rec, idx) => (
                                            <ExerciseCard
                                                key={idx}
                                                exercise={rec}
                                                onComplete={handleCompleteExercise}
                                                onUploadVideo={handleUploadVideo}
                                                isCompleted={rec.completed}
                                                onProgressUpdate={handleProgressUpdate}
                                            />
                                        ))}
                                    </ScrollView>
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

const styles = StyleSheet.create({
    // Layout
    safe: { flex: 1, backgroundColor: '#F7F3FF' },
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
        elevation: 3, shadowColor: '#7C3AED', shadowOpacity: 0.1,
        shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    },
    backIcon: { fontSize: 20, color: '#7C3AED', fontWeight: '900' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
    headerEmoji: { fontSize: 24 },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    // Progress dashboard (inline on Exercise screen)
    progressContainer: {
        backgroundColor: '#FFF', borderRadius: 28, padding: 20, marginBottom: 16,
        elevation: 3, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06, shadowRadius: 16, borderWidth: 1,
        borderColor: 'rgba(124,58,237,0.05)',
    },
    progressTitle: { fontSize: 17, fontWeight: '900', color: '#1E293B', marginBottom: 14 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statBox: {
        flex: 1, borderRadius: 20, paddingVertical: 18, paddingHorizontal: 10,
        alignItems: 'center', minWidth: (width - 60) / 3, elevation: 2,
        shadowColor: '#7C3AED', shadowOpacity: 0.08, shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
    },
    statValue: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginTop: 4, textAlign: 'center' },

    // Safety banners
    safetyWarningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        width: '90%',
        alignSelf: 'center',
    },
    safetyBlocked: {
        backgroundColor: '#FFF1F2',
        borderColor: '#FDA4AF',
    },
    safetyLimited: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
    },
    safetySafe: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
    },
    safetyIconRow: {
        fontSize: 20,
        marginRight: 12,
    },
    safetyTitleRow: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    safetyMessageRow: {
        fontSize: 11,
        color: '#475569',
        marginTop: 1,
        lineHeight: 15,
    },

    // Health form
    formContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EDE9FE',
        width: '70%',
        alignSelf: 'center',
    },
    formHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    formHeaderEmoji: { fontSize: 24 },
    formTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 },
    formSubtitle: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },
    formSection: {
        backgroundColor: '#FAF5FF',
        borderRadius: 14,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EBE0FF',
    },
    formSectionLabel: { fontSize: 11, fontWeight: 'bold', color: '#7C3AED', marginBottom: 8, letterSpacing: 0.2 },

    inputGroup: { marginBottom: 10 },
    label: { fontSize: 11, fontWeight: '700', color: '#334155', marginBottom: 4 },
    input: {
        borderWidth: 1.2, borderColor: '#DDD6FE', borderRadius: 12,
        padding: 8, fontSize: 12, backgroundColor: '#FAFAF9', color: '#1E293B',
    },
    rowButtons: { flexDirection: 'row', gap: 6 },
    columnButtons: { gap: 4 },
    optionBtn: {
        flex: 1, paddingVertical: 7, borderRadius: 10,
        backgroundColor: '#FFF', alignItems: 'center',
        borderWidth: 1.2, borderColor: '#EDE9FE',
    },
    optionBtnWide: {
        paddingVertical: 7, borderRadius: 10,
        backgroundColor: '#FFF', alignItems: 'center',
        borderWidth: 1.2, borderColor: '#EDE9FE',
    },
    optionBtnActive: { backgroundColor: '#E9D5FF', borderColor: '#D8B4FE' },
    optionText: { fontSize: 11, color: '#475569', fontWeight: '600' },
    optionTextActive: { color: '#5B21B6', fontWeight: '800' },
    checkboxGroup: { marginBottom: 6 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    checkbox: {
        width: 18, height: 18, borderRadius: 5, borderWidth: 1.5,
        borderColor: '#DDD6FE', marginRight: 8, backgroundColor: '#FFF',
    },
    checkboxChecked: { backgroundColor: '#E9D5FF', borderColor: '#D8B4FE', alignItems: 'center', justifyContent: 'center' },
    checkboxTick: { color: '#5B21B6', fontSize: 10, fontWeight: '900' },
    checkboxLabel: { fontSize: 11, color: '#475569', fontWeight: '600' },
    submitBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 4,
    },
    submitBtnDisabled: { opacity: 0.65 },
    submitBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 14 },
    submitBtnEmoji: { fontSize: 14 },
    submitBtnText: { color: '#5B21B6', fontWeight: '800', fontSize: 12 },

    // Exercise plan banner
    planBanner: {
        borderRadius: 18, padding: 14, marginBottom: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1, borderColor: '#DDD6FE',
        width: '90%',
        alignSelf: 'center',
    },
    planBannerTitle: { fontSize: 13, fontWeight: 'bold', color: '#4C1D95', marginBottom: 2 },
    planBannerSub: { fontSize: 11, color: '#7C3AED', fontWeight: '600' },
    planBannerBadge: {
        backgroundColor: 'rgba(124, 58, 237, 0.08)', borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center',
    },
    planBannerBadgeText: { fontSize: 18, fontWeight: 'bold', color: '#4C1D95' },
    planBannerBadgeLabel: { fontSize: 9, color: '#7C3AED', fontWeight: '700', marginTop: 1 },

    // Exercise cards
    recommendationsContainer: { marginBottom: 16 },
    recommendationsTitle: { fontSize: 17, fontWeight: '900', color: '#1E293B', marginBottom: 14 },
    horizontalScrollContent: {
        paddingRight: 20,
    },
    exerciseCard: {
        backgroundColor: 'transparent',
        width: (width - 60) / 2.3,
        maxWidth: 400,
        marginRight: 14,
        marginBottom: 10,
    },
    thumbnailContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
        marginBottom: 8,
    },
    cardThumbnail: { width: '100%', height: '100%' },
    thumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 3,
    },
    durationBadgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: 'bold',
    },
    progressBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 3,
        backgroundColor: '#FF0000',
    },
    exerciseCardCompleted: {
        opacity: 0.6,
    },
    cardDetailsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 2,
    },
    channelAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F5F3FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        borderWidth: 1.5,
        borderColor: '#EDE9FE',
    },
    channelAvatarText: {
        fontSize: 14,
    },
    cardTextContainer: {
        flex: 1,
    },
    videoTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0F172A',
        lineHeight: 16,
        marginBottom: 2,
    },
    channelMetadata: {
        fontSize: 10,
        color: '#64748B',
        marginBottom: 1,
    },
    videoStats: {
        fontSize: 9,
        color: '#94A3B8',
    },
    menuContainer: {
        paddingHorizontal: 2,
        paddingVertical: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIcon: {
        fontSize: 16,
        color: '#64748B',
    },
    completedCheck: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10B981',
    },

    // Video modal
    videoModalContent: {
        backgroundColor: '#FFF', borderRadius: 0, padding: 24,
        width: '100%', height: '100%', maxHeight: '100%', alignItems: 'center',
        justifyContent: 'center',
        elevation: 8, shadowColor: '#7C3AED', shadowOpacity: 0.1,
        shadowRadius: 24, shadowOffset: { width: 0, height: 12 },
    },
    modalTitleContainer: {
        backgroundColor: '#F5F3FF',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: '#DDD6FE',
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    modalTitleText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#6D28D9',
        textAlign: 'center',
        lineHeight: 18,
    },
    videoPlayer: { width: '100%', height: width > 768 ? 420 : 250, borderRadius: 20, marginBottom: 16, backgroundColor: '#000' },
    videoPlayerCentered: { justifyContent: 'center', alignItems: 'center' },
    modalCloseBtn: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24 },
    modalCloseText: { color: '#64748B', fontSize: 14, fontWeight: '700' },
    webView: { flex: 1 },
    webViewLoadingContainer: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', zIndex: 10,
    },
    webViewErrorContainer: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', zIndex: 10,
    },
    webViewErrorText: { color: '#FFF', fontSize: 14, marginBottom: 15, textAlign: 'center' },
    webViewRetryBtn: {
        backgroundColor: '#7C3AED', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14,
    },
    webViewRetryBtnText: { color: '#FFF', fontWeight: '800' },

    // Empty states
    emptyContainer: {
        backgroundColor: '#FFF', borderRadius: 28, padding: 36, alignItems: 'center',
        marginBottom: 16, elevation: 3, shadowColor: '#7C3AED', shadowOpacity: 0.05,
        shadowRadius: 16, shadowOffset: { height: 6, width: 0 }, borderWidth: 1,
        borderColor: 'rgba(124,58,237,0.04)',
    },
    emptyEmoji: { fontSize: 52, marginBottom: 14 },
    emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
    emptyText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
    emptyContainerSmall: {
        alignItems: 'center', padding: 28, backgroundColor: '#FFF', borderRadius: 24,
        borderWidth: 1, borderColor: 'rgba(124,58,237,0.04)', elevation: 2,
        shadowColor: '#7C3AED', shadowOpacity: 0.04, shadowRadius: 10,
    },
    emptyTitleSmall: { fontSize: 15, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
    emptyTextSmall: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },

    // Add data button
    addDataBtn: {
        backgroundColor: '#FAF5FF',
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9D5FF',
        marginBottom: 16,
        width: '100%',
        alignSelf: 'center',
    },
    addDataBtnText: { fontSize: 13, color: '#5B21B6', fontWeight: 'bold' },

    // Modals overlay
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(15,23,42,0.45)',
        justifyContent: 'center', alignItems: 'center',
    },

    // Survey modal
    questionsModalContent: {
        backgroundColor: '#FFF', borderRadius: 32, padding: 24,
        width: width - 40, alignItems: 'stretch',
        elevation: 8, shadowColor: '#7C3AED', shadowOpacity: 0.1,
        shadowRadius: 24, shadowOffset: { width: 0, height: 12 },
    },
    feedbackEmojiTitle: { fontSize: 44, textAlign: 'center', marginBottom: 8 },
    feedbackTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 6, textAlign: 'center' },
    feedbackSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 8 },
    questionText: {
        fontSize: 14, fontWeight: '800', color: '#1E293B', marginTop: 14, marginBottom: 8,
    },
    btnRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    surveyBtn: {
        flex: 1, paddingVertical: 11, borderWidth: 1.5, borderColor: '#DDD6FE',
        borderRadius: 14, alignItems: 'center', backgroundColor: '#FAFAF9',
    },
    surveyBtnActive: { borderColor: '#7C3AED', backgroundColor: '#EDE9FE' },
    surveyBtnText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    surveyBtnTextActive: { color: '#7C3AED', fontWeight: '800' },
    submitSurveyBtn: {
        backgroundColor: '#7C3AED', paddingVertical: 15, borderRadius: 20,
        alignItems: 'center', marginTop: 20, elevation: 3,
        shadowColor: '#7C3AED', shadowOpacity: 0.2, shadowRadius: 8,
    },
    submitSurveyBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

    // Results modal
    resultsModalContent: {
        backgroundColor: '#FFF', borderRadius: 32, padding: 24,
        width: width - 40, alignItems: 'center',
        elevation: 8, shadowColor: '#7C3AED', shadowOpacity: 0.1,
        shadowRadius: 24, shadowOffset: { width: 0, height: 12 },
    },
    resultsInfoBlock: { width: '100%', marginVertical: 16 },
    resultsRowText: { fontSize: 14, color: '#475569', marginVertical: 5, lineHeight: 20 },
    dividerLine: { height: 1.5, backgroundColor: '#F1F5F9', marginVertical: 14 },
    resultsFeedbackTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
    resultsFeedbackText: {
        fontSize: 13, color: '#475569', lineHeight: 20, fontStyle: 'italic',
        backgroundColor: '#F5F3FF', padding: 14, borderRadius: 16,
        borderWidth: 1, borderColor: '#DDD6FE',
    },
    resultsCloseBtn: {
        backgroundColor: '#7C3AED', width: '100%', paddingVertical: 14,
        borderRadius: 20, alignItems: 'center', elevation: 3,
        shadowColor: '#7C3AED', shadowOpacity: 0.2, shadowRadius: 8,
    },
    resultsCloseBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

    // View progress banner
    viewProgressBtn: {
        marginVertical: 12, borderRadius: 18, overflow: 'hidden',
        borderWidth: 1, borderColor: '#DDD6FE',
        width: '100%',
        alignSelf: 'center',
    },
    viewProgressBtnGrad: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
    viewProgressBtnEmoji: { fontSize: 24 },
    viewProgressBtnTitle: { fontSize: 13, fontWeight: 'bold', color: '#4C1D95' },
    viewProgressBtnSub: { fontSize: 11, color: '#7C3AED', marginTop: 2 },

    // Daily health prompt modal
    promptModalContent: {
        backgroundColor: '#FFF', borderRadius: 32, padding: 26,
        width: width - 40, alignItems: 'center', elevation: 8,
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1, shadowRadius: 20,
    },
    promptEmoji: { fontSize: 48, marginBottom: 12 },
    promptTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 8, textAlign: 'center' },
    promptSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 22 },
    promptBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
    promptBtn: {
        flex: 1, paddingVertical: 14, paddingHorizontal: 8, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
    },
    thumbsUpBtn: { backgroundColor: '#F5F3FF', borderColor: '#7C3AED' },
    thumbsDownBtn: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
    promptBtnEmoji: { fontSize: 28, marginBottom: 5 },
    promptBtnTextActive: { color: '#7C3AED', fontWeight: '800', fontSize: 12, textAlign: 'center' },
    promptBtnText: { color: '#64748B', fontWeight: '700', fontSize: 12, textAlign: 'center' },

    // Tab switcher
    tabContainer: {
        flexDirection: 'row', backgroundColor: 'rgba(109,40,217,0.06)',
        borderRadius: 20, padding: 4, marginBottom: 16,
    },
    tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 16 },
    tabButtonActive: {
        backgroundColor: '#FFF', elevation: 3, shadowColor: '#7C3AED',
        shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    },
    tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    tabTextActive: { color: '#7C3AED', fontWeight: '900' },

    // Stopwatch
    stopwatchContainer: {
        width: '100%', alignItems: 'center', backgroundColor: '#F5F3FF',
        borderRadius: 20, padding: 18, marginVertical: 14,
        borderWidth: 1.5, borderColor: '#DDD6FE',
    },
    stopwatchLabel: { fontSize: 13, fontWeight: '700', color: '#7C3AED', marginBottom: 6 },
    stopwatchDisplay: {
        fontSize: 36, fontWeight: '900', color: '#1E293B',
        letterSpacing: 3, marginBottom: 16, fontVariant: ['tabular-nums'],
    },
    stopwatchRow: { flexDirection: 'row', justifyContent: 'center', gap: 40, width: '100%' },
    controlBtnWrapper: {
        alignItems: 'center',
    },
    controlCircleBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#EEEDFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    controlLabelText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6F6F70',
        textAlign: 'center',
    },

    // Misc
    playIconButton: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#7C3AED',
        alignItems: 'center', justifyContent: 'center', marginLeft: 8, elevation: 3,
        shadowColor: '#7C3AED', shadowOpacity: 0.3, shadowRadius: 6,
        shadowOffset: { height: 2, width: 0 },
    },
    playIconText: { fontSize: 16, color: '#FFF' },

    // Safety Modal Specific Styles
    safetyModalContent: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 16,
        width: width * 0.85,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
    },
    safetyCloseBtn: {
        backgroundColor: '#7C3AED',
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        width: '50%',
    },
    safetyCloseBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 13,
    },
    modalSplitRow: {
        flexDirection: width > 500 ? 'row' : 'column',
        width: '100%',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalLeftColumn: {
        flex: width > 500 ? 1.2 : 0,
        width: '100%',
    },
    modalRightColumn: {
        flex: width > 500 ? 0.8 : 0,
        width: '100%',
    },
});
