import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Modal,
    FlatList,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { SRI_LANKA_DISTRICTS, SRI_LANKA_VILLAGES_BY_DISTRICT } from '../data/sriLankaLocationData';

// Lazy-load expo-image-picker so it doesn't crash if not installed
let ImagePicker = null;
try { ImagePicker = require('expo-image-picker'); } catch (_) {}

// ─── Dropdown Component ───────────────────────────────────────────────────────
function Dropdown({ label, placeholder, value, options, onSelect, disabled }) {
    const [open, setOpen] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        if (disabled) return;
        Animated.timing(rotateAnim, { toValue: open ? 0 : 1, duration: 200, useNativeDriver: true }).start();
        setOpen(prev => !prev);
    };
    const close = () => {
        Animated.timing(rotateAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
        setOpen(false);
    };
    const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

    return (
        <View style={dd.wrapper}>
            <Text style={dd.label}>{label}</Text>
            <TouchableOpacity
                style={[dd.trigger, disabled && dd.triggerDisabled, value && dd.triggerSelected]}
                onPress={toggle}
                activeOpacity={0.8}
            >
                <Text style={[dd.triggerText, !value && dd.placeholder]} numberOfLines={1}>
                    {value || placeholder}
                </Text>
                <Animated.Text style={[dd.arrow, { transform: [{ rotate }] }]}>▼</Animated.Text>
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
                <TouchableOpacity style={dd.backdrop} onPress={close} activeOpacity={1}>
                    <View style={dd.sheet}>
                        <View style={dd.sheetHeader}>
                            <Text style={dd.sheetTitle}>{label}</Text>
                            <TouchableOpacity onPress={close} style={dd.sheetCloseBtn}>
                                <Text style={dd.sheetCloseIcon}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[dd.option, item === value && dd.optionSelected]}
                                    onPress={() => { onSelect(item); close(); }}
                                >
                                    <Text style={[dd.optionText, item === value && dd.optionTextSelected]}>{item}</Text>
                                    {item === value && <Text style={dd.optionCheck}>✓</Text>}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SignupScreen({ navigation }) {
    const { t, i18n } = useTranslation();

    // Credentials
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile extras
    const [age, setAge] = useState('');
    const [district, setDistrict] = useState('');
    const [village, setVillage] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const villages = district ? (SRI_LANKA_VILLAGES_BY_DISTRICT[district] || []) : [];

    // ─── Image picker ──────────────────────────────────────────────────────────
    const handlePickImage = async () => {
        if (!ImagePicker) {
            Toast.show({ type: 'info', text1: 'Not available', text2: 'Install expo-image-picker to use this feature.', position: 'top' });
            return;
        }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({ type: 'error', text1: 'Permission denied', text2: 'Allow photo access to pick an image.', position: 'top' });
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets?.length > 0) {
            setProfileImage(result.assets[0].uri);
        }
    };

    // ─── Submit ────────────────────────────────────────────────────────────────
    const handleSignup = async () => {
        if (!username.trim() || !email.trim() || !password || !confirmPassword) {
            Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill in all required fields.', position: 'top' });
            return;
        }
        if (password !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Password Mismatch', text2: 'Passwords do not match. Please try again.', position: 'top' });
            return;
        }
        if (password.length < 6) {
            Toast.show({ type: 'error', text1: 'Weak Password', text2: 'Password must be at least 6 characters.', position: 'top' });
            return;
        }
        if (age && (isNaN(Number(age)) || Number(age) < 10 || Number(age) > 100)) {
            Toast.show({ type: 'error', text1: 'Invalid Age', text2: 'Please enter a valid age between 10 and 100.', position: 'top' });
            return;
        }

        setLoading(true);
        try {
            // Try multipart if image selected, else JSON
            if (profileImage) {
                const formData = new FormData();
                formData.append('username', username.trim());
                formData.append('email', email.trim());
                formData.append('password', password);
                if (age) formData.append('age', age);
                if (district) formData.append('district', district);
                if (village) formData.append('village', village);
                const filename = profileImage.split('/').pop();
                const ext = filename.split('.').pop() || 'jpeg';
                formData.append('profileImage', { uri: profileImage, name: filename, type: `image/${ext}` });
                await api.post('/user/signup', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/user/signup', {
                    username: username.trim(),
                    email: email.trim(),
                    password,
                    age: age ? Number(age) : undefined,
                    district: district || undefined,
                    village: village || undefined,
                });
            }

            Toast.show({
                type: 'success',
                text1: '🎉 Account Created!',
                text2: 'Your account has been registered. Please sign in.',
                position: 'top',
                visibilityTime: 2500,
            });
            setTimeout(() => navigation.navigate('Login'), 2000);
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Signup failed. Please try again.';
            Toast.show({ type: 'error', text1: '❌ Registration Failed', text2: message, position: 'top' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Lang Toggle */}
                    <View style={styles.langRow}>
                        <TouchableOpacity
                            onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')}
                            style={styles.langToggle}
                        >
                            <Text style={styles.langToggleTxt}>{i18n.language === 'en' ? 'සිං' : 'EN'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Banner */}
                    <View style={styles.topBanner}>
                        <Text style={styles.bannerEmoji}>🌸</Text>
                        <Text style={styles.bannerTitle}>{t('PeriCare')}</Text>
                        <Text style={styles.bannerSubtitle}>{t('Create a new account')}</Text>
                    </View>

                    {/* ── Profile Photo Picker ── */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper} activeOpacity={0.85}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarEmoji}>📷</Text>
                                    <Text style={styles.avatarAddText}>Add Photo</Text>
                                    <Text style={styles.avatarOptText}>Optional</Text>
                                </View>
                            )}
                            <View style={styles.avatarBadge}>
                                <Text style={{ fontSize: 13 }}>📸</Text>
                            </View>
                        </TouchableOpacity>
                        {profileImage && (
                            <TouchableOpacity onPress={() => setProfileImage(null)} style={styles.removeBtn}>
                                <Text style={styles.removeBtnTxt}>✕ Remove photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── Form Card ── */}
                    <View style={styles.card}>
                        <Text style={styles.title}>{t('Create Account')}</Text>
                        <Text style={styles.subtitle}>{t('Join PeriCare today')}</Text>

                        {/* Section: Account */}
                        <View style={styles.sectionRow}>
                            <View style={[styles.sectionDot, { backgroundColor: PURPLE }]} />
                            <Text style={styles.sectionLabel}>Account Information</Text>
                        </View>

                        {/* Username */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>👤 {t('Username')} <Text style={styles.req}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your username"
                                placeholderTextColor="#9CA3AF"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>📧 {t('Email')} <Text style={styles.req}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>🔒 {t('Password')} <Text style={styles.req}>*</Text></Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                    <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>🔒 {t('Password')} (Confirm) <Text style={styles.req}>*</Text></Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                                    placeholder="Re-enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                                    <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.hint}>💡 Password must be at least 6 characters</Text>

                        {/* Section: Personal Details */}
                        <View style={styles.sectionRow}>
                            <View style={[styles.sectionDot, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.sectionLabel}>
                                Personal Details{'  '}
                                <Text style={styles.optLabel}>(Optional)</Text>
                            </Text>
                        </View>

                        {/* Age */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>🎂 Age</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your age (e.g. 28)"
                                placeholderTextColor="#9CA3AF"
                                value={age}
                                onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ''))}
                                keyboardType="numeric"
                                maxLength={3}
                            />
                        </View>

                        {/* District */}
                        <Dropdown
                            label="📍 District (Sri Lanka)"
                            placeholder="Select your district"
                            value={district}
                            options={SRI_LANKA_DISTRICTS}
                            onSelect={(d) => { setDistrict(d); setVillage(''); }}
                        />

                        {/* Village */}
                        <Dropdown
                            label="🏘️ Village / Town"
                            placeholder={district ? 'Select your village or town' : 'Select a district first'}
                            value={village}
                            options={villages}
                            onSelect={setVillage}
                            disabled={!district}
                        />

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>{t('Create Account')}</Text>
                                    <Text style={styles.buttonSub}>Join PeriCare today 🌸</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Login link */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('Already have an account?')} </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.link}>{t('Sign In')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
            <Toast />
        </SafeAreaView>
    );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#EDE9FE';

