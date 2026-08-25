// ================================================================
// SINHALA TRANSLATIONS — translations.js
// All UI text displayed in Sinhala language, linked to i18n
// ================================================================

import i18n from '../i18n';

export const SI = {
  // App
  get appName() { return i18n.t('appName', { defaultValue: 'බ්ලූම් 🌸' }); },
  get tagline() { return i18n.t('tagline', { defaultValue: 'ඔබේ සුවය ගැන සැලකිලිමත් වෙමු' }); },

  // Dashboard
  get goodMorning() { return i18n.t('goodMorning', { defaultValue: 'සුභ උදෑසනක් 🌸' }); },
  get hi() { return i18n.t('hi', { defaultValue: 'ආයුබෝවන්,' }); },
  get week() { return i18n.t('week', { defaultValue: 'සතිය ප්‍රසූතියෙන් පසු' }); },
  get todaysFeeling() { return i18n.t('todaysFeeling', { defaultValue: 'අද ඔබේ හැඟීම' }); },
  get viewSupportPlan() { return i18n.t('viewSupportPlan', { defaultValue: 'ආධාර සැලැස්ම බලන්න →' }); },
  get thisWeek() { return i18n.t('thisWeek', { defaultValue: 'මෙම සතිය' }); },
  get quickSupport() { return i18n.t('quickSupport', { defaultValue: 'ඉක්මන් ආධාර' }); },
  get todaysAffirm() { return i18n.t('todaysAffirm', { defaultValue: 'අදේ ශක්තිය ✨' }); },
  get diaryDemo() { return i18n.t('diaryDemo', { defaultValue: '📓 දිනපොත් අනුකරණය' }); },
  get processDiary() { return i18n.t('processDiary', { defaultValue: 'නව දිනපොත ක්‍රියාත්මක කරන්න →' }); },

  // Emotions
  get happy() { return i18n.t('happy', { defaultValue: 'සතුටුයි' }); },
  get sad() { return i18n.t('sad', { defaultValue: 'දුකයි' }); },
  get stressed() { return i18n.t('stressed', { defaultValue: 'ආතතියයි' }); },
  get feeling() { return i18n.t('feeling', { defaultValue: 'හැඟෙනවා' }); },

  // Risk
  get lowRisk() { return i18n.t('lowRisk', { defaultValue: '🟢 අඩු අවදානම' }); },
  get mediumRisk() { return i18n.t('mediumRisk', { defaultValue: '🟡 මධ්‍යම අවදානම' }); },
  get highRisk() { return i18n.t('highRisk', { defaultValue: '🔴 අධික අවදානම' }); },
  get highRiskWarningTitle() { return i18n.t('highRiskWarningTitle', { defaultValue: '🚨 ඔබට විශේෂ අවධානය සහ සහාය අවශ්‍යයි' }); },
  get highRiskWarningMsg() { return i18n.t('highRiskWarningMsg', { defaultValue: 'ඔබ ඉතා අපහසු අඳුරු මොහොතක් පසු කරමින් සිටිය හැක. කරුණාකර ඔබ තනිවම නැත. වහාම පවුලේ අයෙකු, සෞඛ්‍ය නිලධාරියෙකු හෝ සහන දුරකථන සේවාවක් (1926) අමතන්න. ඔබ ඉතා අගනා පුද්ගලයෙකි! 💖' }); },

  // Support Screen
  get emotionalAnalysis() { return i18n.t('emotionalAnalysis', { defaultValue: 'හැඟීම් විශ්ලේෂණය 💜' }); },
  get diaryProcessed() { return i18n.t('diaryProcessed', { defaultValue: 'ඔබේ දිනපොත කියවා විශ්ලේෂණය කෙරිණි' }); },
  get systemNote() { return i18n.t('systemNote', { defaultValue: '🔍 ඔබේ දිනපොත් සංරචකයෙන් ස්වයංක්‍රීයව සකසන ලදි' }); },
  get detectedMood() { return i18n.t('detectedMood', { defaultValue: 'හඳුනාගත් මනෝභාවය' }); },
  get riskLevel() { return i18n.t('riskLevel', { defaultValue: 'හැඟීම් අවදානම් මට්ටම' }); },
  get getSupport() { return i18n.t('getSupport', { defaultValue: 'පෞද්ගලිකෘත ආධාර ලබාගන්න 💜' }); },
  get simulateDiary() { return i18n.t('simulateDiary', { defaultValue: '📓 නව දිනපොත් ප්‍රවේශය අනුකරණය' }); },
  get processNewEntry() { return i18n.t('processNewEntry', { defaultValue: 'නව දිනපොත ක්‍රියාත්මක කරන්න →' }); },

  // Recommendations
  get yourSupportPlan() { return i18n.t('yourSupportPlan', { defaultValue: 'ඔබේ ආධාර සැලැස්ම 💜' }); },
  get music() { return i18n.t('music', { defaultValue: 'සංගීතය' }); },
  get videos() { return i18n.t('videos', { defaultValue: 'වීඩියෝ' }); },
  get activities() { return i18n.t('activities', { defaultValue: 'ක්‍රියාකාරකම්' }); },
  get games() { return i18n.t('games', { defaultValue: 'ක්‍රීඩා' }); },
  get tenTracks() { return i18n.t('tenTracks', { defaultValue: 'ඔබේ මනෝභාවය සඳහා ගීත 10 ක් 🎵' }); },
  get tenVideos() { return i18n.t('tenVideos', { defaultValue: 'ඔබ සඳහා වීඩියෝ 10 ක් 🎬' }); },
  get tapToPlay() { return i18n.t('tapToPlay', { defaultValue: 'වාදනය කිරීමට තට්ටු කරන්න' }); },
  get showingPref() { return i18n.t('showingPref', { defaultValue: '✨ ඔබේ කැමති ක්‍රියාකාරකම් පෙන්වමින්' }); },
  get editPrefs() { return i18n.t('editPrefs', { defaultValue: 'සංස්කරණය →' }); },
  get messagesForYou() { return i18n.t('messagesForYou', { defaultValue: '💜 ඔබ වෙනුවෙන් පණිවිඩ' }); },
  get start() { return i18n.t('start', { defaultValue: 'ආරම්භ' }); },
  get playNow() { return i18n.t('playNow', { defaultValue: 'ක්‍රීඩා කරන්න →' }); },
  get updatePrefs() { return i18n.t('updatePrefs', { defaultValue: '⚙️ ක්‍රියාකාරකම් සහ ක්‍රීඩා මනාපයන් යාවත්කාලීන කරන්න' }); },
  get mediumRiskMsg() { return i18n.t('mediumRiskMsg', { defaultValue: 'ඔබ යම් බරක් රැගෙන සිටිනවා. සෞඛ්‍ය සේවකයෙකු සහ විශේෂඥ කෙනෙකු සමඟ කතා කිරීම ගැන සලකා බලන්න. ඔබ ඒ ආධාරයට සුදුසුයි 💜' }); },

  // Preferences
  get myPreferences() { return i18n.t('myPreferences', { defaultValue: 'මගේ මනාපයන් 💜' }); },
  get prefSubtitle() { return i18n.t('prefSubtitle', { defaultValue: 'ඔබ වඩාත් ප්‍රිය කරන ක්‍රියාකාරකම් සහ ක්‍රීඩා තෝරන්න. ඔබ ඒවා පමණක් නිර්දේශ කරනු ලැබේ.' }); },
  get mindfulActs() { return i18n.t('mindfulActs', { defaultValue: '🧘 සිහිකල්පනා ක්‍රියාකාරකම්' }); },
  get chooseActs() { return i18n.t('chooseActs', { defaultValue: 'ඔබ රුචි ඕනෑම දෙයක් තෝරන්න' }); },
  get gamesSection() { return i18n.t('gamesSection', { defaultValue: '🎮 ක්‍රීඩා' }); },
  get chooseGames() { return i18n.t('chooseGames', { defaultValue: 'ඔබ ක්‍රීඩා කිරීමට කැමති ක්‍රීඩා තෝරන්න' }); },
  get selected() { return i18n.t('selected', { defaultValue: 'තෝරාගත්' }); },
  get savePrefs() { return i18n.t('savePrefs', { defaultValue: 'මගේ මනාපයන් සුරකින්න ✓' }); },
  get skipNow() { return i18n.t('skipNow', { defaultValue: 'දැනට මඟහරින්න' }); },

  // Activities
  get activitiesTitle() { return i18n.t('activitiesTitle', { defaultValue: 'ක්‍රියාකාරකම් සහ ක්‍රීඩා 🌸' }); },
  get actSubtitle() { return i18n.t('actSubtitle', { defaultValue: 'සිහිකල්පනා ක්‍රියාකාරකම් 10 සහ ක්‍රීඩා 5' }); },
  get calmGames() { return i18n.t('calmGames', { defaultValue: '🎮 සන්සුන් ක්‍රීඩා' }); },
  get backToActs() { return i18n.t('backToActs', { defaultValue: '← ක්‍රියාකාරකම්' }); },
  get backToGames() { return i18n.t('backToGames', { defaultValue: '← ක්‍රීඩා' }); },
  get beginCycles() { return i18n.t('beginCycles', { defaultValue: 'ආරම්භ කරන්න ▶' }); },
  get beginActivity() { return i18n.t('beginActivity', { defaultValue: 'ක්‍රියාකාරකම ආරම්භ කරන්න ▶' }); },
  get wellDone() { return i18n.t('wellDone', { defaultValue: 'ලස්සනට කෙළේ, අම්මා! 🌸' }); },
  get cyclesDone() { return i18n.t('cyclesDone', { defaultValue: 'චක්‍ර සම්පූර්ණ කළා.' }); },
  get howFeelNow() { return i18n.t('howFeelNow', { defaultValue: 'දැන් ඔබට කොහොමද? 💜' }); },
  get actComplete() { return i18n.t('actComplete', { defaultValue: '🌸 ශාබාස්! ක්‍රියාකාරකම සම්පූර්ණයි.' }); },
  get nextPrompt() { return i18n.t('nextPrompt', { defaultValue: 'ඊළඟ ප්‍රශ්නය →' }); },
  get prevPrompt() { return i18n.t('prevPrompt', { defaultValue: '← කලින්' }); },
  get allPromptsDone() { return i18n.t('allPromptsDone', { defaultValue: '🌸 ඔබ ප්‍රශ්න 5 ම සිතූ. එය ධෛර්යයකි. 💜' }); },
  get step() { return i18n.t('step', { defaultValue: 'පියවර' }); },
  get of() { return i18n.t('of', { defaultValue: 'න්' }); },
  get cycle() { return i18n.t('cycle', { defaultValue: 'චක්‍රය' }); },

  // Games - Bubble Pop
  get bubblePop() { return i18n.t('bubblePop', { defaultValue: 'බුබුළු ෆොන් ෆොන් 🫧' }); },
  get bubblesPopped() { return i18n.t('bubblesPopped', { defaultValue: 'බුබුළු ෆොන් කළා' }); },
  get tapBubbles() { return i18n.t('tapBubbles', { defaultValue: 'සන්සුන් වීමට බුබුළු ස්පර්ශ කරන්න! 💜' }); },

  // Games - Word Match
  get wordMatch() { return i18n.t('wordMatch', { defaultValue: 'වචන ගළපීම 💬' }); },
  get matchHint() { return i18n.t('matchHint', { defaultValue: 'සෑම වචනයක්ම එහි සංකේතයට ගළපන්න' }); },
  get score() { return i18n.t('score', { defaultValue: 'ලකුණු:' }); },
  get perfectMatch() { return i18n.t('perfectMatch', { defaultValue: '🎉 පරිපූර්ණ ගළපීම!' }); },

  // Games - Colouring
  get colourGarden() { return i18n.t('colourGarden', { defaultValue: 'ගස් පිංතාරය 🌺' }); },
  get colourHint() { return i18n.t('colourHint', { defaultValue: 'වර්ණයක් තෝරා මලේ කොටසක් ස්පර්ශ කරන්න' }); },
  get pickColour() { return i18n.t('pickColour', { defaultValue: '🎨 වර්ණයක් තෝරන්න' }); },
  get resetColours() { return i18n.t('resetColours', { defaultValue: 'නැවත සකසන්න' }); },

  // Games - Mandala
  get mandalaArt() { return i18n.t('mandalaArt', { defaultValue: 'මණ්ඩල කලා 🔮' }); },
  get mandalaHint() { return i18n.t('mandalaHint', { defaultValue: 'වර්ණයක් තෝරා කොටසක් ස්පර්ශ කරන්න — සමමිතිය ස්වයංක්‍රීය!' }); },
  get clearMandala() { return i18n.t('clearMandala', { defaultValue: 'ඉවත් කරන්න' }); },
  get savePrint() { return i18n.t('savePrint', { defaultValue: '🖨️ මුද්‍රණය / සුරකින්න' }); },
  get mandalaFifty() { return i18n.t('mandalaFifty', { defaultValue: '✨ සම්පූර්ණ කර ඇත! මුද්‍රණය කළ හැකිය' }); },
  get printMandala() { return i18n.t('printMandala', { defaultValue: '🖨️ මුද්‍රණය කරන්න' }); },
  get continuePaint() { return i18n.t('continuePaint', { defaultValue: '🎨 දිගටම ඇඳීම' }); },
  get mandalaComplete() { return i18n.t('mandalaComplete', { defaultValue: '✨ ඔබේ මණ්ඩලය සම්පූර්ණ! 🔮' }); },
  get mandalaCompleteMsg() { return i18n.t('mandalaCompleteMsg', { defaultValue: 'ඔබ සුන්දර කෘතියක් නිර්මාණය කළා. එය මුද්‍රණය කරන්න!' }); },

  // Progress
  get yourJourney() { return i18n.t('yourJourney', { defaultValue: 'ඔබේ ගමන 🌱' }); },
  get avgMood() { return i18n.t('avgMood', { defaultValue: 'සාමාන්‍ය මනෝ.' }); },
  get dayStreak() { return i18n.t('dayStreak', { defaultValue: 'දින ධාරාව' }); },
  get happyDays() { return i18n.t('happyDays', { defaultValue: 'සතුටු දිනයන්' }); },
  get chartTab() { return i18n.t('chartTab', { defaultValue: '📈 ප්‍රස්තාරය' }); },
  get summaryTab() { return i18n.t('summaryTab', { defaultValue: '📋 සාරාංශය' }); },
  get badgesTab() { return i18n.t('badgesTab', { defaultValue: '🏆 බැජ්' }); },
  get moodTracker() { return i18n.t('moodTracker', { defaultValue: '7-දින මනෝ ලුහුබැඳීම' }); },
  get weekStory() { return i18n.t('weekStory', { defaultValue: 'මෙම සතියේ කතාව ✨' }); },
  get doingAmazing() { return i18n.t('doingAmazing', { defaultValue: 'ඔබ අද්භූත ලෙස කරමින් සිටිති!' }); },
  get riskOverview() { return i18n.t('riskOverview', { defaultValue: 'දෛනික අවදානම් දළ විශ්ලේෂණය' }); },
  get today() { return i18n.t('today', { defaultValue: '(අද)' }); },
  get earnedBadges() { return i18n.t('earnedBadges', { defaultValue: 'ලබාගත් බැජ් 🏅' }); },
  get outOf() { return i18n.t('outOf', { defaultValue: 'න්' }); },
  get earnedBadge() { return i18n.t('earnedBadge', { defaultValue: '✓ ලබාගත්' }); },
  get lockedBadge() { return i18n.t('lockedBadge', { defaultValue: 'අගුළු දැමූ' }); },

  // Onboarding
  get welcome() { return i18n.t('welcome', { defaultValue: 'බ්ලූම් වෙත සාදරයෙන් 🌸' }); },
  get on1Sub() { return i18n.t('on1Sub', { defaultValue: 'ඔබ වෙනුවෙන්ම නිර්මාණය කළ ඉඩකඩකි, අම්මා. ඔබටත් සැලකිලිමත් වීමට ඔබ සුදුසුයි.' }); },
  get on2Title() { return i18n.t('on2Title', { defaultValue: 'ඔබේ දිනපොත, විශ්ලේෂණය කළ' }); },
  get on2Sub() { return i18n.t('on2Sub', { defaultValue: 'අපි ඔබේ දිනපොත කියවා ඔබේ හැඟීම් ස්වයංක්‍රීයව හඳුනාගනිමු.' }); },
  get on3Title() { return i18n.t('on3Title', { defaultValue: 'බුද්ධිමත් නිර්දේශ' }); },
  get on3Sub() { return i18n.t('on3Sub', { defaultValue: 'ඔබේ මනෝභාවය සහ අවදානම් මට්ටම මත — සංගීතය, වීඩියෝ සහ ක්‍රියාකාරකම් නිර්දේශ කෙරේ.' }); },
  get on4Title() { return i18n.t('on4Title', { defaultValue: 'සන්සුන් ක්‍රීඩා සහ ක්‍රියාකාරකම්' }); },
  get on4Sub() { return i18n.t('on4Sub', { defaultValue: 'බුබුළු ෆොන්, වචන ගළපීම, ළදරු ඇඳුම්, ගස් පිංතාරය, මණ්ඩල — ඔබේ මනස ලිහිල් කිරීමට.' }); },
  get on5Title() { return i18n.t('on5Title', { defaultValue: 'ඔබේ මනාපයන්' }); },
  get on5Sub() { return i18n.t('on5Sub', { defaultValue: 'ඔබ ප්‍රිය කරන ක්‍රියාකාරකම් සහ ක්‍රීඩා තෝරන්න — ඒවා පමණක් නිර්දේශ කෙරේ.' }); },
  get getStarted() { return i18n.t('getStarted', { defaultValue: 'ආරම්භ කරන්න 🌸' }); },
  get continueBtn() { return i18n.t('continueBtn', { defaultValue: 'ඉදිරියට →' }); },
  get skipBtn() { return i18n.t('skipBtn', { defaultValue: 'මඟ හරින්න' }); },

  get affirmations() {
    return [
      i18n.t('affirmation_0', { defaultValue: 'ඔබ අද්භූත කාර්යයක් කරමින් සිටිති. ඔබ ඔබේ දරුවාට ලබාදෙන ආදරය ලෝකය දනී.' }),
      i18n.t('affirmation_1', { defaultValue: 'පරිපූර්ණ මවක් නැත — සැබෑ මවක් පමණයි. ඒ ඔබයි.' }),
      i18n.t('affirmation_2', { defaultValue: 'විශ්‍රාම ගැනීම අත්හැරීමක් නොවේ. ඉදිරි දේ සඳහා ශක්තිය රැස් කිරීමකි.' }),
      i18n.t('affirmation_3', { defaultValue: 'ඔබ මිනිස් ජීවියෙකු වර්ධනය කළා. අද ඔබ ගැනම දයාබරව සිතන්න.' }),
      i18n.t('affirmation_4', { defaultValue: 'ඔබේ දරුවාට ඔබ — හරියටම ඔබ — අවශ්‍යයි.' }),
      i18n.t('affirmation_5', { defaultValue: 'සුව කිරීම රේඛීය නොවේ. සෑම දිනයක්ම ගණන් ගැනේ.' }),
      i18n.t('affirmation_6', { defaultValue: 'ඔබ තනිවම නොමැත. ලොව පුරා අම්මලා ඔබ හා ය.' })
    ];
  },

  get supportMessages() {
    return {
      loneliness: [
        i18n.t('support_loneliness_0', { defaultValue: 'බොහෝ අම්මලාට මෙය දැනේ — ඔබ ලෝකව්‍යාප්ත සහෝදරත්වයක කොටසකි 💜' }),
        i18n.t('support_loneliness_1', { defaultValue: 'තනිකම රාත්‍රියේ ශබ්ද කරයි. හෙට නව ආලෝකය ගෙනෙයි 🌸' })
      ],
      fatigue: [
        i18n.t('support_fatigue_0', { defaultValue: 'නිවා ගැනීම ඔබ සහ ඔබේ දරුවාට ආදරය කිරීමකි 🌙' }),
        i18n.t('support_fatigue_1', { defaultValue: 'ඔබේ ශරීරය මිනිසෙකු සාදා ගත්තා. අද ඒ ගැන මෘදු වෙන්න 🌸' })
      ],
      anxiety: [
        i18n.t('support_anxiety_0', { defaultValue: 'ඔබේ කාංසාව ආදරය — ගොඩ බිමකට ළඟා වීමට 💜' }),
        i18n.t('support_anxiety_1', { defaultValue: 'ඔබ ආරක්ෂිතයි. ඔබ සිටිනවා. ඔබ ප්‍රමාණවත් 🌿' })
      ],
      bonding_issues: [
        i18n.t('support_bonding_issues_0', { defaultValue: 'බැඳීම සෑම විටම ක්ෂණික නොවේ — ආදරය නිශ්ශබ්දව, ස්ථිරව වර්ධනය වෙයි 🌸' }),
        i18n.t('support_bonding_issues_1', { defaultValue: 'සෑම ස්පර්ශයක්, සෑම කිරි දීමක් — ඒ බැඳීමකි. ඔබ දැනටමත් ඒ කරනවා 💜' })
      ],
      lack_of_support: [
        i18n.t('support_lack_of_support_0', { defaultValue: 'ආධාර ඉල්ලා සිටීම ශ්‍රේෂ්ඨ ධෛර්යයකි 💜' }),
        i18n.t('support_lack_of_support_1', { defaultValue: 'ඔබට ගමක් ලැබෙන්නට සුදුසුයි. අද ඒ ගමේ කොටස් අය අපි 🌸' })
      ],
      sleep_problems: [
        i18n.t('support_sleep_problems_0', { defaultValue: 'විනාඩි 20 ක් පවා ගොනු ගැනීම ගණන් ගැනේ 🌙' }),
        i18n.t('support_sleep_problems_1', { defaultValue: 'නිදා ගැනීමේ අහිමිය තාවකාලිකයි. ඔබේ ශක්තිය ස්ථිරයි 💜' })
      ],
      loss_of_confidence: [
        i18n.t('support_loss_of_confidence_0', { defaultValue: 'පරිපූර්ණ මවක් නැත — සැබෑ මවක් පමණයි. ඒ ඔබයි 🌸' }),
        i18n.t('support_loss_of_confidence_1', { defaultValue: 'සැකය සත්‍ය නොවේ. ඔබ ආදරණීය, හැකි, ප්‍රමාණවත් 💜' })
      ],
      overwhelmed: [
        i18n.t('support_overwhelmed_0', { defaultValue: 'අද සෑම දෙයක්ම කළ යුතු නැත. එක් ශ්වාසයක්, එක් මොහොතක් 💜' }),
        i18n.t('support_overwhelmed_1', { defaultValue: 'ශ්‍රාන්තතාවය ගැඹුරින් ගත කළ බැවිනි. ඒ රැගෙන යාමට ඉඩ දෙන්න 🌸' })
      ],
      physical_discomfort: [
        i18n.t('support_physical_discomfort_0', { defaultValue: 'ඔබේ ශරීරය සාධාරණ දෙයක් කළා. ඒ ගැන ගෞරවය දෙන්න 🌸' }),
        i18n.t('support_physical_discomfort_1', { defaultValue: 'සුවය ලැබීමට කාලය ගත වෙයි. ඔබ ලස්සනට කරනවා 💜' })
      ],
      negative_thoughts: [
        i18n.t('support_negative_thoughts_0', { defaultValue: 'අඳුරු සිතිවිලි සත්‍ය නොවේ — ඒ කාලගුණය. ඒ ද ගෙවී යයි 💜' }),
        i18n.t('support_negative_thoughts_1', { defaultValue: 'ඔබ දකිනවා, ඔබ වටිනවා, ඔබ තනිවම නොමැත 🌸' })
      ]
    };
  }
};
