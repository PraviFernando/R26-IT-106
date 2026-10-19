import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
    Modal,
} from 'react-native';

// ─── Palette ──────────────────────────────────────────────────────────────────
const BLUE   = '#3B82F6';
const BLUE_L = '#DBEAFE';
const BLUE_M = '#93C5FD';

const GREEN  = '#10B981';
const GREEN_L = '#D1FAE5';
const GREEN_M = '#6EE7B7';

const PINK   = '#EC4899';
const PINK_L = '#FCE7F3';
const PINK_M = '#F9A8D4';

const PURPLE   = '#7C3AED';
const PURPLE_L = '#EDE9FE';

const TEAL   = '#14B8A6';
const TEAL_L = '#CCFBF1';

const AMBER  = '#F59E0B';
const AMBER_L = '#FEF3C7';

const GRAY_50  = '#F9FAFB';
const GRAY_100 = '#F3F4F6';
const GRAY_200 = '#E5E7EB';
const GRAY_400 = '#9CA3AF';
const GRAY_600 = '#4B5563';
const GRAY_800 = '#1F2937';

// ─── Filter Data ──────────────────────────────────────────────────────────────
const FILTER_CATEGORIES = [
    {
        id: 'baby_care',
        label: 'Baby Care',
        icon: '👶',
        color: BLUE,
        colorLight: BLUE_L,
        colorMid: BLUE_M,
        items: [
            { id: 'growth_chart',    label: 'Growth Chart',    icon: '📈' },
            { id: 'baby_feeding',    label: 'Baby Feeding Guide', icon: '🍼' },
            { id: 'newborn_care',    label: 'Newborn Care',    icon: '🌱' },
            { id: 'baby_sleep',      label: 'Baby Sleep',      icon: '😴' },
            { id: 'baby_milestones', label: 'Baby Milestones', icon: '🏆' },
        ],
    },
    {
        id: 'maternal_wellbeing',
        label: 'Maternal Wellbeing',
        icon: '🌸',
        color: PINK,
        colorLight: PINK_L,
        colorMid: PINK_M,
        items: [
            { id: 'baby_blues',            label: 'Baby Blues',            icon: '💙' },
            { id: 'postpartum_depression', label: 'Postpartum Depression', icon: '💜' },
            { id: 'anxiety',               label: 'Anxiety',               icon: '🧘' },
            { id: 'self_care',             label: 'Self-Care',             icon: '💆' },
        ],
    },
    {
        id: 'feeding',
        label: 'Feeding',
        icon: '🍼',
        color: GREEN,
        colorLight: GREEN_L,
        colorMid: GREEN_M,
        items: [
            { id: 'breastfeeding',    label: 'Breastfeeding',    icon: '🤱' },
            { id: 'formula_feeding',  label: 'Formula Feeding',  icon: '🧪' },
            { id: 'feeding_problems', label: 'Feeding Problems',  icon: '⚠️' },
        ],
    },
    {
        id: 'recovery',
        label: 'Recovery',
        icon: '💪',
        color: TEAL,
        colorLight: TEAL_L,
        colorMid: '#5EEAD4',
        items: [
            { id: 'nutrition',            label: 'Nutrition',            icon: '🥗' },
            { id: 'exercise',             label: 'Exercise',             icon: '🏃' },
            { id: 'postpartum_recovery',  label: 'Postpartum Recovery',  icon: '🌿' },
        ],
    },
    {
        id: 'helpful_tools',
        label: 'Helpful Tools',
        icon: '🛠️',
        color: AMBER,
        colorLight: AMBER_L,
        colorMid: '#FCD34D',
        items: [
            { id: 'mood_tracker',        label: 'Mood Tracker',        icon: '😊' },
            { id: 'growth_calculator',   label: 'Growth Calculator',   icon: '📏' },
            { id: 'feeding_calculator',  label: 'Feeding Calculator',  icon: '🧮' },
        ],
    },
];

