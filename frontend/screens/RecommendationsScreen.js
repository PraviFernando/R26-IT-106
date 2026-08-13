// ================================================================
// RECOMMENDATIONS SCREEN — RecommendationsScreen.js
// Quick Emotional Assessment, Knowledge Hub, Search & Limits
// ================================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking, Alert, Modal, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { useApp } from '../services/AppContext';
import { ALL_ACTIVITIES, NEW_ACTIVITIES, ALL_GAMES, getEnhancedRecommendationRule, isBabyRelatedContent, isBabyRelatedReason, getRecommendedGames } from '../services/activitiesLibrary';
import { getPersonalizedRecommendations } from '../services/emotionEngine';
import { MUSIC_LIBRARY, VIDEO_LIBRARY } from '../services/mediaLibrary';
import { BABY_VIDEO_LIBRARY, getAllBabyVideos } from '../services/babyMediaLibrary';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_RESOURCES } from '../services/knowledgeLibrary';

const { width } = Dimensions.get('window');

const TABS = [
  { id: 'activities', icon: '🧘', label: 'ක්‍රියාකාරකම්' },
  { id: 'games', icon: '🎮', label: 'ක්‍රීඩා' },
  { id: 'music', icon: '🎵', label: 'සංගීතය' },
  { id: 'videos', icon: '🎬', label: 'වීඩියෝ' },
  { id: 'knowledge', icon: '📚', label: 'දැනුම එකතුව' },
];

const EMOTION_CFG = {
  happy: { emoji: '😊', label: 'සතුටුයි', badge: ['#FFF9C4', '#FFF3A0'], col: '#E65100' },
  sad: { emoji: '😔', label: 'දුකයි', badge: ['#EDE7F6', '#D1C4E9'], col: '#6A1B9A' },
  crying: { emoji: '😢', label: 'අඬන්න හිතෙනවා', badge: ['#EDE7F6', '#D1C4E9'], col: '#4A148C' },
  stressed: { emoji: '😟', label: 'ආතතියයි', badge: ['#FCE4EC', '#F8BBD9'], col: '#C2185B' },
  anxious: { emoji: '😰', label: 'කනස්සල්ල', badge: ['#FCE4EC', '#F8BBD9'], col: '#C2185B' },
  tired: { emoji: '😪', label: 'මහන්සියි', badge: ['#E0F7FA', '#B2EBF2'], col: '#00838F' },
  angry: { emoji: '😡', label: 'කේන්තියි', badge: ['#FFEBEE', '#FFCDD2'], col: '#C62828' },
  frustrated: { emoji: '😞', label: 'කලකිරීමෙන්', badge: ['#F3E5F5', '#E1BEE7'], col: '#4A148C' },
  lonely: { emoji: '😞', label: 'තනිකම', badge: ['#F3E5F5', '#E1BEE7'], col: '#4A148C' },
  sleepy: { emoji: '😴', label: 'නිදිමතයි', badge: ['#ECEFF1', '#CFD8DC'], col: '#37474F' },
  calm: { emoji: '😌', label: 'සන්සුන්', badge: ['#E8F5E9', '#C8E6C9'], col: '#2E7D32' },
};

const EMOTION_OPTIONS = [
  { key: 'happy', emoji: '😊', label: 'සතුටින් — Happy' },
  { key: 'sad', emoji: '😔', label: 'දුකින් — Sad' },
  { key: 'crying', emoji: '😢', label: 'අඬන්න හිතෙනවා — Feeling like crying' },
  { key: 'anxious', emoji: '😰', label: 'කනස්සල්ලෙන් — Anxious' },
  { key: 'tired', emoji: '😪', label: 'මහන්සියි — Tired' },
  { key: 'angry', emoji: '😡', label: 'කෝපයෙන් — Angry' },
  { key: 'frustrated', emoji: '😞', label: 'කලකිරීමෙන් — Frustrated' },
  { key: 'sleepy', emoji: '😴', label: 'නිදිමතයි — Sleepy' },
  { key: 'calm', emoji: '😌', label: 'සන්සුන් — Calm' },
];

const REASON_OPTIONS = [
  { key: 'baby_crying', label: 'Baby crying (ළදරුවා හැඬීම)' },
  { key: 'baby_feeding', label: 'Baby feeding (ළදරුවාට කිරි දීම)' },
  { key: 'baby_sleep', label: 'Baby sleep (ළදරුවාගේ නින්ද)' },
  { key: 'understanding_baby', label: 'Difficulty understanding baby\'s needs (අවශ්‍යතා වටහා ගැනීමේ අපහසුව)' },
  { key: 'mother_sleep', label: 'Mother sleep problems (මවගේ නින්ද නොයාම)' },
  { key: 'feeling_lonely', label: 'Feeling lonely (තනිකමක් දැනීම)' },
  { key: 'feeling_overwhelmed', label: 'Feeling overwhelmed (මානසිකව වෙහෙස වීම)' },
  { key: 'family_problems', label: 'Family/relationship problems (පවුලේ / සබඳතා ගැටලු)' },
  { key: 'financial_worries', label: 'Financial worries (මූල්‍යමය කනස්සල්ල)' },
  { key: 'physical_recovery', label: 'Physical recovery (ශාරීරික සුවවීමේ අපහසුතා)' },
  { key: 'breastfeeding_concerns', label: 'Breastfeeding concerns (මව්කිරි දීමේ ගැටලු)' },
  { key: 'caring_for_baby', label: 'Difficulty caring for baby (ළදරුවා සාත්තු කිරීමේ අපහසුව)' },
  { key: 'lack_of_support', label: 'Lack of support (සහයෝගය මදි වීම)' },
  { key: 'daily_responsibilities', label: 'Daily responsibilities (දෛනික වගකීම් අධික වීම)' },
  { key: 'other_concern', label: 'Other / General concern (වෙනත් / සාමාන්‍ය කනස්සල්ල)' },
];

