// ================================================================
// MUSIC LIBRARY SCREEN — MusicLibraryScreen.js
// Dedicated, categorized music library for PeriCare
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
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows, typography } from '../theme';
import { useResponsive } from '../hooks/useResponsive';
import ScreenContainer from '../components/ScreenContainer';
import {
  MUSIC_CATEGORIES,
  getAllMusicCatalog,
} from '../services/mediaLibrary';
import { openYouTubeLink } from '../utils/openYouTube';

const MusicLibraryScreen = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isSinhala = i18n?.language === 'si';
  const { scale } = useResponsive();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTrack, setActiveTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // All catalog tracks
  const catalog = useMemo(() => getAllMusicCatalog(), []);

  // Filtered tracks by category and search
  const filteredTracks = useMemo(() => {
    return catalog.filter((track) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'all' ||
        track.category === selectedCategory ||
        (Array.isArray(track.categories) && track.categories.includes(selectedCategory));

      if (!matchesCategory) return false;

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const title = (track.title || '').toLowerCase();
      const titleEn = (track.titleEn || '').toLowerCase();
      const desc = (track.description || '').toLowerCase();
      const descSi = (track.descriptionSi || '').toLowerCase();

      return (
        title.includes(q) ||
        titleEn.includes(q) ||
        desc.includes(q) ||
        descSi.includes(q)
      );
    });
  }, [catalog, selectedCategory, searchQuery]);

  // Current category info
  const currentCategoryInfo = useMemo(() => {
    return (
      MUSIC_CATEGORIES.find((c) => c.id === selectedCategory) ||
      MUSIC_CATEGORIES[0]
    );
  }, [selectedCategory]);

  // Handle Play track
  const handlePlayTrack = async (track) => {
    if (activeTrack?.id === track.id && isPlaying) {
      // Pause
      setIsPlaying(false);
      return;
    }

    setActiveTrack(track);
    setIsPlaying(true);

    if (track.url) {
      await openYouTubeLink(track.url, isSinhala ? track.title : track.titleEn || track.title);
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: catalog.length };
    MUSIC_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = catalog.filter(
          (t) =>
            t.category === cat.id ||
            (Array.isArray(t.categories) && t.categories.includes(cat.id))
        ).length;
      }
    });
    return counts;
  }, [catalog]);

  return (
    <ScreenContainer
      gradient={['#F8F4FF', '#FFF0F8', '#F5FBFF']}
      edges={['top']}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: activeTrack ? 110 : 40 }}
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
            {isSinhala ? 'සංගීත එකතුව' : 'Music Library'}
          </Text>
          <Text style={s.headerIcon}>🎵</Text>
        </View>
        <Text style={s.pageSubtitle}>
          {isSinhala
            ? 'සන්සුන් මොහොතක් සොයාගන්න.'
            : 'Find a moment of calm.'}
        </Text>
      </View>

      {/* Search Input Bar */}
      <View style={s.searchContainer}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder={
            isSinhala
              ? 'නමින් හෝ විස්තරයෙන් සංගීතය සොයන්න...'
              : 'Search music by title or mood...'
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
          {MUSIC_CATEGORIES.map((cat) => {
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
              <Text style={s.bannerTrackCount}> ({filteredTracks.length} {isSinhala ? 'තනු' : 'tracks'})</Text>
            </Text>
            <Text style={s.bannerDesc}>
              {isSinhala
                ? currentCategoryInfo.descriptionSi || 'ඔබගේ සුවය සහ සැනසීම උදෙසා තෝරාගත් සංගීතය'
                : currentCategoryInfo.descriptionEn || 'Carefully curated music to soothe and uplift.'}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Track List Section */}
      <View style={s.tracksSection}>
        {filteredTracks.length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyEmoji}>🍃</Text>
            <Text style={s.emptyTitle}>
              {isSinhala ? 'ගැලපෙන සංගීත හමු නොවීය' : 'No matching music found'}
            </Text>
            <Text style={s.emptySub}>
              {isSinhala
                ? 'වෙනත් වචනයක් හෝ වෙනත් කාණ්ඩයක් තෝරා බලන්න.'
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
                {isSinhala ? 'සියලු සංගීත පෙන්වන්න' : 'Show All Music'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredTracks.map((track, idx) => {
            const isThisPlaying = activeTrack?.id === track.id && isPlaying;
            const categoryObj = MUSIC_CATEGORIES.find((c) => c.id === track.category);
            const categoryBadge = categoryObj
              ? isSinhala
                ? categoryObj.titleSi
                : categoryObj.titleEn
              : isSinhala ? 'සන්සුන් සංගීතය' : 'Calming Music';

            return (
              <TouchableOpacity
                key={track.id || idx}
                style={[s.trackCard, isThisPlaying && s.trackCardActive]}
                onPress={() => handlePlayTrack(track)}
                activeOpacity={0.85}
              >
                {/* Left Thumbnail/Emoji */}
                <View style={[s.trackEmojiContainer, isThisPlaying && s.trackEmojiContainerActive]}>
                  <Text style={s.trackEmoji}>{track.emoji || '🎵'}</Text>
                </View>

                {/* Middle Info */}
                <View style={s.trackInfo}>
                  <View style={s.trackHeaderRow}>
                    <Text style={s.trackTitle} numberOfLines={1}>
                      {isSinhala ? track.title : track.titleEn || track.title}
                    </Text>
                  </View>

                  {/* Subtitle in alternate language if available */}
                  <Text style={s.trackSubTitle} numberOfLines={1}>
                    {isSinhala ? track.titleEn : track.title}
                  </Text>

                  {/* Short Description */}
                  <Text style={s.trackDesc} numberOfLines={2}>
                    {isSinhala ? track.descriptionSi : track.description}
                  </Text>

                  {/* Meta Badges Row */}
                  <View style={s.metaRow}>
                    <View style={s.categoryBadge}>
                      <Text style={s.categoryBadgeText}>{categoryBadge}</Text>
                    </View>
                    <View style={s.durationBadge}>
                      <Text style={s.durationText}>⏱️ {track.duration || '5:00'}</Text>
                    </View>
                    <View style={s.sourceBadge}>
                      <Text style={s.sourceText}>YouTube ↗</Text>
                    </View>
                  </View>
                </View>

                {/* Right Play Control */}
                <View style={s.playBtnCol}>
                  <LinearGradient
                    colors={isThisPlaying ? ['#8E24AA', '#D81B60'] : ['#F3E5F5', '#EDE7F6']}
                    style={s.playBtn}
                  >
                    <Text style={[s.playIcon, isThisPlaying && { color: '#FFFFFF' }]}>
                      {isThisPlaying ? '⏸' : '▶'}
                    </Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Floating Bottom Mini-Player Bar (When track is active) */}
      {activeTrack && (
        <View style={s.miniPlayerContainer}>
          <LinearGradient
            colors={['#2C1A35', '#4A148C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.miniPlayerInner}
          >
            <View style={s.miniPlayerLeft}>
              <Text style={s.miniPlayerEmoji}>{activeTrack.emoji || '🎵'}</Text>
              <View style={s.miniPlayerInfo}>
                <Text style={s.miniPlayerTitle} numberOfLines={1}>
                  {isSinhala ? activeTrack.title : activeTrack.titleEn || activeTrack.title}
                </Text>
                <Text style={s.miniPlayerStatus}>
                  {isPlaying
                    ? (isSinhala ? 'ධාවනය වෙමින් • YouTube' : 'Now Playing • YouTube Stream')
                    : (isSinhala ? 'නැවතුණි • YouTube' : 'Paused • YouTube Stream')}
                </Text>
              </View>
            </View>

            <View style={s.miniPlayerControls}>
              <TouchableOpacity
                style={s.miniPlayerBtn}
                onPress={() => setIsPlaying(!isPlaying)}
              >
                <Text style={s.miniPlayerBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.miniPlayerLaunchBtn}
                onPress={() =>
                  openYouTubeLink(
                    activeTrack.url,
                    isSinhala ? activeTrack.title : activeTrack.titleEn || activeTrack.title
                  )
                }
              >
                <Text style={s.miniPlayerLaunchText}>↗</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.miniPlayerCloseBtn}
                onPress={() => {
                  setActiveTrack(null);
                  setIsPlaying(false);
                }}
              >
                <Text style={s.miniPlayerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
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
    paddingVertical: 4,
    paddingHorizontal: 6,
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
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    fontFamily: typography ? typography.headerFont : 'sans-serif',
  },
  headerIcon: {
    fontSize: 26,
    marginLeft: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.soft,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },
  clearBtn: {
    padding: 4,
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
    paddingVertical: 4,
    gap: 8,
  },
  categoryChip: {
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.soft,
  },
  categoryChipSelected: {
    borderColor: '#8E24AA',
  },
  categoryChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  categoryTitleSelected: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: colors.bgTint,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  countTextSelected: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  categoryBanner: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  bannerTrackCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  bannerDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  tracksSection: {
    gap: 12,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.soft,
  },
  trackCardActive: {
    borderColor: '#8E24AA',
    borderWidth: 1.5,
    backgroundColor: '#FAF5FF',
  },
  trackEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lavenderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackEmojiContainerActive: {
    backgroundColor: '#E1BEE7',
  },
  trackEmoji: {
    fontSize: 22,
  },
  trackInfo: {
    flex: 1,
  },
  trackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    fontFamily: typography ? typography.topicFont : 'sans-serif',
  },
  trackSubTitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
    fontWeight: '600',
  },
  trackDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  categoryBadge: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#7B1FA2',
    fontWeight: '700',
  },
  durationBadge: {
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  durationText: {
    fontSize: 11,
    color: '#546E7A',
    fontWeight: '600',
  },
  sourceBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  sourceText: {
    fontSize: 10,
    color: '#C62828',
    fontWeight: '700',
  },
  playBtnCol: {
    marginLeft: 8,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft,
  },
  playIcon: {
    fontSize: 16,
    color: '#8E24AA',
    marginLeft: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    ...shadows.soft,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 14,
    right: 14,
  },
  miniPlayerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.xl,
    ...shadows.strong,
  },
  miniPlayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  miniPlayerEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  miniPlayerStatus: {
    color: '#D69ADE',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniPlayerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8E24AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPlayerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 1,
  },
  miniPlayerLaunchBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPlayerLaunchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  miniPlayerCloseBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPlayerCloseText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default MusicLibraryScreen;
