import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { COLORS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Toast.show({
                type: 'error',
                text1: t('⚠️ Incomplete'),
                text2: t('Please fill in your email and password.'),
                position: 'top',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/user/signin', { email, password });
            const { token, ...userData } = response.data;

            setAuthToken(token);
            login(userData, token);

            Toast.show({
                type: 'success',
                text1: `✅ ${t('Welcome Back')}`,
                text2: `${t('Sign in to continue')} ${userData?.username || email}`,
                position: 'top',
            });

            const role = userData?.role || 'patient';
            setTimeout(() => {
                if (role === 'admin') {
                    navigation.replace('AdminDashboard');
                } else if (role === 'midwife') {
                    navigation.replace('MidwifeDashboard');
                } else {
                    if (!userData?.onboardingCompleted) {
                        navigation.replace('Onboarding');
                    } else {
                        navigation.replace('Dashboard');
                    }
                }
            }, 1000);
        } catch (error) {
            console.error(error);
            const message =
                error.response?.data?.message || t('Submission failed. Please try again.');
            Toast.show({
                type: 'error',
                text1: `❌ ${t('Save Failed')}`,
                text2: message,
                position: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Language Toggle Header */}
                    <View style={styles.languageToggle}>
                        <TouchableOpacity
                            onPress={toggleLanguage}
                            style={styles.langButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.langText}>
                                {i18n.language === 'en' ? 'සිං' : 'EN'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Image Section using User's Added Asset */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../assets/image 7.png')}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Welcome Text translated */}
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeTitle}>{t('Welcome Back')}</Text>
                        <Text style={styles.welcomeSubtitle}>{t('Login your account')}</Text>
                    </View>

                    {/* Login Form Card */}
                    <View style={styles.card}>
                        {/* Username/Email */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('Username')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('Enter your username or email')}
                                placeholderTextColor={COLORS.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('Password')}</Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                                    placeholder={t('Enter your password')}
                                    placeholderTextColor={COLORS.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeBtn}
                                >
                                    <Text style={styles.eyeIcon}>
                                        {showPassword ? '🙈' : '👁️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.textWhite} />
                            ) : (
                                <Text style={styles.buttonText}>{t('Login')}</Text>
                            )}
                        </TouchableOpacity>

                        {/* Footer Links */}
                        <View style={styles.footer}>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.footerLink}>{t('Create Account')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() =>
                                    Toast.show({
                                        type: 'info',
                                        text1: t('Forgot Password?'),
                                        text2: 'Password reset feature coming soon.',
                                        position: 'top',
                                    })
                                }
                            >
                                <Text style={styles.footerLink}>{t('Forgot Password?')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <Toast />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // Light Purple Screen Background
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 32,
    },
    languageToggle: {
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    langButton: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    langText: {
        fontWeight: 'bold',
        color: COLORS.primary,
        fontSize: 14,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    image: {
        width: width * 0.7,
        height: height * 0.23,
        maxHeight: 200,
    },
    welcomeContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    welcomeSubtitle: {
        fontSize: 15,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 22,
        padding: 24,
        width: '100%',
        ...SHADOWS.card,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        backgroundColor: COLORS.background,
        color: COLORS.textPrimary,
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        overflow: 'hidden',
        paddingRight: 4,
    },
    eyeBtn: {
        paddingHorizontal: 12,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
    },
    eyeIcon: {
        fontSize: 18,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 4,
        ...SHADOWS.button,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: COLORS.textWhite,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    footerLink: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});