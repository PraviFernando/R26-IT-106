import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors } from '../../theme';

const { width } = Dimensions.get('window');

// Styles shared by the exercise screen and its components
// style sheet of the exercise part (older shared styles).
const styles = StyleSheet.create({
    // Shown when recommendations came from the rule-based fallback instead of the ML model
    fallbackNotice: {
        backgroundColor: '#FFF7ED', borderColor: '#FDBA74', borderWidth: 1, borderRadius: 14,
        paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12,
    },
    // Label on cards picked for the user's symptoms or situation
    focusChip: {
        alignSelf: 'flex-start', backgroundColor: '#EDE9FE', borderRadius: 10,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    focusChipText: { fontSize: 11, fontWeight: '700', color: '#5B21B6' },
    fallbackNoticeText: { fontSize: 12.5, color: '#9A3412', lineHeight: 18 },
    // Layout
    safe: { flex: 1, backgroundColor: '#EDE9FE' },
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
        elevation: 3, shadowColor: colors.primary, shadowOpacity: 0.1,
        shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    },
    backIcon: { fontSize: 20, color: colors.primary, fontWeight: '900' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
    headerEmoji: { fontSize: 24 },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
    scrollContent: { paddingBottom: 40 },

    // Progress dashboard (inline on Exercise screen)
    progressContainer: {
        backgroundColor: '#FFF', borderRadius: 28, padding: 20, marginBottom: 16,
        elevation: 3, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06, shadowRadius: 16, borderWidth: 1,
        borderColor: colors.accent,
    },
    progressTitle: { fontSize: 17, fontWeight: '900', color: '#1E293B', marginBottom: 14 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statBox: {
        flex: 1, borderRadius: 20, paddingVertical: 18, paddingHorizontal: 10,
        alignItems: 'center', minWidth: (width - 60) / 3, elevation: 2,
        shadowColor: colors.primary, shadowOpacity: 0.08, shadowRadius: 8,
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
        borderColor: colors.accent,
        width: '70%',
        alignSelf: 'center',
    },
    formContainerHover: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
    },
    formHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    formHeaderEmoji: { fontSize: 24 },
    formTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 },
    formSubtitle: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },
    formSection: {
        backgroundColor: 'transparent',
        borderRadius: 14,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    formSectionLabel: { fontSize: 11, fontWeight: 'bold', color: colors.primary, marginBottom: 8, letterSpacing: 0.2 },

    inputGroup: { marginBottom: 10 },
    label: { fontSize: 11, fontWeight: '700', color: '#334155', marginBottom: 4 },
    input: {
        borderWidth: 1.2, borderColor: colors.accent, borderRadius: 12,
        padding: 8, fontSize: 12, backgroundColor: '#FAFAF9', color: '#1E293B',
    },
    rowButtons: { flexDirection: 'row', gap: 6 },
    columnButtons: { gap: 4 },
    optionBtn: {
        flex: 1, paddingVertical: 7, borderRadius: 10,
        backgroundColor: '#FFF', alignItems: 'center',
        borderWidth: 1.2, borderColor: colors.accent,
    },
    optionBtnWide: {
        paddingVertical: 7, borderRadius: 10,
        backgroundColor: '#FFF', alignItems: 'center',
        borderWidth: 1.2, borderColor: colors.accent,
    },
    optionBtnActive: { backgroundColor: colors.accent, borderColor: colors.secondary },
    optionBtnHover: {
        borderColor: colors.primary,
        elevation: 2,
        shadowColor: colors.primary,
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    optionText: { fontSize: 11, color: '#475569', fontWeight: '600' },
    optionTextActive: { color: colors.primaryDark, fontWeight: '800' },
    checkboxGroup: { marginBottom: 6 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    checkboxRowHover: {
        borderRadius: 8,
        paddingHorizontal: 6,
        marginHorizontal: -6,
    },
    checkbox: {
        width: 18, height: 18, borderRadius: 5, borderWidth: 1.5,
        borderColor: colors.accent, marginRight: 8, backgroundColor: '#FFF',
    },
    checkboxChecked: { backgroundColor: colors.accent, borderColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    checkboxTick: { color: colors.primaryDark, fontSize: 10, fontWeight: '900' },
    checkboxLabel: { fontSize: 11, color: '#475569', fontWeight: '600' },
    submitBtn: {
        borderRadius: 14,
        marginTop: 4,
    },
    submitBtnHover: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    submitBtnDisabled: { opacity: 0.65 },
    submitBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 14 },
    submitBtnEmoji: { fontSize: 14 },
    submitBtnText: { color: colors.white, fontWeight: '800', fontSize: 12 },

    // Exercise plan banner
    planBanner: {
        borderRadius: 18, padding: 14, marginBottom: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1, borderColor: colors.accent,
        width: '90%',
        alignSelf: 'center',
    },
    planBannerTitle: { fontSize: 13, fontWeight: 'bold', color: colors.primaryDark, marginBottom: 2 },
    planBannerSub: { fontSize: 11, color: colors.primary, fontWeight: '600' },
    planBannerBadge: {
        backgroundColor: colors.lavenderLight, borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center',
    },
    planBannerBadgeText: { fontSize: 18, fontWeight: 'bold', color: colors.primaryDark },
    planBannerBadgeLabel: { fontSize: 9, color: colors.primary, fontWeight: '700', marginTop: 1 },

    // Exercise cards
    recommendationsContainer: { marginBottom: 16 },
    recommendationsTitle: { fontSize: 17, fontWeight: '900', color: '#1E293B', marginBottom: 14 },
    horizontalScrollContent: {
        paddingRight: 20,
    },
    exerciseCard: {
        backgroundColor: 'transparent',
        marginBottom: 16,
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
        backgroundColor: colors.lavenderLight,
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
        backgroundColor: colors.lavenderLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        borderWidth: 1.5,
        borderColor: colors.accent,
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
        backgroundColor: '#FFF', borderRadius: 0,
        width: '100%', height: '100%', maxHeight: '100%',
        elevation: 8, shadowColor: colors.primary, shadowOpacity: 0.1,
        shadowRadius: 24, shadowOffset: { width: 0, height: 12 },
    },
    modalScrollContent: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
    },
    modalTitleContainer: {
        backgroundColor: colors.lavenderLight,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: colors.accent,
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    modalTitleText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.primaryDark,
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
        backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14,
    },
    webViewRetryBtnText: { color: '#FFF', fontWeight: '800' },

    // Empty states
    emptyContainer: {
        backgroundColor: '#FFF', borderRadius: 28, padding: 36, alignItems: 'center',
        marginBottom: 16, elevation: 3, shadowColor: colors.primary, shadowOpacity: 0.05,
        shadowRadius: 16, shadowOffset: { height: 6, width: 0 }, borderWidth: 1,
        borderColor: colors.accent,
    },
    emptyEmoji: { fontSize: 52, marginBottom: 14 },
    emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
    emptyText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
    emptyContainerSmall: {
        alignItems: 'center', padding: 28, backgroundColor: '#FFF', borderRadius: 24,
        borderWidth: 1, borderColor: colors.accent, elevation: 2,
        shadowColor: colors.primary, shadowOpacity: 0.04, shadowRadius: 10,
    },
    emptyTitleSmall: { fontSize: 15, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
    emptyTextSmall: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },

    addDataBtn: {
        borderRadius: 16,
        marginBottom: 16,
        width: '100%',
        alignSelf: 'center',
    },
    addDataBtnGradient: {
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    addDataBtnHover: {
        borderColor: colors.primaryDark,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    addDataBtnText: { fontSize: 13, color: '#000000', fontWeight: 'bold' },

    // Modals overlay
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(15,23,42,0.45)',
        justifyContent: 'center', alignItems: 'center',
    },

    // Survey modal
    questionsModalContent: {
        backgroundColor: '#FFF', borderRadius: 32, padding: 24,
        width: width - 40, alignItems: 'stretch',
        elevation: 8, shadowColor: colors.primary, shadowOpacity: 0.1,
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
        flex: 1, paddingVertical: 11, borderWidth: 1.5, borderColor: colors.accent,
        borderRadius: 14, alignItems: 'center', backgroundColor: '#FAFAF9',
    },
    surveyBtnActive: { borderColor: colors.primary, backgroundColor: colors.lavenderLight },
    surveyBtnText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    surveyBtnTextActive: { color: colors.primary, fontWeight: '800' },
    submitSurveyBtn: {
        backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 20,
        alignItems: 'center', marginTop: 20, elevation: 3,
        shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 8,
    },
    submitSurveyBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

    // Results modal
    resultsModalContent: {
        backgroundColor: '#FFF', borderRadius: 32, padding: 24,
        width: width - 40, alignItems: 'center',
        elevation: 8, shadowColor: colors.primary, shadowOpacity: 0.1,
        shadowRadius: 24, shadowOffset: { width: 0, height: 12 },
    },
    resultsInfoBlock: { width: '100%', marginVertical: 16 },
    resultsRowText: { fontSize: 14, color: '#475569', marginVertical: 5, lineHeight: 20 },
    dividerLine: { height: 1.5, backgroundColor: '#F1F5F9', marginVertical: 14 },
    resultsFeedbackTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
    resultsFeedbackText: {
        fontSize: 13, color: '#475569', lineHeight: 20, fontStyle: 'italic',
        backgroundColor: colors.lavenderLight, padding: 14, borderRadius: 16,
        borderWidth: 1, borderColor: colors.accent,
    },
    resultsCloseBtn: {
        backgroundColor: colors.primary, width: '100%', paddingVertical: 14,
        borderRadius: 20, alignItems: 'center', elevation: 3,
        shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 8,
    },
    resultsCloseBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

    // View progress banner
    viewProgressBtn: {
        marginVertical: 12, borderRadius: 18,
        borderWidth: 1, borderColor: colors.accent,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: colors.white,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        ...Platform.select({
            web: {
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
            }
        })
    },
    viewProgressBtnHover: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 5,
        transform: [{ translateY: -2 }],
    },
    viewProgressBtnGrad: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderRadius: 18 },
    viewProgressBtnEmoji: { fontSize: 24 },
    viewProgressBtnTitle: { fontSize: 13, fontWeight: 'bold', color: colors.primaryDark },
    viewProgressBtnSub: { fontSize: 11, color: colors.primary, marginTop: 2 },

    // Daily health prompt modal
    promptModalContent: {
        backgroundColor: '#FFF', borderRadius: 32, padding: 26,
        width: width - 40, alignItems: 'center', elevation: 8,
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
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
    thumbsUpBtn: { backgroundColor: colors.lavenderLight, borderColor: colors.primary },
    thumbsDownBtn: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
    promptBtnEmoji: { fontSize: 28, marginBottom: 5 },
    promptBtnTextActive: { color: colors.primary, fontWeight: '800', fontSize: 12, textAlign: 'center' },
    promptBtnText: { color: '#64748B', fontWeight: '700', fontSize: 12, textAlign: 'center' },

    // Tab switcher
    tabContainer: {
        flexDirection: 'row', backgroundColor: '#FFF',
        borderRadius: 20, padding: 4, marginBottom: 16,
        borderWidth: 1, borderColor: colors.accent,
    },
    tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 16 },
    tabButtonActive: {
        backgroundColor: colors.lavenderLight, elevation: 3, shadowColor: colors.primary,
        shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    },
    tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    tabTextActive: { color: colors.primaryDark, fontWeight: '900' },

    // Stopwatch
    stopwatchContainer: {
        width: '100%', alignItems: 'center', backgroundColor: colors.lavenderLight,
        borderRadius: 20, padding: 18, marginVertical: 14,
        borderWidth: 1.5, borderColor: colors.accent,
    },
    stopwatchLabel: { fontSize: 13, fontWeight: '700', color: colors.primary, marginBottom: 6 },
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
        width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
        alignItems: 'center', justifyContent: 'center', marginLeft: 8, elevation: 3,
        shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 6,
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
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
    },
    safetyCloseBtn: {
        backgroundColor: colors.primary,
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
        flexDirection: width > 768 ? 'row' : 'column',
        width: '100%',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalLeftColumn: {
        flex: width > 768 ? 1.2 : undefined,
        width: '100%',
    },
    modalRightColumn: {
        flex: width > 768 ? 0.8 : undefined,
        width: '100%',
    },
    aiTrackingBtn: {
        backgroundColor: colors.primary,
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
        elevation: 3,
        shadowColor: colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        ...Platform.select({
            web: {
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
            }
        })
    },
    aiTrackingBtnHover: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6,
        transform: [{ translateY: -2 }],
    },
    aiTrackingBtnText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 14,
        textAlign: 'center'
    },
});

//test comment

export default styles;
