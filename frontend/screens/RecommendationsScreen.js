// ================================================================
// RECOMMENDATIONS SCREEN — RecommendationsScreen.js
// Quick Emotional Assessment, Knowledge Hub, Search & Limits
// ================================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking, Alert, Modal, TextInput,
  Image, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { useApp } from '../services/AppContext';
import { ALL_ACTIVITIES, NEW_ACTIVITIES, ALL_GAMES, getEnhancedRecommendationRule, isBabyRelatedContent, isBabyRelatedReason, getRecommendedGames, getRankedActivities } from '../services/activitiesLibrary';
import { getPersonalizedRecommendations } from '../services/emotionEngine';
import { MUSIC_LIBRARY } from '../services/mediaLibrary';
import { BABY_VIDEO_LIBRARY, getAllBabyVideos } from '../services/babyMediaLibrary';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_RESOURCES } from '../services/knowledgeLibrary';
import api from '../services/api';
import { openYouTubeLink } from '../utils/openYouTube';

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

const getBabyTopicsFromReason = (reason) => {
  if (!reason) return [];
  if (reason === 'baby_feeding' || reason === 'breastfeeding_concerns') return ['Baby Feeding'];
  if (reason === 'baby_crying') return ['Baby Crying'];
  if (reason === 'baby_sleep') return ['Baby Sleeping'];
  if (reason === 'baby_health') return ['Baby Health'];
  if (reason === 'caring_for_baby') return ['Mother Care'];
  if (reason === 'understanding_baby') return ['Baby Development'];
  return [];
};

