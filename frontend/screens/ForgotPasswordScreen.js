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
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { COLORS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const [identity, setIdentity] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!identity.trim() || !newPassword || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: t('⚠️ Incomplete'),
                text2: t('Please fill in all fields.'),
                position: 'top',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: t('⚠️ Mismatch'),
                text2: t('Passwords do not match.'),
                position: 'top',
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: t('⚠️ Weak Password'),
                text2: t('Password must be at least 6 characters long.'),
                position: 'top',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/user/reset-password', {
                identity,
                newPassword,
            });

            Toast.show({
                type: 'success',
                text1: `🎉 ${t('Success')}`,
                text2: response.data.message || t('Password reset successfully! Please sign in.'),
                position: 'top',
            });

            setTimeout(() => {
                navigation.replace('Login');
            }, 1200);
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: `❌ ${t('Error')}`,
                text2: error.response?.data?.message || t('Failed to reset password. Check your email or username.'),
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
                    <View style={styles.innerWrapper}>
                        {/* Header Navigation */}
                        <View style={styles.headerRow}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Login')}
                                style={styles.backBtn}
                            >
                                <Text style={styles.backBtnTxt}>← {t('Back to Login')}</Text>
                            </TouchableOpacity>

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

                        {/* Visual Banner Image */}
                        <View style={styles.imageContainer}>
                            <Image
                                source={require('../assets/screening_system/image 8.jpg')}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Title Section */}
                        <View style={styles.welcomeContainer}>
                            <Text style={styles.welcomeTitle}>{t('Reset Password')}</Text>
                            <Text style={styles.welcomeSubtitle}>
                                {t('Enter your registered email or username and your new password to reset.')}
                            </Text>
                        </View>

                        {/* Main Card */}
                        <View style={styles.card}>
                            {/* Identity Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>📧 {t('Email or Username')}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('Enter your email or username')}
                                    placeholderTextColor={COLORS.textMuted}
                                    value={identity}
                                    onChangeText={setIdentity}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            {/* New Password */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>🔒 {t('New Password')}</Text>
                                <View style={styles.passwordRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                                        placeholder={t('Enter new password')}
                                        placeholderTextColor={COLORS.textMuted}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
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

                            {/* Confirm New Password */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>🔒 {t('Confirm New Password')}</Text>
                                <View style={styles.passwordRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                                        placeholder={t('Confirm new password')}
                                        placeholderTextColor={COLORS.textMuted}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeBtn}
                                    >
                                        <Text style={styles.eyeIcon}>
                                            {showConfirmPassword ? '🙈' : '👁️'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Submit Reset Button */}
                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleResetPassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.textWhite} />
                                ) : (
                                    <Text style={styles.buttonText}>✨ {t('Reset Password')}</Text>
                                )}
                            </TouchableOpacity>

                            {/* Footer Navigation */}
                            <View style={styles.footer}>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.footerLink}>{t('Remember your password? Sign In')}</Text>
                                </TouchableOpacity>
                            </View>
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
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 32,
        alignItems: 'center',
    },
    innerWrapper: {
        width: '100%',
        maxWidth: 460,
        alignSelf: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    backBtn: {
        paddingVertical: 6,
    },
    backBtnTxt: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
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
        maxWidth: 240,
        height: height * 0.2,
        maxHeight: 160,
    },
    welcomeContainer: {
        marginBottom: 18,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 10,
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
        marginTop: 6,
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
        alignItems: 'center',
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
