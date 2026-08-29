// theme/index.js
import { Platform } from 'react-native';

export const colors = {
  // Primary Palette requested by user
  primary:       '#AA60C8', // Deep Soft Purple / Primary Accent
  primaryDark:   '#873CA6', // Darker shade for high contrast buttons & text
  secondary:     '#D69ADE', // Medium Pastel Purple
  accent:        '#EABDE6', // Light Lavender Border / Soft Pill
  bgTint:        '#FFDFEF', // Lightest Soft Pinkish Tint
  white:         '#FFFFFF',
  
  // Soft backgrounds
  screenBg:      '#FAF2FA', // Soft pale purple-pink screen background
  offWhite:      '#FFF0F7',
  cardBg:        '#FFFFFF',
  cardBorder:    '#F5D3EE',
  
  // Typography colors
  textPrimary:   '#2C1A35', // Deep plum for high contrast & elegance
  textSecondary: '#6A4D77', // Soft purple-gray for subtext
  textMuted:     '#9E7FA9', // Muted text
  textLight:     '#BCA4C6',
  textWhite:     '#FFFFFF',

  // Legacy compatibility mappings for existing screens
  lavender:      '#AA60C8',
  lavenderLight: '#FFDFEF',
  lavenderMid:   '#D69ADE',
  lavenderDark:  '#873CA6',
  rose:          '#EABDE6',
  roseLight:     '#FFDFEF',
  roseDark:      '#AA60C8',
  blush:         '#FFDFEF',
  mint:          '#D69ADE',
  mintLight:     '#FFDFEF',
  mintDark:      '#AA60C8',
  peach:         '#FFDFEF',
  sky:           '#EABDE6',
  skyLight:      '#FFDFEF',
  softGray:      '#F8EFF7',

  // Status colors
  riskLow:       '#E8F5E9',
  riskLowDark:   '#2E7D32',
  riskMedium:    '#FFF8E1',
  riskMediumDark:'#F57F17',
  riskHigh:      '#FFEBEE',
  riskHighDark:  '#C62828',
};

export const typography = {
  // Fonts: Poppins for topics (headers), Inter for subtopics & body text
  headerFont: Platform.select({
    web: "'Poppins', sans-serif",
    ios: 'Poppins_700Bold',
    android: 'Poppins_700Bold',
    default: 'Poppins_700Bold',
  }),
  topicFont: Platform.select({
    web: "'Poppins', sans-serif",
    ios: 'Poppins_600SemiBold',
    android: 'Poppins_600SemiBold',
    default: 'Poppins_600SemiBold',
  }),
  subTopicFont: Platform.select({
    web: "'Inter', sans-serif",
    ios: 'Inter_600SemiBold',
    android: 'Inter_600SemiBold',
    default: 'Inter_600SemiBold',
  }),
  bodyFont: Platform.select({
    web: "'Inter', sans-serif",
    ios: 'Inter_400Regular',
    android: 'Inter_400Regular',
    default: 'Inter_400Regular',
  }),
  mediumFont: Platform.select({
    web: "'Inter', sans-serif",
    ios: 'Inter_500Medium',
    android: 'Inter_500Medium',
    default: 'Inter_500Medium',
  }),
  boldFont: Platform.select({
    web: "'Inter', sans-serif",
    ios: 'Inter_700Bold',
    android: 'Inter_700Bold',
    default: 'Inter_700Bold',
  }),
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius  = { sm: 8, md: 16, lg: 24, xl: 32, full: 9999 };
export const shadows = {
  soft: { shadowColor: '#AA60C8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 3 },
  card: { shadowColor: '#873CA6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 5 },
  strong: { shadowColor: '#2C1A35', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 8 },
};

export default { colors, typography, spacing, radius, shadows };

