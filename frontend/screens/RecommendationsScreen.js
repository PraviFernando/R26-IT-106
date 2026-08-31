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
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadows } from '../theme';
import { useApp } from '../services/AppContext';
import { ALL_ACTIVITIES, NEW_ACTIVITIES, ALL_GAMES, getEnhancedRecommendationRule, isBabyRelatedContent, isBabyRelatedReason, getRecommendedGames, getRankedActivities, normalizeReasonKey, normalizeEmotionKey, normalizeRiskLevel } from '../services/activitiesLibrary';
import { getPersonalizedRecommendations, getRecommendations } from '../services/emotionEngine';
import { MUSIC_LIBRARY, VIDEO_LIBRARY, getMusicForReason, getVideosForReason } from '../services/mediaLibrary';
import { BABY_VIDEO_LIBRARY, getAllBabyVideos } from '../services/babyMediaLibrary';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_RESOURCES } from '../services/knowledgeLibrary';
import api from '../services/api';
import { openYouTubeLink } from '../utils/openYouTube';
import { EMOTION_OPTIONS, EMOTION_CFG } from '../constants/emotions';

const { width } = Dimensions.get('window');

function extractYouTubeId(urlOrId) {
  if (!urlOrId) return '';
  const str = String(urlOrId).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];
  const shortMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];
  const shortsMatch = str.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];
  const embedMatch = str.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];
  return str;
}

const TABS = [
  { id: 'activities', icon: '🧘', label: 'ක්‍රියාකාරකම්' },
  { id: 'games', icon: '🎮', label: 'ක්‍රීඩා' },
  { id: 'music', icon: '🎵', label: 'සංගීතය' },
  { id: 'videos', icon: '🎬', label: 'වීඩියෝ' },
  { id: 'knowledge', icon: '📚', label: 'දැනුම එකතුව' },
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
  { key: 'difficulty_caring_for_baby', label: 'Difficulty caring for baby (ළදරුවා සාත්තු කිරීමේ අපහසුව)' },
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
    const canOpen = await Linking.canOpenURL(url).catch(() => false);
    if (canOpen || url.startsWith('http') || url.startsWith('tel:')) {
      await Linking.openURL(url);
    } else {
      Alert.alert('සබැඳිය', `තොරතුරු: ${url}`);
    }
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
  if (reason === 'caring_for_baby' || reason === 'difficulty_caring_for_baby') return ['Baby Care'];
  if (reason === 'understanding_baby' || reason === 'baby_needs') return ['Baby Needs'];
  return [];
};

const HARDCODED_VIDEO_MAP = {
  difficulty_caring_for_baby: {
    id: '7yxd25nZMaE',
    title: 'අලුත උපන් බබා සුවපහසුවෙන් බලාගන්නා ආකාරය (Newborn Care & Handling Basics)',
    description: 'අලුත උපන් බබා සුවපහසුවෙන් සහ පරිස්සමෙන් බලාගන්නා ආකාරය පිළිබඳ ප්‍රායෝගික මඟ පෙන්වීම.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/7yxd25nZMaE',
    thumbnail: 'https://img.youtube.com/vi/7yxd25nZMaE/0.jpg',
  },
  caring_for_baby: {
    id: '7yxd25nZMaE',
    title: 'අලුත උපන් බබා සුවපහසුවෙන් බලාගන්නා ආකාරය (Newborn Care & Handling Basics)',
    description: 'අලුත උපන් බබා සුවපහසුවෙන් සහ පරිස්සමෙන් බලාගන්නා ආකාරය පිළිබඳ ප්‍රායෝගික මඟ පෙන්වීම.',
    channelTitle: 'PeriCare Care Library',
    url: 'https://youtu.be/7yxd25nZMaE',
    thumbnail: 'https://img.youtube.com/vi/7yxd25nZMaE/0.jpg',
  },
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
    id: 'bnlKVPj4zeQ',
    title: 'Coping with Lack of Support Postpartum (සහයෝගය නොමැති විට මව්වරුන් සඳහා උපදෙස්)',
    description: 'පවුලෙන් හෝ සහකරුගෙන් ප්‍රමාණවත් සහයෝගයක් නොලැබෙන අවස්ථාවන්හිදී මානසික සුවතාව පවත්වා ගැනීමේ මඟ පෙන්වීම.',
    channelTitle: 'PeriCare Support',
    url: 'https://www.youtube.com/watch?v=bnlKVPj4zeQ',
    thumbnail: 'https://img.youtube.com/vi/bnlKVPj4zeQ/0.jpg',
  },
  daily_responsibilities: {
    id: 'gA-Eokbod38',
    title: 'Managing Daily Responsibilities as a New Mom (නව මවකගේ දෛනික වගකීම් කළමනාකරණය)',
    description: 'ප්‍රසූතියෙන් පසු නිවසේ දෛනික වගකීම් සහ බබාගේ වැඩ පහසුවෙන් කළමනාකරණය කරගන්නා ආකාරය.',
    channelTitle: 'PeriCare Daily Care Guidance',
    url: 'https://youtu.be/gA-Eokbod38?si=dtwXkhZBAKH1bYHY',
    thumbnail: 'https://img.youtube.com/vi/gA-Eokbod38/0.jpg',
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
    id: 'kQiT2tO3KeE',
    title: 'Attachment and bonding - Your Baby and You',
    description: 'Attachment and bonding guidance for parents and newborns.',
    channelTitle: 'Pennine Care NHS Foundation Trust',
    url: 'https://www.youtube.com/watch?v=kQiT2tO3KeE',
    thumbnail: 'https://img.youtube.com/vi/kQiT2tO3KeE/0.jpg',
  },
  financial_worry: {
    id: 'financial_worry_guide',
    title: 'How to be Financially Stable After Baby (දරුවෙකුගෙන් පසු මූල්‍ය ස්ථායීතාවය)',
    description: 'ප්‍රසූතියෙන් පසු මූල්‍ය සැලසුම්කරණය සහ අයවැය කළමනාකරණය පිළිබඳ මඟ පෙන්වීම.',
    channelTitle: 'PeriCare Financial Guidance',
    url: 'https://www.youtube.com/results?search_query=how+to+financial+stabel+after+baby',
    thumbnail: 'https://img.youtube.com/vi/6m9sCmDIlL0/0.jpg',
  },
  relationship_family_problem: {
    id: 'wbN3M1aQAjw',
    title: 'Relationship Changes After Having a Baby (ප්‍රසූතියෙන් පසු සබඳතා පාලනය)',
    description: 'දරුවෙකු ලැබුණු පසු දම්පතීන් අතර ඇතිවන ගැටලු සහ සබඳතා ශක්තිමත් කරගන්නා ආකාරය.',
    channelTitle: 'PeriCare Relationship Guidance',
    url: 'https://youtu.be/wbN3M1aQAjw?si=V6WwjvUmhPlQetfD',
    thumbnail: 'https://img.youtube.com/vi/wbN3M1aQAjw/0.jpg',
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
    id: 'a4WGVOzTR4A',
    title: 'ළදරු සංඥා සහ අවශ්‍යතා හඳුනාගනිමු (Understanding Baby Cues & Needs)',
    description: 'බබාගේ මුහුණේ ඉරියව්, ශබ්ද සහ සංඥා හඳුනාගැනීම සඳහා උපදෙස්.',
    channelTitle: 'PeriCare Baby Care',
    url: 'https://youtu.be/a4WGVOzTR4A',
    thumbnail: 'https://img.youtube.com/vi/a4WGVOzTR4A/0.jpg',
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
    id: 'ZCQUPRyZbO0',
    title: 'ළදරු සෞඛ්‍යය සහ රැකවරණය (Newborn Baby Health Care Guide)',
    description: 'නවජන්ම දරුවාගේ සෞඛ්‍යය ආරක්‍ෂා කරගැනීමේ මූලික උපදෙස්.',
    channelTitle: 'Bloom Supportive Care',
    url: 'https://youtu.be/ZCQUPRyZbO0',
    thumbnail: 'https://img.youtube.com/vi/ZCQUPRyZbO0/0.jpg',
  },
};

const RecommendationsScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const categoryTabs = [
    { id: 'activities', icon: '🧘', label: isSinhala ? 'ක්‍රියාකාරකම්' : 'Activities' },
    { id: 'games', icon: '🎮', label: isSinhala ? 'ක්‍රීඩා' : 'Games' },
    { id: 'music', icon: '🎵', label: isSinhala ? 'සංගීතය' : 'Music' },
    { id: 'videos', icon: '🎬', label: isSinhala ? 'වීඩියෝ' : 'Videos' },
    { id: 'knowledge', icon: '📚', label: isSinhala ? 'දැනුම එකතුව' : 'Knowledge Hub' },
  ];

  const { 
    latestRecommendations, 
    latestAnalysis, 
    setLatestData,
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
  const [selEmotion, setSelEmotion] = useState(null);
  const [selReason, setSelReason] = useState(null);
  const [showEmotionWarning, setShowEmotionWarning] = useState(false);
  const [warningTitle, setWarningTitle] = useState('');
  const [warningText, setWarningText] = useState('');
  const [selHelp, setSelHelp] = useState(['activities', 'baby_care']);

  // Screen UI State
  const initialBabyTopics = (detectedBabyTopics && detectedBabyTopics.length > 0)
    ? detectedBabyTopics
    : (detectedBabyTopic ? [detectedBabyTopic] : getBabyTopicsFromReason(latestAnalysis?.primaryReason || selReason));
  const hasBabyCareTopic = !hasAnalysis && initialBabyTopics.length > 0;
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

  const selectedEmojiKey = activeAnalysis?.selectedEmoji || route?.params?.selectedEmoji || null;
  const rawEmotion = selectedEmojiKey || activeAnalysis?.detectedEmotion || selEmotion || 'stressed';
  const resolvedEmotionKey = EMOTION_OPTIONS.find(o => o.key === rawEmotion || o.emoji === rawEmotion)?.key || rawEmotion;
  const emotion = resolvedEmotionKey;
  const risk = epdsRiskLevel || activeAnalysis?.riskLevel || 'low';
  const ec = EMOTION_CFG[emotion] || EMOTION_CFG.stressed;
  const rc = risk ? (RISK_CFG[risk] || RISK_CFG.low) : null;

  // Handle Assessment Completion
  const handleAssessmentContinue = () => {
    const normReason = normalizeReasonKey(selReason);
    const normEmotion = normalizeEmotionKey(selEmotion);
    const normRisk = normalizeRiskLevel(epdsRiskLevel || 'low');

    const canonicalAnalysis = {
      detectedEmotion: normEmotion,
      primaryReason: normReason,
      riskLevel: normRisk,
      selectedEmoji: normEmotion,
      diaryText: '',
      babyIntents: {
        baby_related: isBabyRelatedReason(normReason),
        baby_crying: normReason === 'baby_crying',
        baby_needs: normReason === 'baby_needs',
        baby_feeding: normReason === 'baby_feeding',
        baby_sleep: normReason === 'baby_sleep',
        baby_health: normReason === 'baby_health'
      }
    };

    const recs = getRecommendations(
      canonicalAnalysis,
      userPreferredActivities,
      userPreferredGames,
      '',
      completedActivities
    );

    if (setLatestData) {
      setLatestData(canonicalAnalysis, recs);
    }
    setLocalRuleRecs(recs);
    setShowAssessment(false);
    setIsSkipped(false);
    setStep(1);

    // Dynamically update active tabs based on the selected reason
    if (isBabyRelatedReason(normReason)) {
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

  const handleAssessmentClose = () => {
    if (step === 1) {
      const hasSelectedEmotion = selEmotion !== null && selEmotion !== undefined && selEmotion !== '';
      if (!hasSelectedEmotion) {
        setWarningTitle(isSinhala ? 'හැඟීමක් තෝරන්න' : 'Select an Emotion');
        setWarningText(isSinhala ? 'පුද්ගලික නිර්දේශ ලබාගැනීමට, කරුණාකර පළමුව හැඟීමක් තෝරන්න.' : 'To receive personalized recommendations, please select an emotion first.');
        setShowEmotionWarning(true);
        return;
      }
    } else if (step === 2) {
      const hasSelectedReason = selReason !== null && selReason !== undefined && selReason !== '';
      if (!hasSelectedReason) {
        setWarningTitle(isSinhala ? 'හේතුවක් තෝරන්න' : 'Select a Reason');
        setWarningText(isSinhala ? 'පුද්ගලික නිර්දේශ ලබාගැනීමට, කරුණාකර පළමුව හේතුවක් තෝරන්න.' : 'To receive personalized recommendations, please select a reason first.');
        setShowEmotionWarning(true);
        return;
      }
    }
    handleAssessmentSkip();
  };

  const handleStep1Next = () => {
    const hasSelectedEmotion = selEmotion !== null && selEmotion !== undefined && selEmotion !== '';
    if (!hasSelectedEmotion) {
      setWarningTitle(isSinhala ? 'හැඟීමක් තෝරන්න' : 'Select an Emotion');
      setWarningText(isSinhala ? 'පුද්ගලික නිර්දේශ ලබාගැනීමට, කරුණාකර පළමුව හැඟීමක් තෝරන්න.' : 'To receive personalized recommendations, please select an emotion first.');
      setShowEmotionWarning(true);
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = () => {
    const hasSelectedReason = selReason !== null && selReason !== undefined && selReason !== '';
    if (!hasSelectedReason) {
      setWarningTitle(isSinhala ? 'හේතුවක් තෝරන්න' : 'Select a Reason');
      setWarningText(isSinhala ? 'පුද්ගලික නිර්දේශ ලබාගැනීමට, කරුණාකර පළමුව හේතුවක් තෝරන්න.' : 'To receive personalized recommendations, please select a reason first.');
      setShowEmotionWarning(true);
      return;
    }
    handleAssessmentContinue();
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

  const primaryReason = activeAnalysis?.primaryReason || selReason || 'bonding_issues';

  const isBabyActive = (primaryReason === 'bonding_issues' || primaryReason === 'loneliness')
    ? false
    : ((activeAnalysis?.primaryReason && isBabyRelatedReason(activeAnalysis.primaryReason)) || (activeAnalysis?.diaryText && isBabyRelatedContent(activeAnalysis.diaryText)) || (latestRecommendations?.isBabyRelated) || (localRuleRecs?.isBabyRelated) || (detectedBabyTopic || (detectedBabyTopics && detectedBabyTopics.length > 0)));

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

  // Enforce Max Limits: Activities (4), Games (4), Music (4), Videos (4), Knowledge (5)
  const activeDiaryText = activeAnalysis?.diaryText || latestAnalysis?.diaryText || '';
  const rawFinalActivities = isSkipped
    ? ALL_ACTIVITIES
    : (latestRecommendations?.newActivities || latestRecommendations?.activities || getRankedActivities(
        emotion,
        activeAnalysis?.primaryReason || selReason || 'overwhelmed',
        risk || 'low',
        activeDiaryText,
        userPreferredActivities,
        completedActivities,
        selectedEmojiKey
      ));
  const finalActivities = (rawFinalActivities || []).slice(0, 4);
  
  const activeIntents = activeAnalysis?.babyIntents || {};
  const activeReason = activeAnalysis?.primaryReason || selReason || '';

  const dynamicRecommendedGames = (latestRecommendations?.games && latestRecommendations.games.length > 0)
    ? latestRecommendations.games
    : getRecommendedGames(activeIntents, activeDiaryText, activeReason, 4, risk, emotion, selectedEmojiKey);

  const finalGames = isSkipped
    ? ALL_GAMES.filter(g => g.id !== 'baby_mood').slice(0, 4)
    : dynamicRecommendedGames;

  const normEmotion = emotion ? emotion.toLowerCase().trim() : '';

  // Helper to detect if the subject of sleep/crying is the BABY vs the MOTHER
  const textLower = (activeDiaryText || '').toLowerCase();
  const reasonLower = (primaryReason || selReason || '').toLowerCase();
  const intents = activeIntents || {};

  const isBabySubject = (
    reasonLower === 'baby_crying' ||
    reasonLower === 'baby_sleep' ||
    reasonLower === 'baby_needs' ||
    reasonLower === 'baby_feeding' ||
    reasonLower === 'caring_for_baby' ||
    reasonLower === 'difficulty_caring_for_baby' ||
    reasonLower === 'understanding_baby' ||
    intents.baby_crying ||
    intents.baby_sleep ||
    intents.baby_needs ||
    intents.baby_feeding ||
    intents.baby_health ||
    /baby|බබා|බබාට|බබාගේ|දරුවා|දරුවාට|දරුවාගේ|baba|babata|babage|daruwa|infant|newborn/.test(textLower)
  );

  const isBabyCryingContext = isBabySubject && (
    reasonLower === 'baby_crying' ||
    intents.baby_crying ||
    /cry|crying|cries|අඬන|අඬනව|andanawa|andanne/.test(textLower) ||
    reasonLower.includes('crying') ||
    reasonLower.includes('cry')
  );

  const isBabySleepContext = isBabySubject && (
    reasonLower === 'baby_sleep' ||
    intents.baby_sleep ||
    /sleep|sleeping|wakes|waking|ninda|නිදා|nidaganne/.test(textLower)
  );

  const isMotherSleepContext = !isBabySubject && (
    reasonLower === 'sleep_problems' ||
    reasonLower === 'mother_sleep' ||
    reasonLower === 'mother_sleep_problems' ||
    /ninda|sleep|sleeping|නිදා/.test(textLower)
  );

  // Music & Videos selection driven by Reason + Risk + Emoji
  const recMusicRes = getMusicForReason(primaryReason, emotion, selectedEmojiKey, risk);
  const libraryMusic = (latestRecommendations?.music && latestRecommendations.music.length > 0)
    ? latestRecommendations.music
    : recMusicRes.music;

  const finalMusic = (isSkipped ? Object.values(MUSIC_LIBRARY).flat() : libraryMusic).slice(0, 4);

  const recVideoRes = getVideosForReason(primaryReason, emotion, selectedEmojiKey, risk);
  const libraryVideos = (latestRecommendations?.videos && latestRecommendations.videos.length > 0)
    ? latestRecommendations.videos
    : recVideoRes.videos;

  const finalVideos = (isSkipped ? Object.values(VIDEO_LIBRARY).flat() : libraryVideos).slice(0, 4);

  const rawBabyTopics = (primaryReason === 'bonding_issues' || primaryReason === 'loneliness')
    ? []
    : ((detectedBabyTopics && detectedBabyTopics.length > 0)
        ? detectedBabyTopics
        : (detectedBabyTopic ? [detectedBabyTopic] : getBabyTopicsFromReason(activeAnalysis?.primaryReason || selReason)));

  const activeBabyTopics = (primaryReason === 'baby_needs' || primaryReason === 'understanding_baby')
    ? ['Baby Needs']
    : Array.from(new Set(rawBabyTopics.map(t => t === 'Baby Bathing' ? 'Baby Needs' : t)));

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
        if (v) return { id: 'bh1', title: v.title, description: v.description, channelTitle: 'PeriCare Care Library', url: 'https://www.youtube.com/results?search_query=what+to+do+when+baby+has+a+fever', thumbnail: 'https://img.youtube.com/vi/ZCQUPRyZbO0/0.jpg' };
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
        if (v) return { id: 'bh2', title: v.title, description: v.description, channelTitle: 'PeriCare Care Library', url: 'https://www.youtube.com/results?search_query=newborn+baby+jaundice+what+to+do', thumbnail: 'https://img.youtube.com/vi/ZCQUPRyZbO0/0.jpg' };
      }
      if (emergencyKws.some(kw => text.includes(kw))) {
        const v = healthVideos.find(item => item.id === 'bh3');
        if (v) return { id: 'bh3', title: v.title, description: v.description, channelTitle: 'PeriCare Care Library', url: 'https://www.youtube.com/results?search_query=when+to+take+baby+to+hospital+or+doctor', thumbnail: 'https://img.youtube.com/vi/ZCQUPRyZbO0/0.jpg' };
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
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setDynamicVideos(response.data);
      } else {
        const fallback = (latestRecommendations?.videos && latestRecommendations.videos.length > 0)
          ? latestRecommendations.videos
          : getVideosForReason(primaryReason, emotion, selectedEmojiKey, risk).videos;
        setDynamicVideos(fallback);
      }
    } catch (err) {
      console.warn('Backend dynamic videos endpoint unavailable, using curated videos fallback:', err.message);
      const fallback = (latestRecommendations?.videos && latestRecommendations.videos.length > 0)
        ? latestRecommendations.videos
        : getVideosForReason(primaryReason, emotion, selectedEmojiKey, risk).videos;
      setDynamicVideos(fallback);
      setVideoError(null);
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
      <LinearGradient colors={['#FAF2FA', '#FFDFEF']} style={s.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Top Header Row with Back Button and Language Toggle Button */}
          <View style={s.topBarRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
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

          <Text style={s.title}>{isSinhala ? 'නිර්දේශිත සහන & දැනුම එකතුව' : 'Recommended Relief & Knowledge Collection 💜'}</Text>

          {/* Search Bar */}
          <View style={s.searchWrap}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder={isSinhala ? "ඔබට අවශ්‍ය දේ සොයන්න... (Search videos, guides, sleep, feeding)" : "Search videos, guides, sleep, feeding..."}
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
                <Text style={s.emergencyTitle}>
                  {isSinhala ? 'ක්ෂණික වෛද්‍ය හා වෘත්තීය සහාය (Immediate Professional Support):' : 'Immediate Professional Support:'}
                </Text>
                <Text style={s.emergencyText}>
                  {isSinhala
                    ? 'ඔබ අධික පීඩනයකින් හෝ බලාපොරොත්තු රහිත ස්වභාවයකින් පෙළෙන්නේ නම්, කරුණාකර වහාම නොමිලේ උපදේශන සේවාව හමුවන්න (හදිසි ඇමතුම් 1926) හෝ ආසන්නතම සෞඛ්‍ය නිලධාරී / පවුල් සෞඛ්‍ය සේවිකා මුණගැසෙන්න.'
                    : 'If you are experiencing severe distress or feeling hopeless, please contact the free helpline (1926) or visit your nearest midwife or healthcare professional immediately.'}
                </Text>
              </View>
            </View>
          )}

          {/* SEARCH RESULTS DISPLAY */}
          {searchResults ? (
            <View style={s.searchResultsCont}>
              <Text style={s.searchTitle}>{isSinhala ? `සොයාගත් ප්‍රතිඵල (${searchResults.length}):` : `Search Results (${searchResults.length}):`}</Text>
              {searchResults.length === 0 ? (
                <View style={s.emptyBox}>
                  <Text style={s.emptyEmoji}>🔎</Text>
                  <Text style={s.emptyText}>{isSinhala ? 'සොයන ලද වචනයට අදාළ අන්තර්ගතයන් හමු නොවීය.' : 'No matching results found.'}</Text>
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
                      <Text style={s.mediaTitle}>{isSinhala ? (item.title || item.label) : (item.titleEn || item.labelEn || item.title || item.label)}</Text>
                      <Text style={s.mediaSub}>{isSinhala ? (item.description || item.category || 'තොරතුරු මූලාශ්‍රය') : (item.descriptionEn || item.category || 'Information Resource')}</Text>
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
                  <Text style={[s.badgeText, { color: ec.col }]}>{ec.emoji} {isSinhala ? ec.label : (ec.labelEn || ec.label)}</Text>
                </LinearGradient>
                {!isSkipped && activeReason && (() => {
                  const reasonObj = REASON_OPTIONS.find(r => r.key === activeReason);
                  const reasonLabel = isSinhala
                    ? (reasonObj?.label ? reasonObj.label.split('(')[0].trim() : activeReason.replace(/_/g, ' '))
                    : (reasonObj?.label ? reasonObj.label.split('(')[0].trim() : activeReason.replace(/_/g, ' '));
                  return reasonLabel ? (
                    <View style={[s.badge, { backgroundColor: '#FFF3E0' }]}>
                      <Text style={[s.badgeText, { color: '#E65100' }]}>📌 {reasonLabel}</Text>
                    </View>
                  ) : null;
                })()}
                {isSkipped && (
                  <View style={[s.badge, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={[s.badgeText, { color: '#0369A1' }]}>{isSinhala ? '🌐 සියලු අන්තර්ගතයන්' : '🌐 All Content'}</Text>
                  </View>
                )}
              </View>

              {!isSkipped && hasAnalysis && activeDiaryText ? (
                <View style={s.reasonNoticeCont}>
                  <Text style={s.reasonNoticeIcon}>📔</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.reasonNoticeTitle}>{isSinhala ? 'ඩයරි සටහන අනුව නිර්දේශ' : 'Recommendations Based on Diary Entry'}</Text>
                    <Text style={s.reasonNoticeText}>
                      {isSinhala
                        ? 'ඔබ ලියූ ඩයරි සටහනෙහි හැඟීම් හා හේතු විශ්ලේෂණය කර, ඔබට වඩාත්ම ගැළපෙන සම්පත් නිර්දේශ කරන ලදී. 🌸'
                        : 'Your diary entry feelings and reasons were analyzed to recommend the best resources for you. 🌸'}
                    </Text>
                  </View>
                </View>
              ) : !isSkipped && (localRuleRecs || hasAnalysis) ? (
                <Text style={s.supportiveNotice}>
                  {isSinhala
                    ? 'ඔබ තෝරාගත් කරුණු මත පදනම්ව, අද ඔබට උපකාරී විය හැකි ඇතැම් සම්පත් මෙන්න. 🌸'
                    : 'Based on your selected inputs, here are helpful resources for you today. 🌸'}
                </Text>
              ) : null}

              {/* Main Category Tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabsCont}>
                {categoryTabs.map(t => (
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
                    <Text style={s.tabIntro}>{isSinhala ? 'ඔබ වෙනුවෙන්ම තෝරාගත් ක්‍රියාකාරකම් 🧘 (උපරිම 4)' : 'Mindful Activities Selected for You 🧘 (Max 4)'}</Text>
                    {finalActivities.map((act, idx) => {
                      const actId = typeof act === 'string' ? act : act?.id;
                      const actTitle = isSinhala ? (act.label || act) : (act.labelEn || act.label || act);
                      const actDesc = isSinhala ? (act.purpose || act.desc || 'සන්සුන් ක්‍රියාකාරකමක්') : (act.purposeEn || act.descEn || act.purpose || act.desc || 'Calming activity');
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
                              <Text style={[s.actTitle, { color: act.accent || '#7E57C2' }]}>{actTitle}</Text>
                              <Text style={s.actDesc}>{actDesc}</Text>
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
                    <Text style={s.tabIntro}>{isSinhala ? 'සන්සුන් ක්‍රීඩා 🎮 (උපරිම 3)' : 'Calm Games 🎮 (Max 3)'}</Text>
                    {finalGames.map((game, idx) => {
                      const gId = typeof game === 'string' ? game : game?.id;
                      const gTitle = isSinhala ? (game.label || game) : (game.labelEn || game.label || game);
                      const gSub = isSinhala ? (game.purpose || 'සුවය ලබාදෙන ක්‍රීඩාව') : (game.purposeEn || 'Healing & Relaxing Game');
                      return (
                        <TouchableOpacity
                          key={gId || idx}
                          onPress={() => navigation.navigate(gId === 'mandala' || gId === 'colouring' ? 'Art' : 'Activity', { gameId: gId, fromRecommendations: true, returnTo: 'Recommendations' })}
                        >
                          <LinearGradient colors={game.color || ['#EDE7F6', '#D1C4E9']} style={s.primaryGameCard}>
                            <Text style={s.primaryGameIcon}>{game.icon || '🎮'}</Text>
                            <View style={s.primaryGameInfo}>
                              <Text style={[s.primaryGameName, { color: game.accent || '#7E57C2' }]}>{gTitle}</Text>
                              <Text style={s.primaryGameSub}>{gSub}</Text>
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
                    <Text style={s.tabIntro}>{isSinhala ? 'සන්සුන් සංගීතය 🎵 (උපරිම 4)' : 'Calming Music 🎵 (Max 4)'}</Text>
                    {finalMusic.map((track, idx) => (
                      <TouchableOpacity key={track.id || idx} style={s.mediaCard} onPress={() => openYouTube(track)}>
                        <View style={[s.mediaIcon, { backgroundColor: colors.lavenderLight }]}>
                          <Text style={s.mediaEmoji}>{track.emoji || '🎵'}</Text>
                        </View>
                        <View style={s.mediaInfo}>
                          <Text style={s.mediaTitle}>{isSinhala ? track.title : (track.titleEn || track.title)}</Text>
                          <Text style={s.mediaSub}>{isSinhala ? 'සන්සුන් සංගීතය' : 'Calming Music'}</Text>
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
                        <Text style={s.detectedTopicsTitle}>
                          {isSinhala ? `🍼 හඳුනාගත් ළදරු සාත්තු මාතෘකා (${activeBabyTopics.length}):` : `🍼 Identified Baby Care Topics (${activeBabyTopics.length}):`}
                        </Text>
                        <View style={s.topicBadgesRow}>
                          {activeBabyTopics.map((top, idx) => (
                            <View key={idx} style={s.topicBadgeItem}>
                              <Text style={s.topicBadgeText}>{top}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Render backend hybrid 5 videos directly with clear source badges */}
                    <Text style={s.tabIntro}>උපදේශාත්මක වීඩියෝ 🎬</Text>
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
                      featuredVideo ? (
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
                      ) : (
                        <View style={s.emptyBox}>
                          <Text style={s.emptyEmoji}>🎬</Text>
                          <Text style={s.emptyText}>දැනට නිර්දේශිත වීඩියෝ නොමැත.</Text>
                        </View>
                      )
                    ) : (
                      dynamicVideos.map((video, idx) => {
                        const REASON_LABEL_MAP = {
                          loneliness: 'Feeling lonely (තනිකම)',
                          feeling_lonely: 'Feeling lonely (තනිකම)',
                          anxiety: 'Anxiety (කනස්සල්ල)',
                          fatigue: 'Fatigue (මහන්සිය)',
                          mother_sleep: 'Sleep problems (නින්ද නොයාම)',
                          sleep_problems: 'Sleep problems (නින්ද නොයාම)',
                          overwhelmed: 'Feeling overwhelmed (මානසික වෙහෙස)',
                          feeling_overwhelmed: 'Feeling overwhelmed (මානසික වෙහෙස)',
                          lack_of_support: 'Lack of support (සහයෝගය මදි වීම)',
                          negative_thoughts: 'Negative thoughts (අඳුරු සිතුවිලි)',
                          bonding_issues: 'Bonding issues (බැඳීමේ ගැටලු)',
                          physical_discomfort: 'Physical discomfort (ශාරීරික අපහසුව)',
                          physical_recovery: 'Physical recovery (ශාරීරික අපහසුව)',
                          baby_crying: 'Baby crying (ළදරුවා හැඬීම)',
                          baby_feeding: 'Baby feeding (ළදරුවාට කිරි දීම)',
                          breastfeeding_concerns: 'Breastfeeding concerns (මව්කිරි දීම)',
                          baby_sleep: 'Baby sleep (ළදරුවාගේ නින්ද)',
                          understanding_baby: 'Understanding baby (ළදරු සංඥා)',
                          caring_for_baby: 'Caring for baby (ළදරු සාත්තු)',
                        };
                        const itemReason = video.reason || activeReason;
                        const displayReason = REASON_LABEL_MAP[itemReason] || REASON_OPTIONS.find(r => r.key === itemReason)?.label;
                        const reasonLabel = displayReason ? displayReason.split('(')[0]?.trim() : (itemReason ? itemReason.replace(/_/g, ' ') : null);

                        const isCurated = video.source === 'curated';
                        const isApi = video.source === 'youtube_api' || video.source === 'youtube';
                        const sourceLabel = isCurated ? '⭐ Curated Relief' : isApi ? '▶️ YouTube API' : '📌 Related Guide';
                        const badgeBg = isCurated ? '#EDE7F6' : isApi ? '#FFEBEE' : '#E0F2FE';
                        const badgeCol = isCurated ? '#6A1B9A' : isApi ? '#C62828' : '#0369A1';

                        return (
                          <TouchableOpacity key={extractYouTubeId(video.url) || video.id || `v-${idx}`} style={s.mediaCard} onPress={() => openYouTube(video)}>
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
                        );
                      })
                    )}
                  </View>
                )}

                {/* 5. KNOWLEDGE HUB TAB */}
                {tab === 'knowledge' && (
                  <View>
                    <Text style={s.tabIntro}>{isSinhala ? 'කේන්ද්‍රීය දැනුම පියස 📚 (උපරිම 5)' : 'Central Knowledge Hub 📚 (Max 5)'}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.videoTabsScroll}>
                      {KNOWLEDGE_CATEGORIES.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => setKbCategory(cat.id)}
                          style={[s.videoSubTab, kbCategory === cat.id && s.videoSubTabActive]}
                        >
                          <Text style={[s.videoSubTabLabel, kbCategory === cat.id && s.videoSubTabLabelActive]}>
                            {cat.icon} {isSinhala ? cat.label : (cat.labelEn || cat.label)}
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
                          <Text style={s.mediaTitle}>{isSinhala ? res.title : (res.titleEn || res.title)}</Text>
                          <Text style={s.mediaSub}>{isSinhala ? res.description : (res.descriptionEn || res.description)}</Text>
                          <Text style={s.sourceTag}>{isSinhala ? 'මූලාශ්‍රය: ' : 'Source: '}{res.source}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* USER FEEDBACK SECTION */}
              <View style={s.feedbackCard}>
                <Text style={s.feedbackTitle}>{isSinhala ? 'මෙම නිර්දේශ ඔබට උපකාරී වූවාද?' : 'Were these recommendations helpful to you?'}</Text>
                {feedbackSaved ? (
                  <Text style={s.feedbackSavedText}>{isSinhala ? '✓ අදහස සටහන් කරගන්නා ලදී. ස්තූතියි!' : '✓ Feedback saved. Thank you!'}</Text>
                ) : (
                  <View style={s.feedbackBtnRow}>
                    <TouchableOpacity style={s.feedbackBtn} onPress={() => handleFeedback('positive')}>
                      <Text style={s.feedbackBtnText}>{isSinhala ? '👍 ඔව්, උපකාරී විය' : '👍 Yes, helpful'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.feedbackBtn, s.feedbackBtnNo]} onPress={() => handleFeedback('negative')}>
                      <Text style={s.feedbackBtnTextNo}>{isSinhala ? '👎 නැත' : '👎 No'}</Text>
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
              <Text style={s.stepIndicatorText}>{isSinhala ? 'පියවර' : 'Step'} {step} / 2</Text>
              <TouchableOpacity onPress={handleAssessmentClose}>
                <Text style={s.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            {step === 1 && (
              <View>
                <Text style={s.modalTitle}>{isSinhala ? 'ඔබට දැන් කොහොමද දැනෙන්නේ?' : 'How are you feeling right now?'}</Text>
                <Text style={s.modalSub}>
                  {isSinhala ? 'ඔබට වඩාත්ම ගැළපෙන පුද්ගලික නිර්දේශ ලබාදීමට ඔබේ වත්මන් හැඟීම තෝරන්න.' : 'Select your current feeling to receive personalized recommendations.'}
                </Text>
                <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={s.emojiGrid}>
                  {EMOTION_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[s.emojiCard, selEmotion === opt.key && s.emojiCardSel]}
                      onPress={() => setSelEmotion(opt.key)}
                    >
                      <Text style={s.emojiCardText}>{opt.emoji}</Text>
                      <Text style={s.emojiCardLabel}>{isSinhala ? opt.label : (opt.labelEn || opt.label)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={s.modalActionRow}>
                  <TouchableOpacity style={s.skipBtn} onPress={handleAssessmentClose}>
                    <Text style={s.skipBtnText}>{isSinhala ? 'දැන් අවශ්‍ය නැහැ (Skip)' : 'Skip for now'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.modalNextBtn} onPress={handleStep1Next}>
                    <Text style={s.modalNextBtnText}>{isSinhala ? 'ඊළඟ පියවර →' : 'Next Step →'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={s.modalTitle}>{isSinhala ? 'ඔබට මෙහෙම දැනෙන්න ප්‍රධාන හේතුව මොකක්ද?' : 'What is the main reason for feeling this way?'}</Text>
                <Text style={s.modalSub}>{isSinhala ? 'කරුණාකර ඔබට බලපාන ප්‍රධාන හේතුව තෝරන්න.' : 'Please select the primary reason affecting you.'}</Text>
                <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={true}>
                  {REASON_OPTIONS.map(r => (
                    <TouchableOpacity
                      key={r.key}
                      style={[s.reasonOption, selReason === r.key && s.reasonOptionSel]}
                      onPress={() => setSelReason(r.key)}
                    >
                      <Text style={[s.reasonText, selReason === r.key && s.reasonTextSel]}>
                        {isSinhala ? r.label : (r.labelEn || r.label.split('(')[0].trim())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={s.modalActionRow}>
                  <TouchableOpacity style={s.modalBackBtn} onPress={() => setStep(1)}>
                    <Text style={s.modalBackBtnText}>{isSinhala ? '← ආපසු' : '← Back'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.skipBtn} onPress={handleAssessmentClose}>
                    <Text style={s.skipBtnText}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.modalNextBtn} onPress={handleStep2Submit}>
                    <Text style={s.modalNextBtnText}>{isSinhala ? 'පුද්ගලික නිර්දේශ බලන්න ✨' : 'View Recommendations ✨'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* EMOTION / REASON REQUIRED WARNING MODAL */}
      <Modal visible={showEmotionWarning} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <View style={s.warningCard}>
            <Text style={s.warningIcon}>⚠️</Text>
            <Text style={s.warningTitle}>{warningTitle || (isSinhala ? 'තෝරාගැනීම අවශ්‍යයි' : 'Selection Required')}</Text>
            <Text style={s.warningText}>
              {warningText || (isSinhala
                ? 'පුද්ගලික නිර්දේශ ලබාගැනීමට, කරුණාකර පළමුව තෝරාගැනීමක් කරන්න.'
                : 'To receive personalized recommendations, please make a selection first.')}
            </Text>
            <TouchableOpacity
              style={s.warningBtn}
              onPress={() => setShowEmotionWarning(false)}
            >
              <Text style={s.warningBtnText}>
                {isSinhala ? 'තෝරාගැනීම ඉදිරියට' : 'Continue Selecting'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF2FA' },
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: 40 },
  topBarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  backBtn: { alignSelf: 'flex-start' },
  backText: { color: '#AA60C8', fontFamily: typography.subTopicFont, fontWeight: '700', fontSize: 15 },
  langToggleBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: '#EABDE6', ...shadows.soft },
  langToggleText: { fontSize: 13, fontFamily: typography.subTopicFont, fontWeight: '700', color: '#AA60C8' },
  title: { fontSize: 22, fontFamily: typography.headerFont, fontWeight: '700', color: '#2C1A35', marginBottom: 14 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 16, borderWidth: 1, borderColor: '#EABDE6', ...shadows.soft },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: typography.bodyFont, color: '#2C1A35' },
  clearSearch: { fontSize: 14, color: '#9E7FA9', paddingHorizontal: 6 },
  searchResultsCont: { marginBottom: 20 },
  searchTitle: { fontSize: 14, fontFamily: typography.subTopicFont, fontWeight: '700', color: '#AA60C8', marginBottom: 10 },
  typeTag: { alignSelf: 'flex-start', backgroundColor: '#FFDFEF', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, marginBottom: 4 },
  typeTagText: { fontSize: 10, fontFamily: typography.subTopicFont, fontWeight: '700', color: '#AA60C8' },
  emergencyBanner: { flexDirection: 'row', backgroundColor: '#FFEBEE', borderWidth: 1.5, borderColor: '#D32F2F', borderRadius: radius.lg, padding: 14, marginBottom: 16, gap: 10 },
  emergencyIcon: { fontSize: 24 },
  emergencyTitle: { fontSize: 13, fontFamily: typography.subTopicFont, fontWeight: '700', color: '#D32F2F', marginBottom: 2 },
  emergencyText: { fontSize: 11, fontFamily: typography.bodyFont, color: '#B71C1C', lineHeight: 17 },
  detectedTopicsBanner: { backgroundColor: '#FFDFEF', borderWidth: 1.5, borderColor: '#EABDE6', borderRadius: radius.lg, padding: 14, marginBottom: 16 },
  detectedTopicsTitle: { fontSize: 13, fontFamily: typography.subTopicFont, fontWeight: '700', color: '#AA60C8', marginBottom: 6 },
  topicBadgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  topicBadgeItem: { backgroundColor: '#AA60C8', borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 12 },
  topicBadgeText: { fontSize: 11, fontFamily: typography.subTopicFont, fontWeight: '700', color: '#FFFFFF' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  badge: { borderRadius: radius.full, paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1, borderColor: '#EABDE6' },
  badgeText: { fontSize: 12, fontFamily: typography.subTopicFont, fontWeight: '600' },
  tabsScroll: { marginBottom: spacing.md },
  tabsCont: { gap: 10, paddingRight: spacing.md },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.full, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EABDE6', ...shadows.soft },
  tabActive: { backgroundColor: '#AA60C8', borderColor: '#AA60C8' },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 12, fontFamily: typography.subTopicFont, fontWeight: '600', color: '#6A4D77' },
  tabLabelActive: { color: '#FFFFFF', fontWeight: '700' },
  tabContent: { marginBottom: spacing.md },
  tabIntro: { fontSize: 13, fontFamily: typography.bodyFont, color: '#9E7FA9', marginBottom: spacing.md, fontStyle: 'italic' },
  mediaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md, marginBottom: 12, borderWidth: 1, borderColor: '#F5D3EE', ...shadows.soft },
  mediaIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mediaEmoji: { fontSize: 24 },
  mediaInfo: { flex: 1 },
  mediaTitle: { fontSize: 14, fontFamily: typography.subTopicFont, fontWeight: '700', color: '#2C1A35' },
  mediaSub: { fontSize: 11, fontFamily: typography.bodyFont, color: '#6A4D77', marginTop: 3 },
  sourceTag: { fontSize: 10, fontFamily: typography.subTopicFont, color: '#AA60C8', fontWeight: '700', marginTop: 4 },
  actCard: { borderRadius: radius.lg, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F5D3EE', ...shadows.soft },
  actGrad: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  actIcon: { fontSize: 28, marginRight: 12 },
  actInfo: { flex: 1 },
  actTitle: { fontSize: 14, fontFamily: typography.subTopicFont, fontWeight: '700' },
  actDesc: { fontSize: 12, fontFamily: typography.bodyFont, color: '#6A4D77', marginTop: 2 },
  primaryGameCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.xl, padding: spacing.md, marginBottom: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EABDE6', ...shadows.card },
  primaryGameIcon: { fontSize: 32, marginRight: 12 },
  primaryGameInfo: { flex: 1 },
  primaryGameName: { fontSize: 14, fontFamily: typography.subTopicFont, fontWeight: '700', color: '#2C1A35' },
  primaryGameSub: { fontSize: 11, fontFamily: typography.bodyFont, color: '#6A4D77', marginTop: 2 },
  videoThumb: {
    width: 80,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  videoDesc: {
    fontSize: 11,
    fontFamily: typography.bodyFont,
    color: '#6A4D77',
    marginTop: 4,
  },
  retryBtn: {
    marginTop: 10,
    backgroundColor: '#AA60C8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.full,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: typography.subTopicFont,
    fontWeight: '700',
  },
  videoReasonChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFDFEF',
    borderWidth: 1,
    borderColor: '#EABDE6',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  videoReasonChipText: {
    fontSize: 10,
    fontFamily: typography.subTopicFont,
    fontWeight: '700',
    color: '#AA60C8',
  },
  reasonNoticeCont: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5FA',
    borderWidth: 1.5,
    borderColor: '#EABDE6',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  reasonNoticeIcon: { fontSize: 20 },
  reasonNoticeTitle: {
    fontSize: 13,
    fontFamily: typography.topicFont,
    fontWeight: '700',
    color: '#AA60C8',
    marginBottom: 2,
  },
  reasonNoticeText: {
    fontSize: 11,
    fontFamily: typography.bodyFont,
    color: '#6A4D77',
    lineHeight: 17,
  },
  videoTabsScroll: { marginBottom: spacing.md },
  videoSubTab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: radius.full, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EABDE6', marginRight: 6 },
  videoSubTabActive: { backgroundColor: '#D69ADE', borderColor: '#D69ADE' },
  videoSubTabLabel: { fontSize: 11, fontFamily: typography.subTopicFont, fontWeight: '600', color: '#6A4D77' },
  videoSubTabLabelActive: { color: '#FFFFFF', fontWeight: '700' },
  emptyBox: { backgroundColor: '#FFFFFF', borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: '#F5D3EE', ...shadows.soft },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, fontFamily: typography.bodyFont, color: '#6A4D77', textAlign: 'center', lineHeight: 22 },
  feedbackCard: { backgroundColor: '#FFFFFF', borderRadius: radius.xl, padding: spacing.md, marginTop: 14, alignItems: 'center', borderWidth: 1, borderColor: '#EABDE6', ...shadows.soft },
  feedbackTitle: { fontSize: 13, fontFamily: typography.subTopicFont, fontWeight: '700', color: '#2C1A35', marginBottom: 10 },
  feedbackBtnRow: { flexDirection: 'row', gap: 12 },
  feedbackBtn: { backgroundColor: '#FFDFEF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.full, borderWidth: 1, borderColor: '#EABDE6' },
  feedbackBtnNo: { backgroundColor: '#FFF0F7', borderColor: '#EABDE6' },
  feedbackBtnText: { color: '#AA60C8', fontFamily: typography.subTopicFont, fontWeight: '700', fontSize: 12 },
  feedbackBtnTextNo: { color: '#873CA6', fontFamily: typography.subTopicFont, fontWeight: '700', fontSize: 12 },
  feedbackSavedText: { color: '#AA60C8', fontFamily: typography.subTopicFont, fontWeight: '700', fontSize: 12 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(44, 26, 53, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: radius.xl, padding: 22, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#EABDE6', ...shadows.card },
  modalTitle: { fontSize: 18, fontFamily: typography.topicFont, fontWeight: '700', color: '#AA60C8', marginBottom: 4 },
  modalSub: { fontSize: 12, fontFamily: typography.bodyFont, color: '#6A4D77', marginBottom: 16 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' },
  emojiCard: { width: '29%', backgroundColor: '#FAF2FA', borderRadius: radius.lg, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#EABDE6' },
  emojiCardSel: { backgroundColor: '#FFDFEF', borderColor: '#AA60C8', borderWidth: 2 },
  emojiCardText: { fontSize: 26 },
  emojiCardLabel: { fontSize: 10, fontFamily: typography.subTopicFont, fontWeight: '700', marginTop: 4, color: '#2C1A35' },
  reasonOption: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.lg, backgroundColor: '#FAF2FA', marginBottom: 6, borderWidth: 1, borderColor: '#F5D3EE' },
  reasonOptionSel: { backgroundColor: '#AA60C8', borderColor: '#AA60C8' },
  reasonText: { fontSize: 13, fontFamily: typography.bodyFont, color: '#2C1A35', fontWeight: '600' },
  reasonTextSel: { color: '#FFFFFF', fontWeight: '700' },
  helpOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md, marginBottom: 6, backgroundColor: '#FAF2FA', borderWidth: 1, borderColor: '#F5D3EE' },
  helpOptionSel: { backgroundColor: '#FFDFEF', borderColor: '#EABDE6' },
  checkboxText: { fontSize: 16, marginRight: 8, color: '#AA60C8' },
  helpOptionLabel: { fontSize: 12, fontFamily: typography.subTopicFont, fontWeight: '700', color: '#2C1A35' },
  modalActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  modalNextBtn: { backgroundColor: '#AA60C8', paddingVertical: 10, paddingHorizontal: 18, borderRadius: radius.full, alignSelf: 'flex-end' },
  modalNextBtnText: { color: '#FFFFFF', fontFamily: typography.subTopicFont, fontWeight: '700', fontSize: 13 },
  modalBackBtn: { paddingVertical: 10, paddingHorizontal: 10 },
  modalBackBtnText: { color: '#9E7FA9', fontFamily: typography.subTopicFont, fontWeight: '600', fontSize: 13 },
  skipBtn: { paddingVertical: 10, paddingHorizontal: 10 },
  skipBtnText: { color: '#AA60C8', fontFamily: typography.subTopicFont, fontWeight: '700', fontSize: 12 },
  stepIndicatorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stepIndicatorText: { fontSize: 11, fontFamily: typography.subTopicFont, fontWeight: '700', color: '#AA60C8', backgroundColor: '#FFDFEF', paddingVertical: 4, paddingHorizontal: 12, borderRadius: radius.full },
  closeModalText: { fontSize: 16, color: '#9E7FA9', paddingHorizontal: 6, fontWeight: '800' },
  supportiveNotice: { fontSize: 12, fontFamily: typography.bodyFont, color: '#AA60C8', fontWeight: '600', backgroundColor: '#FFDFEF', padding: 12, borderRadius: radius.md, marginBottom: 14, textAlign: 'center', borderWidth: 1, borderColor: '#EABDE6' },
  featuredVideoCont: {
    backgroundColor: '#FFF5FA',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: '#EABDE6',
    ...shadows.soft,
  },
  featuredVideoHeader: {
    fontSize: 11,
    fontFamily: typography.topicFont,
    fontWeight: '700',
    color: '#AA60C8',
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
    borderRadius: 10,
    marginRight: 12,
  },
  featuredVideoInfo: {
    flex: 1,
  },
  featuredVideoTitle: {
    fontSize: 13,
    fontFamily: typography.subTopicFont,
    fontWeight: '700',
    color: '#2C1A35',
    lineHeight: 18,
  },
  featuredVideoDesc: {
    fontSize: 11,
    fontFamily: typography.bodyFont,
    color: '#6A4D77',
    marginTop: 3,
    lineHeight: 15,
  },
  warningCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EABDE6',
    ...shadows.card,
  },
  warningIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  warningTitle: {
    fontSize: 18,
    fontFamily: typography.topicFont,
    fontWeight: '700',
    color: '#AA60C8',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 13,
    fontFamily: typography.bodyFont,
    color: '#6A4D77',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  warningBtn: {
    backgroundColor: '#AA60C8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.full,
    width: '100%',
    alignItems: 'center',
  },
  warningBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.subTopicFont,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default RecommendationsScreen;