import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    ActivityIndicator,
    Modal,
    Image,
    KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { transliterate } from '../services/sinhalaTransliteration';
import SinhalaKeyboard from '../components/SinhalaKeyboard';
import { useTranslation } from 'react-i18next';
import { useApp } from '../services/AppContext';
import { EMOTION_OPTIONS } from '../constants/emotions';
import { useResponsive } from '../hooks/useResponsive';
import { DASHBOARD_PALETTE as DP, SERIF, DASHBOARD_SHADOWS as DS, typography } from '../theme/dashboardTokens';

// ─── Helpers ────────────────────────────────────────────────────────────────
const toDateString = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const formatDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m, 10) - 1]} ${d}, ${y}`;
};

const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
};

const getMonthName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()];
};

const analyzeSentiment = (text) => {
    if (!text || text.trim().length === 0) return 'Skipped';
    const lower = text.toLowerCase();
    const posWords = ['good', 'great', 'happy', 'better', 'love', 'amazing', 'excellent', 'hope', 'eager', 'content', 'relief', 'smile', 'joy', 'blessed'];
    const negWords = ['sad', 'bad', 'down', 'stress', 'anxious', 'depress', 'tired', 'hate', 'cry', 'pain', 'worst', 'fear', 'overwhelm', 'alone', 'angry'];

    let posCount = 0, negCount = 0;
    posWords.forEach(w => { if (lower.includes(w)) posCount++; });
    negWords.forEach(w => { if (lower.includes(w)) negCount++; });

    if (posCount > negCount) return 'Positive Mind';
    if (negCount > posCount) return 'Negative Mind';
    return 'Neutral Mind';
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon ⛅";
    return "Good Evening 🌙";
};

const THEMES = {
    'default': { bg1: '#FBF8F6', bg2: '#FDFBFA', card: '#FFFFFF', text: '#2C1A35', accent: '#873CA6' },
    'pastel-pink': { bg1: '#FFF7FA', bg2: '#FDFBFA', card: '#FFFFFF', text: '#2C1A35', accent: '#AA60C8' },
    'ocean-blue': { bg1: '#F8FBFC', bg2: '#FDFBFA', card: '#FFFFFF', text: '#2C1A35', accent: '#873CA6' },
    'mint-green': { bg1: '#F5FAF6', bg2: '#FDFBFA', card: '#FFFFFF', text: '#2C1A35', accent: '#3F6B4E' },
    'warm-sunset': { bg1: '#FFF9F5', bg2: '#FDFBFA', card: '#FFFFFF', text: '#2C1A35', accent: '#B7791F' }
};

const today = toDateString(new Date());

export default function DiaryScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const { processDiary } = useApp();
    const r = useResponsive();
    const [selectedDate, setSelectedDate] = useState(today);
    const [content, setContent] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('default');
    const [media, setMedia] = useState([]);
    const [mood, setMood] = useState('happy');
    const [sentiment, setSentiment] = useState('Skipped');

    const [saveStatus, setSaveStatus] = useState('idle');
    const [loading, setLoading] = useState(false);
    const [allDates, setAllDates] = useState([]);
    const [stats, setStats] = useState({ totalJournals: 0, totalWords: 0 });

    const [allJournalsModalVisible, setAllJournalsModalVisible] = useState(false);
    const [monthPickerVisible, setMonthPickerVisible] = useState(false);

    // Auth & Lock
    const [isUnlocked, setIsUnlocked] = useState(true);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [needsSetup, setNeedsSetup] = useState(false);

    // Voice
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');

    // Sinhala Mode
    const [sinhalaMode, setSinhalaMode] = useState(false);
    const [showVisualKeyboard, setShowVisualKeyboard] = useState(false);

    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const debounceRef = useRef(null);

    const handleViewRecommendations = async () => {
        if (content && content.trim().length > 0) {
            try {
                await processDiary(content, mood);
            } catch (err) {
                console.error('Error processing recommendations:', err);
            }
        }
        navigation.navigate('Main', {
            screen: 'Tabs',
            params: {
                screen: 'Recommendations',
                params: { selectedEmoji: mood }
            }
        });
    };
    const recognitionRef = useRef(null);
    const contentRef = useRef('');

    const isToday = selectedDate === today;

    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        loadEntry(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        loadAllDates();
    }, []);

    const loadEntry = async (date) => {
        setLoading(true);
        setSaveStatus('idle');
        try {
            const res = await api.get(`/diary/${date}`);
            const data = res.data || {};
            setContent(data.content || '');
            setIsLocked(data.isLocked || false);
            setCurrentTheme(data.theme || 'default');
            setMedia(data.media || []);
            const loadedMood = data.mood || 'happy';
            const resolvedMoodKey = EMOTION_OPTIONS.find(o => o.key === loadedMood || o.emoji === loadedMood)?.key || 'happy';
            setMood(resolvedMoodKey);
            setSentiment(data.sentiment || analyzeSentiment(data.content || ''));
            setIsUnlocked(!data.isLocked);
        } catch (err) {
            setContent('');
            setIsLocked(false);
            setCurrentTheme('default');
            setMedia([]);
            setMood('happy');
            setSentiment('Skipped');
            setIsUnlocked(true);
        } finally {
            setLoading(false);
        }
    };

    const loadAllDates = async () => {
        try {
            const res = await api.get('/diary');
            if (res.data?.entries) {
                setAllDates(res.data.entries);
                setStats(res.data.stats || { totalJournals: 0, totalWords: 0 });
            }
        } catch (_) { }
    };

    const LEGACY_MOOD_MAP = {
        happy: '😊',
        calm: '😌',
        sad: '😔',
        crying: '😔',
        anxious: '😔',
        frustrated: '😔',
        tired: '😪',
        sleepy: '😪',
        angry: '😠',
    };

    const saveDiary = async (text, locked = isLocked, theme = currentTheme, mediaList = media, m = mood, s = sentiment) => {
        try {
            const backendMood = LEGACY_MOOD_MAP[m] || m;
            await api.post('/diary', {
                date: selectedDate,
                content: text,
                isLocked: locked,
                theme,
                media: mediaList,
                mood: backendMood,
                sentiment: s
            });
            setSaveStatus('saved');
            loadAllDates();
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
            setSaveStatus('error');
            const errorMsg = err.response?.data?.message || 'Failed to save diary';
            Toast.show({
                type: 'error',
                text1: 'Save Failed',
                text2: errorMsg,
                position: 'top',
                visibilityTime: 3000,
            });
        }
    };

    const handleContentChange = (text) => {
        if (!isToday) {
            Toast.show({
                type: 'info',
                text1: 'Cannot Edit',
                text2: 'You can only edit today\'s diary entry',
                position: 'top',
            });
            return;
        }

        let newText = text;
        if (sinhalaMode && text.length > content.length) {
            const lastChar = text[text.length - 1];
            if ([' ', '\n', '.', ',', '?', '!', '\t'].includes(lastChar)) {
                const words = text.split(/(\s+)/);
                const lastWordIndex = words.length - 2;
                const lastWord = words[lastWordIndex];
                if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
                    const siWord = transliterate(lastWord);
                    if (siWord !== lastWord) {
                        words[lastWordIndex] = siWord;
                        newText = words.join('');
                    }
                }
            }
        }

        setContent(newText);
        const newSentiment = analyzeSentiment(newText);
        setSentiment(newSentiment);

        setSaveStatus('saving');
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            saveDiary(newText, isLocked, currentTheme, media, mood, newSentiment);
        }, 1500);
    };

    const addMedia = async (type) => {
        if (!isToday) {
            Toast.show({
                type: 'info',
                text1: 'Not Allowed',
                text2: 'You can only add media to today\'s entry',
                position: 'top',
            });
            return;
        }

        try {
            if (type === 'location') {
                const newMedia = [...media, { type, url: 'geo:0,0', name: `Location ${new Date().toLocaleTimeString()}` }];
                setMedia(newMedia);
                saveDiary(content, isLocked, currentTheme, newMedia, mood, sentiment);
                return;
            }
            let mimeType = '*/*';
            if (type === 'image') mimeType = 'image/*';
            else if (type === 'video') mimeType = 'video/*';
            else if (type === 'audio') mimeType = 'audio/*';
            else if (type === 'document') mimeType = ['application/pdf', 'application/msword', 'text/plain'];

            const result = await DocumentPicker.getDocumentAsync({ type: mimeType, copyToCacheDirectory: true });
            if (result.canceled) return;
            const asset = result.assets[0];
            const newMedia = [...media, { type, url: asset.uri, name: asset.name }];
            setMedia(newMedia);
            saveDiary(content, isLocked, currentTheme, newMedia, mood, sentiment);
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error adding file', position: 'top' });
        }
    };

    const removeMedia = (index) => {
        if (!isToday) {
            Toast.show({ type: 'info', text1: 'Not Allowed', text2: 'You can only edit today\'s entry' });
            return;
        }
        const newMedia = [...media];
        newMedia.splice(index, 1);
        setMedia(newMedia);
        saveDiary(content, isLocked, currentTheme, newMedia, mood, sentiment);
    };

    const changeMood = (m) => {
        if (!isToday) {
            Toast.show({ type: 'info', text1: 'Cannot Edit', text2: 'Only today\'s entry can be modified' });
            return;
        }
        setMood(m);
        saveDiary(content, isLocked, currentTheme, media, m, sentiment);
    };

    const changeTheme = (newTheme) => {
        if (!isToday) {
            Toast.show({ type: 'info', text1: 'Cannot Edit', text2: 'Only today\'s entry can be modified' });
            return;
        }
        setCurrentTheme(newTheme);
        saveDiary(content, isLocked, newTheme, media, mood, sentiment);
    };

    // ====================== VOICE RECOGNITION ======================
    const startListening = useCallback(() => {
        if (Platform.OS !== 'web') {
            Toast.show({ type: 'info', text1: 'Voice input is only available on Web version', position: 'top' });
            return;
        }

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            Toast.show({ type: 'error', text1: 'Speech Recognition not supported', position: 'top' });
            return;
        }

        if (recognitionRef.current) recognitionRef.current.stop();

        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = sinhalaMode ? 'si-LK' : 'en-US';

        recognitionRef.current = recognition;
        let accumulatedTranscript = '';

        recognition.onstart = () => {
            setIsListening(true);
            setInterimTranscript('');
        };

        recognition.onresult = (e) => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const transcript = e.results[i][0].transcript;
                if (e.results[i].isFinal) {
                    accumulatedTranscript += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }
            setInterimTranscript(interim);
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
            if (accumulatedTranscript.trim()) {
                const existing = contentRef.current ? contentRef.current.trim() : '';
                const newContent = existing ? `${existing}\n\n${accumulatedTranscript.trim()}` : accumulatedTranscript.trim();
                handleContentChange(newContent);
            }
        };
        recognition.start();
    }, [sinhalaMode]);

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    const handleVisualKeyPress = (char) => {
        const newContent = content + char;
        setContent(newContent);
        handleContentChange(newContent);
    };

    // ====================== PASSWORD FUNCTIONS ======================
    const handleUnlockSubmit = async () => {
        if (!passwordInput.trim()) return;
        try {
            if (needsSetup) {
                await api.post('/diary/auth/set', { password: passwordInput });
                Toast.show({ type: 'success', text1: 'Password Set Successfully' });
                setNeedsSetup(false);
                setIsUnlocked(true);
                setPasswordModalVisible(false);
                setPasswordInput('');
            } else {
                const res = await api.post('/diary/auth/check', { password: passwordInput });
                if (res.data.valid) {
                    setIsUnlocked(true);
                    setPasswordModalVisible(false);
                    setPasswordInput('');
                } else {
                    Toast.show({ type: 'error', text1: 'Incorrect Password' });
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong';
            Toast.show({ type: 'error', text1: 'Error', text2: msg });
        }
    };

    const toggleLock = async () => {
        if (isLocked) {
            setIsLocked(false);
            saveDiary(content, false);
            Toast.show({ type: 'info', text1: 'Entry Unlocked' });
        } else {
            try {
                const res = await api.post('/diary/auth/check', { password: '' });
                if (res.data.needsSetup) {
                    setNeedsSetup(true);
                }
                setPasswordModalVisible(true);
            } catch (err) {
                setPasswordModalVisible(true);
            }
        }
    };

    const tc = THEMES[currentTheme] || THEMES['default'];

    return (
        <LinearGradient colors={[tc.bg1, tc.bg2]} style={s.safe}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Text style={[s.backIcon, { color: tc.text }]}>←</Text>
                    </TouchableOpacity>
                    <View style={s.headerCenter}>
                        <Text style={[s.headerTitle, { color: tc.text }]}>{t('My Diary')}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')}
                        style={s.langBtn}
                    >
                        <Text style={[s.langText, { color: tc.text, backgroundColor: tc.accent + '33' }]}>
                            {i18n.language === 'en' ? 'සිං' : 'EN'}
                        </Text>
                    </TouchableOpacity>
                </View>

              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingHorizontal: r.hPad, paddingBottom: 40, width: '100%', maxWidth: r.contentMaxWidth('reading'), alignSelf: 'center' }}
                >
                    {/* Analytics & Stats */}
                    <View style={s.insightSection}>
                        <Text style={[s.insightTitle, { color: tc.text }]}>{t('Analytics & Insights')}</Text>
                        <Text style={[s.insightSub, { color: tc.text }]}>{getGreeting()}</Text>
                    </View>

                    <View style={s.statsCardsRow}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setAllJournalsModalVisible(true)} activeOpacity={0.85}>
                            <View style={[s.statCard, { backgroundColor: DP.lav, borderColor: DP.line }]}>
                                <Text style={[s.statNumber, { color: DP.primaryDark }]}>{stats.totalJournals}</Text>
                                <Text style={[s.statLabel, { color: DP.primaryDark }]}>{t('Total Journals')}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={[s.statCard, { backgroundColor: DP.blush, borderColor: DP.blushLine }]}>
                            <Text style={[s.statNumber, { color: DP.blushText }]}>{stats.totalWords}</Text>
                            <Text style={[s.statLabel, { color: DP.blushText }]}>{t('Total Words')}</Text>
                        </View>
                        <View style={[s.statCard, { backgroundColor: DP.sage, borderColor: DP.sageLine }]}>
                            <Text style={[s.statNumber, { color: DP.sageText, fontSize: 18, marginTop: 4 }]}>{currentTime}</Text>
                            <Text style={[s.statLabel, { color: DP.sageText }]}>{t('Current Time')}</Text>
                        </View>
                    </View>

                    {/* ── Calendar Strip ── */}
                    <TouchableOpacity style={s.calendarMonthWrap} onPress={() => setMonthPickerVisible(true)}>
                        <Text style={[s.calendarMonthTitle, { color: tc.text }]}>
                            {t(getMonthName(selectedDate))} {selectedDate.split('-')[0]} ▾
                        </Text>
                    </TouchableOpacity>
                    <View style={s.calendarContainer}>
                        {[-3, -2, -1, 0, 1, 2, 3].map(offset => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() + offset);
                            const ds = toDateString(d);
                            const isSelected = offset === 0;
                            return (
                                <TouchableOpacity
                                    key={offset}
                                    onPress={() => setSelectedDate(ds)}
                                    style={[s.calendarDay, isSelected && [s.calendarDayActive, { backgroundColor: tc.accent }]]}
                                >
                                    <Text numberOfLines={1} adjustsFontSizeToFit style={[s.calendarDayName, isSelected && { color: '#FFF' }]}>{getDayName(ds)}</Text>
                                    <Text numberOfLines={1} style={[s.calendarDayNum, isSelected && { color: '#FFF' }]}>{d.getDate()}</Text>
                                    {ds === today && <View style={[s.dotIndicator, isSelected ? { backgroundColor: '#FFF' } : { backgroundColor: tc.accent }]} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* ── Sentiment and Date Display ── */}
                    <View style={s.sentimentRow}>
                        <View>
                            <Text style={[s.sentimentDate, { color: tc.text }]}>{formatDisplay(selectedDate)}</Text>
                            <Text style={[s.sentimentTitle, { color: tc.text }]}>{t('My mind state')}</Text>
                        </View>
                        <View style={[
                            s.sentimentPill,
                            sentiment === 'Positive Mind' ? { backgroundColor: '#dcfce7' } :
                                sentiment === 'Negative Mind' ? { backgroundColor: '#fee2e2' } :
                                    sentiment === 'Neutral Mind' ? { backgroundColor: '#f1f5f9' } : { backgroundColor: '#fff7ed' }
                        ]}>
                            <Text style={[
                                s.sentimentPillText,
                                sentiment === 'Positive Mind' ? { color: '#166534' } :
                                    sentiment === 'Negative Mind' ? { color: '#991b1b' } :
                                        sentiment === 'Neutral Mind' ? { color: '#475569' } : { color: '#9a3412' }
                            ]}>{sentiment}</Text>
                        </View>
                    </View>

                    {/* ── Emotional Landscape (Mood) ── */}
                    <View style={[s.moodCard, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                        <Text style={[s.moodTitle, { color: tc.text }]}>{t('Emotional Landscape')}</Text>
                        <Text style={[s.moodSub, { color: tc.text }]}>{t('How are you feeling today? Tap to log it.')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.moodScroll}>
                            {EMOTION_OPTIONS.map(opt => (
                                <TouchableOpacity
                                    key={opt.key}
                                    onPress={() => changeMood(opt.key)}
                                    style={[s.moodIconBox, mood === opt.key && { backgroundColor: tc.bg1, borderColor: tc.accent, borderWidth: 2 }]}
                                >
                                    <Text style={s.moodEmoji}>{opt.emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ── Editor Card ── */}
                    <View style={[s.editorCard, { backgroundColor: tc.card, shadowColor: tc.accent }]}>

                        <View style={s.toolbar}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.themeSelector}>
                                {Object.keys(THEMES).map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        onPress={() => changeTheme(t)}
                                        style={[s.themeCircle, { backgroundColor: THEMES[t].accent, borderWidth: currentTheme === t ? 2 : 0, borderColor: '#111827' }]}
                                    />
                                ))}
                            </ScrollView>
                            <View style={s.toolbarRight}>
                                {saveStatus === 'saving' && <ActivityIndicator color={tc.accent} size="small" />}
                                {saveStatus === 'saved' && <Text style={{ fontSize: 10, color: '#10B981' }}>Saved</Text>}
                                <TouchableOpacity onPress={toggleLock} style={[s.iconBox, isLocked && { backgroundColor: '#FEE2E2' }]}>
                                    <Text style={s.iconText}>{isLocked ? '🔒' : '🔓'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    const isSi = !sinhalaMode;
                                    setSinhalaMode(isSi);
                                    setShowVisualKeyboard(isSi);
                                    i18n.changeLanguage(isSi ? 'si' : 'en');
                                }} style={[s.iconBox, sinhalaMode && { backgroundColor: tc.text }]}>
                                    <Text style={[s.iconText, sinhalaMode && { color: '#FFF' }]}>{sinhalaMode ? 'සිං' : 'Abc'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={isListening ? stopListening : startListening} style={[s.iconBox, isListening && { backgroundColor: '#FEE2E2' }]}>
                                    <Text style={s.iconText}>{isListening ? '🔴' : '🎤'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {loading ? (
                            <ActivityIndicator color={tc.accent} size="large" style={{ marginVertical: 30 }} />
                        ) : !isUnlocked ? (
                            <View style={s.lockedContainer}>
                                <Text style={s.lockEmoji}>🔒</Text>
                                <Text style={s.lockedText}>{t('Locked entry.')}</Text>
                                <TouchableOpacity style={[s.unlockBtn, { backgroundColor: tc.accent }]} onPress={() => setPasswordModalVisible(true)}>
                                    <Text style={s.unlockBtnText}>{t('Unlock to Read')}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                {media.length > 0 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.mediaList}>
                                        {media.map((m, idx) => (
                                            <View key={idx} style={s.mediaItemWrapper}>
                                                {m.type === 'image' && m.url ? (
                                                    <Image source={{ uri: m.url }} style={s.mediaImagePreview} blurRadius={0} />
                                                ) : (
                                                    <View style={[s.mediaItemFallback, { backgroundColor: tc.bg1 }]}>
                                                        <Text style={s.mediaItemIcon}>
                                                            {m.type === 'video' ? '🎬' : m.type === 'audio' ? '🎵' : m.type === 'location' ? '📍' : '📄'}
                                                        </Text>
                                                        <Text style={s.mediaFallbackText} numberOfLines={1}>{m.name || 'Attachment'}</Text>
                                                    </View>
                                                )}
                                                <TouchableOpacity onPress={() => removeMedia(idx)} style={s.mediaRemove}>
                                                    <Text style={s.mediaRemoveText}>✕</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}

                                <TextInput
                                    style={[s.textArea, { color: tc.text }]}
                                    multiline
                                    placeholder="Write your thoughts... let's begin your journey within."
                                    placeholderTextColor="#94A3B8"
                                    value={content}
                                    onChangeText={handleContentChange}
                                    textAlignVertical="top"
                                />

                                <TouchableOpacity
                                    style={[s.recBtn, { backgroundColor: tc.accent }]}
                                    onPress={handleViewRecommendations}
                                    activeOpacity={0.8}
                                >
                                    <Text style={s.recBtnText}>
                                        {i18n.language === 'si' ? 'නිර්දේශිත සහන බලන්න 💜' : 'View Recommendations 💜'}
                                    </Text>
                                </TouchableOpacity>

                                {isListening && (
                                    <View style={[s.listeningBar, { borderColor: tc.accent }]}>
                                        <Text style={[s.listeningText, { color: tc.accent }]}>Listening... {interimTranscript}</Text>
                                    </View>
                                )}

                                <View style={s.bottomActions}>
                                    <View style={s.mediaActionBar}>
                                        <TouchableOpacity onPress={() => addMedia('image')} style={s.mediaBtn}><Text style={s.mediaIcon}>🖼️</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => addMedia('video')} style={s.mediaBtn}><Text style={s.mediaIcon}>🎬</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => addMedia('audio')} style={s.mediaBtn}><Text style={s.mediaIcon}>🎵</Text></TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
              </KeyboardAvoidingView>

              {showVisualKeyboard && (
                <SinhalaKeyboard onKeyPress={handleVisualKeyPress} onClose={() => setShowVisualKeyboard(false)} />
              )}
            </SafeAreaView>

            {/* Password Modal */}
            <Modal visible={passwordModalVisible} transparent animationType="fade" onRequestClose={() => setPasswordModalVisible(false)}>
              <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={s.modalOverlay}>
                    <View style={s.modalBox}>
                        <Text style={s.modalTitle}>🔒 Diary Security</Text>
                        <Text style={s.modalSubtitle}>{needsSetup ? "Create a simple password." : "Verify your identity."}</Text>
                        <TextInput
                            style={s.modalInput}
                            placeholder="Password"
                            secureTextEntry
                            value={passwordInput}
                            onChangeText={setPasswordInput}
                            autoFocus
                        />
                        <View style={s.modalActions}>
                            <TouchableOpacity style={s.modalCancel} onPress={() => setPasswordModalVisible(false)}>
                                <Text style={s.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.modalConfirm, { backgroundColor: tc.accent }]} onPress={handleUnlockSubmit}>
                                <Text style={s.modalConfirmText}>{needsSetup ? "Set" : "Unlock"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>

            {/* Month Picker Modal */}
            <Modal visible={monthPickerVisible} transparent animationType="fade">
                <View style={s.modalOverlay}>
                    <View style={s.monthPickerBox}>
                        <Text style={s.modalTitle}>{t('Select Month')}</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                                <TouchableOpacity
                                    key={m}
                                    style={s.monthOption}
                                    onPress={() => {
                                        const newDate = `${new Date().getFullYear()}-${String(idx + 1).padStart(2, '0')}-01`;
                                        setSelectedDate(newDate);
                                        setMonthPickerVisible(false);
                                    }}
                                >
                                    <Text style={s.monthOptionText}>{t(m)}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={s.modalCancel} onPress={() => setMonthPickerVisible(false)}>
                            <Text style={s.modalCancelText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* All Journals Modal */}
            <Modal visible={allJournalsModalVisible} animationType="slide" transparent>
                <View style={s.fullModalOverlay}>
                    <View style={s.fullModalBox}>
                        <View style={s.fullModalHeader}>
                            <Text style={s.fullModalTitle}>{t('All Journals')}</Text>
                            <TouchableOpacity onPress={() => setAllJournalsModalVisible(false)}><Text style={s.fullModalClose}>✕</Text></TouchableOpacity>
                        </View>
                        <ScrollView style={{ flex: 1 }}>
                            {allDates.length === 0 && <Text style={s.emptyListText}>{t('No journals found.')}</Text>}
                            {allDates.map((item, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={s.journalListItem}
                                    onPress={() => {
                                        setSelectedDate(item.date);
                                        setAllJournalsModalVisible(false);
                                    }}
                                >
                                    <View>
                                        <Text style={s.journalListDate}>{formatDisplay(item.date)}</Text>
                                        <Text style={s.journalListDay}>{getDayName(item.date)}</Text>
                                    </View>
                                    <Text style={s.journalListIcon}>📔</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Toast />
        </LinearGradient>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1 },
    header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: DP.card, borderWidth: 1, borderColor: DP.line, alignItems: 'center', justifyContent: 'center', ...DS.soft },
    backIcon: { fontSize: 20, fontWeight: '700', color: DP.text },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '700', fontFamily: SERIF, color: DP.text },

    insightSection: { marginTop: 10, marginBottom: 14 },
    insightTitle: { fontSize: 20, fontWeight: '700', fontFamily: SERIF, color: DP.text },
    insightSub: { fontSize: 13, color: DP.muted, marginTop: 3, fontWeight: '500' },

    statsCardsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    statCard: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 18, alignItems: 'center', borderWidth: 1, ...DS.soft },
    statNumber: { fontSize: 22, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '600', marginTop: 3, textAlign: 'center' },

    calendarMonthWrap: { alignItems: 'center', marginBottom: 10 },
    calendarMonthTitle: { fontSize: 15, fontWeight: '700', color: DP.text, fontFamily: typography.subTopicFont },
    calendarContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, marginBottom: 20 },
    calendarDay: { paddingVertical: 10, flex: 1, minWidth: 0, borderRadius: 16, alignItems: 'center', backgroundColor: DP.card, borderWidth: 1, borderColor: DP.line },
    calendarDayActive: { backgroundColor: DP.primaryDark, borderColor: DP.primaryDark, ...DS.soft },
    calendarDayName: { fontSize: 11, fontWeight: '600', color: DP.muted },
    calendarDayNum: { fontSize: 15, fontWeight: '700', color: DP.text, marginTop: 3 },
    dotIndicator: { width: 4, height: 4, borderRadius: 2, marginTop: 4 },

    sentimentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4, flexWrap: 'wrap', gap: 8 },
    sentimentDate: { fontSize: 12, fontWeight: '500', color: DP.muted },
    sentimentTitle: { fontSize: 16, fontWeight: '700', fontFamily: typography.subTopicFont, color: DP.text, marginTop: 2 },
    sentimentPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: DP.line },
    sentimentPillText: { fontSize: 12, fontWeight: '700' },

    moodCard: { borderRadius: 22, padding: 16, marginBottom: 16, backgroundColor: DP.card, borderWidth: 1, borderColor: DP.line, ...DS.card },
    moodTitle: { fontSize: 15, fontWeight: '700', fontFamily: typography.subTopicFont, color: DP.text },
    moodSub: { fontSize: 12, color: DP.muted, marginTop: 3, marginBottom: 12 },
    moodScroll: { flexDirection: 'row', gap: 10 },
    moodIconBox: { width: 42, height: 42, borderRadius: 21, backgroundColor: DP.side, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: DP.line },
    moodEmoji: { fontSize: 20 },

    editorCard: { borderRadius: 22, padding: 18, minHeight: 380, backgroundColor: DP.card, borderWidth: 1, borderColor: DP.line, ...DS.card },
    toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    themeSelector: { flex: 1, marginRight: 12 },
    themeCircle: { width: 20, height: 20, borderRadius: 10, marginRight: 8 },
    toolbarRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    iconBox: { width: 34, height: 34, backgroundColor: DP.side, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: DP.line },
    iconText: { fontSize: 13, fontWeight: '700', color: DP.nav },

    lockedContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
    lockEmoji: { fontSize: 36, marginBottom: 14 },
    lockedText: { fontSize: 15, color: DP.muted, marginBottom: 20, fontWeight: '500' },
    unlockBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 999, backgroundColor: DP.primaryDark },
    unlockBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

    mediaList: { flexDirection: 'row', marginBottom: 14, maxHeight: 80 },
    mediaItemWrapper: { marginRight: 10, position: 'relative' },
    mediaImagePreview: { width: 72, height: 72, borderRadius: 14 },
    mediaItemFallback: { width: 72, height: 72, borderRadius: 14, alignItems: 'center', justifyContent: 'center', padding: 6, borderWidth: 1, borderColor: DP.line },
    mediaItemIcon: { fontSize: 22, marginBottom: 2 },
    mediaFallbackText: { fontSize: 10, color: DP.muted, textAlign: 'center' },
    mediaRemove: { position: 'absolute', top: -5, right: -5, backgroundColor: DP.blushText, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF', zIndex: 5 },
    mediaRemoveText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },

    textArea: { flex: 1, fontSize: 15, lineHeight: 24, minHeight: 180, color: DP.text, fontFamily: typography.bodyFont },
    recBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
        marginBottom: 8,
        backgroundColor: DP.primaryDark,
        ...DS.soft,
    },
    recBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
        fontFamily: typography.mediumFont,
    },
    listeningBar: { backgroundColor: DP.note, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: DP.noteLine, marginBottom: 12 },
    listeningText: { fontSize: 13, fontWeight: '600', color: DP.primaryDark, fontStyle: 'italic' },

    bottomActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTopWidth: 1, borderTopColor: DP.line2 },
    mediaActionBar: { flexDirection: 'row', gap: 8 },
    mediaBtn: { padding: 8, backgroundColor: DP.side, borderRadius: 12, borderWidth: 1, borderColor: DP.line },
    mediaIcon: { fontSize: 18 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(44, 26, 53, 0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modalBox: { backgroundColor: DP.card, borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, alignSelf: 'center', borderWidth: 1, borderColor: DP.line, ...DS.card },
    modalTitle: { fontSize: 18, fontWeight: '700', fontFamily: SERIF, color: DP.text, marginBottom: 6 },
    modalSubtitle: { fontSize: 13, color: DP.muted, marginBottom: 16 },
    modalInput: { backgroundColor: DP.side, borderRadius: 14, padding: 12, fontSize: 15, marginBottom: 20, borderWidth: 1, borderColor: DP.line, color: DP.text },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    modalCancel: { paddingHorizontal: 14, paddingVertical: 10 },
    modalCancelText: { color: DP.muted, fontWeight: '600', fontSize: 14 },
    modalConfirm: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: DP.primaryDark },
    modalConfirmText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

    langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: DP.card, borderWidth: 1, borderColor: DP.line, ...DS.soft },
    langText: { fontSize: 13, fontWeight: '700', color: DP.primaryDark },

    fullModalOverlay: { flex: 1, backgroundColor: 'rgba(44, 26, 53, 0.45)', justifyContent: 'flex-end' },
    fullModalBox: { backgroundColor: DP.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '80%', padding: 20, width: '100%', maxWidth: 500, alignSelf: 'center' },
    fullModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    fullModalTitle: { fontSize: 20, fontWeight: '700', fontFamily: SERIF, color: DP.text },
    fullModalClose: { fontSize: 20, color: DP.muted, padding: 4 },
    journalListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: DP.line2 },
    journalListDate: { fontSize: 15, fontWeight: '600', color: DP.text },
    journalListDay: { fontSize: 12, color: DP.muted, marginTop: 2 },
    journalListIcon: { fontSize: 18 },
    emptyListText: { textAlign: 'center', marginTop: 40, color: DP.muted, fontSize: 15 },

    monthPickerBox: { backgroundColor: DP.card, borderRadius: 24, padding: 20, width: '100%', maxWidth: 320, alignSelf: 'center', borderWidth: 1, borderColor: DP.line, ...DS.card },
    monthOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: DP.line2 },
    monthOptionText: { fontSize: 15, fontWeight: '600', color: DP.text, textAlign: 'center' },
});
