import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, RefreshControl, TextInput, Dimensions, Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 4; // 4 cards per row with padding

// ─── Risk Level Colors ─────────────────────────
const RISK_COLORS = {
    high: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', score: '#EF4444' },
    medium: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', score: '#F59E0B' },
    low: { bg: '#D1FAE5', border: '#10B981', text: '#065F46', score: '#10B981' },
};

const RISK_EMOJIS = { high: '🔴', medium: '🟡', low: '🟢' };
const RISK_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

// ─── Stat Card ────────────────────────────────
function StatCard({ icon, label, value, color }) {
    return (
        <View style={[styles.statCard, { borderTopColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// ─── Patient Card (4 Per Row) ──────────────────
function PatientCard({ patient, onView }) {
    const initials = patient.username?.slice(0, 2).toUpperCase() || '??';
    const risk = patient.latestEpdsRisk || 'low';
    const colors = RISK_COLORS[risk];
    const emoji = RISK_EMOJIS[risk];
    const label = RISK_LABELS[risk];

    return (
        <TouchableOpacity
            style={[
                styles.patientCard,
                { backgroundColor: colors.bg }
            ]}
            onPress={() => onView(patient)}
            activeOpacity={0.85}
        >
            {/* Risk Indicator Bar */}
            <View style={[styles.riskBar, { backgroundColor: colors.border }]} />

            {/* Avatar */}
            <View style={[styles.patientAvatar, { backgroundColor: colors.border + '30' }]}>
                <Text style={[styles.patientAvatarText, { color: colors.border }]}>{initials}</Text>
            </View>

            {/* Name */}
            <Text style={[styles.patientName, { color: colors.text }]} numberOfLines={1}>
                {patient.username}
            </Text>

            {/* Risk Badge */}
            <View style={[styles.riskBadge, { backgroundColor: colors.border + '20' }]}>
                <Text style={styles.riskEmoji}>{emoji}</Text>
                <Text style={[styles.riskLabel, { color: colors.text }]}>{label}</Text>
            </View>

            {/* EPDS Score */}
            {patient.latestEpdsScore !== undefined && (
                <Text style={[styles.riskScore, { color: colors.score }]}>
                    {patient.latestEpdsScore}/30
                </Text>
            )}
        </TouchableOpacity>
    );
}

// ─── Patient Detail Modal ─────────────────────
function PatientModal({ visible, patient, onClose }) {
    if (!patient) return null;
    const joined = new Date(patient.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    const initials = patient.username?.slice(0, 2).toUpperCase() || '??';
    const risk = patient.latestEpdsRisk || 'low';
    const colors = RISK_COLORS[risk];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalCard, { borderTopColor: colors.border, borderTopWidth: 6 }]}>
                    <View style={[styles.modalAvatarBig, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.modalAvatarBigText, { color: colors.border }]}>{initials}</Text>
                    </View>
                    <Text style={styles.modalName}>{patient.username}</Text>

                    {/* Risk Badge in Modal */}
                    <View style={[styles.modalRiskBadge, { backgroundColor: colors.bg }]}>
                        <Text style={styles.modalRiskEmoji}>{RISK_EMOJIS[risk]}</Text>
                        <Text style={[styles.modalRiskText, { color: colors.text }]}>
                            {RISK_LABELS[risk]} Risk • Score: {patient.latestEpdsScore || 0}/30
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>📧</Text>
                        <Text style={styles.detailText}>{patient.email}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>📅</Text>
                        <Text style={styles.detailText}>Joined {joined}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>🏷️</Text>
                        <Text style={[styles.detailText, { color: '#10B981', fontWeight: '700' }]}>
                            {patient.role}
                        </Text>
                    </View>

                    {/* EPDS Details */}
                    {patient.latestEpdsScore !== undefined && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionHeading}>📊 EPDS Assessment</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailIcon}>📝</Text>
                                <Text style={styles.detailText}>Score: {patient.latestEpdsScore}/30</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailIcon}>⚠️</Text>
                                <Text style={[styles.detailText, {
                                    color: colors.score,
                                    fontWeight: '700'
                                }]}>
                                    Risk: {patient.latestEpdsRisk?.toUpperCase() || 'UNKNOWN'}
                                </Text>
                            </View>
                            {patient.latestEpdsDate && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailIcon}>📅</Text>
                                    <Text style={styles.detailText}>
                                        Last Screened: {
                                            new Date(patient.latestEpdsDate).getTime()
                                                ? new Date(patient.latestEpdsDate).toLocaleDateString('en-GB')
                                                : patient.latestEpdsDate
                                        }
                                    </Text>
                                </View>
                            )}
                        </>
                    )}

                    {/* Baby Details */}
                    {patient.babyDetails && Object.keys(patient.babyDetails).length > 0 && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionHeading}>👶 Baby Details</Text>
                            {patient.babyDetails.birthday ? (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailIcon}>🎂</Text>
                                    <Text style={styles.detailText}>Born: {patient.babyDetails.birthday}</Text>
                                </View>
                            ) : null}
                            {patient.babyDetails.weight ? (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailIcon}>⚖️</Text>
                                    <Text style={styles.detailText}>Weight: {patient.babyDetails.weight}</Text>
                                </View>
                            ) : null}
                            {patient.babyDetails.height ? (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailIcon}>📏</Text>
                                    <Text style={styles.detailText}>Height: {patient.babyDetails.height}</Text>
                                </View>
                            ) : null}

                            {patient.babyDetails.vaccinations && patient.babyDetails.vaccinations.length > 0 && (
                                <View style={{ width: '100%', marginTop: 8 }}>
                                    <Text style={[styles.detailText, { fontWeight: 'bold', marginBottom: 4 }]}>Vaccinations:</Text>
                                    {patient.babyDetails.vaccinations.map((vac, i) => (
                                        <Text key={i} style={[styles.detailText, { fontSize: 13, marginLeft: 24, color: '#6B7280' }]}>
                                            • {vac.name} ({vac.date})
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </>
                    )}

                    <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.border }]} onPress={onClose}>
                        <Text style={styles.closeBtnText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// ─── MAIN SCREEN ──────────────────────────────
export default function MidwifeDashboardScreen({ navigation }) {
    const { user: authUser, token, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => { if (token) setAuthToken(token); }, [token]);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, patientsRes] = await Promise.all([
                api.get('/midwife/stats'),
                api.get('/midwife/patients'),
            ]);
            setStats(statsRes.data);
            setPatients(patientsRes.data);
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Failed to load data',
                text2: err.response?.data?.message || 'Please try again',
                position: 'top',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const handleLogout = () => {
        logout();
        navigation.replace('Login');
    };

    const filtered = patients.filter(p =>
        p.username?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchText.toLowerCase())
    );

    // Render patient in 4-column grid
    const renderPatient = ({ item }) => (
        <PatientCard patient={item} onView={setSelected} />
    );

    return (
        <SafeAreaView style={styles.safe}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>👩‍⚕️ Midwife Portal</Text>
                    <Text style={styles.headerSub}>Welcome, {authUser?.username || 'Midwife'}</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0EA5E9']} />}
            >
                {/* ── Stats ── */}
                {stats && (
                    <View style={styles.statsRow}>
                        <StatCard icon="🤰" label="Total Patients" value={stats.totalPatients} color="#10B981" />
                        <StatCard icon="👩‍⚕️" label="Midwives" value={stats.totalMidwives} color="#0EA5E9" />
                    </View>
                )}

                {/* ── Tip Banner ── */}
                <View style={styles.tipBanner}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tipText}>
                        Tap any patient card to view their profile. Cards show risk level with color coding.
                    </Text>
                </View>

                {/* ── Search ── */}
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search patients…"
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={setSearchText}
                        autoCapitalize="none"
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Text style={{ fontSize: 18, color: '#9CA3AF' }}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Patient Grid ── */}
                <Text style={styles.sectionTitle}>
                    👤 {filtered.length} Patient{filtered.length !== 1 ? 's' : ''}
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#0EA5E9" style={{ marginTop: 40 }} />
                ) : filtered.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyIcon}>😶</Text>
                        <Text style={styles.emptyText}>No patients found</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        renderItem={renderPatient}
                        keyExtractor={(item) => item._id}
                        numColumns={4}
                        columnWrapperStyle={styles.gridRow}
                        scrollEnabled={false}
                        contentContainerStyle={styles.gridContainer}
                    />
                )}

                <View style={{ height: 32 }} />
            </ScrollView>

            {/* ── Patient Detail Modal ── */}
            <PatientModal
                visible={!!selected}
                patient={selected}
                onClose={() => setSelected(null)}
            />

            <Toast />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────
