import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Modal,
    Alert, ActivityIndicator, Platform,
    Pressable, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Toast from 'react-native-toast-message';
import exerciseService from '../services/exerciseService';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';
import { useResponsive } from '../hooks/useResponsive';
import { todayStr, formatTime, getYoutubeEmbedUrl } from '../utils/exerciseUtils';
import { C, T, Card, SectionTitle, OptionRow, PrimaryButton, SecondaryButton, CircleButton, StatTile, Icon, useExerciseFonts } from '../components/exercise/ui';
import { MOVEMENT_SCORING_JS } from '../utils/movementScoring';
import { MOVEMENT_COMPLETE_REPS, MOVEMENT_MIN_REPS, MOVEMENT_MIN_SECONDS } from '../utils/exerciseConfig';

// Generate unique session ID
const generateSessionId = () => {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Demo video: autoplay muted with the JS API enabled so play/pause commands work
const getEmbedUrl = (url) => getYoutubeEmbedUrl(url,
    url && url.includes('youtube.com/embed/')
        ? 'enablejsapi=1&autoplay=1&mute=1'
        : 'playsinline=1&controls=1&rel=0&modestbranding=1&enablejsapi=1&autoplay=1&mute=1');

export default function MovementTrackingScreen({ route, navigation }) {
    const { exerciseId, exerciseName, videoUrl, cardName } = route.params;
    const { t, i18n } = useTranslation();
    const fontsReady = useExerciseFonts();
    const isSinhala = i18n.language === 'si';
    const r = useResponsive();
    const isLargeScreen = r.isTablet;


    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Initializing...');
    const [reps, setReps] = useState(0);
    const [liveScore, setLiveScore] = useState(0);
    const [stability, setStability] = useState(null);     // steadiness 0-100, null until measured
    const [postureMatch, setPostureMatch] = useState(null); // alignment / posture 0-100
    const [averageSteadiness, setAverageSteadiness] = useState(0);
    const [feedbackMessage, setFeedbackMessage] = useState('Position yourself in front of the camera.');
    const [averageAccuracy, setAverageAccuracy] = useState(0);
    const [correctReps, setCorrectReps] = useState(0);
    const [incorrectReps, setIncorrectReps] = useState(0);
    const [averageRangeOfMotion, setAverageRangeOfMotion] = useState(0);
    const [averageJointAccuracy, setAverageJointAccuracy] = useState(0);
    const [visibilityWarning, setVisibilityWarning] = useState('');
    const [isPaused, setIsPaused] = useState(false);

    // Timer states
    const [timeElapsed, setTimeElapsed] = useState(0);
    const timerRef = useRef(null);

    // Session states
    const [sessionId] = useState(generateSessionId());
    const [pauseCount, setPauseCount] = useState(0);

    // Summary modal states
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [painRating, setPainRating] = useState(null); // 'Yes' / 'No'
    const [difficultyRating, setDifficultyRating] = useState(null); // 'Easy' / 'Moderate' / 'Hard'
    const [feelingRating, setFeelingRating] = useState(null); // 'Better' / 'Same' / 'Tired'
    const [saving, setSaving] = useState(false);

    const webViewRef = useRef(null);
    const videoRef = useRef(null);
    // Web: the pose-tracking iframe (not the YouTube demo iframe) receives PAUSE/RESUME
    const cameraIframeRef = useRef(null);
    const isPausedRef = useRef(false);
    const timerStartedRef = useRef(false);
    // Running average of the live score, so the saved score reflects the whole session
    const scoreSamplesRef = useRef({ sum: 0, count: 0 });

    const playDemoVideo = () => {
        if (Platform.OS === 'web') {
            const iframe = document.querySelector('iframe[src*="youtube.com"]');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
            }
        } else if (videoRef.current) {
            videoRef.current.injectJavaScript(`
                const iframe = document.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
                }
                true;
            `);
        }
    };

    const pauseDemoVideo = () => {
        if (Platform.OS === 'web') {
            const iframe = document.querySelector('iframe[src*="youtube.com"]');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*');
            }
        } else if (videoRef.current) {
            videoRef.current.injectJavaScript(`
                const iframe = document.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*');
                }
                true;
            `);
        }
    };

    // Timer starts when the camera and pose model are ready (READY message), not while loading
    useEffect(() => {
        return () => stopTimer();
    }, []);

    // Web message receiver listener
    useEffect(() => {
        if (Platform.OS === 'web') {
            const handleWebMessage = (e) => {
                // Mock native WebView message event format
                handleWebViewMessage({ nativeEvent: { data: e.data } });
            };
            window.addEventListener('message', handleWebMessage);
            return () => window.removeEventListener('message', handleWebMessage);
        }
    }, []);

    const startTimer = () => {
        if (!timerRef.current) {
            timerRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
            playDemoVideo();
        }
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            pauseDemoVideo();
        }
    };

    const togglePause = () => {
        if (isPaused) {
            // Resume
            isPausedRef.current = false;
            setIsPaused(false);
            startTimer();
            sendMessageToWebView({ type: 'RESUME' });
        } else {
            // Pause
            isPausedRef.current = true;
            setIsPaused(true);
            stopTimer();
            setPauseCount(prev => prev + 1);
            sendMessageToWebView({ type: 'PAUSE' });
        }
    };

    const handleFinish = () => {
        isPausedRef.current = true;
        stopTimer();
        sendMessageToWebView({ type: 'PAUSE' });
        setShowSummaryModal(true);
    };

    const sendMessageToWebView = (msg) => {
        if (Platform.OS === 'web') {
            const iframe = cameraIframeRef.current;
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(JSON.stringify(msg), '*');
            }
        } else if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify(msg));
        }
    };

    const handleWebViewMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            switch (data.type) {
                case 'READY':
                    setLoading(false);
                    setStatus('Body Detected');
                    if (!timerStartedRef.current && !isPausedRef.current) {
                        timerStartedRef.current = true;
                        startTimer();
                    }
                    break;
                case 'STATUS':
                    setStatus(data.status);
                    break;
                case 'REP_COUNT':
                    setReps(data.count);
                    break;
                case 'LIVE_SCORE':
                    setLiveScore(data.score);
                    if (!isPausedRef.current && typeof data.score === 'number' && data.score > 0) {
                        scoreSamplesRef.current.sum += data.score;
                        scoreSamplesRef.current.count += 1;
                    }
                    if (data.stability !== undefined) {
                        setStability(data.stability);
                    }
                    if (data.postureMatch !== undefined) {
                        setPostureMatch(data.postureMatch);
                    }
                    if (data.averageSteadiness !== undefined) {
                        setAverageSteadiness(data.averageSteadiness);
                    }
                    if (data.feedback !== undefined) {
                        setFeedbackMessage(data.feedback);
                    }
                    if (data.averageAccuracy !== undefined) {
                        setAverageAccuracy(data.averageAccuracy);
                    }
                    if (data.correctRepetitions !== undefined) {
                        setCorrectReps(data.correctRepetitions);
                    }
                    if (data.incorrectRepetitions !== undefined) {
                        setIncorrectReps(data.incorrectRepetitions);
                    }
                    if (data.averageRangeOfMotion !== undefined) {
                        setAverageRangeOfMotion(data.averageRangeOfMotion);
                    }
                    if (data.averageJointAccuracy !== undefined) {
                        setAverageJointAccuracy(data.averageJointAccuracy);
                    }
                    break;
                case 'VISIBILITY_WARNING':
                    setVisibilityWarning(data.message);
                    break;
                case 'ERROR':
                    console.log('WebView Pose Error:', data.error);
                    setStatus('Error loading camera');
                    Alert.alert('Camera Error', data.error);
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.log('Error parsing WebView message:', e);
        }
    };


    // Calculate score feedback message
    const getScoreFeedback = (score) => {
        if (isSinhala) {
            if (score >= 90) return 'විශිෂ්ට අනුකූලතාවයක්.';
            if (score >= 70) return 'යහපත් චලන රටාවක්.';
            if (score >= 50) return 'දිගටම පුහුණු වන්න.';
            return 'මීළඟ වාරයේදී මන්දගාමී චලන උත්සාහ කරන්න.';
        }
        if (score >= 90) return 'Excellent consistency.';
        if (score >= 70) return 'Good movement.';
        if (score >= 50) return 'Keep practicing.';
        return 'Try slower movements next session.';
    };

    const getStatusColor = (currentStatus) => {
        const lower = currentStatus.toLowerCase();
        if (lower.includes('error')) return '#EF4444';
        if (lower.includes('no body') || lower.includes('searching')) return '#EF4444';
        if (lower.includes('low') || lower.includes('loading')) return '#F59E0B';
        return '#10B981'; // Green for Tracking / Body Detected
    };

    const getTranslatedFeedback = (msg) => {
        if (!isSinhala) return msg;
        if (msg === 'Position yourself in front of the camera.') return 'කරුණාකර කැමරාව ඉදිරිපිට සිටගන්න.';
        if (msg === 'Please move fully into the camera view.') return 'කරුණාකර සම්පූර්ණයෙන්ම කැමරාවට පෙනෙන සේ සිටගන්න.';
        if (msg === 'Great! Your movement matches the exercise.') return 'ඉතා හොඳයි! ඔබේ චලනයන් ව්‍යායාමයට ගැලපේ.';
        if (msg === 'Try moving through a larger range of motion.') return 'වඩා හොඳින් ශරීරය චලනය කිරීමට උත්සාහ කරන්න.';
        if (msg === 'Follow the movement shown in the video.') return 'වීඩියෝවේ දැක්වෙන චලනයන් අනුගමනය කරන්න.';
        if (msg === 'Try keeping your knees aligned with your feet.') return 'දණහිස් දෙක දෙපාවලට සමාන්තරව තබා ගැනීමට උත්සාහ කරන්න.';
        if (msg === 'Adjust your joint angles to match the video.') return 'වීඩියෝවට අනුව ඔබේ සන්ධි කෝණ සකස් කරන්න.';
        if (msg === 'Correct your body position to match the video.') return 'වීඩියෝවට අනුව ඔබේ ශරීරයේ පිහිටීම සකස් කරන්න.';
        if (msg === 'Adjust your pace to match the video timing.') return 'වීඩියෝවේ වේගයට අනුව ඔබේ වේගය සකස් කරන්න.';
        if (msg === 'Keep your hips steady and move slowly.') return 'ඔබේ උකුල ස්ථාවරව තබාගෙන සෙමින් චලනය වන්න.';
        if (msg === 'Move slowly and with control, about 3 to 7 seconds per repetition.') return 'සෙමින් සහ පාලනයෙන් චලනය වන්න, එක් වාරයකට තත්පර 3 සිට 7 දක්වා.';
        return msg;
    };

    const getTranslatedStatus = (st) => {
        if (!isSinhala) return st;
        if (st === 'Initializing...') return 'ආරම්භ වෙමින්...';
        if (st === 'Body Detected') return 'ශරීරය හඳුනාගෙන ඇත';
        if (st === 'Tracking') return 'ලුහුබඳිමින්';
        if (st === 'Low visibility') return 'අඩු දෘශ්‍යතාවය';
        if (st === 'No Body Detected') return 'ශරීරය හඳුනාගත නොහැක';
        if (st === 'Model loading...') return 'ආකෘතිය පූරණය වෙමින්...';
        if (st.startsWith('Pose Init Error:')) return 'පූරණ දෝෂයකි';
        return st;
    };

    const submitWorkoutSession = async () => {
        setSaving(true);
        try {
            const sanitizedExerciseId = (exerciseId && exerciseId !== 'EX_MOCK' && exerciseId.match(/^[0-9a-fA-F]{24}$/)) ? exerciseId : undefined;
            const samples = scoreSamplesRef.current;
            const sessionScore = samples.count > 0 ? Math.round(samples.sum / samples.count) : liveScore;
            // Needs real movement: enough reps, or a few reps over a minimum tracking time
            const isCompleted = reps >= MOVEMENT_COMPLETE_REPS || (reps >= MOVEMENT_MIN_REPS && timeElapsed >= MOVEMENT_MIN_SECONDS);
            const localDate = todayStr();

            await exerciseService.saveMovementSession({
                sessionId,
                exerciseId: sanitizedExerciseId,
                exerciseName,
                movementScore: sessionScore,
                repetitions: reps,
                activeDuration: timeElapsed,
                pauseCount,
                completed: isCompleted,
                pain: painRating === 'Yes',
                difficulty: difficultyRating,
                postWorkoutFeeling: feelingRating,
                averageAccuracy,
                correctRepetitions: correctReps,
                incorrectRepetitions: incorrectReps,
                averageRangeOfMotion,
                averageJointAccuracy
            });

            // Auto-complete the exercise card in ExerciseScreen as well
            await exerciseService.saveExerciseRecord({
                date: localDate,
                exerciseId: sanitizedExerciseId,
                // Use the recommendation card's name so that card is marked completed
                customActivityName: cardName || exerciseName,
                videoUrl,
                status: isCompleted ? 'completed' : 'pending',
                durationCompleted: Math.round(timeElapsed / 60) || 1,
                liked: true,
                pain: painRating,
                difficulty: difficultyRating,
                feelingAfter: feelingRating,
                adherenceScore: sessionScore,
                accuracy: averageAccuracy,
                performanceMetrics: {
                    postureScore: averageJointAccuracy,
                    stabilityScore: averageSteadiness,
                    rangeOfMotion: averageRangeOfMotion
                }
            });

            Toast.show({
                type: 'success',
                text1: '🎉 Workout session saved successfully!'
            });

            setShowSummaryModal(false);
            navigation.goBack(); // go back to Recommendations
        } catch (err) {
            console.error('Failed to save workout session:', err);
            Alert.alert('Error', 'Failed to save workout session. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const localHtmlString = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
            body, html {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                background-color: #000;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            #container {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            #input_video {
                position: absolute;
                width: 1px;
                height: 1px;
                opacity: 0;
                pointer-events: none;
            }
            #output_canvas {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transform: scaleX(-1); /* Mirror view */
            }
            #loading {
                position: absolute;
                color: #fff;
                font-family: sans-serif;
                font-size: 16px;
                z-index: 10;
                background: rgba(0,0,0,0.7);
                padding: 12px 24px;
                border-radius: 20px;
            }
        </style>
        <!-- MediaPipe Pose Estimation Dependencies -->
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" crossorigin="anonymous"></script>
    </head>
    <body>
        <div id="container">
            <div id="loading">Connecting camera...</div>
            <video id="input_video" autoplay muted playsinline></video>
            <canvas id="output_canvas"></canvas>
        </div>

        <script>
            const videoElement = document.getElementById('input_video');
            const canvasElement = document.getElementById('output_canvas');
            const canvasCtx = canvasElement.getContext('2d');
            const loadingElement = document.getElementById('loading');

            window.paused = false;
            const startTime = Date.now();

            // MediaPipe Connections mapping
            const POSE_CONNECTIONS = [
                [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
                [11, 23], [12, 24], [23, 24], // Torso
                [23, 25], [24, 26], [25, 27], [26, 28] // Legs
            ];

            let useUnpkg = false;
            let pose;

            function initPose() {
                try {
                    pose = new Pose({
                        locateFile: (file) => {
                            return useUnpkg 
                                ? \`https://unpkg.com/@mediapipe/pose@0.5.1675469404/\${file}\`
                                : \`https://cdn.jsdelivr.net/npm/@mediapipe/pose/\${file}\`;
                        }
                    });

                    pose.setOptions({
                        modelComplexity: 1,
                        smoothLandmarks: true,
                        enableSegmentation: false,
                        smoothSegmentation: false,
                        minDetectionConfidence: 0.5,
                        minTrackingConfidence: 0.5
                    });

                    pose.onResults(onResults);
                } catch (e) {
                    sendMessage({ type: 'STATUS', status: 'Pose Init Error: ' + e.message });
                }
            }

            initPose();

            function sendMessage(data) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(data));
                } else if (window.parent) {
                    window.parent.postMessage(JSON.stringify(data), '*');
                }
            }

            // Standard Math angle calculation (3 points: Joint is B)
            function calculateAngle(a, b, c) {
                const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
                let angle = Math.abs((radians * 180.0) / Math.PI);
                if (angle > 180.0) {
                    angle = 360.0 - angle;
                }
                return angle;
            }

            // Exercise State Machine Variables
            const exerciseName = "${exerciseName}";
            const lowerName = exerciseName.toLowerCase();
            let activeDetector = "Universal";
            if (lowerName.includes("cat") || lowerName.includes("cow")) {
                activeDetector = "Cat-Cow";
            } else if (lowerName.includes("bird") || lowerName.includes("dog")) {
                activeDetector = "Bird Dog";
            } else if (lowerName.includes("bridge")) {
                activeDetector = "Glute Bridge";
            } else if (lowerName.includes("squat")) {
                activeDetector = "Modified Squats";
            }

            // Universal Movement Tracker Variables
            let historyY = [];
            const historyLength = 30;
            let movingDirection = 0;
            let lastValley = null;
            let lastPeak = null;
            const thresholdY = 0.035;

            // Scoring functions (frontend/utils/movementScoring.js)
            ${MOVEMENT_SCORING_JS}

            // Scoring state: rolling windows (~3 s at ~25 fps) and the current rep
            const MS_WINDOW = 75;
            const profile = MS_PROFILES[activeDetector] || MS_PROFILES['Universal'];
            let metricWindow = [];
            let tiltWindow = [];
            let swayWindow = [];
            let repMin = Infinity;
            let repMax = -Infinity;
            let repAlignments = [];
            let repScores = [];
            let paceScores = [];
            let alignmentHistory = [];
            let steadinessHistory = [];
            let smoothAccuracy = null;
            let smoothSteadiness = null;
            let lastAlignment = null;

            // Called when a rep is completed: scores that rep from its own range and alignment
            function finishRep() {
                const rom = msRomScore(profile, repMin, repMax);
                const align = repAlignments.length ? repAlignments.reduce((a, b) => a + b, 0) / repAlignments.length : (lastAlignment || 0);
                const repScore = Math.round(rom * 0.5 + align * 0.5);
                repScores.push(repScore);
                // the first rep's time includes getting into position, so pace starts from the second rep
                if (repetitionTimes.length > 1) {
                    paceScores.push(Math.round(msPaceScore(repetitionTimes[repetitionTimes.length - 1], profile.paceSec)));
                }
                romsHistory.push(Math.round(rom));
                repMin = Infinity;
                repMax = -Infinity;
                repAlignments = [];
                return repScore;
            }

            // Tracking Histories
            let accuraciesHistory = [];
            let romsHistory = [];
            let jointsHistory = [];
            let correctReps = 0;
            let incorrectReps = 0;
            let lastLiveAccuracy = 100;

            let reps = 0;
            let state = "neutral";
            let rawAnglesHistory = [];
            let stabilityVariance = [];
            let repetitionTimes = [];
            let lastRepTimestamp = Date.now();

            // 1. Pose Normalizer
            const PoseNormalizer = {
                normalize: function(landmarks) {
                    if (!landmarks || landmarks.length < 24) return null;
                    
                    const lHip = landmarks[23];
                    const rHip = landmarks[24];
                    const hipCenterX = (lHip.x + rHip.x) / 2;
                    const hipCenterY = (lHip.y + rHip.y) / 2;
                    
                    const lShoulder = landmarks[11];
                    const rShoulder = landmarks[12];
                    const shoulderCenterX = (lShoulder.x + rShoulder.x) / 2;
                    const shoulderCenterY = (lShoulder.y + rShoulder.y) / 2;
                    
                    const scale = Math.sqrt(Math.pow(shoulderCenterX - hipCenterX, 2) + Math.pow(shoulderCenterY - hipCenterY, 2)) || 1.0;
                    
                    const normalized = landmarks.map(lm => {
                        if (!lm) return null;
                        return {
                            x: (lm.x - hipCenterX) / scale,
                            y: (lm.y - hipCenterY) / scale,
                            z: lm.z / scale,
                            visibility: lm.visibility
                        };
                    });
                    
                    return {
                        landmarks: normalized,
                        scale: scale,
                        hipCenter: { x: hipCenterX, y: hipCenterY }
                    };
                }
            };

            function processExercise(landmarks) {
                const nose = landmarks[0];
                const lShoulder = landmarks[11];
                const rShoulder = landmarks[12];
                const lWrist = landmarks[15];
                const rWrist = landmarks[16];
                const lHip = landmarks[23];
                const rHip = landmarks[24];
                const lKnee = landmarks[25];
                const rKnee = landmarks[26];
                const lAnkle = landmarks[27];
                const rAnkle = landmarks[28];

                const midShoulder = { x: (lShoulder.x + rShoulder.x)/2, y: (lShoulder.y + rShoulder.y)/2 };
                const midHip = { x: (lHip.x + rHip.x)/2, y: (lHip.y + rHip.y)/2 };

                const normalizedUser = PoseNormalizer.normalize(landmarks);
                if (!normalizedUser) return;

                let userAngles = {};

                if (activeDetector === "Cat-Cow") {
                    const cowAngle = calculateAngle(nose, midShoulder, midHip);
                    if (cowAngle < 145) {
                        state = "cow";
                    } else if (cowAngle > 165) {
                        if (state === "cow") {
                            const now = Date.now();
                            repetitionTimes.push(now - lastRepTimestamp);
                            lastRepTimestamp = now;
                            
                            const repAccuracy = finishRep();
                            if (repAccuracy >= 70) correctReps++;
                            else incorrectReps++;
                            reps = correctReps + incorrectReps;
                            sendMessage({ type: 'REP_COUNT', count: reps });
                        }
                        state = "cat";
                    }
                    rawAnglesHistory.push(cowAngle);
                    userAngles = { back: cowAngle };

                } else if (activeDetector === "Bird Dog") {
                    const ext1 = (lWrist.y < lShoulder.y + 0.1 && Math.abs(lWrist.x - lShoulder.x) > 0.15) && 
                                 (rAnkle.y < rHip.y + 0.15 && Math.abs(rAnkle.x - rHip.x) > 0.15);
                                 
                    const ext2 = (rWrist.y < rShoulder.y + 0.1 && Math.abs(rWrist.x - rShoulder.x) > 0.15) && 
                                 (lAnkle.y < lHip.y + 0.15 && Math.abs(lAnkle.x - lHip.x) > 0.15);

                    if (ext1 || ext2) {
                        if (state === "returned") {
                            const now = Date.now();
                            repetitionTimes.push(now - lastRepTimestamp);
                            lastRepTimestamp = now;
                            
                            const repAccuracy = finishRep();
                            if (repAccuracy >= 70) correctReps++;
                            else incorrectReps++;
                            reps = correctReps + incorrectReps;
                            sendMessage({ type: 'REP_COUNT', count: reps });
                            state = "extended";
                        } else if (state === "neutral") {
                            state = "extended";
                        }
                        
                        const hipTilt = Math.abs(lHip.y - rHip.y);
                        stabilityVariance.push(hipTilt);
                    } else {
                        const ret = Math.abs(lWrist.x - lShoulder.x) < 0.1 && Math.abs(rWrist.x - rShoulder.x) < 0.1 &&
                                    Math.abs(lAnkle.x - lHip.x) < 0.1 && Math.abs(rAnkle.x - rHip.x) < 0.1;
                        if (ret && state === "extended") {
                            state = "returned";
                        } else if (ret) {
                            state = "neutral";
                        }
                    }
                    userAngles = { extension: msBirdDogExtension(landmarks, normalizedUser.scale) };

                } else if (activeDetector === "Glute Bridge") {
                    const angleL = calculateAngle(lShoulder, lHip, lKnee);
                    const angleR = calculateAngle(rShoulder, rHip, rKnee);
                    const hipAngle = Math.max(angleL, angleR);

                    if (hipAngle > 155) {
                        if (state === "neutral" || state === "lowering") {
                            state = "up";
                        }
                    } else if (hipAngle < 125) {
                        if (state === "up") {
                            const now = Date.now();
                            repetitionTimes.push(now - lastRepTimestamp);
                            lastRepTimestamp = now;
                            
                            const repAccuracy = finishRep();
                            if (repAccuracy >= 70) correctReps++;
                            else incorrectReps++;
                            reps = correctReps + incorrectReps;
                            sendMessage({ type: 'REP_COUNT', count: reps });
                            state = "lowering";
                        } else {
                            state = "neutral";
                        }
                    }
                    rawAnglesHistory.push(hipAngle);
                    userAngles = { hip: hipAngle };

                } else if (activeDetector === "Modified Squats") {
                    const kneeL = calculateAngle(lHip, lKnee, lAnkle);
                    const kneeR = calculateAngle(rHip, rKnee, rAnkle);
                    const kneeAngle = Math.min(kneeL, kneeR);

                    if (kneeAngle < 130) {
                        state = "squatting";
                    } else if (kneeAngle > 160) {
                        if (state === "squatting") {
                            const now = Date.now();
                            repetitionTimes.push(now - lastRepTimestamp);
                            lastRepTimestamp = now;
                            
                            const repAccuracy = finishRep();
                            if (repAccuracy >= 70) correctReps++;
                            else incorrectReps++;
                            reps = correctReps + incorrectReps;
                            sendMessage({ type: 'REP_COUNT', count: reps });
                        }
                        state = "standing";
                    }
                    rawAnglesHistory.push(kneeAngle);
                    const hipAngle = calculateAngle(lShoulder, lHip, lKnee);
                    userAngles = { knee: kneeAngle, hip: hipAngle };
                } else if (activeDetector === "Universal") {
                    const currentY = (lHip.y + rHip.y + lShoulder.y + rShoulder.y) / 4;
                    historyY.push(currentY);
                    if (historyY.length > historyLength) {
                        historyY.shift();
                    }

                    let amplitude = 0.0;
                    if (historyY.length >= 15) {
                        const maxVal = Math.max(...historyY);
                        const minVal = Math.min(...historyY);
                        amplitude = maxVal - minVal;
                        rawAnglesHistory.push(amplitude);

                        const prevY = historyY[historyY.length - 2];
                        const diff = currentY - prevY;
                        
                        let currentDirection = 0;
                        if (diff > 0.0015) currentDirection = -1;
                        if (diff < -0.0015) currentDirection = 1;

                        if (currentDirection !== 0 && currentDirection !== movingDirection) {
                            if (movingDirection === -1 && currentDirection === 1) {
                                lastValley = currentY;
                                if (lastPeak !== null && Math.abs(lastPeak - lastValley) > thresholdY) {
                                    const now = Date.now();
                                    repetitionTimes.push(now - lastRepTimestamp);
                                    lastRepTimestamp = now;
                                    
                                    const repAccuracy = finishRep();
                                    if (repAccuracy >= 70) correctReps++;
                                    else incorrectReps++;
                                    reps = correctReps + incorrectReps;
                                    sendMessage({ type: 'REP_COUNT', count: reps });
                                    lastPeak = null;
                                }
                            } else if (movingDirection === 1 && currentDirection === -1) {
                                lastPeak = currentY;
                            }
                            movingDirection = currentDirection;
                        }
                    }
                    userAngles = { amplitude };
                }

                const torso = normalizedUser.scale;

                // Value of the exercise's main measure this frame
                let metricValue = userAngles[profile.metric];
                if (profile.metric === 'amplitude') metricValue = (userAngles.amplitude || 0) / torso;
                if (isFinite(metricValue)) {
                    metricWindow.push(metricValue);
                    if (metricWindow.length > MS_WINDOW) metricWindow.shift();
                    repMin = Math.min(repMin, metricValue);
                    repMax = Math.max(repMax, metricValue);
                }

                // Steadiness: hip tilt and side-to-side sway of the pelvis, relative to torso length
                tiltWindow.push((lHip.y - rHip.y) / torso);
                swayWindow.push(midHip.x / torso);
                if (tiltWindow.length > MS_WINDOW) tiltWindow.shift();
                if (swayWindow.length > MS_WINDOW) swayWindow.shift();

                const alignment = msAlignment(activeDetector, landmarks, torso);
                if (alignment !== null) {
                    lastAlignment = alignment;
                    repAlignments.push(alignment);
                    alignmentHistory.push(alignment);
                }

                // Live range of motion over the last few seconds (amplitude is already a range)
                const romLive = profile.metric === 'amplitude'
                    ? msRomScore(profile, 0, metricValue)
                    : msRomScore(profile, Math.min.apply(null, metricWindow), Math.max.apply(null, metricWindow));
                const accuracyNow = romLive * 0.5 + (lastAlignment === null ? romLive : lastAlignment) * 0.5;
                smoothAccuracy = msSmooth(smoothAccuracy, accuracyNow, 0.2);
                const accuracyScore = Math.round(smoothAccuracy);
                lastLiveAccuracy = accuracyScore;

                const steadyNow = msSteadiness(tiltWindow, swayWindow);
                if (steadyNow !== null) {
                    smoothSteadiness = msSmooth(smoothSteadiness, steadyNow, 0.15);
                    steadinessHistory.push(smoothSteadiness);
                }
                const stabilityVal = smoothSteadiness === null ? null : Math.round(smoothSteadiness);

                accuraciesHistory.push(accuracyScore);
                jointsHistory.push(alignment === null ? accuracyScore : alignment);

                const mean = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
                const avgAccuracy = repScores.length ? mean(repScores) : mean(accuraciesHistory);
                const pace = paceScores.length ? mean(paceScores.slice(-3)) : null;

                // Feedback on the weakest part
                let feedback = "Great! Your movement matches the exercise.";
                const parts = [
                    { key: 'rom', v: romLive },
                    { key: 'align', v: lastAlignment === null ? 100 : lastAlignment },
                    { key: 'steady', v: stabilityVal === null ? 100 : stabilityVal },
                ].sort((a, b) => a.v - b.v);
                if (parts[0].v < 70) {
                    if (parts[0].key === 'rom') feedback = "Try moving through a larger range of motion.";
                    else if (parts[0].key === 'align') feedback = activeDetector === "Modified Squats"
                        ? "Try keeping your knees aligned with your feet."
                        : "Correct your body position to match the video.";
                    else feedback = "Keep your hips steady and move slowly.";
                }

                sendMessage({
                    type: 'LIVE_SCORE',
                    score: accuracyScore,
                    stability: stabilityVal,
                    postureMatch: lastAlignment === null ? null : Math.round(mean(alignmentHistory.slice(-MS_WINDOW))),
                    pace: pace,
                    feedback: feedback,
                    averageAccuracy: avgAccuracy,
                    correctRepetitions: correctReps,
                    incorrectRepetitions: incorrectReps,
                    averageRangeOfMotion: mean(romsHistory),
                    averageJointAccuracy: mean(alignmentHistory),
                    averageSteadiness: mean(steadinessHistory)
                });
            }

            function drawConnectors(ctx, landmarks, connections, style) {
                ctx.strokeStyle = style.color || '#FFF';
                ctx.lineWidth = style.lineWidth || 2;
                connections.forEach(([p1, p2]) => {
                    const lm1 = landmarks[p1];
                    const lm2 = landmarks[p2];
                    if (lm1 && lm2 && lm1.visibility > 0.5 && lm2.visibility > 0.5) {
                        ctx.beginPath();
                        ctx.moveTo(lm1.x * canvasElement.width, lm1.y * canvasElement.height);
                        ctx.lineTo(lm2.x * canvasElement.width, lm2.y * canvasElement.height);
                        ctx.stroke();
                    }
                });
            }

            function drawLandmarks(ctx, landmarks, style) {
                ctx.fillStyle = style.color || '#7C3AED';
                landmarks.forEach((lm) => {
                    if (lm && lm.visibility > 0.5) {
                        ctx.beginPath();
                        ctx.arc(lm.x * canvasElement.width, lm.y * canvasElement.height, style.radius || 4, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                });
            }

            window.latestLandmarks = null;
            window.latestLandmarksTime = 0;

            function drawFrame() {
                if (!window.paused && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                    canvasCtx.save();
                    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                    
                    // Draw video frame on canvas (mirrored)
                    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                    
                    // Overlay skeleton if we have a recent detection
                    if (window.latestLandmarks && (Date.now() - window.latestLandmarksTime < 800)) {
                        drawConnectors(canvasCtx, window.latestLandmarks, POSE_CONNECTIONS, {color: '#B39DDB', lineWidth: 4});
                        drawLandmarks(canvasCtx, window.latestLandmarks, {color: '#7C3AED', radius: 5});
                    }
                    canvasCtx.restore();
                }
                requestAnimationFrame(drawFrame);
            }

            function onResults(results) {
                if (window.paused) return;

                if (results.poseLandmarks) {
                    window.latestLandmarks = results.poseLandmarks;
                    window.latestLandmarksTime = Date.now();
                    
                    sendMessage({ type: 'STATUS', status: 'Tracking' });

                    // Visibility tracking
                    let requiredIndices = [11, 12, 23, 24]; // default torso/hips
                    if (activeDetector === "Cat-Cow") {
                        requiredIndices = [0, 11, 12, 23, 24];
                    } else if (activeDetector === "Bird Dog") {
                        requiredIndices = [11, 12, 15, 16, 23, 24, 27, 28];
                    } else if (activeDetector === "Glute Bridge") {
                        requiredIndices = [11, 12, 23, 24, 25, 26];
                    } else if (activeDetector === "Modified Squats") {
                        requiredIndices = [23, 24, 25, 26, 27, 28];
                    }

                    let lowVis = false;
                    for (const idx of requiredIndices) {
                        const lm = results.poseLandmarks[idx];
                        if (!lm || lm.visibility < 0.25) {
                            lowVis = true;
                            break;
                        }
                    }

                    if (lowVis) {
                        sendMessage({ type: 'VISIBILITY_WARNING', message: 'Please move fully into the camera view.' });
                        sendMessage({ type: 'STATUS', status: 'Low visibility' });
                        sendMessage({
                            type: 'LIVE_SCORE',
                            score: 0,
                            stability: null,
                            postureMatch: null,
                            feedback: 'Please move fully into the camera view.'
                        });
                    } else {
                        sendMessage({ type: 'VISIBILITY_WARNING', message: '' });
                        processExercise(results.poseLandmarks);
                    }
                } else {
                    sendMessage({ type: 'STATUS', status: 'No Body Detected' });
                    sendMessage({ type: 'VISIBILITY_WARNING', message: 'Please move fully into the camera view.' });
                    sendMessage({
                        type: 'LIVE_SCORE',
                        score: 0,
                        stability: null,
                        postureMatch: null,
                        feedback: 'Please move fully into the camera view.'
                    });
                }
            }

            // Setup camera feed
            // The camera can still be held for a moment by the previous screen, so retry, then try simpler settings
            const cameraTries = [
                { facingMode: 'user', width: 640, height: 480 },
                { facingMode: 'user' },
                true
            ];
            function openCamera(attempt) {
                return navigator.mediaDevices.getUserMedia({ video: cameraTries[Math.min(attempt, cameraTries.length - 1)] })
                    .catch(err => {
                        const denied = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError' || err.name === 'NotFoundError');
                        if (denied || attempt >= 5) throw err;
                        return new Promise(resolve => setTimeout(resolve, 800)).then(() => openCamera(attempt + 1));
                    });
            }
            openCamera(0)
                .then(stream => {
                    videoElement.srcObject = stream;
                    videoElement.addEventListener('loadedmetadata', () => {
                        canvasElement.width = videoElement.videoWidth || 640;
                        canvasElement.height = videoElement.videoHeight || 480;
                        // Start standard requestAnimationFrame drawing loop
                        requestAnimationFrame(drawFrame);
                    });
                    videoElement.play();

                    async function processFrameLoop() {
                        if (!window.paused && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                            try {
                                await pose.send({image: videoElement});
                            } catch (err) {
                                console.error("Pose processing error:", err);
                                sendMessage({ type: 'STATUS', status: 'Model loading...' });
                                if (!useUnpkg) {
                                    useUnpkg = true;
                                    initPose();
                                }
                            }
                        }
                        setTimeout(processFrameLoop, 40);
                    }

                    processFrameLoop();
                    
                    loadingElement.style.display = 'none';
                    sendMessage({ type: 'READY' });
                })
                .catch(err => {
                    loadingElement.innerText = (err && (err.name === 'NotReadableError' || err.name === 'AbortError'))
                        ? "The camera is being used by another app or browser tab. Close it, then go back and try again."
                        : "Camera error: " + err.message;
                    sendMessage({ type: 'ERROR', error: err.message });
                });

            // Handle pause/resume instructions from React Native
            window.addEventListener('message', (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.type === 'PAUSE') {
                        window.paused = true;
                    } else if (data.type === 'RESUME') {
                        window.paused = false;
                    }
                } catch (err) {
                    console.log('Error parsing event message:', err);
                }
            });
        </script>
    </body>
    </html>
    `;

    const tr = (en, si) => (isSinhala ? si : en);
    const pct = (v) => (v === null || v === undefined ? '–' : `${v}%`);
    const statusColor = getStatusColor(status);
    const surveyReady = painRating && difficultyRating && feelingRating;

    // Phones need the exercise fonts loaded before text uses them (web falls back to sans-serif)
    if (!fontsReady && Platform.OS !== 'web') return <View style={{ flex: 1, backgroundColor: C.bg }} />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
            <View style={ms.header}>
                <CircleButton icon="back" onPress={() => navigation.goBack()} label={tr('Back', 'ආපසු')} />
                <View style={{ flex: 1 }}>
                    <Text style={ms.title} numberOfLines={1}>{exerciseName}</Text>
                    <View style={ms.statusRow}>
                        <View style={[ms.dot, { backgroundColor: statusColor }]} />
                        <Text style={ms.statusText} numberOfLines={1}>{getTranslatedStatus(status)}</Text>
                    </View>
                </View>
                <Text style={ms.timer} accessibilityLabel={tr('Time', 'කාලය')}>{formatTime(timeElapsed)}</Text>
                <Pressable
                    onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')}
                    accessibilityRole="button"
                    accessibilityLabel={tr('Switch language', 'භාෂාව මාරු කරන්න')}
                    style={ms.lang}
                >
                    <Text style={ms.langText}>{i18n.language === 'en' ? 'සිං' : 'EN'}</Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={ms.scroll} showsVerticalScrollIndicator={false}>
                <View style={[ms.split, isLargeScreen && ms.splitWide]}>
                    {/* Demo video */}
                    <View style={[ms.pane, isLargeScreen && { flex: 1 }]}>
                        <Text style={ms.paneLabel}>{tr('Demo video', 'ආදර්ශ වීඩියෝව')}</Text>
                        <View style={[ms.video, { height: isLargeScreen ? 340 : 200 }]} pointerEvents={Platform.OS === 'web' ? 'none' : 'auto'}>
                            {videoUrl ? (
                                Platform.OS === 'web' ? (
                                    <iframe
                                        src={getEmbedUrl(videoUrl)}
                                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 22, pointerEvents: 'auto' }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <WebView
                                        ref={videoRef}
                                        originWhitelist={['*']}
                                        source={{ uri: getEmbedUrl(videoUrl) }}
                                        style={styles.exerciseWebView}
                                        javaScriptEnabled={true}
                                        domStorageEnabled={true}
                                        allowsInlineMediaPlayback={true}
                                        mediaPlaybackRequiresUserAction={false}
                                    />
                                )
                            ) : (
                                <View style={ms.center}><Text style={ms.mutedOnDark}>{tr('No demo video available', 'ආදර්ශ වීඩියෝවක් නැත')}</Text></View>
                            )}
                        </View>
                    </View>

                    {/* Camera */}
                    <View style={[ms.pane, isLargeScreen && { flex: 1 }]}>
                        <Text style={ms.paneLabel}>{tr('Your camera', 'ඔබේ කැමරාව')}</Text>
                        <View style={[ms.camera, { height: isLargeScreen ? 340 : 300 }]}>
                            {loading && (
                                <View style={ms.loading}>
                                    <ActivityIndicator size="large" color={C.secondary} />
                                    <Text style={ms.mutedOnDark}>{tr('Loading AI movement models...', 'AI චලන ආකෘති පූරණය වෙමින්...')}</Text>
                                </View>
                            )}
                            {Platform.OS === 'web' ? (
                                <iframe
                                    ref={cameraIframeRef}
                                    srcDoc={localHtmlString}
                                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: 22 }}
                                    allow="camera; microphone"
                                />
                            ) : (
                                <WebView
                                    ref={webViewRef}
                                    originWhitelist={['*']}
                                    source={{ html: localHtmlString }}
                                    style={styles.webView}
                                    onMessage={handleWebViewMessage}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    mediaPlaybackRequiresUserAction={false}
                                    allowsInlineMediaPlayback={true}
                                />
                            )}
                            <View style={[ms.overlayChip, { left: 12 }]} pointerEvents="none">
                                <Text style={ms.chipLabel}>{tr('REPS', 'වට')}</Text>
                                <Text style={ms.chipValue}>{reps}</Text>
                            </View>
                            <View style={[ms.overlayChip, { right: 12, alignItems: 'flex-end' }]} pointerEvents="none">
                                <Text style={ms.chipLabel}>{tr('FORM', 'නිරවද්‍යතාව')}</Text>
                                <Text style={[ms.chipValue, { color: C.primaryDark }]}>{liveScore}%</Text>
                            </View>
                            {visibilityWarning !== '' && (
                                <View style={ms.warning} pointerEvents="none">
                                    <Text style={ms.warningText}>{getTranslatedFeedback(visibilityWarning)}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <View style={ms.feedback}>
                    <Icon name="chat" size={22} color={C.primaryDark} />
                    <Text style={ms.feedbackText}>{getTranslatedFeedback(feedbackMessage)}</Text>
                </View>

                <View style={ms.stats}>
                    <StatTile value={`${liveScore}%`} label={tr('Accuracy', 'නිරවද්‍යතාවය')} style={ms.stat} />
                    <StatTile value={pct(postureMatch)} label={tr('Posture', 'ඉරියව්ව')} style={ms.stat} />
                    <StatTile value={pct(stability)} label={tr('Steadiness', 'ස්ථායීතාවය')} style={ms.stat} />
                    <StatTile value={`${correctReps} / ${reps}`} label={tr('Correct reps', 'නිවැරදි වට')} style={ms.stat} />
                </View>

                <View style={ms.controls}>
                    <SecondaryButton
                        style={{ flex: 1 }}
                        icon={isPaused ? 'play' : 'pause'}
                        title={isPaused ? tr('Resume', 'නැවත අරඹන්න') : tr('Pause', 'විරාමය')}
                        onPress={togglePause}
                    />
                    <PrimaryButton style={{ flex: 1 }} icon="check" title={tr('Finish', 'අවසන් කරන්න')} onPress={handleFinish} />
                </View>

                <Text style={ms.privacy}>{tr('The camera is used only to detect body movement during exercise.', 'ව්‍යායාම අතරතුර ශරීර චලනය හඳුනා ගැනීමට පමණක් කැමරාව භාවිතා කෙරේ.')}</Text>
            </ScrollView>

            <Modal visible={showSummaryModal} transparent animationType="slide">
                <View style={ms.overlay}>
                    <View style={ms.sheet}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ms.sheetContent}>
                            <View style={ms.doneHead}>
                                <View style={ms.doneIcon}><Icon name="check" size={34} color={C.primaryDark} /></View>
                                <Text style={ms.doneTitle}>{tr('Exercise summary', 'ව්‍යායාම සාරාංශය')}</Text>
                                <Text style={ms.doneText}>{getScoreFeedback(liveScore)}</Text>
                            </View>

                            <View style={ms.stats}>
                                <StatTile value={`${liveScore}%`} label={tr('Score', 'ලකුණු')} style={ms.stat} />
                                <StatTile value={String(reps)} label={tr('Reps', 'වට')} style={ms.stat} />
                                <StatTile value={formatTime(timeElapsed)} label={tr('Duration', 'කාලය')} style={ms.stat} />
                            </View>

                            <Card style={ms.q}>
                                <SectionTitle>{tr('Did anything hurt?', 'කිසියම් වේදනාවක් දැනුණාද?')}</SectionTitle>
                                <OptionRow value={painRating} onChange={setPainRating} options={[
                                    { value: 'No', label: tr('No', 'නැත') },
                                    { value: 'Yes', label: tr('Yes', 'ඔව්') },
                                ]} />
                            </Card>
                            <Card style={ms.q}>
                                <SectionTitle>{tr('How hard was it?', 'කෙතරම් අපහසු වීද?')}</SectionTitle>
                                <OptionRow value={difficultyRating} onChange={setDifficultyRating} options={[
                                    { value: 'Easy', label: tr('Easy', 'පහසුයි') },
                                    { value: 'Moderate', label: tr('Okay', 'මධ්‍යම') },
                                    { value: 'Hard', label: tr('Hard', 'අපහසුයි') },
                                ]} />
                            </Card>
                            <Card style={ms.q}>
                                <SectionTitle>{tr('How do you feel now?', 'දැන් ඔබට දැනෙන්නේ කෙසේද?')}</SectionTitle>
                                <OptionRow value={feelingRating} onChange={setFeelingRating} options={[
                                    { value: 'Better', label: tr('Better', 'සුවදායකයි') },
                                    { value: 'Same', label: tr('Same', 'වෙනසක් නැත') },
                                    { value: 'Tired', label: tr('Tired', 'තෙහෙට්ටුයි') },
                                ]} />
                            </Card>

                            <PrimaryButton
                                title={tr('Save workout session', 'ව්‍යායාම සැසිය සුරකින්න')}
                                onPress={submitWorkoutSession}
                                loading={saving}
                                disabled={!surveyReady}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// Layout for the redesigned movement tracking screen (PeriCare exercise mockups)
const ms = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
    title: { ...T.heading, fontSize: 18, color: C.text },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { ...T.semi, fontSize: 12, color: C.textSub },
    timer: { ...T.heading, fontSize: 18, color: C.text, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, overflow: 'hidden', fontVariant: ['tabular-nums'] },
    lang: { minHeight: 44, minWidth: 44, paddingHorizontal: 10, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: C.control, alignItems: 'center', justifyContent: 'center' },
    langText: { ...T.bold, fontSize: 13, color: C.primaryDark },
    scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 14, maxWidth: 1280, width: '100%', alignSelf: 'center' },
    split: { gap: 14 },
    splitWide: { flexDirection: 'row' },
    pane: { gap: 8 },
    paneLabel: { ...T.bold, fontSize: 13, color: C.textSub },
    video: { borderRadius: 22, overflow: 'hidden', backgroundColor: C.video },
    camera: { borderRadius: 22, overflow: 'hidden', backgroundColor: '#3A2547' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    mutedOnDark: { ...T.semi, fontSize: 13, color: C.control, textAlign: 'center' },
    loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 2, backgroundColor: 'rgba(44,26,53,0.6)' },
    overlayChip: { position: 'absolute', top: 12, backgroundColor: 'rgba(250,242,250,0.95)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, zIndex: 3 },
    chipLabel: { ...T.bold, fontSize: 11, color: C.textSub },
    chipValue: { ...T.heading, fontSize: 24, color: C.text },
    warning: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: C.warnBg, borderRadius: 14, padding: 10, zIndex: 3 },
    warningText: { ...T.semi, fontSize: 13, color: C.text, textAlign: 'center' },
    feedback: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.tint, borderRadius: 20, padding: 14 },
    feedbackText: { flex: 1, ...T.semi, fontSize: 15, lineHeight: 21, color: C.primaryDark },
    stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    stat: { flexBasis: 140, flexGrow: 1 },
    controls: { flexDirection: 'row', gap: 12 },
    privacy: { ...T.medium, fontSize: 12, color: C.textSub, textAlign: 'center' },
    overlay: { flex: 1, backgroundColor: 'rgba(44,26,53,0.45)', justifyContent: 'flex-end', alignItems: 'center' },
    sheet: { width: '100%', maxWidth: 560, maxHeight: '96%', backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
    sheetContent: { padding: 20, gap: 14 },
    doneHead: { alignItems: 'center', gap: 8 },
    doneIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center' },
    doneTitle: { ...T.heading, fontSize: 22, color: C.text },
    doneText: { ...T.medium, fontSize: 14, color: C.textSub, textAlign: 'center' },
    q: { gap: 12 },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenBg
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.accent
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.bgTint,
        alignItems: 'center',
        justifyContent: 'center'
    },
    backIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B'
    },
    splitScreenContainer: {
        flex: 1.5,
        flexDirection: 'column',
        marginHorizontal: 16,
        marginTop: 16,
        gap: 16,
    },
    videoHalf: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.accent,
    },
    cameraHalf: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: colors.accent,
    },
    exerciseWebView: {
        flex: 1,
    },
    noVideoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E293B',
    },
    noVideoText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5
    },
    loadingText: {
        color: colors.secondary,
        marginTop: 12,
        fontWeight: '600'
    },
    webView: {
        flex: 1
    },
    warningBanner: {
        position: 'absolute',
        top: 14,
        left: 14,
        right: 14,
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 14,
        zIndex: 10
    },
    warningText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
        textAlign: 'center'
    },
    feedbackBanner: {
        backgroundColor: colors.bgTint,
        marginHorizontal: 16,
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center'
    },
    feedbackText: {
        color: colors.primaryDark,
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center'
    },
    statsCard: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 24,
        padding: 16,
        elevation: 2,
        shadowColor: colors.primary,
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    statBox: {
        alignItems: 'center',
        flex: 1
    },
    statLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
        marginBottom: 4
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1E293B'
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9'
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 6
    },
    statusText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600'
    },
    controlsRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 20,
        gap: 12
    },
    controlBtn: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: colors.primary,
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        ...Platform.select({
            web: {
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
            }
        })
    },
    controlBtnHover: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 5,
        transform: [{ translateY: -2 }]
    },
    pauseBtn: {
        backgroundColor: colors.bgTint,
        borderWidth: 1.5,
        borderColor: colors.accent
    },
    finishBtn: {
        backgroundColor: colors.primary
    },
    controlBtnText: {
        fontWeight: '800',
        fontSize: 15,
        color: colors.primary
    },
    // Finish overrides color to white
    finishBtnText: {
        color: colors.white
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 32,
        padding: 24,
        width: '92%',
        maxWidth: 520,
        alignSelf: 'center',
        maxHeight: '90%',
        alignItems: 'stretch',
        elevation: 6,
        shadowColor: colors.primary,
        shadowOpacity: 0.1,
        shadowRadius: 20
    },
    summaryTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 16
    },
    summaryStatsRow: {
        flexDirection: 'row',
        backgroundColor: colors.bgTint,
        padding: 16,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.accent
    },
    summaryStatBox: {
        flex: 1,
        alignItems: 'center'
    },
    summaryStatVal: {
        fontSize: 20,
        fontWeight: '900',
        color: colors.primary
    },
    summaryStatLbl: {
        fontSize: 10,
        color: colors.primaryDark,
        fontWeight: '600',
        marginTop: 2
    },
    feedbackMsgBox: {
        backgroundColor: colors.bgTint,
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.accent
    },
    feedbackMsgTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.primaryDark,
        marginBottom: 2,
        textAlign: 'center'
    },
    feedbackMsgText: {
        fontSize: 12,
        color: colors.primaryDark,
        textAlign: 'center',
        fontStyle: 'italic'
    },
    surveyContainer: {
        marginVertical: 8
    },
    surveyHeader: {
        fontSize: 14,
        fontWeight: '900',
        color: '#1E293B',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 6
    },
    surveyQuestion: {
        fontSize: 12,
        fontWeight: '800',
        color: '#475569',
        marginVertical: 6
    },
    surveyAnswersRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8
    },
    surveyAnsBtn: {
        flex: 1,
        paddingVertical: 8,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#FAFAF9'
    },
    surveyAnsBtnActive: {
        borderColor: colors.primary,
        backgroundColor: colors.bgTint
    },
    surveyAnsText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B'
    },
    surveyAnsTextActive: {
        color: colors.primary,
        fontWeight: '800'
    },
    submitBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 18
    },
    submitBtnText: {
        color: colors.white,
        fontWeight: '800',
        fontSize: 15
    }
});
