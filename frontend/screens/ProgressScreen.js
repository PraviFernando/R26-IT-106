// ================================================================
// PROGRESS SCREEN — ProgressScreen.js  (Postpartum Mom Progress & Badges Dashboard)
// ================================================================
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius, shadows } from '../theme';
import { useApp } from '../services/AppContext';
import { ALL_ACTIVITIES, ALL_GAMES } from '../services/activitiesLibrary';
import { SI } from '../services/translations';
import ScreenContainer from '../components/ScreenContainer';

const moodScore = { happy: 5, stressed: 3, sad: 1, anxious: 2 };
const emotionConfig = {
  happy:    { emoji: '😊', barColor: '#FFD54F', barBg: '#FFFDE7', label: 'සතුටුයි (Happy)' },
  stressed: { emoji: '😟', barColor: '#CE93D8', barBg: '#F3E5F5', label: 'ආතතියයි (Stressed)' },
  sad:      { emoji: '😔', barColor: '#7986CB', barBg: '#EDE7F6', label: 'දුකයි (Sad)' },
  anxious:  { emoji: '😰', barColor: '#9575CD', barBg: '#EDE7F6', label: 'කාංසාවයි (Anxious)' }
};
const riskConfig = {
  low:    { label: 'අඩු (Low)',       color: colors.riskLowDark,    bg: '#E8F5E9', dot: '🟢' },
  medium: { label: 'මධ්‍යම (Medium)', color: colors.riskMediumDark, bg: '#FFFDE7', dot: '🟡' },
  high:   { label: 'ඉහළ (High)',     color: '#D32F2F',            bg: '#FFEBEE', dot: '🔴' }
};

// ── UTILITY HELPERS FOR DYNAMIC CALCULATIONS ─────────────────────

