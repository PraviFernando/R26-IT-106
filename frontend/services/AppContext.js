// ================================================================
// APP CONTEXT — AppContext.js  (Bloom Complete)
// ================================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { analyzeDiary, getRecommendations } from './emotionEngine.js';
import { detectBabyTopic } from './babyCareService.js';
import api, { setAuthToken } from './api.js';
import { useAuth } from '../context/AuthContext';
import { normalizeReasonKey, normalizeEmotionKey, normalizeRiskLevel } from './activitiesLibrary.js';

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
  const { token } = useAuth();
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
  // ================================================================
  // GLOBAL PROGRESS TRACKING STATE
  // Manages global progress state (progressDiaries, progressActivities, epdsRiskLevel)
  // ================================================================
  const [completedActivities, setCompletedActivities] = useState([]);
  const [progressDiaries, setProgressDiaries] = useState([]);     // Stores historical diary logs for streaks & mood tracking
  const [progressActivities, setProgressActivities] = useState([]);  // Stores all completed activity history for badges & streaks
  const [epdsRiskLevel, setEpdsRiskLevel] = useState('low');      // Stores latest EPDS clinical screening risk level
  const [loadingProgress, setLoadingProgress] = useState(true);   // Tracks progress loading state
  const [errorProgress, setErrorProgress] = useState(null);       // Tracks progress fetch errors

  const [localRuleRecs, setLocalRuleRecs] = useState(null);
  const [isSkipped, setIsSkipped] = useState(false);
  const [showAssessment, setShowAssessment] = useState(true);

  React.useEffect(() => {
    if (latestAnalysis) {
      setShowAssessment(false);
      setLocalRuleRecs(null);
    }
  }, [latestAnalysis]);

  // Synchronize recommendations when clinical EPDS risk level updates
  // Safely re-evaluates recommendations from cached latestAnalysis without re-running diary classification
  useEffect(() => {
    if (latestAnalysis) {
      const normRisk = normalizeRiskLevel(epdsRiskLevel || 'low');
      if (latestAnalysis.riskLevel !== normRisk) {
        const updatedAnalysis = {
          ...latestAnalysis,
          riskLevel: normRisk,
        };
        const updatedRecs = getRecommendations(
          updatedAnalysis,
          userPreferredActivities,
          userPreferredGames,
          updatedAnalysis.diaryText || '',
          completedActivities
        );
        setLatestAnalysis(updatedAnalysis);
        setLatestRecommendations(updatedRecs);
      }
    }
  }, [epdsRiskLevel, userPreferredActivities, userPreferredGames, completedActivities]);

  /**
   * Defines fetchProgressData()
   * Fetches full diary history (GET /diary), activity completion history (GET /plan/activity/history),
   * and latest EPDS screening risk level (GET /epds/history) to populate progress metrics.
   */
  const fetchProgressData = useCallback(async () => {
    // Never hit authenticated endpoints before login — the request interceptor
    // has no token yet and the backend would just 401.
    if (!token) {
      setLoadingProgress(false);
      return;
    }
    try {
      setLoadingProgress(true);
      setErrorProgress(null);

      // 1. Fetch Diary History
      const diaryRes = await api.get('/diary');
      const diaries = diaryRes.data?.entries || [];

      // 2. Fetch Activity Completion History (All Time)
      const activityRes = await api.get('/plan/activity/history');
      const activities = activityRes.data || [];

      setProgressDiaries(diaries);
      setProgressActivities(activities);

      // 3. Fetch EPDS screening history for actual risk level
      try {
        const epdsRes = await api.get('/epds/history');
        if (epdsRes.data && epdsRes.data.length > 0) {
          const latestRisk = epdsRes.data[0].riskLevel || 'low';
          setEpdsRiskLevel(latestRisk.toLowerCase());
        } else {
          setEpdsRiskLevel('low');
        }
      } catch (epdsErr) {
        if (epdsErr.response?.status !== 404 && typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn('Notice fetching EPDS history for recommendations:', epdsErr.message);
        }
        setEpdsRiskLevel('low');
      }

      setLoadingProgress(false);
    } catch (err) {
      if (err.response?.status !== 404 && typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('Notice in fetchProgressData:', err.response?.status || err.message);
      }
      setErrorProgress('ප්‍රගති දත්ත ලබාගැනීමට අපොහොසත් විය. නැවත උත්සාහ කරන්න.');
      setLoadingProgress(false);
    }
  }, [token]);

  /**
   * Defines fetchCompletedActivities()
   * Fetches activities completed on today's date (GET /plan/activity/date/:date)
   */
  const fetchCompletedActivities = useCallback(async () => {
    if (!token) return [];
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
      if (err.response?.status !== 404 && typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('Notice fetching completed activities for ranking:', err.message);
      }
    }
    return [];
  }, [token]);

  useEffect(() => {
    if (!token) {
      // Logged out (or not yet logged in): clear any stale data and don't fetch.
      setProgressDiaries([]);
      setProgressActivities([]);
      setCompletedActivities([]);
      setLoadingProgress(false);
      setErrorProgress(null);
      return;
    }
    // Keep the axios interceptor in sync with the current session token.
    setAuthToken(token);
    fetchCompletedActivities();
    fetchProgressData();
  }, [token]);

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
      analysis.primaryReason = normalizeReasonKey(analysis.primaryReason);
      analysis.detectedEmotion = normalizeEmotionKey(analysis.detectedEmotion);
      analysis.selectedEmoji = selectedEmoji ? normalizeEmotionKey(selectedEmoji) : analysis.detectedEmotion;
      const diaryRisk = normalizeRiskLevel(analysis.riskLevel);
      const epdsRisk = epdsRiskLevel ? normalizeRiskLevel(epdsRiskLevel) : null;
      let effectiveRisk = 'low';
      if (epdsRisk) {
        // Authoritative EPDS risk takes precedence; extreme emergency crisis keywords can safely escalate to high
        effectiveRisk = (diaryRisk === 'high' && epdsRisk !== 'high') ? 'high' : epdsRisk;
      } else {
        effectiveRisk = diaryRisk || 'low';
      }
      analysis.riskLevel = effectiveRisk;

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
      analysis.mood = analysis.selectedEmoji
        ? (defaultEmotionEmojis[analysis.selectedEmoji] || analysis.selectedEmoji)
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
