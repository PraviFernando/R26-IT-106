// ================================================================
// DASHBOARD SCREEN — DashboardScreen copy.js  (Sinhala UI with Quick Actions)
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, shadows } from '../theme';
import { useApp } from '../services/AppContext';
import { SI } from '../services/translations';

const { width } = Dimensions.get('window');

const emotionConfig = (isSinhala) => ({
  happy:    { emoji: '😊', label: isSinhala ? 'සතුටුයි' : 'Happy',    gradient: ['#FFF9C4','#FFF3E0'], color: '#F57F17', bg: '#FFFDE7' },
  sad:      { emoji: '😔', label: isSinhala ? 'දුකයි' : 'Sad',      gradient: ['#E8EAF6','#E3F2FD'], color: '#3949AB', bg: '#EDE7F6' },
  stressed: { emoji: '😟', label: isSinhala ? 'ආතතියයි' : 'Stressed', gradient: ['#EDE7F6','#FCE4EC'], color: '#7E57C2', bg: '#F3E5F5' },
});

const emojiFeelingsMap = (isSinhala) => ({
  '😊': isSinhala ? 'සතුටුයි' : 'Happy',
  '😌': isSinhala ? 'සන්සුන්' : 'Calm',
  '😔': isSinhala ? 'දුකයි' : 'Sad',
  '😪': isSinhala ? 'මහන්සියි' : 'Tired',
  '😠': isSinhala ? 'තරහයි' : 'Angry',
  '🌈': isSinhala ? 'බලාපොරොත්තු සහගතයි' : 'Hopeful',
  '🌟': isSinhala ? 'උද්‍යෝගිමත්' : 'Excited',
  '☁️': isSinhala ? 'මලානිකයි' : 'Gloomy',
});

const getSupportMessages = (isSinhala) => ({
  happy: {
    title: isSinhala ? 'ඔබ අද දිලිසෙනවා ✨' : 'You are shining today ✨',
    body: isSinhala ? 'ඔබේ ධනාත්මක ශක්තිය ප්‍රමාද යයි — ඔබ සහ ඔබේ දරුවාට. මෙම සතුටු මොහොත ආදරෙන් ගෙවන්න.' : 'Your positive energy shines through for you and your baby. Enjoy this happy moment.'
  },
  sad: {
    title: isSinhala ? 'ඔබේ හැඟීම් වලංගුයි 🌧️' : 'Your feelings are valid 🌧️',
    body: isSinhala ? 'දුකක් දැනෙනවා නම් හරිය. අම්මා වීම ලෝකයේ අභියෝගාත්මක කාර්යයකි. දැන් ඔබ වෙනුවෙන් ඉඩ ගනිමු.' : 'It is okay to feel sad. Being a mother is a challenging role. Take time for yourself now.'
  },
  stressed: {
    title: isSinhala ? 'ඔබ තනිව නොමැත 💜' : 'You are not alone 💜',
    body: isSinhala ? 'ආතතිය යනු ශ්‍රේෂ්ඨ ගොඩ බිමකට ළඟා වීමට දරන උත්සාහයකි. දැන් ඔබ සඳහා සන්සුන් බව සහ සහනය සොයා ගනිමු.' : 'Anxiety is love reaching for a safe shore. Let us find calm and relief for you now.'
  },
});

