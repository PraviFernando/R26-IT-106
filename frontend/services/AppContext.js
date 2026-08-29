// ================================================================
// APP CONTEXT — AppContext.js  (Bloom Complete)
// ================================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { analyzeDiary, getRecommendations } from './emotionEngine.js';
import { detectBabyTopic } from './babyCareService.js';
import api from './api.js';

const AppContext = createContext();

const DEMO_DIARIES = [
  "I feel so alone today. Nobody visits me and I miss having people around. The baby is fine but I feel empty inside.",
  "I am exhausted and overwhelmed. The baby won't sleep and I can't cope with everything. I feel like I'm failing.",
  "Today was a good day! Baby smiled at me and I felt a real connection. I feel more hopeful.",
  "I am so anxious about everything. My heart keeps racing and I worry something bad will happen to the baby.",
  "I don't feel connected to my baby. I try to bond but I feel nothing. I've lost all confidence.",
  "My body is in so much pain. My c-section recovery is really hard. I can't sleep and I feel hopeless.",
  "My husband doesn't help at all. My family isn't here either. I feel so unsupported and alone.",
];

const SI_DAYS = ['ඉරි', 'සඳු', 'අඟ', 'බදා', 'බ්‍රහ', 'සිකු', 'සෙන'];

const INITIAL_MOOD_HISTORY = [
  { day: 'සඳු', emotion: 'happy', risk: 'low', emoji: '😊', mood: '😊' },
  { day: 'අඟ', emotion: 'stressed', risk: 'medium', emoji: '😪', mood: '😪' },
  { day: 'බදා', emotion: 'happy', risk: 'low', emoji: '😊', mood: '😊' },
  { day: 'බ්‍රහ', emotion: 'stressed', risk: 'low', emoji: '😟', mood: '😟' },
  { day: 'සිකු', emotion: 'sad', risk: 'medium', emoji: '😔', mood: '😔' },
  { day: 'සෙන', emotion: 'happy', risk: 'low', emoji: '😊', mood: '😊' },
  { day: 'ඉරි', emotion: 'stressed', risk: 'low', emoji: '😌', mood: '😌' },
];

