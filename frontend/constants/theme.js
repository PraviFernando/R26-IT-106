export const COLORS = {
    // Primary Brand Palette (#AA60C8, #D69ADE, #EABDE6, #FFDFEF, #FFFFFF)
    background: '#FAF2FA',           // Main Soft Light Purple Screen Background
    backgroundAlt: '#FFDFEF',        // Lightest Soft Pinkish Tint Background
    cardBg: '#FFFFFF',

    // Purple Brand Palette
    primary: '#AA60C8',              // Deep Soft Purple / Primary Accent
    primaryLight: '#FFDFEF',         // Soft Pill / Badge Background Tint
    primaryDark: '#873CA6',          // Dark Purple Header / Button
    accent: '#EABDE6',               // Soft Purple / Lavender Border Accent
    secondary: '#D69ADE',            // Medium Pastel Purple

    // Grid Card Pastel Colors
    cardGreen: '#E8F8EE',            // Mint / Green Tint
    cardPink: '#FFDFEF',             // Pink Tint
    cardCyan: '#EAF7FB',             // Soft Cyan
    cardYellow: '#FFFDF0',           // Soft Warm Yellow
    cardPurple: '#F5E6FB',           // Soft Lilac / Purple
    cardOrange: '#FFF2EB',           // Soft Peach
    cardBlue: '#EFF6FF',             // Soft Blue

    // Borders
    borderGreen: '#81C784',
    borderPink: '#EABDE6',
    borderCyan: '#80DEEA',
    borderYellow: '#FFE082',
    borderPurple: '#D69ADE',
    borderOrange: '#FFB74D',
    borderLight: '#F3D9F0',

    // Text
    textPrimary: '#2C1A35',
    textSecondary: '#6A4D77',
    textMuted: '#9E7FA9',
    textLight: '#BCA4C6',
    textWhite: '#FFFFFF',

    // Status
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    info: '#00BCD4',
};

export const SHADOWS = {
    card: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    button: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    }
};

export default { COLORS, SHADOWS };
