// Exercise module thresholds used by the app. Backend equivalents live in
// backend/config/exerciseConfig.js; the reasoning is in docs/exercise-clinical-rules.md.
// frontend thresholds (80% watched = completed, 50% = stopped early, movement session completion rules).
// The backend copy is backend/config/exerciseConfig.js - keep both in sync.
export const WATCH_COMPLETE_PERCENT = 80;       // watching this much of a video completes it
export const LOW_ADHERENCE_PERCENT = 50;        // stopwatch time below this % of recommended = "stopped early"
export const TODO_VISIBLE_COUNT = 5;            // cards shown in the To Do tab at once
export const DAILY_GOAL = 3;                    // daily goal shown on the Today banner ("1 of 3")

// Movement tracking
export const MOVEMENT_COMPLETE_REPS = 5;        // this many reps completes a session...
export const MOVEMENT_MIN_REPS = 1;             // ...or at least this many reps...
export const MOVEMENT_MIN_SECONDS = 60;         // ...over at least this many seconds of tracking

// Watch history saving
export const WATCH_SAVE_INTERVAL_MS = 10 * 1000;     // save progress at most every 10 seconds
export const WATCH_NEW_SESSION_MS = 5 * 60 * 1000;   // a gap this long starts a new viewing session