export const AppProvider = ({ children }) => {
  const [user] = useState({ name: 'සාරා', weekPostpartum: 6 });
  const [userPreferredActivities, setUserPreferredActivities] = useState([]);
  const [userPreferredGames, setUserPreferredGames] = useState([]);
  const [preferencesSet, setPreferencesSet] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [latestRecommendations, setLatestRecommendations] = useState(null);
  const [detectedBabyTopic, setDetectedBabyTopic] = useState(null);
  const [detectedBabyTopics, setDetectedBabyTopics] = useState([]);
  const [detectedBabyAge, setDetectedBabyAge] = useState(null);
  const [demoDiaryIdx, setDemoDiaryIdx] = useState(0);
  const [moodHistory, setMoodHistory] = useState(INITIAL_MOOD_HISTORY);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [progressDiaries, setProgressDiaries] = useState([]);
  const [progressActivities, setProgressActivities] = useState([]);
  const [epdsRiskLevel, setEpdsRiskLevel] = useState('low');
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [errorProgress, setErrorProgress] = useState(null);

  const [localRuleRecs, setLocalRuleRecs] = useState(null);
  const [isSkipped, setIsSkipped] = useState(false);
  const [showAssessment, setShowAssessment] = useState(true);

  React.useEffect(() => {
    if (latestAnalysis) {
      setShowAssessment(false);
      setLocalRuleRecs(null);
    }
  }, [latestAnalysis]);

  const fetchProgressData = async () => {
    try {
      setLoadingProgress(true);
      setErrorProgress(null);

      console.log('[DEBUG Progress] Starting fetchProgressData...');
      console.log('[DEBUG Progress] Axios baseURL:', api.defaults.baseURL);

      // 1. Fetch Diary History
      console.log('[DEBUG Progress] Requesting GET /diary ...');
      const diaryRes = await api.get('/diary');
      console.log('[DEBUG Progress] GET /diary SUCCESS:', diaryRes.status, 'entries count:', diaryRes.data?.entries?.length);
      const diaries = diaryRes.data?.entries || [];

      // 2. Fetch Activity Completion History (All Time)
      console.log('[DEBUG Progress] Requesting GET /plan/activity/history ...');
      const activityRes = await api.get('/plan/activity/history');
      console.log('[DEBUG Progress] GET /plan/activity/history SUCCESS:', activityRes.status, 'activities count:', activityRes.data?.length);
      const activities = activityRes.data || [];

      setProgressDiaries(diaries);
      setProgressActivities(activities);

      // 3. Fetch EPDS screening history for actual risk level
      try {
        console.log('[DEBUG Progress] Requesting GET /epds/history ...');
        const epdsRes = await api.get('/epds/history');
        console.log('[DEBUG Progress] GET /epds/history SUCCESS:', epdsRes.status, 'records count:', epdsRes.data?.length);
        if (epdsRes.data && epdsRes.data.length > 0) {
          const latestRisk = epdsRes.data[0].riskLevel || 'low';
          setEpdsRiskLevel(latestRisk.toLowerCase());
          console.log('[DEBUG Progress] epdsRiskLevel resolved in state to:', latestRisk);
        } else {
          setEpdsRiskLevel('low');
        }
      } catch (epdsErr) {
        console.log('Error fetching EPDS history for recommendations:', epdsErr.message);
        setEpdsRiskLevel('low');
      }

      setLoadingProgress(false);
    } catch (err) {
      console.error('[DEBUG Progress ERROR] Failed in fetchProgressData:');
      if (err.response) {
        console.error('  - Status:', err.response.status);
        console.error('  - URL:', err.config?.url);
        console.error('  - Headers:', JSON.stringify(err.config?.headers));
        console.error('  - Response Data:', JSON.stringify(err.response.data));
      } else {
        console.error('  - Error Message:', err.message);
        console.error('  - Config:', JSON.stringify(err.config));
      }
      setErrorProgress('ප්‍රගති දත්ත ලබාගැනීමට අපොහොසත් විය. නැවත උත්සාහ කරන්න.');
      setLoadingProgress(false);
    }
  };

  const fetchCompletedActivities = async () => {
    try {
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const res = await api.get(`/plan/activity/date/${todayStr}`);
      if (res.data) {
        const completed = res.data
          .filter(item => item.completed)
          .map(item => {
            const rawId = item.activityId;
            return rawId.replace(/_\d+$/, '');
          });
        setCompletedActivities(completed);
        return completed;
      }
    } catch (err) {
      console.log('Error fetching completed activities for ranking:', err.message);
    }
    return [];
  };

  useEffect(() => {
    fetchCompletedActivities();
    fetchProgressData();
  }, []);

  const updateMoodHistory = (analysis) => {
    if (!analysis) return;
    const todayDayName = SI_DAYS[new Date().getDay()];
    const defaultEmotionEmojis = {
      happy: '😊',
      sad: '😔',
      stressed: '😟'
    };
    const newEmoji = analysis.mood || analysis.emoji || defaultEmotionEmojis[analysis.detectedEmotion || analysis.emotion] || '😊';
    const newEmotion = analysis.detectedEmotion || analysis.emotion || 'stressed';
    const newRisk = analysis.riskLevel || 'low';

    setMoodHistory(prev => {
      const exists = prev.some(item => item.day === todayDayName);
      if (exists) {
        return prev.map(item => {
          if (item.day === todayDayName) {
            return {
              ...item,
              emotion: newEmotion,
              risk: newRisk,
              emoji: newEmoji,
              mood: newEmoji,
            };
          }
          return item;
        });
      }
      return [
        ...prev.slice(1),
        { day: todayDayName, emotion: newEmotion, risk: newRisk, emoji: newEmoji, mood: newEmoji }
      ];
    });
  };

  const processDiary = (diaryText, selectedEmoji = null) => {
    try {
      // Trigger background updates
      fetchCompletedActivities();
      fetchProgressData();
      const analysis = analyzeDiary(diaryText);
      analysis.diaryText = diaryText;
      analysis.selectedEmoji = selectedEmoji || null;
      const defaultEmotionEmojis = {
        happy: '😊',
        sad: '😔',
        crying: '😢',
        anxious: '😰',
        tired: '😪',
        angry: '😡',
        frustrated: '😞',
        sleepy: '😴',
        calm: '😌',
        stressed: '😟'
      };
      analysis.mood = selectedEmoji
        ? (defaultEmotionEmojis[selectedEmoji] || selectedEmoji)
        : (defaultEmotionEmojis[analysis.detectedEmotion] || '😊');

      // Detect Baby Care Topic using independent babyCareService
      const babyTopicRes = detectBabyTopic(diaryText);
      if (babyTopicRes && babyTopicRes.topics && babyTopicRes.topics.length > 0) {
        setDetectedBabyTopics(babyTopicRes.topics);
        setDetectedBabyTopic(babyTopicRes.topic || babyTopicRes.topics[0]);
      } else if (babyTopicRes && babyTopicRes.topic) {
        setDetectedBabyTopic(babyTopicRes.topic);
        setDetectedBabyTopics([babyTopicRes.topic]);
      } else {
        setDetectedBabyTopics([]);
        setDetectedBabyTopic(null);
      }

      // Override rule-based riskLevel with true stored EPDS riskLevel
      analysis.riskLevel = epdsRiskLevel;

      const recommendations = getRecommendations(analysis, userPreferredActivities, userPreferredGames, diaryText, completedActivities);
      setLatestAnalysis(analysis);
      setLatestRecommendations(recommendations);
      updateMoodHistory(analysis);
      return { analysis, recommendations, babyTopic: babyTopicRes };
    } catch (err) {
      console.error('processDiary error:', err);
      return null;
    }
  };

  const simulateNextDiary = () => {
    const next = (demoDiaryIdx + 1) % DEMO_DIARIES.length;
    setDemoDiaryIdx(next);
    return processDiary(DEMO_DIARIES[next]);
  };

  const savePreferences = (activities, games) => {
    setUserPreferredActivities(activities);
    setUserPreferredGames(games);
    setPreferencesSet(true);
  };

  const nextDemoPreview = DEMO_DIARIES[(demoDiaryIdx + 1) % DEMO_DIARIES.length];

  // Initial state: latestAnalysis remains null until diary is processed or assessment is run
  // useEffect(() => { processDiary(DEMO_DIARIES[0]); }, []);

  const setLatestData = (analysis, recommendations) => {
    setLatestAnalysis(analysis);
    setLatestRecommendations(recommendations);
    if (analysis) {
      updateMoodHistory(analysis);
    }
    fetchCompletedActivities();
    fetchProgressData();
  };

  return (
    <AppContext.Provider value={{
      user, userPreferredActivities, userPreferredGames,
      preferencesSet, savePreferences,
      latestAnalysis, latestRecommendations,
      detectedBabyTopic, setDetectedBabyTopic,
      detectedBabyTopics, setDetectedBabyTopics,
      detectedBabyAge, setDetectedBabyAge,
      moodHistory, processDiary, simulateNextDiary, nextDemoPreview, demoDiaryIdx,
      setLatestData,
      completedActivities, fetchCompletedActivities,
      progressDiaries, progressActivities, loadingProgress, errorProgress, fetchProgressData,
      epdsRiskLevel, setEpdsRiskLevel,
      localRuleRecs, setLocalRuleRecs,
      isSkipped, setIsSkipped,
      showAssessment, setShowAssessment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext) || {};