// ─── Collapsible Section ──────────────────────────────────────────────────────
function CollapsibleSection({ category, selectedItems, onToggleItem, isExpanded, onToggleExpand }) {
    const animHeight = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
    const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

    const itemCount = category.items.length;
    // Approximate height: each item is ~44px, plus 12px padding-bottom
    const expandedHeight = itemCount * 44 + 12;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(animHeight, {
                toValue: isExpanded ? 1 : 0,
                useNativeDriver: false,
                friction: 8,
                tension: 80,
            }),
            Animated.timing(rotateAnim, {
                toValue: isExpanded ? 1 : 0,
                duration: 250,
                useNativeDriver: false,
            }),
        ]).start();
    }, [isExpanded]);

    const heightInterp = animHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, expandedHeight],
    });

    const rotateInterp = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const selectedCount = category.items.filter(i => selectedItems.has(i.id)).length;

    return (
        <View style={[sStyles.section, { borderLeftColor: category.color, borderLeftWidth: 3 }]}>
            {/* Section Header */}
            <TouchableOpacity
                style={sStyles.sectionHeader}
                onPress={onToggleExpand}
                activeOpacity={0.75}
            >
                <View style={[sStyles.sectionIconWrap, { backgroundColor: category.colorLight }]}>
                    <Text style={sStyles.sectionIcon}>{category.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[sStyles.sectionLabel, { color: GRAY_800 }]}>{category.label}</Text>
                    {selectedCount > 0 && (
                        <Text style={[sStyles.sectionCount, { color: category.color }]}>
                            {selectedCount} selected
                        </Text>
                    )}
                </View>
                {selectedCount > 0 && (
                    <View style={[sStyles.countBadge, { backgroundColor: category.colorLight }]}>
                        <Text style={[sStyles.countBadgeText, { color: category.color }]}>
                            {selectedCount}
                        </Text>
                    </View>
                )}
                <Animated.Text style={[sStyles.chevron, { transform: [{ rotate: rotateInterp }], color: category.color }]}>
                    ▼
                </Animated.Text>
            </TouchableOpacity>

            {/* Items */}
            <Animated.View style={[sStyles.itemsList, { height: heightInterp, overflow: 'hidden' }]}>
                {category.items.map((item) => {
                    const isSelected = selectedItems.has(item.id);
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                sStyles.filterItem,
                                isSelected && { backgroundColor: category.colorLight },
                            ]}
                            onPress={() => onToggleItem(item.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={sStyles.filterItemIcon}>{item.icon}</Text>
                            <Text style={[
                                sStyles.filterItemLabel,
                                isSelected && { color: category.color, fontWeight: '700' },
                            ]}>
                                {item.label}
                            </Text>
                            {isSelected && (
                                <View style={[sStyles.checkMark, { backgroundColor: category.color }]}>
                                    <Text style={sStyles.checkMarkText}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </Animated.View>
        </View>
    );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────
function FilterChip({ label, icon, color, colorLight, onRemove }) {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: false,
            friction: 6,
        }).start();
    }, []);

    return (
        <Animated.View style={[chipStyles.chip, { backgroundColor: colorLight, transform: [{ scale: scaleAnim }] }]}>
            <Text style={chipStyles.chipIcon}>{icon}</Text>
            <Text style={[chipStyles.chipLabel, { color }]} numberOfLines={1}>{label}</Text>
            <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                <Text style={[chipStyles.chipRemove, { color }]}>✕</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Main Sidebar Component ───────────────────────────────────────────────────
export default function FilterSidebar({
    visible,
    onClose,
    onApply,
    onClear,
    initialSelected = new Set(),
}) {
    const [search, setSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set(initialSelected));
    const [expandedSections, setExpandedSections] = useState(new Set(['baby_care', 'maternal_wellbeing']));

    const slideAnim = useRef(new Animated.Value(-360)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    // Reset when opened
    useEffect(() => {
        if (visible) {
            setSelectedItems(new Set(initialSelected));
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: false,
                    friction: 8,
                    tension: 65,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -360,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    }, [visible]);

    const toggleItem = useCallback((itemId) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) next.delete(itemId);
            else next.add(itemId);
            return next;
        });
    }, []);

    const toggleSection = useCallback((sectionId) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(sectionId)) next.delete(sectionId);
            else next.add(sectionId);
            return next;
        });
    }, []);

    const handleClear = () => {
        setSelectedItems(new Set());
        setSearch('');
        if (onClear) onClear();
    };

    const handleApply = () => {
        if (onApply) onApply(selectedItems);
        onClose();
    };

    // Filter categories by search
    const filteredCategories = search.trim()
        ? FILTER_CATEGORIES.map(cat => ({
            ...cat,
            items: cat.items.filter(item =>
                item.label.toLowerCase().includes(search.toLowerCase())
            ),
        })).filter(cat => cat.items.length > 0 || cat.label.toLowerCase().includes(search.toLowerCase()))
        : FILTER_CATEGORIES;

    // Build selected chips
    const selectedChips = [];
    FILTER_CATEGORIES.forEach(cat => {
        cat.items.forEach(item => {
            if (selectedItems.has(item.id)) {
                selectedChips.push({ ...item, categoryColor: cat.color, categoryColorLight: cat.colorLight });
            }
        });
    });

    const totalSelected = selectedItems.size;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                {/* Backdrop */}
                <Animated.View
                    style={[styles.backdrop, { opacity: backdropAnim }]}
                >
                    <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
                </Animated.View>

                {/* Sidebar Panel */}
                <Animated.View style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}>
                    {/* ── Panel Header ── */}
                    <View style={styles.panelHeader}>
                        <View style={styles.panelHeaderLeft}>
                            <View style={styles.panelIconWrap}>
                                <Text style={styles.panelIcon}>🔍</Text>
                            </View>
                            <View>
                                <Text style={styles.panelTitle}>Filters</Text>
                                <Text style={styles.panelSubtitle}>
                                    {totalSelected > 0 ? `${totalSelected} active` : 'Refine your view'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Gradient divider */}
                    <View style={styles.headerDivider}>
                        <View style={[styles.dividerSegment, { backgroundColor: BLUE_M }]} />
                        <View style={[styles.dividerSegment, { backgroundColor: GREEN_M }]} />
                        <View style={[styles.dividerSegment, { backgroundColor: PINK_M }]} />
                        <View style={[styles.dividerSegment, { backgroundColor: '#FCD34D' }]} />
                        <View style={[styles.dividerSegment, { backgroundColor: '#5EEAD4' }]} />
                    </View>

                    {/* ── Search Bar ── */}
                    <View style={styles.searchContainer}>
                        <Text style={styles.searchIcon}>🔎</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search filters..."
                            placeholderTextColor={GRAY_400}
                            value={search}
                            onChangeText={setSearch}
                            returnKeyType="search"
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear}>
                                <Text style={styles.searchClearText}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── Active Chips ── */}
                    {selectedChips.length > 0 && (
                        <View style={styles.chipsSection}>
                            <View style={styles.chipsSectionHeader}>
                                <Text style={styles.chipsSectionTitle}>Active Filters</Text>
                                <TouchableOpacity onPress={handleClear}>
                                    <Text style={styles.clearAllText}>Clear All</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipsRow}
                            >
                                {selectedChips.map(chip => (
                                    <FilterChip
                                        key={chip.id}
                                        label={chip.label}
                                        icon={chip.icon}
                                        color={chip.categoryColor}
                                        colorLight={chip.categoryColorLight}
                                        onRemove={() => toggleItem(chip.id)}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* ── Scrollable Filter Sections ── */}
                    <ScrollView
                        style={styles.sectionsScroll}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.sectionsContent}
                    >
                        {filteredCategories.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>🔍</Text>
                                <Text style={styles.emptyText}>No filters match "{search}"</Text>
                            </View>
                        ) : (
                            filteredCategories.map(category => (
                                <CollapsibleSection
                                    key={category.id}
                                    category={category}
                                    selectedItems={selectedItems}
                                    onToggleItem={toggleItem}
                                    isExpanded={expandedSections.has(category.id) || search.trim().length > 0}
                                    onToggleExpand={() => toggleSection(category.id)}
                                />
                            ))
                        )}
                        <View style={{ height: 24 }} />
                    </ScrollView>

                    {/* ── Action Buttons ── */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.75}>
                            <Text style={styles.clearBtnText}>Clear</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.applyBtn, totalSelected === 0 && styles.applyBtnDisabled]}
                            onPress={handleApply}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.applyBtnText}>
                                Apply{totalSelected > 0 ? ` (${totalSelected})` : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

// ─── Filter Trigger Button (exported for use in parent screens) ───────────────
export function FilterTriggerButton({ onPress, activeCount = 0 }) {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (activeCount > 0) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: false }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [activeCount]);

    return (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
                style={[
                    triggerStyles.btn,
                    activeCount > 0 && triggerStyles.btnActive,
                ]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Text style={triggerStyles.btnIcon}>⚙️</Text>
                <Text style={[triggerStyles.btnLabel, activeCount > 0 && { color: '#fff' }]}>
                    Filters
                </Text>
                {activeCount > 0 && (
                    <View style={triggerStyles.badge}>
                        <Text style={triggerStyles.badgeText}>{activeCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(340, SCREEN_W * 0.88);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
    },
    panel: {
        width: PANEL_WIDTH,
        backgroundColor: '#fff',
        flex: 1,
        elevation: 24,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        // Glassmorphism-lite: white + slight blue tint
        borderRightWidth: 1,
        borderRightColor: GRAY_200,
    },

    // Header
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingTop: Platform.OS === 'ios' ? 54 : 18,
        paddingBottom: 14,
        backgroundColor: '#fff',
    },
    panelHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    panelIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: BLUE_L,
        alignItems: 'center',
        justifyContent: 'center',
    },
    panelIcon: { fontSize: 20 },
    panelTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: GRAY_800,
        letterSpacing: 0.3,
    },
    panelSubtitle: {
        fontSize: 12,
        color: GRAY_400,
        marginTop: 1,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: GRAY_100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        fontSize: 14,
        color: GRAY_600,
        fontWeight: '700',
    },

    // Gradient divider
    headerDivider: {
        flexDirection: 'row',
        height: 4,
        marginHorizontal: 0,
    },
    dividerSegment: {
        flex: 1,
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: GRAY_50,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: GRAY_200,
        marginHorizontal: 16,
        marginTop: 14,
        marginBottom: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    searchIcon: { fontSize: 16 },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: GRAY_800,
        paddingVertical: 2,
    },
    searchClear: {
        padding: 4,
    },
    searchClearText: {
        fontSize: 12,
        color: GRAY_400,
        fontWeight: '700',
    },

    // Chips
    chipsSection: {
        marginTop: 10,
        marginHorizontal: 16,
    },
    chipsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    chipsSectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: GRAY_600,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    clearAllText: {
        fontSize: 12,
        color: BLUE,
        fontWeight: '700',
    },
    chipsRow: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 4,
    },

    // Sections scroll
    sectionsScroll: {
        flex: 1,
        marginTop: 8,
    },
    sectionsContent: {
        paddingHorizontal: 12,
        paddingTop: 4,
    },

    // Empty
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: { fontSize: 32, marginBottom: 8 },
    emptyText: { fontSize: 14, color: GRAY_400, textAlign: 'center' },

    // Actions
    actions: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: GRAY_200,
        backgroundColor: '#fff',
    },
    clearBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: GRAY_200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: GRAY_600,
    },
    applyBtn: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: BLUE,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    applyBtnDisabled: {
        backgroundColor: BLUE_M,
        shadowOpacity: 0,
        elevation: 0,
    },
    applyBtnText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.2,
    },
});

