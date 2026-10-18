// ================================================================
// DASHBOARD DESIGN TOKENS — dashboardTokens.js
// Visual source of truth extracted from DashboardScreen.js
// Used to align Personalized Emotional Support Recommendation System screens
// ================================================================

import { Platform, StyleSheet } from 'react-native';
import { typography } from './index';

export { typography };

export const DASHBOARD_PALETTE = {
  // Primary brand palette
  primary: '#AA60C8',       // Soft muted purple
  primaryDark: '#873CA6',   // Deep purple for primary buttons & active states
  secondary: '#D69ADE',     // Medium pastel purple
  accent: '#EABDE6',        // Soft lavender accent / borders
  
  // Backgrounds
  bg: '#FBF8F6',            // Warm off-white main background
  side: '#FDFBFA',          // Ultra-pale card/sidebar background
  card: '#FFFFFF',          // Clean white card background
  
  // Dividers & Borders
  line: '#EFE4EE',          // Primary light border with subtle contrast
  line2: '#F2EAF1',         // Secondary soft divider
  border: '#EFE4EE',        // Standard card border
  borderSubtle: '#EFE4EE',  // Standard card border
  borderLight: '#F6EFF7',   // Light inner divider
  
  // Soft Accents
  lav: '#F5E6FB',           // Soft lavender tint (chips, hero, active badges)
  lavText: '#873CA6',       // Lavender contrasting text
  blush: '#FFE9F1',         // Gentle blush pink tint
  blushLine: '#F4C6D7',     // Blush border
  blushText: '#9A3F62',     // Blush contrasting text
  sage: '#E7F1EA',          // Soft sage green tint (wellness / low risk)
  sageLine: '#CBE2D1',      // Sage border
  sageText: '#3F6B4E',      // Sage contrasting text
  warmYellow: '#FFF9E6',    // Soft amber tint (medium risk)
  warmYellowLine: '#FDE3A7',// Amber border
  warmYellowText: '#B7791F',// Amber text
  
  // Notes / Highlights
  note: '#FFF7FA',          // Subtle blush-tinted note background
  noteLine: '#F6DCE8',      // Note border
  
  // Typography Colors
  text: '#2C1A35',          // Dark plum / deep brown-purple primary text
  textDark: '#2C1A35',      // Alias for primary text
  muted: '#8A7392',         // Muted mauve-grey secondary text
  textMuted: '#8A7392',     // Alias for muted text
  sageDark: '#3F6B4E',      // Dark sage text for tags
  nav: '#5B4763',           // Navigation / subtle dark text
  sec: '#A894AE',           // Tertiary label text
  white: '#FFFFFF',
};

export const SERIF = Platform.select({
  web: "Georgia, 'Times New Roman', serif",
  ios: 'Georgia',
  default: 'serif',
});

export const DASHBOARD_SHADOWS = {
  card: {
    shadowColor: '#AA60C8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  soft: {
    shadowColor: '#2C1A35',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  none: {
    shadowOpacity: 0,
    elevation: 0,
  },
};

export const commonStyles = StyleSheet.create({
  screenBg: {
    flex: 1,
    backgroundColor: DASHBOARD_PALETTE.bg,
  },
  card: {
    backgroundColor: DASHBOARD_PALETTE.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: DASHBOARD_PALETTE.line,
    padding: 16,
    ...DASHBOARD_SHADOWS.card,
  },
  pillBtnSolid: {
    backgroundColor: DASHBOARD_PALETTE.primaryDark,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnSolidText: {
    color: '#FFFFFF',
    fontFamily: typography.mediumFont,
    fontSize: 14,
    fontWeight: '600',
  },
  pillBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DASHBOARD_PALETTE.line,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnOutlineText: {
    color: DASHBOARD_PALETTE.primaryDark,
    fontFamily: typography.mediumFont,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default {
  PALETTE: DASHBOARD_PALETTE,
  SERIF,
  SHADOWS: DASHBOARD_SHADOWS,
  commonStyles,
};
