import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

// ─── Sinhala character rows ───────────────────────────────────────────────────
const ROWS = [
    // Vowels
    ['අ', 'ආ', 'ඇ', 'ඈ', 'ඉ', 'ඊ', 'උ', 'ඌ', 'එ', 'ඒ'],
    ['ඓ', 'ඔ', 'ඕ', 'ඖ', 'ං', 'ඃ', 'ා', 'ැ', 'ෑ', 'ි'],
    // Vowel diacritics
    ['ී', 'ු', 'ූ', 'ෘ', 'ෙ', 'ේ', 'ෛ', 'ො', 'ෝ', 'ෞ'],
    // Consonants row 1
    ['ක', 'ඛ', 'ග', 'ඝ', 'ඟ', 'ච', 'ඡ', 'ජ', 'ඣ', 'ඤ'],
    // Consonants row 2
    ['ට', 'ඨ', 'ඩ', 'ඪ', 'ණ', 'ත', 'ථ', 'ද', 'ධ', 'න'],
    // Consonants row 3
    ['ප', 'ඵ', 'බ', 'භ', 'ම', 'ය', 'ර', 'ල', 'ව', 'ශ'],
    // Consonants row 4
    ['ෂ', 'ස', 'හ', 'ළ', 'ෆ', 'ඥ', 'ඦ', 'ඬ', 'ඳ', 'ඹ'],
    // Hal kirima & zero-width joiner helpers
    ['්', '්‍ර', 'ි', 'ී', '‍', '‍'],
];

const PAD = 16; // container padding (must match styles.container)
const GAP = 4;
const COLS = 10;
const MIN_KEY = 26;
const MAX_KEY = 44;

export default function SinhalaKeyboard({ onKeyPress, onClose }) {
    const r = useResponsive();
    // Size keys from the ACTUAL rendered container width (it lives inside modals /
    // panels that are narrower than the window), not a module-level Dimensions read.
    const [boxW, setBoxW] = useState(0);

    const usable = boxW > 0 ? boxW - PAD * 2 - GAP * (COLS - 1) : 0;
    const keyW = usable > 0
        ? Math.max(MIN_KEY, Math.min(MAX_KEY, Math.floor(usable / COLS)))
        : 30;
    const keyH = Math.max(34, keyW);

    const keyStyle = { width: keyW, height: keyH };
    const spaceStyle = { width: keyW * 5 + GAP * 4 };
    const backspaceStyle = { width: keyW * 4 + GAP * 3 };

    return (
        <View
            style={[styles.container, { maxHeight: Math.min(r.height * 0.42, 340) }]}
            onLayout={(e) => setBoxW(e.nativeEvent.layout.width)}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>⌨️ සිංහල යතුරු පුවරුව</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={styles.closeText}>✕ Close</Text>
                </TouchableOpacity>
            </View>

            {/* Key rows */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
            >
                {ROWS.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.row}>
                        {row.map((char, i) => (
                            <TouchableOpacity
                                key={`${rowIdx}-${i}`}
                                style={[styles.key, keyStyle]}
                                onPress={() => onKeyPress(char)}
                                activeOpacity={0.6}
                            >
                                <Text style={styles.keyText}>{char}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                {/* Bottom row: Space & Backspace */}
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.key, keyStyle, styles.spaceKey, spaceStyle]}
                        onPress={() => onKeyPress('SPACE')}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.specialKeyText}>Space</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.key, keyStyle, styles.backspaceKey, backspaceStyle]}
                        onPress={() => onKeyPress('BACKSPACE')}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.specialKeyText}>⌫</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#DDE3ED',
        borderRadius: 16,
        padding: PAD,
        marginTop: 10,
        width: '100%',
        maxWidth: 520,
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1F2937',
    },
    closeBtn: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    closeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: GAP,
        marginBottom: GAP,
    },
    key: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
    },
    spaceKey: {
        backgroundColor: '#E0E7FF',
    },
    backspaceKey: {
        backgroundColor: '#FEE2E2',
    },
    keyText: {
        fontSize: 16,
        color: '#111827',
        includeFontPadding: false,
    },
    specialKeyText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
});
