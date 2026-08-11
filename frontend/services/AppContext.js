// ================================================================
// APP CONTEXT — AppContext.js  (Bloom Complete)
// ================================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { analyzeDiary, getRecommendations } from './emotionEngine';
import { detectBabyTopic } from './babyCareService';

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

  const processDiary = (diaryText) => {
    try {
      const analysis = analyzeDiary(diaryText);
      const defaultEmotionEmojis = {
        happy: '😊',
        sad: '😔',
        stressed: '😟'
      };
      analysis.mood = defaultEmotionEmojis[analysis.detectedEmotion] || '😊';

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

      const recommendations = getRecommendations(analysis, userPreferredActivities, userPreferredGames);
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

  useEffect(() => { processDiary(DEMO_DIARIES[0]); }, []);

  const setLatestData = (analysis, recommendations) => {
    setLatestAnalysis(analysis);
    setLatestRecommendations(recommendations);
    if (analysis) {
      updateMoodHistory(analysis);
    }
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
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
