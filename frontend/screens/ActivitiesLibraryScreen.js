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
      gradient={['#F8F4FF', '#FFF0F8', '#F5FBFF']}
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
                  <LinearGradient
                    colors={['#8E24AA', '#D81B60']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.categoryChipGradient}
                  >
                    <Text style={s.categoryIcon}>{cat.icon}</Text>
                    <Text style={s.categoryTitleSelected}>
                      {isSinhala ? cat.titleSi : cat.titleEn}
                    </Text>
                    <View style={s.countBadgeSelected}>
                      <Text style={s.countTextSelected}>{count}</Text>
                    </View>
                  </LinearGradient>
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
        <LinearGradient
          colors={['#EDE7F6', '#FFF0F8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.categoryBannerInner}
        >
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
        </LinearGradient>
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
                {/* Left Icon Box with gradient background */}
                <LinearGradient
                  colors={act.color || ['#EDE7F6', '#D1C4E9']}
                  style={s.actIconBox}
                >
                  <Text style={s.actIcon}>{act.icon || '🌸'}</Text>
                </LinearGradient>

                {/* Middle Content */}
                <View style={s.actInfo}>
                  {/* Top Badges Row */}
                  <View style={s.metaRowTop}>
                    <View style={[s.badgePill, { backgroundColor: '#F3E5F5' }]}>
                      <Text style={[s.badgePillText, { color: '#8E24AA' }]}>
                        {categoryName}
                      </Text>
                    </View>
                    <View style={[s.badgePill, { backgroundColor: '#E8F5E9' }]}>
                      <Text style={[s.badgePillText, { color: '#2E7D32' }]}>
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
                      <LinearGradient
                        colors={['#8E24AA', '#D81B60']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={s.actionButtonInner}
                      >
                        <Text style={s.actionButtonText}>
                          {isSinhala ? 'ආරම්භ කරන්න →' : 'Start →'}
                        </Text>
                      </LinearGradient>
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
    paddingVertical: 6,
    paddingHorizontal: 2,
    alignSelf: 'flex-start',
  },
  backText: {
    color: colors.lavenderDark,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
    fontWeight: '700',
    fontSize: 16,
  },
  langToggleBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.lavenderMid,
    ...shadows.soft,
  },
  langToggleText: {
    fontSize: 13,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
    fontWeight: '700',
    color: colors.lavenderDark,
  },

  headerSection: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  headerIcon: {
    fontSize: 24,
    marginLeft: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: 4,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E8D5F5',
    ...shadows.soft,
  },
  searchIcon: {
    fontSize: 17,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 2,
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearBtnText: {
    fontSize: 14,
    color: colors.textMuted,
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
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6D3F5',
    overflow: 'hidden',
    ...shadows.soft,
  },
  categoryChipSelected: {
    borderColor: 'transparent',
  },
  categoryChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  categoryTitleSelected: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginLeft: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7E57C2',
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginLeft: 6,
  },
  countTextSelected: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  categoryBanner: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E8D5F5',
    ...shadows.soft,
  },
  categoryBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  bannerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6A1B9A',
  },
  bannerTrackCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E24AA',
  },
  bannerDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },

  activitiesSection: {
    gap: 12,
  },
  actCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0E0F8',
    ...shadows.card,
  },
  actIconBox: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  actIcon: {
    fontSize: 30,
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
    borderRadius: radius.full,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  actTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  actSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 2,
  },
  actDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 8,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  typeLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E24AA',
    flex: 1,
  },
  actionButton: {
    borderRadius: radius.full,
    overflow: 'hidden',
    ...shadows.soft,
  },
  actionButtonInner: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 30,
    borderWidth: 1,
    borderColor: '#E8D5F5',
    marginVertical: 10,
    ...shadows.soft,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: '#EDE7F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  resetBtnText: {
    color: '#7E57C2',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default ActivitiesLibraryScreen;
