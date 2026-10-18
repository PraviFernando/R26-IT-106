import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, useWindowDimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { todayStr } from '../../utils/exerciseUtils';
import { C, T, Card, SoftCard, SectionTitle, Label, OptionRow, Chip, PrimaryButton, Icon } from './ui';

// Daily health form: four short sections, big touch targets, one main action.
// =====================================================================================
// HEALTH FORM (daily check-in). Sections: 1 About your birth (weeks, delivery type), 2 How your body feels
// (pain areas, bleeding, doctor restriction, fatigue, mobility), 3 Mood for exercise (willingness). handleSubmit sends these answers to
// ExerciseScreen -> POST /exercise/health-data. The answers are the inputs of the AI model and the safety rules.
// =====================================================================================

const HealthDataForm = ({ onSubmit, loading, initialData, user }) => {
    const { i18n } = useTranslation();
    const isSinhala = i18n.language === 'si';
    const { width } = useWindowDimensions();
    const isWide = width > 900;
    const tr = (en, si) => (isSinhala ? si : en);

    const getNormalizedDeliveryType = (type) => {
        if (!type) return 'normal';
        const lower = type.toLowerCase();
        if (lower.includes('c-section')) return 'c-section';
        return 'normal';
    };

    const [deliveryDate, setDeliveryDate] = useState(user?.deliveryDate || '');
    const [weeks, setWeeks] = useState(initialData?.weeksAfterDelivery || '');
    const [deliveryType, setDeliveryType] = useState(initialData?.deliveryType || getNormalizedDeliveryType(user?.deliveryType));

    useEffect(() => {
        if (user) {
            if (user.deliveryDate) {
                setDeliveryDate(user.deliveryDate);
            }
            if (user.deliveryType) {
                setDeliveryType(getNormalizedDeliveryType(user.deliveryType));
            }
        }
    }, [user]);

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

    // builds the payload the backend validates (weeks 0-104 required, others have safe defaults)
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

    const weeksLocked = !!deliveryDate;
    const stepWeeks = (delta) => {
        const n = Math.max(0, Math.min(104, (parseInt(weeks, 10) || 0) + delta));
        setWeeks(String(n));
    };
    const noPain = !pelvicPain && !backPain && !abdominalPain && !muscleWeakness;
    const clearPain = () => { setPelvicPain(false); setBackPain(false); setAbdominalPain(false); setMuscleWeakness(false); };

    const birthSection = (
        <Card style={st.section}>
            <SectionTitle>{tr('1 · About your birth', '1 · ඔබේ ප්‍රසූතිය ගැන')}</SectionTitle>

            {!user?.deliveryDate && (
                <View style={st.field}>
                    <Label>{tr('Delivery date (YYYY-MM-DD)', 'දරු ප්‍රසූත දිනය (YYYY-MM-DD)')}</Label>
                    <TextInput
                        style={st.input}
                        placeholder={tr('e.g. 2026-08-20', 'උදා: 2026-08-20')}
                        value={deliveryDate}
                        onChangeText={setDeliveryDate}
                        placeholderTextColor={C.textSub}
                        accessibilityLabel={tr('Delivery date', 'දරු ප්‍රසූත දිනය')}
                    />
                </View>
            )}

            <View style={st.field}>
                <Label>{tr('Weeks since your baby was born', 'දරුවා ඉපදී ගතවූ සති ගණන')}</Label>
                <View style={st.stepper}>
                    <Pressable style={[st.stepBtn, weeksLocked && st.disabled]} onPress={() => stepWeeks(-1)} disabled={weeksLocked}
                        accessibilityRole="button" accessibilityLabel={tr('Fewer weeks', 'සති අඩු කරන්න')}>
                        <Text style={st.stepText}>−</Text>
                    </Pressable>
                    <TextInput
                        style={st.weeksInput}
                        keyboardType="numeric"
                        value={String(weeks)}
                        onChangeText={(v) => setWeeks(v.replace(/[^0-9]/g, ''))}
                        editable={!weeksLocked}
                        placeholder="0"
                        placeholderTextColor={C.textSub}
                        accessibilityLabel={tr('Weeks after delivery', 'ප්‍රසූතියෙන් පසු සති')}
                    />
                    <Pressable style={[st.stepBtn, weeksLocked && st.disabled]} onPress={() => stepWeeks(1)} disabled={weeksLocked}
                        accessibilityRole="button" accessibilityLabel={tr('More weeks', 'සති වැඩි කරන්න')}>
                        <Text style={st.stepText}>+</Text>
                    </Pressable>
                </View>
                {weeksLocked && <Text style={st.hint}>{tr('Calculated from your delivery date', 'ඔබේ ප්‍රසූත දිනයෙන් ගණනය කර ඇත')}</Text>}
            </View>

            <View style={st.field}>
                <Label>{tr('Type of delivery', 'ප්‍රසූති ක්‍රමය')}</Label>
                <OptionRow
                    value={deliveryType}
                    onChange={setDeliveryType}
                    disabled={!!user?.deliveryType}
                    options={[
                        { value: 'normal', label: tr('Normal', 'සාමාන්‍ය') },
                        { value: 'c-section', label: tr('C-section', 'සිසේරියන්') },
                    ]}
                />
            </View>
        </Card>
    );

    const bodySection = (
        <Card style={st.section}>
            <SectionTitle>{tr('2 · How your body feels', '2 · ඔබේ ශරීරයට දැනෙන ආකාරය')}</SectionTitle>
            <View style={st.field}>
                <Label>{tr('Tap everything you feel today', 'අද ඔබට දැනෙන සියල්ල තෝරන්න')}</Label>
                <View style={st.chips}>
                    <Chip label={tr('Pelvic pain', 'ශ්‍රෝණි වේදනාව')} selected={pelvicPain} onPress={() => setPelvicPain(!pelvicPain)} />
                    <Chip label={tr('Back pain', 'කොන්දේ වේදනාව')} selected={backPain} onPress={() => setBackPain(!backPain)} />
                    <Chip label={tr('Tummy pain', 'උදර වේදනාව')} selected={abdominalPain} onPress={() => setAbdominalPain(!abdominalPain)} />
                    <Chip label={tr('Muscle weakness', 'මාංශ පේශි දුර්වලතාවය')} selected={muscleWeakness} onPress={() => setMuscleWeakness(!muscleWeakness)} />
                    <Chip label={tr('None', 'කිසිවක් නැත')} selected={noPain} onPress={clearPain} />
                </View>
            </View>
            <View style={st.field}>
                <Label>{tr('Tiredness', 'තෙහෙට්ටුව')}</Label>
                <OptionRow value={fatigue} onChange={setFatigue} options={[
                    { value: 'low', label: tr('Low', 'අඩුයි') },
                    { value: 'medium', label: tr('Medium', 'මධ්‍යම') },
                    { value: 'high', label: tr('High', 'වැඩියි') },
                ]} />
            </View>
            <View style={st.field}>
                <Label>{tr('Moving around', 'චලනය වීම')}</Label>
                <OptionRow value={mobility} onChange={setMobility} options={[
                    { value: 'normal', label: tr('Normal', 'සාමාන්‍යයි') },
                    { value: 'limited', label: tr('Limited', 'සීමිතයි') },
                    { value: 'very_limited', label: tr('Very limited', 'ඉතා සීමිතයි') },
                ]} />
            </View>
        </Card>
    );

    const moodSection = (
        <Card style={st.section}>
            <SectionTitle>{tr('3 · Your mood for exercise', '3 · ව්‍යායාමයට ඔබේ කැමැත්ත')}</SectionTitle>
            <View style={st.field}>
                <Label>{tr('How much do you feel like exercising today?', 'අද ව්‍යායාම කිරීමට ඔබට කොපමණ කැමැත්තක් තිබේද?')}</Label>
                <OptionRow value={willingness} onChange={setWillingness} options={[
                    { value: 'low', label: tr('A little', 'ටිකක්') },
                    { value: 'medium', label: tr('Some', 'මධ්‍යම') },
                    { value: 'high', label: tr('A lot', 'බොහෝ') },
                ]} />
            </View>
        </Card>
    );

    const SafetyRow = ({ label, value, onToggle }) => (
        <Pressable style={st.safetyRow} onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: value }}>
            <View style={[st.box, value && st.boxOn]}>{value && <Icon name="check" size={16} color="#FFFFFF" />}</View>
            <Text style={st.safetyLabel}>{label}</Text>
        </Pressable>
    );

    const safetySection = (
        <View style={st.safety}>
            <Text style={st.safetyTitle}>{tr('4 · Safety — tick if true', '4 · ආරක්ෂාව — සත්‍ය නම් සලකුණු කරන්න')}</Text>
            <SafetyRow label={tr('Heavy or unusual bleeding', 'අධික හෝ අසාමාන්‍ය ලේ ගැලීම')} value={bleeding} onToggle={() => setBleeding(!bleeding)} />
            <SafetyRow label={tr('My doctor said not to exercise', 'ව්‍යායාම නොකරන ලෙස වෛද්‍යවරයා පැවසීය')} value={doctorRestrictions} onToggle={() => setDoctorRestrictions(!doctorRestrictions)} />
        </View>
    );

    const levelWord = { low: tr('Low', 'අඩුයි'), medium: tr('Medium', 'මධ්‍යම'), high: tr('High', 'වැඩියි') };
    const moveWord = { normal: tr('Normal', 'සාමාන්‍යයි'), limited: tr('Limited', 'සීමිතයි'), very_limited: tr('Very limited', 'ඉතා සීමිතයි') };
    const painNames = [
        pelvicPain && tr('Pelvic', 'ශ්‍රෝණි'), backPain && tr('Back', 'කොන්ද'),
        abdominalPain && tr('Tummy', 'උදර'), muscleWeakness && tr('Weak muscles', 'දුර්වල මාංශ පේශි'),
    ].filter(Boolean);
    const glanceRows = [
        [tr('Weeks since delivery', 'ප්‍රසූතියෙන් පසු සති'), weeks ? String(weeks) : '–'],
        [tr('Delivery', 'ප්‍රසූතිය'), deliveryType === 'c-section' ? tr('C-section', 'සිසේරියන්') : tr('Normal', 'සාමාන්‍ය')],
        [tr('Pain', 'වේදනාව'), painNames.length ? painNames.join(', ') : tr('None', 'කිසිවක් නැත')],
        [tr('Tiredness', 'තෙහෙට්ටුව'), levelWord[fatigue] || '–'],
        [tr('Moving around', 'චලනය වීම'), moveWord[mobility] || '–'],
    ];
    const glance = (
        <SoftCard style={st.glance}>
            <Text style={st.glanceKicker}>{tr('Your day at a glance', 'ඔබේ අද දවස')}</Text>
            {glanceRows.map(([k, v]) => (
                <View key={k} style={st.glanceRow}>
                    <Text style={st.glanceKey}>{k}</Text>
                    <Text style={st.glanceVal} numberOfLines={2}>{v}</Text>
                </View>
            ))}
        </SoftCard>
    );

    const submit = (
        <PrimaryButton
            title={tr('Show my exercises', 'මගේ ව්‍යායාම පෙන්වන්න')}
            onPress={handleSubmit}
            loading={loading}
        />
    );

    return (
        <ScrollView style={st.container} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
            <View style={st.header}>
                <Text style={[st.title, { fontSize: isWide ? 34 : 24, lineHeight: isWide ? 40 : 30 }]}>{tr('How are you today?', 'ඔබ අද කොහොමද?')}</Text>
                <Text style={st.subtitle}>
                    {tr('A few quick steps. Your answers choose exercises that are safe for your recovery. You can change them any day.',
                        'ඉක්මන් පියවර කිහිපයක්. ඔබේ පිළිතුරු අනුව ඔබේ සුවයට ආරක්ෂිත ව්‍යායාම තෝරා ගනී. ඕනෑම දිනක ඒවා වෙනස් කළ හැක.')}
                </Text>
            </View>

            {isWide ? (
                <View style={st.wideRow}>
                    <View style={st.wideMain}>{birthSection}{bodySection}{moodSection}</View>
                    <View style={st.wideSide}>{glance}{safetySection}{submit}</View>
                </View>
            ) : (
                <View style={st.stack}>
                    {birthSection}{bodySection}{moodSection}{safetySection}{submit}
                </View>
            )}
        </ScrollView>
    );
};

