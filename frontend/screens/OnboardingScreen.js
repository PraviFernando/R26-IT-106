import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Animated, Dimensions, Platform, KeyboardAvoidingView,
    ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import api from '../services/api';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#F3E8FF';
const GREEN = '#10B981';
const BORDER = '#E5E7EB';

// ─── Small reusable components ────────────────────────────────────────────────

function OptionButton({ label, selected, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.option, selected && styles.optionSelected]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <Text style={selected ? styles.optionSelectedText : styles.optionText}>{label}</Text>
            {selected && <Text style={styles.optionCheck}>✓</Text>}
        </TouchableOpacity>
    );
}

function SectionLabel({ text }) {
    return <Text style={styles.label}>{text}</Text>;
}

function MeasureInput({ label, value, onChangeText, placeholder }) {
    return (
        <View style={styles.measureBlock}>
            <Text style={styles.measureLabel}>{label}</Text>
            <TextInput
                style={styles.measureInput}
                placeholder={placeholder || '—'}
                placeholderTextColor="#9CA3AF"
                value={value}
                onChangeText={onChangeText}
                keyboardType="numeric"
            />
        </View>
    );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen({ navigation }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // ── Step 1
    const [deliveryType, setDeliveryType] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [numBabies, setNumBabies] = useState('Single');
    const [calendarVisible, setCalendarVisible] = useState(false);

    // ── Step 2
    const [babyName, setBabyName] = useState('');
    const [gender, setGender] = useState('');
    const [birthWeight, setBirthWeight] = useState('');
    const [currentWeight, setCurrentWeight] = useState('');
    const [birthLength, setBirthLength] = useState('');
    const [currentLength, setCurrentLength] = useState('');
    const [headCircumference, setHeadCircumference] = useState('');

    // ── Step 3
    const [feedingMethod, setFeedingMethod] = useState('');

    // ── Animated transition between steps
    const goToStep = (next) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
        setTimeout(() => setStep(next), 150);
    };

    // ── Validation
    const validateStep1 = () => {
        if (!deliveryType) {
            Toast.show({ type: 'error', text1: 'Required', text2: 'Please select a delivery type.' });
            return false;
        }
        if (!deliveryDate) {
            Toast.show({ type: 'error', text1: 'Required', text2: "Please select the baby's date of birth." });
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!gender) {
            Toast.show({ type: 'error', text1: 'Required', text2: "Please select the baby's gender." });
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!feedingMethod) {
            Toast.show({ type: 'error', text1: 'Required', text2: 'Please select a feeding method.' });
            return false;
        }
        return true;
    };

    // ── Date formatting
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const onDateSelect = (date) => {
        setDeliveryDate(date.dateString);
        setCalendarVisible(false);
    };

    // ── Save & finish
    const saveOnboarding = async () => {
        if (!validateStep3()) return;
        setLoading(true);
        try {
            await api.post('/user/onboarding', {
                deliveryType,
                deliveryDate,
                numBabies,
                babyName,
                gender,
                birthWeight,
                currentWeight,
                birthLength,
                currentLength,
                headCircumference,
                feedingMethod,
            });
            Toast.show({ type: 'success', text1: '🎉 Welcome!', text2: 'Onboarding complete. Let\'s get started!' });
            setTimeout(() => navigation.replace('Dashboard'), 800);
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Save Failed',
                text2: err.response?.data?.message || 'Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    // ── Progress bar
    const progress = ((step - 1) / 2) * 100;

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* ── Header ──────────────────────────────── */}
                <View style={styles.header}>
                    <Text style={styles.headerBrand}>🌸 PeriCare</Text>
                    <Text style={styles.headerSub}>Step {step} of 3</Text>
                </View>

                {/* ── Progress bar ─────────────────────────── */}
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: `${progress + 34}%` }]} />
                    <View style={styles.dotsRow}>
                        {[1, 2, 3].map((s) => (
                            <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]}>
                                <Text style={[styles.stepDotText, step >= s && styles.stepDotTextActive]}>
                                    {step > s ? '✓' : s}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={{ opacity: fadeAnim }}>

                        {/* ══════════════════ STEP 1 ══════════════════ */}
                        {step === 1 && (
                            <View style={styles.card}>
                                <Text style={styles.stepIcon}>🤱</Text>
                                <Text style={styles.title}>Delivery Information</Text>
                                <Text style={styles.subtitle}>Tell us about your birth experience</Text>

                                <SectionLabel text="Delivery Type *" />
                                {[
                                    { label: 'Vaginal Birth', emoji: '💙' },
                                    { label: 'Vaginal Birth with Tear/Episiotomy', emoji: '🩹' },
                                    { label: 'C-Section', emoji: '🏥' },
                                ].map(({ label, emoji }) => (
                                    <OptionButton
                                        key={label}
                                        label={`${emoji}  ${label}`}
                                        selected={deliveryType === label}
                                        onPress={() => setDeliveryType(label)}
                                    />
                                ))}

                                <SectionLabel text="Baby's Date of Birth *" />
                                <TouchableOpacity
                                    style={styles.datePickerButton}
                                    onPress={() => setCalendarVisible(true)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.datePickerIcon}>📅</Text>
                                    <Text style={[
                                        styles.datePickerText,
                                        deliveryDate ? styles.datePickerTextFilled : styles.datePickerTextPlaceholder
                                    ]}>
                                        {deliveryDate ? formatDate(deliveryDate) : 'Select Date of Birth'}
                                    </Text>
                                    <Text style={styles.datePickerArrow}>›</Text>
                                </TouchableOpacity>

                                {/* Calendar Modal */}
                                <Modal
                                    visible={calendarVisible}
                                    transparent={true}
                                    animationType="slide"
                                    onRequestClose={() => setCalendarVisible(false)}
                                >
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.modalContent}>
                                            <View style={styles.modalHeader}>
                                                <Text style={styles.modalTitle}>Select Date of Birth</Text>
                                                <TouchableOpacity
                                                    onPress={() => setCalendarVisible(false)}
                                                    style={styles.modalCloseButton}
                                                >
                                                    <Text style={styles.modalCloseText}>✕</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <Calendar
                                                onDayPress={onDateSelect}
                                                maxDate={new Date().toISOString().split('T')[0]}
                                                markedDates={deliveryDate ? { [deliveryDate]: { selected: true, selectedColor: PURPLE } } : {}}
                                                theme={{
                                                    backgroundColor: '#ffffff',
                                                    calendarBackground: '#ffffff',
                                                    textSectionTitleColor: '#6B7280',
                                                    selectedDayBackgroundColor: PURPLE,
                                                    selectedDayTextColor: '#ffffff',
                                                    todayTextColor: PURPLE,
                                                    dayTextColor: '#111827',
                                                    textDisabledColor: '#9CA3AF',
                                                    dotColor: PURPLE,
                                                    selectedDotColor: '#ffffff',
                                                    arrowColor: PURPLE,
                                                    monthTextColor: '#111827',
                                                    textDayFontWeight: '500',
                                                    textMonthFontWeight: '700',
                                                    textDayHeaderFontWeight: '600',
                                                    textDayFontSize: 16,
                                                    textMonthFontSize: 18,
                                                    textDayHeaderFontSize: 14,
                                                }}
                                            />
                                            <TouchableOpacity
                                                style={styles.modalConfirmButton}
                                                onPress={() => setCalendarVisible(false)}
                                            >
                                                <Text style={styles.modalConfirmText}>Confirm Date</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>

                                <SectionLabel text="Number of Babies" />
                                <View style={styles.pillRow}>
                                    {['Single', 'Twins', 'Triplets'].map((n) => (
                                        <TouchableOpacity
                                            key={n}
                                            style={[styles.pill, numBabies === n && styles.pillActive]}
                                            onPress={() => setNumBabies(n)}
                                        >
                                            <Text style={[styles.pillText, numBabies === n && styles.pillTextActive]}>
                                                {n}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={styles.nextBtn}
                                    onPress={() => { if (validateStep1()) goToStep(2); }}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.nextBtnText}>Next  →</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* ══════════════════ STEP 2 ══════════════════ */}
                        {step === 2 && (
                            <View style={styles.card}>
                                <Text style={styles.stepIcon}>👶</Text>
                                <Text style={styles.title}>Baby Details</Text>
                                <Text style={styles.subtitle}>Help us personalise your experience</Text>

                                <SectionLabel text="Baby's Name (Optional)" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Amara"
                                    placeholderTextColor="#9CA3AF"
                                    value={babyName}
                                    onChangeText={setBabyName}
                                />

                                <SectionLabel text="Gender *" />
                                <View style={styles.genderRow}>
                                    {[
                                        { label: '👦  Boy', value: 'Boy' },
                                        { label: '👧  Girl', value: 'Girl' },
                                    ].map(({ label, value }) => (
                                        <TouchableOpacity
                                            key={value}
                                            style={[styles.genderBtn, gender === value && styles.genderBtnActive]}
                                            onPress={() => setGender(value)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[styles.genderText, gender === value && styles.genderTextActive]}>
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <SectionLabel text="Weight" />
                                <View style={styles.measureRow}>
                                    <MeasureInput
                                        label="Birth Weight (kg)"
                                        value={birthWeight}
                                        onChangeText={setBirthWeight}
                                        placeholder="e.g. 3.2"
                                    />
                                    <MeasureInput
                                        label="Current Weight (kg)"
                                        value={currentWeight}
                                        onChangeText={setCurrentWeight}
                                        placeholder="e.g. 4.1"
                                    />
                                </View>

                                <SectionLabel text="Length" />
                                <View style={styles.measureRow}>
                                    <MeasureInput
                                        label="Birth Length (cm)"
                                        value={birthLength}
                                        onChangeText={setBirthLength}
                                        placeholder="e.g. 50"
                                    />
                                    <MeasureInput
                                        label="Current Length (cm)"
                                        value={currentLength}
                                        onChangeText={setCurrentLength}
                                        placeholder="e.g. 55"
                                    />
                                </View>

                                <SectionLabel text="Head Circumference (cm)" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 34"
                                    placeholderTextColor="#9CA3AF"
                                    value={headCircumference}
                                    onChangeText={setHeadCircumference}
                                    keyboardType="numeric"
                                />

                                <View style={styles.btnRow}>
                                    <TouchableOpacity style={styles.backBtn} onPress={() => goToStep(1)}>
                                        <Text style={styles.backBtnText}>← Back</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.nextBtn, { flex: 1 }]}
                                        onPress={() => { if (validateStep2()) goToStep(3); }}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={styles.nextBtnText}>Next  →</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* ══════════════════ STEP 3 ══════════════════ */}
                        {step === 3 && (
                            <View style={styles.card}>
                                <Text style={styles.stepIcon}>🍼</Text>
                                <Text style={styles.title}>Feeding Method</Text>
                                <Text style={styles.subtitle}>How are you planning to feed your baby?</Text>

                                {[
                                    { label: 'Breastfeeding', emoji: '🤱', desc: 'Exclusively breast milk' },
                                    { label: 'Formula Feeding', emoji: '🍼', desc: 'Commercially prepared formula' },
                                    { label: 'Mixed Feeding', emoji: '🔄', desc: 'Breast milk and formula' },
                                ].map(({ label, emoji, desc }) => (
                                    <TouchableOpacity
                                        key={label}
                                        style={[styles.feedCard, feedingMethod === label && styles.feedCardSelected]}
                                        onPress={() => setFeedingMethod(label)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.feedEmoji}>{emoji}</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.feedLabel, feedingMethod === label && styles.feedLabelSelected]}>
                                                {label}
                                            </Text>
                                            <Text style={styles.feedDesc}>{desc}</Text>
                                        </View>
                                        {feedingMethod === label && (
                                            <View style={styles.feedCheck}>
                                                <Text style={{ color: '#fff', fontWeight: '700' }}>✓</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}

                                <View style={styles.btnRow}>
                                    <TouchableOpacity style={styles.backBtn} onPress={() => goToStep(2)}>
                                        <Text style={styles.backBtnText}>← Back</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.finishBtn, loading && { opacity: 0.7 }, { flex: 1 }]}
                                        onPress={saveOnboarding}
                                        disabled={loading}
                                        activeOpacity={0.85}
                                    >
                                        {loading
                                            ? <ActivityIndicator color="#fff" />
                                            : <Text style={styles.finishBtnText}>🎉 Finish Onboarding</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F5F3FF' },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 6,
    },
    headerBrand: { fontSize: 18, fontWeight: '800', color: PURPLE },
    headerSub: { fontSize: 13, color: '#6B7280', fontWeight: '600' },

    // Progress
    progressTrack: {
        height: 6,
        backgroundColor: '#EDE9FE',
        marginHorizontal: 20,
        borderRadius: 4,
        marginBottom: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    progressFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: PURPLE,
        borderRadius: 4,
    },
    dotsRow: {
        position: 'absolute',
        top: -10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
    },
    stepDot: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#EDE9FE',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#D8B4FE',
    },
    stepDotActive: { backgroundColor: PURPLE, borderColor: PURPLE },
    stepDotText: { fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
    stepDotTextActive: { color: '#fff' },

    scroll: { padding: 20, paddingBottom: 40 },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 6,
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
    },
    stepIcon: { fontSize: 44, textAlign: 'center', marginBottom: 8 },
    title: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#a26ba7ff', textAlign: 'center', marginBottom: 24 },

    // Date Picker Button
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 12,
        backgroundColor: '#FAFAFA',
        marginBottom: 4,
    },
    datePickerIcon: { fontSize: 20, marginRight: 12 },
    datePickerText: { flex: 1, fontSize: 15 },
    datePickerTextPlaceholder: { color: '#9CA3AF' },
    datePickerTextFilled: { color: '#111827', fontWeight: '600' },
    datePickerArrow: { fontSize: 20, color: '#9CA3AF', fontWeight: '300' },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
    },
    modalConfirmButton: {
        backgroundColor: PURPLE,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    modalConfirmText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },

    // Option button (Step 1)
    label: { fontSize: 14, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 8 },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#FAFAFA',
    },
    optionSelected: { borderColor: PURPLE, backgroundColor: PURPLE_LIGHT },
    optionText: { fontSize: 15, color: '#374151' },
    optionSelectedText: { fontSize: 15, color: PURPLE, fontWeight: '700' },
    optionCheck: { color: PURPLE, fontWeight: '900', fontSize: 16 },

    // Generic input
    input: {
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        backgroundColor: '#FAFAFA',
        color: '#111827',
    },

    // Pills (number of babies)
    pillRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    pill: {
        flex: 1,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    pillActive: { borderColor: PURPLE, backgroundColor: PURPLE_LIGHT },
    pillText: { fontSize: 14, color: '#374151', fontWeight: '600' },
    pillTextActive: { color: PURPLE, fontWeight: '800' },

    // Gender (Step 2)
    genderRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
    genderBtn: {
        flex: 1,
        paddingVertical: 14,
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    genderBtnActive: { borderColor: PURPLE, backgroundColor: PURPLE_LIGHT },
    genderText: { fontSize: 15, color: '#374151', fontWeight: '600' },
    genderTextActive: { color: PURPLE, fontWeight: '800' },

    // Measure inputs
    measureRow: { flexDirection: 'row', gap: 12 },
    measureBlock: { flex: 1 },
    measureLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
    measureInput: {
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        backgroundColor: '#FAFAFA',
        color: '#111827',
        textAlign: 'center',
    },

    // Feed cards (Step 3)
    feedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 14,
        marginBottom: 12,
        backgroundColor: '#FAFAFA',
    },
    feedCardSelected: { borderColor: PURPLE, backgroundColor: PURPLE_LIGHT },
    feedEmoji: { fontSize: 28 },
    feedLabel: { fontSize: 15, fontWeight: '700', color: '#374151' },
    feedLabelSelected: { color: PURPLE },
    feedDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    feedCheck: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: PURPLE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Buttons
    nextBtn: {
        backgroundColor: PURPLE,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 24,
        elevation: 4,
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    finishBtn: {
        backgroundColor: PURPLE,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        elevation: 4,
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    finishBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    backBtn: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    backBtnText: { color: '#6B7280', fontWeight: '600', fontSize: 15 },

    btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
});