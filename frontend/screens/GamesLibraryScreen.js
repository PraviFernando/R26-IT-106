// ================================================================
// GAMES LIBRARY SCREEN — GamesLibraryScreen.js
// Dedicated, categorized games library for PeriCare
// Displays all 21 unique, verified games with playability status
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
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows, typography } from '../theme';
import { DASHBOARD_PALETTE as DP, SERIF, DASHBOARD_SHADOWS as DS } from '../theme/dashboardTokens';
import { useResponsive } from '../hooks/useResponsive';
import ScreenContainer from '../components/ScreenContainer';
import {
  GAME_CATEGORIES,
  getAllGamesCatalog,
} from '../services/activitiesLibrary';

const GamesLibraryScreen = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isSinhala = i18n?.language === 'si';
  const { scale } = useResponsive();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // All catalog games (all 21 verified unique game entries)
  const catalog = useMemo(() => getAllGamesCatalog(), []);

  // Filtered games by category and search query
  const filteredGames = useMemo(() => {
    return catalog.filter((game) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'all' || game.category === selectedCategory;

      if (!matchesCategory) return false;

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const title = (game.label || '').toLowerCase();
      const titleEn = (game.labelEn || '').toLowerCase();
      const desc = (game.desc || '').toLowerCase();
      const descEn = (game.descEn || '').toLowerCase();
      const catSi = (game.categoryTitleSi || '').toLowerCase();
      const catEn = (game.categoryTitleEn || '').toLowerCase();

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
      GAME_CATEGORIES.find((c) => c.id === selectedCategory) ||
      GAME_CATEGORIES[0]
    );
  }, [selectedCategory]);

  // Category counts (calculated dynamically from catalog)
  const categoryCounts = useMemo(() => {
    const counts = { all: catalog.length };
    GAME_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = catalog.filter((g) => g.category === cat.id).length;
      }
    });
    return counts;
  }, [catalog]);

  // Total playable games count
  const playableCount = useMemo(() => {
    return catalog.filter((g) => g.isPlayable).length;
  }, [catalog]);

  // Handle game launch
  const handleLaunchGame = (game) => {
    if (!game.isPlayable) {
      Alert.alert(
        isSinhala ? 'ක්‍රියාත්මක කර නොමැත' : 'Implementation Missing',
        isSinhala
          ? `"${game.label}" ක්‍රීඩාව නිර්දේශ පද්ධතියේ නිර්වචනය කර ඇතත්, ඒ සඳහා වූ mini-game තිරය කේතය තුළ ක්‍රියාත්මක කර නොමැත.`
          : `The game "${game.labelEn}" is defined in recommendation rules, but its custom mini-game screen is not implemented in the codebase yet.`
      );
      return;
    }

    if (game.actionType === 'art') {
      navigation.navigate('Art', { returnTo: 'GamesLibrary' });
      return;
    }

    // Default: ActivityScreen with gameId
    navigation.navigate('Activity', {
      gameId: game.id,
      returnTo: 'GamesLibrary',
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
            {isSinhala ? 'ක්‍රීඩා එකතුව' : 'Games Library'}
          </Text>
          <Text style={s.headerIcon}>🎮</Text>
        </View>
        <Text style={s.pageSubtitle}>
          {isSinhala
            ? 'කුඩා විවේකයක් සඳහා ක්‍රීඩාවක් තෝරන්න.'
            : 'Choose a game for a little break.'}
        </Text>
      </View>

      {/* Stats Summary Strip */}
      <View style={s.statsStrip}>
        <View style={s.statItem}>
          <Text style={s.statNumber}>{playableCount}</Text>
          <Text style={s.statLabel}>
            {isSinhala ? 'සූදානම් ක්‍රීඩා' : 'Playable Games'}
          </Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNumber}>{catalog.length}</Text>
          <Text style={s.statLabel}>
            {isSinhala ? 'මුළු ක්‍රීඩා' : 'Total Defined'}
          </Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNumber}>{GAME_CATEGORIES.length - 1}</Text>
          <Text style={s.statLabel}>
            {isSinhala ? 'කාණ්ඩ' : 'Categories'}
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={s.searchContainer}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder={
            isSinhala
              ? 'නමින්, කාණ්ඩයෙන් හෝ විස්තරයෙන් ක්‍රීඩා සොයන්න...'
              : 'Search games by name, category, or type...'
          }
          placeholderTextColor={DP.textMuted}
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
          {GAME_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
                style={[s.categoryChip, isSelected && s.categoryChipSelected]}
              >
                <View style={s.categoryChipInner}>
                  <Text style={s.categoryIcon}>{cat.icon}</Text>
                  <Text style={[s.categoryTitle, isSelected && s.categoryTitleSelected]}>
                    {isSinhala ? cat.titleSi : cat.titleEn}
                  </Text>
                  <View style={[s.countBadge, isSelected && s.countBadgeSelected]}>
                    <Text style={[s.countText, isSelected && s.countTextSelected]}>{count}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Category Description Banner */}
      <View style={s.categoryBanner}>
        <View style={s.categoryBannerInner}>
          <View style={s.bannerEmojiBox}>
            <Text style={s.bannerIcon}>{currentCategoryInfo.icon}</Text>
          </View>
          <View style={s.bannerTextCol}>
            <Text style={s.bannerTitle}>
              {isSinhala ? currentCategoryInfo.titleSi : currentCategoryInfo.titleEn}
              <Text style={s.bannerGameCount}>
                {' '}({filteredGames.length}{' '}
                {isSinhala ? 'ක්‍රීඩා' : 'games'})
              </Text>
            </Text>
            <Text style={s.bannerDesc}>
              {isSinhala ? currentCategoryInfo.descSi : currentCategoryInfo.descEn}
            </Text>
          </View>
        </View>
      </View>

      {/* Games List Section */}
      <View style={s.gamesSection}>
        {filteredGames.length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyEmoji}>🎲</Text>
            <Text style={s.emptyTitle}>
              {isSinhala
                ? 'ගැලපෙන ක්‍රීඩා හමු නොවීය'
                : 'No matching games found'}
            </Text>
            <Text style={s.emptySub}>
              {isSinhala
                ? 'වෙනත් වචනයක් සොයන්න හෝ වෙනත් කාණ්ඩයක් තෝරා බලන්න.'
                : 'Try a different search term or select another category.'}
            </Text>
            <TouchableOpacity
              style={s.resetBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              <Text style={s.resetBtnText}>
                {isSinhala ? 'සියලු ක්‍රීඩා පෙන්වන්න' : 'Show All Games'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredGames.map((game) => {
            const title = isSinhala ? game.label : game.labelEn;
            const subTitle = isSinhala ? game.labelEn : game.label;
            const desc = isSinhala ? game.desc : game.descEn;
            const categoryName = isSinhala ? game.categoryTitleSi : game.categoryTitleEn;

            return (
              <TouchableOpacity
                key={game.id}
                style={[
                  s.gameCard,
                  !game.isPlayable && s.gameCardDisabled,
                ]}
                onPress={() => handleLaunchGame(game)}
                activeOpacity={game.isPlayable ? 0.88 : 0.95}
              >
                {/* Left Icon Box with soft lavender background */}
                <View style={s.gameIconBox}>
                  <Text style={s.gameIconText}>{game.icon || '🎮'}</Text>
                </View>

                {/* Middle Content */}
                <View style={s.gameInfo}>
                  {/* Top Badges Row */}
                  <View style={s.metaRowTop}>
                    <View style={[s.badgePill, { backgroundColor: DP.lav }]}>
                      <Text style={[s.badgePillText, { color: DP.primaryDark }]}>
                        {categoryName}
                      </Text>
                    </View>

                    {game.isPlayable ? (
                      <View style={[s.badgePill, { backgroundColor: DP.sage }]}>
                        <Text style={[s.badgePillText, { color: DP.sageDark }]}>
                          {isSinhala ? '🎮 සූදානම්' : '🎮 Playable'}
                        </Text>
                      </View>
                    ) : (
                      <View style={[s.badgePill, { backgroundColor: DP.blush }]}>
                        <Text style={[s.badgePillText, { color: DP.primaryDark }]}>
                          {isSinhala ? '⚠️ නොපවතී' : '⚠️ Missing'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Game Title */}
                  <Text style={s.gameTitle} numberOfLines={1}>
                    {title}
                  </Text>

                  {/* Subtitle in alternate language */}
                  {subTitle && subTitle !== title && (
                    <Text style={s.gameSubtitle} numberOfLines={1}>
                      {subTitle}
                    </Text>
                  )}

                  {/* Description */}
                  <Text style={s.gameDesc} numberOfLines={2}>
                    {desc}
                  </Text>

                  {/* Bottom Row: Action button */}
                  <View style={s.cardBottomRow}>
                    <Text style={[s.cardStatusText, { color: game.isPlayable ? DP.sageDark : DP.textMuted }]}>
                      {game.isPlayable
                        ? (isSinhala ? 'ක්ෂණිකව ක්‍රීඩා කළ හැක' : 'Ready to play now')
                        : (isSinhala ? 'ක්‍රියාත්මක කර නොමැත' : 'Implementation missing')}
                    </Text>

                    <View style={s.actionButton}>
                      {game.isPlayable ? (
                        <View style={[s.actionButtonInner, { backgroundColor: DP.primaryDark }]}>
                          <Text style={s.actionButtonText}>
                            {isSinhala ? 'ක්‍රීඩා කරන්න →' : 'Play →'}
                          </Text>
                        </View>
                      ) : (
                        <View style={[s.actionButtonInner, { backgroundColor: '#EDE4EE' }]}>
                          <Text style={[s.actionButtonText, { color: DP.textMuted }]}>
                            {isSinhala ? 'නොපවතී' : 'Unavailable'}
                          </Text>
                        </View>
                      )}
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

  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: DP.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...DS.card,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: DP.primaryDark,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: DP.textMuted,
    marginTop: 2,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: DP.border,
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
  bannerEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: DP.lav,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerIcon: {
    fontSize: 24,
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
  bannerGameCount: {
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

  gamesSection: {
    gap: 10,
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: DP.border,
    ...DS.card,
  },
  gameCardDisabled: {
    opacity: 0.72,
    borderColor: '#EFE4EE',
  },
  gameIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: DP.lav,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  gameIconText: {
    fontSize: 24,
  },
  gameInfo: {
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
  gameTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DP.textDark,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },
  gameSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: DP.textMuted,
    marginBottom: 2,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },
  gameDesc: {
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
  cardStatusText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  actionButton: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  actionButtonInner: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
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

export default GamesLibraryScreen;
