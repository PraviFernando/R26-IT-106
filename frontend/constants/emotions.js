// Shared Emotion Constants — One Source of Truth across Quick Response Popup & Diary Screen
export const EMOTION_OPTIONS = [
  { key: 'happy', emoji: '😊', label: 'සතුටින් — Happy', labelSi: 'සතුටින්', labelEn: 'Happy' },
  { key: 'sad', emoji: '😔', label: 'දුකින් — Sad', labelSi: 'දුකින්', labelEn: 'Sad' },
  { key: 'crying', emoji: '😢', label: 'අඬන්න හිතෙනවා — Feeling like crying', labelSi: 'අඬන්න හිතෙනවා', labelEn: 'Feeling like crying' },
  { key: 'anxious', emoji: '😰', label: 'කනස්සල්ලෙන් — Anxious', labelSi: 'කනස්සල්ලෙන්', labelEn: 'Anxious' },
  { key: 'tired', emoji: '😪', label: 'මහන්සියි — Tired', labelSi: 'මහන්සියි', labelEn: 'Tired' },
  { key: 'angry', emoji: '😡', label: 'කෝපයෙන් — Angry', labelSi: 'කෝපයෙන්', labelEn: 'Angry' },
  { key: 'frustrated', emoji: '😞', label: 'කලකිරීමෙන් — Frustrated', labelSi: 'කලකිරීමෙන්', labelEn: 'Frustrated' },
  { key: 'sleepy', emoji: '😴', label: 'නිදිමතයි — Sleepy', labelSi: 'නිදිමතයි', labelEn: 'Sleepy' },
  { key: 'calm', emoji: '😌', label: 'සන්සුන් — Calm', labelSi: 'සන්සුන්', labelEn: 'Calm' },
];

export const EMOTION_CFG = {
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