const TEAL = '#0EA5E9';
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F0F9FF' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: TEAL,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
    logoutBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    logoutText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    // Scroll
    scroll: { paddingHorizontal: 12, paddingTop: 16 },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        flex: 1,
        borderTopWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        alignItems: 'center',
    },
    statIcon: { fontSize: 26, marginBottom: 6 },
    statValue: { fontSize: 26, fontWeight: '800', marginBottom: 2 },
    statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

    // Tip banner
    tipBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0F2FE',
        borderRadius: 12,
        padding: 12,
        marginBottom: 14,
        gap: 10,
    },
    tipIcon: { fontSize: 20 },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: '#0369A1',
        lineHeight: 18
    },

    // Search
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 14,
        marginBottom: 14,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    searchIcon: { fontSize: 18, marginRight: 8 },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#111827'
    },

    // Section title
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 10
    },

    // ── Grid Layout (4 Columns) ──
    gridContainer: {
        paddingBottom: 8
    },
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 8,
    },

    // ── Patient Card (4 Per Row) ──
    patientCard: {
        width: (width - 56) / 4, // 4 cards per row with padding
        borderRadius: 14,
        padding: 10,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 150,
    },
    riskBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
    },
    patientAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        marginTop: 4,
    },
    patientAvatarText: {
        fontWeight: '800',
        fontSize: 16,
    },
    patientName: {
        fontWeight: '700',
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 3,
        width: '100%',
    },
    riskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginBottom: 2,
        gap: 3,
    },
    riskEmoji: { fontSize: 9 },
    riskLabel: { fontSize: 8, fontWeight: '600' },
    riskScore: {
        fontSize: 11,
        fontWeight: '800',
        marginTop: 1,
    },

    // Empty
    emptyBox: {
        alignItems: 'center',
        paddingVertical: 48
    },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600'
    },

    // ── Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        maxHeight: '90%',
    },
    modalAvatarBig: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    modalAvatarBigText: {
        fontWeight: '800',
        fontSize: 28,
    },
    modalName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
    },
    modalRiskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
        gap: 8,
    },
    modalRiskEmoji: { fontSize: 16 },
    modalRiskText: {
        fontSize: 14,
        fontWeight: '700',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
        gap: 10,
    },
    detailIcon: { fontSize: 18 },
    detailText: {
        fontSize: 14,
        color: '#374151',
        flex: 1
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        width: '100%',
        marginVertical: 12
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        width: '100%',
        marginBottom: 10,
    },
    closeBtn: {
        marginTop: 16,
        borderRadius: 14,
        paddingVertical: 13,
        paddingHorizontal: 40,
        width: '100%',
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15
    },
});