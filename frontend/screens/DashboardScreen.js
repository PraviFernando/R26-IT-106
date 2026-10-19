import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Image,
    ImageBackground,
    Platform,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import Feather from 'react-native-vector-icons/Feather';
import exerciseService from '../services/exerciseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { typography } from '../theme';

const HERO_IMAGE = require('../assets/hero-mother-baby.jpg');
const HERO_IMAGE_URI = Asset.fromModule(HERO_IMAGE).uri;

const getYouTubeId = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/embed/'))
        return url.split('embed/')[1]?.split('?')[0];
    if (url.includes('youtu.be/'))
        return url.split('youtu.be/')[1]?.split('?')[0];
    if (url.includes('youtube.com/watch')) {
        const parts = url.split('v=');
        return parts.length > 1 ? parts[1].split('&')[0] : null;
    }
    return null;
};

const getVideoThumbnail = (ex) => {
    if (ex?.thumbnailUrl) return ex.thumbnailUrl;
    const id = getYouTubeId(ex?.videoUrl);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

const Icon = ({ name, size = 18, color, style }) => (
    <Feather name={name} size={size} color={color} style={style} />
);

const getEmbedUrl = (url) => {
    const id = getYouTubeId(url);
    return id
        ? `https://www.youtube.com/embed/${id}?rel=0&autoplay=1&modestbranding=1&playsinline=1`
        : url;
};

// ─────────────────────────────────────────────
// PALETTE  (primary #AA60C8 is unchanged)
// ─────────────────────────────────────────────
const LIGHT = {
    primary: '#AA60C8',
    primaryDark: '#873CA6',
    secondary: '#D69ADE',
    accent: '#EABDE6',
    bg: '#FBF8F6',
    side: '#FDFBFA',
    card: '#FFFFFF',
    line: '#EFE4EE',
    line2: '#F2EAF1',
    lav: '#F5E6FB',
    blush: '#FFE9F1',
    blushLine: '#F4C6D7',
    blushText: '#9A3F62',
    sage: '#E7F1EA',
    sageText: '#3F6B4E',
    note: '#FFF7FA',
    noteLine: '#F6DCE8',
    text: '#2C1A35',
    muted: '#8A7392',
    nav: '#5B4763',
    sec: '#A894AE',
};

const DARK = {
    ...LIGHT,
    bg: '#16111A',
    side: '#1D1622',
    card: '#221A28',
    line: '#33283A',
    line2: '#2C2232',
    lav: '#3A2546',
    blush: '#3D2230',
    blushLine: '#5A3045',
    blushText: '#F4B6CE',
    sage: '#22322A',
    sageText: '#A9D3B5',
    note: '#2A1F2E',
    noteLine: '#3D2C42',
    text: '#F5EEF7',
    muted: '#B9A5C0',
    nav: '#D9C9DF',
    sec: '#8E7A96',
};

const SERIF = Platform.select({
    web: "Georgia, 'Times New Roman', serif",
    ios: 'Georgia',
    default: 'serif',
});

const DAILY_NOTES = [
    'You are exactly the mother your baby needs. Be as gentle with yourself as you are with them.',
    'Rest is part of recovery, not a reward for it.',
    'Small steps still count. You are doing better than you think.',
    'It is okay to ask for help. Strong mothers lean on others too.',
    'Every feeling is allowed here. Be kind to yourself today.',
    'Your baby does not need a perfect mother, just a present one.',
    'One day at a time is enough.',
];

// Sidebar groups — same destinations as before, grouped like the new design
const navSections = (t) => [
    {
        title: t('Today'),
        items: [
            { key: 'home', label: t('Overview'), icon: 'home' },
            { key: 'screening', label: t('Maternal Wellness Check'), icon: 'clipboard' },
            { key: 'care_overview', label: t('Care Overview'), icon: 'star' },
        ],
    },
    {
        title: t('Care for you'),
        items: [
            { key: 'diary', label: t('My Diary'), icon: 'book-open' },
            { key: 'relief', label: t('Relief for you'), icon: 'heart' },
            { key: 'exercise', label: t('Exercise'), icon: 'activity' },
            { key: 'chat', label: t('Support chat'), icon: 'message-circle' },
        ],
    },
    {
        title: t('Baby and life'),
        items: [
            { key: 'baby', label: t('Baby Dev'), icon: 'smile' },
            { key: 'plan', label: t('My Plans'), icon: 'calendar' },
            { key: 'profile', label: t('Profile'), icon: 'user' },
        ],
    },
];

// ─────────────────────────────────────────────
// SIDEBAR (hamburger drawer)
// ─────────────────────────────────────────────
function Sidebar({ visible, activeTab, onTabPress, onClose, onLogout, onHelp, P }) {
    const { t } = useTranslation();

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.sidebarOverlay}>
                <View style={[styles.sidebarContainer, { backgroundColor: P.side, borderRightColor: P.line }]}>
                    <View style={styles.sidebarHeader}>
                        <View style={[styles.logoCircle, { backgroundColor: P.lav }]}>
                            <Text style={styles.logoEmoji}>🌸</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.brandText, { color: P.text }]}>{t('PeriCare')}</Text>
                            <Text style={[styles.brandSub, { color: P.muted }]}>{t('Postpartum care')}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.sidebarCloseBtn} accessibilityLabel={t('Close menu')}>
                            <Icon name="x" size={20} color={P.muted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        {navSections(t).map((section) => (
                            <View key={section.title}>
                                <Text style={[styles.navSection, { color: P.sec }]}>{section.title.toUpperCase()}</Text>
                                {section.items.map((item) => {
                                    const active = activeTab === item.key;
                                    return (
                                        <TouchableOpacity
                                            key={item.key}
                                            style={[styles.navItem, active && { backgroundColor: P.lav }]}
                                            onPress={() => {
                                                onTabPress(item.key);
                                                onClose();
                                            }}
                                        >
                                            <Icon name={item.icon} size={18} color={active ? P.primaryDark : P.nav} style={styles.navIcon} />
                                            <Text style={[styles.navLabel, { color: active ? P.primaryDark : P.nav }, active && styles.navLabelActive]}>
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.helpBtn, { backgroundColor: P.blush, borderColor: P.blushLine }]}
                            onPress={() => {
                                onClose();
                                onHelp();
                            }}
                        >
                            <Icon name="life-buoy" size={18} color={P.blushText} style={styles.navIcon} />
                            <Text style={[styles.helpText, { color: P.blushText }]}>{t('Need help now?')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.navItem} onPress={onLogout}>
                            <Icon name="log-out" size={18} color={P.nav} style={styles.navIcon} />
                            <Text style={[styles.navLabel, { color: P.nav }]}>{t('Sign Out')}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
                <TouchableOpacity style={styles.sidebarBackdrop} onPress={onClose} activeOpacity={1} />
            </View>
        </Modal>
    );
}

// ─────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────
function Header({ onMenuPress, initials, P }) {
    const { t, i18n } = useTranslation();

    return (
        <View style={[styles.header, { backgroundColor: P.bg }]}>
            <View style={styles.headerLeft}>
                <TouchableOpacity
                    onPress={onMenuPress}
                    style={[styles.burger, { backgroundColor: P.card, borderColor: P.line }]}
                    accessibilityLabel={t('Open menu')}
                >
                    <View style={[styles.menuLine, { backgroundColor: P.nav }]} />
                    <View style={[styles.menuLine, { backgroundColor: P.nav }]} />
                    <View style={[styles.menuLine, { backgroundColor: P.nav }]} />
                </TouchableOpacity>
                <View style={[styles.logoCircle, styles.logoSmall, { backgroundColor: P.lav }]}>
                    <Text style={styles.logoEmojiSmall}>🌸</Text>
                </View>
                <Text style={[styles.brandText, { color: P.text }]}>{t('PeriCare')}</Text>
            </View>

            <View style={styles.headerRight}>
                <TouchableOpacity
                    onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')}
                    style={[styles.langPill, { backgroundColor: P.card, borderColor: P.line }]}
                >
                    <Text style={[styles.langText, { color: P.nav }]}>
                        {i18n.language === 'en' ? 'සිං' : 'EN'}
                    </Text>
                </TouchableOpacity>
                <View style={[styles.avatar, { backgroundColor: P.lav }]}>
                    <Text style={[styles.avatarText, { color: P.primaryDark }]}>{initials}</Text>
                </View>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// SMALL BUILDING BLOCKS
// ─────────────────────────────────────────────
function Card({ P, style, children }) {
    return <View style={[styles.card, { backgroundColor: P.card, borderColor: P.line }, style]}>{children}</View>;
}

function PickCard({ P, icon, tag, title, desc, bg, color, onPress, compact }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={[styles.pick, { borderColor: P.line, backgroundColor: P.card }, compact ? styles.pickCompact : { flex: 1 }]}
        >
            <View style={[styles.pickImg, { backgroundColor: bg, height: compact ? 70 : 100 }]}>
                <Icon name={icon} size={compact ? 24 : 30} color={color} />
            </View>
            <View style={styles.pickBody}>
                <Text style={[styles.pickTag, { color }]}>{tag}</Text>
                <Text style={[styles.pickTitle, { color: P.text }]} numberOfLines={1}>{title}</Text>
                {!compact && <Text style={[styles.mutedText, { color: P.muted }]} numberOfLines={2}>{desc}</Text>}
            </View>
        </TouchableOpacity>
    );
}

function CardTitle({ P, icon, children }) {
    return (
        <View style={styles.cardTitleRow}>
            <Icon name={icon} size={18} color={P.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: P.text }]}>{children}</Text>
        </View>
    );
}

function PillButton({ P, label, onPress, solid, icon }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.pillBtn,
                icon && styles.pillBtnRow,
                solid
                    ? { backgroundColor: P.primary }
                    : { backgroundColor: P.card, borderWidth: 1, borderColor: P.accent },
            ]}
        >
            {icon ? <Icon name={icon} size={15} color={solid ? '#FFFFFF' : P.primaryDark} style={{ marginRight: 8 }} /> : null}
            <Text style={[styles.pillBtnText, { color: solid ? '#FFFFFF' : P.primaryDark }]}>{label}</Text>
        </TouchableOpacity>
    );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD SCREEN
// ─────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const { user, logout } = useAuth();
    const [displayName, setDisplayName] = useState(user?.username || 'Guest User');
    const initials = displayName.slice(0, 2).toUpperCase();

    const [activeTab, setActiveTab] = useState('home');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [suggestedExercises, setSuggestedExercises] = useState([]);
    const [todayPlan, setTodayPlan] = useState([]);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const P = isDarkMode ? DARK : LIGHT;
    const isWide = width >= 900;
    const isSinhala = i18n.language === 'si';

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? t('Good morning') : hour < 17 ? t('Good afternoon') : t('Good evening');
    const dayString = now.toLocaleDateString(isSinhala ? 'si-LK' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const dailyNote = t(DAILY_NOTES[now.getDate() % DAILY_NOTES.length]);

    useEffect(() => {
        Font.loadAsync({ Feather: require('react-native-vector-icons/Fonts/Feather.ttf') }).catch((err) =>
            console.log('Failed to load icon font', err)
        );
    }, []);

    useEffect(() => {
        const loadTheme = async () => {
            const storedTheme = await AsyncStorage.getItem('app_theme');
            if (storedTheme === 'dark') {
                setIsDarkMode(true);
            }
        };
        loadTheme();

        const checkLastVisit = async () => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const todayStr = new Date().toLocaleDateString(isSinhala ? 'si-LK' : 'en-US', options);
            await AsyncStorage.setItem('last_visit_date', todayStr);
        };
        checkLastVisit();

        const fetchExercises = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const data = await exerciseService.getRecommendations(today);
                if (data.hasData && data.recommendations) {
                    setSuggestedExercises(data.recommendations.slice(0, 2));
                }
            } catch (err) {
                console.log('Failed to fetch suggested exercises', err);
            }
        };

        const fetchTodayPlan = async () => {
            try {
                const d = new Date();
                const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const res = await api.get(`/plan/activity/date/${date}`);
                setTodayPlan(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.log('Failed to fetch today plan', err);
            }
        };

        const fetchUserProfile = async () => {
            try {
                const res = await api.get('/user/me');
                if (res.data && res.data.username) {
                    setDisplayName(res.data.username);
                }
            } catch (err) {
                console.log('Failed to fetch user profile in dashboard', err);
            }
        };

        fetchExercises();
        fetchTodayPlan();
        fetchUserProfile();
    }, [user]);

    const handleLogout = () => {
        setSidebarVisible(false);
        if (logout) {
            logout();
        }

        Toast.show({
            type: 'success',
            text1: t('Signed Out'),
            text2: t('You have been signed out successfully.'),
            position: 'top',
        });

        setTimeout(() => {
            navigation.replace('Login');
        }, 1000);
    };

    const openRelief = () =>
        navigation.navigate('Main', { screen: 'Tabs', params: { screen: 'Recommendations' } });

    const handleHelp = () => {
        Toast.show({
            type: 'info',
            text1: t('Need help now?'),
            text2: t('📞 Sri Lanka Mental Health Helpline: 1926'),
            position: 'top',
            visibilityTime: 6000,
        });
    };

    const handleTabPress = (tab) => {
        setActiveTab(tab);
        if (tab === 'diary') {
            navigation.navigate('Diary');
        } else if (tab === 'plan') {
            navigation.navigate('Plan');
        } else if (tab === 'exercise') {
            navigation.navigate('Exercise');
        } else if (tab === 'baby') {
            navigation.navigate('BabyDevelopment');
        } else if (tab === 'screening') {
            navigation.navigate('EPDSScreening');
        } else if (tab === 'care_overview') {
            navigation.navigate('CareOverview');
        } else if (tab === 'profile') {
            navigation.navigate('Profile');
        } else if (tab === 'relief') {
            openRelief();
        } else if (tab === 'chat') {
            navigation.navigate('Chat');
        }
    };

    // "Start session" opens the exercise recommendation page
    const openExercise = () => {
        navigation.navigate('Exercise');
    };

    const picks = [
        {
            key: 'music',
            icon: 'music',
            tag: `${t('Music')} · 10 ${t('min')}`,
            title: t('Calm music'),
            desc: t('Soft sounds for quiet moments.'),
            bg: P.lav,
            color: P.primaryDark,
            onPress: () => navigation.navigate('MusicLibrary'),
        },
        {
            key: 'activities',
            icon: 'feather',
            tag: `${t('Activities')} · 15 ${t('min')}`,
            title: t('Relaxing activities'),
            desc: t('A slow, creative pause.'),
            bg: P.blush,
            color: P.blushText,
            onPress: () => navigation.navigate('Main', { screen: 'ActivitiesLibrary' }),
        },
        {
            key: 'games',
            icon: 'target',
            tag: `${t('Games')} · 5 ${t('min')}`,
            title: t('Calming games'),
            desc: t('Light play to reset your mind.'),
            bg: P.sage,
            color: P.sageText,
            onPress: () => navigation.navigate('Main', { screen: 'GamesLibrary' }),
        },
    ];

    const planItems = todayPlan.slice(0, 3);
    const planDone = todayPlan.filter((r) => r.completed).length;
    const exercise = suggestedExercises[0];

    // ── Sections ──
    const hero = (
        <View style={[styles.hero, { backgroundColor: P.lav, flexDirection: isWide ? 'row' : 'column-reverse' }]}>
            <View style={[styles.heroText, isWide ? { flex: 1.2, minWidth: 0, padding: 36 } : { padding: 20 }]}>
                <Text style={[styles.mutedText, { color: P.muted }]}>{dayString}</Text>
                <Text style={[styles.heroTitle, { color: P.text, fontSize: isWide ? 34 : 24 }]}>
                    {greeting}, {displayName.split(' ')[0]}
                </Text>
                <Text style={[styles.heroSub, { color: P.muted }]}>
                    {t('Your wellbeing matters, one day at a time.')}
                </Text>
                <View style={{ flexDirection: 'row' }}>
                    <PillButton P={P} solid icon="edit-2" label={t('Write in my diary')} onPress={() => navigation.navigate('Diary')} />
                </View>
            </View>
            <View style={isWide ? styles.heroImageWide : styles.heroImageMobile}>
                {Platform.OS === 'web' ? (
                    <img
                        src={HERO_IMAGE_URI}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '38% 35%', display: 'block' }}
                    />
                ) : (
                    <Image source={HERO_IMAGE} resizeMode="cover" style={StyleSheet.absoluteFill} />
                )}
            </View>
        </View>
    );

    const picked = (
        <Card P={P} style={isWide ? { flex: 2 } : null}>
            <View style={styles.rowBetween}>
                <View>
                    <Text style={[styles.cardTitle, { color: P.text }]}>{t('Picked for you')}</Text>
                    <Text style={[styles.mutedText, { color: P.muted }]}>{t('Based on your recent diary')}</Text>
                </View>
                <TouchableOpacity onPress={openRelief}>
                    <Text style={[styles.linkText, { color: P.primaryDark }]}>{t('See all')} →</Text>
                </TouchableOpacity>
            </View>
            {isWide ? (
                <View style={styles.picksRow}>
                    {picks.map(({ key, ...p }) => <PickCard key={key} P={P} {...p} />)}
                </View>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.picksScroll}>
                    {picks.map(({ key, ...p }) => <PickCard key={key} P={P} compact {...p} />)}
                </ScrollView>
            )}
        </Card>
    );

    const note = (
        <Card P={P} style={{ backgroundColor: P.note, borderColor: P.noteLine }}>
            <Text style={[styles.quoteMark, { color: P.secondary }]}>❝</Text>
            <Text style={[styles.noteText, { color: P.text, fontSize: isWide ? 19 : 17 }]}>{dailyNote}</Text>
            <Text style={[styles.mutedText, { color: P.muted, marginTop: 10 }]}>{t('A note for you today')}</Text>
        </Card>
    );

    const checkIn = (
        <Card P={P}>
            <CardTitle P={P} icon="clipboard">{t('Monthly check-in')}</CardTitle>
            <Text style={[styles.mutedText, { color: P.muted, marginVertical: 8 }]}>
                {t("10 short questions, whenever you're ready.")}
            </Text>
            <View style={{ flexDirection: 'row' }}>
                <PillButton P={P} label={t('Start check-in')} onPress={() => navigation.navigate('EPDSScreening')} />
            </View>
        </Card>
    );

    const plan = (
        <Card P={P} style={isWide ? { flex: 1 } : null}>
            <View style={[styles.rowBetween, { marginBottom: 4 }]}>
                <CardTitle P={P} icon="calendar">{t("Today's plan")}</CardTitle>
                <TouchableOpacity onPress={() => navigation.navigate('Plan')}>
                    <Text style={[styles.linkText, { color: P.primaryDark }]}>
                        {todayPlan.length ? `${planDone} / ${todayPlan.length}` : t('Manage')}
                    </Text>
                </TouchableOpacity>
            </View>
            {planItems.length === 0 ? (
                <TouchableOpacity onPress={() => navigation.navigate('Plan')} style={styles.planRow}>
                    <Text style={[styles.mutedText, { color: P.muted }]}>
                        {t('Nothing planned yet. Add one gentle thing for today.')}
                    </Text>
                </TouchableOpacity>
            ) : (
                planItems.map((r, i) => (
                    <View
                        key={r._id || `${r.activityId}-${i}`}
                        style={[styles.planRow, i < planItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: P.line2 }]}
                    >
                        <Icon name={r.completed ? 'check-circle' : 'circle'} size={16} color={r.completed ? P.primary : P.secondary} style={{ marginRight: 10 }} />
                        <Text
                            style={[
                                styles.planText,
                                { color: r.completed ? P.muted : P.text },
                                r.completed && { textDecorationLine: 'line-through' },
                            ]}
                            numberOfLines={1}
                        >
                            {r.activityName || t('Activity')}
                        </Text>
                        <Text style={[styles.mutedText, { color: P.muted }]}>
                            {r.scheduledTime || (r.timeOfDay ? t(r.timeOfDay) : '')}
                        </Text>
                    </View>
                ))
            )}
        </Card>
    );

    const recovery = (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={openExercise}
            style={[
                styles.card,
                styles.recovery,
                { backgroundColor: P.card, borderColor: P.line, flexDirection: isWide ? 'row' : 'column' },
                isWide && { flex: 1 },
            ]}
        >
            <View style={[styles.recoveryMedia, { backgroundColor: P.sage }, isWide ? { width: 260, minHeight: 146 } : { width: '100%', aspectRatio: 16 / 9 }]}>
                {getVideoThumbnail(exercise) ? (
                    <Image source={{ uri: getVideoThumbnail(exercise) }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : null}
                <View style={styles.playBadge}>
                    <Icon name="play" size={20} color={P.primaryDark} style={{ marginLeft: 3 }} />
                </View>
            </View>
            <View style={{ padding: 18, flex: 1 }}>
                <Text style={[styles.cardTitle, { color: P.text }]}>{t('Recovery exercise')}</Text>
                <Text style={[styles.mutedText, { color: P.muted, marginVertical: 6 }]} numberOfLines={2}>
                    {exercise
                        ? `${exercise.customName || t('Postpartum Exercise')}${exercise.duration ? ` · ${exercise.duration}` : ''}`
                        : t('Gentle postnatal movement picked for you')}
                </Text>
                <Text style={[styles.linkText, { color: P.primaryDark }]}>{t('Start session')} →</Text>
            </View>
        </TouchableOpacity>
    );

    const diary = (
        <Card P={P} style={[styles.rowBetween, { backgroundColor: P.side }]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
                <CardTitle P={P} icon="book-open">{t('My Diary')}</CardTitle>
                <Text style={[styles.mutedText, { color: P.muted, marginTop: 4 }]}>
                    {t('Your entries stay private. Write in Sinhala or English.')}
                </Text>
            </View>
            <PillButton P={P} label={t('Write an entry')} onPress={() => navigation.navigate('Diary')} />
        </Card>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: P.bg }]}>
            <Sidebar
                visible={sidebarVisible}
                activeTab={activeTab}
                onTabPress={handleTabPress}
                onClose={() => setSidebarVisible(false)}
                onLogout={handleLogout}
                onHelp={handleHelp}
                P={P}
            />

            {/* ── Video Player Modal ── */}
            <Modal
                visible={videoModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setVideoModalVisible(false)}
            >
                <View style={styles.videoModalOverlay}>
                    <View style={styles.videoModalContainer}>
                        <TouchableOpacity style={styles.videoModalClose} onPress={() => setVideoModalVisible(false)}>
                            <Text style={styles.videoModalCloseText}>✕</Text>
                        </TouchableOpacity>

                        <View style={styles.dashboardVideoWrapper}>
                            {selectedVideoUrl &&
                                (getYouTubeId(selectedVideoUrl) ? (
                                    Platform.OS === 'web' ? (
                                        <iframe
                                            src={getEmbedUrl(selectedVideoUrl)}
                                            style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <WebView
                                            source={{ uri: getEmbedUrl(selectedVideoUrl) }}
                                            style={styles.dashboardWebView}
                                            allowsFullscreenVideo={true}
                                            allowsInlineMediaPlayback={true}
                                            mediaPlaybackRequiresUserAction={false}
                                            javaScriptEnabled={true}
                                            domStorageEnabled={true}
                                            startInLoadingState={true}
                                        />
                                    )
                                ) : (
                                    <Video
                                        source={{ uri: selectedVideoUrl }}
                                        style={styles.dashboardVideo}
                                        useNativeControls
                                        resizeMode={ResizeMode.CONTAIN}
                                        shouldPlay
                                    />
                                ))}
                        </View>
                    </View>
                </View>
            </Modal>

            <Header onMenuPress={() => setSidebarVisible(true)} initials={initials} P={P} />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
                showsVerticalScrollIndicator={false}
            >
                {hero}

                {isWide ? (
                    <>
                        <View style={styles.row}>
                            {picked}
                            <View style={[styles.col, { flex: 1 }]}>
                                {note}
                                {checkIn}
                            </View>
                        </View>
                        <View style={styles.row}>
                            {plan}
                            {recovery}
                        </View>
                    </>
                ) : (
                    <>
                        {note}
                        {picked}
                        {plan}
                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.tile, { backgroundColor: P.sage }]} onPress={openExercise}>
                                <Icon name="activity" size={22} color={P.sageText} style={styles.tileIcon} />
                                <Text style={[styles.tileTitle, { color: P.text }]}>{t('Exercise')}</Text>
                                <Text style={[styles.mutedText, { color: P.muted }]} numberOfLines={1}>
                                    {exercise?.duration || t('Gentle movement')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.tile, { backgroundColor: P.lav }]} onPress={() => navigation.navigate('EPDSScreening')}>
                                <Icon name="clipboard" size={22} color={P.primaryDark} style={styles.tileIcon} />
                                <Text style={[styles.tileTitle, { color: P.text }]}>{t('Check-in')}</Text>
                                <Text style={[styles.mutedText, { color: P.muted }]}>{t('When ready')}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {diary}

                <Text style={[styles.footNote, { color: P.muted }]}>
                    {t('PeriCare offers support, not diagnosis. Your doctor is always the right person for medical questions.')}
                </Text>
            </ScrollView>

            {/* ── Mobile bottom bar ── */}
            {!isWide && (
                <View style={[styles.tabBar, { backgroundColor: P.card, borderColor: P.line }]}>
                    {[
                        { key: 'home', icon: 'home', label: t('Home') },
                        { key: 'screening', icon: 'clipboard', label: t('MaternalCare') },
                        { key: 'diary', icon: 'book-open', label: t('My Diary'), center: true },
                        { key: 'relief', icon: 'heart', label: t('Relief') },

                        { key: 'baby', icon: 'smile', label: t('Baby') },
                        { key: 'chat', icon: 'message-circle', label: t('Chat') },
                    ].map((item) =>
                        item.center ? (
                            <TouchableOpacity
                                key={item.key}
                                onPress={() => handleTabPress(item.key)}
                                style={[styles.fab, { backgroundColor: P.primary }]}
                                accessibilityLabel={item.label}
                            >
                                <Icon name={item.icon} size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity key={item.key} onPress={() => handleTabPress(item.key)} style={styles.tabItem}>
                                <Icon name={item.icon} size={20} color={activeTab === item.key ? P.primary : P.sec} />
                                <Text style={[styles.tabLabel, { color: activeTab === item.key ? P.primaryDark : P.muted }]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            )}

            <Toast />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    burger: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLine: {
        width: 18,
        height: 2,
        borderRadius: 2,
        marginVertical: 2,
    },
    logoCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    logoSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 0,
    },
    logoEmoji: {
        fontSize: 22,
    },
    logoEmojiSmall: {
        fontSize: 17,
    },
    brandText: {
        fontFamily: SERIF,
        fontSize: 20,
    },
    brandSub: {
        fontFamily: typography.bodyFont,
        fontSize: 12,
    },
    langPill: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    langText: {
        fontFamily: typography.mediumFont,
        fontSize: 13,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: typography.subTopicFont,
        fontSize: 13,
    },

    // Sidebar
    sidebarOverlay: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebarBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(44, 26, 53, 0.28)',
    },
    sidebarContainer: {
        width: 280,
        borderRightWidth: 1,
        paddingTop: 28,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    sidebarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sidebarCloseBtn: {
        padding: 6,
    },
    sidebarCloseText: {
        fontSize: 18,
    },
    navSection: {
        fontFamily: typography.bodyFont,
        fontSize: 12,
        letterSpacing: 0.8,
        paddingTop: 18,
        paddingBottom: 6,
        paddingHorizontal: 12,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    navIcon: {
        fontSize: 16,
        width: 28,
    },
    navLabel: {
        fontFamily: typography.bodyFont,
        fontSize: 15,
    },
    navLabelActive: {
        fontFamily: typography.subTopicFont,
    },
    helpBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginTop: 24,
        marginBottom: 8,
    },
    helpText: {
        fontFamily: typography.mediumFont,
        fontSize: 15,
    },

    // Layout
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
        gap: 16,
    },
    scrollContentWide: {
        paddingHorizontal: 36,
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        gap: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    col: {
        gap: 16,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    // Hero
    hero: {
        borderRadius: 28,
        overflow: 'hidden',
    },
    // Photo is 1280×1024 (5:4); matching its ratio shows the whole picture
    heroImageWide: {
        flex: 1,
        minWidth: 0,
        minHeight: 260,
        overflow: 'hidden',
    },
    heroImageMobile: {
        width: '100%',
        height: 180,
        overflow: 'hidden',
    },
    heroText: {
        justifyContent: 'center',
        gap: 6,
    },
    heroTitle: {
        fontFamily: SERIF,
        lineHeight: undefined,
    },
    heroSub: {
        fontFamily: typography.bodyFont,
        fontSize: 15,
        marginBottom: 10,
    },

    // Cards
    card: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 18,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pillBtnRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        fontFamily: typography.subTopicFont,
        fontSize: 16,
    },
    mutedText: {
        fontFamily: typography.bodyFont,
        fontSize: 13,
        lineHeight: 19,
    },
    linkText: {
        fontFamily: typography.mediumFont,
        fontSize: 14,
    },
    pillBtn: {
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    pillBtnText: {
        fontFamily: typography.mediumFont,
        fontSize: 14,
    },

    // Picked for you
    picksRow: {
        flexDirection: 'row',
        gap: 14,
        marginTop: 16,
    },
    picksScroll: {
        gap: 10,
        paddingTop: 14,
    },
    pick: {
        borderWidth: 1,
        borderRadius: 18,
        overflow: 'hidden',
    },
    pickCompact: {
        width: 140,
    },
    pickImg: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickIcon: {
        fontSize: 28,
    },
    pickBody: {
        padding: 12,
        gap: 3,
    },
    pickTag: {
        fontFamily: typography.bodyFont,
        fontSize: 12,
    },
    pickTitle: {
        fontFamily: typography.subTopicFont,
        fontSize: 15,
    },

    // Note
    quoteMark: {
        fontSize: 26,
        lineHeight: 28,
    },
    noteText: {
        fontFamily: SERIF,
        lineHeight: 28,
        marginTop: 4,
    },

    // Plan
    planRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 11,
    },
    planText: {
        fontFamily: typography.bodyFont,
        fontSize: 14,
        flex: 1,
        paddingRight: 8,
    },

    // Recovery
    recovery: {
        padding: 0,
        overflow: 'hidden',
    },
    recoveryMedia: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    playBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIcon: {
        fontSize: 18,
        marginLeft: 3,
    },

    // Mobile tiles
    tile: {
        flex: 1,
        borderRadius: 20,
        padding: 16,
        gap: 2,
    },
    tileIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    tileTitle: {
        fontFamily: typography.subTopicFont,
        fontSize: 15,
    },

    footNote: {
        fontFamily: typography.bodyFont,
        fontSize: 12,
        lineHeight: 18,
    },

    // Mobile bottom bar
    tabBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
    },
    tabItem: {
        alignItems: 'center',
        minWidth: 48,
    },
    tabIcon: {
        fontSize: 20,
    },
    tabLabel: {
        fontFamily: typography.bodyFont,
        fontSize: 11,
        marginTop: 2,
    },
    fab: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabIcon: {
        fontSize: 22,
    },

    // Video modal (unchanged behaviour)
    videoModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    videoModalContainer: {
        width: '100%',
        maxWidth: 800,
        backgroundColor: '#000',
        borderRadius: 16,
        overflow: 'hidden',
    },
    videoModalClose: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoModalCloseText: {
        color: '#FFF',
        fontSize: 18,
    },
    dashboardVideoWrapper: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
    },
    dashboardWebView: {
        flex: 1,
    },
    dashboardVideo: {
        width: '100%',
        height: '100%',
    },
});