const DashboardScreenCopy = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const { user, latestAnalysis, moodHistory, preferencesSet, simulateNextDiary, nextDemoPreview } = useApp();
  const [processing, setProcessing] = useState(false);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSimulate = () => {
    setProcessing(true);
    setTimeout(() => { simulateNextDiary(); setProcessing(false); }, 600);
  };

  const affirmationsEN = [
    "You are doing an amazing job. The world knows the love you give to your baby.",
    "There is no perfect mother — only a real mother. And that's you.",
    "Resting is not giving up. It is gathering strength for what is ahead.",
    "You grew a human being. Think kindly of yourself today.",
    "Your baby needs you — exactly you.",
    "Healing is not linear. Every single day counts.",
    "You are not alone. Mothers all over the world are with you."
  ];

  const affirmationsList = isSinhala ? SI.affirmations : affirmationsEN;
  const affirmation = affirmationsList[new Date().getDay() % affirmationsList.length];

  const emotion  = latestAnalysis?.detectedEmotion || 'stressed';
  const risk     = latestAnalysis?.riskLevel || 'low';
  const ecMap    = emotionConfig(isSinhala);
  const ec       = ecMap[emotion] || ecMap.stressed;
  const selectedEmoji = latestAnalysis?.mood || ec.emoji;
  const selectedFeeling = emojiFeelingsMap(isSinhala)[selectedEmoji] || ec.label;
  const weekDays = moodHistory.slice(-7);

  const supportMsgs = getSupportMessages(isSinhala);
  const msg = supportMsgs[emotion] || supportMsgs.stressed;

  const riskPct = risk === 'medium' ? 65 : (risk === 'high' ? 90 : 30);
  const riskColor = risk === 'high' ? '#D32F2F' : (risk === 'medium' ? colors.riskMediumDark : colors.riskLowDark);
  const riskBg = risk === 'high' ? '#FFEBEE' : (risk === 'medium' ? '#FFFDE7' : '#E8F5E9');
  const riskDesc = risk === 'high'
    ? (isSinhala ? 'අධික අවදානම් මට්ටමක් හඳුනාගෙන ඇත. කරුණාකර වහාම සහාය පතන්න. 💖' : 'High risk level detected. Please seek support immediately. 💖')
    : (risk === 'medium'
      ? (isSinhala ? 'ඔබට දැන් ඉතිරි ආධාරක ලබා ගත හැක 💛' : 'Moderate risk level. Support is available for you 💛')
      : (isSinhala ? 'ඔබ ශ්‍රේෂ්ඨව ගෙවනවා. දිගටම! 💚' : 'You are doing great. Keep going! 💚'));

  const riskLabelText = risk === 'high'
    ? (isSinhala ? '🔴 අධික අවදානම' : '🔴 High Risk')
    : (risk === 'medium' ? (isSinhala ? '🟡 මධ්‍යම අවදානම' : '🟡 Medium Risk') : (isSinhala ? '🟢 අඩු අවදානම' : '🟢 Low Risk'));

  // Quick Actions with proper navigation
  const quickActions = [
    { icon: '🎵', label: isSinhala ? 'සංගීතය' : 'Music',     color: colors.lavenderLight, nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Recommendations', params: { tab: 'music' } } } },
    { icon: '🧘', label: isSinhala ? 'ක්‍රියාකාරකම්' : 'Activities', color: colors.roseLight,     nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Activity' } } },
    { icon: '🎮', label: isSinhala ? 'ක්‍රීඩා' : 'Games',      color: colors.mintLight,     nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Activity' } } },
    { icon: '📊', label: isSinhala ? 'ප්‍රගතිය' : 'Progress',  color: colors.peach,         nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Progress' } } },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F8F4FF','#FFF0F8','#F5FBFF']} style={s.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Top Header Row with Back Button and Language Toggle Button */}
          <View style={s.topBarRow}>
            <TouchableOpacity onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Dashboard');
              }
            }} style={s.backBtn}>
              <Text style={s.backText}>{isSinhala ? '← ආපසු' : '← Back'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => i18n.changeLanguage(isSinhala ? 'en' : 'si')}
              style={s.langToggleBtn}
              activeOpacity={0.7}
            >
              <Text style={s.langToggleText}>{isSinhala ? 'EN' : 'සිං'}</Text>
            </TouchableOpacity>
          </View>

          {/* Header */}
          <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View>
              <Text style={s.greeting}>{isSinhala ? 'සුභ උදෑසනක් 🌸' : 'Good Morning 🌸'}</Text>
              <Text style={s.name}>{isSinhala ? 'ආයුබෝවන්,' : 'Hello,'} {user.name}</Text>
            </View>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{user.name ? user.name[0] : 'S'}</Text>
            </View>
          </Animated.View>

          {/* Preferences prompt */}
          {!preferencesSet && (
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Preferences' })} style={s.prefBanner}>
              <Text style={s.prefBannerText}>
                {isSinhala ? '✨ ඔබේ ආධාර පෞද්ගලිකෘත කරන්න — ඔබේ කැමති ක්‍රියාකාරකම් තෝරන්න' : '✨ Personalize your support — Choose your preferred activities'}
              </Text>
              <Text style={s.prefArrow}>→</Text>
            </TouchableOpacity>
          )}

          {/* Merged Support Screen Contents */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={s.supportTitle}>{isSinhala ? 'හැඟීම් විශ්ලේෂණය 💜' : 'Emotional Analysis 💜'}</Text>
            <Text style={s.supportSubtitle}>{isSinhala ? 'ඔබේ දිනපොත කියවා විශ්ලේෂණය කෙරිණි' : 'Your diary entry was read and analyzed'}</Text>

            {/* System Note */}
            <View style={s.systemNote}>
              <Text style={s.systemNoteText}>
                {isSinhala ? '🔍 ඔබේ දිනපොත් සංරචකයෙන් ස්වයංක්‍රීයව සකසන ලදි' : '🔍 Automatically generated from your diary entry'}
              </Text>
            </View>

            {/* Risk Level Card */}
            <View style={[s.riskCard, { backgroundColor: riskBg }]}>
              <View style={s.riskTop}>
                <Text style={s.riskCardLabel}>{isSinhala ? 'හැඟීම් අවදානම් මට්ටම' : 'Emotional Risk Level'}</Text>
                <Text style={[s.riskText, { color: riskColor }]}>
                  {riskLabelText}
                </Text>
              </View>
              <View style={s.riskBar}>
                <View style={[s.riskBarFill, { width: `${riskPct}%`, backgroundColor: riskColor }]} />
              </View>
              <Text style={[s.riskDesc, { color: riskColor }]}>{riskDesc}</Text>
            </View>

            {/* Support Message Card */}
            <LinearGradient colors={['#EDE7F6', '#FCE4EC']} style={s.msgCard}>
              <Text style={s.msgTitle}>{msg.title}</Text>
              <Text style={s.msgBody}>{msg.body}</Text>
            </LinearGradient>

            {/* Urgency Card */}
            {risk === 'medium' && (
              <View style={s.urgencyCard}>
                <Text style={s.urgencyIcon}>💛</Text>
                <Text style={s.urgencyText}>
                  {isSinhala ? 'ඔබ යම් බරක් රැගෙන සිටිනවා. සෞඛ්‍ය සේවකයෙකු සහ විශේෂඥ කෙනෙකු සමඟ කතා කිරීම ගැන සලකා බලන්න. ඔබ ඒ ආධාරයට සුදුසුයි 💜' : 'You are carrying some weight. Consider talking to a healthcare provider or specialist. You deserve support 💜'}
                </Text>
              </View>
            )}

            {/* Get Recommendations Button */}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Main', {
                  screen: 'Tabs',
                  params: {
                    screen: 'Recommendations',
                    params: {
                      riskLevel: latestAnalysis?.riskLevel,
                      emotion: latestAnalysis?.detectedEmotion,
                      primaryReason: latestAnalysis?.primaryReason,
                    }
                  }
                })
              }
              style={s.recBtn}
            >
              <LinearGradient
                colors={['#8E24AA', '#D81B60']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.recBtnInner}
              >
                <Text style={s.recBtnText}>{isSinhala ? 'පෞද්ගලිකෘත ආධාර ලබාගන්න 💜' : 'Get Personalized Support 💜'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* 7-Day Strip */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{isSinhala ? 'මෙම සතිය' : 'This Week'}</Text>
            <View style={s.weekStrip}>
              {weekDays.map((d, i) => {
                const ec = ecMap[d.emotion] || ecMap.stressed;
                const SI_DAYS = ['ඉරි', 'සඳු', 'අඟ', 'බදා', 'බ්‍රහ', 'සිකු', 'සෙන'];
                const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const daysArr = isSinhala ? SI_DAYS : EN_DAYS;
                const dayIndex = i % 7;
                const dayDisplay = daysArr[dayIndex] || d.day;
                const isToday = i === weekDays.length - 1;
                const displayEmoji = d.emoji || d.mood || ec.emoji;
                return (
                  <View key={i} style={[s.dayChip, { backgroundColor: ec.bg }, isToday && s.dayChipToday]}>
                    <Text style={s.dayEmoji}>{displayEmoji}</Text>
                    <Text style={[s.dayLabel, isToday && { color: colors.lavenderDark, fontWeight: '800' }]}>{dayDisplay}</Text>
                    <Text style={s.riskDot}>{d.risk === 'medium' ? '🟡' : '🟢'}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{isSinhala ? 'ඉක්මන් ආධාර' : 'Quick Support'}</Text>
            <View style={s.quickGrid}>
              {quickActions.map((a, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[s.quickCard, { backgroundColor: a.color }]}
                  onPress={() => navigation.navigate(a.nav, a.params)}
                >
                  <Text style={s.quickIcon}>{a.icon}</Text>
                  <Text style={s.quickLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Affirmation */}
          <LinearGradient colors={['#EDE7F6','#FCE4EC']} style={s.affirmCard}>
            <Text style={s.affirmTitle}>{isSinhala ? 'අදේ ශක්තිය ✨' : 'Today\'s Affirmation ✨'}</Text>
            <Text style={s.affirmText}>"{affirmation}"</Text>
          </LinearGradient>

          <View style={{ height: 110 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  container:      { flex: 1 },
  gradient:       { flex: 1 },
  scroll:         { paddingHorizontal: spacing.md, paddingTop: 56 },
  topBarRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backBtn:        { alignSelf: 'flex-start' },
  backText:       { color: colors.lavenderDark, fontWeight: '700', fontSize: 16 },
  langToggleBtn:  { backgroundColor: '#F0E6FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.lavenderDark },
  langToggleText: { fontSize: 13, fontWeight: '800', color: colors.lavenderDark },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  greeting:       { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  name:           { fontSize: 26, fontWeight: '900', color: colors.textPrimary, marginTop: 2 },
  week:           { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  avatar:         { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.lavender, justifyContent: 'center', alignItems: 'center', ...shadows.soft },
  avatarText:     { fontSize: 20, fontWeight: '800', color: colors.white },
  prefBanner:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lavenderLight, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1.5, borderColor: colors.lavenderMid },
  prefBannerText: { flex: 1, fontSize: 13, color: colors.lavenderDark, fontWeight: '700' },
  prefArrow:      { fontSize: 18, color: colors.lavenderDark },
  emotionCard:    { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card },
  emotionTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  emotionLeft:    { flex: 1 },
  emotionSub:     { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  emotionTitle:   { fontSize: 20, fontWeight: '900', marginBottom: 10 },
  riskBadge:      { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.full },
  riskLabel:      { fontSize: 12, fontWeight: '800' },
  emotionEmoji:   { fontSize: 52 },
  emotionMsg:     { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md },
  viewBtn:        { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: radius.full, paddingVertical: 10, paddingHorizontal: 18, alignSelf: 'flex-start', ...shadows.soft },
  viewBtnText:    { fontWeight: '800', fontSize: 13 },
  section:        { marginBottom: spacing.lg },
  sectionTitle:   { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md },
  weekStrip:      { flexDirection: 'row', justifyContent: 'space-between' },
  dayChip:        { flex: 1, marginHorizontal: 2, paddingVertical: 8, alignItems: 'center', borderRadius: radius.lg },
  dayChipToday:   { borderWidth: 2, borderColor: colors.lavenderDark },
  dayEmoji:       { fontSize: 16, marginBottom: 2 },
  dayLabel:       { fontSize: 9, color: colors.textSecondary, fontWeight: '600' },
  riskDot:        { fontSize: 8, marginTop: 2 },
  quickGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard:      { width: (width - spacing.md * 2 - 10) / 2, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center', ...shadows.soft },
  quickIcon:      { fontSize: 32, marginBottom: 8 },
  quickLabel:     { fontSize: 13, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  affirmCard:     { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.soft },
  affirmTitle:    { fontSize: 13, fontWeight: '800', color: colors.lavenderDark, marginBottom: 8 },
  affirmText:     { fontSize: 15, color: colors.textSecondary, lineHeight: 24, fontStyle: 'italic' },
  demoSection:    { backgroundColor: colors.softGray, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  demoTitle:      { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  demoPreview:    { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', marginBottom: 12, lineHeight: 18 },
  demoBtn:        { backgroundColor: colors.white, borderRadius: radius.full, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'flex-start', ...shadows.soft },
  demoBtnText:    { color: colors.lavenderDark, fontWeight: '700', fontSize: 13 },
  supportTitle: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, marginBottom: 8 },
  supportSubtitle: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md },
  systemNote: {
    backgroundColor: '#F3E5F5',
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#E1BEE7'
  },
  systemNoteText: { fontSize: 12, color: '#7B1FA2', fontWeight: '600' },
  moodCard: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.soft },
  moodCardLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 12 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  moodEmojiBig: { fontSize: 52 },
  moodName: { fontSize: 26, fontWeight: '900' },
  moodSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  riskCard: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.soft },
  riskTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  riskCardLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5 },
  riskText: { fontSize: 18, fontWeight: '900' },
  riskBar: { height: 10, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  riskBarFill: { height: 10, borderRadius: 5 },
  riskDesc: { fontSize: 13, fontWeight: '600' },
  msgCard: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.soft },
  msgTitle: { fontSize: 19, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  msgBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 23 },
  urgencyCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#FFFDE7', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: '#FFD54F' },
  urgencyIcon: { fontSize: 20 },
  urgencyText: { flex: 1, fontSize: 13, color: '#E65100', lineHeight: 20 },
  recBtn: { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.xl, ...shadows.card },
  recBtnInner: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  recBtnText: { color: colors.white, fontWeight: '800', fontSize: 16 },
});

export default DashboardScreenCopy;