// ================================================================
// DASHBOARD SCREEN — DashboardScreen copy.js  (Sinhala UI with Quick Actions)
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { useApp } from '../services/AppContext';
import { SI } from '../services/translations';

const { width } = Dimensions.get('window');

const emotionConfig = {
  happy:    { emoji: '😊', label: SI.happy,    gradient: ['#FFF9C4','#FFF3E0'], color: '#F57F17', bg: '#FFFDE7' },
  sad:      { emoji: '😔', label: SI.sad,      gradient: ['#E8EAF6','#E3F2FD'], color: '#3949AB', bg: '#EDE7F6' },
  stressed: { emoji: '😟', label: SI.stressed, gradient: ['#EDE7F6','#FCE4EC'], color: '#7E57C2', bg: '#F3E5F5' },
};

const emojiFeelingsSI = {
  '😊': 'සතුටුයි',
  '😌': 'සන්සුන්',
  '😔': 'දුකයි',
  '😪': 'මහන්සියි',
  '😠': 'තරහයි',
  '🌈': 'බලාපොරොත්තු සහගතයි',
  '🌟': 'උද්‍යෝගිමත්',
  '☁️': 'මලානිකයි',
};

const summaryMessages = {
  happy:    'ඔබ අද ආලෝකය විහිදිනවා 🌸 ඒ සතුට රක්ෂා කරන්න.',
  sad:      'දුකක් දැනෙනවා නම් හරි. අපි ඔබ සමඟ ආදරෙන් ඉදිමු 💜',
  stressed: 'ඔබ ගොඩ දෙයක් රැගෙන ඉදිමු. සන්සුන් දෙයක් සොයා ගනිමු 🌿',
};

const supportMessages = {
  happy: { title: 'ඔබ අද දිලිසෙනවා ✨', body: 'ඔබේ ධනාත්මක ශක්තිය ප්‍රමාද යයි — ඔබ සහ ඔබේ දරුවාට. මෙම සතුටු මොහොත ආදරෙන් ගෙවන්න.' },
  sad: { title: 'ඔබේ හැඟීම් වලංගුයි 🌧️', body: 'දුකක් දැනෙනවා නම් හරිය. අම්මා වීම ලෝකයේ හැහෑ දෙකක් ඇති කාර්යයකි. දැන් ඔබ වෙනුවෙන් ඉඩ ගනිමු.' },
  stressed: { title: 'ඔබ තනිව නොමැත 💜', body: 'ආතතිය ආදරය — ශ්‍රේෂ්ඨ ගොඩ බිමකට ළඟා වීමට. දැන් ඔබ සඳහා සන්සුන් සහ සහනය සොයා ගනිමු.' },
};

const DashboardScreenCopy = ({ navigation }) => {
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

  const affirmation = SI.affirmations[new Date().getDay() % SI.affirmations.length];
  const emotion  = latestAnalysis?.detectedEmotion || 'stressed';
  const risk     = latestAnalysis?.riskLevel || 'low';
  const ec       = emotionConfig[emotion] || emotionConfig.stressed;
  const selectedEmoji = latestAnalysis?.mood || ec.emoji;
  const selectedFeeling = emojiFeelingsSI[selectedEmoji] || ec.label;
  const weekDays = moodHistory.slice(-7);

  const msg = supportMessages[emotion] || supportMessages.stressed;
  const riskPct = risk === 'medium' ? 65 : 30;
  const riskColor = risk === 'medium' ? colors.riskMediumDark : colors.riskLowDark;
  const riskBg = risk === 'medium' ? '#FFFDE7' : '#E8F5E9';
  const riskDesc = risk === 'medium' ? 'ඔබට දැන් ඉතිරි ආධාරක ශ්‍රේෂ්ඨ 💛' : 'ඔබ ශ්‍රේෂ්ඨව ගෙවනවා. දිගටම! 💚';

  // Quick Actions with proper navigation
  const quickActions = [
    { icon: '🎵', label: 'සංගීතය',     color: colors.lavenderLight, nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Recommendations', params: { tab: 'music' } } } },
    { icon: '🧘', label: 'ක්‍රියාකාරකම්', color: colors.roseLight,     nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Activity' } } },
    { icon: '🎮', label: 'ක්‍රීඩා',      color: colors.mintLight,     nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Activity' } } },
    { icon: '📊', label: 'ශ්‍රේෂ්ඨතාව',  color: colors.peach,         nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Progress' } } },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F8F4FF','#FFF0F8','#F5FBFF']} style={s.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Back Button */}
          <TouchableOpacity onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Dashboard');
            }
          }} style={s.backBtn}>
            <Text style={s.backText}>← ආපසු</Text>
          </TouchableOpacity>

          {/* Header */}
          <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View>
              <Text style={s.greeting}>{SI.goodMorning}</Text>
              <Text style={s.name}>{SI.hi} {user.name}</Text>
            </View>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{user.name[0]}</Text>
            </View>
          </Animated.View>

          {/* Preferences prompt */}
          {!preferencesSet && (
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Preferences' })} style={s.prefBanner}>
              <Text style={s.prefBannerText}>✨ ඔබේ ආධාර පෞද්ගලිකෘත කරන්න — ඔබේ කැමති ක්‍රියාකාරකම් තෝරන්න</Text>
              <Text style={s.prefArrow}>→</Text>
            </TouchableOpacity>
          )}

          {/* Merged Support Screen Contents */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={s.supportTitle}>{SI.emotionalAnalysis}</Text>
            <Text style={s.supportSubtitle}>{SI.diaryProcessed}</Text>

            {/* System Note */}
            <View style={s.systemNote}>
              <Text style={s.systemNoteText}>{SI.systemNote}</Text>
            </View>


            {/* Risk Level Card */}
            <View style={[s.riskCard, { backgroundColor: riskBg }]}>
              <View style={s.riskTop}>
                <Text style={s.riskCardLabel}>{SI.riskLevel}</Text>
                <Text style={[s.riskText, { color: riskColor }]}>
                  {risk === 'medium' ? 'මධ්‍යම' : 'අඩු'}
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
                <Text style={s.urgencyText}>{SI.mediumRiskMsg}</Text>
              </View>
            )}

            {/* Get Recommendations Button (Replaces View Plan) */}
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
                <Text style={s.recBtnText}>{SI.getSupport}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* 7-Day Strip */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{SI.thisWeek}</Text>
            <View style={s.weekStrip}>
              {weekDays.map((d, i) => {
                const e = emotionConfig[d.emotion] || emotionConfig.stressed;
                const SI_DAYS = ['ඉරි', 'සඳු', 'අඟ', 'බදා', 'බ්‍රහ', 'සිකු', 'සෙන'];
                const todayDayName = SI_DAYS[new Date().getDay()];
                const isToday = d.day === todayDayName;
                const displayEmoji = d.emoji || d.mood || e.emoji;
                return (
                  <View key={i} style={[s.dayChip, { backgroundColor: e.bg }, isToday && s.dayChipToday]}>
                    <Text style={s.dayEmoji}>{displayEmoji}</Text>
                    <Text style={[s.dayLabel, isToday && { color: colors.lavenderDark, fontWeight: '800' }]}>{d.day}</Text>
                    <Text style={s.riskDot}>{d.risk === 'medium' ? '🟡' : '🟢'}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quick Actions - THIS WAS MISSING! */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{SI.quickSupport}</Text>
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
            <Text style={s.affirmTitle}>{SI.todaysAffirm}</Text>
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
  backBtn:        { marginBottom: 12, alignSelf: 'flex-start' },
  backText:       { color: colors.lavenderDark, fontWeight: '700', fontSize: 16 },
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