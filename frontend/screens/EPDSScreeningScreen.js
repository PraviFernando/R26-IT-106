// ─────────────────────────────────────────────────────────────────────────────
// EPDS SCREENING — shown before every chat session.
// 10-item Edinburgh Postnatal Depression Scale → total → risk band (low/medium/
// high) stored server-side (POST /epds/submit). The chat pipeline reads that band
// (services/rag/riskLevelService.js) and personalises its response tone.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/ScreenContainer';
import { useResponsive } from '../hooks/useResponsive';
import { colors, spacing, radius, shadows } from '../theme';
import {
  EPDS_QUESTIONS,
  scoreFor,
  SELF_HARM_QUESTION_INDEX,
} from '../data/epdsQuestions';
import { submitScreening } from '../services/epdsService';

export default function EPDSScreeningScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const r = useResponsive();
  const lang = i18n.language === 'si' ? 'si' : 'en';

  // one selected option index (0..3) per question, or null
  const [answers, setAnswers] = useState(() => Array(EPDS_QUESTIONS.length).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [showHelpline, setShowHelpline] = useState(false);

  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === EPDS_QUESTIONS.length;

  const select = (qi, oi) =>
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = oi;
      return next;
    });

  const proceedToChat = () => navigation.replace('Chat');

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    const scores = EPDS_QUESTIONS.map((q, i) => scoreFor(q, answers[i]));
    try {
      await submitScreening(scores);
      Toast.show({
        type: 'success',
        text1: t('Screening saved'),
        position: 'top',
        visibilityTime: 1500,
      });

      // Self-harm safety gate — surface the helpline before entering chat,
      // regardless of the total score.
      const selfHarmScore = scoreFor(
        EPDS_QUESTIONS[SELF_HARM_QUESTION_INDEX],
        answers[SELF_HARM_QUESTION_INDEX]
      );
      if (selfHarmScore >= 2) {
        setSubmitting(false);
        setShowHelpline(true);
        return;
      }
      proceedToChat();
    } catch (err) {
      setSubmitting(false);
      Toast.show({
        type: 'error',
        text1: t('Could not save your screening'),
        text2: err?.response?.data?.message || t('Please try again.'),
        position: 'top',
      });
    }
  };

  const header = (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t('Quick check-in')}</Text>
      <TouchableOpacity
        onPress={() => i18n.changeLanguage(lang === 'en' ? 'si' : 'en')}
        style={styles.langBtn}
      >
        <Text style={styles.langBtnText}>{lang === 'en' ? 'සිං' : 'EN'}</Text>
      </TouchableOpacity>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <Text style={styles.progressText}>
        {answeredCount}/{EPDS_QUESTIONS.length} {t('answered')}
      </Text>
      <TouchableOpacity
        style={[styles.continueBtn, (!allAnswered || submitting) && styles.continueBtnDisabled]}
        onPress={handleSubmit}
        disabled={!allAnswered || submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.continueBtnText}>{t('Continue to chat')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer
      gradient={[colors.offWhite, colors.lavenderLight]}
      edges={['top', 'bottom']}
      maxWidth="reading"
      header={header}
      footer={footer}
      contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.lg }}
    >
      <Text style={styles.intro}>
        {t(
          'Choose the answer closest to how you have felt over the past 7 days. This is a screening tool, not a diagnosis.'
        )}
      </Text>

      {EPDS_QUESTIONS.map((q, qi) => (
        <View key={q.key} style={styles.card}>
          <Text style={styles.stem}>
            {qi + 1}. {q[lang].stem}
          </Text>
          {q[lang].options.map((opt, oi) => {
            const selected = answers[qi] === oi;
            return (
              <TouchableOpacity
                key={oi}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => select(qi, oi)}
                activeOpacity={0.8}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Self-harm helpline gate */}
      <Modal visible={showHelpline} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.helplineCard, { maxWidth: r.contentMaxWidth('reading') - 32 }]}>
            <Text style={styles.helplineTitle}>{t('Your wellbeing matters')}</Text>
            <Text style={styles.helplineText}>
              {t(
                "This is a support tool, not a substitute for professional medical care. If you're in crisis, please contact the 1926 helpline or emergency services."
              )}
            </Text>
            <Text style={styles.helplinePhone}>
              {t('📞 Sri Lanka Mental Health Helpline: 1926')}
            </Text>
            <TouchableOpacity
              style={styles.helplineBtn}
              onPress={() => {
                setShowHelpline(false);
                proceedToChat();
              }}
            >
              <Text style={styles.helplineBtnText}>{t('I understand')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24, color: colors.textPrimary, fontWeight: '800' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  langBtn: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.lavenderLight,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  langBtnText: { fontWeight: '700', color: colors.lavenderDark, fontSize: 13 },

  intro: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  stem: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.softGray,
    marginTop: 8,
  },
  optionSelected: {
    borderColor: colors.lavenderDark,
    backgroundColor: colors.lavenderLight,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioSelected: { borderColor: colors.lavenderDark },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.lavenderDark },
  optionText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  optionTextSelected: { color: colors.textPrimary, fontWeight: '600' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.softGray,
  },
  progressText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  continueBtn: {
    flex: 1,
    backgroundColor: colors.lavenderDark,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: { backgroundColor: colors.textMuted, opacity: 0.7 },
  continueBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(61,42,94,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  helplineCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  helplineTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.sm },
  helplineText: { fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginBottom: spacing.md },
  helplinePhone: { fontSize: 15, fontWeight: '800', color: colors.roseDark, marginBottom: spacing.lg },
  helplineBtn: {
    backgroundColor: colors.lavenderDark,
    borderRadius: radius.full,
    paddingVertical: 13,
    alignItems: 'center',
  },
  helplineBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
});
