import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, RefreshControl, TextInput, Modal,
    FlatList, useWindowDimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── EPDS Questions ─────────────────────────
const EPDS_QUESTIONS = [
    '1. I have been able to laugh and see the funny side of things',
    '2. I have looked forward with enjoyment to things',
    '3. I have blamed myself unnecessarily when things went wrong',
    '4. I have been anxious or worried for no good reason',
    '5. I have felt scared or panicky for no very good reason',
    '6. Things have been getting on top of me',
    '7. I have been so unhappy that I have had difficulty sleeping',
    '8. I have felt sad or miserable',
    '9. I have been so unhappy that I have been crying',
    '10. The thought of harming myself has occurred to me',
];

const RISK_COLORS = {
    high: { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', soft: '#FEE2E2' },
    medium: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', soft: '#FEF3C7' },
    low: { bg: '#ECFDF5', border: '#10B981', text: '#065F46', soft: '#D1FAE5' },
};

const RISK_EMOJIS = { high: '🔴', medium: '🟡', low: '🟢' };
const RISK_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

function getRisk(p) {
    return p?.latestEpds?.riskLevel || p?.latestEpdsRisk || 'low';
}
function getScore(p) {
    return p?.latestEpds?.totalScore ?? p?.latestEpdsScore ?? undefined;
}
function getAnswers(p) {
    return p?.latestEpds?.answers || null;
}

// ─── Stat Card ────────────────────────────────
function StatCard({ icon, label, value, color }) {
    return (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <View>
                <Text style={[styles.statValue, { color }]}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );
}

// ─── Patient Card ─────────────────────────────
function PatientCard({ patient, onView, cardWidth }) {
    const risk = getRisk(patient);
    const colors = RISK_COLORS[risk] || RISK_COLORS.low;
    const score = getScore(patient);
    const initials = patient.username?.slice(0, 2).toUpperCase() || '??';

    return (
        <TouchableOpacity
            style={[styles.patientCard, { backgroundColor: colors.bg, width: cardWidth }]}
            onPress={() => onView(patient)}
            activeOpacity={0.85}
        >
            <View style={[styles.riskDot, { backgroundColor: colors.border }]} />

            <View style={[styles.avatar, { backgroundColor: colors.soft }]}>
                <Text style={[styles.avatarText, { color: colors.border }]}>{initials}</Text>
            </View>

            <Text style={[styles.patientName, { color: colors.text }]} numberOfLines={1}>
                {patient.username}
            </Text>

            <View style={[styles.riskPill, { backgroundColor: colors.soft }]}>
                <Text style={styles.riskEmoji}>{RISK_EMOJIS[risk]}</Text>
                <Text style={[styles.riskPillText, { color: colors.text }]}>{RISK_LABELS[risk]}</Text>
            </View>

            {score !== undefined && (
                <Text style={[styles.scoreText, { color: colors.border }]}>{score}/30</Text>
            )}
        </TouchableOpacity>
    );
}

// ─── Patient Modal ────────────────────────────
function PatientModal({ visible, patient, onClose, loadingDetail }) {
    if (!patient) return null;

    const risk = getRisk(patient);
    const colors = RISK_COLORS[risk] || RISK_COLORS.low;
    const score = getScore(patient);
    const answers = getAnswers(patient);
    const history = patient.epdsHistory || [];
    const initials = patient.username?.slice(0, 2).toUpperCase() || '??';
    const joined = new Date(patient.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
    });

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

                        {/* Header */}
                        <View style={[styles.modalHeader, { backgroundColor: colors.bg }]}>
                            <View style={[styles.modalAvatar, { backgroundColor: colors.soft }]}>
                                <Text style={[styles.modalAvatarText, { color: colors.border }]}>{initials}</Text>
                            </View>
                            <Text style={styles.modalName}>{patient.username}</Text>
                            <View style={[styles.modalRiskBadge, { backgroundColor: colors.soft }]}>
                                <Text style={{ fontSize: 14 }}>{RISK_EMOJIS[risk]}</Text>
                                <Text style={[styles.modalRiskText, { color: colors.text }]}>
                                    {RISK_LABELS[risk]} Risk  •  {score ?? 0}/30
                                </Text>
                            </View>
                        </View>

                        {/* Info */}
                        <View style={styles.infoSection}>
                            <InfoRow icon="📧" text={patient.email} />
                            <InfoRow icon="📅" text={`Joined ${joined}`} />
                            <InfoRow icon="🏷️" text={patient.role} highlight />
                        </View>

                        {loadingDetail && (
                            <ActivityIndicator size="small" color="#0EA5E9" style={{ marginVertical: 20 }} />
                        )}

                        {/* EPDS Answers */}
                        {answers?.length === 10 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📝 Latest EPDS Answers</Text>
                                {EPDS_QUESTIONS.map((q, idx) => (
                                    <View key={idx} style={styles.questionCard}>
                                        <Text style={styles.questionText}>{q}</Text>
                                        <View style={styles.answerChips}>
                                            {[0, 1, 2, 3].map(val => (
                                                <View
                                                    key={val}
                                                    style={[
                                                        styles.chip,
                                                        answers[idx] === val && { backgroundColor: colors.border },
                                                    ]}
                                                >
                                                    <Text style={[
                                                        styles.chipText,
                                                        answers[idx] === val && { color: '#fff' },
                                                    ]}>
                                                        {val}
                                                    </Text>
                                                </View>
                                            ))}
                                            <Text style={[styles.selectedValue, { color: colors.border }]}>
                                                → {answers[idx]}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* History */}
                        {history.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📊 EPDS History</Text>
                                {history.map((entry, i) => {
                                    const r = entry.riskLevel || 'low';
                                    const c = RISK_COLORS[r] || RISK_COLORS.low;
                                    return (
                                        <View key={entry._id || i} style={styles.historyItem}>
                                            <View style={styles.historyTop}>
                                                <Text style={styles.historyMonth}>{entry.month}</Text>
                                                <Text style={[styles.historyScore, { color: c.border }]}>
                                                    {entry.totalScore}/30 • {RISK_LABELS[r]}
                                                </Text>
                                            </View>
                                            {entry.answers && (
                                                <Text style={styles.historyAnswers}>
                                                    [{entry.answers.join(', ')}]
                                                </Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Baby Details */}
                        {patient.babyDetails && Object.keys(patient.babyDetails).length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>👶 Baby Details</Text>
                                {patient.babyDetails.birthday && <InfoRow icon="🎂" text={`Born: ${patient.babyDetails.birthday}`} />}
                                {patient.babyDetails.weight && <InfoRow icon="⚖️" text={`Weight: ${patient.babyDetails.weight}`} />}
                                {patient.babyDetails.height && <InfoRow icon="📏" text={`Height: ${patient.babyDetails.height}`} />}
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.closeBtn, { backgroundColor: colors.border }]}
                            onPress={onClose}
                        >
                            <Text style={styles.closeBtnText}>Close</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function InfoRow({ icon, text, highlight }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{icon}</Text>
            <Text style={[styles.infoText, highlight && { color: '#10B981', fontWeight: '700' }]}>
                {text}
            </Text>
        </View>
    );
}

// ─── MAIN SCREEN ──────────────────────────────
export default function MidwifeDashboardScreen({ navigation }) {
    const { user: authUser, token, logout } = useAuth();
    const { width } = useWindowDimensions();

    const [stats, setStats] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selected, setSelected] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [filterRisk, setFilterRisk] = useState('all'); // all | high | medium | low

    const numColumns = useMemo(() => {
        if (width >= 1100) return 5;
        if (width >= 800) return 4;
        if (width >= 560) return 3;
        return 2;
    }, [width]);

    const cardWidth = useMemo(() => {
        const padding = 32;
        const gap = 12;
        return (width - padding - gap * (numColumns - 1)) / numColumns;
    }, [width, numColumns]);

    useEffect(() => {
        if (token) setAuthToken(token);
    }, [token]);

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
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleViewPatient = async (patient) => {
        setSelected(patient);
        setLoadingDetail(true);
        try {
            const res = await api.get(`/midwife/patients/${patient._id}`);
            setSelected(res.data);
        } catch (err) {
            // keep existing data
        } finally {
            setLoadingDetail(false);
        }
    };

    const filtered = useMemo(() => {
        return patients.filter(p => {
            const matchesSearch =
                p.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                p.email?.toLowerCase().includes(searchText.toLowerCase());

            const risk = getRisk(p);
            const matchesRisk = filterRisk === 'all' || risk === filterRisk;

            return matchesSearch && matchesRisk;
        });
    }, [patients, searchText, filterRisk]);

    const renderPatient = ({ item }) => (
        <PatientCard patient={item} onView={handleViewPatient} cardWidth={cardWidth} />
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#0EA5E9" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Midwife Portal</Text>
                    <Text style={styles.headerSub}>Welcome, {authUser?.username || 'Midwife'}</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={() => { logout(); navigation.replace('Login'); }}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scroll, { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={['#0EA5E9']} />}
            >
                {/* Stats */}
                {stats && (
                    <View style={styles.statsRow}>
                        <StatCard icon="🤰" label="Patients" value={stats.totalPatients} color="#10B981" />
                        <StatCard icon="👩‍⚕️" label="Midwives" value={stats.totalMidwives} color="#0EA5E9" />
                    </View>
                )}

                {/* Search */}
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email..."
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={setSearchText}
                        autoCapitalize="none"
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Text style={{ color: '#9CA3AF', fontSize: 18 }}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Risk Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {['all', 'high', 'medium', 'low'].map(r => (
                        <TouchableOpacity
                            key={r}
                            style={[
                                styles.filterChip,
                                filterRisk === r && styles.filterChipActive,
                                r !== 'all' && filterRisk === r && { backgroundColor: RISK_COLORS[r].border },
                            ]}
                            onPress={() => setFilterRisk(r)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                filterRisk === r && { color: '#fff' },
                            ]}>
                                {r === 'all' ? 'All' : `${RISK_EMOJIS[r]} ${RISK_LABELS[r]}`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Count */}
                <Text style={styles.sectionTitle}>
                    {filtered.length} Patient{filtered.length !== 1 ? 's' : ''}
                </Text>

                {/* Grid */}
                {loading ? (
                    <ActivityIndicator size="large" color="#0EA5E9" style={{ marginTop: 50 }} />
                ) : filtered.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyText}>No patients found</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        renderItem={renderPatient}
                        keyExtractor={item => item._id}
                        numColumns={numColumns}
                        key={numColumns}
                        columnWrapperStyle={numColumns > 1 ? styles.gridRow : null}
                        scrollEnabled={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </ScrollView>

            <PatientModal
                visible={!!selected}
                patient={selected}
                onClose={() => setSelected(null)}
                loadingDetail={loadingDetail}
            />

            <Toast />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F8FAFC' },

    header: {
        backgroundColor: '#0EA5E9',
        paddingHorizontal: 20,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
    logoutBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    logoutText: { color: '#fff', fontWeight: '600', fontSize: 13 },

    scroll: { paddingHorizontal: 16, paddingTop: 16 },

    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderLeftWidth: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    statIcon: { fontSize: 28 },
    statValue: { fontSize: 24, fontWeight: '800' },
    statLabel: { fontSize: 12, color: '#64748B', marginTop: 1 },

    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 14,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
    },
    searchIcon: { fontSize: 18, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#1E293B' },

    filterRow: { marginBottom: 16 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
        marginRight: 8,
    },
    filterChipActive: { backgroundColor: '#0EA5E9' },
    filterChipText: { fontSize: 13, fontWeight: '600', color: '#475569' },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },

    gridRow: { gap: 12, marginBottom: 12 },

    patientCard: {
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        minHeight: 155,
        position: 'relative',
    },
    riskDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    avatarText: { fontWeight: '800', fontSize: 17 },
    patientName: { fontWeight: '700', fontSize: 13, textAlign: 'center', marginBottom: 6 },
    riskPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        marginBottom: 4,
    },
    riskEmoji: { fontSize: 11 },
    riskPillText: { fontSize: 11, fontWeight: '600' },
    scoreText: { fontSize: 13, fontWeight: '800', marginTop: 2 },

    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, color: '#64748B', fontWeight: '500' },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.55)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: '92%',
        overflow: 'hidden',
    },
    modalHeader: {
        alignItems: 'center',
        paddingTop: 28,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    modalAvatar: {
        width: 76,
        height: 76,
        borderRadius: 38,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    modalAvatarText: { fontWeight: '800', fontSize: 28 },
    modalName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
    modalRiskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    modalRiskText: { fontSize: 14, fontWeight: '700' },

    infoSection: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    infoIcon: { fontSize: 17 },
    infoText: { fontSize: 14, color: '#334155', flex: 1 },

    section: { paddingHorizontal: 20, marginTop: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },

    questionCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    questionText: { fontSize: 13, color: '#334155', marginBottom: 10, lineHeight: 19 },
    answerChips: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    chip: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: { fontSize: 14, fontWeight: '700', color: '#475569' },
    selectedValue: { fontSize: 14, fontWeight: '800', marginLeft: 4 },

    historyItem: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
    },
    historyTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    historyMonth: { fontWeight: '700', fontSize: 14, color: '#0F172A' },
    historyScore: { fontWeight: '700', fontSize: 13 },
    historyAnswers: { fontSize: 12, color: '#64748B' },

    closeBtn: {
        marginHorizontal: 20,
        marginTop: 24,
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
    },
    closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});