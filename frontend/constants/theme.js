export const COLORS = {
    // Light Purple Primary Theme
    background: '#F4F0FF',           // Main Soft Light Purple Screen Background
    backgroundAlt: '#EBE5FF',        // Slightly deeper light purple
    cardBg: '#FFFFFF',

    // Purple Brand Palette
    primary: '#7C3AED',              // Deep Purple
    primaryLight: '#F3E8FF',         // Light Lavender Pill / Badge
    primaryDark: '#5B21B6',          // Dark Purple Header
    accent: '#A78BFA',               // Soft Purple

    // Grid Card Pastel Colors (like the modern App Store category cards in user's image)
    cardGreen: '#D1FAE5',            // Mint / Green
    cardPink: '#FCE7F3',             // Pink / Rose
    cardCyan: '#CFFAFE',             // Cyan / Aqua
    cardYellow: '#FEF3C7',           // Yellow / Amber
    cardPurple: '#EDE9FE',           // Soft Purple
    cardOrange: '#FFEDD5',           // Soft Peach / Orange
    cardBlue: '#E0F2FE',             // Sky Blue

    // Borders
    borderGreen: '#34D399',
    borderPink: '#F472B6',
    borderCyan: '#22D3EE',
    borderYellow: '#FBBF24',
    borderPurple: '#C4B5FD',
    borderOrange: '#FB923C',
    borderLight: '#E5E7EB',

    // Text
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    textLight: '#9CA3AF',
    textWhite: '#FFFFFF',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
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