const getLocalDateStr = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() - offsetDays);
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const calculateDiaryStreak = (diaries) => {
  if (!diaries || diaries.length === 0) return 0;
  
  const uniqueDates = Array.from(new Set(
    diaries.filter(d => d.content && d.content.trim().length > 0).map(d => d.date)
  )).sort().reverse();
  
  if (uniqueDates.length === 0) return 0;

  const todayStr = getLocalDateStr(0);
  const yesterdayStr = getLocalDateStr(1);
  
  let streak = 0;
  let currentDate = null;
  
  if (uniqueDates.includes(todayStr)) {
    currentDate = new Date(todayStr);
  } else if (uniqueDates.includes(yesterdayStr)) {
    currentDate = new Date(yesterdayStr);
  } else {
    return 0; // Streak broken if neither today nor yesterday has a diary
  }
  
  while (true) {
    const curStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    if (uniqueDates.includes(curStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

const calculateActivityStreak = (activities) => {
  if (!activities || activities.length === 0) return 0;
  
  const uniqueDates = Array.from(new Set(
    activities.filter(a => a.completed).map(a => a.date)
  )).sort().reverse();
  
  if (uniqueDates.length === 0) return 0;

  const todayStr = getLocalDateStr(0);
  const yesterdayStr = getLocalDateStr(1);
  
  let streak = 0;
  let currentDate = null;
  
  if (uniqueDates.includes(todayStr)) {
    currentDate = new Date(todayStr);
  } else if (uniqueDates.includes(yesterdayStr)) {
    currentDate = new Date(yesterdayStr);
  } else {
    return 0;
  }
  
  while (true) {
    const curStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    if (uniqueDates.includes(curStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

const getMostCommonEmotion = (diaries) => {
  if (!diaries || diaries.length === 0) return 'දත්ත නැත';
  const counts = {};
  diaries.forEach(d => {
    if (d.emotion) {
      const e = d.emotion.toLowerCase();
      counts[e] = (counts[e] || 0) + 1;
    }
  });
  
  let maxEmotion = 'stressed';
  let maxVal = -1;
  Object.entries(counts).forEach(([emot, count]) => {
    if (count > maxVal) {
      maxVal = count;
      maxEmotion = emot;
    }
  });

  const emotionLabels = {
    happy: 'සතුටුයි 😊',
    sad: 'දුකයි 😔',
    stressed: 'ආතතියයි 😟',
    anxious: 'කාංසාවයි 😰'
  };
  return emotionLabels[maxEmotion] || 'ආතතියයි 😟';
};

// ── COMPONENT ────────────────────────────────────────────────────

const ProgressScreen = ({ navigation }) => {
  const { progressDiaries, progressActivities, loadingProgress, errorProgress, fetchProgressData } = useApp();
  const [activeTab, setActiveTab] = useState('journey'); // 'journey' or 'badges'
  const [filterSubTab, setFilterSubTab] = useState('all'); // 'all', 'games', 'activities'

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProgressData();
    });
    return unsubscribe;
  }, [navigation]);

  // Loading Overlay
  if (loadingProgress) {
    return (
      <View style={s.centerScreen}>
        <ActivityIndicator size="large" color={colors.lavenderDark} />
        <Text style={s.centerText}>ප්‍රගති දත්ත පූරණය වෙමින් පවතී (Loading your progress)...</Text>
      </View>
    );
  }

  // Error Alert State
  if (errorProgress) {
    return (
      <View style={s.centerScreen}>
        <Text style={[s.centerText, { color: '#D32F2F', fontWeight: 'bold' }]}>⚠️ ප්‍රගති දත්ත පූරණය කිරීමට නොහැකි විය.</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Unable to load your progress.</Text>
        <TouchableOpacity onPress={fetchProgressData} style={s.retryBtn}>
          <Text style={s.retryText}>නැවත උත්සාහ කරන්න (Retry)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 1. Calculations: Trailing 7 Calendar Days Data
  const SI_DAYS = ['ඉරි', 'සඳු', 'අඟ', 'බදා', 'බ්‍රහ', 'සිකු', 'සෙන'];
  const chartDays = [];
  for (let i = 6; i >= 0; i--) {
    const dateStr = getLocalDateStr(i);
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = SI_DAYS[d.getDay()];

    const dayDiaries = progressDiaries.filter(x => x.date === dateStr);
    // Sort descending by updatedAt to get the latest entry if multiple exist on same day
    dayDiaries.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const diary = dayDiaries[0] || null;

    chartDays.push({
      dateStr,
      dayName,
      isToday: i === 0,
      hasData: Boolean(diary),
      emotion: diary ? (diary.emotion || 'stressed').toLowerCase() : 'no_data',
      risk: diary ? (diary.riskLevel || 'low').toLowerCase() : null,
      emoji: diary ? diary.mood : null
    });
  }

  // 2. Calculations: Weekly Date Ranges (Week 1 = last 7 days, Week 2 = 7 days prior)
  const w1Start = getLocalDateStr(6);
  const w1End = getLocalDateStr(0);
  const w2Start = getLocalDateStr(13);
  const w2End = getLocalDateStr(7);

  const w1Diaries = progressDiaries.filter(d => d.date >= w1Start && d.date <= w1End);
  const w2Diaries = progressDiaries.filter(d => d.date >= w2Start && d.date <= w2End);
  
  const completedRecords = progressActivities.filter(a => a.completed);
  const w1Activities = completedRecords.filter(a => a.date >= w1Start && a.date <= w1End);
  const w2Activities = completedRecords.filter(a => a.date >= w2Start && a.date <= w2End);

  // 3. Stats Calculations
  const diaryStreak = calculateDiaryStreak(progressDiaries);
  const activityStreak = calculateActivityStreak(progressActivities);
  const totalCompleted = completedRecords.length;

  // 4. Group activities/games by base ID to calculate totals
  const completionsCountMap = {};
  completedRecords.forEach(rec => {
    const baseId = rec.activityId.replace(/_\d+$/, '');
    completionsCountMap[baseId] = (completionsCountMap[baseId] || 0) + 1;
  });

  let totalGamesCompletedCount = 0;
  let totalActivitiesCompletedCount = 0;
  let uniqueGamesSet = new Set();
  let uniqueActivitiesSet = new Set();

  Object.entries(completionsCountMap).forEach(([baseId, count]) => {
    const isGame = ALL_GAMES.some(g => g.id === baseId);
    const isAct = ALL_ACTIVITIES.some(a => a.id === baseId);
    if (isGame) {
      totalGamesCompletedCount += count;
      uniqueGamesSet.add(baseId);
    } else if (isAct) {
      totalActivitiesCompletedCount += count;
      uniqueActivitiesSet.add(baseId);
    }
  });

  const uniqueGamesCount = uniqueGamesSet.size;
  const uniqueActivitiesCount = uniqueActivitiesSet.size;

  const countsArray = Object.values(completionsCountMap);
  const maxCompletionsOfSingleItem = countsArray.length ? Math.max(...countsArray) : 0;
  const uniqueActiveDaysCount = new Set(completedRecords.map(a => a.date)).size;

  // 5. Dynamic Badges logic based on MongoDB data
  const badgesDef = [
    { id: 'first_step', icon: '🌱', title: 'First Step (පළමු පියවර)', desc: 'ඕනෑම ක්‍රියාකාරකමක් හෝ ක්‍රීඩාවක් 1 වතාවක් සම්පූර්ණ කරන්න.', earned: totalCompleted >= 1, progress: `${Math.min(totalCompleted, 1)}/1`, threshold: 1, current: totalCompleted },
    { id: 'five_times', icon: '🔥', title: '5 Times (5 වතාවක්)', desc: 'ඕනෑම එක් ක්‍රියාකාරකමක් හෝ ක්‍රීඩාවක් 5 වතාවක් කරන්න.', earned: maxCompletionsOfSingleItem >= 5, progress: `${Math.min(maxCompletionsOfSingleItem, 5)}/5`, threshold: 5, current: maxCompletionsOfSingleItem },
    { id: 'ten_times', icon: '⭐', title: '10 Times (10 වතාවක්)', desc: 'ඕනෑම එක් ක්‍රියාකාරකමක් හෝ ක්‍රීඩාවක් 10 වතාවක් කරන්න.', earned: maxCompletionsOfSingleItem >= 10, progress: `${Math.min(maxCompletionsOfSingleItem, 10)}/10`, threshold: 10, current: maxCompletionsOfSingleItem },
    { id: 'twentyfive_times', icon: '🏆', title: '25 Times (25 වතාවක්)', desc: 'ඕනෑම එක් ක්‍රියාකාරකමක් හෝ ක්‍රීඩාවක් 25 වතාවක් කරන්න.', earned: maxCompletionsOfSingleItem >= 25, progress: `${Math.min(maxCompletionsOfSingleItem, 25)}/25`, threshold: 25, current: maxCompletionsOfSingleItem },
    { id: 'game_explorer', icon: '🎮', title: 'Game Explorer (ක්‍රීඩා ගවේෂක)', desc: 'විවිධ ක්‍රීඩා 5 ක් හෝ වැඩි ගණනක් ක්‍රීඩා කරන්න.', earned: uniqueGamesCount >= 5, progress: `${Math.min(uniqueGamesCount, 5)}/5`, threshold: 5, current: uniqueGamesCount },
    { id: 'selfcare_explorer', icon: '🧘', title: 'Self-Care Explorer', desc: 'විවිධ ශ්වාස/ලිවීම් ක්‍රියාකාරකම් 5 ක් කරන්න.', earned: uniqueActivitiesCount >= 5, progress: `${Math.min(uniqueActivitiesCount, 5)}/5`, threshold: 5, current: uniqueActivitiesCount },
    { id: 'consistent_user', icon: '🌟', title: 'Consistent User', desc: 'විවිධ දින 7 කදී ක්‍රියාකාරකම් හෝ ක්‍රීඩා කරන්න.', earned: uniqueActiveDaysCount >= 7, progress: `${Math.min(uniqueActiveDaysCount, 7)}/7`, threshold: 7, current: uniqueActiveDaysCount }
  ];

  const earnedBadges = badgesDef.filter(b => b.earned);
  const upcomingBadges = badgesDef.filter(b => !b.earned);

  // Helper to fetch details for individual progress items
  const todayStr = getLocalDateStr(0);
  const yesterdayStr = getLocalDateStr(1);

  const getItemProgress = (itemId) => {
    const itemRecords = completedRecords.filter(r => r.activityId.replace(/_\d+$/, '') === itemId);
    const total = itemRecords.length;
    const todayCount = itemRecords.filter(r => r.date === todayStr).length;
    
    let lastPlayedLabel = 'Not completed yet';
    if (total > 0) {
      const dates = itemRecords.map(r => r.date).sort().reverse();
      const latestDate = dates[0];
      if (latestDate === todayStr) {
        lastPlayedLabel = 'Today (අද)';
      } else if (latestDate === yesterdayStr) {
        lastPlayedLabel = 'Yesterday (ඊයේ)';
      } else {
        lastPlayedLabel = latestDate;
      }
    }
    return { total, todayCount, lastPlayedLabel };
  };

  // Sort activities/games dynamically:
  // 1. Most completed desc
  // 2. Most recently completed desc
  // 3. Alphabetical desc
  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      const progA = getItemProgress(a.id);
      const progB = getItemProgress(b.id);
      
      if (progB.total !== progA.total) {
        return progB.total - progA.total;
      }
      
      if (progA.total > 0 && progB.total > 0) {
        const itemRecsA = completedRecords.filter(r => r.activityId.replace(/_\d+$/, '') === a.id);
        const itemRecsB = completedRecords.filter(r => r.activityId.replace(/_\d+$/, '') === b.id);
        const dateA = itemRecsA.map(r => r.date).sort().reverse()[0];
        const dateB = itemRecsB.map(r => r.date).sort().reverse()[0];
        return dateB.localeCompare(dateA);
      }
      
      const labelA = a.labelEn || '';
      const labelB = b.labelEn || '';
      return labelA.localeCompare(labelB);
    });
  };

  const MAX_BAR = 110;

  // ── SCREEN RENDERING: TAB 1 (JOURNEY DASHBOARD) ───────────────────

  const renderJourneyTab = () => {
    const hasAnyDiary = progressDiaries.length > 0;
    
    // Empty state if user has never logged a diary
    if (!hasAnyDiary) {
      return (
        <View style={s.emptyStateBox}>
          <Text style={{ fontSize: 60, marginBottom: spacing.md }}>🌱</Text>
          <Text style={s.emptyStateTextHeader}>ඔබේ ගමන මෙතැනින් ඇරඹේ.</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg }}>
            Your journey starts here. Write your first diary entry to begin tracking your emotional journey.
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Diary')} style={s.emptyStateBtn}>
            <Text style={s.emptyStateBtnText}>📓 පළමු දිනපොත ලියන්න (Write First Diary)</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Calculations for active stats
    const diaryEntriesThisWeekCount = w1Diaries.length;
    const activitiesThisWeekCount = w1Activities.length;

    // Emotion summary counts
    const emotionCounts = { happy: 0, sad: 0, stressed: 0, anxious: 0 };
    progressDiaries.forEach(d => {
      if (d.emotion) {
        const e = d.emotion.toLowerCase();
        if (emotionCounts[e] !== undefined) {
          emotionCounts[e]++;
        }
      }
    });
    const existingEmotions = Object.entries(emotionCounts).filter(([_, count]) => count > 0);

    // Risk summary counts
    const riskCounts = { low: 0, medium: 0, high: 0 };
    progressDiaries.forEach(d => {
      if (d.riskLevel) {
        const r = d.riskLevel.toLowerCase();
        if (riskCounts[r] !== undefined) {
          riskCounts[r]++;
        }
      }
    });

    // Weekly Insight comparison card
    const totalW1 = w1Diaries.length;
    const totalW2 = w2Diaries.length;
    const actsW1 = w1Activities.length;
    const actsW2 = w2Activities.length;
    const hasEnoughComparisonData = progressDiaries.length >= 2 || completedRecords.length >= 1;

    let diaryInsight = '';
    if (totalW1 > totalW2) {
      diaryInsight = `📈 පසුගිය සතියට වඩා ඔබ මේ සතියේ දිනපොත් ${totalW1 - totalW2} ක් වැඩියෙන් ලියා ඇත. (Wrote ${totalW1 - totalW2} more diaries this week).`;
    } else if (totalW1 < totalW2) {
      diaryInsight = `📉 පසුගිය සතියට වඩා ඔබ මේ සතියේ දිනපොත් ${totalW2 - totalW1} ක් අඩුවෙන් ලියා ඇත.`;
    } else {
      diaryInsight = `✏️ පසුගිය සතියේ සහ මේ සතියේ ඔබ දිනපොත් සමාන ප්‍රමාණයක් (${totalW1}) ලියා ඇත.`;
    }

    let actInsight = '';
    if (actsW1 > actsW2) {
      actInsight = `📈 පසුගිය සතියට වඩා ඔබ මේ සතියේ ක්‍රියාකාරකම් ${actsW1 - actsW2} ක් වැඩියෙන් සම්පූර්ණ කර ඇත. (Completed ${actsW1 - actsW2} more activities this week).`;
    } else if (actsW1 < actsW2) {
      actInsight = `📉 පසුගිය සතියට වඩා ඔබ මේ සතියේ ක්‍රියාකාරකම් ${actsW2 - actsW1} ක් අඩුවෙන් සම්පූර්ණ කර ඇත.`;
    } else {
      actInsight = `🧘 පසුගිය සතියේ සහ මේ සතියේ ඔබ ක්‍රියාකාරකම් සමාන ප්‍රමාණයක් (${actsW1}) සම්පූර්ණ කර ඇත.`;
    }

    // Risk statement (Neutral, non-medical)
    let riskInsight = '';
    const lowRiskW1 = w1Diaries.filter(d => d.riskLevel === 'low').length;
    if (lowRiskW1 > 0 && lowRiskW1 === totalW1) {
      riskInsight = `💚 ඔබේ මෑතකාලීන සටහන් ප්‍රධාන වශයෙන් අඩු අවදානම් (Low Risk) වර්ගීකරණයන් පෙන්වයි. (Your recent entries contain mostly Low Risk classifications).`;
    }

    return (
      <View>
        {/* Stats Summary Widget */}
        <View style={s.summaryCard}>
          <Text style={s.sectionHeader}>මෙම සතිය (This Week)</Text>
          <View style={s.widgetRow}>
            <View style={s.widgetCell}>
              <Text style={s.widgetEmoji}>🔥</Text>
              <Text style={s.widgetVal}>{diaryStreak} days</Text>
              <Text style={s.widgetLabel}>දිනපොත් දින දාමය (Diary Streak)</Text>
            </View>
            <View style={[s.widgetCell, { borderLeftWidth: 1, borderLeftColor: colors.softGray }]}>
              <Text style={s.widgetEmoji}>🎯</Text>
              <Text style={s.widgetVal}>{activitiesThisWeekCount} completed</Text>
              <Text style={s.widgetLabel}>ක්‍රියාකාරකම් (Self-Care Activities)</Text>
            </View>
          </View>
        </View>

        {/* 7-Day Calendar Chart */}
        <View style={s.chartCard}>
          <Text style={s.sectionHeader}>මගේ මානසික ගමන (My Emotional Journey)</Text>
          <View style={s.chartArea}>
            {chartDays.map((d, i) => {
              if (!d.hasData) {
                return (
                  <View key={i} style={s.barCol}>
                    <Text style={[s.barEmoji, { color: colors.textMuted }]}>-</Text>
                    <Text style={s.barRisk}>-</Text>
                    <View style={[s.barBg, { backgroundColor: '#F5F5F5', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC' }]}>
                      <View style={[s.barFill, { height: 5, backgroundColor: '#DDD' }]} />
                    </View>
                    <Text style={[s.barDay, d.isToday && s.barDayToday]}>{d.dayName}</Text>
                  </View>
                );
              }

              const ec = emotionConfig[d.emotion] || emotionConfig.stressed;
              const rc = riskConfig[d.risk] || riskConfig.low;
              const barH = ((moodScore[d.emotion] || 3) / 5) * MAX_BAR;
              const displayEmoji = d.emoji || ec.emoji;

              return (
                <View key={i} style={s.barCol}>
                  <Text style={s.barEmoji}>{displayEmoji}</Text>
                  <Text style={s.barRisk}>{rc.dot}</Text>
                  <View style={[s.barBg, { backgroundColor: ec.barBg }]}>
                    <View style={[s.barFill, { height: barH, backgroundColor: ec.barColor }]} />
                  </View>
                  <Text style={[s.barDay, d.isToday && s.barDayToday]}>{d.dayName}</Text>
                </View>
              );
            })}
          </View>
          <View style={s.legend}>
            {Object.entries(emotionConfig).map(([k, ec]) => (
              <View key={k} style={s.legendItem}>
                <Text style={s.legendEmoji}>{ec.emoji}</Text>
                <Text style={s.legendLabel}>{ec.label.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Emotion Distribution Summary */}
        <View style={s.summaryCard}>
          <Text style={s.sectionHeader}>හැඟීම් සාරාංශය (Emotion Summary)</Text>
          {existingEmotions.length === 0 ? (
            <Text style={s.emptyStateLabel}>No emotional data yet.</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {existingEmotions.map(([key, count]) => {
                const cfg = emotionConfig[key] || emotionConfig.stressed;
                return (
                  <View key={key} style={s.emotionRow}>
                    <Text style={s.emotionEmoji}>{cfg.emoji} {cfg.label}</Text>
                    <View style={s.emotionTrackBg}>
                      <View style={[s.emotionTrackFill, { width: `${(count / progressDiaries.length) * 100}%`, backgroundColor: cfg.barColor }]} />
                    </View>
                    <Text style={s.emotionCountVal}>{count}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Risk Trend Overview */}
        <View style={s.summaryCard}>
          <Text style={s.sectionHeader}>අවදානම් තත්ත්ව විශ්ලේෂණය (Risk Status Summary)</Text>
          <View style={s.riskRow}>
            {Object.entries(riskCounts).map(([key, count]) => {
              const cfg = riskConfig[key] || riskConfig.low;
              return (
                <View key={key} style={[s.riskChip, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.riskChipText, { color: cfg.color }]}>
                    {cfg.dot} {cfg.label.split(' ')[0]}: {count}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={s.riskDisclaimer}>
            * මෙම දත්ත දෛනික දිනපොත් සටහන් මත පදනම් වූවක් වන අතර, වෛද්‍යමය රෝග විනිශ්චයක් නොවේ.
          </Text>
        </View>

        {/* Self-Care Progress Section */}
        <View style={s.summaryCard}>
          <Text style={s.sectionHeader}>ස්වයං-රැකවරණ ප්‍රගතිය (Self-Care Progress)</Text>
          {completedRecords.length === 0 ? (
            <View style={{ paddingVertical: 10 }}>
              <Text style={s.emptyStateLabel}>No completed activities yet.</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
                Complete a recommended activity to start tracking your self-care progress.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              <View style={s.progressSummaryLine}>
                <Text style={s.progressLabelEn}>Activity writing / meditation streak:</Text>
                <Text style={s.progressValEn}>🔥 {activityStreak} days</Text>
              </View>
              <View style={s.progressSummaryLine}>
                <Text style={s.progressLabelEn}>Total activities completed (All Time):</Text>
                <Text style={s.progressValEn}>🧘 {totalCompleted} completed</Text>
              </View>
            </View>
          )}
        </View>

        {/* Weekly Insight Card */}
        <View style={s.insightCard}>
          <Text style={s.insightTitle}>සතිපතා අවබෝධය (Weekly Insight) 💡</Text>
          {hasEnoughComparisonData ? (
            <View style={{ gap: 6 }}>
              <Text style={s.insightText}>{diaryInsight}</Text>
              <Text style={s.insightText}>{actInsight}</Text>
              {riskInsight ? <Text style={s.insightText}>{riskInsight}</Text> : null}
            </View>
          ) : (
            <Text style={s.insightText}>
              Keep journaling and completing activities to see your weekly progress comparison.
            </Text>
          )}
        </View>
      </View>
    );
  };

  // ── SCREEN RENDERING: TAB 2 (BADGES & DETAILED PROGRESS) ──────────

  const renderBadgesTab = () => {
    // Collect all games and activities lists
    const sortedGames = sortItems(ALL_GAMES);
    const sortedActivities = sortItems(ALL_ACTIVITIES);

    // Apply sub-filters
    const showGames = filterSubTab === 'all' || filterSubTab === 'games';
    const showActivities = filterSubTab === 'all' || filterSubTab === 'activities';

    return (
      <View>
        {/* Predefined Badge Milestones Overview */}
        <View style={s.summaryCard}>
          <Text style={s.sectionHeader}>🏆 මගේ පදක්කම් (My Badges)</Text>
          <View style={s.badgeMetricsBox}>
            <View style={s.badgeMetricCell}>
              <Text style={s.badgeMetricNum}>{totalCompleted}</Text>
              <Text style={s.badgeMetricLabel}>සම්පූර්ණ කළ ප්‍රමාණය (Total)</Text>
            </View>
            <View style={s.badgeMetricCell}>
              <Text style={s.badgeMetricNum}>{totalGamesCompletedCount}</Text>
              <Text style={s.badgeMetricLabel}>ක්‍රීඩා (Games Played)</Text>
            </View>
            <View style={s.badgeMetricCell}>
              <Text style={s.badgeMetricNum}>{totalActivitiesCompletedCount}</Text>
              <Text style={s.badgeMetricLabel}>ව්‍යායාම (Activities)</Text>
            </View>
          </View>

          {/* Earned Badges Section */}
          <Text style={s.badgeSubHeader}>ලබාගත් පදක්කම් (Earned Badges)</Text>
          {earnedBadges.length === 0 ? (
            <Text style={s.badgeEmptyLabel}>තවමත් ලබාගත් පදක්කම් නොමැත.</Text>
          ) : (
            <View style={{ gap: 8, marginTop: 8 }}>
              {earnedBadges.map(b => (
                <View key={b.id} style={s.badgeUnlockCard}>
                  <Text style={s.badgeUnlockIcon}>{b.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.badgeUnlockTitle}>{b.title}</Text>
                    <Text style={s.badgeUnlockDesc}>{b.desc}</Text>
                  </View>
                  <View style={s.badgeEarnedBadge}>
                    <Text style={s.badgeEarnedText}>✓ Earned</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Upcoming Locked Badges Section */}
          <Text style={[s.badgeSubHeader, { marginTop: spacing.lg }]}>ඉදිරි පදක්කම් (Upcoming Badges)</Text>
          {upcomingBadges.length === 0 ? (
            <Text style={s.badgeEmptyLabel}>ඔබ සියලු පදක්කම් ලබාගෙන ඇත! 🎉</Text>
          ) : (
            <View style={{ gap: 10, marginTop: 8 }}>
              {upcomingBadges.map(b => {
                const ratio = Math.min(b.current / b.threshold, 1);
                return (
                  <View key={b.id} style={[s.badgeUnlockCard, { opacity: 0.75 }]}>
                    <Text style={[s.badgeUnlockIcon, { filter: 'grayscale(100%)' }]}>🔒</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.badgeUnlockTitleLocked}>{b.title}</Text>
                      <Text style={s.badgeUnlockDesc}>{b.desc}</Text>
                      <View style={s.badgeProgressBarContainer}>
                        <View style={s.badgeProgressBarBg}>
                          <View style={[s.badgeProgressBarFill, { width: `${ratio * 100}%` }]} />
                        </View>
                        <Text style={s.badgeProgressText}>{b.progress}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Dynamic Filters Area */}
        <View style={s.filterRow}>
          {[
            { id: 'all', label: 'සියල්ල (All)' },
            { id: 'games', label: 'ක්‍රීඩා (Games)' },
            { id: 'activities', label: 'ක්‍රියාකාරකම්' }
          ].map(btn => (
            <TouchableOpacity key={btn.id} onPress={() => setFilterSubTab(btn.id)} style={[s.filterBtn, filterSubTab === btn.id && s.filterBtnActive]}>
              <Text style={[s.filterBtnText, filterSubTab === btn.id && s.filterBtnTextActive]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty state if user has completed nothing at all and we have no records */}
        {totalCompleted === 0 && (
          <View style={s.emptyStateBox}>
            <Text style={{ fontSize: 50, marginBottom: spacing.md }}>🌱</Text>
            <Text style={s.emptyStateTextHeader}>Start Your Journey</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg }}>
              You haven't completed any games or activities yet. Try one of the recommended self-care activities and your progress will appear here.
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Recommendations')} style={s.emptyStateBtn}>
              <Text style={s.emptyStateBtnText}>Explore Activities</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Detailed Game completion progress list */}
        {showGames && sortedGames.length > 0 && totalCompleted > 0 && (
          <View style={s.summaryCard}>
            <Text style={s.sectionHeader}>🎮 ක්‍රීඩා ප්‍රගතිය (Game Progress)</Text>
            <View style={{ gap: 12, marginTop: 8 }}>
              {sortedGames.map(game => {
                const prog = getItemProgress(game.id);
                // Level progress bar capped to 10 plays
                const ratio = Math.min(prog.total / 10, 1);
                return (
                  <View key={game.id} style={s.detailProgCard}>
                    <View style={s.detailProgLeft}>
                      <View style={s.detailProgIconBg}>
                        <Text style={{ fontSize: 20 }}>{game.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.detailProgTitle}>{game.labelEn} ({game.label})</Text>
                        <Text style={s.detailProgSubText}>Played: {prog.total} times • Today: {prog.todayCount}</Text>
                        <View style={s.detailProgBarBg}>
                          <View style={[s.detailProgBarFill, { width: `${ratio * 100}%`, backgroundColor: game.accent || colors.lavenderDark }]} />
                        </View>
                      </View>
                    </View>
                    <Text style={s.detailProgDateLabel}>{prog.lastPlayedLabel}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Detailed Activity completion progress list */}
        {showActivities && sortedActivities.length > 0 && totalCompleted > 0 && (
          <View style={s.summaryCard}>
            <Text style={s.sectionHeader}>🧘 ක්‍රියාකාරකම් ප්‍රගතිය (Activity Progress)</Text>
            <View style={{ gap: 12, marginTop: 8 }}>
              {sortedActivities.map(act => {
                const prog = getItemProgress(act.id);
                const ratio = Math.min(prog.total / 10, 1);
                return (
                  <View key={act.id} style={s.detailProgCard}>
                    <View style={s.detailProgLeft}>
                      <View style={s.detailProgIconBg}>
                        <Text style={{ fontSize: 20 }}>{act.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.detailProgTitle}>{act.labelEn} ({act.label})</Text>
                        <Text style={s.detailProgSubText}>Completed: {prog.total} times • Today: {prog.todayCount}</Text>
                        <View style={s.detailProgBarBg}>
                          <View style={[s.detailProgBarFill, { width: `${ratio * 100}%`, backgroundColor: act.accent || colors.mintDark }]} />
                        </View>
                      </View>
                    </View>
                    <Text style={s.detailProgDateLabel}>{prog.lastPlayedLabel}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer
      gradient={['#F8F4FF', '#FFF0F8']}
      edges={['top']}
      tabBar
      contentContainerStyle={{ paddingTop: 8 }}
    >
          <Text style={s.title}>{SI.yourJourney}</Text>

          {/* Tab Selection */}
          <View style={s.tabRow}>
            <TouchableOpacity onPress={() => setActiveTab('journey')} style={[s.tabBtn, activeTab === 'journey' && s.tabBtnActive]}>
              <Text style={[s.tabBtnText, activeTab === 'journey' && s.tabBtnTextActive]}>මගේ ප්‍රගතිය (Journey)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('badges')} style={[s.tabBtn, activeTab === 'badges' && s.tabBtnActive]}>
              <Text style={[s.tabBtnText, activeTab === 'badges' && s.tabBtnTextActive]}>පදක්කම් & ප්‍රගතිය (Badges)</Text>
            </TouchableOpacity>
          </View>

          {/* Active Tab Screen rendering */}
          {activeTab === 'journey' ? renderJourneyTab() : renderBadgesTab()}
    </ScreenContainer>
  );
};

const s = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, marginBottom: spacing.md },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  tabBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.full, backgroundColor: colors.white, alignItems: 'center', ...shadows.soft },
  tabBtnActive: { backgroundColor: colors.lavenderDark },
  tabBtnText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  tabBtnTextActive: { color: colors.white },
  summaryCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.soft },
  sectionHeader: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md },
  widgetRow: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 4 },
  widgetCell: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  widgetEmoji: { fontSize: 24, marginBottom: 4 },
  widgetVal: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  widgetLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  chartCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.card },
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, marginBottom: spacing.md, paddingTop: 10 },
  barCol: { flex: 1, alignItems: 'center' },
  barEmoji: { fontSize: 14, marginBottom: 2 },
  barRisk: { fontSize: 9, marginBottom: 3 },
  barBg: { flex: 0.75, width: '60%', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { borderRadius: 6, minHeight: 6 },
  barDay: { fontSize: 9, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  barDayToday: { color: colors.lavenderDark, fontWeight: '900' },
  legend: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.softGray },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendEmoji: { fontSize: 13 },
  legendLabel: { fontSize: 9, color: colors.textMuted },
  emotionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emotionEmoji: { width: 120, fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  emotionTrackBg: { flex: 1, height: 8, borderRadius: radius.full, backgroundColor: colors.softGray, overflow: 'hidden' },
  emotionTrackFill: { height: 8, borderRadius: radius.full },
  emotionCountVal: { width: 30, fontSize: 12, color: colors.textSecondary, textAlign: 'right', fontWeight: '700' },
  riskRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  riskChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.full },
  riskChipText: { fontSize: 11, fontWeight: '700' },
  riskDisclaimer: { fontSize: 9, color: colors.textMuted, fontStyle: 'italic', marginTop: 10 },
  progressSummaryLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabelEn: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  progressValEn: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  insightCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.soft, borderLeftWidth: 4, borderLeftColor: colors.lavenderDark },
  insightTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs },
  insightText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginTop: 4 },
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.offWhite },
  centerText: { marginTop: 12, fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  retryBtn: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, borderRadius: radius.full, backgroundColor: colors.lavenderDark },
  retryText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  emptyStateBox: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg, ...shadows.soft },
  emptyStateTextHeader: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  emptyStateBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: radius.full, backgroundColor: colors.lavenderDark, ...shadows.soft },
  emptyStateBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  emptyStateLabel: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', paddingVertical: 6 },
  badgeMetricsBox: { flexDirection: 'row', gap: 6, marginBottom: spacing.lg },
  badgeMetricCell: { flex: 1, backgroundColor: colors.softGray, borderRadius: radius.md, padding: 10, alignItems: 'center' },
  badgeMetricNum: { fontSize: 22, fontWeight: '900', color: colors.textPrimary },
  badgeMetricLabel: { fontSize: 8, color: colors.textSecondary, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  badgeSubHeader: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, borderTopWidth: 1, borderTopColor: colors.softGray, paddingTop: spacing.md },
  badgeEmptyLabel: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginTop: 8 },
  badgeUnlockCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 10, borderWidth: 1, borderColor: colors.softGray },
  badgeUnlockIcon: { fontSize: 26, marginRight: 10 },
  badgeUnlockTitle: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  badgeUnlockTitleLocked: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  badgeUnlockDesc: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  badgeEarnedBadge: { backgroundColor: colors.mintLight, paddingVertical: 4, paddingHorizontal: 8, borderRadius: radius.full },
  badgeEarnedText: { fontSize: 10, color: colors.mintDark, fontWeight: '700' },
  badgeProgressBarContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  badgeProgressBarBg: { flex: 1, height: 6, backgroundColor: colors.softGray, borderRadius: radius.full, overflow: 'hidden' },
  badgeProgressBarFill: { height: 6, backgroundColor: colors.lavenderDark, borderRadius: radius.full },
  badgeProgressText: { fontSize: 9, fontWeight: '700', color: colors.textSecondary, width: 26, textAlign: 'right' },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: spacing.md },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.white, alignItems: 'center', borderWidth: 1, borderColor: colors.softGray },
  filterBtnActive: { backgroundColor: colors.lavenderDark, borderColor: colors.lavenderDark },
  filterBtnText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },
  filterBtnTextActive: { color: colors.white },
  detailProgCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.softGray },
  detailProgLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailProgIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.softGray, justifyContent: 'center', alignItems: 'center' },
  detailProgTitle: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  detailProgSubText: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  detailProgBarBg: { height: 4, backgroundColor: colors.softGray, borderRadius: radius.full, overflow: 'hidden', marginTop: 4, width: '90%' },
  detailProgBarFill: { height: 4, borderRadius: radius.full },
  detailProgDateLabel: { fontSize: 9, color: colors.textMuted, width: 70, textAlign: 'right' }
});

export default ProgressScreen;