const st = StyleSheet.create({
    container: { width: '100%' },
    content: { paddingBottom: 24 },
    header: { gap: 6, marginBottom: 18 },
    title: { ...T.heading, color: C.text },
    subtitle: { ...T.body, fontSize: 15, color: C.textSub, lineHeight: 22, maxWidth: 620 },
    glance: { gap: 12, padding: 22 },
    glanceKicker: { ...T.semi, fontSize: 12, color: C.primaryDark, textTransform: 'uppercase', letterSpacing: 1 },
    glanceRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    glanceKey: { ...T.body, fontSize: 14, color: C.textSub },
    glanceVal: { ...T.semi, fontSize: 14, color: C.text, flexShrink: 1, textAlign: 'right' },
    stack: { gap: 14 },
    wideRow: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
    wideMain: { flex: 2, gap: 16 },
    wideSide: { flex: 1, gap: 16, minWidth: 280 },
    section: { gap: 18, padding: 24 },
    field: { gap: 8 },
    input: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: C.control, paddingHorizontal: 14, ...T.semi, fontSize: 15, color: C.text, backgroundColor: '#FFFFFF' },
    stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    stepBtn: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: C.secondary, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    stepText: { ...T.semi, fontSize: 20, color: C.primaryDark, lineHeight: 26 },
    disabled: { opacity: 0.45 },
    weeksInput: { flex: 1, textAlign: 'center', ...T.heading, fontSize: 20, color: C.text, minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: C.control, backgroundColor: '#FFFFFF' },
    hint: { ...T.medium, fontSize: 12, color: C.textSub, textAlign: 'center' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    safety: { backgroundColor: C.peach, borderRadius: 20, borderWidth: 1, borderColor: '#FFD9C2', paddingVertical: 16, paddingHorizontal: 18, gap: 4 },
    safetyTitle: { ...T.semi, fontSize: 14, color: '#B45309', marginBottom: 2 },
    safetyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
    safetyLabel: { flex: 1, ...T.semi, fontSize: 14, color: C.text },
    box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: '#B45309', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    boxOn: { backgroundColor: '#B45309' },
});

export default HealthDataForm;
