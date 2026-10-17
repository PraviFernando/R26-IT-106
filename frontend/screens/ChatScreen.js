import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../hooks/useResponsive';
import { LinearGradient } from 'expo-linear-gradient';
import {
    useAudioRecorder,
    useAudioRecorderState,
    AudioModule,
    setAudioModeAsync,
    RecordingPresets,
} from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';
import SinhalaKeyboard from '../components/SinhalaKeyboard';
import MarkdownText from '../components/MarkdownText';
import QuickActionsPanel from '../components/QuickActionsPanel';
import { colors, spacing, radius, shadows } from '../theme';

function formatElapsed(ms) {
    const totalSeconds = Math.floor((ms || 0) / 1000);
    const m = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
}

function mapDocToMessage(doc) {
    return {
        id: String(doc._id),
        role: doc.role,
        content: doc.content,
        sources: doc.sources || [],
        category: doc.category,
        guardrailZone: doc.guardrailZone,
        isCrisis: doc.isCrisis,
        feedback: doc.feedback,
        createdAt: doc.createdAt,
        // Routine suggestions are ephemeral (not persisted on ChatMessage) — never present
        // when reloading history, only right after a live send.
        suggestedRoutineItems: [],
        addedRoutineItemIds: [],
    };
}

export default function ChatScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const r = useResponsive();
    const [headerH, setHeaderH] = useState(52);
    const userId = user?.id || user?._id || user?.email || 'default';
    const storageKey = `chat_session_${userId}`;
    const disclaimerKey = `chat_disclaimer_shown_${userId}`;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [sending, setSending] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [showSinhalaKeyboard, setShowSinhalaKeyboard] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const listRef = useRef(null);
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(recorder);

    useEffect(() => {
        AsyncStorage.getItem(disclaimerKey).then((shown) => {
            if (!shown) setShowDisclaimer(true);
        });
    }, []);

    const handleDismissDisclaimer = async () => {
        setShowDisclaimer(false);
        await AsyncStorage.setItem(disclaimerKey, 'true');
    };

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const storedSessionId = await AsyncStorage.getItem(storageKey);
                if (storedSessionId) {
                    const history = await chatService.getHistory(storedSessionId);
                    if (isMounted) {
                        setSessionId(storedSessionId);
                        setMessages(history.map(mapDocToMessage));
                    }
                }
            } catch (err) {
                console.error('Failed to load chat history:', err);
            } finally {
                if (isMounted) setInitialLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    const sendText = async (text) => {
        if (!text || sending) return;

        const userMsg = {
            id: `local-${Date.now()}`,
            role: 'user',
            content: text,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setSending(true);

        try {
            const result = await chatService.sendMessage(text, sessionId, i18n.language);
            const assistantMsg = {
                id: String(result.messageId),
                role: 'assistant',
                content: result.reply,
                sources: result.sources || [],
                category: result.category,
                guardrailZone: result.guardrailZone,
                isCrisis: result.isCrisis,
                feedback: null,
                createdAt: new Date().toISOString(),
                suggestedRoutineItems: result.suggestedRoutineItems || [],
                addedRoutineItemIds: [],
            };
            setMessages((prev) => [...prev, assistantMsg]);

            if (!sessionId) {
                setSessionId(result.sessionId);
                await AsyncStorage.setItem(storageKey, result.sessionId);
            }
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: `❌ ${t('Message failed')}`,
                text2: err.response?.data?.message || t('Could not reach the server. Try again.'),
                position: 'top',
            });
        } finally {
            setSending(false);
        }
    };

    const handleSend = () => {
        const text = input.trim();
        sendText(text);
    };

    const handleQuickAction = (text) => {
        sendText(text);
    };

    const handleFeedback = async (messageId, rating) => {
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, feedback: rating } : m)));
        try {
            await chatService.sendFeedback(messageId, rating);
        } catch (err) {
            setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, feedback: null } : m)));
            Toast.show({
                type: 'error',
                text1: `❌ ${t('Feedback failed')}`,
                text2: t('Could not save your rating.'),
                position: 'top',
            });
        }
    };

    const handleAddRoutineItem = async (messageId, item) => {
        try {
            await chatService.addRoutineItem(item);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageId
                        ? { ...m, addedRoutineItemIds: [...m.addedRoutineItemIds, item.activityId] }
                        : m
                )
            );
            Toast.show({
                type: 'success',
                text1: `✅ ${t("Added to today's routine")}`,
                text2: item.activityName,
                position: 'top',
            });
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: `❌ ${t('Could not add activity')}`,
                text2: err.response?.data?.message || t('Could not reach the server. Try again.'),
                position: 'top',
            });
        }
    };

    const handleKeyboardKeyPress = (char) => {
        if (char === 'SPACE') setInput((t) => t + ' ');
        else if (char === 'BACKSPACE') setInput((t) => t.slice(0, -1));
        else setInput((t) => t + char);
    };

    const handleMicPress = async () => {
        if (recorderState.isRecording) {
            await recorder.stop();
            setTranscribing(true);
            try {
                const { text } = await chatService.transcribeAudio(recorder.uri);
                if (text) {
                    setInput((prev) => (prev ? `${prev} ${text}` : text));
                }
            } catch (err) {
                Toast.show({
                    type: 'error',
                    text1: `❌ ${t('Transcription failed')}`,
                    text2: err.response?.data?.message || t('Could not reach the server. Try again.'),
                    position: 'top',
                });
            } finally {
                setTranscribing(false);
            }
            return;
        }

        try {
            const permission = await AudioModule.requestRecordingPermissionsAsync();
            if (!permission.granted) {
                Toast.show({ type: 'error', text1: `🎙️ ${t('Microphone permission needed')}`, position: 'top' });
                return;
            }
            await setAudioModeAsync({ allowsRecording: true });
            await recorder.prepareToRecordAsync();
            recorder.record();
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: `❌ ${t('Could not start recording')}`,
                text2: err.message || t('Could not reach the server. Try again.'),
                position: 'top',
            });
        }
    };

    const renderMessage = ({ item }) => {
        if (item.role === 'user') {
            return (
                <View style={[s.bubbleRow, s.bubbleRowUser]}>
                    <View style={[s.bubble, s.userBubble]}>
                        <Text style={s.userText}>{item.content}</Text>
                    </View>
                </View>
            );
        }

        const isCrisis = item.isCrisis;
        const isRejected = item.guardrailZone === 'reject';

        return (
            <View style={[s.bubbleRow, s.bubbleRowAssistant]}>
                <View style={s.assistantColumn}>
                <View
                    style={[
                        s.bubble,
                        s.assistantBubble,
                        isCrisis && s.crisisBubble,
                        isRejected && s.rejectedBubble,
                    ]}
                >
                    <MarkdownText
                        text={item.content}
                        style={s.assistantText}
                        mutedStyle={isRejected ? s.mutedText : undefined}
                    />

                    {item.sources && item.sources.length > 0 && (
                        <View style={s.sourcesRow}>
                            {item.sources.map((src, i) => (
                                <View key={i} style={s.sourceChip}>
                                    <Text style={s.sourceChipText} numberOfLines={1}>
                                        📄 {src.title}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {!isCrisis && (
                        <View style={s.feedbackRow}>
                            <TouchableOpacity onPress={() => handleFeedback(item.id, 'up')}>
                                <Text style={[s.feedbackIcon, item.feedback === 'up' && s.feedbackActive]}>👍</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleFeedback(item.id, 'down')}>
                                <Text style={[s.feedbackIcon, item.feedback === 'down' && s.feedbackActive]}>👎</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {item.suggestedRoutineItems && item.suggestedRoutineItems.length > 0 && (
                    <View style={s.routineCard}>
                        <Text style={s.routineCardTitle}>{t("Add to today's routine")}</Text>
                        {item.suggestedRoutineItems.map((routineItem) => {
                            const added = item.addedRoutineItemIds.includes(routineItem.activityId);
                            return (
                                <View key={routineItem.activityId} style={s.routineRow}>
                                    <Text style={s.routineRowIcon}>{routineItem.icon}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.routineRowName}>{routineItem.activityName}</Text>
                                        <Text style={s.routineRowTime}>{routineItem.timeOfDay}</Text>
                                    </View>
                                    <TouchableOpacity
                                        disabled={added}
                                        onPress={() => handleAddRoutineItem(item.id, routineItem)}
                                        style={[s.routineAddBtn, added && s.routineAddBtnDone]}
                                    >
                                        <Text style={s.routineAddBtnText}>{added ? t('Added ✓') : t('+ Add')}</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}
                </View>
            </View>
        );
    };

    if (initialLoading) {
        return (
            <SafeAreaView style={s.centerScreen}>
                <ActivityIndicator size="large" color={colors.lavenderDark} />
                <Text style={s.centerText}>{t('Loading conversation...')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.container} edges={['top', 'bottom']}>
            <Modal visible={showDisclaimer} transparent animationType="fade">
                <View style={s.disclaimerOverlay}>
                    <View style={s.disclaimerCard}>
                        <Text style={s.disclaimerTitle}>{t('Before you start')}</Text>
                        <Text style={s.disclaimerText}>
                            {t(
                                "This is a support tool, not a substitute for professional medical care. If you're in crisis, please contact the 1926 helpline or emergency services."
                            )}
                        </Text>
                        <TouchableOpacity onPress={handleDismissDisclaimer} style={s.disclaimerBtn}>
                            <Text style={s.disclaimerBtnText}>{t('I understand')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View
                style={s.header}
                onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backBtnText}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>{t('Chat Support')}</Text>
                <View style={{ width: 32 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? headerH + r.insets.top : 0}
            >
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={[s.listContent, { maxWidth: r.contentMaxWidth('reading'), width: '100%', alignSelf: 'center' }]}
                    onScrollBeginDrag={() => Keyboard.dismiss()}
                    onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
                    ListEmptyComponent={
                        <View style={s.welcomeBox}>
                            <Text style={s.welcomeText}>
                                {t(
                                    "Hi, I'm here to help with postpartum mental health and newborn care questions. Ask me anything."
                                )}
                            </Text>
                            <QuickActionsPanel
                                isSinhala={i18n.language === 'si'}
                                onSelect={handleQuickAction}
                                disabled={sending}
                            />
                        </View>
                    }
                />

                {showSinhalaKeyboard && (
                    <SinhalaKeyboard onKeyPress={handleKeyboardKeyPress} onClose={() => setShowSinhalaKeyboard(false)} />
                )}

                {recorderState.isRecording && (
                    <View style={s.recordingBanner}>
                        <View style={s.recordingDot} />
                        <Text style={s.recordingText}>{t('Recording...')} {formatElapsed(recorderState.currentTime * 1000)}</Text>
                    </View>
                )}

                <View style={s.inputRow}>
                    <TouchableOpacity
                        onPress={() => {
                            Keyboard.dismiss();
                            setShowSinhalaKeyboard((v) => !v);
                        }}
                        style={s.siButton}
                    >
                        <Text style={s.siButtonText}>සි</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleMicPress}
                        disabled={transcribing}
                        style={[s.micButton, recorderState.isRecording && s.micButtonActive]}
                    >
                        {transcribing ? (
                            <ActivityIndicator size="small" color={colors.lavenderDark} />
                        ) : (
                            <Text style={s.micButtonText}>{recorderState.isRecording ? '⏹' : '🎙️'}</Text>
                        )}
                    </TouchableOpacity>

                    <TextInput
                        style={s.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder={t('Type your question...')}
                        placeholderTextColor={colors.textMuted}
                        multiline
                    />

                    <TouchableOpacity onPress={handleSend} disabled={sending || !input.trim()} style={s.sendBtnWrap}>
                        <LinearGradient
                            colors={sending || !input.trim() ? [colors.textMuted, colors.textMuted] : ['#8E24AA', '#D81B60']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.sendBtn}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <Text style={s.sendBtnText}>➤</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.offWhite },
    centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.offWhite },
    centerText: { marginTop: 12, fontSize: 14, color: colors.textSecondary, fontWeight: '600' },

    disclaimerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(61, 42, 94, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    disclaimerCard: {
        backgroundColor: colors.white,
        borderRadius: radius.xl,
        padding: spacing.lg,
        width: '100%',
        maxWidth: 360,
        ...shadows.strong,
    },
    disclaimerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
    disclaimerText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: spacing.lg },
    disclaimerBtn: {
        backgroundColor: colors.lavenderDark,
        borderRadius: radius.full,
        paddingVertical: 12,
        alignItems: 'center',
    },
    disclaimerBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.softGray,
    },
    backBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    backBtnText: { fontSize: 22, color: colors.textPrimary },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },

    listContent: { padding: spacing.md, flexGrow: 1 },

    welcomeBox: {
        padding: spacing.lg,
        borderRadius: radius.lg,
        backgroundColor: colors.lavenderLight,
        marginTop: spacing.xl,
    },
    welcomeText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },

    bubbleRow: { flexDirection: 'row', marginBottom: spacing.sm },
    bubbleRowUser: { justifyContent: 'flex-end' },
    bubbleRowAssistant: { justifyContent: 'flex-start' },
    assistantColumn: { maxWidth: '82%' },

    bubble: {
        borderRadius: radius.lg,
        padding: spacing.md,
        ...shadows.soft,
    },
    userBubble: { maxWidth: '82%', backgroundColor: colors.lavenderDark, borderBottomRightRadius: radius.sm },
    userText: { color: colors.white, fontSize: 14, lineHeight: 20 },

    assistantBubble: { backgroundColor: colors.cardBg, borderBottomLeftRadius: radius.sm },
    assistantText: { color: colors.textPrimary, fontSize: 14, lineHeight: 20 },

    crisisBubble: {
        backgroundColor: colors.roseLight,
        borderLeftWidth: 4,
        borderLeftColor: colors.roseDark,
    },
    rejectedBubble: { backgroundColor: colors.softGray },
    mutedText: { color: colors.textMuted, fontStyle: 'italic' },

    sourcesRow: { marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    sourceChip: {
        backgroundColor: colors.lavenderLight,
        borderRadius: radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        maxWidth: '100%',
    },
    sourceChipText: { fontSize: 11, color: colors.lavenderDark, fontWeight: '600' },

    feedbackRow: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.md },
    feedbackIcon: { fontSize: 16, opacity: 0.4 },
    feedbackActive: { opacity: 1 },

    routineCard: {
        marginTop: spacing.sm,
        backgroundColor: colors.lavenderLight,
        borderRadius: radius.lg,
        padding: spacing.sm,
    },
    routineCardTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.lavenderDark,
        marginBottom: spacing.xs,
    },
    routineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    routineRowIcon: { fontSize: 18, marginRight: spacing.xs },
    routineRowName: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
    routineRowTime: { fontSize: 11, color: colors.textSecondary },
    routineAddBtn: {
        backgroundColor: colors.lavenderDark,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
    },
    routineAddBtnDone: { backgroundColor: colors.mintDark },
    routineAddBtnText: { color: colors.white, fontSize: 11, fontWeight: '700' },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.softGray,
        backgroundColor: colors.white,
    },
    siButton: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: colors.lavenderLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.xs,
    },
    siButtonText: { fontSize: 12, fontWeight: '700', color: colors.lavenderDark },
    micButton: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: colors.lavenderLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.xs,
    },
    micButtonActive: { backgroundColor: colors.roseDark },
    micButtonText: { fontSize: 16 },
    recordingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        backgroundColor: colors.roseLight,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.roseDark,
        marginRight: spacing.xs,
    },
    recordingText: { fontSize: 12, fontWeight: '600', color: colors.roseDark },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        backgroundColor: colors.softGray,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        fontSize: 14,
        color: colors.textPrimary,
        marginRight: spacing.xs,
    },
    sendBtnWrap: { ...shadows.card, borderRadius: radius.full },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnText: { color: colors.white, fontSize: 18, fontWeight: '700' },
});
