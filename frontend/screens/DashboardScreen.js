import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    Image,
    Platform,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import exerciseService from '../services/exerciseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { colors, typography, spacing, radius, shadows } from '../theme';
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

const getEmbedUrl = (url) => {
    const id = getYouTubeId(url);
    return id
        ? `https://www.youtube.com/embed/${id}?rel=0&autoplay=1&modestbranding=1&playsinline=1`
        : url;
};
const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const mockUser = {
    name: 'සාරා ජොන්සන්',
    role: 'රෝගියා',
    avatar: null,
    lastVisit: '2026 පෙබරවාරි 28',
};

const mockStats = (t) => [
    { label: t('Screenings Done'), value: 12, icon: '📋', color: '#7C3AED' },
    { label: t('Risk Score'), value: '34%', icon: '📊', color: '#0EA5E9' },
    { label: t('Sessions Left'), value: 5, icon: '🕐', color: '#10B981' },
    { label: t('Mood Streak'), value: '7 ' + t('days'), icon: '🌟', color: '#F59E0B' },
];

const barChartData = (t) => ({
    labels: [t('Jan'), t('Feb'), t('Mar'), t('Apr'), t('May'), t('Jun')],
    datasets: [
        {
            data: [30, 45, 28, 60, 40, 55],
        },
    ],
});

const pieChartData = (t) => [
    { name: t('Low'), population: 35, color: '#10B981', legendFontColor: '#374151', legendFontSize: 13 },
    { name: t('Medium'), population: 40, color: '#F59E0B', legendFontColor: '#374151', legendFontSize: 13 },
    { name: t('High'), population: 15, color: '#EF4444', legendFontColor: '#374151', legendFontSize: 13 },
    { name: t('None'), population: 10, color: '#7C3AED', legendFontColor: '#374151', legendFontSize: 13 },
];

const progressData = (t) => [
    { label: t('Anxiety Level'), progress: 0.62, color: '#EF4444' },
    { label: t('Sleep Quality'), progress: 0.75, color: '#10B981' },
    { label: t('Social Support'), progress: 0.48, color: '#0EA5E9' },
    { label: t('Emotional Balance'), progress: 0.83, color: '#7C3AED' },
];

const recentActivities = (t) => [
    { id: 1, title: t('EPDS Screening Completed'), time: t('2 hours ago'), icon: '✅', color: '#10B981' },
    { id: 2, title: t('Therapy Session Scheduled'), time: t('Yesterday'), icon: '📅', color: '#0EA5E9' },
    { id: 3, title: t('Mood Log Updated'), time: t('2 days ago'), icon: '😊', color: '#F59E0B' },
    { id: 4, title: t('Doctor Note Added'), time: t('3 days ago'), icon: '📝', color: '#7C3AED' },
];

const navItems = (t) => [
    { key: 'home', label: t('Dashboard'), icon: '🏠' },
    { key: 'screening', label: t('Maternal Wellness Check'), icon: '📋' },
    { key: 'diary', label: t('My Diary'), icon: '📔' },
    { key: 'plan', label: t('My Plans'), icon: '📅' },
    { key: 'profile', label: t('Profile'), icon: '👤' },
    { key: 'settings', label: t('Settings'), icon: '⚙️' },
    { key: 'exercise', label: t('Exercise'), icon: '🏃‍♀️' },
    { key: 'care_overview', label: t('Care Overview'), icon: '⭐' },
    { key: 'baby', label: t('Baby Dev'), icon: '👶' },
];