// ─── Main Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },

    langRow: { alignItems: 'flex-end', marginBottom: 8 },
    langToggle: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: PURPLE_LIGHT, borderRadius: 20 },
    langToggleTxt: { fontWeight: '700', color: PURPLE, fontSize: 14 },

    topBanner: { alignItems: 'center', marginBottom: 20 },
    bannerEmoji: { fontSize: 46, marginBottom: 6 },
    bannerTitle: { fontSize: 26, fontWeight: '800', color: PURPLE, letterSpacing: 1 },
    bannerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, textAlign: 'center' },

    // Avatar
    avatarSection: { alignItems: 'center', marginBottom: 22 },
    avatarWrapper: { width: 110, height: 110, borderRadius: 55, position: 'relative' },
    avatarImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: PURPLE },
    avatarPlaceholder: {
        width: 110, height: 110, borderRadius: 55,
        backgroundColor: PURPLE_LIGHT, borderWidth: 2.5, borderColor: PURPLE,
        borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
    },
    avatarEmoji: { fontSize: 28, marginBottom: 4 },
    avatarAddText: { fontSize: 12, fontWeight: '700', color: PURPLE },
    avatarOptText: { fontSize: 10, color: '#9CA3AF' },
    avatarBadge: {
        position: 'absolute', bottom: 2, right: 2,
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#fff',
    },
    removeBtn: { marginTop: 8 },
    removeBtnTxt: { fontSize: 12, color: '#EF4444', fontWeight: '600' },

    // Card
    card: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24,
        elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1, shadowRadius: 10,
    },
    title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
    subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 20 },

    // Section dividers
    sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: 6 },
    sectionDot: { width: 10, height: 10, borderRadius: 5 },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
    optLabel: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },

    // Inputs
    inputContainer: { marginBottom: 14 },
    label: { fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: '600' },
    req: { color: '#EF4444' },
    input: {
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
        padding: 13, fontSize: 15, backgroundColor: '#F9FAFB', color: '#111827',
    },
    passwordRow: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
        backgroundColor: '#F9FAFB', overflow: 'hidden',
    },
    eyeBtn: { paddingHorizontal: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
    eyeIcon: { fontSize: 18 },
    hint: { fontSize: 12, color: '#9CA3AF', marginBottom: 18, marginTop: -4 },

    // Button
    button: {
        backgroundColor: PURPLE, padding: 16, borderRadius: 14,
        alignItems: 'center', marginTop: 8,
        elevation: 4, shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
    buttonSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 3 },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { color: '#6B7280', fontSize: 14 },
    link: { color: PURPLE, fontSize: 14, fontWeight: '700' },
});

// ─── Dropdown Styles ──────────────────────────────────────────────────────────
const dd = StyleSheet.create({
    wrapper: { marginBottom: 14 },
    label: { fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: '600' },
    trigger: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
        padding: 13, backgroundColor: '#F9FAFB',
    },
    triggerDisabled: { opacity: 0.45 },
    triggerSelected: { borderColor: PURPLE, backgroundColor: PURPLE_LIGHT },
    triggerText: { fontSize: 15, color: '#111827', flex: 1 },
    placeholder: { color: '#9CA3AF' },
    arrow: { fontSize: 10, color: '#6B7280', marginLeft: 8 },

    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        maxHeight: '65%', paddingBottom: 24,
    },
    sheetHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 18, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    sheetTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
    sheetCloseBtn: { padding: 4 },
    sheetCloseIcon: { fontSize: 18, color: '#6B7280' },
    option: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
    },
    optionSelected: { backgroundColor: PURPLE_LIGHT },
    optionText: { fontSize: 14, color: '#374151' },
    optionTextSelected: { color: PURPLE, fontWeight: '700' },
    optionCheck: { fontSize: 14, color: PURPLE, fontWeight: '800' },
});