const HELP_NEEDED_OPTIONS = [
  { key: 'activities', label: '🌿 Activities (ක්‍රියාකාරකම්)' },
  { key: 'games', label: '🎮 Games (ක්‍රීඩා)' },
  { key: 'music', label: '🎵 Music (සංගීතය)' },
  { key: 'videos', label: '🎥 Videos (වීඩියෝ)' },
  { key: 'baby_care', label: '👶 Baby Care (ළදරු සාත්තු)' },
  { key: 'mindfulness', label: '🧘 Relaxation / Meditation (සන්සුන්කම / භාවනා)' },
  { key: 'reading', label: '📚 Reading / Knowledge (කියවීම් / දැනුම)' },
  { key: 'podcasts', label: '🎧 Podcasts (පොඩ්කාස්ට්)' },
  { key: 'tips', label: '💡 Tips (උපදෙස්)' },
];

const RISK_CFG = {
  low: { label: '🟢 අඩු අවදානම', bg: '#E8F5E9', col: '#388E3C' },
  medium: { label: '🟡 මධ්‍යම අවදානම', bg: '#FFFDE7', col: '#F57F17' },
  high: { label: '🔴 ඉහළ අවදානම', bg: '#FFEBEE', col: '#D32F2F' },
};

const openYouTube = async (itemOrUrl, title, titleEn) => {
  let url = typeof itemOrUrl === 'string' ? itemOrUrl : itemOrUrl?.url;
  let searchTitle = typeof itemOrUrl === 'object'
    ? (itemOrUrl?.titleEn || itemOrUrl?.title || itemOrUrl?.label)
    : (titleEn || title);

  if (!url && searchTitle) {
    url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTitle + ' music video relaxation')}`;
  }

  if (!url) {
    url = 'https://www.youtube.com/results?search_query=postpartum+relaxation+music';
  }

  try {
    await Linking.openURL(url);
  } catch (e) {
    console.error('Error opening URL:', e);
    Alert.alert('දෝෂයක්', 'සබැඳිය විවෘත කළ නොහැකි විය.');
  }
};

const RecommendationsScreen = ({ navigation, route }) => {
  const { latestRecommendations, latestAnalysis, userPreferredActivities, userPreferredGames, detectedBabyTopic, detectedBabyTopics, detectedBabyAge } = useApp();

  // Quick Assessment State
  const hasAnalysis = Boolean(latestAnalysis);
  const [showAssessment, setShowAssessment] = useState(!hasAnalysis);
  const [step, setStep] = useState(1);
  const [selEmotion, setSelEmotion] = useState('anxious');
  const [selReason, setSelReason] = useState('baby_crying');
  const [selHelp, setSelHelp] = useState(['activities', 'baby_care']);
  const [isSkipped, setIsSkipped] = useState(false);
  const [localRuleRecs, setLocalRuleRecs] = useState(null);

  // Screen UI State
  const hasBabyCareTopic = Boolean(detectedBabyTopic || (detectedBabyTopics && detectedBabyTopics.length > 0));
  const initialTab = route?.params?.tab || (hasBabyCareTopic ? 'videos' : 'activities');
  const [tab, setTab] = useState(initialTab);
  const [videoTab, setVideoTab] = useState(hasBabyCareTopic ? 'නිර්දේශිත වීඩියෝ' : 'Motivation');
  const [kbCategory, setKbCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  useEffect(() => {
    if (route?.params?.tab) {
      setTab(route.params.tab);
    }
  }, [route?.params?.tab]);

  const activeAnalysis = isSkipped
    ? null
    : (hasAnalysis ? latestAnalysis : { detectedEmotion: selEmotion, primaryReason: selReason, riskLevel: latestAnalysis?.riskLevel || null });

  const emotion = activeAnalysis?.detectedEmotion || selEmotion || 'stressed';
  const risk = activeAnalysis?.riskLevel || null;
  const ec = EMOTION_CFG[emotion] || EMOTION_CFG.stressed;
  const rc = risk ? (RISK_CFG[risk] || RISK_CFG.low) : null;

  // Handle Assessment Completion
  const handleAssessmentContinue = () => {
    const recs = getPersonalizedRecommendations({
      emotion: selEmotion,
      reason: selReason,
      helpCategories: selHelp,
      riskLevel: latestAnalysis?.riskLevel || null, // Receives existing risk level if available (does not calculate risk inside)
      preferredActivities: userPreferredActivities,
      preferredGames: userPreferredGames,
    });
    setLocalRuleRecs(recs);
    setShowAssessment(false);
    setIsSkipped(false);
  };

  const handleAssessmentSkip = () => {
    setShowAssessment(false);
    setIsSkipped(true);
  };

  // Feedback handler
  const handleFeedback = async (type) => {
    try {
      const payload = {
        resource_id: 'rec_session_' + Date.now(),
        emotion: emotion,
        reason: activeAnalysis?.primaryReason || selReason,
        timestamp: new Date().toISOString(),
        feedback: type,
      };
      const existing = await AsyncStorage.getItem('recommendation_feedback');
      const list = existing ? JSON.parse(existing) : [];
      list.push(payload);
      await AsyncStorage.setItem('recommendation_feedback', JSON.stringify(list));
      setFeedbackSaved(true);
      Alert.alert('ස්තූතියි! 🌸', 'ඔබේ අදහස සාර්ථකව සටහන් කරගන්නා ලදී.');
    } catch (e) {
      console.error('Error saving feedback:', e);
    }
  };

  // Content Source & Limits
  const rawActivities = (hasAnalysis ? (latestRecommendations?.newActivities || latestRecommendations?.activities) : localRuleRecs?.activities) || [];
  const rawGames = (hasAnalysis ? latestRecommendations?.games : localRuleRecs?.games) || [];

  // Map and clean rawActivities
  const resolvedActivities = rawActivities.map(a => {
    const id = typeof a === 'string' ? a : a?.id;
    if (id === 'baby_bonding' || id === 'new_baby_interaction_ideas') {
      return NEW_ACTIVITIES.find(item => item.id === 'baby_mood') || 'baby_mood';
    }
    if (typeof a === 'object' && a !== null) return a;
    return NEW_ACTIVITIES.find(item => item.id === id) || ALL_ACTIVITIES.find(item => item.id === id) || a;
  }).filter(Boolean);

  const isBabyActive = (activeAnalysis?.primaryReason && isBabyRelatedReason(activeAnalysis.primaryReason)) || (activeAnalysis?.diaryText && isBabyRelatedContent(activeAnalysis.diaryText)) || (latestRecommendations?.isBabyRelated) || (localRuleRecs?.isBabyRelated) || (detectedBabyTopic || (detectedBabyTopics && detectedBabyTopics.length > 0));

  let finalActList = [...resolvedActivities];
  if (isBabyActive) {
    const babyMoodObj = NEW_ACTIVITIES.find(a => a.id === 'baby_mood') || ALL_ACTIVITIES.find(a => a.id === 'baby_mood') || { id: 'baby_mood', icon: '👶', label: 'ළදරු හැඟීම', labelEn: 'Baby Cues', purpose: 'ඔබේ බබා පෙන්වන විවිධ සංඥා හඳුනාගැනීමට මෙම ක්‍රියාකාරකම ඔබට උපකාරී වේ.' };
    
    // Remove any existing baby_mood from list
    finalActList = finalActList.filter(a => (typeof a === 'string' ? a : a?.id) !== 'baby_mood');
    // Insert baby_mood at position 0
    finalActList = [babyMoodObj, ...finalActList];
  }

  // Remove any remaining legacy bonding items
  finalActList = finalActList.filter(a => {
    const id = typeof a === 'string' ? a : a?.id;
    return id !== 'baby_bonding' && id !== 'new_baby_interaction_ideas';
  });

  // Enforce Max Limits: Activities (4), Games (3), Music (4), Videos (4), Knowledge (5)
  const finalActivities = isSkipped ? ALL_ACTIVITIES.slice(0, 4) : finalActList.slice(0, 4);
  
  const activeIntents = activeAnalysis?.babyIntents || {};
  const activeDiaryText = activeAnalysis?.diaryText || latestAnalysis?.diaryText || '';
  const activeReason = activeAnalysis?.primaryReason || selReason || '';

  const dynamicRecommendedGames = getRecommendedGames(activeIntents, activeDiaryText, activeReason, 4);

  const finalGames = isSkipped
    ? ALL_GAMES.filter(g => g.id !== 'baby_mood').slice(0, 4)
    : dynamicRecommendedGames;

  const primaryReason = activeAnalysis?.primaryReason || selReason || 'loneliness';
  const libraryMusic = MUSIC_LIBRARY[primaryReason] || (isBabyActive ? MUSIC_LIBRARY.bonding_issues : MUSIC_LIBRARY.loneliness);
  const finalMusic = (isSkipped ? Object.values(MUSIC_LIBRARY).flat() : libraryMusic).slice(0, 4);

  const activeBabyTopics = (detectedBabyTopics && detectedBabyTopics.length > 0)
    ? detectedBabyTopics
    : (detectedBabyTopic ? [detectedBabyTopic] : []);

  const libraryVideos = VIDEO_LIBRARY[primaryReason] || (isBabyActive ? VIDEO_LIBRARY.bonding_issues : VIDEO_LIBRARY.loneliness);
  const VIDEO_SUB_TABS = activeBabyTopics.length > 0
    ? ['නිර්දේශිත වීඩියෝ', 'Motivation', 'Baby Feeding', 'Baby Bathing', 'Baby Diapering', 'Baby Sleeping', 'Baby Crying', 'Baby Health', 'Baby Development', 'Vaccination', 'Baby Safety', 'Mother Care']
    : ['Motivation'];

  const getBabyCareVideos = () => {
    if (activeBabyTopics.length === 0) return [];
    const topicVideosMap = activeBabyTopics.map(t => BABY_VIDEO_LIBRARY[t] || []);
    let mixed = [];
    const maxLen = Math.max(...topicVideosMap.map(arr => arr.length), 0);
    for (let i = 0; i < maxLen; i++) {
      topicVideosMap.forEach(arr => {
        if (arr[i]) mixed.push(arr[i]);
      });
    }
    return mixed;
  };

  const getVideosForTab = () => {
    if (isSkipped) {
      let all = [];
      Object.values(BABY_VIDEO_LIBRARY).forEach(arr => { all = all.concat(arr); });
      return all;
    }
    if (videoTab === 'Motivation') return libraryVideos;
    if (videoTab === 'නිර්දේශිත වීඩියෝ' || videoTab === 'DetectedTopics') {
      const babyVids = getBabyCareVideos();
      return babyVids.length > 0 ? babyVids : libraryVideos;
    }
    if (videoTab === 'All') {
      let all = [...libraryVideos];
      Object.values(BABY_VIDEO_LIBRARY).forEach(arr => { all = all.concat(arr); });
      return all;
    }
    return BABY_VIDEO_LIBRARY[videoTab] || libraryVideos;
  };

  const displayedVideos = getVideosForTab();

  // Knowledge Hub Filtered Resources (Limit 5)
  const getKnowledgeResources = () => {
    let list = KNOWLEDGE_RESOURCES;
    if (kbCategory !== 'all') {
      list = list.filter(r => r.category === kbCategory);
    }
    return list.slice(0, 5);
  };

  // Search Logic with Prioritization (Topics -> Videos -> Articles -> Activities -> Music -> Podcasts)
  const getSearchResults = () => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    const matchesQuery = (str) => str && str.toLowerCase().includes(q);

    // 1. Knowledge & Baby Care Articles
    const kbMatches = KNOWLEDGE_RESOURCES.filter(r => matchesQuery(r.title) || matchesQuery(r.description) || matchesQuery(r.subCategory) || r.tags?.some(matchesQuery));
    
    // 2. Baby Videos
    const videoMatches = getAllBabyVideos().filter(v => matchesQuery(v.title) || matchesQuery(v.category) || v.tags?.some(matchesQuery));
    
    // 3. Activities & Games
    const gameMatches = ALL_GAMES.filter(g => matchesQuery(g.label) || matchesQuery(g.labelEn));

    // 4. Music
    const musicMatches = Object.values(MUSIC_LIBRARY).flat().filter(m => matchesQuery(m.title) || matchesQuery(m.titleEn));

    return [
      ...videoMatches.map(v => ({ ...v, itemType: 'වීඩියෝව (Video)' })),
      ...kbMatches.map(k => ({ ...k, itemType: 'ලිපිය / මූලාශ්‍රය (Knowledge)' })),
      ...gameMatches.map(g => ({ ...g, itemType: 'ක්‍රීඩාව (Game)' })),
      ...musicMatches.map(m => ({ ...m, itemType: 'සංගීතය (Music)' })),
    ];
  };

  const searchResults = getSearchResults();

  // Check Emergency Topic (fever, health, emergency)
  const isEmergencyTopic = detectedBabyTopic === 'Baby Health & Fever' || detectedBabyTopic === 'Baby Health' || searchQuery.toLowerCase().includes('fever') || searchQuery.toLowerCase().includes('උණ') || selReason === 'baby_health';

  return (
    <View style={s.container}>
      <LinearGradient colors={['#F8F4FF', '#FFF0F8']} style={s.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Top Bar */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>← ආපසු</Text>
          </TouchableOpacity>

          <Text style={s.title}>නිර්දේශිත සහන & දැනුම එකතුව 💜</Text>

          {/* Search Bar */}
          <View style={s.searchWrap}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="ඔබට අවශ්‍ය දේ සොයන්න... (Search videos, guides, sleep, feeding)"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={s.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Emergency Medical Callout Banner */}
          {(isEmergencyTopic || risk === 'high') && (
            <View style={s.emergencyBanner}>
              <Text style={s.emergencyIcon}>🆘</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.emergencyTitle}>ක්ෂණික වෛද්‍ය හා වෘත්තීය සහාය (Immediate Professional Support):</Text>
                <Text style={s.emergencyText}>
                  ඔබ අධික පීඩනයකින් හෝ බලාපොරොත්තු රහිත ස්වභාවයකින් පෙළෙන්නේ නම්, කරුණාකර වහාම නොමිලේ උපදේශන සේවාව හමුවන්න (හදිසි ඇමතුම් 1926) හෝ ආසන්නතම සෞඛ්‍ය නිලධාරී / පවුල් සෞඛ්‍ය සේවිකා මුණගැසෙන්න.
                </Text>
              </View>
            </View>
          )}

          {/* SEARCH RESULTS DISPLAY */}
          {searchResults ? (
            <View style={s.searchResultsCont}>
              <Text style={s.searchTitle}>සොයාගත් ප්‍රතිඵල ({searchResults.length}):</Text>
              {searchResults.length === 0 ? (
                <View style={s.emptyBox}>
                  <Text style={s.emptyEmoji}>🔎</Text>
                  <Text style={s.emptyText}>සොයන ලද වචනයට අදාළ අන්තර්ගතයන් හමු නොවීය.</Text>
                </View>
              ) : (
                searchResults.map((item, idx) => (
                  <TouchableOpacity
                    key={item.id || idx}
                    style={s.mediaCard}
                    onPress={() => {
                      if (item.itemType?.includes('Game') || item.itemType?.includes('ක්‍රීඩාව')) {
                        navigation.navigate('Activity', { gameId: item.id });
                      } else if (item.itemType?.includes('Activity') || item.itemType?.includes('ක්‍රියාකාරකම')) {
                        navigation.navigate('Activity', { activityId: item.id });
                      } else {
                        openYouTube(item);
                      }
                    }}
                  >
                    <View style={[s.mediaIcon, { backgroundColor: colors.lavenderLight }]}>
                      <Text style={s.mediaEmoji}>{item.emoji || item.thumbnail || '📌'}</Text>
                    </View>
                    <View style={s.mediaInfo}>
                      <View style={s.typeTag}>
                        <Text style={s.typeTagText}>{item.itemType}</Text>
                      </View>
                      <Text style={s.mediaTitle}>{item.title || item.label}</Text>
                      <Text style={s.mediaSub}>{item.description || item.category || 'තොරතුරු මූලාශ්‍රය'}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            <>
              {/* Badges Row */}
              <View style={s.badgesRow}>
                <LinearGradient colors={ec.badge} style={s.badge}>
                  <Text style={[s.badgeText, { color: ec.col }]}>{ec.emoji} {ec.label}</Text>
                </LinearGradient>
                {rc && (
                  <View style={[s.badge, { backgroundColor: rc.bg }]}>
                    <Text style={[s.badgeText, { color: rc.col }]}>{rc.label}</Text>
                  </View>
                )}
                {isSkipped && (
                  <View style={[s.badge, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={[s.badgeText, { color: '#0369A1' }]}>🌐 සියලු අන්තර්ගතයන්</Text>
                  </View>
                )}
              </View>

              {!isSkipped && (localRuleRecs || hasAnalysis) && (
                <Text style={s.supportiveNotice}>
                  ඔබ තෝරාගත් කරුණු මත පදනම්ව, අද ඔබට උපකාරී විය හැකි ඇතැම් සම්පත් මෙන්න. 🌸
                </Text>
              )}

              {/* Main Category Tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabsCont}>
                {TABS.map(t => (
                  <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={[s.tab, tab === t.id && s.tabActive]}>
                    <Text style={s.tabIcon}>{t.icon}</Text>
                    <Text style={[s.tabLabel, tab === t.id && s.tabLabelActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* TAB CONTENT */}
              <View style={s.tabContent}>
                {/* 1. ACTIVITIES TAB */}
                {tab === 'activities' && (
                  <View>
                    <Text style={s.tabIntro}>ඔබ වෙනුවෙන් තෝරාගත් ක්‍රියාකාරකම් 🧘 (උපරිම 4)</Text>
                    {finalActivities.map((act, idx) => {
                      const actId = typeof act === 'string' ? act : act?.id;
                      return (
                        <TouchableOpacity
                          key={actId || idx}
                          onPress={() => {
                            if (actId === 'baby_mood') {
                              navigation.navigate('Activity', { gameId: 'baby_mood', fromRecommendations: true, returnTo: 'Recommendations' });
                            } else {
                              navigation.navigate('Activity', { activityId: actId, fromRecommendations: true, returnTo: 'Recommendations' });
                            }
                          }}
                          style={s.actCard}
                        >
                          <LinearGradient colors={act.color || ['#EDE7F6', '#D1C4E9']} style={s.actGrad}>
                            <Text style={s.actIcon}>{act.icon || '🌸'}</Text>
                            <View style={s.actInfo}>
                              <Text style={[s.actTitle, { color: act.accent || '#7E57C2' }]}>{act.label || act}</Text>
                              <Text style={s.actDesc}>{act.purpose || act.desc || 'සන්සුන් ක්‍රියාකාරකමක්'}</Text>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 2. GAMES TAB */}
                {tab === 'games' && (
                  <View>
                    <Text style={s.tabIntro}>සන්සුන් ක්‍රීඩා 🎮 (උපරිම 3)</Text>
                    {finalGames.map((game, idx) => {
                      const gId = typeof game === 'string' ? game : game?.id;
                      return (
                        <TouchableOpacity
                          key={gId || idx}
                          onPress={() => navigation.navigate(gId === 'mandala' || gId === 'colouring' ? 'Art' : 'Activity', { gameId: gId, fromRecommendations: true, returnTo: 'Recommendations' })}
                        >
                          <LinearGradient colors={game.color || ['#EDE7F6', '#D1C4E9']} style={s.primaryGameCard}>
                            <Text style={s.primaryGameIcon}>{game.icon || '🎮'}</Text>
                            <View style={s.primaryGameInfo}>
                              <Text style={[s.primaryGameName, { color: game.accent || '#7E57C2' }]}>{game.label || game}</Text>
                              <Text style={s.primaryGameSub}>{game.labelEn || 'සුවය ලබාදෙන ක්‍රීඩාව'}</Text>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 3. MUSIC TAB */}
                {tab === 'music' && (
                  <View>
                    <Text style={s.tabIntro}>සන්සුන් සංගීතය 🎵 (උපරිම 4)</Text>
                    {finalMusic.map((track, idx) => (
                      <TouchableOpacity key={track.id || idx} style={s.mediaCard} onPress={() => openYouTube(track)}>
                        <View style={[s.mediaIcon, { backgroundColor: colors.lavenderLight }]}>
                          <Text style={s.mediaEmoji}>{track.emoji || '🎵'}</Text>
                        </View>
                        <View style={s.mediaInfo}>
                          <Text style={s.mediaTitle}>{track.title}</Text>
                          <Text style={s.mediaSub}>{track.titleEn || 'සන්සුන් සංගීතය'}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* 4. VIDEOS TAB */}
                {tab === 'videos' && (
                  <View>
                    {activeBabyTopics.length > 0 && (
                      <View style={s.detectedTopicsBanner}>
                        <Text style={s.detectedTopicsTitle}>🍼 හඳුනාගත් ළදරු සාත්තු මාතෘකා ({activeBabyTopics.length}):</Text>
                        <View style={s.topicBadgesRow}>
                          {activeBabyTopics.map((top, idx) => (
                            <View key={idx} style={s.topicBadgeItem}>
                              <Text style={s.topicBadgeText}>{top}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {VIDEO_SUB_TABS.length > 1 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.videoTabsScroll}>
                        {VIDEO_SUB_TABS.map(vTab => (
                          <TouchableOpacity
                            key={vTab}
                            onPress={() => setVideoTab(vTab)}
                            style={[s.videoSubTab, videoTab === vTab && s.videoSubTabActive]}
                          >
                            <Text style={[s.videoSubTabLabel, videoTab === vTab && s.videoSubTabLabelActive]}>
                              {vTab}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}

                    <Text style={s.tabIntro}>උපදේශාත්මක වීඩියෝ 🎬</Text>
                    {displayedVideos.map((video, idx) => (
                      <TouchableOpacity key={video.id || idx} style={s.mediaCard} onPress={() => openYouTube(video)}>
                        <View style={[s.mediaIcon, { backgroundColor: colors.roseLight }]}>
                          <Text style={s.mediaEmoji}>{video.emoji || '🎬'}</Text>
                        </View>
                        <View style={s.mediaInfo}>
                          <Text style={s.mediaTitle}>{video.title}</Text>
                          <Text style={s.mediaSub}>{video.category || 'නිර්දේශිත වීඩියෝව'}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* 5. KNOWLEDGE HUB TAB */}
                {tab === 'knowledge' && (
                  <View>
                    <Text style={s.tabIntro}>කේන්ද්‍රීය දැනුම පියස 📚 (උපරිම 5)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.videoTabsScroll}>
                      {KNOWLEDGE_CATEGORIES.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => setKbCategory(cat.id)}
                          style={[s.videoSubTab, kbCategory === cat.id && s.videoSubTabActive]}
                        >
                          <Text style={[s.videoSubTabLabel, kbCategory === cat.id && s.videoSubTabLabelActive]}>
                            {cat.icon} {cat.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {getKnowledgeResources().map((res) => (
                      <TouchableOpacity key={res.id} style={s.mediaCard} onPress={() => openYouTube(res)}>
                        <View style={[s.mediaIcon, { backgroundColor: colors.mintLight }]}>
                          <Text style={s.mediaEmoji}>{res.thumbnail}</Text>
                        </View>
                        <View style={s.mediaInfo}>
                          <Text style={s.mediaTitle}>{res.title}</Text>
                          <Text style={s.mediaSub}>{res.description}</Text>
                          <Text style={s.sourceTag}>මූලාශ්‍රය: {res.source}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* USER FEEDBACK SECTION */}
              <View style={s.feedbackCard}>
                <Text style={s.feedbackTitle}>මෙම නිර්දේශ ඔබට උපකාරී වූවාද?</Text>
                {feedbackSaved ? (
                  <Text style={s.feedbackSavedText}>✓ අදහස සටහන් කරගන්නා ලදී. ස්තූතියි!</Text>
                ) : (
                  <View style={s.feedbackBtnRow}>
                    <TouchableOpacity style={s.feedbackBtn} onPress={() => handleFeedback('positive')}>
                      <Text style={s.feedbackBtnText}>👍 ඔව්, උපකාරී විය</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.feedbackBtn, s.feedbackBtnNo]} onPress={() => handleFeedback('negative')}>
                      <Text style={s.feedbackBtnTextNo}>👎 නැත</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>
      </LinearGradient>

      {/* QUICK EMOTIONAL ASSESSMENT MODAL */}
      <Modal visible={showAssessment} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            {/* Step Indicator */}
            <View style={s.stepIndicatorRow}>
              <Text style={s.stepIndicatorText}>පියවර {step} / 3</Text>
              <TouchableOpacity onPress={handleAssessmentSkip}>
                <Text style={s.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            {step === 1 && (
              <View>
                <Text style={s.modalTitle}>ඔබට දැන් කොහොමද දැනෙන්නේ?</Text>
                <Text style={s.modalSub}>ඔබට වඩාත්ම ගැළපෙන පුද්ගලික නිර්දේශ ලබාදීමට ඔබේ වත්මන් හැඟීම තෝරන්න.</Text>
                <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={s.emojiGrid}>
                  {EMOTION_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[s.emojiCard, selEmotion === opt.key && s.emojiCardSel]}
                      onPress={() => setSelEmotion(opt.key)}
                    >
                      <Text style={s.emojiCardText}>{opt.emoji}</Text>
                      <Text style={s.emojiCardLabel}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={s.modalActionRow}>
                  <TouchableOpacity style={s.skipBtn} onPress={handleAssessmentSkip}>
                    <Text style={s.skipBtnText}>දැන් අවශ්‍ය නැහැ (Skip)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.modalNextBtn} onPress={() => setStep(2)}>
                    <Text style={s.modalNextBtnText}>ඊළඟ පියවර →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={s.modalTitle}>ඔබට මෙහෙම දැනෙන්න ප්‍රධාන හේතුව මොකක්ද?</Text>
                <Text style={s.modalSub}>කරුණාකර ඔබට බලපාන ප්‍රධාන හේතුව තෝරන්න.</Text>
                <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={true}>
                  {REASON_OPTIONS.map(r => (
                    <TouchableOpacity
                      key={r.key}
                      style={[s.reasonOption, selReason === r.key && s.reasonOptionSel]}
                      onPress={() => setSelReason(r.key)}
                    >
                      <Text style={[s.reasonText, selReason === r.key && s.reasonTextSel]}>{r.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={s.modalActionRow}>
                  <TouchableOpacity style={s.modalBackBtn} onPress={() => setStep(1)}>
                    <Text style={s.modalBackBtnText}>← ආපසු</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.skipBtn} onPress={handleAssessmentSkip}>
                    <Text style={s.skipBtnText}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.modalNextBtn} onPress={() => setStep(3)}>
                    <Text style={s.modalNextBtnText}>ඊළඟ පියවර →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={s.modalTitle}>අද ඔබට අවශ්‍ය උදව් මොනවාද?</Text>
                <Text style={s.modalSub}>ඔබ වඩාත්ම කැමති අංශ තෝරන්න (එකක් හෝ කිහිපයක්).</Text>
                <ScrollView style={{ maxHeight: 220 }}>
                  {HELP_NEEDED_OPTIONS.map(h => {
                    const isSel = selHelp.includes(h.key);
                    return (
                      <TouchableOpacity
                        key={h.key}
                        style={[s.helpOption, isSel && s.helpOptionSel]}
                        onPress={() => {
                          if (isSel) setSelHelp(selHelp.filter(k => k !== h.key));
                          else setSelHelp([...selHelp, h.key]);
                        }}
                      >
                        <Text style={s.checkboxText}>{isSel ? '☑' : '☐'}</Text>
                        <Text style={s.helpOptionLabel}>{h.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <View style={s.modalActionRow}>
                  <TouchableOpacity style={s.modalBackBtn} onPress={() => setStep(2)}>
                    <Text style={s.modalBackBtnText}>← ආපසු</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.skipBtn} onPress={handleAssessmentSkip}>
                    <Text style={s.skipBtnText}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.modalNextBtn} onPress={handleAssessmentContinue}>
                    <Text style={s.modalNextBtnText}>පුද්ගලික නිර්දේශ බලන්න ✨</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingTop: 50 },
  backBtn: { marginBottom: 12, alignSelf: 'flex-start' },
  backText: { color: colors.lavenderDark, fontWeight: '700', fontSize: 16 },
  title: { fontSize: 22, fontWeight: '900', color: colors.textPrimary, marginBottom: 12 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 14, ...shadows.soft },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: colors.textPrimary },
  clearSearch: { fontSize: 14, color: colors.textMuted, paddingHorizontal: 6 },
  searchResultsCont: { marginBottom: 20 },
  searchTitle: { fontSize: 14, fontWeight: '800', color: colors.lavenderDark, marginBottom: 10 },
  typeTag: { alignSelf: 'flex-start', backgroundColor: colors.lavenderLight, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, marginBottom: 4 },
  typeTagText: { fontSize: 9, fontWeight: '800', color: colors.lavenderDark },
  emergencyBanner: { flexDirection: 'row', backgroundColor: '#FFEBEE', borderWidth: 1.5, borderColor: '#D32F2F', borderRadius: radius.lg, padding: 12, marginBottom: 14, gap: 10 },
  emergencyIcon: { fontSize: 24 },
  emergencyTitle: { fontSize: 13, fontWeight: '900', color: '#D32F2F', marginBottom: 2 },
  emergencyText: { fontSize: 11, color: '#B71C1C', lineHeight: 17 },
  detectedTopicsBanner: { backgroundColor: '#F3E8FF', borderWidth: 1.5, borderColor: '#9333EA', borderRadius: radius.lg, padding: 12, marginBottom: 14 },
  detectedTopicsTitle: { fontSize: 13, fontWeight: '900', color: '#7E22CE', marginBottom: 6 },
  topicBadgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  topicBadgeItem: { backgroundColor: '#9333EA', borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 10 },
  topicBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  badge: { borderRadius: radius.full, paddingVertical: 6, paddingHorizontal: 14 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  tabsScroll: { marginBottom: spacing.md },
  tabsCont: { gap: 8, paddingRight: spacing.md },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.full, backgroundColor: colors.white, ...shadows.soft },
  tabActive: { backgroundColor: colors.lavenderDark },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  tabLabelActive: { color: colors.white },
  tabContent: { marginBottom: spacing.md },
  tabIntro: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md, fontStyle: 'italic' },
  mediaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: 10, ...shadows.soft },
  mediaIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mediaEmoji: { fontSize: 24 },
  mediaInfo: { flex: 1 },
  mediaTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  mediaSub: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  sourceTag: { fontSize: 10, color: colors.lavenderDark, fontWeight: '700', marginTop: 4 },
  actCard: { borderRadius: radius.lg, marginBottom: 10, overflow: 'hidden', ...shadows.soft },
  actGrad: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  actIcon: { fontSize: 28, marginRight: 12 },
  actInfo: { flex: 1 },
  actTitle: { fontSize: 14, fontWeight: '800' },
  actDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  primaryGameCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.xl, padding: spacing.md, marginBottom: 10, ...shadows.card },
  primaryGameIcon: { fontSize: 32, marginRight: 12 },
  primaryGameInfo: { flex: 1 },
  primaryGameName: { fontSize: 14, fontWeight: '900' },
  primaryGameSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  videoTabsScroll: { marginBottom: spacing.md },
  videoSubTab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.full, backgroundColor: colors.offWhite, borderWidth: 1, borderColor: colors.lavenderLight, marginRight: 6 },
  videoSubTabActive: { backgroundColor: colors.roseLight, borderColor: colors.roseLight },
  videoSubTabLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  videoSubTabLabelActive: { color: colors.roseDark, fontWeight: '800' },
  emptyBox: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', ...shadows.soft },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  feedbackCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginTop: 10, alignItems: 'center', ...shadows.soft },
  feedbackTitle: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 },
  feedbackBtnRow: { flexDirection: 'row', gap: 10 },
  feedbackBtn: { backgroundColor: '#E8F5E9', paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.full },
  feedbackBtnNo: { backgroundColor: '#FFEBEE' },
  feedbackBtnText: { color: '#2E7D32', fontWeight: '800', fontSize: 12 },
  feedbackBtnTextNo: { color: '#C62828', fontWeight: '800', fontSize: 12 },
  feedbackSavedText: { color: '#2E7D32', fontWeight: '800', fontSize: 12 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 20, width: '100%', maxWidth: 400, ...shadows.card },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.lavenderDark, marginBottom: 4 },
  modalSub: { fontSize: 12, color: colors.textSecondary, marginBottom: 16 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' },
  emojiCard: { width: '29%', backgroundColor: colors.offWhite, borderRadius: radius.lg, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.lavenderLight },
  emojiCardSel: { backgroundColor: colors.lavenderLight, borderColor: colors.lavenderDark, borderWidth: 2 },
  emojiCardText: { fontSize: 26 },
  emojiCardLabel: { fontSize: 10, fontWeight: '700', marginTop: 4, color: colors.textPrimary },
  reasonOption: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.lg, backgroundColor: colors.offWhite, marginBottom: 6 },
  reasonOptionSel: { backgroundColor: colors.lavenderDark },
  reasonText: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  reasonTextSel: { color: colors.white, fontWeight: '800' },
  helpOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: radius.md, marginBottom: 6, backgroundColor: colors.offWhite },
  helpOptionSel: { backgroundColor: colors.roseLight },
  checkboxText: { fontSize: 16, marginRight: 8, color: colors.roseDark },
  helpOptionLabel: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  modalActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  modalNextBtn: { backgroundColor: colors.lavenderDark, paddingVertical: 10, paddingHorizontal: 18, borderRadius: radius.full, alignSelf: 'flex-end' },
  modalNextBtnText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  modalBackBtn: { paddingVertical: 10, paddingHorizontal: 10 },
  modalBackBtnText: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  skipBtn: { paddingVertical: 10, paddingHorizontal: 10 },
  skipBtnText: { color: colors.lavenderDark, fontWeight: '800', fontSize: 12 },
  stepIndicatorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stepIndicatorText: { fontSize: 11, fontWeight: '800', color: colors.lavenderDark, backgroundColor: colors.lavenderLight, paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.full },
  closeModalText: { fontSize: 16, color: colors.textMuted, paddingHorizontal: 6, fontWeight: '800' },
  supportiveNotice: { fontSize: 12, color: colors.lavenderDark, fontWeight: '700', backgroundColor: '#F3E8FF', padding: 10, borderRadius: radius.md, marginBottom: 12, textAlign: 'center' },
});

export default RecommendationsScreen;