// ─────────────────────────────────────────────
// PROGRESS BAR COMPONENT
// ─────────────────────────────────────────────
function ProgressBar({ label, progress, color, isDarkMode }) {
    const percent = Math.round(progress * 100);
    return (
        <View style={styles.progressRow}>
            <View style={styles.progressLabelRow}>
                <Text style={[styles.progressLabel, isDarkMode && { color: '#E5E7EB' }]}>{label}</Text>
                <Text style={[styles.progressPercent, { color }]}>
                    {percent}%
                </Text>
            </View>

            <View style={[styles.progressTrack, isDarkMode && { backgroundColor: '#374151' }]}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${percent}%`,
                            backgroundColor: color,
                        },
                    ]}
                />
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// STAT CARD COMPONENT
// ─────────────────────────────────────────────
function StatCard({ icon, label, value, color, isDarkMode }) {
    const { width } = useWindowDimensions();
    const cardWidth = (width - 42) / 2;
    return (
        <View style={[styles.statCard, { width: cardWidth, borderLeftColor: color }, isDarkMode && { backgroundColor: '#2D2D2D', borderColor: '#3D3D3D' }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={[styles.statLabel, isDarkMode && { color: '#9CA3AF' }]}>{label}</Text>
        </View>
    );
}

// ─────────────────────────────────────────────
// SIDEBAR COMPONENT
// ─────────────────────────────────────────────
function Sidebar({ visible, activeTab, onTabPress, onClose, onLogout }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const displayName = user?.username || 'Guest User';
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.sidebarOverlay}>
                <TouchableOpacity
                    style={styles.sidebarBackdrop}
                    onPress={onClose}
                />

                <View style={styles.sidebarContainer}>
                    {/* Sidebar Header */}
                    <View style={styles.sidebarHeader}>
                        <View style={styles.sidebarAvatar}>
                            <Text style={styles.sidebarAvatarText}>{initials}</Text>
                        </View>

                        <View style={styles.sidebarUserInfo}>
                            <Text style={styles.sidebarUserName}>
                                {displayName}
                            </Text>

                            <Text style={styles.sidebarUserRole}>
                                {user?.role && user.role !== 'Patient' ? t(user.role) : ''}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.sidebarCloseBtn}
                        >
                            <Text style={styles.sidebarCloseText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sidebarDivider} />

                    {/* Nav Items */}
                    <ScrollView style={styles.sidebarNav}>
                        {navItems(t).map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[
                                    styles.sidebarNavItem,
                                    activeTab === item.key &&
                                    styles.sidebarNavItemActive,
                                ]}
                                onPress={() => {
                                    onTabPress(item.key);
                                    onClose();
                                }}
                            >
                                <Text style={styles.sidebarNavIcon}>
                                    {item.icon}
                                </Text>

                                <Text
                                    style={[
                                        styles.sidebarNavLabel,
                                        activeTab === item.key &&
                                        styles.sidebarNavLabelActive,
                                    ]}
                                >
                                    {item.label}
                                </Text>

                                {activeTab === item.key && (
                                    <View
                                        style={
                                            styles.sidebarActiveIndicator
                                        }
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.sidebarDivider} />

                    {/* Logout */}
                    <TouchableOpacity
                        style={styles.sidebarLogout}
                        onPress={onLogout}
                    >
                        <Text style={styles.sidebarLogoutIcon}>🚪</Text>

                        <Text style={styles.sidebarLogoutText}>
                            {t('Sign Out')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// ─────────────────────────────────────────────
// BRIGHTNESS SLIDER COMPONENT
// ─────────────────────────────────────────────
function BrightnessSlider({ value, onValueChange, isDarkMode }) {
    const [sliderWidth, setSliderWidth] = useState(80);

    const handleTouch = (evt) => {
        const touchX = evt.nativeEvent.locationX;
        let newValue = touchX / sliderWidth;
        if (newValue < 0) newValue = 0;
        if (newValue > 1) newValue = 1;
        onValueChange(newValue);
    };

    return (
        <View
            style={{
                width: 80,
                height: 30,
                justifyContent: 'center',
                marginRight: 10,
            }}
            onLayout={(e) => {
                const { width } = e.nativeEvent.layout;
                if (width) setSliderWidth(width);
            }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={handleTouch}
            onResponderMove={handleTouch}
        >
            <View
                style={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                    width: '100%',
                    position: 'relative',
                }}
            >
                <View
                    style={{
                        height: '100%',
                        borderRadius: 2,
                        backgroundColor: '#7C3AED',
                        width: `${value * 100}%`,
                    }}
                />
                <View
                    style={{
                        position: 'absolute',
                        left: `${value * 100}%`,
                        top: -6,
                        marginLeft: -8,
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: '#7C3AED',
                        borderWidth: 2,
                        borderColor: '#FFFFFF',
                        elevation: 3,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.22,
                        shadowRadius: 2.22,
                    }}
                />
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// HEADER COMPONENT
// ─────────────────────────────────────────────
function Header({ onMenuPress, onNotifPress, isDarkMode, toggleTheme, brightnessLevel, setBrightnessLevel }) {
    const { t, i18n } = useTranslation();

    return (
        <View style={[styles.header, isDarkMode && { backgroundColor: '#1E1E1E', borderBottomColor: '#2D2D2D' }]}>
            <TouchableOpacity
                onPress={onMenuPress}
                style={styles.menuBtn}
            >
                <View style={[styles.menuLine, isDarkMode && { backgroundColor: '#F3F4F6' }]} />
                <View style={[styles.menuLine, { width: 20 }, isDarkMode && { backgroundColor: '#F3F4F6' }]} />
                <View style={[styles.menuLine, isDarkMode && { backgroundColor: '#F3F4F6' }]} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
                <Text style={styles.headerLogo}>🌸</Text>

                <Text style={[styles.headerTitle, isDarkMode && { color: '#FFF' }]}>
                    {t('PeriCare')}
                </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                    onPress={() =>
                        i18n.changeLanguage(
                            i18n.language === 'en' ? 'si' : 'en'
                        )
                    }
                    style={{ marginRight: 15 }}
                >
                    <Text
                        style={{
                            fontWeight: '700',
                            fontSize: 13,
                            color: isDarkMode ? '#C084FC' : '#7C3AED',
                            backgroundColor: isDarkMode ? '#3B0764' : '#EDE9FE',
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 12,
                        }}
                    >
                        {i18n.language === 'en' ? 'සිං' : 'EN'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onNotifPress}
                    style={styles.notifBtn}
                >
                    <Text style={styles.notifIcon}>🔔</Text>

                    <View style={styles.notifBadge}>
                        <Text style={styles.notifBadgeText}>3</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// FOOTER COMPONENT
// ─────────────────────────────────────────────
function Footer({ activeTab, onTabPress, isDarkMode }) {
    const { t } = useTranslation();

    const footerItems = [
        ...navItems(t).slice(0, 3), // home, screening, diary
        navItems(t).find((i) => i.key === 'exercise'),
        navItems(t).find((i) => i.key === 'baby'),
        ...navItems(t).slice(3, 5), // plan, profile
    ];

    return (
        <View style={[styles.footer, isDarkMode && { backgroundColor: '#1E1E1E', borderTopColor: '#2D2D2D' }]}>
            {footerItems.map((item) => (
                <TouchableOpacity
                    key={item.key}
                    style={styles.footerTab}
                    onPress={() => onTabPress(item.key)}
                >
                    <Text style={styles.footerTabIcon}>
                        {item.icon}
                    </Text>

                    <Text
                        style={[
                            styles.footerTabLabel,
                            activeTab === item.key &&
                            styles.footerTabLabelActive,
                            isDarkMode && { color: activeTab === item.key ? '#A855F7' : '#9CA3AF' }
                        ]}
                    >
                        {item.label}
                    </Text>

                    {activeTab === item.key && (
                        <View style={[styles.footerActiveBar, isDarkMode && { backgroundColor: '#A855F7' }]} />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD SCREEN
// ─────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState(user?.username || 'Guest User');
    const initials = displayName.slice(0, 2).toUpperCase();

    const [activeTab, setActiveTab] = useState('home');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [suggestedExercises, setSuggestedExercises] = useState([]);
    const [loadingExercises, setLoadingExercises] = useState(true);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
    const [progressStats, setProgressStats] = useState(null);
    const [lastVisit, setLastVisit] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [brightnessLevel, setBrightnessLevel] = useState(1.0);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const toggleTheme = async () => {
        const nextTheme = !isDarkMode;
        setIsDarkMode(nextTheme);
        await AsyncStorage.setItem('app_theme', nextTheme ? 'dark' : 'light');
    };

    const getBrightnessOpacity = () => {
        return (1.0 - brightnessLevel) * 0.68;
    };

    const getCurrentDayString = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const d = new Date();
        return d.toLocaleDateString(i18n.language === 'si' ? 'si-LK' : 'en-US', options);
    };

    useEffect(() => {
        const loadTheme = async () => {
            const storedTheme = await AsyncStorage.getItem('app_theme');
            if (storedTheme === 'dark') {
                setIsDarkMode(true);
            }
        };
        const loadBrightness = async () => {
            const stored = await AsyncStorage.getItem('app_brightness');
            if (stored) {
                setBrightnessLevel(parseFloat(stored));
            }
        };
        loadTheme();
        loadBrightness();
        const checkLastVisit = async () => {
            const stored = await AsyncStorage.getItem('last_visit_date');
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            if (stored) {
                setLastVisit(stored);
            } else {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setLastVisit(yesterday.toLocaleDateString(i18n.language === 'si' ? 'si-LK' : 'en-US', options));
            }
            const todayStr = new Date().toLocaleDateString(i18n.language === 'si' ? 'si-LK' : 'en-US', options);
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
            } finally {
                setLoadingExercises(false);
            }
        };

        const fetchProgress = async () => {
            try {
                const data = await exerciseService.getProgress(30);
                setProgressStats(data);
            } catch (err) {
                console.log('Failed to fetch progress stats', err);
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
        fetchProgress();
        fetchUserProfile();
    }, [user]);

    const handleLogout = () => {
        setSidebarVisible(false);

        Toast.show({
            type: 'success',
            text1: t('Signed Out'),
            text2: t('You have been signed out successfully.'),
            position: 'top',
        });

        setTimeout(() => {
            navigation.replace('Login');
        }, 1500);
    };

    const handleNotifPress = () => {
        Toast.show({
            type: 'info',
            text1: `🔔 ${t('Notifications')}`,
            text2: t('You have 3 new notifications.'),
            position: 'top',
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
        } else if (tab !== 'home') {
            Toast.show({
                type: 'info',
                text1:
                    navItems(t).find((n) => n.key === tab)?.label ||
                    tab,
                text2: t('This section is coming soon!'),
                position: 'bottom',
            });
        }
    };

    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) =>
            `rgba(124, 58, 237, ${opacity})`,
        labelColor: (opacity = 1) =>
            `rgba(55, 65, 81, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#7C3AED',
        },
        barPercentage: 0.6,
    };

    const chartConfigDark = {
        backgroundGradientFrom: '#1E1E1E',
        backgroundGradientTo: '#1E1E1E',
        decimalPlaces: 0,
        color: (opacity = 1) =>
            `rgba(168, 85, 247, ${opacity})`,
        labelColor: (opacity = 1) =>
            `rgba(243, 244, 246, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#A855F7',
        },
        barPercentage: 0.6,
    };

    return (
        <SafeAreaView style={[styles.safeArea, isDarkMode && { backgroundColor: '#121212' }]}>
            {/* ── Sidebar ── */}
            <Sidebar
                visible={sidebarVisible}
                activeTab={activeTab}
                onTabPress={handleTabPress}
                onClose={() => setSidebarVisible(false)}
                onLogout={handleLogout}
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
                        <TouchableOpacity
                            style={styles.videoModalClose}
                            onPress={() => setVideoModalVisible(false)}
                        >
                            <Text style={styles.videoModalCloseText}>✕</Text>
                        </TouchableOpacity>

                        <View style={styles.dashboardVideoWrapper}>
                            {selectedVideoUrl &&
                                (getYouTubeId(selectedVideoUrl) ? (
                                    Platform.OS === 'web' ? (
                                        <iframe
                                            src={getEmbedUrl(selectedVideoUrl)}
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                width: '100%',
                                                height: '100%',
                                            }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <WebView
                                            source={{
                                                uri: getEmbedUrl(selectedVideoUrl),
                                            }}
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
                                        source={{
                                            uri: selectedVideoUrl,
                                        }}
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

            {/* ── Header ── */}
            <Header
                onMenuPress={() => setSidebarVisible(true)}
                onNotifPress={handleNotifPress}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                brightnessLevel={brightnessLevel}
                setBrightnessLevel={setBrightnessLevel}
            />

            {/* ── Main Scrollable Content ── */}
            <ScrollView
                style={[styles.scrollView, isDarkMode && { backgroundColor: '#121212' }]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Greeting Banner */}
                <LinearGradient
                    colors={['#AA60C8', '#BD83CE', '#D69ADE', '#EABDE6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.greetingBanner}
                >
                    <View style={styles.greetingTextContainer}>
                        <Text style={styles.greetingHello}>
                            {t('Hello')},{' '}
                            {displayName.split(' ')[0]} 👋
                        </Text>

                        <Text style={styles.greetingSubtitle}>
                            {t("Here's your health overview")}
                        </Text>

                        <Text style={[styles.greetingSubtitle, { fontWeight: '700', color: '#FFF', opacity: 0.9, marginTop: 2 }]}>
                            📅 {getCurrentDayString()}
                        </Text>

                        <Text style={styles.greetingDate}>
                            {t('Last visit')}: {lastVisit}
                        </Text>
                    </View>

                    <View style={styles.greetingAvatarLarge}>
                        <Text style={styles.greetingAvatarText}>
                            {initials}
                        </Text>
                    </View>
                </LinearGradient>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, isDarkMode && { color: '#FFF' }]}>
                        {t('Overview')}
                    </Text>

                    <Text style={[styles.lastVisit, isDarkMode && { color: '#9CA3AF' }]}>
                        {t('Last visit')}: {lastVisit}
                    </Text>
                </View>

                <View style={styles.statsGrid}>
                    {mockStats(t).map((stat, i) => (
                        <StatCard key={i} {...stat} isDarkMode={isDarkMode} />
                    ))}
                </View>

                {/* ── Progress Chart ── */}
                <View style={[styles.card, isDarkMode && { backgroundColor: '#2D2D2D', borderColor: '#3D3D3D' }]}>
                    <Text style={[styles.cardTitle, isDarkMode && { color: '#FFF' }]}>
                        {t('Monthly Progress')}
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <BarChart
                            data={barChartData(t)}
                            width={Math.max(width - 64, 400)}
                            height={180}
                            yAxisLabel=""
                            chartConfig={isDarkMode ? chartConfigDark : chartConfig}
                            verticalLabelRotation={0}
                            style={styles.chart}
                            showValuesOnTopOfBars
                            fromZero
                        />
                    </ScrollView>
                </View>



                {/* ── Health Indicators ── */}
                <View style={[styles.indicatorRow, { flexDirection: width < 768 ? 'column' : 'row' }]}>
                    <View
                        style={[
                            styles.card,
                            { flex: width < 768 ? undefined : 1, marginBottom: width < 768 ? 16 : 0 },
                            isDarkMode && { backgroundColor: '#2D2D2D', borderColor: '#3D3D3D' }
                        ]}
                    >
                        <Text style={[styles.cardTitle, isDarkMode && { color: '#FFF' }]}>
                            {t('Health Scores')}
                        </Text>

                        {progressData(t).map((p, i) => (
                            <ProgressBar key={i} {...p} isDarkMode={isDarkMode} />
                        ))}
                    </View>

                    <View
                        style={[
                            styles.card,
                            {
                                flex: width < 768 ? undefined : 0.9,
                                marginBottom: 0,
                                marginLeft: width < 768 ? 0 : 12,
                            },
                            isDarkMode && { backgroundColor: '#2D2D2D', borderColor: '#3D3D3D' }
                        ]}
                    >
                        <Text style={[styles.cardTitle, isDarkMode && { color: '#FFF' }]}>
                            {t('Risk Level')}
                        </Text>

                        <PieChart
                            data={[
                                { name: t('Low'), population: 35, color: '#10B981', legendFontColor: isDarkMode ? '#E5E7EB' : '#374151', legendFontSize: 13 },
                                { name: t('Medium'), population: 40, color: '#F59E0B', legendFontColor: isDarkMode ? '#E5E7EB' : '#374151', legendFontSize: 13 },
                                { name: t('High'), population: 15, color: '#EF4444', legendFontColor: isDarkMode ? '#E5E7EB' : '#374151', legendFontSize: 13 },
                                { name: t('None'), population: 10, color: '#7C3AED', legendFontColor: isDarkMode ? '#E5E7EB' : '#374151', legendFontSize: 13 },
                            ]}
                            width={width < 768 ? width - 64 : width * 0.4}
                            height={160}
                            chartConfig={isDarkMode ? chartConfigDark : chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="10"
                            absolute
                        />
                    </View>
                </View>


                {/* ── Recent Activity ── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {t('Recent Activities')}
                    </Text>

                    <TouchableOpacity>
                        <Text style={[styles.viewAllText, isDarkMode && { color: '#C084FC' }]}>
                            {t('View All')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.activityList, isDarkMode && { backgroundColor: '#2D2D2D' }]}>
                    {recentActivities(t).map((item) => (
                        <View
                            key={item.id}
                            style={[styles.activityItem, isDarkMode && { backgroundColor: '#2D2D2D', borderBottomColor: '#3D3D3D' }]}
                        >
                            <View
                                style={[
                                    styles.activityIconBox,
                                    {
                                        backgroundColor:
                                            item.color + '22',
                                    },
                                ]}
                            >
                                <Text style={{ fontSize: 16 }}>
                                    {item.icon}
                                </Text>
                            </View>

                            <View style={styles.activityInfo}>
                                <Text style={[styles.activityTitle, isDarkMode && { color: '#FFF' }]}>
                                    {item.title}
                                </Text>

                                <Text style={[styles.activityTime, isDarkMode && { color: '#9CA3AF' }]}>
                                    {item.time}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.activityDot,
                                    {
                                        backgroundColor: item.color,
                                    },
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Quick Action Buttons */}
                <Text style={[styles.sectionTitle, isDarkMode && { color: '#FFF' }]}>
                    {t('Quick Actions')}
                </Text>

                <View style={styles.quickActions}>
                    <TouchableOpacity
                        onMouseEnter={() => setHoveredIndex(0)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={[
                            styles.quickActionBtn,
                            { width: (width - 42) / 2, backgroundColor: '#AA60C8' },
                            hoveredIndex === 0 && Platform.OS === 'web' && {
                                transform: [{ translateY: -3 }],
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.15,
                                shadowRadius: 16,
                            }
                        ]}
                        onPress={() =>
                            navigation.navigate('Diary')
                        }
                    >
                        <Text style={styles.quickActionIcon}>
                            📔
                        </Text>

                        <Text style={styles.quickActionText}>
                            {t('My Diary')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onMouseEnter={() => setHoveredIndex(1)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={[
                            styles.quickActionBtn,
                            { width: (width - 42) / 2, backgroundColor: '#BD83CE' },
                            hoveredIndex === 1 && Platform.OS === 'web' && {
                                transform: [{ translateY: -3 }],
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.15,
                                shadowRadius: 16,
                            }
                        ]}
                        onPress={() =>
                            navigation.navigate('DashboardCopy')
                        }
                    >
                        <Text style={styles.quickActionIcon}>
                            ✨
                        </Text>

                        <Text style={styles.quickActionText}>
                            {t('Recommend')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onMouseEnter={() => setHoveredIndex(2)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={[
                            styles.quickActionBtn, 
                            { width: (width - 42) / 2, backgroundColor: '#D69ADE' },
                            hoveredIndex === 2 && Platform.OS === 'web' && {
                                transform: [{ translateY: -3 }],
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.15,
                                shadowRadius: 16,
                            }
                        ]}
                        onPress={() => navigation.navigate('EPDSScreening')}
                    >
                        <Text style={styles.quickActionIcon}>📋</Text>
                        <Text style={styles.quickActionText}>{t('Maternal Wellness Check')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onMouseEnter={() => setHoveredIndex(3)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={[
                            styles.quickActionBtn,
                            { width: (width - 42) / 2, backgroundColor: '#EABDE6' },
                            hoveredIndex === 3 && Platform.OS === 'web' && {
                                transform: [{ translateY: -3 }],
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.15,
                                shadowRadius: 16,
                            }
                        ]}
                        onPress={() =>
                            Toast.show({
                                type: 'success',
                                text1: `😊 ${t('Mood')}`,
                                text2: t(
                                    'Mood log updated!'
                                ),
                                position: 'top',
                            })
                        }
                    >
                        <Text style={styles.quickActionIcon}>
                            😊
                        </Text>

                        <Text style={styles.quickActionText}>
                            {t('Log Mood')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onMouseEnter={() => setHoveredIndex(4)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={[
                            styles.quickActionBtn,
                            { width: (width - 42) / 2, backgroundColor: '#F7C6E6' },
                            hoveredIndex === 4 && Platform.OS === 'web' && {
                                transform: [{ translateY: -3 }],
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.15,
                                shadowRadius: 16,
                            }
                        ]}
                        onPress={() =>
                            navigation.navigate('Exercise')
                        }
                    >
                        <Text style={styles.quickActionIcon}>
                            🏃‍♀️
                        </Text>

                        <Text style={styles.quickActionText}>
                            {t('Postpartum Exercise')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onMouseEnter={() => setHoveredIndex(5)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={[
                            styles.quickActionBtn,
                            { width: (width - 42) / 2, backgroundColor: '#FAD5EC' },
                            hoveredIndex === 5 && Platform.OS === 'web' && {
                                transform: [{ translateY: -3 }],
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.15,
                                shadowRadius: 16,
                            }
                        ]}
                        onPress={() =>
                            navigation.navigate('Plan')
                        }
                    >
                        <Text style={styles.quickActionIcon}>
                            📅
                        </Text>

                        <Text style={styles.quickActionText}>
                            {t('My Plans')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* ── Footer ── */}
            <Footer
                activeTab={activeTab}
                onTabPress={handleTabPress}
                isDarkMode={isDarkMode}
            />

            {/* Toast */}
            <Toast />
        </SafeAreaView>
    );
}

const PURPLE = '#AA60C8';
const PURPLE_LIGHT = '#FFDFEF';
const PURPLE_BORDER = '#EABDE6';
const BG = '#FAF2FA';
const WHITE = '#FFFFFF';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: BG,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: WHITE,
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 2,
        borderBottomWidth: 1,
        borderBottomColor: '#F5D3EE',
    },

    menuBtn: {
        padding: 8,
        gap: 4,
    },
    menuLine: {
        width: 24,
        height: 2.5,
        backgroundColor: '#AA60C8',
        borderRadius: 2,
        marginVertical: 2,
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    headerLogo: {
        fontSize: 22,
    },

    headerTitle: {
        fontSize: 20,
        fontFamily: typography.headerFont,
        fontWeight: '700',
        color: PURPLE,
    },

    notifBtn: {
        padding: 8,
        position: 'relative',
    },

    notifIcon: {
        fontSize: 22,
    },

    notifBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#AA60C8',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifBadgeText: {
        color: WHITE,
        fontSize: 10,
        fontFamily: typography.subTopicFont,
        fontWeight: 'bold',
    },

    sidebarOverlay: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebarBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(44, 26, 53, 0.45)',
    },
    sidebarContainer: {
        width: 280,
        backgroundColor: WHITE,
        paddingTop: 40,
        paddingBottom: 24,
    },

    sidebarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    sidebarAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: PURPLE,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sidebarAvatarText: {
        color: WHITE,
        fontFamily: typography.topicFont,
        fontWeight: 'bold',
        fontSize: 16,
    },

    sidebarUserInfo: {
        flex: 1,
    },

    sidebarUserName: {
        fontFamily: typography.subTopicFont,
        fontWeight: '700',
        fontSize: 15,
        color: '#2C1A35',
    },

    sidebarUserRole: {
        fontSize: 12,
        fontFamily: typography.bodyFont,
        color: '#6A4D77',
    },

    sidebarCloseBtn: {
        padding: 6,
    },

    sidebarCloseText: {
        fontSize: 18,
        color: '#6A4D77',
    },
    sidebarDivider: {
        height: 1,
        backgroundColor: '#F5D3EE',
        marginVertical: 8,
    },

    sidebarNav: {
        flex: 1,
    },

    sidebarNavItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 20,
        position: 'relative',
    },

    sidebarNavItemActive: {
        backgroundColor: PURPLE_LIGHT,
    },

    sidebarNavIcon: {
        fontSize: 20,
        marginRight: 14,
    },
    sidebarNavLabel: {
        fontSize: 15,
        color: '#6A4D77',
        fontFamily: typography.bodyFont,
        fontWeight: '500',
    },
    sidebarNavLabelActive: {
        color: PURPLE,
        fontFamily: typography.subTopicFont,
        fontWeight: '700',
    },
    sidebarActiveIndicator: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: PURPLE,
    },

    sidebarLogout: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sidebarLogoutIcon: {
        fontSize: 20,
        marginRight: 14,
    },
    sidebarLogoutText: {
        fontSize: 15,
        color: '#EF4444',
        fontFamily: typography.subTopicFont,
        fontWeight: '600',
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    greetingBanner: {
        backgroundColor: PURPLE,
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },

    greetingTextContainer: {
        flex: 1,
    },

    greetingHello: {
        color: WHITE,
        fontSize: 20,
        fontFamily: typography.topicFont,
        fontWeight: '700',
        marginBottom: 4,
    },
    greetingSubtitle: {
        color: 'rgba(255,255,255,0.88)',
        fontSize: 13,
        fontFamily: typography.bodyFont,
        marginBottom: 6,
    },
    greetingDate: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontFamily: typography.bodyFont,
    },
    greetingAvatarLarge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },

    greetingAvatarText: {
        color: WHITE,
        fontSize: 24,
        fontFamily: typography.topicFont,
        fontWeight: 'bold',
    },

    sectionTitle: {
        fontSize: 17,
        fontFamily: typography.topicFont,
        fontWeight: '700',
        color: '#2C1A35',
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    lastVisit: {
        fontSize: 11,
        fontFamily: typography.bodyFont,
        color: '#6A4D77',
    },

    viewAllText: {
        fontSize: 12,
        color: PURPLE,
        fontFamily: typography.subTopicFont,
        fontWeight: '700',
    },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
        justify: 'space-between',
    },
    statCard: {
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 14,
        width: '48%',
        minWidth: 135,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: '#F5D3EE',
        elevation: 2,
    },

    statIcon: {
        fontSize: 24,
        marginBottom: 6,
    },

    statValue: {
        fontSize: 22,
        fontFamily: typography.topicFont,
        fontWeight: '700',
    },

    statLabel: {
        fontSize: 12,
        fontFamily: typography.bodyFont,
        color: '#6A4D77',
    },

    card: {
        backgroundColor: WHITE,
        borderRadius: 18,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F5D3EE',
        elevation: 2,
    },

    cardTitle: {
        fontSize: 14,
        fontFamily: typography.subTopicFont,
        fontWeight: '700',
        color: '#2C1A35',
        marginBottom: 12,
    },

    indicatorRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },

    chart: {
        borderRadius: 12,
        marginVertical: 8,
    },

    progressRow: {
        marginBottom: 16,
    },

    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 13,
        fontFamily: typography.bodyFont,
        fontWeight: '600',
        color: '#2C1A35',
    },
    progressPercent: {
        fontSize: 13,
        fontFamily: typography.subTopicFont,
        fontWeight: '700',
    },
    progressTrack: {
        height: 8,
        backgroundColor: '#FFDFEF',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },

    activityList: {
        backgroundColor: WHITE,
        borderRadius: 18,
        padding: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F5D3EE',
    },

    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FAF2FA',
    },

    activityIconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    activityInfo: {
        flex: 1,
    },

    activityTitle: {
        fontSize: 14,
        fontFamily: typography.subTopicFont,
        fontWeight: '600',
        color: '#2C1A35',
    },

    activityTime: {
        fontSize: 12,
        fontFamily: typography.bodyFont,
        color: '#9E7FA9',
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 14,
        marginBottom: 10,
    },

    quickActionBtn: {
        width: '48%',
        minWidth: 135,
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        ...Platform.select({
            web: {
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
            }
        })
    },

    quickActionIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    quickActionText: {
        color: '#000000',
        fontSize: 11,
        fontFamily: typography.subTopicFont,
        fontWeight: '700',
        textAlign: 'center',
    },

    footer: {
        flexDirection: 'row',
        backgroundColor: WHITE,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: '#F5D3EE',
    },

    footerTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
        position: 'relative',
    },
    footerTabIcon: {
        fontSize: 20,
        marginBottom: 2,
    },
    footerTabLabel: {
        fontSize: 10,
        color: '#9E7FA9',
        fontFamily: typography.bodyFont,
        fontWeight: '500',
    },
    footerTabLabelActive: {
        color: PURPLE,
        fontFamily: typography.subTopicFont,
        fontWeight: '700',
    },
    footerActiveBar: {
        position: 'absolute',
        top: -8,
        width: 32,
        height: 3,
        backgroundColor: PURPLE,
        borderRadius: 2,
    },
    exerciseGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    exerciseDashCard: {
        flex: 1,
        backgroundColor: WHITE,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F5D3EE',
        elevation: 3,
        shadowColor: '#AA60C8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    exerciseDashThumbnailContainer: {
        width: '100%',
        height: 100,
        backgroundColor: '#FFDFEF',
        position: 'relative',
    },
    exerciseDashThumbnail: {
        width: '100%',
        height: '100%',
    },
    exerciseDashIconFallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFDFEF',
    },
    playIconOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(44, 26, 53, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIcon: {
        color: WHITE,
        fontSize: 28,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    exerciseDashIcon: {
        fontSize: 32,
    },
    exerciseDashInfo: {
        padding: 10,
    },
    exerciseDashName: {
        fontSize: 13,
        fontFamily: typography.subTopicFont,
        fontWeight: '700',
        color: '#2C1A35',
    },
    exerciseDashMeta: {
        fontSize: 11,
        fontFamily: typography.bodyFont,
        color: '#6A4D77',
        marginTop: 2,
    },
    videoModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(44, 26, 53, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    videoModalContainer: {
        width: '100%',
        maxWidth: 600,
        backgroundColor: '#000',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    videoModalClose: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoModalCloseText: {
        color: WHITE,
        fontSize: 18,
        fontWeight: 'bold',
    },
    dashboardVideoWrapper: {
        width: '100%',
        aspectRatio: 16 / 9,
        height: Platform.OS === 'web' ? 337 : undefined,
        backgroundColor: '#000',
    },
    dashboardWebView: {
        flex: 1,
        backgroundColor: '#000',
    },
    dashboardVideo: {
        flex: 1,
    },
    dashboardMetricBox: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F8FAFC',
        borderLeftWidth: 4,
        borderRadius: 12,
        padding: 12,
        margin: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    dashboardMetricVal: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    dashboardMetricLabel: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    trendContainer: {
        marginTop: 14,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#7C3AED',
    },
    trendTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 2,
    },
    trendText: {
        fontSize: 12,
        color: '#475569',
        lineHeight: 16,
    },
});
