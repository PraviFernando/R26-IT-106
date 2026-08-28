import { useState, useRef, useCallback } from 'react';
import api from '../services/api';

/**
 * Global helper to record an activity/game session to backend POST /plan/activity
 */
export const recordActivityApi = async ({
  activityId,
  activityName,
  icon,
  completed,
  duration,
  note = ''
}) => {
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const hour = d.getHours();
  let timeOfDay = 'Night';
  if (hour >= 5 && hour < 12) timeOfDay = 'Morning';
  else if (hour >= 12 && hour < 15) timeOfDay = 'Midday';
  else if (hour >= 15 && hour < 19) timeOfDay = 'Afternoon';

  try {
    await api.post('/plan/activity', {
      date: dateStr,
      activityId,
      activityName,
      timeOfDay,
      icon,
      completed,
      timerSeconds: Math.max(1, duration),
      isCustom: false,
      note
    });
  } catch (err) {
    console.error(`[gameSession] Error saving activity session ${activityId}:`, err);
  }
};

/**
 * Reusable hook for game/activity session lifecycle management
 */
export const useGameSession = ({
  gameId,
  gameName,
  icon,
  onGoBack
}) => {
  const [showCompletion, setShowCompletion] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());
  const hasSavedSessionRef = useRef(false);
  const currentStartTimeRef = useRef(Date.now());

  // Reset and start a brand new game session
  const startNewSession = useCallback(() => {
    const now = Date.now();
    currentStartTimeRef.current = now;
    setStartTime(now);
    hasSavedSessionRef.current = false;
    setShowCompletion(false);
  }, []);

  // Save session record once (guard against duplicate calls)
  const recordSession = useCallback(async (isCompleted, note = '') => {
    if (hasSavedSessionRef.current) return;
    hasSavedSessionRef.current = true;

    const start = currentStartTimeRef.current || Date.now();
    const duration = Math.max(1, Math.round((Date.now() - start) / 1000));
    const uniqueActivityId = `${gameId}_${start}`;

    await recordActivityApi({
      activityId: uniqueActivityId,
      activityName: gameName || gameId,
      icon: icon || '🎮',
      completed: isCompleted,
      duration,
      note
    });
  }, [gameId, gameName, icon]);

  // Called when a game is successfully completed
  const triggerComplete = useCallback((note = '', delayMs = 350) => {
    recordSession(true, note);
    if (delayMs > 0) {
      setTimeout(() => setShowCompletion(true), delayMs);
    } else {
      setShowCompletion(true);
    }
  }, [recordSession]);

  // Called when user clicks "← ආපසු" / Back button during gameplay
  const handleBack = useCallback((cleanupFn) => {
    if (cleanupFn && typeof cleanupFn === 'function') {
      cleanupFn();
    }
    if (!hasSavedSessionRef.current) {
      recordSession(false, 'ආපසු ගියා (Incomplete)');
    }
    setShowCompletion(false);
    if (onGoBack) {
      onGoBack();
    }
  }, [recordSession, onGoBack]);

  // Called when user clicks "Play Again" in completion popup
  const handlePlayAgain = useCallback((resetGameFn) => {
    setShowCompletion(false);
    if (resetGameFn && typeof resetGameFn === 'function') {
      resetGameFn();
    }
    startNewSession();
  }, [startNewSession]);

  // Called when user clicks "Close" in completion popup
  const handleClose = useCallback(() => {
    setShowCompletion(false);
    if (onGoBack) {
      onGoBack();
    }
  }, [onGoBack]);

  return {
    startTime,
    showCompletion,
    setShowCompletion,
    startNewSession,
    recordSession,
    triggerComplete,
    handleBack,
    handlePlayAgain,
    handleClose,
    hasSavedSessionRef
  };
};

export default useGameSession;
