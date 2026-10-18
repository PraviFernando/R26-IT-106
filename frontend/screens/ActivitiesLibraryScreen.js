// ================================================================
// ACTIVITIES LIBRARY SCREEN — ActivitiesLibraryScreen.js
// Dedicated, categorized activities library for PeriCare
// Displays all 41 unique, verified activities
// ================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows, typography } from '../theme';
import { DASHBOARD_PALETTE as DP, SERIF, DASHBOARD_SHADOWS as DS } from '../theme/dashboardTokens';
import { useResponsive } from '../hooks/useResponsive';
import ScreenContainer from '../components/ScreenContainer';
import {
  ACTIVITY_CATEGORIES,
  getAllActivitiesCatalog,
} from '../services/activitiesLibrary';

const ActivitiesLibraryScreen = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isSinhala = i18n?.language === 'si';
  const { scale } = useResponsive();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // All catalog activities (all 41 verified unique activities)
  const catalog = useMemo(() => getAllActivitiesCatalog(), []);

  // Filtered activities by category and search query
  const filteredActivities = useMemo(() => {
    return catalog.filter((act) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'all' || act.category === selectedCategory;

      if (!matchesCategory) return false;

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const title = (act.label || '').toLowerCase();
      const titleEn = (act.labelEn || '').toLowerCase();
      const desc = (act.desc || '').toLowerCase();
      const descEn = (act.descEn || '').toLowerCase();
      const catSi = (act.categoryTitleSi || '').toLowerCase();
      const catEn = (act.categoryTitleEn || '').toLowerCase();

      return (
        title.includes(q) ||
        titleEn.includes(q) ||
        desc.includes(q) ||
        descEn.includes(q) ||
        catSi.includes(q) ||
        catEn.includes(q)
      );
    });
  }, [catalog, selectedCategory, searchQuery]);

  // Current category info
  const currentCategoryInfo = useMemo(() => {
    return (
      ACTIVITY_CATEGORIES.find((c) => c.id === selectedCategory) ||
      ACTIVITY_CATEGORIES[0]
    );
  }, [selectedCategory]);

  // Category counts (calculated dynamically from catalog)
  const categoryCounts = useMemo(() => {
    const counts = { all: catalog.length };
    ACTIVITY_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = catalog.filter((a) => a.category === cat.id).length;
      }
    });
    return counts;
  }, [catalog]);

  // Handle activity launch
  const handleLaunchActivity = (act) => {
    if (act.actionType === 'art') {
      navigation.navigate('Art', { returnTo: 'ActivitiesLibrary' });
      return;
    }
    if (act.actionType === 'game' || act.id === 'baby_mood') {
      navigation.navigate('Activity', {
        gameId: 'baby_mood',
        returnTo: 'ActivitiesLibrary',
      });
      return;
    }
    navigation.navigate('Activity', {
      activityId: act.id,
      returnTo: 'ActivitiesLibrary',
    });
  };

  return (
    <ScreenContainer
      style={{ backgroundColor: DP.bg }}
      edges={['top']}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
    >
      <StatusBar barStyle="dark-content" />

      {/* Top Bar: Back Button + Language Switcher */}
      <View style={s.topBarRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Text style={s.backText}>{isSinhala ? '← ආපසු' : '← Back'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.langToggleBtn}
          onPress={() => i18n && i18n.changeLanguage(isSinhala ? 'en' : 'si')}
          activeOpacity={0.7}
        >
          <Text style={s.langToggleText}>{isSinhala ? 'EN' : 'සිං'}</Text>
        </TouchableOpacity>
      </View>

      {/* Page Title & Subtitle */}
      <View style={s.headerSection}>
        <View style={s.titleRow}>
          <Text style={s.pageTitle}>
            {isSinhala ? 'ක්‍රියාකාරකම් එකතුව' : 'Activities Library'}
          </Text>
          <Text style={s.headerIcon}>🧘</Text>
        </View>
        <Text style={s.pageSubtitle}>
          {isSinhala
            ? 'සන්සුන්කම, මානසික සුවය සහ දෛනික සහාය සඳහා ක්‍රියාකාරකම් ගවේෂණය කරන්න.'
            : 'Explore activities for relaxation, emotional well-being, and everyday support.'}
        </Text>
      </View>

      {/* Search Input Bar */}
      <View style={s.searchContainer}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder={
            isSinhala
              ? 'නමින්, කාණ්ඩයෙන් හෝ විස්තරයෙන් සොයන්න...'
              : 'Search activities by title, category, or mood...'
          }
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={s.clearBtn}>
            <Text style={s.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Category Selector */}
      <View style={s.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoryScrollContent}
        >
          {ACTIVITY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
                style={[s.categoryChip, isSelected && s.categoryChipSelected]}
              >
                {isSelected ? (
                  <View style={s.categoryChipGradient}>
                    <Text style={s.categoryIcon}>{cat.icon}</Text>
                    <Text style={s.categoryTitleSelected}>
                      {isSinhala ? cat.titleSi : cat.titleEn}
                    </Text>
                    <View style={s.countBadgeSelected}>
                      <Text style={s.countTextSelected}>{count}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={s.categoryChipInner}>
                    <Text style={s.categoryIcon}>{cat.icon}</Text>
                    <Text style={s.categoryTitle}>
                      {isSinhala ? cat.titleSi : cat.titleEn}
                    </Text>
                    <View style={s.countBadge}>
                      <Text style={s.countText}>{count}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Category Description Banner */}
      <View style={s.categoryBanner}>
        <View style={s.categoryBannerInner}>
          <Text style={s.bannerIcon}>{currentCategoryInfo.icon}</Text>
          <View style={s.bannerTextCol}>
            <Text style={s.bannerTitle}>
              {isSinhala ? currentCategoryInfo.titleSi : currentCategoryInfo.titleEn}
              <Text style={s.bannerTrackCount}>
                {' '}({filteredActivities.length}{' '}
                {isSinhala ? 'ක්‍රියාකාරකම්' : 'activities'})
              </Text>
            </Text>
            <Text style={s.bannerDesc}>
              {isSinhala
                ? currentCategoryInfo.descSi
                : currentCategoryInfo.descEn}
            </Text>
          </View>
        </View>
      </View>

      {/* Activities List Section */}
      <View style={s.activitiesSection}>
        {filteredActivities.length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyEmoji}>🍃</Text>
            <Text style={s.emptyTitle}>
              {isSinhala
                ? 'ගැලපෙන ක්‍රියාකාරකම් හමු නොවීය'
                : 'No matching activities found'}
            </Text>
            <Text style={s.emptySub}>
              {isSinhala
                ? 'වෙනත් වචනයක් සොයන්න හෝ වෙනත් කාණ්ඩයක් තෝරා බලන්න.'
                : 'Try a different search word or select another category.'}
            </Text>
            <TouchableOpacity
              style={s.resetBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              <Text style={s.resetBtnText}>
                {isSinhala ? 'සියලු ක්‍රියාකාරකම් පෙන්වන්න' : 'Show All Activities'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredActivities.map((act) => {
            const title = isSinhala ? act.label : act.labelEn;
            const subTitle = isSinhala ? act.labelEn : act.label;
            const desc = isSinhala ? act.desc : act.descEn;
            const categoryName = isSinhala ? act.categoryTitleSi : act.categoryTitleEn;
            const typeLabel = isSinhala ? act.typeLabelSi : act.typeLabelEn;
            const duration = isSinhala ? act.duration : act.durationEn;

            return (
              <TouchableOpacity
                key={act.id}
                style={s.actCard}
                onPress={() => handleLaunchActivity(act)}
                activeOpacity={0.88}
              >
                {/* Left Icon Box */}
                <View style={s.actIconBox}>
                  <Text style={s.actIcon}>{act.icon || '🌸'}</Text>
                </View>

                {/* Middle Content */}
                <View style={s.actInfo}>
                  {/* Top Badges Row */}
                  <View style={s.metaRowTop}>
                    <View style={[s.badgePill, { backgroundColor: DP.lav }]}>
                      <Text style={[s.badgePillText, { color: DP.primaryDark }]}>
                        {categoryName}
                      </Text>
                    </View>
                    <View style={[s.badgePill, { backgroundColor: DP.sage }]}>
                      <Text style={[s.badgePillText, { color: DP.sageText }]}>
                        ⏱️ {duration}
                      </Text>
                    </View>
                  </View>

                  {/* Activity Title */}
                  <Text style={s.actTitle} numberOfLines={1}>
                    {title}
                  </Text>

                  {/* Subtitle in alternate language */}
                  {subTitle && subTitle !== title && (
                    <Text style={s.actSubtitle} numberOfLines={1}>
                      {subTitle}
                    </Text>
                  )}

                  {/* Description */}
                  <Text style={s.actDesc} numberOfLines={2}>
                    {desc}
                  </Text>

                  {/* Bottom Row: Type label & Launch button */}
                  <View style={s.cardBottomRow}>
                    <Text style={s.typeLabelText}>
                      🏷️ {typeLabel}
                    </Text>
                    <View style={s.actionButton}>
                      <View style={s.actionButtonInner}>
                        <Text style={s.actionButtonText}>
                          {isSinhala ? 'ආරම්භ කරන්න →' : 'Start →'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScreenContainer>
  );
};

const s = StyleSheet.create({
  topBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: DP.border,
    alignSelf: 'flex-start',
  },
  backText: {
    color: DP.primaryDark,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
    fontWeight: '700',
    fontSize: 14,
  },
  langToggleBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: DP.border,
    ...DS.card,
  },
  langToggleText: {
    fontSize: 13,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
    fontWeight: '700',
    color: DP.primaryDark,
  },

  headerSection: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: SERIF,
    color: DP.textDark,
    letterSpacing: 0.2,
  },
  headerIcon: {
    fontSize: 22,
    marginLeft: 8,
  },
  pageSubtitle: {
    fontSize: 13,
    color: DP.textMuted,
    lineHeight: 18,
    marginTop: 4,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: DP.border,
    ...DS.card,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DP.textDark,
    paddingVertical: 2,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearBtnText: {
    fontSize: 14,
    color: DP.textMuted,
    fontWeight: '700',
  },

  categoriesSection: {
    marginBottom: spacing.md,
  },
  categoryScrollContent: {
    paddingRight: 10,
    gap: 8,
  },
  categoryChip: {
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DP.border,
    overflow: 'hidden',
    ...DS.card,
  },
  categoryChipSelected: {
    borderColor: DP.primaryDark,
    backgroundColor: DP.primaryDark,
  },
  categoryChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: DP.textDark,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },
  categoryTitleSelected: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },
  countBadge: {
    backgroundColor: DP.lav,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: DP.primaryDark,
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 6,
  },
  countTextSelected: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  categoryBanner: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: DP.border,
    ...DS.card,
  },
  categoryBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  bannerIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DP.textDark,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },
  bannerTrackCount: {
    fontSize: 12,
    fontWeight: '600',
    color: DP.primaryDark,
    marginTop: 2,
  },
  bannerDesc: {
    fontSize: 12,
    color: DP.textMuted,
    marginTop: 2,
    lineHeight: 16,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },

  activitiesSection: {
    gap: 10,
  },
  actCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: DP.border,
    ...DS.card,
  },
  actIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: DP.lav,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  actIcon: {
    fontSize: 24,
  },
  actInfo: {
    flex: 1,
  },
  metaRowTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DP.textDark,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },
  actSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: DP.textMuted,
    marginBottom: 2,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },
  actDesc: {
    fontSize: 12,
    color: DP.textMuted,
    lineHeight: 17,
    marginTop: 2,
    marginBottom: 8,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  typeLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: DP.primaryDark,
    flex: 1,
  },
  actionButton: {
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: DP.primaryDark,
  },
  actionButtonInner: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DP.primaryDark,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 26,
    borderWidth: 1,
    borderColor: DP.border,
    marginVertical: 10,
    ...DS.card,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DP.textDark,
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },
  emptySub: {
    fontSize: 12,
    color: DP.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },
  resetBtn: {
    backgroundColor: DP.lav,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  resetBtnText: {
    color: DP.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ActivitiesLibraryScreen;
