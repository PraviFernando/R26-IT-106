// ================================================================
// BABY CARE INTENT DETECTION SERVICE
// Re-exports enhanced multi-topic detection engine from babyCareService
// ================================================================
import { detectBabyTopics, detectBabyTopic, BABY_TOPIC_CATEGORIES } from './babyCareService.js';

export const BABY_TOPICS = BABY_TOPIC_CATEGORIES;

export { detectBabyTopics, detectBabyTopic };
export default detectBabyTopics;
