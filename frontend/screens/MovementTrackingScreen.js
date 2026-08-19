import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Modal,
    Alert, Dimensions, ActivityIndicator, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import exerciseService from '../services/exerciseService';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

// Generate unique session ID
const generateSessionId = () => {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

export default function MovementTrackingScreen({ route, navigation }) {
    const { exerciseId, exerciseName, videoUrl } = route.params;
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language === 'si';

    const getEmbedUrl = (url) => {
        if (!url) return '';
        let videoId = '';
        if (url.includes('youtube.com/embed/')) {
            return url;
        }
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/watch')) {
            const parts = url.split('?');
            if (parts.length > 1) {
                const urlParams = new URLSearchParams(parts[1]);
                videoId = urlParams.get('v');
            }
        }
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1&rel=0&modestbranding=1`;
        }
        return url;
    };

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Initializing...');
    const [reps, setReps] = useState(0);
    const [liveScore, setLiveScore] = useState(0);
    const [stability, setStability] = useState(100);
    const [postureMatch, setPostureMatch] = useState(100);
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

    // Start Timer
    useEffect(() => {
        startTimer();
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
        }
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const togglePause = () => {
        if (isPaused) {
            // Resume
            setIsPaused(false);
            startTimer();
            sendMessageToWebView({ type: 'RESUME' });
        } else {
            // Pause
            setIsPaused(true);
            stopTimer();
            setPauseCount(prev => prev + 1);
            sendMessageToWebView({ type: 'PAUSE' });
        }
    };

    const handleFinish = () => {
        stopTimer();
        sendMessageToWebView({ type: 'PAUSE' });
        setShowSummaryModal(true);
    };

    const sendMessageToWebView = (msg) => {
        if (Platform.OS === 'web') {
            const iframe = document.querySelector('iframe');
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
                    break;
                case 'STATUS':
                    setStatus(data.status);
                    break;
                case 'REP_COUNT':
                    setReps(data.count);
                    break;
                case 'LIVE_SCORE':
                    setLiveScore(data.score);
                    if (data.stability !== undefined) {
                        setStability(data.stability);
                    }
                    if (data.postureMatch !== undefined) {
                        setPostureMatch(data.postureMatch);
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

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

            await exerciseService.saveMovementSession({
                sessionId,
                exerciseId: sanitizedExerciseId,
                exerciseName,
                movementScore: liveScore,
                repetitions: reps,
                activeDuration: timeElapsed,
                pauseCount,
                completed: reps >= 5 || timeElapsed >= 60, // simple threshold for completion
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
                date: new Date().toISOString().split('T')[0],
                exerciseId: sanitizedExerciseId,
                customActivityName: exerciseName,
                status: 'completed',
                durationCompleted: Math.round(timeElapsed / 60) || 1,
                liked: true,
                pain: painRating,
                difficulty: difficultyRating,
                feelingAfter: feelingRating,
                adherenceScore: liveScore,
                accuracy: averageAccuracy,
                performanceMetrics: {
                    postureScore: postureMatch,
                    stabilityScore: stability,
                    rangeOfMotion: averageRangeOfMotion
                }
            });

            Toast.show({
                type: 'success',
                text1: '🎉 Workout session saved successfully!'
            });

            setShowSummaryModal(false);
            navigation.navigate('Exercise'); // go back to Recommendations
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

            // 2. Reference Movement Model (procedural replication of exercise video movement phase targets)
            const ReferenceMovementModel = {
                getExpectedPose: function(detector, cycleTimeSecs) {
                    const phasePercentage = (cycleTimeSecs % 6) / 6;
                    let phase = "starting";
                    let targetAngles = {};
                    
                    if (detector === "Modified Squats") {
                        if (phasePercentage < 0.25) {
                            phase = "squatting";
                            const ratio = phasePercentage / 0.25;
                            targetAngles.knee = 180 - ratio * 70;
                            targetAngles.hip = 180 - ratio * 85;
                        } else if (phasePercentage < 0.5) {
                            phase = "lowest";
                            targetAngles.knee = 110;
                            targetAngles.hip = 95;
                        } else if (phasePercentage < 0.75) {
                            phase = "standing";
                            const ratio = (phasePercentage - 0.5) / 0.25;
                            targetAngles.knee = 110 + ratio * 70;
                            targetAngles.hip = 95 + ratio * 85;
                        } else {
                            phase = "starting";
                            targetAngles.knee = 180;
                            targetAngles.hip = 180;
                        }
                    } else if (detector === "Glute Bridge") {
                        if (phasePercentage < 0.25) {
                            phase = "up";
                            const ratio = phasePercentage / 0.25;
                            targetAngles.hip = 120 + ratio * 55;
                        } else if (phasePercentage < 0.5) {
                            phase = "lowest";
                            targetAngles.hip = 175;
                        } else if (phasePercentage < 0.75) {
                            phase = "lowering";
                            const ratio = (phasePercentage - 0.5) / 0.25;
                            targetAngles.hip = 175 - ratio * 55;
                        } else {
                            phase = "starting";
                            targetAngles.hip = 120;
                        }
                    } else if (detector === "Cat-Cow") {
                        if (phasePercentage < 0.5) {
                            phase = "cow";
                            const ratio = phasePercentage / 0.5;
                            targetAngles.back = 150 + ratio * 20;
                        } else {
                            phase = "cat";
                            const ratio = (phasePercentage - 0.5) / 0.5;
                            targetAngles.back = 170 - ratio * 30;
                        }
                    } else if (detector === "Bird Dog") {
                        if (phasePercentage < 0.25) {
                            phase = "extended";
                            targetAngles.extension = 0.5;
                        } else if (phasePercentage < 0.5) {
                            phase = "lowest";
                            targetAngles.extension = 1.0;
                        } else if (phasePercentage < 0.75) {
                            phase = "returned";
                            targetAngles.extension = 0.5;
                        } else {
                            phase = "starting";
                            targetAngles.extension = 0.0;
                        }
                    } else {
                        if (phasePercentage < 0.25) {
                            phase = "down";
                            targetAngles.amplitude = phasePercentage / 0.25;
                        } else if (phasePercentage < 0.5) {
                            phase = "lowest";
                            targetAngles.amplitude = 1.0;
                        } else if (phasePercentage < 0.75) {
                            phase = "up";
                            targetAngles.amplitude = 1.0 - ((phasePercentage - 0.5) / 0.25);
                        } else {
                            phase = "starting";
                            targetAngles.amplitude = 0.0;
                        }
                    }
                    
                    return { phase, targetAngles };
                }
            };

            // 3. Pose Comparer
            const PoseComparer = {
                compare: function(detector, normalizedUser, normalizedExpected, userAngles, userState, prevUserState) {
                    if (!normalizedUser) return null;
                    
                    let jointAngleAccuracy = 100;
                    let romAccuracy = 100;
                    let bodyPositionAccuracy = 100;
                    let movementDirectionAccuracy = 100;
                    let timingSimilarity = 100;
                    
                    const expectedPhase = normalizedExpected.phase;
                    const targetAngles = normalizedExpected.targetAngles;
                    
                    if (detector === "Modified Squats") {
                        const userKnee = userAngles.knee || 180;
                        const targetKnee = targetAngles.knee || 180;
                        jointAngleAccuracy = Math.max(0, 100 - Math.abs(userKnee - targetKnee) * 1.2);
                        
                        if (expectedPhase === "lowest") {
                            romAccuracy = userKnee < 135 ? Math.min(100, 100 - Math.abs(userKnee - 110) * 1.5) : 50;
                        } else {
                            romAccuracy = 100;
                        }
                    } else if (detector === "Glute Bridge") {
                        const userHip = userAngles.hip || 120;
                        const targetHip = targetAngles.hip || 120;
                        jointAngleAccuracy = Math.max(0, 100 - Math.abs(userHip - targetHip) * 1.2);
                        
                        if (expectedPhase === "lowest") {
                            romAccuracy = userHip > 150 ? Math.min(100, 100 - Math.abs(175 - userHip) * 1.5) : 50;
                        } else {
                            romAccuracy = 100;
                        }
                    } else if (detector === "Cat-Cow") {
                        const userBack = userAngles.back || 160;
                        const targetBack = targetAngles.back || 160;
                        jointAngleAccuracy = Math.max(0, 100 - Math.abs(userBack - targetBack) * 1.5);
                        romAccuracy = 100;
                    } else if (detector === "Bird Dog") {
                        const userExt = userAngles.extension || 0;
                        const targetExt = targetAngles.extension || 0;
                        jointAngleAccuracy = Math.max(0, 100 - Math.abs(userExt - targetExt) * 100);
                        romAccuracy = userExt > 0.7 ? 100 : 50;
                    } else {
                        const userAmp = userAngles.amplitude || 0;
                        const targetAmp = targetAngles.amplitude || 0;
                        jointAngleAccuracy = Math.max(0, 100 - Math.abs(userAmp - targetAmp) * 100);
                        romAccuracy = userAmp > 0.7 ? 100 : 50;
                    }
                    
                    let totalDist = 0;
                    let validPoints = 0;
                    const keyIndices = [11, 12, 23, 24, 25, 26, 27, 28];
                    
                    keyIndices.forEach(idx => {
                        const lm = normalizedUser.landmarks[idx];
                        if (lm && lm.visibility > 0.5) {
                            let expectedPos = { x: 0, y: 0 };
                            if (idx === 11) expectedPos = { x: -0.3, y: -1.0 };
                            if (idx === 12) expectedPos = { x: 0.3, y: -1.0 };
                            if (idx === 23) expectedPos = { x: -0.2, y: 0.0 };
                            if (idx === 24) expectedPos = { x: 0.2, y: 0.0 };
                            
                            if (detector === "Modified Squats" && expectedPhase === "lowest") {
                                if (idx === 23 || idx === 24) expectedPos.y += 0.2;
                            }
                            if (detector === "Glute Bridge" && expectedPhase === "lowest") {
                                if (idx === 23 || idx === 24) expectedPos.y -= 0.3;
                            }
                            
                            const dist = Math.sqrt(Math.pow(lm.x - expectedPos.x, 2) + Math.pow(lm.y - expectedPos.y, 2));
                            totalDist += dist;
                            validPoints++;
                        }
                    });
                    
                    if (validPoints > 0) {
                        const avgDist = totalDist / validPoints;
                        bodyPositionAccuracy = Math.max(0, Math.min(100, 100 - avgDist * 80));
                    } else {
                        bodyPositionAccuracy = 80;
                    }
                    
                    let expectedDirection = "none";
                    if (expectedPhase === "down" || expectedPhase === "squatting" || expectedPhase === "up" && detector === "Glute Bridge" || expectedPhase === "extended") {
                        expectedDirection = "active";
                    } else if (expectedPhase === "standing" || expectedPhase === "lowering" || expectedPhase === "returned") {
                        expectedDirection = "return";
                    }
                    
                    let userDirection = "none";
                    if (userState === "squatting" || userState === "up" || userState === "extended" || userState === "cow") {
                        userDirection = "active";
                    } else if (userState === "standing" || userState === "lowering" || userState === "returned" || userState === "cat") {
                        userDirection = "return";
                    }
                    
                    if (expectedDirection === "none") {
                        movementDirectionAccuracy = 100;
                    } else if (userDirection === expectedDirection) {
                        movementDirectionAccuracy = 100;
                    } else if (userDirection === "none") {
                        movementDirectionAccuracy = 75;
                    } else {
                        movementDirectionAccuracy = 35;
                    }
                    
                    if (userState === expectedPhase || 
                       (expectedPhase === "lowest" && (userState === "squatting" || userState === "up")) ||
                       (expectedPhase === "starting" && (userState === "standing" || userState === "neutral"))) {
                        timingSimilarity = 100;
                    } else if (userState === "neutral" || userState === "none") {
                        timingSimilarity = 70;
                    } else {
                        timingSimilarity = 40;
                    }
                    
                    return {
                        jointAngleAccuracy: Math.round(jointAngleAccuracy),
                        romAccuracy: Math.round(romAccuracy),
                        bodyPositionAccuracy: Math.round(bodyPositionAccuracy),
                        movementDirectionAccuracy: Math.round(movementDirectionAccuracy),
                        timingSimilarity: Math.round(timingSimilarity)
                    };
                }
            };

            // 4. Scoring Configuration (Configurable weights)
            const ScoringConfig = {
                weights: {
                    jointAngle: 0.30,
                    rom: 0.25,
                    bodyPosition: 0.20,
                    movementDirection: 0.15,
                    timing: 0.10
                },
                calculateFinalScore: function(m) {
                    return Math.round(
                        m.jointAngleAccuracy * this.weights.jointAngle +
                        m.romAccuracy * this.weights.rom +
                        m.bodyPositionAccuracy * this.weights.bodyPosition +
                        m.movementDirectionAccuracy * this.weights.movementDirection +
                        m.timingSimilarity * this.weights.timing
                    );
                }
            };

            // 5. Feedback Engine
            const FeedbackEngine = {
                generateFeedback: function(m, visibilityWarning, detector) {
                    if (visibilityWarning) return visibilityWarning;
                    
                    const list = [
                        { name: 'rom', score: m.romAccuracy },
                        { name: 'direction', score: m.movementDirectionAccuracy },
                        { name: 'angle', score: m.jointAngleAccuracy },
                        { name: 'position', score: m.bodyPositionAccuracy },
                        { name: 'timing', score: m.timingSimilarity }
                    ].sort((a, b) => a.score - b.score);
                    
                    const lowest = list[0];
                    if (lowest.score >= 80) return "Great! Your movement matches the exercise.";
                    
                    if (lowest.name === 'rom') return "Try moving through a larger range of motion.";
                    if (lowest.name === 'direction') return "Follow the movement shown in the video.";
                    if (lowest.name === 'angle') {
                        if (detector === "Modified Squats") return "Try keeping your knees aligned with your feet.";
                        return "Adjust your joint angles to match the video.";
                    }
                    if (lowest.name === 'position') return "Correct your body position to match the video.";
                    return "Adjust your pace to match the video timing.";
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
                            
                            const repAccuracy = lastLiveAccuracy;
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
                            
                            const repAccuracy = lastLiveAccuracy;
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
                    userAngles = { extension: ext1 || ext2 ? 1.0 : 0.0 };

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
                            
                            const repAccuracy = lastLiveAccuracy;
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
                            
                            const repAccuracy = lastLiveAccuracy;
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
                                    
                                    const repAccuracy = lastLiveAccuracy;
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

                // Reference Guide Comparison
                const cycleTimeSecs = (Date.now() - startTime) / 1000;
                const expectedPose = ReferenceMovementModel.getExpectedPose(activeDetector, cycleTimeSecs);
                const metrics = PoseComparer.compare(activeDetector, normalizedUser, expectedPose, userAngles, state, null);
                
                if (metrics) {
                    const accuracyScore = ScoringConfig.calculateFinalScore(metrics);
                    lastLiveAccuracy = accuracyScore;

                    accuraciesHistory.push(accuracyScore);
                    romsHistory.push(metrics.romAccuracy);
                    jointsHistory.push(metrics.jointAngleAccuracy);

                    const avgAccuracy = Math.round(accuraciesHistory.reduce((s, x) => s + x, 0) / accuraciesHistory.length) || 0;
                    const avgRom = Math.round(romsHistory.reduce((s, x) => s + x, 0) / romsHistory.length) || 0;
                    const avgJoint = Math.round(jointsHistory.reduce((s, x) => s + x, 0) / jointsHistory.length) || 0;

                    let stabilityVal = 100;
                    if (activeDetector === "Bird Dog" && stabilityVariance.length > 0) {
                        const avgT = stabilityVariance.reduce((s, x) => s + x, 0) / stabilityVariance.length;
                        stabilityVal = Math.round(Math.max(50, 100 - avgT * 300));
                    }

                    sendMessage({
                        type: 'LIVE_SCORE',
                        score: accuracyScore,
                        stability: stabilityVal,
                        postureMatch: metrics.timingSimilarity,
                        feedback: FeedbackEngine.generateFeedback(metrics, false, activeDetector),
                        averageAccuracy: avgAccuracy,
                        correctRepetitions: correctReps,
                        incorrectRepetitions: incorrectReps,
                        averageRangeOfMotion: avgRom,
                        averageJointAccuracy: avgJoint
                    });
                }
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
                            stability: 0,
                            postureMatch: 0,
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
                        stability: 0,
                        postureMatch: 0,
                        feedback: 'Please move fully into the camera view.'
                    });
                }
            }

            // Setup camera feed
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
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
                    loadingElement.innerText = "Camera error: " + err.message;
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

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{exerciseName}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Split Screen Container */}
            <View style={styles.splitScreenContainer}>
                {/* Side 1: Exercise Demo Video */}
                <View style={styles.videoHalf}>
                    {videoUrl ? (
                        Platform.OS === 'web' ? (
                            <iframe
                                src={getEmbedUrl(videoUrl)}
                                style={{ width: '100%', height: '100%', border: 'none', borderRadius: 28 }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <WebView
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
                        <View style={styles.noVideoContainer}>
                            <Text style={styles.noVideoText}>No demo video available</Text>
                        </View>
                    )}
                </View>

                {/* Side 2: Camera Feed / WebView */}
                <View style={styles.cameraHalf}>
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#7C3AED" />
                            <Text style={styles.loadingText}>Loading AI movement models...</Text>
                        </View>
                    )}

                    {Platform.OS === 'web' ? (
                        <iframe
                            srcDoc={localHtmlString}
                            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 28 }}
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

                    {/* Low visibility indicator */}
                    {visibilityWarning !== '' && (
                        <View style={styles.warningBanner}>
                            <Text style={styles.warningText}>⚠️ {visibilityWarning}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Real-time Feedback Banner */}
            <View style={styles.feedbackBanner}>
                <Text style={styles.feedbackText}>{getTranslatedFeedback(feedbackMessage)}</Text>
            </View>

            {/* Dashboard Statistics */}
            <View style={styles.statsCard}>
                <View style={styles.statRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>{isSinhala ? 'කාලය' : 'Timer'}</Text>
                        <Text style={styles.statValue}>{formatTime(timeElapsed)}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>{isSinhala ? 'වට (මුළු)' : 'Reps (Total)'}</Text>
                        <Text style={styles.statValue}>{reps}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>{isSinhala ? 'නිවැරදි වට' : 'Correct Reps'}</Text>
                        <Text style={[styles.statValue, { color: '#10B981' }]}>{correctReps}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>{isSinhala ? 'නිරවද්‍යතාවය' : 'Accuracy'}</Text>
                        <Text style={[styles.statValue, { color: '#7C3AED' }]}>{liveScore}%</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>{isSinhala ? 'වීඩියෝ ගැළපීම' : 'Video Match'}</Text>
                        <Text style={[styles.statValue, { color: '#6366F1' }]}>{postureMatch}%</Text>
                    </View>
                </View>
                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                    <Text style={styles.statusText}>{isSinhala ? 'තත්ත්වය: ' : 'Status: '}{getTranslatedStatus(status)}</Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsRow}>
                <TouchableOpacity style={[styles.controlBtn, styles.pauseBtn]} onPress={togglePause}>
                    <Text style={styles.controlBtnText}>
                        {isPaused 
                            ? (isSinhala ? '▶️ නැවත අරඹන්න' : '▶ Resume') 
                            : (isSinhala ? '⏸️ විරාමය' : '⏸ Pause')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, styles.finishBtn]} onPress={handleFinish}>
                    <Text style={styles.controlBtnText}>{isSinhala ? '🏁 අවසන් කරන්න' : '🏁 Finish'}</Text>
                </TouchableOpacity>
            </View>

            {/* Post-Workout Summary & Survey Modal */}
            <Modal visible={showSummaryModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.summaryTitle}>{isSinhala ? 'ව්‍යායාම සාරාංශය' : 'Exercise Summary'}</Text>

                        {/* Stats Cards */}
                        <View style={styles.summaryStatsRow}>
                            <View style={styles.summaryStatBox}>
                                <Text style={styles.summaryStatVal}>{liveScore}%</Text>
                                <Text style={styles.summaryStatLbl}>{isSinhala ? 'ලකුණු' : 'Score'}</Text>
                            </View>
                            <View style={styles.summaryStatBox}>
                                <Text style={styles.summaryStatVal}>{reps}</Text>
                                <Text style={styles.summaryStatLbl}>{isSinhala ? 'වට' : 'Reps'}</Text>
                            </View>
                            <View style={styles.summaryStatBox}>
                                <Text style={styles.summaryStatVal}>{formatTime(timeElapsed)}</Text>
                                <Text style={styles.summaryStatLbl}>{isSinhala ? 'කාලය' : 'Duration'}</Text>
                            </View>
                            {(exerciseName === 'Bird Dog' || exerciseName.toLowerCase().includes('bird')) && (
                                <View style={styles.summaryStatBox}>
                                    <Text style={styles.summaryStatVal}>{stability}%</Text>
                                    <Text style={styles.summaryStatLbl}>{isSinhala ? 'ස්ථායීතාවය' : 'Stability'}</Text>
                                </View>
                            )}
                        </View>

                        {/* Score Feedback adaptation */}
                        <View style={styles.feedbackMsgBox}>
                            <Text style={styles.feedbackMsgTitle}>{isSinhala ? 'කාර්ය සාධන මට්ටම' : 'Performance Rating'}</Text>
                            <Text style={styles.feedbackMsgText}>"{getScoreFeedback(liveScore)}"</Text>
                        </View>

                        {/* Survey Questions */}
                        <View style={styles.surveyContainer}>
                            <Text style={styles.surveyHeader}>{isSinhala ? 'ව්‍යායාමයෙන් පසු ප්‍රතිපෝෂණය' : 'Post-Workout Feedback'}</Text>

                            {/* Q1: Pain */}
                            <Text style={styles.surveyQuestion}>{isSinhala ? '1. ව්‍යායාම අතරතුර ඔබට වේදනාකාරී බවක් දැනුණාද?' : '1. Did you feel pain during exercise?'}</Text>
                            <View style={styles.surveyAnswersRow}>
                                {['Yes', 'No'].map(ans => (
                                    <TouchableOpacity
                                        key={ans}
                                        style={[styles.surveyAnsBtn, painRating === ans && styles.surveyAnsBtnActive]}
                                        onPress={() => setPainRating(ans)}
                                    >
                                        <Text style={[styles.surveyAnsText, painRating === ans && styles.surveyAnsTextActive]}>
                                            {isSinhala ? (ans === 'Yes' ? 'ඔව්' : 'නැත') : ans}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Q2: Difficulty */}
                            <Text style={styles.surveyQuestion}>{isSinhala ? '2. ව්‍යායාමය කෙතරම් අපහසු වීද?' : '2. How difficult was the exercise?'}</Text>
                            <View style={styles.surveyAnswersRow}>
                                {['Easy', 'Moderate', 'Hard'].map(ans => (
                                    <TouchableOpacity
                                        key={ans}
                                        style={[styles.surveyAnsBtn, difficultyRating === ans && styles.surveyAnsBtnActive]}
                                        onPress={() => setDifficultyRating(ans)}
                                    >
                                        <Text style={[styles.surveyAnsText, difficultyRating === ans && styles.surveyAnsTextActive]}>
                                            {isSinhala ? (ans === 'Easy' ? 'පහසුයි' : ans === 'Moderate' ? 'මධ්‍යම' : 'අපහසුයි') : ans}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Q3: Feeling */}
                            <Text style={styles.surveyQuestion}>{isSinhala ? '3. ව්‍යායාමයෙන් පසු ඔබට දැනෙන්නේ කෙසේද?' : '3. How do you feel after exercise?'}</Text>
                            <View style={styles.surveyAnswersRow}>
                                {['Better', 'Same', 'Tired'].map(ans => (
                                    <TouchableOpacity
                                        key={ans}
                                        style={[styles.surveyAnsBtn, feelingRating === ans && styles.surveyAnsBtnActive]}
                                        onPress={() => setFeelingRating(ans)}
                                    >
                                        <Text style={[styles.surveyAnsText, feelingRating === ans && styles.surveyAnsTextActive]}>
                                            {isSinhala ? (ans === 'Better' ? 'සුවදායකයි' : ans === 'Same' ? 'වෙනසක් නැත' : 'තෙහෙට්ටුයි') : ans}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                (!painRating || !difficultyRating || !feelingRating) && { opacity: 0.5 }
                            ]}
                            disabled={!painRating || !difficultyRating || !feelingRating || saving}
                            onPress={submitWorkoutSession}
                        >
                            {saving ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitBtnText}>{isSinhala ? 'ව්‍යායාම සැසිය සුරකින්න' : 'Save Workout Session'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F4FF'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EBE0FF'
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FAF5FF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    backIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#7C3AED'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B'
    },
    splitScreenContainer: {
        flex: 1.5,
        flexDirection: width > 700 ? 'row' : 'column',
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
        borderColor: '#EBE0FF',
    },
    cameraHalf: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#EBE0FF',
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
        color: '#B39DDB',
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
        backgroundColor: '#F5F3FF',
        marginHorizontal: 16,
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#EBE0FF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    feedbackText: {
        color: '#6D28D9',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center'
    },
    statsCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 24,
        padding: 16,
        elevation: 2,
        shadowColor: '#7C3AED',
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
        shadowColor: '#7C3AED',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 }
    },
    pauseBtn: {
        backgroundColor: '#FAF5FF',
        borderWidth: 1.5,
        borderColor: '#E9D5FF'
    },
    finishBtn: {
        backgroundColor: '#7C3AED'
    },
    controlBtnText: {
        fontWeight: '800',
        fontSize: 15,
        color: '#7C3AED'
    },
    // Finish overrides color to white
    finishBtnText: {
        color: '#FFF'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 32,
        padding: 24,
        width: width - 32,
        maxHeight: '90%',
        alignItems: 'stretch',
        elevation: 6,
        shadowColor: '#7C3AED',
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
        backgroundColor: '#FAF5FF',
        padding: 16,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E9D5FF'
    },
    summaryStatBox: {
        flex: 1,
        alignItems: 'center'
    },
    summaryStatVal: {
        fontSize: 20,
        fontWeight: '900',
        color: '#7C3AED'
    },
    summaryStatLbl: {
        fontSize: 10,
        color: '#6D28D9',
        fontWeight: '600',
        marginTop: 2
    },
    feedbackMsgBox: {
        backgroundColor: '#F5F3FF',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#DDD6FE'
    },
    feedbackMsgTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#6D28D9',
        marginBottom: 2,
        textAlign: 'center'
    },
    feedbackMsgText: {
        fontSize: 12,
        color: '#4C1D95',
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
        borderColor: '#7C3AED',
        backgroundColor: '#F5F3FF'
    },
    surveyAnsText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B'
    },
    surveyAnsTextActive: {
        color: '#7C3AED',
        fontWeight: '800'
    },
    submitBtn: {
        backgroundColor: '#7C3AED',
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 18
    },
    submitBtnText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 15
    }
});