// Section styles
const sStyles = StyleSheet.create({
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 10,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 13,
        gap: 10,
    },
    sectionIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionIcon: { fontSize: 18 },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    sectionCount: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 1,
    },
    countBadge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 22,
        alignItems: 'center',
    },
    countBadgeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    chevron: {
        fontSize: 10,
        fontWeight: '700',
    },
    itemsList: {
        paddingHorizontal: 12,
    },
    filterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 3,
        gap: 8,
    },
    filterItemIcon: { fontSize: 16, width: 22, textAlign: 'center' },
    filterItemLabel: {
        flex: 1,
        fontSize: 13,
        color: GRAY_600,
        fontWeight: '500',
    },
    checkMark: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkMarkText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
    },
});

// Chip styles
const chipStyles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 4,
        maxWidth: 150,
    },
    chipIcon: { fontSize: 12 },
    chipLabel: {
        fontSize: 12,
        fontWeight: '700',
        flexShrink: 1,
    },
    chipRemove: {
        fontSize: 11,
        fontWeight: '900',
        marginLeft: 2,
    },
});

// Trigger button styles
const triggerStyles = StyleSheet.create({
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: GRAY_100,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 5,
        borderWidth: 1.5,
        borderColor: GRAY_200,
    },
    btnActive: {
        backgroundColor: BLUE,
        borderColor: BLUE,
    },
    btnIcon: { fontSize: 14 },
    btnLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: GRAY_600,
    },
    badge: {
        backgroundColor: '#fff',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 2,
        paddingHorizontal: 3,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: BLUE,
    },
});