const HARDCODED_VIDEO_MAP = {
  loneliness: {
    id: '2OEL4P1Rz04',
    title: 'තනිකම සහ හුදකලා බව මඟහරවා ගැනීම (Overcoming Loneliness in Motherhood)',
    description: 'මවක් වූ පසු දැනෙන තනිකම සහ ඒ සඳහා කළ හැකි දේ පිළිබඳ මඟ පෙන්වීම.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/2OEL4P1Rz04',
    thumbnail: 'https://img.youtube.com/vi/2OEL4P1Rz04/0.jpg',
  },
  fatigue: {
    id: 'ZToicYcHIOU',
    title: 'ප්‍රසව තෙහෙට්ටුවෙන් මිදෙමු (Postpartum Fatigue Recovery Tips)',
    description: 'අධික මහන්සියෙන් පෙළෙන මව්වරුන් සඳහා ශක්තිය ලබාගැනීමේ ක්‍රමවේද.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/ZToicYcHIOU',
    thumbnail: 'https://img.youtube.com/vi/ZToicYcHIOU/0.jpg',
  },
  anxiety: {
    id: 'hrozJ-EbdGI',
    title: 'ප්‍රසව කාංසාව සහ බිය පාලනය කිරීම (Relieving Postpartum Anxiety)',
    description: 'බිය සහ කාංසාව පාලනය කිරීමට උපකාරී වන මෘදු හුස්ම ගැනීමේ අභ්‍යාස.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/hrozJ-EbdGI',
    thumbnail: 'https://img.youtube.com/vi/hrozJ-EbdGI/0.jpg',
  },
  overwhelmed: {
    id: '1n46HPsYsHM',
    title: 'දරාගත නොහැකි පීඩනය කළමනාකරණය (Coping with Overwhelm)',
    description: 'වැඩ අධික වීම නිසා ඇතිවන පීඩනය පාලනය කිරීමට නව මව්වරුන් සඳහා උපදෙස්.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/1n46HPsYsHM',
    thumbnail: 'https://img.youtube.com/vi/1n46HPsYsHM/0.jpg',
  },
  lack_of_support: {
    id: 'sF80I-TQiW0',
    title: 'සහයෝගය නොමැති විට කළ හැකි දේ (Coping with Lack of Support)',
    description: 'පවුලෙන් හෝ සැමියාගෙන් සහයෝගය නොලැබෙන විට මනස සන්සුන්ව තබාගැනීම.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/sF80I-TQiW0',
    thumbnail: 'https://img.youtube.com/vi/sF80I-TQiW0/0.jpg',
  },
  negative_thoughts: {
    id: '9Q634rbsypE',
    title: 'අඳුරු සිතුවිලි සහ ජීවිතය ජය ගැනීම (Overcoming Negative Thoughts)',
    description: 'ප්‍රසූතියෙන් පසු සිතට එන අශුභවාදී සිතුවිලි දුරු කර සුවය ලබාගන්නා ආකාරය.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/9Q634rbsypE',
    thumbnail: 'https://img.youtube.com/vi/9Q634rbsypE/0.jpg',
  },
  bonding_issues: {
    id: 'jzGyjLGbAUc',
    title: 'බබා සහ මව අතර බැඳීම ශක්තිමත් කිරීම (Building Bond with Baby)',
    description: 'නවජන්ම දරුවා සමඟ ආදරණීය සම්බන්ධතාවය වර්ධනය කරගන්නා අයුරු.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/jzGyjLGbAUc',
    thumbnail: 'https://img.youtube.com/vi/jzGyjLGbAUc/0.jpg',
  },
  baby_crying: {
    id: 'UrfpkvvRTns',
    title: 'බබා ඇඬීම නැවැත්වීමට සහ සන්සුන් කිරීමට මඟ පෙන්වීම් (Calming a Crying Baby Guide)',
    description: 'බබා ඇඬීමට හේතු හඳුනාගෙන ඉක්මනින් සන්සුන් කරන ආකාරය.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/UrfpkvvRTns',
    thumbnail: 'https://img.youtube.com/vi/UrfpkvvRTns/0.jpg',
  },
  baby_needs: {
    id: 'jzGyjLGbAUc',
    title: 'බබා සහ මව අතර බැඳීම ශක්තිමත් කිරීම (Building Bond with Baby)',
    description: 'නවජන්ම දරුවා සමඟ ආදරණීය සම්බන්ධතාවය වර්ධනය කරගන්නා අයුරු.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/jzGyjLGbAUc',
    thumbnail: 'https://img.youtube.com/vi/jzGyjLGbAUc/0.jpg',
  },
  baby_feeding: {
    id: 'Uz978b7Gsm4',
    title: 'නවජන්ම දරුවාට කිරි දීම සහ නිවැරදිව තබාගැනීම (Breastfeeding Latch Tips for Newborn)',
    description: 'නිවැරදිව කිරි දෙන ආකාරය සහ ගැටලු මඟහරවා ගන්නා ආකාරය පිළිබඳ උපදෙස්.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/Uz978b7Gsm4',
    thumbnail: 'https://img.youtube.com/vi/Uz978b7Gsm4/0.jpg',
  },
  baby_sleep: {
    id: 'y23E11d8p08',
    title: 'ළදරුවාට සුව නින්දක් ලබාදීමේ ක්‍රමවේද (Baby Sleep Care Tips)',
    description: 'බබාට රාත්‍රියේ හොඳින් නිදා ගැනීමට උපකාරී වන ක්‍රමවේද සහ උපදෙස්.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/y23E11d8p08',
    thumbnail: 'https://img.youtube.com/vi/y23E11d8p08/0.jpg',
  },
  baby_health: {
    id: 'jzGyjLGbAUc',
    title: 'ළදරු සෞඛ්‍යය සහ රැකවරණය (Newborn Baby Health Care Guide)',
    description: 'නවජන්ම දරුවාගේ සෞඛ්‍යය ආරක්‍ෂා කරගැනීමේ මූලික උපදෙස්.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/jzGyjLGbAUc',
    thumbnail: 'https://img.youtube.com/vi/jzGyjLGbAUc/0.jpg',
  },
};

