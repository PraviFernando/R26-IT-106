import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SRI_LANKA_DISTRICTS, SRI_LANKA_VILLAGES_BY_DISTRICT } from '../data/sriLankaLocationData';

export default function ProfileScreen({ navigation }) {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        fullName: '',
        age: '',
        district: '',
        village: '',
    });

    // Dropdown modal states
    const [districtModalVisible, setDistrictModalVisible] = useState(false);
    const [villageModalVisible, setVillageModalVisible] = useState(false);
    const [customVillageInput, setCustomVillageInput] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/user/me');
            if (res.data) {
                setProfile({
                    username: res.data.username || '',
                    email: res.data.email || '',
                    phoneNumber: res.data.phoneNumber || '',
                    fullName: res.data.fullName || '',
                    age: res.data.age ? String(res.data.age) : '',
                    district: res.data.district || 'Colombo',
                    village: res.data.village || '',
                });
            }
        } catch (err) {
            Toast.show({ type: 'error', text1: t('Error'), text2: t('Failed to load profile') });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!profile.fullName.trim()) {
            Toast.show({ type: 'error', text1: t('Required'), text2: t('Please enter your full name.') });
            return;
        }
        setSaving(true);
        try {
            const updated = await api.put('/user/me', {
                fullName: profile.fullName,
                age: profile.age ? Number(profile.age) : null,
                email: profile.email,
                phoneNumber: profile.phoneNumber,
                district: profile.district,
                village: profile.village,
            });
            Toast.show({ type: 'success', text1: t('Success'), text2: t('Profile updated successfully') });
            if (updated.data) {
                setProfile(prev => ({
                    ...prev,
                    fullName: updated.data.fullName || prev.fullName,
                    age: updated.data.age ? String(updated.data.age) : prev.age,
                    email: updated.data.email || prev.email,
                    phoneNumber: updated.data.phoneNumber || prev.phoneNumber,
                    district: updated.data.district || prev.district,
                    village: updated.data.village || prev.village,
                }));
            }
        } catch (err) {
            Toast.show({ type: 'error', text1: t('Error'), text2: err.response?.data?.message || t('Failed to update profile') });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            t("Delete Account"),
            t("Are you sure you want to delete your account? This action cannot be undone."),
            [
                { text: t("Cancel"), style: "cancel" },
                {
                    text: t("Delete"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete('/user/me');
                            logout();
                            navigation.replace('Login');
                        } catch (err) {
                            Toast.show({ type: 'error', text1: t('Error'), text2: t('Failed to delete account') });
                        }
                    }
                }
            ]
        );
    };

    const availableVillages = SRI_LANKA_VILLAGES_BY_DISTRICT[profile.district] || ['Central Village', 'North Area', 'South Area', 'Main Secretariat'];

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, styles.centered]}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>{t('Loading profile...')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>👤 {t('My Profile')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Avatar Banner */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{profile.fullName?.slice(0, 2).toUpperCase() || profile.username?.slice(0, 2).toUpperCase() || '👤'}</Text>
                    </View>
                    <Text style={styles.username}>{profile.fullName || profile.username || 'User Profile'}</Text>
                    <Text style={styles.email}>{profile.email || 'mother@pericare.lk'}</Text>
                </View>

                {/* Profile Form Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>{t('Personal Details')}</Text>

                    {/* Full Name */}
                    <Text style={styles.label}>{t('Full Name')} *</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.fullName}
                        onChangeText={text => setProfile({ ...profile, fullName: text })}
                        placeholder={t('Enter your full name')}
                        placeholderTextColor="#9CA3AF"
                    />

                    {/* Age */}
                    <Text style={styles.label}>{t('Age')} *</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.age}
                        onChangeText={text => setProfile({ ...profile, age: text })}
                        placeholder={t('Enter your age')}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                    />

                    {/* Email Address */}
                    <Text style={styles.label}>{t('Email Address')} *</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.email}
                        onChangeText={text => setProfile({ ...profile, email: text })}
                        placeholder={t('Enter your email address')}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* Phone Number */}
                    <Text style={styles.label}>{t('Phone Number')}</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.phoneNumber}
                        onChangeText={text => setProfile({ ...profile, phoneNumber: text })}
                        placeholder={t('e.g. +94 77 123 4567')}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                    />

                    {/* District (Sri Lanka Dropdown) */}
                    <Text style={styles.label}>{t('District (Sri Lanka)')} *</Text>
                    <TouchableOpacity
                        style={styles.dropdownBtn}
                        onPress={() => setDistrictModalVisible(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.dropdownValue}>📍 {profile.district || 'Select District'}</Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>

                    {/* Village (Sri Lanka Dropdown) */}
                    <Text style={styles.label}>{t('Village / Divisional Secretariat (Sri Lanka)')} *</Text>
                    <TouchableOpacity
                        style={styles.dropdownBtn}
                        onPress={() => setVillageModalVisible(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.dropdownValue}>🏡 {profile.village || 'Select Village / Town'}</Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} disabled={saving} activeOpacity={0.85}>
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.updateBtnText}>💾 {t('Save Profile Details')}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Danger Zone Card */}
                <View style={[styles.card, { marginTop: 20 }]}>
                    <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>{t('Danger Zone')}</Text>
                    <Text style={styles.dangerText}>{t('Once you delete your account, there is no going back. Please be certain.')}</Text>
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
                        <Text style={styles.deleteBtnText}>🗑️ {t('Delete Account')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* ── District Selection Modal ───────────────────────────────────── */}
            <Modal visible={districtModalVisible} transparent animationType="slide" onRequestClose={() => setDistrictModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>📍 Select Sri Lanka District</Text>
                            <TouchableOpacity onPress={() => setDistrictModalVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={SRI_LANKA_DISTRICTS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalItem, profile.district === item && styles.modalItemSelected]}
                                    onPress={() => {
                                        setProfile(prev => ({ ...prev, district: item, village: '' }));
                                        setDistrictModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalItemText, profile.district === item && styles.modalItemTextSelected]}>
                                        {item}
                                    </Text>
                                    {profile.district === item && <Text style={styles.checkIcon}>✓</Text>}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* ── Village Selection Modal ────────────────────────────────────── */}
            <Modal visible={villageModalVisible} transparent animationType="slide" onRequestClose={() => setVillageModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>🏡 Select Village / Secretariat ({profile.district})</Text>
                            <TouchableOpacity onPress={() => setVillageModalVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Custom Input Option */}
                        <View style={styles.customVillageRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginTop: 0 }]}
                                placeholder="Or type custom village name..."
                                value={customVillageInput}
                                onChangeText={setCustomVillageInput}
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity
                                style={styles.customAddBtn}
                                onPress={() => {
                                    if (customVillageInput.trim()) {
                                        setProfile(prev => ({ ...prev, village: customVillageInput.trim() }));
                                        setCustomVillageInput('');
                                        setVillageModalVisible(false);
                                    }
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Set</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={availableVillages}
                            keyExtractor={(item, index) => `${item}-${index}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalItem, profile.village === item && styles.modalItemSelected]}
                                    onPress={() => {
                                        setProfile(prev => ({ ...prev, village: item }));
                                        setVillageModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalItemText, profile.village === item && styles.modalItemTextSelected]}>
                                        {item}
                                    </Text>
                                    {profile.village === item && <Text style={styles.checkIcon}>✓</Text>}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <Toast />
        </SafeAreaView>
    );
}

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#EDE9FE';

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F3F4F6' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#6B7280', fontSize: 15 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
    },
    backBtn: { padding: 8 },
    backIcon: { fontSize: 22, color: PURPLE, fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },

    scroll: { padding: 16 },

    avatarContainer: { alignItems: 'center', marginBottom: 20, marginTop: 4 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: PURPLE_LIGHT, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 2, borderColor: PURPLE },
    avatarText: { fontSize: 28, color: PURPLE, fontWeight: 'bold' },
    username: { fontSize: 22, fontWeight: '800', color: '#111827' },
    email: { fontSize: 14, color: '#6B7280', marginTop: 2 },

    card: { backgroundColor: '#fff', borderRadius: 18, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },
    label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, backgroundColor: '#F9FAFB', color: '#111827' },

    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 13,
        backgroundColor: '#F9FAFB',
    },
    dropdownValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
    dropdownArrow: { fontSize: 12, color: '#6B7280' },

    updateBtn: { backgroundColor: PURPLE, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24, elevation: 3 },
    updateBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

    dangerText: { fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 20 },
    deleteBtn: { backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#FECACA', borderRadius: 12, padding: 14, alignItems: 'center' },
    deleteBtnText: { color: '#EF4444', fontSize: 15, fontWeight: 'bold' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
    modalClose: { fontSize: 20, color: '#6B7280', padding: 4 },
    modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalItemSelected: { backgroundColor: PURPLE_LIGHT },
    modalItemText: { fontSize: 15, color: '#374151', fontWeight: '500' },
    modalItemTextSelected: { color: PURPLE, fontWeight: '700' },
    checkIcon: { color: PURPLE, fontWeight: 'bold', fontSize: 16 },

    customVillageRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    customAddBtn: { backgroundColor: PURPLE, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
