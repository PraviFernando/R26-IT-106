import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Dimensions, ActivityIndicator, Modal, Image, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { COLORS, SHADOWS } from '../constants/theme';

const { width: windowWidth } = Dimensions.get('window');

export default function CareOverviewScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedGuide, setSelectedGuide] = useState(null);
    const [guideModalVisible, setGuideModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeBannerIndex, setActiveBannerIndex] = useState(0);

    const [carouselWidth, setCarouselWidth] = useState(windowWidth - 32);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await api.get('/user/me');
            if (res.data) {
                setUser(res.data);
            }
        } catch (err) {
            Toast.show({ type: 'error', text1: t('Error'), text2: t('Failed to load profile data') });
        } finally {
            setLoading(false);
        }
    };

    const deliveryType = user?.deliveryType || 'Vaginal Birth';
    const currentWeight = user?.currentWeight || user?.birthWeight || '3.5';
    const currentLength = user?.currentLength || user?.birthLength || '50';

    // ── Resource Guides Database ────────────────────────────────────────────────
    const RESOURCE_GUIDES = {
        c_section: {
            id: 'c_section',
            titleKey: 'C-Section Post-Op Recovery Guide',
            categoryKey: 'Mother\'s Well-being',
            icon: '🏥',
            image: require('../assets/screening_system/image 9.jpg'),
            bg: COLORS.cardPink,
            border: COLORS.borderPink,
            summaryKey: 'Specialized post-op recovery guidance for C-Section births',
            articles: [
                { headingKey: 'Wound & Scar Care', textKey: 'Keep your incision clean and dry. Gently pat dry after showering. Avoid rubbing or applying unapproved ointments until approved by your midwife.' },
                { headingKey: 'Pain Control & Rest', textKey: 'Take prescribed pain relief on schedule. Support your incision with a pillow when coughing, laughing, or standing up.' },
                { headingKey: 'Lifting Restrictions', textKey: 'Do not lift anything heavier than your baby for the first 6 weeks to allow deep muscle tissue layers to heal.' },
                { headingKey: 'Emotional & Mental Wellbeing', textKey: 'C-section recovery requires physical and emotional rest. Reach out to your healthcare team if you experience unexpected sadness or anxiety.' }
            ]
        },
        vaginal_birth: {
            id: 'vaginal_birth',
            titleKey: 'Vaginal Birth Recovery & Perineal Care',
            categoryKey: 'Mother\'s Well-being',
            icon: '🌸',
            image: require('../assets/screening_system/image 6.jpg'),
            bg: COLORS.cardPink,
            border: COLORS.borderPink,
            summaryKey: 'Sitz baths, pelvic floor exercises, rest guidelines & managing physical discomfort.',
            articles: [
                { headingKey: 'Perineal Healing', textKey: 'Use warm peri bottle rinses after urination. Warm sitz baths for 10-15 minutes can ease soreness and encourage tissue healing.' },
                { headingKey: 'Pelvic Floor Exercises', textKey: 'Begin light Kegel contractions when comfortable to rebuild pelvic floor strength and support bladder control.' },
                { headingKey: 'Rest & Mobility', textKey: 'Balance short light walks to promote circulation with generous periods of lying horizontal to decrease pelvic strain.' }
            ]
        },
        breastfeeding: {
            id: 'breastfeeding',
            titleKey: 'Exclusive Breastfeeding Masterclass',
            categoryKey: 'Feeding Category',
            icon: '🤱',
            image: require('../assets/screening_system/image 10.jpg'),
            bg: COLORS.cardCyan,
            border: COLORS.borderCyan,
            summaryKey: 'Latch techniques, nursing frequency, preventing nipple soreness & boosting milk supply.',
            articles: [
                { headingKey: 'Mastering the Latch', textKey: 'Ensure baby\'s mouth covers a wide portion of the lower areola, not just the nipple tip. A deep latch prevents nipple pain.' },
                { headingKey: 'Nursing Frequency', textKey: 'Feed on demand, typically 8-12 times in 24 hours. Look for early hunger cues like lip smacking and hand-rooting rather than waiting for crying.' },
                { headingKey: 'Boosting Supply & Hydration', textKey: 'Drink plenty of water and maintain adequate calorie intake. Skin-to-skin contact naturally triggers oxytocin and prolactin release.' }
            ]
        },
        formula_feeding: {
            id: 'formula_feeding',
            titleKey: 'Formula Feeding & Bottle Safety',
            categoryKey: 'Feeding Category',
            icon: '🧪',
            image: require('../assets/screening_system/image 11.jpg'),
            bg: COLORS.cardCyan,
            border: COLORS.borderCyan,
            summaryKey: 'Water sterilization, formula ratio, bottle sanitation & paced feeding techniques.',
            articles: [
                { headingKey: 'Preparation & Water Safety', textKey: 'Boil fresh tap water and allow it to cool to no less than 70°C before mixing formula powder to ensure sterilization.' },
                { headingKey: 'Paced Bottle Feeding', textKey: 'Hold the bottle horizontally so milk flows slowly. Allow baby to control the pace and take natural breathing pauses.' },
                { headingKey: 'Sterilization Routine', textKey: 'Sterilize bottles, teats, and caps daily after washing thoroughly in warm soapy water.' }
            ]
        },
        mixed_feeding: {
            id: 'mixed_feeding',
            titleKey: 'Mixed Feeding Balance & Strategy',
            categoryKey: 'Feeding Category',
            icon: '🔄',
            image: require('../assets/screening_system/image 13.webp'),
            bg: COLORS.cardCyan,
            border: COLORS.borderCyan,
            summaryKey: 'Combining breast & bottle smoothly, nipple confusion prevention & schedule management.',
            articles: [
                { headingKey: 'Avoiding Nipple Confusion', textKey: 'Establish breastfeeding for 3-4 weeks first if possible, or use slow-flow teats designed to mimic natural breast elasticity.' },
                { headingKey: 'Maintaining Supply', textKey: 'Always offer the breast first at feeding sessions before offering a formula top-up to maintain breast stimulation.' }
            ]
        },
        baby_care: {
            id: 'baby_care',
            titleKey: 'Newborn Essential Care',
            categoryKey: 'Newborn Care',
            icon: '👶',
            image: require('../assets/screening_system/image 5.png'),
            bg: COLORS.cardGreen,
            border: COLORS.borderGreen,
            summaryKey: 'Umbilical cord care, safe sleep practices, bathing safety & newborn health monitoring.',
            articles: [
                { headingKey: 'Safe Sleep Rules', textKey: 'Always place baby on their back to sleep on a firm, flat mattress free of loose blankets, pillows, or toys.' },
                { headingKey: 'Cord Care', textKey: 'Keep the umbilical stump clean and dry until it falls off naturally (usually 7-14 days). Avoid submerging in bath water.' },
                { headingKey: 'Bathing Tips', textKey: 'Sponge baths are recommended until the umbilical cord falls off. Use mild, fragrance-free baby soap.' }
            ]
        },
        recovery: {
            id: 'recovery',
            titleKey: 'Maternal Recovery & Nutrition',
            categoryKey: 'Postpartum Health',
            icon: '💪',
            image: require('../assets/screening_system/Postpartum-Depression.jpg'),
            bg: COLORS.cardYellow,
            border: COLORS.borderYellow,
            summaryKey: 'Nutritional guidance, iron replenishment, safe exercise & postpartum healing strategies.',
            articles: [
                { headingKey: 'Postpartum Nutrition', textKey: 'Focus on nutrient-dense meals rich in protein, iron, calcium, and vitamin C to rebuild blood volume and support healing.' },
                { headingKey: 'Gradual Activity', textKey: 'Start with gentle breathing and pelvic tilting before introducing moderate walking. Listen to your body\'s energy signals.' },
                { headingKey: 'Hydration', textKey: 'Drink at least 8-10 glasses of water daily, especially if breastfeeding, to support milk production and recovery.' }
            ]
        },
        mental_health: {
            id: 'mental_health',
            titleKey: 'Mental Health & Emotional Wellness',
            categoryKey: 'Mental Wellness',
            icon: '🧠',
            image: require('../assets/screening_system/image 3.jpg'),
            bg: COLORS.cardPurple,
            border: COLORS.borderPurple,
            summaryKey: 'Recognizing baby blues, self-care practices, when to seek help & emotional support resources.',
            articles: [
                { headingKey: 'Recognizing Baby Blues', textKey: 'Mood swings, anxiety, and sadness are common in the first 2 weeks. Reach out if symptoms persist beyond 2 weeks.' },
                { headingKey: 'Self-Care Practices', textKey: 'Take short breaks for yourself. Practice deep breathing, meditation, or gentle stretching.' },
                { headingKey: 'When to Seek Help', textKey: 'If you experience persistent sadness, loss of interest, or thoughts of harming yourself or baby, contact your healthcare provider immediately.' }
            ]
        }
    };

    const categoriesList = [
        RESOURCE_GUIDES.baby_care,
        RESOURCE_GUIDES.recovery,
        RESOURCE_GUIDES.mental_health,
        RESOURCE_GUIDES.breastfeeding,
        RESOURCE_GUIDES.c_section,
        RESOURCE_GUIDES.vaginal_birth,
        RESOURCE_GUIDES.formula_feeding,
        RESOURCE_GUIDES.mixed_feeding,
    ];

    // Carousel Items (Display all categories in top swipable front banner)
    const heroBanners = [
        RESOURCE_GUIDES.baby_care,
        RESOURCE_GUIDES.recovery,
        RESOURCE_GUIDES.mental_health,
        RESOURCE_GUIDES.breastfeeding,
        RESOURCE_GUIDES.c_section,
        RESOURCE_GUIDES.vaginal_birth,
        RESOURCE_GUIDES.formula_feeding,
        RESOURCE_GUIDES.mixed_feeding,
    ];

    const filteredCategories = categoriesList.filter(item => {
        const title = t(item.titleKey).toLowerCase();
        const cat = t(item.categoryKey).toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || cat.includes(query);
    });

    const openGuide = (guide) => {
        setSelectedGuide(guide);
        setGuideModalVisible(true);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'si' : 'en';
        i18n.changeLanguage(newLang);
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, styles.centered]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>{t('Loading Care Overview...')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            {/* Top Navigation Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <View style={styles.backCircle}>
                        <Text style={styles.backIcon}>‹</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{t('Browse Categories')}</Text>

                <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn} activeOpacity={0.8}>
                    <Text style={styles.langTxt}>{i18n.language === 'en' ? 'සිං' : 'EN'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('Search categories...')}
                        placeholderTextColor={COLORS.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={styles.clearSearch}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Swipable Front Hero Banner (Displaying All Categories) ── */}
                <View style={styles.sectionHeaderWrap}>
                    <View style={styles.carouselHeaderRow}>
                        <Text style={styles.sectionHeaderTitle}>✨ {t('Featured Guidance')} ({activeBannerIndex + 1}/{heroBanners.length})</Text>
                        <Text style={styles.swipeHintTxt}>{t('Swipe ↔')}</Text>
                    </View>
                </View>

                <View
                    style={styles.carouselWrapper}
                    onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}
                >
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const slide = Math.round(e.nativeEvent.contentOffset.x / (carouselWidth || 1));
                            if (slide >= 0 && slide < heroBanners.length && slide !== activeBannerIndex) {
                                setActiveBannerIndex(slide);
                            }
                        }}
                        scrollEventThrottle={16}
                    >
                        {heroBanners.map((bannerItem) => (
                            <TouchableOpacity
                                key={bannerItem.id}
                                style={[
                                    styles.personalizedBanner,
                                    { backgroundColor: bannerItem.bg, borderColor: bannerItem.border, width: carouselWidth || (windowWidth - 32) }
                                ]}
                                onPress={() => openGuide(bannerItem)}
                                activeOpacity={0.92}
                            >
                                <Image
                                    source={bannerItem.image}
                                    style={styles.bannerImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.bannerOverlay} />
                                <View style={styles.bannerContent}>
                                    <View style={styles.badgeWrap}>
                                        <Text style={styles.badgeText}>{bannerItem.icon} {t(bannerItem.categoryKey)}</Text>
                                    </View>
                                    <Text style={styles.bannerTitle} numberOfLines={1}>
                                        {t(bannerItem.titleKey)}
                                    </Text>
                                    <Text style={styles.bannerSub} numberOfLines={2}>
                                        {t(bannerItem.summaryKey)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={styles.paginationRow}>
                        {heroBanners.map((_, idx) => (
                            <View
                                key={idx}
                                style={[styles.paginationDot, activeBannerIndex === idx && styles.paginationDotActive]}
                            />
                        ))}
                    </View>
                </View>

                {/* Child Growth Chart Banner */}
                <TouchableOpacity
                    style={[styles.growthChartBanner, { backgroundColor: COLORS.cardPurple, borderColor: COLORS.borderPurple }]}
                    onPress={() => navigation.navigate('GrowthChart')}
                    activeOpacity={0.88}
                >
                    <View style={styles.growthBannerLeft}>
                        <Text style={styles.growthBannerIcon}>📈</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.growthBannerTitle}>{t('Child Growth Chart & Percentiles')}</Text>
                            <Text style={styles.growthBannerSub}>
                                {t('Baby Measurements:')} <Text style={{ fontWeight: '700' }}>{currentWeight} kg / {currentLength} cm</Text>
                            </Text>
                        </View>
                    </View>
                    <View style={styles.growthArrowWrap}>
                        <Text style={styles.growthArrow}>›</Text>
                    </View>
                </TouchableOpacity>

                {/* Categories Grid Section */}
                <View style={styles.sectionHeaderWrap}>
                    <Text style={styles.sectionHeaderTitle}>📚 {t('All Guidance Categories')}</Text>
                    <Text style={styles.sectionHeaderSub}>{t('Tap on any category below for detailed guidance and support tailored to your needs.')}</Text>
                </View>

                {/* Responsive 2-Column Grid with Clear Uncropped Image Frames */}
                <View style={styles.gridContainer}>
                    {filteredCategories.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.gridCard, { backgroundColor: item.bg, borderColor: item.border }]}
                            onPress={() => openGuide(item)}
                            activeOpacity={0.88}
                        >
                            {/* Clear Uncropped Image Frame */}
                            <View style={styles.gridCardImgWrap}>
                                <Image
                                    source={item.image}
                                    style={styles.gridCardImg}
                                    resizeMode={item.id === 'baby_care' || item.id === 'formula_feeding' ? 'contain' : 'cover'}
                                />
                                <View style={styles.iconCircle}>
                                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                                </View>
                            </View>

                            {/* Card Details */}
                            <View style={styles.gridCardBody}>
                                <Text style={styles.gridCardTitle} numberOfLines={2}>
                                    {t(item.titleKey)}
                                </Text>
                                <View style={styles.articleBadge}>
                                    <Text style={styles.articleBadgeTxt}>{item.articles.length} {t('Articles')}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 90 }} />
            </ScrollView>

            {/* Bottom Floating Navigation Bar */}
            <View style={styles.bottomNavContainer}>
                <View style={styles.bottomNavInner}>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
                        <Text style={styles.navIcon}>🏠</Text>
                        <Text style={styles.navLabel}>{t('Dashboard')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
                        <View style={styles.navActivePill}>
                            <Text style={styles.navIconActive}>📚</Text>
                            <Text style={styles.navLabelActive}>{t('Overview')}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('EPDSScreening')}>
                        <Text style={styles.navIcon}>🌸</Text>
                        <Text style={styles.navLabel}>{t('Screening')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('GrowthChart')}>
                        <Text style={styles.navIcon}>📊</Text>
                        <Text style={styles.navLabel}>{t('Growth Chart')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Guide Detail Modal */}
            <Modal visible={guideModalVisible} transparent animationType="slide" onRequestClose={() => setGuideModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedGuide && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                        <Text style={{ fontSize: 28 }}>{selectedGuide.icon}</Text>
                                        <Text style={styles.modalTitle} numberOfLines={2}>{t(selectedGuide.titleKey)}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setGuideModalVisible(false)}>
                                        <Text style={styles.modalClose}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                                    <Text style={styles.guideSummary}>{t(selectedGuide.summaryKey)}</Text>
                                    {selectedGuide.articles.map((art, idx) => (
                                        <View key={idx} style={styles.articleBox}>
                                            <Text style={styles.articleHeading}>📌 {t(art.headingKey)}</Text>
                                            <Text style={styles.articleText}>{t(art.textKey)}</Text>
                                        </View>
                                    ))}
                                </ScrollView>

                                <TouchableOpacity style={styles.closeModalBtn} onPress={() => setGuideModalVisible(false)}>
                                    <Text style={styles.closeModalBtnTxt}>{t('Got It')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <Toast />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.background, // Light Purple Screen Background
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textMuted,
        fontSize: 15,
        fontWeight: '600',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.background,
    },
    backBtn: {
        padding: 4,
    },
    backCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        ...SHADOWS.card,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        marginTop: -3,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.textPrimary,
        letterSpacing: -0.4,
    },
    langBtn: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    langTxt: {
        fontSize: 12.5,
        fontWeight: '800',
        color: COLORS.primary,
    },

    scroll: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 11,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.15)',
        ...SHADOWS.card,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    clearSearch: {
        fontSize: 16,
        color: COLORS.textMuted,
        paddingHorizontal: 6,
    },

    sectionHeaderWrap: {
        marginBottom: 10,
        marginTop: 4,
    },
    carouselHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeaderTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    swipeHintTxt: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    sectionHeaderSub: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
        lineHeight: 18,
    },

    // ── Swipable Hero Banner Carousel ──
    carouselWrapper: {
        width: '100%',
        marginBottom: 16,
    },
    personalizedBanner: {
        height: 175,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1.5,
        position: 'relative',
        ...SHADOWS.card,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(17, 24, 39, 0.38)',
    },
    bannerContent: {
        flex: 1,
        padding: 16,
        justifyContent: 'flex-end',
    },
    badgeWrap: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    badgeText: {
        color: COLORS.textWhite,
        fontSize: 11,
        fontWeight: '800',
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textWhite,
        marginBottom: 3,
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    bannerSub: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.95)',
        lineHeight: 17,
    },

    paginationRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(124, 58, 237, 0.25)',
    },
    paginationDotActive: {
        width: 22,
        backgroundColor: COLORS.primary,
    },

    growthChartBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1.5,
        marginBottom: 18,
        ...SHADOWS.card,
    },
    growthBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    growthBannerIcon: {
        fontSize: 24,
    },
    growthBannerTitle: {
        fontSize: 14.5,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    growthBannerSub: {
        fontSize: 11.5,
        color: COLORS.textSecondary,
    },
    growthArrowWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    growthArrow: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: -2,
    },

    // ────────────────────────────────────────────────────────
    // 2-COLUMN GRID WITH FULL-WIDTH FLEX & CLEAR UNCROPPED IMAGES
    // ────────────────────────────────────────────────────────
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 16,
        width: '100%',
    },
    gridCard: {
        width: '48.5%', // 2 columns across any screen size
        height: 225,     // Generous height so titles and badges fit
        borderRadius: 20,
        borderWidth: 1.5,
        overflow: 'hidden',
        backgroundColor: COLORS.cardBg,
        elevation: 3,
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    gridCardImgWrap: {
        height: 135, // Clear image frame height
        width: '100%',
        position: 'relative',
        backgroundColor: '#FFFFFF', // Clean white background for crisp display
        overflow: 'hidden',
    },
    gridCardImg: {
        width: '100%',
        height: '100%',
        alignSelf: 'center',
    },
    iconCircle: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        ...SHADOWS.card,
    },
    gridCardBody: {
        height: 90,
        padding: 10,
        justifyContent: 'space-between',
        backgroundColor: COLORS.cardBg,
    },
    gridCardTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.textPrimary,
        height: 38,
        lineHeight: 18,
    },
    articleBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 'auto',
    },
    articleBadgeTxt: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.primary,
    },

    bottomNavContainer: {
        position: 'absolute',
        bottom: 12,
        left: 16,
        right: 16,
        alignItems: 'center',
    },
    bottomNavInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: COLORS.cardBg,
        borderRadius: 30,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.15)',
        ...SHADOWS.button,
        width: '100%',
    },
    navItem: {
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    navItemActive: {
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    navActivePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    navIcon: {
        fontSize: 18,
    },
    navLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textMuted,
        marginTop: 2,
    },
    navIconActive: {
        fontSize: 16,
    },
    navLabelActive: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.primary,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.cardBg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '85%',
        width: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    modalClose: {
        fontSize: 20,
        color: COLORS.textMuted,
        padding: 4,
    },
    guideSummary: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginBottom: 14,
        fontStyle: 'italic',
    },
    articleBox: {
        backgroundColor: COLORS.background,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    articleHeading: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    articleText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 19,
    },
    closeModalBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        marginTop: 14,
        ...SHADOWS.button,
    },
    closeModalBtnTxt: {
        color: COLORS.textWhite,
        fontSize: 15,
        fontWeight: 'bold',
    },
});