const RecommendationsScreen = ({ navigation, route }) => {
  const { 
    latestRecommendations, 
    latestAnalysis, 
    userPreferredActivities, 
    userPreferredGames, 
    detectedBabyTopic, 
    detectedBabyTopics, 
    detectedBabyAge, 
    completedActivities, 
    fetchCompletedActivities, 
    epdsRiskLevel,
    localRuleRecs,
    setLocalRuleRecs,
    isSkipped,
    setIsSkipped,
    showAssessment,
    setShowAssessment
  } = useApp();

  // Quick Assessment State
  const hasAnalysis = Boolean(latestAnalysis);
  const [step, setStep] = useState(1);
  const [selEmotion, setSelEmotion] = useState('anxious');
  const [selReason, setSelReason] = useState('baby_crying');
  const [selHelp, setSelHelp] = useState(['activities', 'baby_care']);

  // Screen UI State
  const initialBabyTopics = (detectedBabyTopics && detectedBabyTopics.length > 0)
    ? detectedBabyTopics
    : (detectedBabyTopic ? [detectedBabyTopic] : getBabyTopicsFromReason(latestAnalysis?.primaryReason || selReason));
  const hasBabyCareTopic = initialBabyTopics.length > 0;
  const initialTab = route?.params?.tab || (hasBabyCareTopic ? 'videos' : 'activities');
  const [tab, setTab] = useState(initialTab);
  const [videoTab, setVideoTab] = useState(hasBabyCareTopic ? 'නිර්දේශිත වීඩියෝ' : 'Motivation');
  const [kbCategory, setKbCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  // Dynamic YouTube Videos State
  const [dynamicVideos, setDynamicVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videoError, setVideoError] = useState(null);

  useEffect(() => {
    if (latestAnalysis) {
      setShowAssessment(false);
      setLocalRuleRecs(null);
    }
  }, [latestAnalysis]);

  useEffect(() => {
    if (route?.params?.tab) {
      setTab(route.params.tab);
    }
  }, [route?.params?.tab]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (fetchCompletedActivities) {
        fetchCompletedActivities();
      }
    });
    return unsubscribe;
  }, [navigation]);

  const activeAnalysis = isSkipped
    ? null
    : (localRuleRecs 
        ? { 
            detectedEmotion: localRuleRecs.emotion, 
            primaryReason: localRuleRecs.reason, 
            riskLevel: localRuleRecs.riskLevel || null,
            babyIntents: { 
              baby_related: isBabyRelatedReason(localRuleRecs.reason), 
              baby_crying: localRuleRecs.reason === 'baby_crying', 
              baby_needs: localRuleRecs.reason === 'understanding_baby' || localRuleRecs.reason === 'baby_needs', 
              baby_feeding: localRuleRecs.reason === 'baby_feeding', 
              baby_sleep: localRuleRecs.reason === 'baby_sleep',
              baby_health: localRuleRecs.reason === 'baby_health'
            }
          } 
        : (hasAnalysis 
            ? latestAnalysis 
            : { 
                detectedEmotion: selEmotion, 
                primaryReason: selReason, 
                riskLevel: latestAnalysis?.riskLevel || null,
                babyIntents: {
                  baby_related: isBabyRelatedReason(selReason),
                  baby_crying: selReason === 'baby_crying',
                  baby_needs: selReason === 'understanding_baby' || selReason === 'baby_needs',
                  baby_feeding: selReason === 'baby_feeding',
                  baby_sleep: selReason === 'baby_sleep',
                  baby_health: selReason === 'baby_health'
                }
              }
          )
      );

  const emotion = activeAnalysis?.detectedEmotion || selEmotion || 'stressed';
  const risk = epdsRiskLevel || activeAnalysis?.riskLevel || 'low';
  const ec = EMOTION_CFG[emotion] || EMOTION_CFG.stressed;
  const rc = risk ? (RISK_CFG[risk] || RISK_CFG.low) : null;

  // Handle Assessment Completion
  const handleAssessmentContinue = () => {
    const recs = getPersonalizedRecommendations({
      emotion: selEmotion,
      reason: selReason,
      helpCategories: selHelp,
      riskLevel: epdsRiskLevel || null, 
      preferredActivities: userPreferredActivities,
      preferredGames: userPreferredGames,
    });
    setLocalRuleRecs(recs);
    setShowAssessment(false);
    setIsSkipped(false);

    // Dynamically update active tabs based on the selected reason
    const topics = getBabyTopicsFromReason(selReason);
    if (topics.length > 0) {
      setVideoTab('නිර්දේශිත වීඩියෝ');
      setTab('videos');
    } else {
      setVideoTab('Motivation');
      setTab('activities');
    }
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
  // Enforce Max Limits: Activities (4), Games (3), Music (4), Videos (4), Knowledge (5)
  const activeDiaryText = activeAnalysis?.diaryText || latestAnalysis?.diaryText || '';
  const finalActivities = isSkipped
    ? ALL_ACTIVITIES.slice(0, 4)
    : getRankedActivities(
        emotion,
        activeAnalysis?.primaryReason || selReason || 'overwhelmed',
        risk || 'low',
        activeDiaryText,
        userPreferredActivities,
        completedActivities
      );
  
  const activeIntents = activeAnalysis?.babyIntents || {};
  const activeReason = activeAnalysis?.primaryReason || selReason || '';

  const dynamicRecommendedGames = getRecommendedGames(activeIntents, activeDiaryText, activeReason, 4, risk, emotion);

  const finalGames = isSkipped
    ? ALL_GAMES.filter(g => g.id !== 'baby_mood').slice(0, 4)
    : dynamicRecommendedGames;

  const primaryReason = activeAnalysis?.primaryReason || selReason || 'loneliness';
  const normEmotion = emotion ? emotion.toLowerCase().trim() : '';

  let libraryMusic = MUSIC_LIBRARY[primaryReason] || (isBabyActive ? MUSIC_LIBRARY.bonding_issues : MUSIC_LIBRARY.loneliness);
  
  if (risk !== 'high' && risk !== 'medium') {
    if (isBabyActive) {
      if (normEmotion.includes('anxi') || normEmotion.includes('stress') || normEmotion.includes('angr') || normEmotion.includes('frust')) {
        libraryMusic = MUSIC_LIBRARY.anxiety;
      } else {
        libraryMusic = MUSIC_LIBRARY.bonding_issues;
      }
    } else {
      if (normEmotion.includes('happ') || normEmotion.includes('calm')) {
        libraryMusic = MUSIC_LIBRARY.motivation || MUSIC_LIBRARY.loneliness;
      } else if (normEmotion.includes('sad') || normEmotion.includes('cry')) {
        libraryMusic = MUSIC_LIBRARY[primaryReason] || MUSIC_LIBRARY.loneliness;
      } else if (normEmotion.includes('anxi') || normEmotion.includes('stress') || normEmotion.includes('angr') || normEmotion.includes('frust')) {
        libraryMusic = MUSIC_LIBRARY.anxiety || MUSIC_LIBRARY.stress;
      }
    }
  } else {
    libraryMusic = MUSIC_LIBRARY.anxiety || MUSIC_LIBRARY.loneliness;
  }
  const finalMusic = (isSkipped ? Object.values(MUSIC_LIBRARY).flat() : libraryMusic).slice(0, 4);

  const activeBabyTopics = (detectedBabyTopics && detectedBabyTopics.length > 0)
    ? detectedBabyTopics
    : (detectedBabyTopic ? [detectedBabyTopic] : getBabyTopicsFromReason(activeAnalysis?.primaryReason || selReason));

  // Resolve featured hardcoded video based on reason
  const featuredVideo = (() => {
    // 1. Check if backend returned video recommendations
    if (latestRecommendations?.videos && latestRecommendations.videos.length > 0) {
      const rawVideo = latestRecommendations.videos[0];
      
      // If rawVideo is an object (local engine result)
      if (rawVideo && typeof rawVideo === 'object') {
        const url = rawVideo.url || '';
        const match = Object.values(HARDCODED_VIDEO_MAP).find(v => v.url === url);
        if (match) return match;
        
        const vId = url.includes('v=') ? url.split('v=')[1] : url.split('/').pop();
        return {
          id: vId || rawVideo.id,
          title: rawVideo.title || 'විශේෂිත සහන වීඩියෝව (Featured Video)',
          description: rawVideo.description || 'ඔබේ හැඟීම්වලට අදාළ විශේෂිත සහන වීඩියෝව.',
          channelTitle: 'Bloom Supportive Care',
          url: url,
          thumbnail: `https://img.youtube.com/vi/${vId}/0.jpg`,
        };
      }
      
      // If rawVideo is a string (backend endpoint result)
      if (rawVideo && typeof rawVideo === 'string') {
        const url = rawVideo;
        const match = Object.values(HARDCODED_VIDEO_MAP).find(v => v.url === url);
        if (match) return match;
        
        const vId = url.includes('v=') ? url.split('v=')[1] : url.split('/').pop();
        return {
          id: vId,
          title: 'විශේෂිත සහන වීඩියෝව (Featured Video)',
          description: 'ඔබේ හැඟීම්වලට අදාළ විශේෂිත සහන වීඩියෝව.',
          channelTitle: 'Bloom Supportive Care',
          url: url,
          thumbnail: `https://img.youtube.com/vi/${vId}/0.jpg`,
        };
      }
    }
    // 2. Fallback to local map based on primaryReason
    if (primaryReason === 'baby_health') {
      const text = activeDiaryText.toLowerCase();
      const feverKws = ['fever', 'temperature', 'hot', 'feverish', 'උණ', 'una', 'temperature eka', 'ඇඟ රුක් වෙලා', 'ඇඟ රත් වෙලා'];
      const jaundiceKws = ['jaundice', 'yellow', 'yellowish', 'ඇස් කහ', 'සම කහ', 'yellow wela', 'kaha wela'];
      const illnessKws = ['sick', 'ill', 'cold', 'cough', 'vomit', 'vomiting', 'diarrhea', 'flu', 'අසනීප', 'ලෙඩ', 'leda', 'asanipa', 'una gasila', 'වමනය'];
      const emergencyKws = ['emergency', 'doctor', 'hospital', 'pediatrician', 'severe', 'danger', 'හදිසි', 'බයයි', 'baya'];

      const healthVideos = BABY_VIDEO_LIBRARY['Baby Health'] || [];
      if (feverKws.some(kw => text.includes(kw))) {
        const v = healthVideos.find(item => item.id === 'bh1');
        if (v) return { id: 'bh1', title: v.title, description: v.description, channelTitle: 'PeriCare Care Library', url: 'https://www.youtube.com/results?search_query=what+to+do+when+baby+has+a+fever', thumbnail: 'https://img.youtube.com/vi/jzGyjLGbAUc/0.jpg' };
      }
      if (illnessKws.some(kw => text.includes(kw))) {
        return {
          id: 'ZCQUPRyZbO0',
          title: 'ළදරුවන්ගේ අසනීප ලක්ෂණ (Newborn Baby Illness Warning Signs)',
          description: 'ළදරුවෙකුට අසනීපයක් වැළඳී ඇති බව හඳුනාගත හැකි ප්‍රධාන රෝග ලක්ෂණ.',
          channelTitle: 'PeriCare Care Library',
          url: 'https://youtu.be/ZCQUPRyZbO0',
          thumbnail: 'https://img.youtube.com/vi/ZCQUPRyZbO0/0.jpg'
        };
      }
      if (jaundiceKws.some(kw => text.includes(kw))) {
        const v = healthVideos.find(item => item.id === 'bh2');
        if (v) return { id: 'bh2', title: v.title, description: v.description, channelTitle: 'PeriCare Care Library', url: 'https://www.youtube.com/results?search_query=newborn+baby+jaundice+what+to+do', thumbnail: 'https://img.youtube.com/vi/jzGyjLGbAUc/0.jpg' };
      }
      if (emergencyKws.some(kw => text.includes(kw))) {
        const v = healthVideos.find(item => item.id === 'bh3');
        if (v) return { id: 'bh3', title: v.title, description: v.description, channelTitle: 'PeriCare Care Library', url: 'https://www.youtube.com/results?search_query=when+to+take+baby+to+hospital+or+doctor', thumbnail: 'https://img.youtube.com/vi/jzGyjLGbAUc/0.jpg' };
      }
    }
    return HARDCODED_VIDEO_MAP[primaryReason] || null;
  })();

  const isBabyFeedingRelated = (reasonOrText) => {
    if (!reasonOrText || typeof reasonOrText !== 'string') return false;
    const r = reasonOrText.toLowerCase();
    return (
      r.includes('baby_feeding') ||
      r.includes('breastfeeding_concerns') ||
      r.includes('baby feeding') ||
      r.includes('feeding the baby') ||
      r.includes('infant feeding') ||
      r.includes('feeding difficulties') ||
      r.includes('baby meal') ||
      r.includes('feeding guidance') ||
      r.includes('baby food') ||
      r.includes('breastfeeding support') ||
      r.includes('feeding support') ||
      r.includes('complementary feeding') ||
      r.includes('feeding-related')
    );
  };

  const fetchDynamicVideos = async () => {
    try {
      setLoadingVideos(true);
      setVideoError(null);
      const response = await api.get('/api/recommendations/videos', {
        params: {
          reason: primaryReason,
          emotion: emotion,
          riskLevel: risk || 'low',
          babyIntent: isBabyActive,
          diaryText: activeDiaryText
        }
      });
      if (response.data && Array.isArray(response.data)) {
        setDynamicVideos(response.data);
      } else {
        setDynamicVideos([]);
      }
    } catch (err) {
      console.error('Error fetching dynamic YouTube videos:', err.message);
      setVideoError(err.message || 'Failed to fetch videos');
      setDynamicVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchDynamicVideos();
  }, [emotion, primaryReason, risk, isBabyActive]);

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
          {risk === 'high' && (
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
                            } else if (actId === 'new_calm_coloring') {
                              navigation.navigate('Art', { fromRecommendations: true, returnTo: 'Recommendations' });
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

                    {/* Featured/Hardcoded Video */}
                    {featuredVideo && (
                      <View style={s.featuredVideoCont}>
                        <Text style={s.featuredVideoHeader}>⭐ විශේෂිත නිර්දේශය (Featured Relief Video)</Text>
                        <TouchableOpacity style={s.featuredCard} onPress={() => openYouTube(featuredVideo)}>
                          {featuredVideo.thumbnail ? (
                            <Image source={{ uri: featuredVideo.thumbnail }} style={s.featuredVideoThumb} />
                          ) : (
                            <View style={[s.mediaIcon, { backgroundColor: colors.lavenderLight, marginRight: 12 }]}>
                              <Text style={s.mediaEmoji}>🎬</Text>
                            </View>
                          )}
                          <View style={s.featuredVideoInfo}>
                            <Text style={s.featuredVideoTitle} numberOfLines={2}>{featuredVideo.title}</Text>
                            <Text style={s.featuredVideoDesc} numberOfLines={2}>{featuredVideo.description}</Text>
                            <Text style={s.mediaSub}>{featuredVideo.channelTitle}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}

                    <Text style={s.tabIntro}>උපදේශාත්මක වීඩියෝ 🎬 (ප්‍රතිඵල 5)</Text>
                    {loadingVideos ? (
                      <ActivityIndicator size="large" color={colors.lavenderDark} style={{ marginVertical: 20 }} />
                    ) : videoError ? (
                      <View style={s.emptyBox}>
                        <Text style={s.emptyEmoji}>⚠️</Text>
                        <Text style={s.emptyText}>වීඩියෝ ලබාගැනීමට අපොහොසත් විය. (Failed to load videos)</Text>
                        <TouchableOpacity onPress={fetchDynamicVideos} style={s.retryBtn}>
                          <Text style={s.retryBtnText}>නැවත උත්සාහ කරන්න (Retry)</Text>
                        </TouchableOpacity>
                      </View>
                    ) : dynamicVideos.length === 0 ? (
                      <View style={s.emptyBox}>
                        <Text style={s.emptyEmoji}>🎬</Text>
                        <Text style={s.emptyText}>දැනට නිර්දේශිත වීඩියෝ නොමැත.</Text>
                      </View>
                    ) : (
                      dynamicVideos.map((video, idx) => (
                        <TouchableOpacity key={video.id || idx} style={s.mediaCard} onPress={() => openYouTube(video.url)}>
                          {video.thumbnail ? (
                            <Image source={{ uri: video.thumbnail }} style={s.videoThumb} />
                          ) : (
                            <View style={[s.mediaIcon, { backgroundColor: colors.roseLight }]}>
                              <Text style={s.mediaEmoji}>🎬</Text>
                            </View>
                          )}
                          <View style={s.mediaInfo}>
                            <Text style={s.mediaTitle} numberOfLines={2}>{video.title}</Text>
                            <Text style={s.mediaSub} numberOfLines={1}>{video.channelTitle || 'YouTube'}</Text>
                            <Text style={s.videoDesc} numberOfLines={2}>{video.description}</Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
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
  videoThumb: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  videoDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  retryBtn: {
    marginTop: 10,
    backgroundColor: colors.lavenderDark,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  retryBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
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
  featuredVideoCont: {
    backgroundColor: '#F3E5F5',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E1BEE7',
    ...shadows.soft,
  },
  featuredVideoHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#7B1FA2',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredVideoThumb: {
    width: 90,
    height: 68,
    borderRadius: 8,
    marginRight: 12,
  },
  featuredVideoInfo: {
    flex: 1,
  },
  featuredVideoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  featuredVideoDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },
});

export default RecommendationsScreen;