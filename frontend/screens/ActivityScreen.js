// ActivityScreen.js — Bloom Postpartum App (Full Sinhala)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { ALL_ACTIVITIES, NEW_ACTIVITIES } from '../services/activitiesLibrary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import useGameSession, { recordActivityApi } from '../hooks/useGameSession';

const { width, height } = Dimensions.get('window');

const CongratsPopup = ({
  visible,
  onPlayAgain,
  onClose,
  title = 'ශ්‍රේෂ්ඨයි!',
  msg = 'ඔබ අපූරුයි! 💜',
  playAgainText = '🎮 නැවත ක්‍රීඩා කරන්න',
  closeText = '✕ වසන්න'
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, { toValue: -10, duration: 400, useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scale.setValue(0);
      bounce.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose || onPlayAgain}>
      <View style={cp.overlay}>
        <Animated.View style={[cp.box, { transform: [{ scale }] }]}>
          <View style={cp.row}>
            {['🎉', '🌸', '✨', '💜', '⭐'].map((c, i) => (
              <Text key={i} style={cp.conf}>{c}</Text>
            ))}
          </View>
          <Animated.Text style={[cp.big, { transform: [{ translateY: bounce }] }]}>🌟</Animated.Text>
          <Text style={cp.title}>{title}</Text>
          <Text style={cp.msg}>{msg}</Text>
          <View style={cp.row}>
            {['🎊', '💫', '🌺', '🌟', '💕'].map((c, i) => (
              <Text key={i} style={cp.conf}>{c}</Text>
            ))}
          </View>
          <View style={{ width: '100%', gap: 10, marginTop: 10 }}>
            {onPlayAgain && (
              <TouchableOpacity style={cp.btn} onPress={onPlayAgain} activeOpacity={0.85}>
                <LinearGradient colors={['#E91E8C', '#7E57C2']} style={cp.btnIn}>
                  <Text style={cp.btnT}>{playAgainText}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {onClose && (
              <TouchableOpacity style={[cp.btn]} onPress={onClose} activeOpacity={0.85}>
                <LinearGradient colors={['#757575', '#9E9E9E']} style={cp.btnIn}>
                  <Text style={cp.btnT}>{closeText}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const cp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  box: { backgroundColor: 'white', borderRadius: 26, padding: 26, alignItems: 'center', width: '100%', maxWidth: 340 },
  row: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  conf: { fontSize: 20 },
  big: { fontSize: 60, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '900', color: '#E91E8C', marginBottom: 6, textAlign: 'center' },
  msg: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 14, lineHeight: 22 },
  btn: { borderRadius: 999, overflow: 'hidden', width: '100%' },
  btnIn: { paddingVertical: 14, alignItems: 'center' },
  btnT: { color: 'white', fontWeight: '900', fontSize: 15 },
});

const BreathingEx = ({ activity, onComplete }) => {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [pi, setPi] = useState(0);
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(1);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const phases = activity.phases;
  const CYCLES = activity.cycles || 4;

  useEffect(() => {
    if (!running) return;
    const ph = phases[pi];
    setCount(ph.seconds);
    Animated.timing(scaleAnim, { toValue: ph.scale, duration: ph.seconds * 1000, useNativeDriver: true }).start();
    const t = setInterval(() => setCount((c) => (c > 1 ? c - 1 : c)), 1000);
    const a = setTimeout(() => {
      clearInterval(t);
      const nx = pi + 1;
      if (nx >= phases.length) {
        if (cycle >= CYCLES) {
          setRunning(false);
          setDone(true);
          onComplete?.();
        } else {
          setCycle((c) => c + 1);
          setPi(0);
        }
      } else setPi(nx);
    }, ph.seconds * 1000);
    return () => {
      clearInterval(t);
      clearTimeout(a);
    };
  }, [running, pi, cycle]);

  if (done)
    return (
      <LinearGradient colors={activity.color} style={bx.done}>
        <Text style={bx.doneEmoji}>🌸</Text>
        <Text style={bx.doneTitle}>අපූරුයි! 🌸</Text>
        <Text style={bx.doneMsg}>{CYCLES} වට 💜</Text>
      </LinearGradient>
    );
  return (
    <View style={bx.cont}>
      {!running && (
        <LinearGradient colors={activity.color} style={bx.intro}>
          <Text style={bx.introText}>{activity.intro}</Text>
        </LinearGradient>
      )}
      <View style={bx.circleWrap}>
        <Animated.View style={[bx.circleOuter, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={activity.color} style={bx.circleInner}>
            <Text style={bx.icon}>{activity.icon}</Text>
            {running && <Text style={[bx.count, { color: activity.accent }]}>{count}</Text>}
          </LinearGradient>
        </Animated.View>
      </View>
      {running && (
        <View style={bx.info}>
          <Text style={[bx.phaseName, { color: activity.accent }]}>{phases[pi]?.name}</Text>
          <Text style={bx.phaseInstr}>{phases[pi]?.instruction}</Text>
          <Text style={bx.cycleT}>වට {cycle}/{CYCLES}</Text>
        </View>
      )}
      {!running && (
        <TouchableOpacity
          style={bx.startBtn}
          onPress={() => {
            setRunning(true);
            setPi(0);
            setCycle(1);
          }}
        >
          <LinearGradient colors={[activity.accent, '#E91E8C']} style={bx.startBtnIn}>
            <Text style={bx.startBtnText}>ආරම්භ ▶</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const GuidedAct = ({ activity, onComplete }) => {
  const [started, setStarted] = useState(false);
  const [si, setSi] = useState(0);
  const [tLeft, setTLeft] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!started || done) return;
    const step = activity.steps[si];
    setTLeft(step.duration);
    const t = setInterval(() => setTLeft((v) => (v > 1 ? v - 1 : v)), 1000);
    const a = setTimeout(() => {
      clearInterval(t);
      if (si + 1 >= activity.steps.length) {
        setDone(true);
        onComplete?.();
      } else setSi((i) => i + 1);
    }, step.duration * 1000);
    return () => {
      clearInterval(t);
      clearTimeout(a);
    };
  }, [started, si]);

  const step = activity.steps[si];
  const pct = started && step ? ((step.duration - tLeft) / step.duration) * 100 : 0;
  if (done)
    return (
      <LinearGradient colors={activity.color} style={gd.done}>
        <Text style={gd.doneEmoji}>🌸</Text>
        <Text style={gd.doneTitle}>ශ්‍රේෂ්ඨයි!</Text>
      </LinearGradient>
    );

  return (
    <View>
      {!started ? (
        <>
          <LinearGradient colors={activity.color} style={gd.intro}>
            <Text style={gd.introText}>{activity.intro}</Text>
          </LinearGradient>
          <TouchableOpacity style={gd.startBtn} onPress={() => setStarted(true)}>
            <LinearGradient colors={[activity.accent, '#E91E8C']} style={gd.startBtnIn}>
              <Text style={gd.startBtnText}>ආරම්භ ▶</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={gd.dotsRow}>
            {activity.steps.map((_, i) => (
              <View key={i} style={[gd.dot, i === si && gd.dotA, i < si && gd.dotD]} />
            ))}
          </View>
          <LinearGradient colors={activity.color} style={gd.stepCard}>
            <Text style={[gd.stepLabel, { color: activity.accent }]}>{step.label}</Text>
            <Text style={gd.stepText}>{step.text}</Text>
          </LinearGradient>
          <View style={gd.timerRow}>
            <View style={gd.timerCircle}>
              <Text style={[gd.timerCount, { color: activity.accent }]}>{tLeft}</Text>
            </View>
            <View style={gd.timerBg}>
              <View style={[gd.timerFill, { width: `${pct}%`, backgroundColor: activity.accent }]} />
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const PromptsAct = ({ activity, onComplete }) => {
  const [idx, setIdx] = useState(0);
  const isLast = idx === activity.prompts.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete?.();
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <View>
      <LinearGradient colors={activity.color} style={pr.intro}>
        <Text style={pr.introText}>{activity.intro}</Text>
      </LinearGradient>
      <Text style={pr.counter}>{idx + 1}/{activity.prompts.length}</Text>
      <LinearGradient colors={['#FFF9C4', '#FFF0C0']} style={pr.card}>
        <Text style={pr.cardEmoji}>💭</Text>
        <Text style={pr.cardText}>{activity.prompts[idx]}</Text>
      </LinearGradient>
      <View style={pr.btnRow}>
        {idx > 0 && (
          <TouchableOpacity style={pr.prev} onPress={() => setIdx((i) => i - 1)}>
            <Text style={pr.prevT}>← ආපසු</Text>
          </TouchableOpacity>
        )}
        {!isLast ? (
          <TouchableOpacity style={pr.next} onPress={handleNext}>
            <LinearGradient colors={[activity.accent, '#E91E8C']} style={pr.nextIn}>
              <Text style={pr.nextT}>ඊළඟ →</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleNext}>
            <LinearGradient colors={['#EDE7F6', '#FCE4EC']} style={pr.done}>
              <Text style={pr.doneT}>🌸 සම්පූර්ණ!</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// WORD SEARCH
const WS_LISTS = [
  { words: ['MOM', 'BABY', 'LOVE', 'CALM', 'REST', 'HOPE'], title: 'අම්මා සහ ළදරු' },
  { words: ['PEACE', 'JOY', 'SLEEP', 'CARE', 'WARM', 'SOFT'], title: 'සාමය සහ සතුට' },
  { words: ['HEART', 'SMILE', 'BRAVE', 'GROW', 'BOND', 'SAFE'], title: 'ආදරය සහ ශක්තිය' },
];
const WR = 8, WC_ = 8;
const buildGrid = (words) => {
  const grid = Array.from({ length: WR }, () => Array(WC_).fill(''));
  const placed = [];
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  words.forEach((word) => {
    for (let a = 0; a < 300; a++) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const row = Math.floor(Math.random() * WR), col = Math.floor(Math.random() * WC_);
      const cells = [];
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dir[0] * i, c = col + dir[1] * i;
        if (r < 0 || r >= WR || c < 0 || c >= WC_ || (grid[r][c] !== '' && grid[r][c] !== word[i])) {
          fits = false;
          break;
        }
        cells.push([r, c]);
      }
      if (fits) {
        cells.forEach(([r, c], i) => { grid[r][c] = word[i]; });
        placed.push({ word, cells });
        break;
      }
    }
  });
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < WR; r++)
    for (let c = 0; c < WC_; c++)
      if (grid[r][c] === '') grid[r][c] = L[Math.floor(Math.random() * L.length)];
  return { grid, placed };
};

const WordSearch = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'word_search', gameName: 'වචන සෙවීම', icon: '🔤', onGoBack });
  const [listIdx, setListIdx] = useState(0);
  const wl = WS_LISTS[listIdx];
  const [pd, setPd] = useState(() => buildGrid(wl.words));
  const [sel, setSel] = useState([]);
  const [found, setFound] = useState([]);
  const [flash, setFlash] = useState(false);

  const cellSize = Math.floor((width - spacing.md * 2 - 16) / WC_);
  const isS = (r, c) => sel.some((s) => s.r === r && s.c === c);
  const isF = (r, c) =>
    found.some((fw) => {
      const p = pd.placed.find((x) => x.word === fw);
      return p && p.cells.some(([pr, pc]) => pr === r && pc === c);
    });

  const tapCell = (r, c) => {
    const already = sel.findIndex((s) => s.r === r && s.c === c);
    const newSel = already >= 0 ? sel.filter((_, i) => i !== already) : [...sel, { r, c }];
    setSel(newSel);
    if (newSel.length >= 2) {
      const str = newSel.map((s) => pd.grid[s.r][s.c]).join('');
      const rev = [...str].reverse().join('');
      let matched = false;
      for (const { word, cells } of pd.placed) {
        if (found.includes(word)) continue;
        const fwd = word === str && cells.every((c2, i) => c2[0] === newSel[i]?.r && c2[1] === newSel[i]?.c);
        const bwd = word === rev && [...cells].reverse().every((c2, i) => c2[0] === newSel[i]?.r && c2[1] === newSel[i]?.c);
        if (fwd || bwd) {
          const nf = [...found, word];
          setFound(nf);
          setSel([]);
          matched = true;
          if (nf.length === wl.words.length) {
            session.triggerComplete(`ලකුණු: ${nf.length}/${wl.words.length}`);
          }
          break;
        }
      }
      if (!matched && newSel.length >= Math.max(...wl.words.map((w) => w.length))) {
        setFlash(true);
        setTimeout(() => {
          setFlash(false);
          setSel([]);
        }, 500);
      }
    }
  };

  const restart = (idx) => {
    const w = WS_LISTS[idx];
    setPd(buildGrid(w.words));
    setSel([]);
    setFound([]);
    setListIdx(idx);
  };

  return (
    <View style={ws.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(() => restart(listIdx))}
        onClose={session.handleClose}
        title={`${wl.title} ජය!`}
        msg="සියලු වචන සොයා ගත්තා! 💜"
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={ws.header}>
        <Text style={ws.title}>🔤 වචන සෙවීම</Text>
        <View style={ws.badge}>
          <Text style={ws.badgeTxt}>{found.length}/{wl.words.length}</Text>
        </View>
      </View>
      <Text style={ws.subtitle}>{wl.title}</Text>
      <View style={[ws.gridWrap, { width: cellSize * WC_ + 10 }]}>
        {pd.grid.map((row, r) => (
          <View key={r} style={ws.gridRow}>
            {row.map((letter, c) => {
              const s2 = isS(r, c), fnd = isF(r, c), wrong = flash && s2;
              return (
                <TouchableOpacity
                  key={`${r},${c}`}
                  onPress={() => tapCell(r, c)}
                  style={[
                    ws.cell,
                    { width: cellSize - 3, height: cellSize - 3 },
                    s2 && ws.cellSel,
                    fnd && ws.cellFound,
                    wrong && ws.cellWrong,
                  ]}
                >
                  <Text
                    style={[
                      ws.cellTxt,
                      { fontSize: Math.floor(cellSize * 0.36) },
                      fnd && ws.cellTxtF,
                      s2 && ws.cellTxtS,
                    ]}
                  >
                    {letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
      <View style={ws.wordList}>
        {wl.words.map((w) => (
          <View key={w} style={[ws.chip, found.includes(w) && ws.chipFound]}>
            <Text style={[ws.chipTxt, found.includes(w) && ws.chipTxtF]}>
              {found.includes(w) ? '✓ ' : ''}{w}
            </Text>
          </View>
        ))}
      </View>
      <View style={ws.diffRow}>
        {WS_LISTS.map((wl2, i) => (
          <TouchableOpacity key={i} onPress={() => restart(i)} style={[ws.diffBtn, listIdx === i && ws.diffBtnOn]}>
            <Text style={[ws.diffTxt, listIdx === i && ws.diffTxtOn]}>{wl2.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={ws.newBtn} onPress={() => restart(listIdx)}>
        <Text style={ws.newBtnTxt}>↺ නව</Text>
      </TouchableOpacity>
    </View>
  );
};



// MEMORY MATCH
const MM_ALL_EMOJIS = ['🍼', '🧸', '🌸', '☁️', '⭐', '🌈', '🐥', '🐘', '🍎', '🌙', '❤️', '🦋', '🌺', '🎀', '🍭', '🐣', '🌻', '🎵'];
const MM_LEVELS = [
  { level: 1, cols: 2, rows: 2 },
  { level: 2, cols: 3, rows: 2 },
  { level: 3, cols: 3, rows: 2 },
  { level: 4, cols: 4, rows: 3 },
  { level: 5, cols: 4, rows: 4 },
  { level: 6, cols: 5, rows: 4 },
  { level: 7, cols: 4, rows: 5 },
  { level: 8, cols: 5, rows: 5 },
  { level: 9, cols: 5, rows: 6 },
  { level: 10, cols: 6, rows: 6 },
];
const MM_STORAGE_KEY = '@mm_progress';

const loadMMUnlocked = async () => {
  try {
    const raw = await AsyncStorage.getItem(MM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : 1;
  } catch (_) {
    return 1;
  }
};
const saveMMUnlocked = async (lvl) => {
  try {
    await AsyncStorage.setItem(MM_STORAGE_KEY, JSON.stringify(lvl));
  } catch (_) { }
};

const makeMMCards = (level) => {
  const cfg = MM_LEVELS[level - 1];
  const pairs = (cfg.cols * cfg.rows) / 2;
  const emojis = MM_ALL_EMOJIS.slice(0, Math.min(pairs, MM_ALL_EMOJIS.length));
  const extended = pairs > emojis.length ? [...emojis, ...emojis.slice(0, pairs - emojis.length)] : emojis;
  return extended
    .flatMap((e, i) => [
      { id: i * 2, emoji: e, flipped: false, matched: false },
      { id: i * 2 + 1, emoji: e, flipped: false, matched: false },
    ])
    .sort(() => Math.random() - 0.5);
};

const MMlevelSelect = ({ unlocked, onSelect, onBack }) => (
  <View style={mm.lsCont}>
    <TouchableOpacity onPress={onBack} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
      <Text style={s.backText}>← ආපසු</Text>
    </TouchableOpacity>
    <Text style={mm.lsTitle}>🃏 මතක ගැළපීම</Text>
    <Text style={mm.lsSub}>මට්ටමක් තෝරන්න 💜</Text>
    <View style={mm.lsGrid}>
      {MM_LEVELS.map((cfg) => {
        const locked = cfg.level > unlocked;
        return (
          <TouchableOpacity
            key={cfg.level}
            onPress={() => !locked && onSelect(cfg.level)}
            activeOpacity={locked ? 1 : 0.8}
            style={[mm.lsCard, locked && mm.lsCardLocked]}
          >
            <LinearGradient
              colors={locked ? ['#EEEEEE', '#E0E0E0'] : ['#F3E5F5', '#EDE7F6']}
              style={mm.lsCardGrad}
            >
              <Text style={[mm.lsNum, locked && { color: '#BDBDBD' }]}>
                {locked ? '🔒' : cfg.level}
              </Text>
              <Text style={[mm.lsGrid2, locked && { color: '#BDBDBD' }]}>
                {cfg.cols}×{cfg.rows}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const MMCompletionPopup = ({ visible, level, moves, duration, onContinue, onReplay, onBack }) => {
  const sc = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) Animated.spring(sc, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    else sc.setValue(0);
  }, [visible]);
  if (!visible) return null;
  const isLast = level >= MM_LEVELS.length;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onBack}>
      <View style={mm.cpOverlay}>
        <Animated.View style={[mm.cpBox, { transform: [{ scale: sc }] }]}>
          <Text style={mm.cpConfetti}>🎉 🌸 ✨ 💜 ⭐</Text>
          <Text style={mm.cpBig}>🌟</Text>
          <Text style={mm.cpTitle}>ශ්‍රේෂ්ඨයි! 🎊</Text>
          <Text style={mm.cpLevel}>මට්ටම {level} සම්පූර්ණ!</Text>
          <View style={mm.cpStats}>
            <View style={mm.cpStat}>
              <Text style={mm.cpStatLbl}>👆 ඇදීම්</Text>
              <Text style={mm.cpStatVal}>{moves}</Text>
            </View>
            <View style={mm.cpStatDiv} />
            <View style={mm.cpStat}>
              <Text style={mm.cpStatLbl}>⏱ කාලය</Text>
              <Text style={mm.cpStatVal}>{duration}s</Text>
            </View>
          </View>
          <View style={mm.cpBtns}>
            {!isLast && (
              <TouchableOpacity style={mm.cpBtnMain} onPress={onContinue} activeOpacity={0.85}>
                <LinearGradient colors={['#7E57C2', '#E91E8C']} style={mm.cpBtnGrad}>
                  <Text style={mm.cpBtnMainT}>⭐ ඊළඟ මට්ටම</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={mm.cpBtnSec} onPress={onReplay} activeOpacity={0.85}>
              <Text style={mm.cpBtnSecT}>🔄 නැවත ක්‍රීඩා</Text>
            </TouchableOpacity>
            <TouchableOpacity style={mm.cpBtnBack} onPress={onBack} activeOpacity={0.85}>
              <Text style={mm.cpBtnBackT}>🏠 ආපසු</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const MMPauseModal = ({ visible, onResume, onRestart, onQuit }) => {
  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onResume}>
      <View style={mm.cpOverlay}>
        <View style={mm.pauseBox}>
          <Text style={mm.pauseTitle}>⏸ විරාමය</Text>
          <TouchableOpacity style={mm.pauseBtn} onPress={onResume}>
            <LinearGradient colors={['#7E57C2', '#E91E8C']} style={mm.pauseBtnGrad}>
              <Text style={mm.pauseBtnT}>▶ ඉදිරියට</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={mm.pauseBtnAlt} onPress={onRestart}>
            <Text style={mm.pauseBtnAltT}>🔄 නැවත ආරම්භ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={mm.pauseBtnAlt} onPress={onQuit}>
            <Text style={[mm.pauseBtnAltT, { color: '#E53935' }]}>🚪 ක්‍රීඩාව අවසන්</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MemoryMatch = ({ navigation, onGoBack }) => {
  const session = useGameSession({ gameId: 'memory_match', gameName: 'මතක ගැළපීම', icon: '🃏', onGoBack });
  const [screen, setScreen] = useState('select');
  const [unlocked, setUnlocked] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [sel, setSel] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [locked, setLocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showPause, setShowPause] = useState(false);
  const [paused, setPaused] = useState(false);

  const timerRef = useRef(null);
  const startRef = useRef(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    loadMMUnlocked().then((u) => setUnlocked(u));
  }, []);

  useEffect(() => {
    if (screen !== 'play' || paused) {
      clearInterval(timerRef.current);
      return;
    }
    startRef.current = Date.now() - elapsedRef.current * 1000;
    timerRef.current = setInterval(() => {
      const s = Math.round((Date.now() - startRef.current) / 1000);
      elapsedRef.current = s;
      setElapsed(s);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, paused]);

  const initLevel = (lvl) => {
    clearInterval(timerRef.current);
    elapsedRef.current = 0;
    setCurrentLevel(lvl);
    setCards(makeMMCards(lvl));
    setSel([]);
    setMoves(0);
    setMatched(0);
    setLocked(false);
    setElapsed(0);
    setPaused(false);
    setShowPause(false);
    session.startNewSession();
    setScreen('play');
  };

  const cfg = MM_LEVELS[currentLevel - 1];
  const pairs = (cfg.cols * cfg.rows) / 2;
  const cardGap = 6;
  const gridWidth = Math.min(width - spacing.md * 2, 520);
  const cardW = Math.floor((gridWidth - cardGap * (cfg.cols - 1) - 8) / cfg.cols);
  const maxAvailableH = height - 320; // safe padding for headers and status bar
  const cardH = Math.min(Math.floor(cardW * 1.25), Math.floor(maxAvailableH / cfg.rows));

  const tapCard = (card) => {
    if (locked || card.flipped || card.matched || paused) return;
    const next = cards.map((c) => (c.id === card.id ? { ...c, flipped: true } : c));
    setCards(next);
    const newSel = [...sel, card];
    if (newSel.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      setTimeout(() => {
        if (newSel[0].emoji === newSel[1].emoji) {
          setCards((prev) =>
            prev.map((c) => (c.emoji === newSel[0].emoji ? { ...c, matched: true, flipped: true } : c))
          );
          setMatched((m) => {
            const nm = m + 1;
            if (nm === pairs) {
              clearInterval(timerRef.current);
              const nextUnlocked = Math.max(unlocked, currentLevel + 1);
              setUnlocked(nextUnlocked);
              saveMMUnlocked(nextUnlocked);
              session.triggerComplete(`මට්ටම: ${currentLevel} | ඇදීම්: ${moves + 1}`);
            }
            return nm;
          });
        } else {
          setCards((prev) =>
            prev.map((c) => (newSel.some((s) => s.id === c.id) && !c.matched ? { ...c, flipped: false } : c))
          );
        }
        setSel([]);
        setLocked(false);
      }, 700);
    } else {
      setSel(newSel);
    }
  };

  const handleContinue = () => {
    const next = Math.min(currentLevel + 1, MM_LEVELS.length);
    session.handlePlayAgain(() => initLevel(next));
  };

  const handleReplay = () => {
    session.handlePlayAgain(() => initLevel(currentLevel));
  };

  const handleBackToSelect = () => {
    session.handleBack(() => {
      clearInterval(timerRef.current);
      setShowPause(false);
      setScreen('select');
    });
  };

  const handleQuit = () => {
    session.handleBack(() => {
      clearInterval(timerRef.current);
      setShowPause(false);
      setScreen('select');
    });
  };

  if (screen === 'select') {
    return <MMlevelSelect unlocked={unlocked} onSelect={initLevel} onBack={onGoBack} />;
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={mm.playCont}>
      <MMCompletionPopup
        visible={session.showCompletion}
        level={currentLevel}
        moves={moves}
        duration={elapsed}
        onContinue={handleContinue}
        onReplay={handleReplay}
        onBack={session.handleClose}
      />

      <MMPauseModal
        visible={showPause}
        onResume={() => {
          setShowPause(false);
          setPaused(false);
        }}
        onRestart={() => {
          setShowPause(false);
          session.handlePlayAgain(() => initLevel(currentLevel));
        }}
        onQuit={handleQuit}
      />

      <LinearGradient colors={['#EDE7F6', '#FCE4EC']} style={mm.playHeader}>
        <TouchableOpacity onPress={handleBackToSelect} style={mm.playBackBtn}>
          <Text style={mm.playBackT}>← ආපසු</Text>
        </TouchableOpacity>
        <View style={mm.playMeta}>
          <Text style={mm.playLvl}>මට්ටම {currentLevel}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setShowPause(true);
            setPaused(true);
          }}
          style={mm.pauseIconBtn}
        >
          <Text style={mm.pauseIconT}>⏸</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={mm.statsRow}>
        <View style={mm.statPill}>
          <Text style={mm.statPillLbl}>👆 ඇදීම්</Text>
          <Text style={mm.statPillVal}>{moves}</Text>
        </View>
        <View style={mm.statPill}>
          <Text style={mm.statPillLbl}>✅ ගළපීම</Text>
          <Text style={mm.statPillVal}>{matched}/{pairs}</Text>
        </View>
        <View style={mm.statPill}>
          <Text style={mm.statPillLbl}>⏱ කාලය</Text>
          <Text style={mm.statPillVal}>{fmt(elapsed)}</Text>
        </View>
      </View>

      <View style={[mm.playGrid, { gap: cardGap }]}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            onPress={() => tapCard(card)}
            activeOpacity={0.85}
            style={[mm.playCard, { width: cardW, height: cardH }]}
          >
            <Animated.View style={mm.playCardInner}>
              {card.flipped || card.matched ? (
                <LinearGradient
                  colors={card.matched ? ['#C8E6C9', '#A5D6A7'] : ['#E1BEE7', '#CE93D8']}
                  style={[mm.playCardFace, { borderRadius: 12 }]}
                >
                  <Text style={{ fontSize: Math.max(18, Math.floor(cardW * 0.42)) }}>{card.emoji}</Text>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={['#D1C4E9', '#B39DDB']}
                  style={[mm.playCardBack, { borderRadius: 12 }]}
                >
                  <Text style={{ fontSize: Math.max(16, Math.floor(cardW * 0.36)) }}>💜</Text>
                </LinearGradient>
              )}
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// BABY CUES / ළදරු හැඟීම
const BABY_CUES_DATA = [
  {
    id: "sleepy",
    sinhala: "නිදිමතයි",
    english: "Sleepy",
    emoji: "😴",
    image: require('../assets/baby-cues/sleepy.png'),
    explanation: "නිදිමත ඇති විට බබාට yawning, eye rubbing වැනි cues පෙන්විය හැක. (Eye rubbing, yawning, or turning away can be signs of sleepiness.)"
  },
  {
    id: "hungry",
    sinhala: "බඩගිනියි",
    english: "Hungry",
    emoji: "🍼",
    image: require('../assets/baby-cues/hungry.png'),
    explanation: "බබා බඩගිනි වූ විට hand-to-mouth movement, lip smacking, or sucking වැනි feeding cues පෙන්විය හැක. (Rooting, lip smacking, or putting hands to mouth are common hunger cues.)"
  },
  {
    id: "burp",
    sinhala: "බර්ප් අවශ්‍යයි",
    english: "Needs to Burp",
    emoji: "🤱",
    image: require('../assets/baby-cues/burp.png'),
    explanation: "බබාට බර්ප් අවශ්‍ය වූ විට squirming, grimacing, or crying during feeding වැනි cues පෙන්විය හැක. (Arching the back or squirming during feed might mean a burp is needed.)"
  },
  {
    id: "overstimulated",
    sinhala: "වැඩියෙන් උත්තේජනය වී ඇත",
    english: "Overstimulated",
    emoji: "😣",
    image: require('../assets/baby-cues/overstimulated.png'),
    explanation: "වැඩියෙන් උත්තේජනය වී ඇති විට turning head away, crying, or yawning වැනි cues පෙන්විය හැක. (Turning away, crying, or closing eyes can show overstimulation.)"
  },
  {
    id: "comfort",
    sinhala: "මාව සැනසීමට අවශ්‍යයි",
    english: "Wants Comfort",
    emoji: "🤗",
    image: require('../assets/baby-cues/wants-comfort.png'),
    explanation: "සැනසීමට අවශ්‍ය වූ විට whimpering, reaching out, or needing physical touch වැනි cues පෙන්විය හැක. (Whimpering or wanting to be held indicates a need for comfort.)"
  },
  {
    id: "gas",
    sinhala: "ගෑස් / බඩේ අපහසුතාවයක්",
    english: "Gas / Tummy Discomfort",
    emoji: "💨",
    image: require('../assets/baby-cues/gas.png'),
    explanation: "බඩේ අපහසුතාවයක් ඇති විට pulling legs up to tummy, grunting වැනි cues පෙන්විය හැක. (Pulling legs up to the chest or grunting can be signs of gas.)"
  },
  {
    id: "alert-curious",
    sinhala: "අවධානයෙන් / කුතුහලයෙන්",
    english: "Alert & Curious",
    emoji: "👀",
    image: require('../assets/baby-cues/alert-curious.png'),
    explanation: "කුතුහලයෙන් සිටින විට bright eyes, looking around, or scanning faces වැනි cues පෙන්විය හැක. (Wide eyes and smooth body movements show an active alert state.)"
  },
  {
    id: "happy",
    sinhala: "සුවපහසුයි / සතුටින්",
    english: "Safe & Happy",
    emoji: "😊",
    image: require('../assets/baby-cues/happy.png'),
    explanation: "සතුටින් සිටින විට relaxed face, smiling, cooing, or soft eyes වැනි cues පෙන්විය හැක. (A relaxed face, smiles, and coos mean your baby feels content.)"
  },
  {
    id: "too-cold",
    sinhala: "සීතලයි",
    english: "Too Cold",
    emoji: "🥶",
    image: require('../assets/baby-cues/Too Cold.png'),
    explanation: "සීතල වූ විට shivering, pale skin, or cold hands and feet වැනි cues පෙන්විය හැක. (Shivering, fussiness, or cold chest area can mean the baby is too cold.)"
  }
];

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const BabyMoodGuess = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'baby_mood', gameName: 'ළදරු හැඟීම', icon: '👶', onGoBack });

  const [screen, setScreen] = useState('intro'); // 'intro' | 'play' | 'complete'
  const [order, setOrder] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [phase, setPhase] = useState('question'); // 'question' | 'correct' | 'wrong'
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);

  const initGame = () => {
    const shuffledOrder = shuffleArray(Array.from({ length: BABY_CUES_DATA.length }, (_, i) => i));
    setOrder(shuffledOrder);
    setCurrentIdx(0);
    setScore(0);
    setScreen('play');
    setupQuestion(shuffledOrder[0]);
  };

  const setupQuestion = (cueIdx) => {
    setSelectedOpt(null);
    setPhase('question');
    const correctCue = BABY_CUES_DATA[cueIdx];
    const distractors = BABY_CUES_DATA.filter((c) => c.id !== correctCue.id);
    const chosenDistractors = shuffleArray(distractors).slice(0, 3);
    const newOpts = shuffleArray([correctCue, ...chosenDistractors]);
    setOptions(newOpts);
  };

  const handleSelect = (opt) => {
    if (phase === 'correct') return;
    const correctCue = BABY_CUES_DATA[order[currentIdx]];
    setSelectedOpt(opt);

    if (opt.id === correctCue.id) {
      setPhase('correct');
      setScore((s) => s + 1);
    } else {
      setPhase('wrong');
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= BABY_CUES_DATA.length) {
      setScreen('complete');
      session.triggerComplete(`ලකුණු: ${score + 1}/9`);
    } else {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setupQuestion(order[nextIdx]);
    }
  };

  const handleTryAgain = () => {
    setPhase('question');
    setSelectedOpt(null);
  };

  const resetGame = () => {
    setScreen('intro');
  };

  const activeCue = order.length > 0 ? BABY_CUES_DATA[order[currentIdx]] : null;

  if (screen === 'intro') {
    return (
      <View style={bm.cont}>
        <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
          <Text style={s.backText}>← ආපසු</Text>
        </TouchableOpacity>
        <LinearGradient colors={['#FCE4EC', '#EDE7F6']} style={bm.introCard}>
          <Text style={bm.introTitle}>👶 ළදරු හැඟීම</Text>
          <Text style={bm.introSubtitle}>Baby Cues</Text>
          <Text style={bm.introDesc}>
            පින්තූරය බලලා බබා පෙන්වන cue එක තෝරන්න. බබාගේ ඉඟි හඳුනාගැනීම ඉගෙන ගනිමු.
          </Text>
          <TouchableOpacity style={bm.startBtn} onPress={initGame}>
            <LinearGradient colors={['#7E57C2', '#E91E8C']} style={bm.startBtnIn}>
              <Text style={bm.startBtnT}>▶ පටන් ගන්න</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={bm.disclaimerText}>
            මෙය අධ්‍යාපනික ක්‍රියාකාරකමක් පමණි. බබාගේ හැඟීම් සහ අවශ්‍යතා විවිධ විය හැක.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  if (screen === 'complete') {
    return (
      <View style={bm.cont}>
        <CongratsPopup
          visible={session.showCompletion}
          onPlayAgain={() => session.handlePlayAgain(initGame)}
          onClose={session.handleClose}
          title="🎉 හොඳින් කළා!"
          msg={`ඔබ අද baby cues 9ක් හඳුනාගත්තා. 💜\nබබාගේ හැසිරීම් සහ ඉඟි හඳුනාගැනීම කාලයත් සමඟ ඉගෙන ගත හැකි දෙයක්.`}
          playAgainText="🎮 නැවත ක්‍රීඩා කරන්න"
          closeText="✕ වසන්න"
        />
        <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={bm.introCard}>
          <Text style={bm.introTitle}>🌸 ඉතා හොඳයි!</Text>
          <Text style={bm.introDesc}>
            ඔබ අද baby cues 9ක් හඳුනාගත්තා. බබාගේ හැසිරීම් සහ ඉඟි හඳුනාගැනීම කාලයත් සමඟ ඉගෙන ගත හැකි දෙයක්.
          </Text>
          <View style={bm.btnRow}>
            <TouchableOpacity style={bm.nextBtn} onPress={initGame}>
              <LinearGradient colors={['#7E57C2', '#E91E8C']} style={bm.nextBtnIn}>
                <Text style={bm.nextBtnT}>නැවත ක්‍රීඩා කරන්න</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={bm.hintBtn} onPress={() => session.handleClose()}>
              <Text style={bm.hintBtnT}>වසන්න</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={bm.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(initGame)}
        onClose={session.handleClose}
        title="🎉 හොඳින් කළා!"
        msg={`ඔබ අද baby cues 9ක් හඳුනාගත්තා. 💜\nබබාගේ හැසිරීම් සහ ඉඟි හඳුනාගැනීම කාලයත් සමඟ ඉගෙන ගත හැකි දෙයක්.`}
        playAgainText="🎮 නැවත ක්‍රීඩා කරන්න"
        closeText="✕ වසන්න"
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>

      <View style={bm.header}>
        <Text style={bm.title}>👶 ළදරු හැඟීම (Baby Cues)</Text>
        <Text style={bm.score}>{currentIdx + 1} / 9</Text>
      </View>

      <LinearGradient colors={['#F5F7FA', '#E4E8F0']} style={bm.faceCard}>
        {activeCue && (
          <Image
            source={activeCue.image}
            style={bm.babyImage}
            resizeMode="contain"
            accessibilityLabel={`Newborn baby showing ${activeCue.english} cue`}
          />
        )}
        <Text style={bm.faceLabel}>මේ බබා ඔබට කියන්න උත්සාහ කරන්නේ කුමක්ද?</Text>

        {phase === 'correct' && (
          <View style={[bm.feedbackBox, bm.correctBadge]}>
            <Text style={bm.resultText}>✓ නිවැරදියි! හොඳින් හඳුනාගත්තා.</Text>
            <View style={bm.explanationBox}>
              <Text style={bm.explanationT}>{activeCue?.explanation}</Text>
            </View>
          </View>
        )}

        {phase === 'wrong' && (
          <View style={[bm.feedbackBox, bm.wrongBadge]}>
            <Text style={[bm.resultText, { color: '#C62828' }]}>
              නැහැ. ඒක මේ අවස්ථාවේ හොඳම පිළිතුර නොවෙයි.
            </Text>
            <Text style={{ fontSize: 13, color: '#555', marginTop: 4, textAlign: 'center' }}>
              මෙම බබාගේ ඉඟිය ගැන නැවත බලමු.
            </Text>
          </View>
        )}
      </LinearGradient>

      {phase === 'question' && (
        <View style={bm.options}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => handleSelect(opt)}
              style={bm.optBtn}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>{opt.emoji}</Text>
              <Text style={bm.optText}>{opt.sinhala}</Text>
              <Text style={bm.optSubtext}>{opt.english}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={bm.btnRow}>
        {phase === 'wrong' && (
          <TouchableOpacity style={bm.hintBtn} onPress={handleTryAgain}>
            <Text style={bm.hintBtnT}>නැවත උත්සාහ කරන්න</Text>
          </TouchableOpacity>
        )}
        {phase === 'correct' && (
          <TouchableOpacity style={bm.nextBtn} onPress={handleNext}>
            <LinearGradient colors={['#7E57C2', '#E91E8C']} style={bm.nextBtnIn}>
              <Text style={bm.nextBtnT}>
                {currentIdx + 1 >= BABY_CUES_DATA.length ? "අවසන් කරන්න →" : "ඊළඟ එක →"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <Text style={bm.disclaimerText}>
        සටහන: බබාගේ ඉඟි එකිනෙකට වෙනස් විය හැක. මෙම ක්‍රියාකාරකම අධ්‍යාපනික අරමුණක් සඳහා පමණි.
      </Text>
    </View>
  );
};

// SELF CARE QUEST
const SC_TASKS = [
  { id: 1, icon: '💧', label: 'වතුර', pts: 10 },
  { id: 2, icon: '🍎', label: 'ආහාර', pts: 15 },
  { id: 3, icon: '😴', label: 'විනාඩි 10 නිදා', pts: 20 },
  { id: 4, icon: '🌸', label: 'ශ්වාස 3', pts: 10 },
  { id: 5, icon: '🚶', label: 'ඇවිදීම', pts: 15 },
  { id: 6, icon: '💜', label: 'ආදර වදන', pts: 20 },
  { id: 7, icon: '<ctrl42>', label: 'ස්නාන', pts: 15 },
  { id: 8, icon: '📞', label: 'ඇමතීම', pts: 10 },
];
const SC_BADGES = [
  { threshold: 20, emoji: '🌱', label: 'බීජය' },
  { threshold: 50, emoji: '🌸', label: 'පිපෙන' },
  { threshold: 80, emoji: '🌺', label: 'දීප්තිමත්' },
  { threshold: 115, emoji: '⭐', label: 'තරුව' },
];

const SelfCareQuest = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'self_care', gameName: 'ස්වයං රැකවරණය', icon: '🌿', onGoBack });
  const [done, setDone] = useState([]);
  const [pts, setPts] = useState(0);
  const [newBadge, setNB] = useState(null);

  const toggle = (task) => {
    let np = pts;
    if (done.includes(task.id)) {
      setDone((p) => p.filter((id) => id !== task.id));
      np = pts - task.pts;
      setPts(np);
    } else {
      np = pts + task.pts;
      setDone((p) => [...p, task.id]);
      setPts(np);
      const b = [...SC_BADGES].reverse().find((b) => np >= b.threshold);
      const pb = [...SC_BADGES].reverse().find((b) => pts >= b.threshold);
      if (b && (!pb || pb.label !== b.label)) {
        setNB(b);
        setTimeout(() => setNB(null), 3000);
      }
      if (np >= 50) {
        session.triggerComplete(`ලකුණු: ${np}`);
      }
    }
  };

  const curBadge = [...SC_BADGES].reverse().find((b) => pts >= b.threshold);
  const nxtBadge = SC_BADGES.find((b) => b.threshold > pts);
  const prog = nxtBadge ? Math.min((pts / nxtBadge.threshold) * 100, 100) : 100;

  const resetGame = () => {
    setDone([]);
    setPts(0);
  };

  return (
    <View style={sc.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(resetGame)}
        onClose={session.handleClose}
        title="ශ්‍රේෂ්ඨයි! 🌿"
        msg={`ලකුණු ${pts} ලබා ගත්තා 💜`}
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={sc.header}>
        <Text style={sc.title}>🌿 ස්වයං රැකවරණය</Text>
        <Text style={sc.pts}>{pts} ⭐</Text>
      </View>
      <LinearGradient colors={curBadge ? ['#FFF9C4', '#FFF3E0'] : ['#F5F5F5', '#EEEEEE']} style={sc.badgeCard}>
        <Text style={sc.badgeEmoji}>{curBadge ? curBadge.emoji : '🌱'}</Text>
        <Text style={sc.badgeName}>{curBadge ? curBadge.label : 'ආරම්භ!'}</Text>
        {nxtBadge && (
          <>
            <Text style={sc.nextBadgeT}>ඊළඟ: {nxtBadge.emoji}</Text>
            <View style={sc.progressBg}>
              <View style={[sc.progressFill, { width: `${prog}%` }]} />
            </View>
            <Text style={sc.progressT}>{pts}/{nxtBadge.threshold}</Text>
          </>
        )}
      </LinearGradient>
      {newBadge && (
        <LinearGradient colors={['#FFF9C4', '#FCE4EC']} style={sc.popup}>
          <Text style={sc.popupEmoji}>{newBadge.emoji}</Text>
          <Text style={sc.popupT}>{newBadge.label}! 🎉</Text>
        </LinearGradient>
      )}
      <Text style={sc.taskLbl}>අද:</Text>
      {SC_TASKS.map((task) => {
        const isDone = done.includes(task.id);
        return (
          <TouchableOpacity key={task.id} onPress={() => toggle(task)}>
            <LinearGradient colors={isDone ? ['#E8F5E9', '#C8E6C9'] : ['#FAFAFA', '#F5F5F5']} style={[sc.taskCard, isDone && sc.taskDone]}>
              <Text style={sc.taskIcon}>{task.icon}</Text>
              <Text style={[sc.taskLabel2, isDone && sc.taskLblDone]}>{task.label}</Text>
              <Text style={sc.taskPts}>+{task.pts}</Text>
              <View style={[sc.cb, isDone && sc.cbDone]}>
                {isDone && <Text style={sc.cbCheck}>✓</Text>}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
      <LinearGradient colors={['#EDE7F6', '#FCE4EC']} style={sc.note}>
        <Text style={sc.noteT}>🌸 සෑම ගමනාන්තරයක්ම 💜</Text>
      </LinearGradient>
    </View>
  );
};

// BUBBLE POP
const FLOWER = '🌸';
const DANGER = ['💥', '🌩️', '🦠', '🌪️', '💢', '🌑'];

const BubblePopCompletionPopup = ({ visible, score, duration, lives, onPlayAgain, onClose }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, { toValue: -8, duration: 400, useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scale.setValue(0);
      bounce.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={bpp.overlay}>
        <Animated.View style={[bpp.box, { transform: [{ scale }] }]}>
          <View style={bpp.confettiRow}>
            {['🎉', '🌸', '✨', '💜', '⭐'].map((c, i) => (
              <Text key={i} style={bpp.confEmoji}>{c}</Text>
            ))}
          </View>
          <Animated.Text style={[bpp.bigEmoji, { transform: [{ translateY: bounce }] }]}>🎉</Animated.Text>
          <Text style={bpp.title}>ජයයි!</Text>
          <Text style={bpp.subtitle}>ඔබ ලකුණු {score} ක් ලබාගත්තා</Text>
          <View style={bpp.btnGroup}>
            <TouchableOpacity style={bpp.btnMain} onPress={onPlayAgain} activeOpacity={0.85}>
              <LinearGradient colors={['#E91E8C', '#7E57C2']} style={bpp.btnMainIn}>
                <Text style={bpp.btnMainT}>🎮 නැවත ක්‍රීඩා කරන්න</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={bpp.btnClose} onPress={onClose} activeOpacity={0.85}>
              <Text style={bpp.btnCloseT}>✕ වසන්න</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const BubblePop = ({ navigation, onGoBack }) => {
  const session = useGameSession({ gameId: 'bubble_pop', gameName: 'බුබුළු', icon: '🌸', onGoBack });
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(45);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef(null);
  const spawnRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(45);
    setBubbles([]);
    setGameOver(false);
    session.startNewSession();
    setRunning(true);
  };

  const handleEndGame = useCallback(
    (finalScore) => {
      setRunning(false);
      setGameOver(true);
      clearInterval(timerRef.current);
      clearInterval(spawnRef.current);
      session.triggerComplete(`ලකුණු: ${finalScore}`);
    },
    [session]
  );

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleEndGame(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    spawnRef.current = setInterval(() => {
      const isFlower = Math.random() < 0.55;
      setBubbles((p) => [
        ...p.slice(-18),
        {
          id: Date.now() + Math.random(),
          x: Math.random() * (width - 100) + 10,
          y: Math.random() * 250 + 20,
          size: 42 + Math.random() * 26,
          isFlower,
          emoji: isFlower ? FLOWER : DANGER[Math.floor(Math.random() * DANGER.length)],
          cols: isFlower ? ['#FCE4EC', '#F8BBD9'] : ['#424242', '#616161'],
        },
      ]);
    }, 750);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(spawnRef.current);
    };
  }, [running, score, handleEndGame]);

  useEffect(() => {
    if (lives <= 0 && running) {
      handleEndGame(score);
    }
  }, [lives, running, score, handleEndGame]);

  const popBubble = (b) => {
    if (!running) return;
    setBubbles((p) => p.filter((x) => x.id !== b.id));
    if (b.isFlower) {
      setScore((s) => s + 1);
    } else {
      setLives((l) => l - 1);
    }
  };

  const handleBackNavigation = () => {
    setRunning(false);
    session.handleBack(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    });
  };

  return (
    <View style={bp.cont}>
      <BubblePopCompletionPopup
        visible={session.showCompletion}
        score={score}
        duration={Math.max(1, Math.round((Date.now() - session.startTime) / 1000))}
        lives={lives}
        onPlayAgain={() => session.handlePlayAgain(startGame)}
        onClose={session.handleClose}
      />

      <TouchableOpacity onPress={handleBackNavigation} style={[s.backBtn, { alignSelf: 'flex-start', marginBottom: 10 }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>

      <View style={bp.header}>
        <Text style={bp.title}>🫧 බුබුළු</Text>
        <View style={bp.stats}>
          <Text style={bp.scoreT}>🌸{score}</Text>
          <Text style={bp.livesT}>
            {'❤️'.repeat(Math.max(0, lives))}
            {'🖤'.repeat(Math.max(0, 3 - lives))}
          </Text>
          <Text style={bp.timerT}>⏱{timeLeft}s</Text>
        </View>
      </View>

      <Text style={bp.rule}>🌸 ටොක් = +1 | ☠️ ටොක් = ජීවිතය -1</Text>

      {!running && !gameOver && (
        <TouchableOpacity style={bp.startBtn} onPress={startGame}>
          <LinearGradient colors={['#E91E8C', '#7E57C2']} style={bp.startBtnIn}>
            <Text style={bp.startBtnT}>▶ ආරම්භ</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {gameOver && (
        <LinearGradient colors={['#FCE4EC', '#EDE7F6']} style={bp.gameOverCard}>
          <Text style={bp.gameOverT}>{lives <= 0 ? '💔 ජීවිත නැති!' : '⏰ කාලය!'}</Text>
          <Text style={bp.gameOverScore}>🌸{score}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={bp.retryBtn} onPress={() => session.handlePlayAgain(startGame)}>
              <Text style={bp.retryBtnT}>↺ නැවත</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[bp.retryBtn, { backgroundColor: '#EDE7F6' }]}
              onPress={session.handleClose}
            >
              <Text style={[bp.retryBtnT, { color: '#7E57C2' }]}>🏠 ආපසු</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}

      {running && (
        <View style={bp.area}>
          {bubbles.map((b) => (
            <TouchableOpacity
              key={b.id}
              onPress={() => popBubble(b)}
              style={[
                bp.bubble,
                {
                  left: b.x,
                  top: b.y,
                  width: b.size,
                  height: b.size,
                  borderRadius: b.size / 2,
                },
              ]}
            >
              <LinearGradient colors={b.cols} style={[bp.bubbleGrad, { borderRadius: b.size / 2 }]}>
                <Text style={{ fontSize: b.size * 0.44 }}>{b.emoji}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// WORD MATCH
const ALL_WM = [
  { w: 'ආදරය', m: '💜' }, { w: 'සාමය', m: '🕊️' }, { w: 'සතුට', m: '🌸' }, { w: 'ශක්තිය', m: '💪' }, { w: 'හිනාව', m: '😊' },
  { w: 'නිදහස', m: '🦋' }, { w: 'ස්වර්ණ', m: '⭐' }, { w: 'සෞඛ්‍ය', m: '🌿' }, { w: 'ළදරු', m: '👶' }, { w: 'අම්මා', m: '🤱' },
  { w: 'සිහිනය', m: '🌙' }, { w: 'ජලය', m: '💧' }, { w: 'ගිනි', m: '🔥' }, { w: 'හදවත', m: '❤️' }, { w: 'ගස', m: '🌳' },
  { w: 'මල', m: '🌺' }, { w: 'රේඛාව', m: '🌈' }, { w: 'ගීතය', m: '🎵' }, { w: 'ශ්‍රී', m: '🏆' }, { w: 'ජය', m: '🎉' },
  { w: 'වළාකුළ', m: '☁️' }, { w: 'හිරු', m: '☀️' }, { w: 'රජු', m: '👑' }, { w: 'ගෙදර', m: '🏠' }, { w: 'ආහාර', m: '🍎' },
  { w: 'රාත්‍රිය', m: '🌃' }, { w: 'සිනාව', m: '😂' }, { w: 'නෞකා', m: '⛵' }, { w: 'සුව', m: '🌿' }, { w: 'සංගීත', m: '🎶' },
];

const WordMatchGame = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'word_match', gameName: 'වචන ගැළපීම', icon: '💬', onGoBack });
  const usedRef = useRef([]);
  const getNewPairs = useCallback(() => {
    const available = ALL_WM.filter((p) => !usedRef.current.includes(p.w));
    const pool = available.length >= 5 ? available : ALL_WM;
    if (available.length < 5) usedRef.current = [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
    usedRef.current = [...usedRef.current, ...shuffled.map((p) => p.w)];
    return shuffled;
  }, []);

  const [pairs, setPairs] = useState(() => getNewPairs());
  const [curLeft, setCurLeft] = useState([]);
  const [curRight, setCurRight] = useState([]);
  const [sL, setSL] = useState(null);
  const [sR, setSR] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState([]);
  const [score, setScore] = useState(0);
  const [turn, setTurn] = useState(1);

  useEffect(() => {
    setCurLeft([...pairs].sort(() => Math.random() - 0.5).map((p) => p.w));
    setCurRight([...pairs].sort(() => Math.random() - 0.5).map((p) => p.m));
    setMatched([]);
    setSL(null);
    setSR(null);
    setWrong([]);
  }, [pairs]);

  useEffect(() => {
    if (!sL || !sR) return;
    const hit = pairs.find((p) => p.w === sL && p.m === sR);
    if (hit) {
      setMatched((m) => [...m, sL, sR]);
      setScore((s) => s + 10);
    } else {
      setWrong([sL, sR]);
      setTimeout(() => setWrong([]), 700);
    }
    setTimeout(() => {
      setSL(null);
      setSR(null);
    }, 500);
  }, [sL, sR, pairs]);

  useEffect(() => {
    if (matched.length === pairs.length * 2 && pairs.length > 0) {
      session.triggerComplete(`රවුම: ${turn} | ලකුණු: ${score}`);
    }
  }, [matched, pairs.length, turn, score, session]);

  const nextTurn = () => {
    setPairs(getNewPairs());
    setTurn((t) => t + 1);
  };

  return (
    <View style={wm.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(nextTurn)}
        onClose={session.handleClose}
        title={`${turn} රවුම ජය!`}
        msg={`${score} ලකුණු! නව වචන! 💜`}
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={wm.header}>
        <Text style={wm.title}>💬 වචන ගැළපීම</Text>
        <Text style={wm.score}>රවුම {turn}·{score}</Text>
      </View>
      <Text style={wm.hint}>සිංහල→emoji 🌸</Text>
      <View style={wm.cols}>
        <View style={wm.col}>
          {curLeft.map((w) => {
            const isSel = sL === w, isM = matched.includes(w), isW = wrong.includes(w);
            return (
              <TouchableOpacity
                key={w}
                onPress={() => !isM && setSL(w)}
                style={[wm.card, isSel && wm.sel, isM && wm.done2, isW && wm.bad]}
              >
                <Text style={[wm.cardT, isM && { color: '#2E7D32' }]}>{w}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={wm.col}>
          {curRight.map((e) => {
            const isSel = sR === e, isM = matched.includes(e), isW = wrong.includes(e);
            return (
              <TouchableOpacity
                key={e}
                onPress={() => !isM && setSR(e)}
                style={[wm.card, wm.cardR, isSel && wm.sel, isM && wm.done2, isW && wm.bad]}
              >
                <Text style={wm.emoji}>{e}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

// WORD BUILDER
const WB_SETS = [
  { letters: ['A', 'T', 'R', 'E', 'S', 'C'], words: ['CAT', 'CAR', 'EAR', 'ARE', 'ART', 'SET', 'ACE', 'CARE', 'RACE', 'RATE', 'CREST', 'TRACE', 'CATER'] },
  { letters: ['L', 'O', 'V', 'E', 'M', 'R'], words: ['OLE', 'MORE', 'LOVE', 'MOLE', 'OVER', 'ROLE', 'LOVER', 'MOVER'] },
  { letters: ['P', 'A', 'C', 'E', 'L', 'S'], words: ['APE', 'CAP', 'ACE', 'LACE', 'PACE', 'CAPE', 'SALE', 'CLAP', 'PLACE', 'SCALE', 'SPACE'] },
  { letters: ['B', 'L', 'O', 'O', 'M', 'S'], words: ['MOO', 'BOO', 'LOOM', 'BLOOM', 'BOOS'] },
];
const WordBuilder = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'word_builder', gameName: 'වචන ගොඩනැගීම', icon: '🔠', onGoBack });
  const [setIdx, setSetIdx] = useState(0);
  const ws2 = WB_SETS[setIdx];
  const [current, setCurrent] = useState('');
  const [found, setFound] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('#2E7D32');
  const [hintLevel, setHintLevel] = useState(0);
  const [hintWord, setHintWord] = useState(null);

  const score = found.reduce((s, w) => s + w.length * 10, 0);

  const submit = () => {
    const w = current.toUpperCase();
    if (w.length < 2) {
      setMsg('ඉතා කෙටි!');
      setMsgColor('#C62828');
      setTimeout(() => setMsg(''), 1000);
      return;
    }
    if (found.includes(w)) {
      setMsg('දැනටමත්!');
      setMsgColor('#F57F17');
      setTimeout(() => setMsg(''), 1000);
      setCurrent('');
      return;
    }
    if (ws2.words.includes(w)) {
      const nf = [...found, w];
      setFound(nf);
      setMsg(`✓ "${w}" +${w.length * 10}`);
      setMsgColor('#2E7D32');
      setHintLevel(0);
      setHintWord(null);
      if (nf.length >= Math.min(5, ws2.words.length)) {
        session.triggerComplete(`ලකුණු: ${score + w.length * 10}`);
      }
    } else {
      setMsg(`"${w}" නැහැ 🤔`);
      setMsgColor('#7E57C2');
    }
    setTimeout(() => setMsg(''), 1800);
    setCurrent('');
  };

  const getHint = () => {
    const remaining = ws2.words.filter((w) => !found.includes(w));
    if (!remaining.length) {
      setMsg('සියල්ල!');
      setTimeout(() => setMsg(''), 1500);
      return;
    }
    const target = hintWord && remaining.includes(hintWord) ? hintWord : remaining[Math.floor(Math.random() * remaining.length)];
    setHintWord(target);
    const nl = hintLevel + 1;
    setHintLevel(nl);
    if (nl === 1) setMsg(`ඉඟිය 1: ${target.length} අකුරු 📏`);
    else if (nl === 2) setMsg(`ඉඟිය 2: "${target[0]}" ෙන් 🔤`);
    else if (nl === 3) setMsg(`ඉඟිය 3: "${target.slice(0, 2)}…" 🔍`);
    else setMsg(`ඉඟිය 4: "${target}" 💡`);
    setMsgColor('#7E57C2');
    setTimeout(() => setMsg(''), 2500);
  };

  const nextSet = () => {
    setSetIdx((i) => (i + 1) % WB_SETS.length);
    setFound([]);
    setCurrent('');
    setHintLevel(0);
    setHintWord(null);
  };

  return (
    <View style={wb.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(nextSet)}
        onClose={session.handleClose}
        title="ශූරයා! 🔠"
        msg={`${score} ලකුණු! 💜`}
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={wb.header}>
        <Text style={wb.title}>🔠 වචන ගොඩනැගීම</Text>
        <Text style={wb.score}>{score} ලකුණු</Text>
      </View>
      <Text style={wb.subhint}>💡 4 levels: length→first→2letters→full!</Text>
      <LinearGradient colors={['#EDE7F6', '#F3E5F5']} style={wb.inputBox}>
        <Text style={wb.inputText}>{current || '_ _ _'}</Text>
        {!!msg && <Text style={[wb.msg, { color: msgColor }]}>{msg}</Text>}
      </LinearGradient>
      <View style={wb.letters}>
        {ws2.letters.map((l) => (
          <TouchableOpacity key={l} style={wb.letterBtn} onPress={() => setCurrent((c) => c + l)}>
            <Text style={wb.letterT}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={wb.actionRow}>
        <TouchableOpacity style={wb.backBtn} onPress={() => setCurrent((c) => c.slice(0, -1))}>
          <Text style={wb.backBtnT}>⌫</Text>
        </TouchableOpacity>
        <TouchableOpacity style={wb.clearBtn} onPress={() => setCurrent('')}>
          <Text style={wb.clearBtnT}>✗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={wb.submitBtn} onPress={submit}>
          <LinearGradient colors={['#7E57C2', '#E91E8C']} style={wb.submitBtnIn}>
            <Text style={wb.submitBtnT}>✓ ඇතුළු</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={wb.hintBtn} onPress={getHint}>
        <Text style={wb.hintBtnT}>💡 ඉඟිය (level {Math.min(hintLevel + 1, 4)})</Text>
      </TouchableOpacity>
      <Text style={wb.foundLabel}>සොයා ({found.length}/{ws2.words.length}):</Text>
      <View style={wb.foundList}>
        {found.map((w) => (
          <View key={w} style={wb.foundChip}>
            <Text style={wb.foundChipT}>{w}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={wb.newBtn} onPress={nextSet}>
        <Text style={wb.newBtnT}>🔄 නව</Text>
      </TouchableOpacity>
    </View>
  );
};

// PATTERN REPEAT
const PAT_PADS = [
  { colors: ['#F472B6', '#EC4899'], name: 'රෝස', icon: '🌸' },
  { colors: ['#A855F7', '#8B5CF6'], name: 'ජම්', icon: '💜' },
  { colors: ['#34D399', '#10B981'], name: 'කොළ', icon: '🌿' },
  { colors: ['#60A5FA', '#3B82F6'], name: 'නිල්', icon: '💙' },
  { colors: ['#FBBF24', '#F59E0B'], name: 'රන්', icon: '⭐' },
  { colors: ['#FB7185', '#EF4444'], name: 'රතු', icon: '🔴' },
];

const PatternRepeat = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'pattern_repeat', gameName: 'රටාව නැවත', icon: '🧠', onGoBack });
  const [seq, setSeq] = useState([]);
  const [userSeq, setUserSeq] = useState([]);
  const [phase, setPhase] = useState('idle');
  const [active, setActive] = useState(-1);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const flashAnims = useRef(PAT_PADS.map(() => new Animated.Value(1))).current;

  const showSeq = useCallback(
    (s) => {
      setPhase('showing');
      setActive(-1);
      let i = 0;
      const show = () => {
        if (i >= s.length) {
          setTimeout(() => {
            setActive(-1);
            setPhase('input');
          }, 500);
          return;
        }
        const idx = s[i];
        setActive(idx);
        Animated.sequence([
          Animated.timing(flashAnims[idx], { toValue: 0.3, duration: 280, useNativeDriver: true }),
          Animated.timing(flashAnims[idx], { toValue: 1, duration: 280, useNativeDriver: true }),
        ]).start(() => {
          i++;
          setTimeout(show, 350);
        });
      };
      setTimeout(show, 700);
    },
    [flashAnims]
  );

  const start = () => {
    const s = [Math.floor(Math.random() * PAT_PADS.length)];
    setSeq(s);
    setUserSeq([]);
    setLevel(1);
    setScore(0);
    session.startNewSession();
    showSeq(s);
  };

  const tapPad = (idx) => {
    if (phase !== 'input') return;
    Animated.sequence([
      Animated.timing(flashAnims[idx], { toValue: 0.4, duration: 150, useNativeDriver: true }),
      Animated.timing(flashAnims[idx], { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    const ns = [...userSeq, idx];
    setUserSeq(ns);
    if (ns[ns.length - 1] !== seq[ns.length - 1]) {
      setPhase('wrong');
      return;
    }
    if (ns.length === seq.length) {
      const newScore = score + level * 10;
      setScore(newScore);
      setPhase('correct');
      if (level >= 6) {
        session.triggerComplete(`ලකුණු: ${newScore}`);
        return;
      }
      setTimeout(() => {
        const newSeq = [...seq, Math.floor(Math.random() * PAT_PADS.length)];
        setSeq(newSeq);
        setUserSeq([]);
        setLevel((l) => l + 1);
        showSeq(newSeq);
      }, 700);
    }
  };

  const gridWidth = Math.min(width - spacing.md * 2, 520);
  const padSize = Math.floor((gridWidth - 28) / 3);

  return (
    <View style={pat.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(start)}
        onClose={session.handleClose}
        title="ශූරයා! 🧠"
        msg={`${score} ලකුණු 💜`}
      />
      {/* Top Header HUD */}
      <View style={pat.topNav}>
        <TouchableOpacity onPress={() => session.handleBack()} style={pat.backBtn} activeOpacity={0.7}>
          <Text style={pat.backText}>← ආපසු</Text>
        </TouchableOpacity>
        <View style={pat.titleWrap}>
          <Text style={pat.title}>🧠 රටාව නැවත</Text>
        </View>
        <View style={pat.levelBadge}>
          <Text style={pat.levelBadgeText}>Lvl {level}.0</Text>
        </View>
      </View>

      {/* Main Container */}
      <View style={[pat.innerWrap, { maxWidth: 520, width: '100%' }]}>
        {/* Status Indicator */}
        {phase !== 'idle' && (
          <View style={pat.statusBox}>
            <Text style={pat.statusText}>
              {phase === 'showing'
                ? '👁 බලන්න…'
                : phase === 'input'
                  ? `🎯 ඔබේ වාරය! (${userSeq.length}/${seq.length})`
                  : phase === 'correct'
                    ? '✅ නිවැරදි!'
                    : '❌ වැරදිලා!'}
            </Text>
          </View>
        )}

        {/* Dots Row */}
        {seq.length > 0 && (
          <View style={pat.dotsRow}>
            {seq.map((ci, i) => (
              <View
                key={i}
                style={[
                  pat.dot,
                  {
                    backgroundColor: i < userSeq.length ? PAT_PADS[seq[i]].colors[0] : '#E2E8F0',
                    width: i === userSeq.length ? 18 : 8,
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* 3x2 Grid */}
        <View style={[pat.grid, { width: gridWidth }]}>
          {PAT_PADS.map((p, i) => {
            const isLit = active === i;
            return (
              <Animated.View key={i} style={{ opacity: flashAnims[i], transform: [{ scale: isLit ? 1.06 : 1 }] }}>
                <TouchableOpacity
                  onPress={() => tapPad(i)}
                  activeOpacity={0.85}
                  style={[
                    pat.pad,
                    {
                      width: padSize,
                      height: Math.floor(padSize * 0.92),
                    },
                    isLit && pat.padActive,
                  ]}
                >
                  <LinearGradient colors={p.colors} style={pat.padGrad}>
                    <Text style={pat.padIcon}>{p.icon}</Text>
                    <Text style={pat.padName}>{p.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Center Action Button */}
        {(phase === 'idle' || phase === 'wrong') && (
          <View style={pat.centerAction}>
            <TouchableOpacity style={pat.startBtn} onPress={start} activeOpacity={0.85}>
              <LinearGradient colors={['#9333EA', '#EC4899']} style={pat.startBtnIn}>
                <Text style={pat.startBtnT}>{phase === 'wrong' ? '↺ නැවත ආරම්භ' : '▶ ආරම්භ කරන්න'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

// SPOT DIFFERENCE
const SPOT_SCENES = [
  {
    title: 'ළදරු කාමරය',
    scene: [
      { id: 0, emoji: '🍼', x: 0.1, y: 0.15, diff: false, diffEmoji: null },
      { id: 1, emoji: '🧸', x: 0.55, y: 0.12, diff: true, diffEmoji: '🎀' },
      { id: 2, emoji: '🌙', x: 0.3, y: 0.05, diff: false, diffEmoji: null },
      { id: 3, emoji: '⭐', x: 0.72, y: 0.4, diff: true, diffEmoji: '🌟' },
      { id: 4, emoji: '🛏️', x: 0.4, y: 0.55, diff: false, diffEmoji: null },
      { id: 5, emoji: '🌸', x: 0.15, y: 0.65, diff: true, diffEmoji: '🌺' },
      { id: 6, emoji: '🎵', x: 0.68, y: 0.68, diff: false, diffEmoji: null },
      { id: 7, emoji: '💜', x: 0.48, y: 0.3, diff: true, diffEmoji: '💛' },
    ],
  },
  {
    title: 'ළදරු උද්‍යානය',
    scene: [
      { id: 0, emoji: '🌳', x: 0.08, y: 0.1, diff: false, diffEmoji: null },
      { id: 1, emoji: '🦋', x: 0.6, y: 0.08, diff: true, diffEmoji: '🐝' },
      { id: 2, emoji: '☀️', x: 0.8, y: 0.05, diff: false, diffEmoji: null },
      { id: 3, emoji: '🌷', x: 0.25, y: 0.55, diff: true, diffEmoji: '🌻' },
      { id: 4, emoji: '👶', x: 0.45, y: 0.45, diff: false, diffEmoji: null },
      { id: 5, emoji: '🐦', x: 0.7, y: 0.5, diff: true, diffEmoji: '🦜' },
      { id: 6, emoji: '🍀', x: 0.15, y: 0.75, diff: false, diffEmoji: null },
      { id: 7, emoji: '🌈', x: 0.5, y: 0.8, diff: true, diffEmoji: '⛅' },
    ],
  },
];
const SpotDifference = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'spot_diff', gameName: 'වෙනස සොයන්න', icon: '🔍', onGoBack });
  const [sceneIdx, setSceneIdx] = useState(0);
  const sc2 = SPOT_SCENES[sceneIdx];
  const diffs = sc2.scene.filter((x) => x.diff);
  const [found, setFound] = useState([]);
  const [msg, setMsg] = useState('');
  const [hints, setHints] = useState(0);

  const pW = (width - spacing.md * 2 - 8) / 2;
  const pH = Math.floor(pW * 1.0);

  const tapDiff = (item, isDiff) => {
    if (!isDiff) return;
    if (!item.diff) {
      setMsg('🤔 ෆරක් නැහැ!');
      setTimeout(() => setMsg(''), 800);
      return;
    }
    if (found.includes(item.id)) return;
    const nf = [...found, item.id];
    setFound(nf);
    setMsg('✅ සොයා!');
    setTimeout(() => setMsg(''), 800);
    if (nf.length === diffs.length) {
      session.triggerComplete(`වෙනස්කම්: ${nf.length}/${diffs.length}`);
    }
  };

  const nextScene = () => {
    setSceneIdx((i) => (i + 1) % SPOT_SCENES.length);
    setFound([]);
    setHints(0);
    setMsg('');
  };

  const useHint = () => {
    if (hints >= 3) return;
    const unfound = diffs.filter((d) => !found.includes(d.id));
    if (unfound.length > 0) {
      setMsg(`💡 ${unfound[0].emoji}→${unfound[0].diffEmoji}`);
      setTimeout(() => setMsg(''), 2500);
      setHints((h) => h + 1);
    }
  };

  return (
    <View style={spd.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(nextScene)}
        onClose={session.handleClose}
        title="ශූරයා! 🔍"
        msg={`${diffs.length} වෙනස්කම් සොයාගත්තා! 💜`}
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={spd.header}>
        <Text style={spd.title}>🔍 වෙනස සොයන්න</Text>
        <Text style={spd.score}>{found.length}/{diffs.length}</Text>
      </View>
      <Text style={spd.sceneTitle}>{sc2.title}</Text>
      {!!msg && (
        <Text style={[spd.msg, { color: msg.includes('✅') ? '#2E7D32' : msg.includes('💡') ? '#7E57C2' : '#C62828' }]}>
          {msg}
        </Text>
      )}
      <Text style={spd.hint}>දකුණේ ෆරක් ස්පර්ශ!</Text>
      <View style={spd.panels}>
        {[false, true].map((isDiff) => (
          <View key={String(isDiff)} style={[spd.panel, { width: pW, height: pH }]}>
            <LinearGradient colors={isDiff ? ['#FFF0F5', '#FFF9C4'] : ['#F0F8FF', '#FFF9C4']} style={StyleSheet.absoluteFillObject} />
            <Text style={spd.panelLabel}>{isDiff ? '👉 වෙනස' : '📌 මුල්'}</Text>
            {sc2.scene.map((item) => {
              const isFnd = found.includes(item.id);
              const emoji = isDiff && item.diff ? item.diffEmoji : item.emoji;
              const x = item.x * (pW - 36), y = item.y * (pH - 48);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => tapDiff(item, isDiff)}
                  style={[spd.sceneItem, { left: x, top: y + 26 }, isFnd && isDiff && spd.sceneItemFound]}
                >
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                  {isFnd && isDiff && <Text style={spd.foundMark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
      <View style={spd.actions}>
        <TouchableOpacity style={spd.hintBtn} onPress={useHint}>
          <Text style={spd.hintBtnT}>💡 ඉඟිය ({3 - hints})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={spd.nextBtn} onPress={nextScene}>
          <Text style={spd.nextBtnT}>→ ඊළඟ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// SEQUENCE ORDER
const SEQ_DATA = [
  { title: 'උදෑසන', items: ['අවදි 🌅', 'දත් 🪥', 'ආහාර 🥣', 'ඇඳුම් 👗', 'සූදානම ✨'] },
  { title: 'ළදරු රැකවරණය', items: ['ජාගා 👶', 'ඩයිපර් 🧷', 'කිරි 🍼', 'හොඹ 🫧', 'සෙල්ලම් 🎈'] },
  { title: 'රාත්‍රිය', items: ['කාර්ය 📋', 'ස්නාන 🚿', 'තේ 🍵', 'කියවීම 📖', 'නිද 😴'] },
];
const SequenceOrder = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'sequence_order', gameName: 'අනුපිළිවෙල', icon: '🧩', onGoBack });
  const [seqIdx, setSeqIdx] = useState(0);
  const seq = SEQ_DATA[seqIdx];
  const [order, setOrder] = useState(() => [...seq.items].sort(() => Math.random() - 0.5));
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const correct = (o) => {
    let c = 0;
    o.forEach((it, i) => {
      if (it === seq.items[i]) c++;
    });
    return c;
  };

  const tap = (i) => {
    if (done) return;
    if (sel === null) {
      setSel(i);
      return;
    }
    if (sel === i) {
      setSel(null);
      return;
    }
    const no = [...order];
    [no[sel], no[i]] = [no[i], no[sel]];
    setOrder(no);
    setSel(null);
    if (correct(no) === seq.items.length) {
      setDone(true);
      const newScore = score + 50;
      setScore(newScore);
      session.triggerComplete(`ලකුණු: ${newScore}`);
    }
  };

  const next = () => {
    const ni = (seqIdx + 1) % SEQ_DATA.length;
    setSeqIdx(ni);
    setOrder([...SEQ_DATA[ni].items].sort(() => Math.random() - 0.5));
    setDone(false);
    setSel(null);
  };

  return (
    <View style={so.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(next)}
        onClose={session.handleClose}
        title="නිවැරදි! 🧠"
        msg="ශ්‍රේෂ්ඨ! 💜"
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={so.header}>
        <Text style={so.title}>🧠 අනුපිළිවෙල</Text>
        <Text style={so.score}>{score}</Text>
      </View>
      <Text style={so.hint}>හුවමාරු කරන්න 🌸</Text>
      <Text style={so.seqTitle}>{seq.title}</Text>
      {order.map((item, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => tap(i)}
          style={[so.item, sel === i && so.itemSel, done && so.itemDone]}
        >
          <Text style={so.itemNum}>{i + 1}</Text>
          <Text style={so.itemT}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// COIN MAZE
const MAZE_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 2, 0, 0, 1, 2, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 2, 0, 0, 0, 2, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 2, 0, 0, 0, 2, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 2, 0, 0, 0, 2, 0, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
];
const MZ_R = MAZE_GRID.length, MZ_C = MAZE_GRID[0].length;
const CoinMaze = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'coin_maze', gameName: 'කාසි මාලිම', icon: '🪙', onGoBack });
  const [pos, setPos] = useState([1, 1]);
  const [grid, setGrid] = useState(() => MAZE_GRID.map((r) => [...r]));
  const [coins, setCoins] = useState(0);
  const [won, setWon] = useState(false);

  const cellW = Math.floor(Math.min((width - spacing.md * 2 - 20) / MZ_C, (height * 0.38) / MZ_R));

  const move = (dr, dc) => {
    if (won) return;
    const [r, c] = [pos[0] + dr, pos[1] + dc];
    if (r < 0 || r >= MZ_R || c < 0 || c >= MZ_C || grid[r][c] === 1) return;
    const ng = grid.map((row) => [...row]);
    let nc = coins;
    if (ng[r][c] === 2) {
      ng[r][c] = 0;
      nc++;
    }
    if (ng[r][c] === 3) {
      setWon(true);
      session.triggerComplete(`කාසි: ${nc}`);
    }
    setGrid(ng);
    setCoins(nc);
    setPos([r, c]);
  };

  const reset = () => {
    setGrid(MAZE_GRID.map((r) => [...r]));
    setPos([1, 1]);
    setCoins(0);
    setWon(false);
  };

  return (
    <View style={cm.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(reset)}
        onClose={session.handleClose}
        title="ජය! 🪙"
        msg={`${coins} කාසි! 💜`}
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={cm.header}>
        <Text style={cm.title}>🪙 කාසි මාලිම</Text>
        <Text style={cm.score}>🪙{coins}</Text>
      </View>
      <Text style={cm.hint}>🪙 ගෙන 🚪 සොයන්න!</Text>
      <View style={{ alignSelf: 'center', marginBottom: 10 }}>
        {grid.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {row.map((cell, c) => {
              const isP = pos[0] === r && pos[1] === c;
              return (
                <View
                  key={c}
                  style={[
                    cm.cell,
                    { width: cellW, height: cellW },
                    cell === 1 && cm.wall,
                    isP && cm.player,
                    !isP && cell === 3 && cm.exit,
                  ]}
                >
                  <Text style={{ fontSize: Math.floor(cellW * 0.55) }}>
                    {isP ? '🐝' : cell === 2 ? '🪙' : cell === 3 ? '🚪' : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <View style={cm.dpad}>
        <TouchableOpacity style={cm.arrowBtn} onPress={() => move(-1, 0)}>
          <Text style={cm.arrowT}>↑</Text>
        </TouchableOpacity>
        <View style={cm.arrowRow}>
          <TouchableOpacity style={cm.arrowBtn} onPress={() => move(0, -1)}>
            <Text style={cm.arrowT}>←</Text>
          </TouchableOpacity>
          <View style={{ width: 48 }} />
          <TouchableOpacity style={cm.arrowBtn} onPress={() => move(0, 1)}>
            <Text style={cm.arrowT}>→</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={cm.arrowBtn} onPress={() => move(1, 0)}>
          <Text style={cm.arrowT}>↓</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={cm.resetBtn} onPress={reset}>
        <Text style={cm.resetBtnT}>↺</Text>
      </TouchableOpacity>
    </View>
  );
};

// NUMBER SEQUENCE
const NumberSeq = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'number_seq', gameName: 'අංක', icon: '🔢', onGoBack });
  const [count, setCount] = useState(8);
  const [nums, setNums] = useState([]);
  const [nextNum, setNextNum] = useState(1);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState(null);

  const init = useCallback((c) => {
    setNums(
      Array.from({ length: c }, (_, i) => ({
        val: i + 1,
        x: Math.random() * (width - spacing.md * 2 - 58) + 10,
        y: Math.random() * 270 + 10,
        tapped: false,
      }))
    );
    setNextNum(1);
    setCount(c);
  }, []);

  useEffect(() => {
    init(count);
  }, []);

  const tap = (n) => {
    if (n.tapped) return;
    if (n.val === nextNum) {
      const nn = nums.map((x) => (x.val === n.val ? { ...x, tapped: true } : x));
      setNums(nn);
      setNextNum((v) => v + 1);
      if (nextNum === count) {
        const newScore = score + count * 5;
        setScore(newScore);
        if (count >= 14) {
          session.triggerComplete(`ලකුණු: ${newScore}`);
        } else {
          init(count + 2);
        }
      }
    } else {
      setFlash(n.val);
      setTimeout(() => setFlash(null), 400);
    }
  };

  const resetGame = () => {
    init(8);
    setScore(0);
  };

  return (
    <View style={ns.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(resetGame)}
        onClose={session.handleClose}
        title="ශූරයා! 🔢"
        msg={`${score} ලකුණු 💜`}
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={ns.header}>
        <Text style={ns.title}>🔢 අංක</Text>
        <Text style={ns.score}>{score}</Text>
      </View>
      <Text style={ns.hint}>1→2→3… 🌸</Text>
      <View style={ns.infoRow}>
        <Text style={ns.infoT}>
          ඊළඟ: <Text style={{ color: '#7E57C2', fontWeight: '900' }}>{nextNum}</Text>
        </Text>
        <Text style={ns.infoT}>{count} ගණන</Text>
      </View>
      <View style={ns.area}>
        {nums.map((n) => (
          <TouchableOpacity
            key={n.val}
            onPress={() => tap(n)}
            style={[
              ns.numBtn,
              { left: n.x, top: n.y },
              n.tapped && ns.numBtnDone,
              flash === n.val && ns.numBtnWrong,
            ]}
          >
            <Text style={[ns.numT, n.tapped && { color: '#2E7D32' }]}>{n.tapped ? '✓' : n.val}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={ns.resetBtn} onPress={resetGame}>
        <Text style={ns.resetBtnT}>↺</Text>
      </TouchableOpacity>
    </View>
  );
};

// ROTATION PUZZLE
const RotationPuzzle = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'rotation_puzzle', gameName: 'කරකැවිල්ල', icon: '🔄', onGoBack });
  const PIECES = ['🌸', '💜', '⭐', '🍀', '🌙', '🦋', '🎵', '🌺', '🌈'];
  const [tiles, setTiles] = useState(() =>
    PIECES.map((emoji, i) => ({ id: i, emoji, rotation: [0, 90, 180, 270][Math.floor(Math.random() * 4)] }))
  );
  const [moves, setMoves] = useState(0);

  const won = tiles.every((t) => t.rotation === 0);

  const rotate = (idx) => {
    const nt = tiles.map((t, i) => (i === idx ? { ...t, rotation: (t.rotation + 90) % 360 } : t));
    setTiles(nt);
    const newMoves = moves + 1;
    setMoves(newMoves);
    if (nt.every((t) => t.rotation === 0)) {
      session.triggerComplete(`ඇදීම්: ${newMoves}`);
    }
  };

  const shuffle = () => {
    setTiles(PIECES.map((emoji, i) => ({ id: i, emoji, rotation: [90, 180, 270][Math.floor(Math.random() * 3)] })));
    setMoves(0);
  };

  const tileSize = Math.floor((width - spacing.md * 2 - 30) / 3);

  return (
    <View style={rp.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(shuffle)}
        onClose={session.handleClose}
        title="ජය! 🔄"
        msg={`${moves} ඇදීම් 💜`}
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={rp.header}>
        <Text style={rp.title}>🔄 කරකැවිල්ල</Text>
        <Text style={rp.score}>{moves}</Text>
      </View>
      <Text style={rp.hint}>ස්පර්ශ→කරකවන්න 0° 🌸</Text>
      {won && (
        <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={rp.wonBanner}>
          <Text style={rp.wonT}>🎉 සියල්ල!</Text>
        </LinearGradient>
      )}
      <View style={rp.grid}>
        {tiles.map((t, i) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => rotate(i)}
            style={[rp.tile, { width: tileSize, height: tileSize }, t.rotation === 0 && rp.tileDone]}
          >
            <Text style={{ fontSize: Math.floor(tileSize * 0.42), transform: [{ rotate: `${t.rotation}deg` }] }}>
              {t.emoji}
            </Text>
            <Text style={{ fontSize: 10, color: t.rotation === 0 ? '#2E7D32' : '#999' }}>{t.rotation}°</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={rp.shuffleBtn} onPress={shuffle}>
        <Text style={rp.shuffleBtnT}>↺</Text>
      </TouchableOpacity>
    </View>
  );
};

// SLIDING PUZZLE
const SlidingPuzzle = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'sliding_puzzle', gameName: 'ස්ලයිඩ්', icon: '🧩', onGoBack });
  const SZ = 3;
  const TOTAL = SZ * SZ;
  const EMOJIS = ['🌸', '💜', '⭐', '🍀', '🌙', '🦋', '🎵', '🌺'];
  const shuffleArr = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const [tiles, setTiles] = useState(() => shuffleArr(Array.from({ length: TOTAL }, (_, i) => i)));
  const [moves, setMoves] = useState(0);

  const tileSize = Math.floor((width - spacing.md * 2 - 20) / SZ);

  const tap = (idx) => {
    const empty = tiles.indexOf(TOTAL - 1);
    const r1 = Math.floor(idx / SZ),
      c1 = idx % SZ,
      r2 = Math.floor(empty / SZ),
      c2 = empty % SZ;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
    const nt = [...tiles];
    [nt[idx], nt[empty]] = [nt[empty], nt[idx]];
    setTiles(nt);
    const newMoves = moves + 1;
    setMoves(newMoves);
    if (nt.every((v, i) => v === i)) {
      session.triggerComplete(`ඇදීම්: ${newMoves}`);
    }
  };

  const reset = () => {
    setTiles(shuffleArr(Array.from({ length: TOTAL }, (_, i) => i)));
    setMoves(0);
  };

  return (
    <View style={slp.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(reset)}
        onClose={session.handleClose}
        title="ජය! 🧩"
        msg={`${moves} ඇදීම් 💜`}
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={slp.header}>
        <Text style={slp.title}>🧩 ස්ලයිඩ්</Text>
        <Text style={slp.score}>{moves}</Text>
      </View>
      <Text style={slp.hint}>slide කරා! 🌸</Text>
      <View style={slp.grid}>
        {tiles.map((val, i) => {
          const isEmpty = val === TOTAL - 1;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => tap(i)}
              style={[slp.tile, { width: tileSize, height: tileSize }, isEmpty && slp.empty, !isEmpty && val === i && slp.correct]}
            >
              {!isEmpty && (
                <>
                  <Text style={{ fontSize: Math.floor(tileSize * 0.36) }}>{EMOJIS[val]}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: val === i ? '#2E7D32' : '#666' }}>{val + 1}</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={slp.resetBtn} onPress={reset}>
        <Text style={slp.resetBtnT}>↺</Text>
      </TouchableOpacity>
    </View>
  );
};

const NewActivityDetail = ({ activity, onComplete }) => {
  const [completedTime, setCompletedTime] = useState(null);

  useEffect(() => {
    checkCompletion();
  }, [activity.id]);

  const checkCompletion = async () => {
    try {
      const dateStr = new Date().toDateString();
      const key = `completed_${activity.id}_${dateStr}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        setCompletedTime(saved);
        onComplete();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markComplete = async () => {
    try {
      const dateStr = new Date().toDateString();
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const key = `completed_${activity.id}_${dateStr}`;
      await AsyncStorage.setItem(key, timeStr);
      setCompletedTime(timeStr);
      onComplete();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={newAct.cont}>
      <LinearGradient colors={['#EDE7F6', '#D1C4E9']} style={newAct.headerCard}>
        <Text style={newAct.icon}>{activity.icon}</Text>
        <Text style={newAct.title}>{activity.label}</Text>
        <Text style={newAct.purpose}>{activity.purpose}</Text>
        <Text style={newAct.duration}>⏱ {activity.duration}</Text>
      </LinearGradient>

      <View style={newAct.section}>
        <Text style={newAct.sectionTitle}>උපදෙස් (Instructions):</Text>
        {activity.instructions?.map((step, idx) => (
          <View key={idx} style={newAct.stepRow}>
            <View style={newAct.stepDot} />
            <Text style={newAct.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={newAct.section}>
        <Text style={newAct.sectionTitle}>ප්‍රතිලාභ (Benefits):</Text>
        {activity.benefits?.map((ben, idx) => (
          <View key={idx} style={newAct.stepRow}>
            <Text style={newAct.checkIcon}>✓</Text>
            <Text style={newAct.stepText}>{ben}</Text>
          </View>
        ))}
      </View>

      {completedTime ? (
        <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={newAct.completedCard}>
          <Text style={newAct.completedText}>✓ අද දින සම්පූර්ණ කරන ලදි ({completedTime})</Text>
        </LinearGradient>
      ) : (
        <TouchableOpacity style={newAct.completeBtn} onPress={markComplete}>
          <LinearGradient colors={['#7E57C2', '#E91E8C']} style={newAct.completeBtnIn}>
            <Text style={newAct.completeBtnT}>✓ සම්පූර්ණ කරන්න</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const moodCards = [
  { id: 'sad', emoji: '😔', label: 'දුකයි', color: ['#E3F2FD', '#BBDEFB'], reflection: 'ඔබේ හැඟීම් ස්වාභාවිකයි 💙' },
  { id: 'angry', emoji: '😡', label: 'තරහයි', color: ['#FFEBEE', '#FFCDD2'], reflection: 'කෝපය පාලනය කර සන්සුන් වන්න 🌿' },
  { id: 'calm', emoji: '😴', label: 'ශාන්තයි', color: ['#F3E5F5', '#E1BEE7'], reflection: 'මනස සන්සුන්ව තබාගන්න 🌙' },
  { id: 'anxiety', emoji: '😟', label: 'කාංසාව', color: ['#FFF9C4', '#FFF3A0'], reflection: 'ගැඹුරු ශ්වාසයක් ගන්න. ඔබ සුරක්ෂිතයි ⭐' },
  { id: 'happy', emoji: '😊', label: 'සතුටුයි', color: ['#E8F5E9', '#C8E6C9'], reflection: 'ඔබේ සතුට ආශිර්වාදයකි! 🌸' },
  { id: 'grateful', emoji: '🥺', label: 'කෘතඥයි', color: ['#FCE4EC', '#F8BBD9'], reflection: 'කෘතඥභාවය සිතට සුවයක් ලබාදෙයි 💜' },
  { id: 'uncertain', emoji: '😳', label: 'නොදනිමි', color: ['#EEEEEE', '#F5F5F5'], reflection: 'හැඟීම් වෙනස් වීම ස්වාභාවිකයි 🌙' },
  { id: 'strong', emoji: '💪', label: 'ශක්තිමත්', color: ['#E8F5E9', '#A5D6A7'], reflection: 'ඔබ ඉතා ශක්තිමත් අම්මා කෙනෙකි! 🏆' },
  { id: 'empty', emoji: '🫥', label: 'හිස් හැඟීමක්', color: ['#E0F7FA', '#B2EBF2'], reflection: 'කෙටි විවේකයක් ගෙන මනසට සහනය දෙන්න 🌸' },
  { id: 'stress', emoji: '😫', label: 'මානසික පීඩනය', color: ['#FFE0B2', '#FFCC80'], reflection: 'ඔබට විවේකයක් අවශ්‍යයි. සෙමෙන් හුස්ම ගන්න 🌿' },
  { id: 'feared', emoji: '😨', label: 'බියගැන්වුණු', color: ['#FFF8E1', '#FFE082'], reflection: 'ඔබ තනිවී නැත, කනස්සල්ල දුරලන්න 💜' },
  { id: 'loved', emoji: '🥰', label: 'ආදරණීයයි', color: ['#F8BBD9', '#F48FB1'], reflection: 'ආදරය සහ උණුසුම සැමවිටම විඳින්න 🌸' },
  { id: 'tired', emoji: '🥱', label: 'මහන්සියි', color: ['#D1C4E9', '#B39DDB'], reflection: 'ප්‍රමාණවත් විවේකයක් ලබාගන්න 🌙' },
  { id: 'lonely', emoji: '🧍', label: 'තනිවෙලා', color: ['#E1BEE7', '#CE93D8'], reflection: 'ඔබ තනිවී නැත, අප සැමවිටම ඔබ සමඟයි 💜' }
];

const EmotionJournal = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'emotion_journal', gameName: 'හැඟීම් දිනපොත', icon: '🎭', onGoBack });
  const [selected, setSelected] = useState(null);
  const [journal, setJournal] = useState([]);
  const [showRefl, setShowRefl] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const selectEm = (em) => {
    setSelected(em);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.15, duration: 200, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setShowRefl(true), 300);
  };

  const saveEntry = () => {
    if (!selected) return;
    setJournal((j) => [
      ...j,
      {
        emoji: selected.emoji,
        label: selected.label,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    session.triggerComplete(`හැඟීම: ${selected.label}`);
  };

  const resetGame = () => {
    setSelected(null);
    setShowRefl(false);
  };

  return (
    <View style={ej.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(resetGame)}
        onClose={session.handleClose}
        title="සටහන් කරගන්නා ලදී! 🎭"
        msg="ඔබේ හැඟීම් දිනපොත යාවත්කාලීන විය 💜"
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={ej.header}>
        <Text style={ej.title}>🎭 හැඟීම් දිනපොත</Text>
        <Text style={ej.count}>අද: {journal.length}</Text>
      </View>
      <Text style={ej.hint}>ඔබේ හැඟීම ස්පර්ශ කරන්න 🌸</Text>
      {showRefl && selected ? (
        <LinearGradient colors={selected.color || ['#FCE4EC', '#F8BBD9']} style={ej.reflCard}>
          <Text style={ej.reflEmoji}>{selected.emoji}</Text>
          <Text style={ej.reflLabel}>{selected.label}</Text>
          <Text style={ej.reflText}>{selected.reflection}</Text>
          <TouchableOpacity style={ej.saveBtn} onPress={saveEntry}>
            <LinearGradient colors={['#7E57C2', '#E91E8C']} style={ej.saveBtnIn}>
              <Text style={ej.saveBtnT}>💾 සටහන්</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSelected(null); setShowRefl(false); }}>
            <Text style={ej.cancelT}>← ආපසු</Text>
          </TouchableOpacity>
        </LinearGradient>
      ) : (
        <>
          <View style={ej.grid}>
            {moodCards.map((em) => (
              <TouchableOpacity key={em.id} onPress={() => selectEm(em)} style={[ej.emotionBtn, { backgroundColor: em.color[0] }]}>
                <Text style={ej.emotionEmoji}>{em.emoji}</Text>
                <Text style={ej.emotionLabel}>{em.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {journal.length > 0 && (
            <View style={ej.journalList}>
              <Text style={ej.journalTitle}>අද:</Text>
              {journal.slice(-5).map((e, i) => (
                <View key={i} style={ej.journalItem}>
                  <Text style={ej.jEmoji}>{e.emoji}</Text>
                  <Text style={ej.jLabel}>{e.label}</Text>
                  <Text style={ej.jTime}>{e.time}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

// MINDFUL TAP
const MT_PATTERNS = [
  { name: 'ශ්වාස රිද්මය', cues: ['ශ්වාස… (ආශ්වාස)', 'රඳවා තබන්න…', 'පිට කරන්න… (ප්‍රශ්වාස)', 'රඳවා තබන්න…'], durations: [4, 2, 4, 2], color: '#7E57C2' },
];

const MindfulTap = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'mindful_tap', gameName: 'සිහිකල්පනාව', icon: '🌿', onGoBack });
  const [running, setRunning] = useState(false);
  const [cueIdx, setCueIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [taps, setTaps] = useState(0);
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);

  const pat = MT_PATTERNS[0];
  const pulse = useRef(new Animated.Value(1)).current;
  const loopRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    const dur = pat.durations[cueIdx];
    setTimeLeft(dur);
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.25, duration: (dur * 1000) / 2, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: (dur * 1000) / 2, useNativeDriver: true }),
      ])
    );
    loopRef.current.start();
    const t = setInterval(() => setTimeLeft((v) => (v > 1 ? v - 1 : v)), 1000);
    const a = setTimeout(() => {
      clearInterval(t);
      loopRef.current?.stop();
      const ni = (cueIdx + 1) % pat.cues.length;
      if (ni === 0) {
        if (round >= 4) {
          setRunning(false);
          setDone(true);
          session.triggerComplete(`ස්පර්ශ: ${taps}`);
        } else {
          setRound((r) => r + 1);
          setCueIdx(0);
        }
      } else setCueIdx(ni);
    }, dur * 1000);

    return () => {
      clearInterval(t);
      clearTimeout(a);
      loopRef.current?.stop();
    };
  }, [running, cueIdx, round]);

  const start = () => {
    setCueIdx(0);
    setRound(1);
    setTaps(0);
    setDone(false);
    session.startNewSession();
    setRunning(true);
  };

  const handleBack = () => {
    setRunning(false);
    session.handleBack(() => {
      loopRef.current?.stop();
    });
  };

  return (
    <View style={mt.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(start)}
        onClose={session.handleClose}
        title="සම්පූර්ණයි! 🌿"
        msg={`${taps} වාරයක් ස්පර්ශ කළා 💜`}
      />
      <TouchableOpacity onPress={handleBack} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={mt.header}>
        <Text style={mt.title}>🌿 සිහිකල්පනාව</Text>
        <Text style={mt.score}>⭐{taps}</Text>
      </View>
      <Text style={mt.hint}>ශ්වාස රිද්මය — කවය ස්පර්ශ කරන්න 🌸</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 20 }}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <TouchableOpacity
            onPress={() => {
              if (running) setTaps((t) => t + 1);
              else start();
            }}
            style={[mt.circle, { borderColor: pat.color }]}
          >
            <LinearGradient colors={[pat.color + '33', pat.color + '11']} style={mt.circleInner}>
              {running ? (
                <>
                  <Text style={[mt.circleT, { color: pat.color }]}>{pat.cues[cueIdx]}</Text>
                  <Text style={[mt.circleCount, { color: pat.color }]}>{timeLeft}</Text>
                  <Text style={mt.circleRound}>වට {round}/4</Text>
                </>
              ) : done ? (
                <Text style={mt.circleT}>🌸 සම්පූර්ණ!</Text>
              ) : (
                <Text style={mt.circleT}>▶ ආරම්භ</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
      {done && (
        <LinearGradient colors={['#EDE7F6', '#FCE4EC']} style={mt.doneCard}>
          <Text style={mt.doneT}>🌸 සම්පූර්ණයි! ස්පර්ශ {taps} වාරයක්! 💜</Text>
        </LinearGradient>
      )}
    </View>
  );
};

// MOOD BOARD
const MB_ITEMS = [
  ['☀️', '🌙', '🌧️', '⛅', '🌈', '🌪️'],
  ['🌸', '🌹', '🥀', '🌿', '🍂', '🌱'],
  ['❤️', '💜', '💙', '🖤', '🤍', '💛'],
  ['😊', '😔', '😤', '🥹', '😴', '💪'],
  ['🦋', '🕊️', '🌊', '🔥', '⭐', '🌙'],
  ['🍵', '🍼', '📖', '🎵', '🏠', '👶'],
];
const MB_LABELS = ['කාලගුණය', 'ස්වභාවය', 'හැඟීම', 'ආකල්පය', 'ශක්‍යතාව', 'ජීවිතය'];

const MoodBoard = ({ onGoBack }) => {
  const session = useGameSession({ gameId: 'mood_board', gameName: 'මනෝභාව පුවරුව', icon: '🎨', onGoBack });
  const [board, setBoard] = useState(Array(6).fill(null));
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);

  const toggle = (ri, emoji) => {
    const nb = [...board];
    nb[ri] = nb[ri] === emoji ? null : emoji;
    setBoard(nb);
    setSaved(false);
  };

  const save = () => {
    setHistory((h) => [...h.slice(-4), { emojis: [...board], date: new Date().toLocaleDateString() }]);
    setSaved(true);
    session.triggerComplete('මනෝභාව පුවරුව සුරකියි');
  };

  const clear = () => {
    setBoard(Array(6).fill(null));
    setSaved(false);
  };

  return (
    <View style={mb.cont}>
      <CongratsPopup
        visible={session.showCompletion}
        onPlayAgain={() => session.handlePlayAgain(clear)}
        onClose={session.handleClose}
        title="සුරකින ලදී! 🎨"
        msg="ඔබේ මනෝභාව පුවරුව සුරකියි 💜"
      />
      <TouchableOpacity onPress={() => session.handleBack()} style={[s.backBtn, { alignSelf: 'flex-start' }]}>
        <Text style={s.backText}>← ආපසු</Text>
      </TouchableOpacity>
      <View style={mb.header}>
        <Text style={mb.title}>🎭 මනෝභාව පුවරුව</Text>
      </View>
      <Text style={mb.hint}>ඔබේ හැඟීම් — emoji තෝරන්න 🌸</Text>
      {MB_ITEMS.map((row, ri) => (
        <View key={ri} style={mb.row}>
          <Text style={mb.rowLabel}>{MB_LABELS[ri]}</Text>
          <View style={mb.rowItems}>
            {row.map((emoji, ei) => (
              <TouchableOpacity
                key={ei}
                onPress={() => toggle(ri, emoji)}
                style={[mb.item, board[ri] === emoji && mb.itemSel]}
              >
                <Text style={{ fontSize: 24 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <View style={mb.preview}>
        <Text style={mb.previewLabel}>අද ඔබේ ළොව:</Text>
        <View style={mb.previewRow}>
          {board.map((e, i) =>
            e ? (
              <Text key={i} style={{ fontSize: 26 }}>
                {e}
              </Text>
            ) : (
              <Text key={i} style={{ fontSize: 26, opacity: 0.2 }}>
                ○
              </Text>
            )
          )}
        </View>
      </View>
      <View style={mb.btnRow}>
        <TouchableOpacity style={mb.saveBtn} onPress={save}>
          <LinearGradient colors={['#7E57C2', '#E91E8C']} style={mb.saveBtnIn}>
            <Text style={mb.saveBtnT}>{saved ? '✓ සුරකිනා' : '💾 සුරකින්න'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={mb.clearBtn} onPress={clear}>
          <Text style={mb.clearBtnT}>↺ ඉවත්</Text>
        </TouchableOpacity>
      </View>
      {history.length > 0 && (
        <View style={mb.historyBox}>
          <Text style={mb.historyTitle}>පසුගිය:</Text>
          {history.slice(-3).map((h, i) => (
            <View key={i} style={mb.historyItem}>
              <Text style={mb.historyDate}>{h.date}</Text>
              <View style={{ flexDirection: 'row' }}>
                {h.emojis.map((e, j) => (e ? <Text key={j} style={{ fontSize: 16 }}>{e}</Text> : null))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};


// GAMES LIST & MAIN SCREEN
const ALL_GAMES_LIST = [
  { id: 'word_search', label: 'වචන සෙවීම', labelEn: 'Find hidden words', icon: '🔤', color: ['#E8F5E9', '#C8E6C9'], accent: '#2E7D32' },

  { id: 'memory_match', label: 'මතක ගැළපීම', labelEn: 'Find pairs', icon: '🃏', color: ['#EDE7F6', '#D1C4E9'], accent: '#7E57C2' },
  { id: 'baby_mood', label: 'ළදරු හැඟීම', labelEn: "Baby's mood", icon: '😊', color: ['#FFF9C4', '#FFF3A0'], accent: '#F57F17' },
  { id: 'self_care', label: 'ස්වයං රැකවරණය', labelEn: 'Daily care', icon: '🌿', color: ['#E8F5E9', '#A5D6A7'], accent: '#2E7D32' },
  { id: 'bubble_pop', label: 'බුබුළු ෆොන්', labelEn: 'Pop flowers only!', icon: '🌸', color: ['#E3F2FD', '#BBDEFB'], accent: '#1565C0' },
  { id: 'word_match', label: 'වචන ගැළපීම', labelEn: 'New words each turn', icon: '💬', color: ['#F3E5F5', '#E1BEE7'], accent: '#7E57C2' },
  { id: 'word_builder', label: 'වචන ගොඩනැගීම', labelEn: 'Build words + hints', icon: '🔠', color: ['#EDE7F6', '#D1C4E9'], accent: '#7E57C2' },
  { id: 'pattern_repeat', label: 'රටාව නැවත', labelEn: 'Memory pattern', icon: '🧠', color: ['#FCE4EC', '#F8BBD9'], accent: '#E91E8C' },
  { id: 'spot_diff', label: 'වෙනස සොයන්න', labelEn: 'Spot difference', icon: '🔍', color: ['#E8F5E9', '#C8E6C9'], accent: '#2E7D32' },
  { id: 'sequence_order', label: 'අනුපිළිවෙල', labelEn: 'Order steps', icon: '🧩', color: ['#F3E5F5', '#E1BEE7'], accent: '#8E24AA' },
  { id: 'number_seq', label: 'අංක', labelEn: 'Tap 1→2→3', icon: '🔢', color: ['#E8F5E9', '#A5D6A7'], accent: '#2E7D32' },
  { id: 'coin_maze', label: 'කාසි මාලිම', labelEn: 'Collect coins', icon: '🪙', color: ['#FFF9C4', '#FFF3E0'], accent: '#F57F17' },
  { id: 'rotation_puzzle', label: 'කරකැවිල්ල', labelEn: 'Rotate tiles', icon: '🔄', color: ['#EDE7F6', '#D1C4E9'], accent: '#7E57C2' },
  { id: 'sliding_puzzle', label: 'ස්ලයිඩ්', labelEn: 'Slide tiles', icon: '🧩', color: ['#E8F5E9', '#C8E6C9'], accent: '#2E7D32' },
  { id: 'emotion_journal', label: 'හැඟීම් දිනපොත', labelEn: 'Track your mood', icon: '🎭', color: ['#FCE4EC', '#F8BBD9'], accent: '#E91E8C' },
  { id: 'mindful_tap', label: 'සිහිකල්පනාව', labelEn: 'Breathing rhythm', icon: '🌿', color: ['#E8F5E9', '#C8E6C9'], accent: '#2E7D32' },
  { id: 'mood_board', label: 'මනෝභාව පුවරුව', labelEn: 'Express your mood', icon: '🎨', color: ['#EDE7F6', '#D1C4E9'], accent: '#7E57C2' },
  { id: 'mandala', label: 'මණ්ඩල කලා', labelEn: 'Colour mandalas', icon: '🔮', color: ['#EDE7F6', '#D1C4E9'], accent: '#7E57C2' },
  { id: 'colouring', label: 'රූප පාටකිරීම', labelEn: 'Colouring pages', icon: '🎨', color: ['#FCE4EC', '#F8BBD9'], accent: '#E91E8C' },
];
const MATURE_IDS = ['emotion_journal', 'mindful_tap', 'mood_board'];

const ActivityScreen = ({ navigation, route }) => {
  const [selAct, setSelAct] = useState(null);
  const [selGame, setSelGame] = useState(null);
  const [view, setView] = useState('list');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (route?.params?.activityId === 'baby_mood' || route?.params?.gameId === 'baby_mood') {
      const found = ALL_GAMES_LIST.find((x) => x.id === 'baby_mood');
      if (found) {
        setSelGame(found);
        setView('game');
        return;
      }
    }
    if (route?.params?.activityId) {
      const a = [...ALL_ACTIVITIES, ...NEW_ACTIVITIES].find((x) => x.id === route.params.activityId);
      if (a) {
        setSelAct(a);
        setView('activity');
        setDone(false);
      }
    }
    if (route?.params?.gameId) {
      const found = ALL_GAMES_LIST.find((x) => x.id === route.params.gameId);
      if (found) {
        setSelGame(found);
        setView('game');
      }
    }
  }, [route?.params]);

  const handleActivityComplete = (act) => {
    setDone(true);
    recordActivityApi({
      activityId: `${act.id}_${Date.now()}`,
      activityName: act.label || act.id,
      icon: act.icon || '🌸',
      completed: true,
      duration: 60,
      note: 'අධ්‍යාපනික/සහායක ක්‍රියාකාරකම සම්පූර්ණ කරන ලදි',
    });
  };

  const handleActivityBack = () => {
    if (selAct && !done) {
      recordActivityApi({
        activityId: `${selAct.id}_${Date.now()}`,
        activityName: selAct.label || selAct.id,
        icon: selAct.icon || '🌸',
        completed: false,
        duration: 30,
        note: 'ආපසු ගියා (Incomplete)',
      });
    }
    goBack();
  };

  const renderAct = (act) => {
    if (act.isNewFormat) {
      return <NewActivityDetail activity={act} onComplete={() => handleActivityComplete(act)} />;
    }
    switch (act.type) {
      case 'breathing':
        return <BreathingEx activity={act} onComplete={() => handleActivityComplete(act)} />;
      case 'guided':
        return <GuidedAct activity={act} onComplete={() => handleActivityComplete(act)} />;
      case 'prompts':
        return <PromptsAct activity={act} onComplete={() => handleActivityComplete(act)} />;
      default:
        return <GuidedAct activity={act} onComplete={() => handleActivityComplete(act)} />;
    }
  };

  const goBack = () => {
    if (route?.params?.gameId || route?.params?.activityId || route?.params?.fromRecommendations) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Recommendations');
      }
    } else {
      setView('list');
      setSelAct(null);
      setSelGame(null);
      setDone(false);
    }
  };

  const renderGame = (id) => {
    switch (id) {
      case 'word_search':
        return <WordSearch onGoBack={goBack} />;

      case 'memory_match':
        return <MemoryMatch navigation={navigation} onGoBack={goBack} />;
      case 'baby_mood':
        return <BabyMoodGuess onGoBack={goBack} />;
      case 'self_care':
        return <SelfCareQuest onGoBack={goBack} />;
      case 'bubble_pop':
        return <BubblePop navigation={navigation} onGoBack={goBack} />;
      case 'word_match':
        return <WordMatchGame onGoBack={goBack} />;
      case 'word_builder':
        return <WordBuilder onGoBack={goBack} />;
      case 'pattern_repeat':
        return <PatternRepeat onGoBack={goBack} />;
      case 'spot_diff':
        return <SpotDifference onGoBack={goBack} />;
      case 'sequence_order':
        return <SequenceOrder onGoBack={goBack} />;
      case 'number_seq':
        return <NumberSeq onGoBack={goBack} />;
      case 'coin_maze':
        return <CoinMaze onGoBack={goBack} />;
      case 'rotation_puzzle':
        return <RotationPuzzle onGoBack={goBack} />;
      case 'sliding_puzzle':
        return <SlidingPuzzle onGoBack={goBack} />;
      case 'emotion_journal':
        return <EmotionJournal onGoBack={goBack} />;
      case 'mindful_tap':
        return <MindfulTap onGoBack={goBack} />;
      case 'mood_board':
        return <MoodBoard onGoBack={goBack} />;
      case 'mandala':
      case 'colouring':
        navigation.navigate('Art');
        return null;
      default:
        return <BubblePop navigation={navigation} onGoBack={goBack} />;
    }
  };

  if (view === 'activity' && selAct)
    return (
      <View style={s.container}>
        <LinearGradient colors={['#F8F4FF', '#F0FAFF']} style={s.gradient}>
          <ScrollView contentContainerStyle={s.scroll}>
            <TouchableOpacity onPress={handleActivityBack} style={s.backBtn}>
              <Text style={s.backText}>← ආපසු</Text>
            </TouchableOpacity>
            <Text style={s.actTitle}>{selAct.label}</Text>
            <Text style={s.actSub}>{selAct.desc}</Text>
            {renderAct(selAct)}
            {done && (
              <LinearGradient colors={['#EDE7F6', '#FCE4EC']} style={s.banner}>
                <Text style={s.bannerT}>🌸 සම්පූර්ණ! 💜</Text>
              </LinearGradient>
            )}
            <View style={{ height: 110 }} />
          </ScrollView>
        </LinearGradient>
      </View>
    );

  if (view === 'game' && selGame)
    return (
      <View style={s.container}>
        <LinearGradient colors={['#F8F4FF', '#F0FAFF']} style={s.gradient}>
          <ScrollView contentContainerStyle={s.scroll}>
            {renderGame(selGame.id)}
            <View style={{ height: 110 }} />
          </ScrollView>
        </LinearGradient>
      </View>
    );

  return (
    <View style={s.container}>
      <LinearGradient colors={['#F8F4FF', '#F0FAFF']} style={s.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <Text style={s.pageTitle}>ක්‍රියාකාරකම් සහ ක්‍රීඩා 🌸</Text>
          <Text style={s.pageSub}>ඔබේ යහපැවැත්ම 💜</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Art')} style={s.artBanner}>
            <Text style={s.artBannerIcon}>🎨</Text>
            <View style={s.artBannerInfo}>
              <Text style={s.artBannerTitle}>කලා සහ රූප</Text>
              <Text style={s.artBannerSub}>10 මණ්ඩල + 10 රූප</Text>
            </View>
            <Text style={s.artBannerArrow}>→</Text>
          </TouchableOpacity>
          <Text style={[s.sectionLabel, { color: '#E91E8C' }]}>💜 සුව ලබාදෙන ක්‍රීඩා</Text>
          <View style={s.gamesGrid}>
            {ALL_GAMES_LIST.filter((g) => MATURE_IDS.includes(g.id)).map((game) => (
              <TouchableOpacity
                key={game.id}
                style={s.gameWrap}
                onPress={() => {
                  setSelGame(game);
                  setView('game');
                }}
              >
                <LinearGradient colors={game.color} style={s.gameCard}>
                  <Text style={s.gameIcon}>{game.icon}</Text>
                  <Text style={s.gameLabel}>{game.label}</Text>
                  <Text style={[s.gameSub, { color: game.accent }]}>{game.labelEn}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 40 }} />
          <Text style={[s.sectionLabel, { color: '#2E7D32' }]}>🌿 මනස සැහැල්ලු කිරීම</Text>
          <View style={s.gamesGrid}>
            {ALL_GAMES_LIST.filter((g) => !MATURE_IDS.includes(g.id) && g.id !== 'word_search' && g.id !== 'mandala' && g.id !== 'colouring').map(
              (game) => (
                <TouchableOpacity
                  key={game.id}
                  style={s.gameWrap}
                  onPress={() => {
                    setSelGame(game);
                    setView('game');
                  }}
                >
                  <LinearGradient colors={game.color} style={s.gameCard}>
                    <Text style={s.gameIcon}>{game.icon}</Text>
                    <Text style={s.gameLabel}>{game.label}</Text>
                    <Text style={[s.gameSub, { color: game.accent }]}>{game.labelEn}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )
            )}
          </View>
          <View style={{ height: 110 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const newAct = StyleSheet.create({
  cont: { flex: 1, paddingBottom: 20 },
  headerCard: { padding: 24, borderRadius: radius.xl, alignItems: 'center', marginBottom: 24, ...shadows.card },
  icon: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', color: '#7E57C2', marginBottom: 8, textAlign: 'center' },
  purpose: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 12, fontStyle: 'italic' },
  duration: { fontSize: 14, fontWeight: '800', color: '#7E57C2' },
  section: { backgroundColor: 'white', padding: 20, borderRadius: radius.lg, marginBottom: 16, ...shadows.soft },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#333', marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E91E8C', marginTop: 6, marginRight: 12 },
  checkIcon: { fontSize: 16, color: '#2E7D32', marginRight: 10, fontWeight: '900' },
  stepText: { flex: 1, fontSize: 15, color: '#555', lineHeight: 22 },
  completeBtn: { marginTop: 10, borderRadius: 99, ...shadows.card },
  completeBtnIn: { paddingVertical: 16, alignItems: 'center', borderRadius: 99 },
  completeBtnT: { color: 'white', fontSize: 18, fontWeight: '900' },
  completedCard: { marginTop: 10, padding: 16, borderRadius: radius.lg, alignItems: 'center', borderWidth: 1, borderColor: '#A5D6A7' },
  completedText: { color: '#2E7D32', fontSize: 16, fontWeight: '800' },
});

const s = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scroll: { padding: spacing.md, paddingTop: 50 },
  pageTitle: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, marginBottom: 4 },
  pageSub: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.lg },
  artBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    padding: spacing.md,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    ...shadows.soft,
  },
  artBannerIcon: { fontSize: 32, marginRight: 12 },
  artBannerInfo: { flex: 1 },
  artBannerTitle: { fontSize: 17, fontWeight: '800', color: '#F57F17' },
  artBannerSub: { fontSize: 13, color: '#F9A825' },
  artBannerArrow: { fontSize: 20, color: '#F57F17' },
  sectionLabel: { fontSize: 18, fontWeight: '900', marginBottom: 12, marginTop: 10 },
  gamesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gameWrap: { width: '48%', marginBottom: 14 },
  gameCard: { padding: 16, borderRadius: radius.lg, alignItems: 'center', ...shadows.soft },
  gameIcon: { fontSize: 36, marginBottom: 8 },
  gameLabel: { fontSize: 14, fontWeight: '800', textAlign: 'center', color: colors.textPrimary },
  gameSub: { fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  backBtn: { marginBottom: 16, alignSelf: 'flex-start' },
  backText: { color: '#7E57C2', fontWeight: '800', fontSize: 16 },
  actTitle: { fontSize: 24, fontWeight: '900', color: colors.textPrimary, marginBottom: 6 },
  actSub: { fontSize: 15, color: colors.textSecondary, marginBottom: 20 },
  banner: { padding: 16, borderRadius: radius.lg, alignItems: 'center', marginTop: 20 },
  bannerT: { fontSize: 16, fontWeight: '800', color: '#7E57C2' },
});

const bx = StyleSheet.create({
  cont: { alignItems: 'center', paddingVertical: 20 },
  intro: { padding: 16, borderRadius: radius.lg, marginBottom: 20 },
  introText: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 22 },
  circleWrap: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  circleOuter: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  circleInner: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', ...shadows.soft },
  icon: { fontSize: 40, marginBottom: 8 },
  count: { fontSize: 32, fontWeight: '900' },
  info: { alignItems: 'center' },
  phaseName: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
  phaseInstr: { fontSize: 16, color: '#555', marginBottom: 16 },
  cycleT: { fontSize: 14, color: '#888', fontWeight: '700' },
  startBtn: { borderRadius: 99 },
  startBtnIn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 99 },
  startBtnText: { color: 'white', fontWeight: '900', fontSize: 16 },
  done: { padding: 24, borderRadius: radius.xl, alignItems: 'center' },
  doneEmoji: { fontSize: 48, marginBottom: 12 },
  doneTitle: { fontSize: 24, fontWeight: '900', color: '#2E7D32', marginBottom: 8 },
  doneMsg: { fontSize: 16, color: '#4CAF50' },
});

const gd = StyleSheet.create({
  intro: { padding: 16, borderRadius: radius.lg, marginBottom: 20 },
  introText: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 22 },
  startBtn: { borderRadius: 99, alignSelf: 'center' },
  startBtnIn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 99 },
  startBtnText: { color: 'white', fontWeight: '900', fontSize: 16 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ddd' },
  dotA: { backgroundColor: '#7E57C2', transform: [{ scale: 1.2 }] },
  dotD: { backgroundColor: '#E91E8C' },
  stepCard: { padding: 24, borderRadius: radius.xl, alignItems: 'center', marginBottom: 24, ...shadows.card },
  stepLabel: { fontSize: 20, fontWeight: '900', marginBottom: 12 },
  stepText: { fontSize: 16, color: '#444', textAlign: 'center', lineHeight: 24 },
  timerRow: { alignItems: 'center' },
  timerCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 16, ...shadows.soft },
  timerCount: { fontSize: 32, fontWeight: '900' },
  timerBg: { width: '100%', height: 8, backgroundColor: '#ddd', borderRadius: 4, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 4 },
  done: { padding: 24, borderRadius: radius.xl, alignItems: 'center' },
  doneEmoji: { fontSize: 48, marginBottom: 12 },
  doneTitle: { fontSize: 24, fontWeight: '900', color: '#2E7D32' },
});

const pr = StyleSheet.create({
  intro: { padding: 16, borderRadius: radius.lg, marginBottom: 20 },
  introText: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 22 },
  counter: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 12, fontWeight: '700' },
  card: { padding: 32, borderRadius: radius.xl, alignItems: 'center', marginBottom: 24, ...shadows.card },
  cardEmoji: { fontSize: 48, marginBottom: 16 },
  cardText: { fontSize: 18, color: '#555', textAlign: 'center', lineHeight: 26, fontWeight: '600' },
  btnRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  prev: { paddingVertical: 14, paddingHorizontal: 24, backgroundColor: 'white', borderRadius: 99, ...shadows.soft },
  prevT: { color: '#7E57C2', fontWeight: '800', fontSize: 15 },
  next: { borderRadius: 99, ...shadows.soft },
  nextIn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 99 },
  nextT: { color: 'white', fontWeight: '800', fontSize: 15 },
  done: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 99 },
  doneT: { color: '#2E7D32', fontWeight: '900', fontSize: 16 },
});

const ws = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#7E57C2' },
  badge: { backgroundColor: '#F3E5F5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeTxt: { color: '#7E57C2', fontWeight: '900', fontSize: 14 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 16, alignSelf: 'flex-start' },
  wonCard: { width: '100%', padding: 16, borderRadius: radius.lg, alignItems: 'center', marginBottom: 16 },
  wonEmoji: { fontSize: 32, marginBottom: 8 },
  wonTitle: { fontSize: 18, fontWeight: '900', color: '#2E7D32' },
  gridWrap: { backgroundColor: 'white', padding: 5, borderRadius: radius.lg, ...shadows.card, marginBottom: 20 },
  gridRow: { flexDirection: 'row' },
  cell: { justifyContent: 'center', alignItems: 'center', margin: 1.5, borderRadius: 6, backgroundColor: '#F8F9FA' },
  cellSel: { backgroundColor: '#E1BEE7' },
  cellFound: { backgroundColor: '#C8E6C9' },
  cellWrong: { backgroundColor: '#FFCDD2' },
  cellTxt: { fontWeight: '800', color: '#757575' },
  cellTxtS: { color: '#6A1B9A' },
  cellTxtF: { color: '#2E7D32' },
  wordList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 24 },
  chip: { backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, ...shadows.soft },
  chipFound: { backgroundColor: '#E8F5E9' },
  chipTxt: { color: '#555', fontWeight: '700', fontSize: 13 },
  chipTxtF: { color: '#2E7D32' },
  diffRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  diffBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F5F5' },
  diffBtnOn: { backgroundColor: '#7E57C2' },
  diffTxt: { color: '#666', fontWeight: '700' },
  diffTxtOn: { color: 'white' },
  newBtn: { backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, ...shadows.soft },
  newBtnTxt: { color: '#E91E8C', fontWeight: '900' },
});

const bi = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', color: '#C2185B' },
  count: { fontSize: 16, color: '#C2185B', fontWeight: '800' },
  babyCard: { width: '100%', padding: 32, borderRadius: radius.xl, alignItems: 'center', marginBottom: 24, ...shadows.card },
  babyEmoji: { fontSize: 72, marginBottom: 16 },
  moodLabel: { fontSize: 20, fontWeight: '900', color: '#888', marginBottom: 16 },
  responseBox: { backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  responseEmoji: { fontSize: 24 },
  responseText: { fontSize: 16, fontWeight: '800', color: '#555' },
  actLabel: { fontSize: 16, fontWeight: '800', color: '#666', alignSelf: 'flex-start', marginBottom: 12 },
  actGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actWrap: { width: '31%', marginBottom: 12 },
  actBtn: { paddingVertical: 16, borderRadius: radius.lg, alignItems: 'center', ...shadows.soft },
  actBtnText: { fontWeight: '900', color: '#555', fontSize: 14 },
  badge: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, marginTop: 10 },
  badgeText: { color: '#F57F17', fontWeight: '900', fontSize: 16 },
});

const mm = StyleSheet.create({
  lsCont: { alignItems: 'center', paddingBottom: 20 },
  lsTitle: { fontSize: 24, fontWeight: '900', color: '#7E57C2', marginBottom: 6, textAlign: 'center' },
  lsSub: { fontSize: 14, color: '#999', marginBottom: 20, fontWeight: '700' },
  lsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  lsCard: { width: 70, height: 70, borderRadius: 16, overflow: 'hidden', ...shadows.soft },
  lsCardLocked: { opacity: 0.55 },
  lsCardGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lsNum: { fontSize: 22, fontWeight: '900', color: '#7E57C2' },
  lsGrid2: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', marginTop: 2 },
  playCont: { flex: 1, alignItems: 'center' },
  playHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, marginBottom: 10 },
  playBackBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  playBackT: { color: '#7E57C2', fontWeight: '800', fontSize: 15 },
  playMeta: { alignItems: 'center' },
  playLvl: { fontSize: 17, fontWeight: '900', color: '#7E57C2' },
  pauseIconBtn: { padding: 6 },
  pauseIconT: { fontSize: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12, width: '100%', justifyContent: 'center' },
  statPill: { backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', ...shadows.soft, minWidth: 80 },
  statPillLbl: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', marginBottom: 2 },
  statPillVal: { fontSize: 15, fontWeight: '900', color: '#7E57C2' },
  playGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  playCard: { margin: 3, borderRadius: 12, overflow: 'hidden' },
  playCardInner: { flex: 1 },
  playCardFace: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  playCardBack: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  cpBox: { backgroundColor: 'white', borderRadius: 28, padding: 26, alignItems: 'center', width: '100%', maxWidth: 340, ...shadows.card },
  cpConfetti: { fontSize: 22, letterSpacing: 6, marginBottom: 6 },
  cpBig: { fontSize: 56, marginBottom: 4 },
  cpTitle: { fontSize: 24, fontWeight: '900', color: '#E91E8C', marginBottom: 2, textAlign: 'center' },
  cpLevel: { fontSize: 15, fontWeight: '700', color: '#888', marginBottom: 16 },
  cpStats: { flexDirection: 'row', backgroundColor: '#F3E5F5', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, width: '100%', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20 },
  cpStat: { alignItems: 'center' },
  cpStatLbl: { fontSize: 12, fontWeight: '700', color: '#999', marginBottom: 3 },
  cpStatVal: { fontSize: 18, fontWeight: '900', color: '#7E57C2' },
  cpStatDiv: { width: 1, height: 28, backgroundColor: '#E0E0E0' },
  cpBtns: { width: '100%', gap: 10 },
  cpBtnMain: { borderRadius: 999, overflow: 'hidden', width: '100%' },
  cpBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  cpBtnMainT: { color: 'white', fontWeight: '900', fontSize: 15 },
  cpBtnSec: { backgroundColor: '#F3E5F5', paddingVertical: 13, borderRadius: 999, alignItems: 'center', width: '100%' },
  cpBtnSecT: { color: '#7E57C2', fontWeight: '800', fontSize: 14 },
  cpBtnBack: { backgroundColor: '#FCE4EC', paddingVertical: 13, borderRadius: 999, alignItems: 'center', width: '100%' },
  cpBtnBackT: { color: '#E91E8C', fontWeight: '800', fontSize: 14 },
  pauseBox: { backgroundColor: 'white', borderRadius: 24, padding: 28, alignItems: 'center', width: '80%', maxWidth: 300, ...shadows.card },
  pauseTitle: { fontSize: 22, fontWeight: '900', color: '#7E57C2', marginBottom: 20 },
  pauseBtn: { borderRadius: 999, overflow: 'hidden', width: '100%', marginBottom: 10 },
  pauseBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  pauseBtnT: { color: 'white', fontWeight: '900', fontSize: 15 },
  pauseBtnAlt: { backgroundColor: '#F5F5F5', paddingVertical: 12, borderRadius: 999, alignItems: 'center', width: '100%', marginBottom: 8 },
  pauseBtnAltT: { color: '#7E57C2', fontWeight: '800', fontSize: 14 },
});

const bm = StyleSheet.create({
  cont: { width: '100%', paddingBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#7E57C2' },
  score: { fontSize: 16, color: '#E91E8C', fontWeight: '900' },
  introCard: { padding: 24, borderRadius: radius.xl, alignItems: 'center', width: '100%', ...shadows.card },
  introTitle: { fontSize: 26, fontWeight: '900', color: '#E91E8C', marginBottom: 6 },
  introSubtitle: { fontSize: 18, fontWeight: '800', color: '#7E57C2', marginBottom: 16 },
  introDesc: { fontSize: 14, color: '#4A5568', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  startBtn: { borderRadius: 99 },
  startBtnIn: { paddingHorizontal: 36, paddingVertical: 14, borderRadius: 99 },
  startBtnT: { color: 'white', fontWeight: '900', fontSize: 16 },
  disclaimerText: { fontSize: 11, color: '#718096', textAlign: 'center', marginTop: 20, fontStyle: 'italic', lineHeight: 16 },
  faceCard: { width: '100%', padding: 18, borderRadius: radius.xl, alignItems: 'center', marginBottom: 16, ...shadows.card, backgroundColor: 'white' },
  babyImage: { width: '100%', height: 210, borderRadius: 12, marginBottom: 14 },
  faceLabel: { fontSize: 15, fontWeight: '800', color: '#2D3748', textAlign: 'center', marginBottom: 12 },
  feedbackBox: { padding: 12, borderRadius: 12, alignItems: 'center', width: '100%', marginTop: 8 },
  correctBadge: { backgroundColor: '#E8F5E9' },
  wrongBadge: { backgroundColor: '#FFEBEE' },
  resultText: { fontWeight: '900', fontSize: 14, color: '#2E7D32', textAlign: 'center' },
  explanationBox: { backgroundColor: '#F3E5F5', padding: 10, borderRadius: 8, marginTop: 8, width: '100%' },
  explanationT: { fontSize: 13, color: '#4A5568', textAlign: 'center', lineHeight: 18 },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  optBtn: { width: '48%', backgroundColor: 'white', paddingVertical: 12, paddingHorizontal: 8, borderRadius: radius.md, alignItems: 'center', marginBottom: 12, ...shadows.soft, borderWidth: 1, borderColor: '#E2E8F0' },
  optText: { fontWeight: '900', color: '#2D3748', fontSize: 13, textAlign: 'center', marginTop: 2 },
  optSubtext: { fontSize: 10, color: '#718096', textAlign: 'center', marginTop: 1 },
  btnRow: { flexDirection: 'row', gap: 16, marginTop: 10, justifyContent: 'center', width: '100%' },
  hintBtn: { backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, ...shadows.soft, borderWidth: 1, borderColor: '#E2E8F0' },
  hintBtnT: { color: '#E53935', fontWeight: '900' },
  nextBtn: { borderRadius: 24, ...shadows.soft },
  nextBtnIn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  nextBtnT: { color: 'white', fontWeight: '900' },
});

const sc = StyleSheet.create({
  cont: {},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', color: '#2E7D32' },
  pts: { fontSize: 18, fontWeight: '900', color: '#F57F17' },
  badgeCard: { padding: 20, borderRadius: radius.lg, alignItems: 'center', marginBottom: 20, ...shadows.soft },
  badgeEmoji: { fontSize: 48, marginBottom: 8 },
  badgeName: { fontSize: 20, fontWeight: '900', color: '#333', marginBottom: 12 },
  nextBadgeT: { fontSize: 12, color: '#666', fontWeight: '700', marginBottom: 6 },
  progressBg: { width: '100%', height: 8, backgroundColor: '#ddd', borderRadius: 4, marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 4 },
  progressT: { fontSize: 12, color: '#888', fontWeight: '700' },
  popup: { padding: 16, borderRadius: radius.lg, alignItems: 'center', marginBottom: 20 },
  popupEmoji: { fontSize: 32, marginBottom: 8 },
  popupT: { fontSize: 16, fontWeight: '900', color: '#F57F17' },
  taskLbl: { fontSize: 16, fontWeight: '800', color: '#666', marginBottom: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: radius.md, marginBottom: 10 },
  taskDone: { opacity: 0.8 },
  taskIcon: { fontSize: 24, marginRight: 12 },
  taskLabel2: { flex: 1, fontSize: 15, fontWeight: '700', color: '#444' },
  taskLblDone: { textDecorationLine: 'line-through', color: '#888' },
  taskPts: { fontSize: 14, fontWeight: '900', color: '#F57F17', marginRight: 12 },
  cb: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  cbDone: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  cbCheck: { color: 'white', fontWeight: '900', fontSize: 14 },
  note: { padding: 16, borderRadius: radius.lg, alignItems: 'center', marginTop: 20 },
  noteT: { fontSize: 14, fontWeight: '800', color: '#7E57C2' },
});

const bp = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#1565C0' },
  stats: { flexDirection: 'row', gap: 12 },
  scoreT: { fontWeight: '900', color: '#E91E8C' },
  livesT: { fontSize: 12, marginTop: 2 },
  timerT: { fontWeight: '900', color: '#555' },
  rule: { fontSize: 13, color: '#666', marginBottom: 20, alignSelf: 'flex-start' },
  startBtn: { borderRadius: 99 },
  startBtnIn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 99 },
  startBtnT: { color: 'white', fontWeight: '900', fontSize: 16 },
  gameOverCard: { padding: 32, borderRadius: radius.xl, alignItems: 'center', width: '100%' },
  gameOverT: { fontSize: 24, fontWeight: '900', color: '#C62828', marginBottom: 8 },
  gameOverScore: { fontSize: 32, fontWeight: '900', color: '#E91E8C', marginBottom: 20 },
  retryBtn: { backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, ...shadows.soft },
  retryBtnT: { color: '#7E57C2', fontWeight: '900' },
  area: { width: '100%', height: 320, backgroundColor: 'white', borderRadius: radius.lg, position: 'relative', overflow: 'hidden', ...shadows.inner },
  bubble: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  bubbleGrad: { flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
});

const wm = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#7E57C2' },
  score: { fontSize: 16, fontWeight: '900', color: '#F57F17' },
  hint: { fontSize: 14, color: '#666', marginBottom: 20, alignSelf: 'flex-start' },
  cols: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  col: { width: '48%', gap: 12 },
  card: { backgroundColor: 'white', paddingVertical: 16, borderRadius: radius.lg, alignItems: 'center', ...shadows.soft, borderWidth: 2, borderColor: 'transparent' },
  cardR: { backgroundColor: '#FAFAFA' },
  sel: { borderColor: '#7E57C2', backgroundColor: '#F3E5F5' },
  done2: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9', opacity: 0.6 },
  bad: { borderColor: '#E53935', backgroundColor: '#FFEBEE' },
  cardT: { fontSize: 16, fontWeight: '800', color: '#555' },
  emoji: { fontSize: 28 },
});

const wb = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#7E57C2' },
  score: { fontSize: 16, fontWeight: '900', color: '#F57F17' },
  subhint: { fontSize: 12, color: '#888', marginBottom: 20, alignSelf: 'flex-start' },
  inputBox: { width: '100%', height: 80, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  inputText: { fontSize: 32, fontWeight: '900', color: '#333', letterSpacing: 8 },
  msg: { position: 'absolute', bottom: 6, fontSize: 13, fontWeight: '800' },
  letters: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  letterBtn: { width: 48, height: 48, backgroundColor: 'white', borderRadius: 8, justifyContent: 'center', alignItems: 'center', ...shadows.soft },
  letterT: { fontSize: 24, fontWeight: '900', color: '#555' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  backBtn: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, ...shadows.soft },
  backBtnT: { fontSize: 18, fontWeight: '900', color: '#757575' },
  clearBtn: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, ...shadows.soft },
  clearBtnT: { fontSize: 18, fontWeight: '900', color: '#E53935' },
  submitBtn: { borderRadius: 12, ...shadows.soft },
  submitBtnIn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  submitBtnT: { color: 'white', fontWeight: '900', fontSize: 16 },
  hintBtn: { backgroundColor: '#FFF9C4', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 24 },
  hintBtnT: { color: '#F57F17', fontWeight: '800' },
  foundLabel: { alignSelf: 'flex-start', fontSize: 14, fontWeight: '800', color: '#666', marginBottom: 10 },
  foundList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%', marginBottom: 24 },
  foundChip: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  foundChipT: { color: '#2E7D32', fontWeight: '700' },
  newBtn: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, ...shadows.soft },
  newBtnT: { color: '#7E57C2', fontWeight: '900' },
});

const pat = StyleSheet.create({
  cont: { alignItems: 'center', width: '100%', paddingBottom: 20 },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)' },
  backText: { color: '#7E57C2', fontWeight: '800', fontSize: 15 },
  titleWrap: { alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '900', color: '#E91E8C' },
  levelBadge: { backgroundColor: '#F3E5F5', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16 },
  levelBadgeText: { color: '#7E57C2', fontWeight: '900', fontSize: 13 },
  innerWrap: { alignItems: 'center', width: '100%' },
  statusBox: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    ...shadows.soft,
  },
  statusText: { fontSize: 15, fontWeight: '800', color: '#4A5568' },
  dotsRow: { flexDirection: 'row', gap: 6, height: 10, marginBottom: 20, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
  },
  pad: {
    borderRadius: 22,
    overflow: 'hidden',
    ...shadows.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  padActive: {
    borderColor: '#FFFFFF',
    borderWidth: 3.5,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 12,
  },
  padGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  padIcon: { fontSize: 44, marginBottom: 4 },
  padName: { color: 'white', fontWeight: '900', fontSize: 13, textShadowColor: 'rgba(0,0,0,0.15)', textShadowRadius: 3 },
  centerAction: { marginTop: 4, width: '100%', alignItems: 'center' },
  startBtn: { borderRadius: 99, width: '70%', maxWidth: 280, ...shadows.soft },
  startBtnIn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 99, alignItems: 'center' },
  startBtnT: { color: 'white', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
});

const spd = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#2E7D32' },
  score: { fontSize: 16, fontWeight: '900', color: '#2E7D32' },
  sceneTitle: { fontSize: 16, fontWeight: '800', color: '#555', marginBottom: 8 },
  msg: { fontSize: 14, fontWeight: '800', marginBottom: 8, height: 20 },
  hint: { fontSize: 13, color: '#888', marginBottom: 16 },
  panels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 8, marginBottom: 24 },
  panel: { borderRadius: 12, overflow: 'hidden', position: 'relative', ...shadows.card },
  panelLabel: { position: 'absolute', top: 4, left: 8, fontSize: 10, fontWeight: '900', color: '#666', zIndex: 2 },
  sceneItem: { position: 'absolute', justifyContent: 'center', alignItems: 'center', width: 36, height: 36 },
  sceneItemFound: { backgroundColor: 'rgba(76,175,80,0.2)', borderRadius: 18 },
  foundMark: { position: 'absolute', fontSize: 24, color: '#2E7D32', fontWeight: '900', zIndex: 2, opacity: 0.7 },
  actions: { flexDirection: 'row', gap: 16 },
  hintBtn: { backgroundColor: '#FFF9C4', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, ...shadows.soft },
  hintBtnT: { color: '#F57F17', fontWeight: '900' },
  nextBtn: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, ...shadows.soft },
  nextBtnT: { color: '#7E57C2', fontWeight: '900' },
});

const so = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#8E24AA' },
  score: { fontSize: 16, fontWeight: '900', color: '#8E24AA' },
  hint: { fontSize: 14, color: '#666', marginBottom: 16 },
  seqTitle: { fontSize: 18, fontWeight: '800', color: '#555', marginBottom: 20 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: radius.lg, width: '100%', marginBottom: 10, ...shadows.soft, borderWidth: 2, borderColor: 'transparent' },
  itemSel: { borderColor: '#8E24AA', backgroundColor: '#F3E5F5' },
  itemDone: { backgroundColor: '#E8F5E9' },
  itemNum: { width: 30, fontSize: 18, fontWeight: '900', color: '#8E24AA' },
  itemT: { fontSize: 16, fontWeight: '700', color: '#333' },
});

const cm = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#F57F17' },
  score: { fontSize: 16, fontWeight: '900', color: '#F57F17' },
  hint: { fontSize: 14, color: '#666', marginBottom: 16 },
  cell: { justifyContent: 'center', alignItems: 'center' },
  wall: { backgroundColor: '#424242', borderRadius: 4 },
  player: { backgroundColor: '#FFF9C4', borderRadius: 8 },
  exit: { backgroundColor: '#E8F5E9', borderRadius: 8 },
  dpad: { alignItems: 'center', marginVertical: 20 },
  arrowRow: { flexDirection: 'row', gap: 16, marginVertical: 8 },
  arrowBtn: { width: 48, height: 48, backgroundColor: 'white', borderRadius: 24, justifyContent: 'center', alignItems: 'center', ...shadows.soft },
  arrowT: { fontSize: 20, fontWeight: '900', color: '#757575' },
  resetBtn: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, ...shadows.soft },
  resetBtnT: { color: '#E53935', fontWeight: '900' },
});

const ns = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#2E7D32' },
  score: { fontSize: 16, fontWeight: '900', color: '#2E7D32' },
  hint: { fontSize: 14, color: '#666', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  infoT: { fontSize: 15, fontWeight: '700', color: '#555' },
  area: { width: '100%', height: 300, backgroundColor: 'white', borderRadius: radius.lg, ...shadows.inner, marginBottom: 20, position: 'relative' },
  numBtn: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', ...shadows.soft, borderWidth: 2, borderColor: 'transparent' },
  numBtnDone: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
  numBtnWrong: { backgroundColor: '#FFCDD2', borderColor: '#E53935' },
  numT: { fontSize: 18, fontWeight: '900', color: '#555' },
  resetBtn: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, ...shadows.soft },
  resetBtnT: { color: '#E53935', fontWeight: '900' },
});

const rp = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#7E57C2' },
  score: { fontSize: 16, fontWeight: '900', color: '#7E57C2' },
  hint: { fontSize: 14, color: '#666', marginBottom: 16 },
  wonBanner: { width: '100%', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  wonT: { color: '#2E7D32', fontWeight: '900', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginBottom: 24 },
  tile: { backgroundColor: 'white', borderRadius: 12, justifyContent: 'center', alignItems: 'center', ...shadows.soft, borderWidth: 2, borderColor: 'transparent' },
  tileDone: { borderColor: '#C8E6C9', backgroundColor: '#F1F8E9' },
  shuffleBtn: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, ...shadows.soft },
  shuffleBtnT: { color: '#7E57C2', fontWeight: '900' },
});

const slp = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#2E7D32' },
  score: { fontSize: 16, fontWeight: '900', color: '#2E7D32' },
  hint: { fontSize: 14, color: '#666', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, backgroundColor: '#ddd', padding: 4, borderRadius: 12, marginBottom: 24 },
  tile: { backgroundColor: 'white', borderRadius: 8, justifyContent: 'center', alignItems: 'center', ...shadows.soft },
  empty: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  correct: { backgroundColor: '#E8F5E9' },
  resetBtn: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, ...shadows.soft },
  resetBtnT: { color: '#2E7D32', fontWeight: '900' },
});

const ej = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#E91E8C' },
  count: { fontSize: 14, color: '#888', fontWeight: '700' },
  hint: { fontSize: 14, color: '#666', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  emotionBtn: { width: '23%', aspectRatio: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...shadows.soft },
  emotionEmoji: { fontSize: 32, marginBottom: 4 },
  emotionLabel: { fontSize: 11, fontWeight: '800', color: '#555' },
  reflCard: { width: '100%', padding: 32, borderRadius: radius.xl, alignItems: 'center', ...shadows.card },
  reflEmoji: { fontSize: 64, marginBottom: 16 },
  reflLabel: { fontSize: 20, fontWeight: '900', color: '#333', marginBottom: 8 },
  reflText: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 24, fontStyle: 'italic' },
  saveBtn: { borderRadius: 99, width: '100%', marginBottom: 16 },
  saveBtnIn: { paddingVertical: 14, alignItems: 'center', borderRadius: 99 },
  saveBtnT: { color: 'white', fontWeight: '900', fontSize: 15 },
  cancelT: { color: '#888', fontWeight: '800' },
  journalList: { width: '100%', marginTop: 24, backgroundColor: 'white', padding: 16, borderRadius: radius.lg, ...shadows.soft },
  journalTitle: { fontSize: 16, fontWeight: '900', color: '#555', marginBottom: 12 },
  journalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  jEmoji: { fontSize: 20, marginRight: 12 },
  jLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#333' },
  jTime: { fontSize: 12, color: '#888' },
});

const mt = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#2E7D32' },
  score: { fontSize: 16, fontWeight: '900', color: '#F57F17' },
  hint: { fontSize: 14, color: '#666', marginBottom: 20 },
  patRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  patBtn: { flex: 1, backgroundColor: 'white', paddingVertical: 10, marginHorizontal: 4, borderRadius: 16, alignItems: 'center', ...shadows.soft },
  patBtnT: { fontSize: 12, fontWeight: '700', color: '#757575' },
  circle: { width: 220, height: 220, borderRadius: 110, borderWidth: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', ...shadows.card },
  circleInner: { width: 200, height: 200, borderRadius: 100, justifyContent: 'center', alignItems: 'center' },
  circleT: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  circleCount: { fontSize: 48, fontWeight: '900' },
  circleRound: { position: 'absolute', bottom: 30, fontSize: 14, fontWeight: '700', color: '#888' },
  doneCard: { marginTop: 30, padding: 16, borderRadius: 24 },
  doneT: { color: '#7E57C2', fontWeight: '900', fontSize: 16 },
});

const mb = StyleSheet.create({
  cont: { alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#7E57C2' },
  hint: { fontSize: 14, color: '#666', marginBottom: 24 },
  row: { width: '100%', marginBottom: 16 },
  rowLabel: { fontSize: 14, fontWeight: '800', color: '#555', marginBottom: 8 },
  rowItems: { flexDirection: 'row', justifyContent: 'space-between' },
  item: { width: 44, height: 44, backgroundColor: 'white', borderRadius: 22, justifyContent: 'center', alignItems: 'center', ...shadows.soft, borderWidth: 2, borderColor: 'transparent' },
  itemSel: { borderColor: '#7E57C2', backgroundColor: '#F3E5F5' },
  preview: { width: '100%', backgroundColor: 'white', padding: 20, borderRadius: radius.xl, ...shadows.card, marginBottom: 24 },
  previewLabel: { fontSize: 14, fontWeight: '900', color: '#7E57C2', marginBottom: 12 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btnRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  saveBtn: { borderRadius: 99, flex: 1 },
  saveBtnIn: { paddingVertical: 14, alignItems: 'center', borderRadius: 99 },
  saveBtnT: { color: 'white', fontWeight: '900', fontSize: 15 },
  clearBtn: { backgroundColor: 'white', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 99, ...shadows.soft },
  clearBtnT: { color: '#E53935', fontWeight: '900' },
  historyBox: { width: '100%' },
  historyTitle: { fontSize: 16, fontWeight: '900', color: '#555', marginBottom: 12 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 8, ...shadows.soft },
  historyDate: { fontSize: 12, fontWeight: '700', color: '#888' },
});


const bpp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  box: { backgroundColor: 'white', borderRadius: 28, padding: 24, alignItems: 'center', width: '100%', maxWidth: 360, ...shadows.card },
  confettiRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  confEmoji: { fontSize: 22 },
  bigEmoji: { fontSize: 56, marginVertical: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#E91E8C', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  btnGroup: { width: '100%', gap: 10 },
  btnMain: { borderRadius: 999, overflow: 'hidden', width: '100%', ...shadows.soft },
  btnMainIn: { paddingVertical: 14, alignItems: 'center' },
  btnMainT: { color: 'white', fontWeight: '900', fontSize: 15 },
  btnClose: { backgroundColor: '#F5F5F5', paddingVertical: 12, borderRadius: 999, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#E0E0E0' },
  btnCloseT: { color: '#555', fontWeight: '800', fontSize: 14 },
});

export default ActivityScreen;