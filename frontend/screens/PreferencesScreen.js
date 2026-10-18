// ================================================================
// PREFERENCES SCREEN — PreferencesScreen.js (Sinhala UI)
// ================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, shadows, typography } from '../theme';
import { DASHBOARD_PALETTE as DP, SERIF, DASHBOARD_SHADOWS as DS } from '../theme/dashboardTokens';
import { ALL_ACTIVITIES, ALL_GAMES } from '../services/activitiesLibrary';
import { useApp } from '../services/AppContext';
import { SI } from '../services/translations';
import ScreenContainer from '../components/ScreenContainer';
import { useResponsive } from '../hooks/useResponsive';

const PreferencesScreen = ({ navigation }) => {
  const { savePreferences, userPreferredActivities, userPreferredGames } = useApp();
  const [selActs, setSelActs] = useState(userPreferredActivities);
  const [selGames, setSelGames] = useState(userPreferredGames);
  const r = useResponsive();
  const gameCols = r.gridColumns(150, 10, 4);
  const gameCardW = r.tileWidth(gameCols, 10);

  const toggleAct = (id) => setSelActs(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleGame = (id) => setSelGames(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleSave = () => { savePreferences(selActs, selGames); navigation.goBack(); };

  return (
    <ScreenContainer
      style={{ backgroundColor: DP.bg }}
      edges={['top', 'bottom']}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
    >
      <Text style={s.title}>{SI.myPreferences}</Text>
      <Text style={s.subtitle}>{SI.prefSubtitle}</Text>

      {/* Activities */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{SI.mindfulActs}</Text>
          <View style={s.selCountBadge}>
            <Text style={s.selCount}>{selActs.length} {SI.selected}</Text>
          </View>
        </View>
        <Text style={s.sectionSub}>{SI.chooseActs}</Text>
        {ALL_ACTIVITIES.map((act) => {
          const sel = selActs.includes(act.id);
          return (
            <TouchableOpacity key={act.id} onPress={() => toggleAct(act.id)} activeOpacity={0.8}>
              <View style={[s.actCard, sel && s.actCardSel]}>
                <View style={[s.actIconBox, sel && { backgroundColor: DP.lav }]}>
                  <Text style={s.actIcon}>{act.icon}</Text>
                </View>
                <View style={s.actInfo}>
                  <Text style={[s.actLabel, sel && { color: DP.primaryDark }]}>{act.label}</Text>
                  <Text style={s.actDesc}>{act.desc}</Text>
                  <View style={s.actMeta}>
                    <Text style={s.actDur}>⏱ {act.duration}</Text>
                    <View style={s.catBadge}>
                      <Text style={s.catBadgeText}>{act.category}</Text>
                    </View>
                  </View>
                </View>
                <View style={[s.checkbox, sel && s.checkboxSel]}>
                  {sel && <Text style={s.checkMark}>✓</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Games */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{SI.gamesSection}</Text>
          <View style={s.selCountBadge}>
            <Text style={s.selCount}>{selGames.length} {SI.selected}</Text>
          </View>
        </View>
        <Text style={s.sectionSub}>{SI.chooseGames}</Text>
        <View style={s.gamesGrid}>
          {ALL_GAMES.map((game) => {
            const sel = selGames.includes(game.id);
            return (
              <TouchableOpacity key={game.id} onPress={() => toggleGame(game.id)} style={{ width: gameCardW }} activeOpacity={0.8}>
                <View style={[s.gameCard, sel && s.gameCardSel]}>
                  {sel && (
                    <View style={s.gameCheck}>
                      <Text style={s.gameCheckText}>✓</Text>
                    </View>
                  )}
                  <View style={s.gameIconBox}>
                    <Text style={s.gameIcon}>{game.icon}</Text>
                  </View>
                  <Text style={[s.gameName, sel && { color: DP.primaryDark }]}>{game.label}</Text>
                  <Text style={s.gameDesc}>{game.labelEn}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity onPress={handleSave} style={s.saveBtn} activeOpacity={0.85}>
        <Text style={s.saveBtnText}>{SI.savePrefs}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()} style={s.skipBtn} activeOpacity={0.7}>
        <Text style={s.skipText}>{SI.skipNow}</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const s = StyleSheet.create({
  title: {
    fontFamily: SERIF,
    fontSize: 24,
    fontWeight: '700',
    color: DP.textDark,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: DP.textMuted,
    lineHeight: 18,
    marginBottom: spacing.lg,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DP.textDark,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },
  sectionSub: {
    fontSize: 12,
    color: DP.textMuted,
    marginBottom: spacing.md,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },
  selCountBadge: {
    backgroundColor: DP.lav,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  selCount: {
    fontSize: 11,
    color: DP.primaryDark,
    fontWeight: '700',
  },
  actCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: DP.border,
    ...DS.card,
  },
  actCardSel: {
    borderColor: DP.primaryDark,
    backgroundColor: '#FAF6FC',
  },
  actIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: DP.lav,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actIcon: {
    fontSize: 24,
  },
  actInfo: {
    flex: 1,
  },
  actLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: DP.textDark,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },
  actDesc: {
    fontSize: 12,
    color: DP.textMuted,
    marginTop: 2,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },
  actMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  actDur: {
    fontSize: 11,
    color: DP.textMuted,
    fontWeight: '600',
  },
  catBadge: {
    backgroundColor: DP.blush,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: DP.primaryDark,
    textTransform: 'capitalize',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: DP.border,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSel: {
    backgroundColor: DP.primaryDark,
    borderColor: DP.primaryDark,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gameCard: {
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DP.border,
    ...DS.card,
    position: 'relative',
  },
  gameCardSel: {
    borderColor: DP.primaryDark,
    backgroundColor: '#FAF6FC',
  },
  gameCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: DP.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameCheckText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  gameIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: DP.lav,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameIcon: {
    fontSize: 26,
  },
  gameName: {
    fontSize: 13,
    fontWeight: '700',
    color: DP.textDark,
    textAlign: 'center',
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },
  gameDesc: {
    fontSize: 11,
    color: DP.textMuted,
    textAlign: 'center',
    marginTop: 2,
    fontFamily: typography ? typography.bodyFont : 'sans-serif',
  },
  saveBtn: {
    backgroundColor: DP.primaryDark,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    ...DS.card,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: typography ? typography.subTopicFont : 'sans-serif',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    color: DP.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
});

export default PreferencesScreen;
