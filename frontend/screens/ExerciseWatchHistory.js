import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
    Image, TextInput, Alert, Modal, Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import exerciseService from '../services/exerciseService';
import { C, T, cardShadow, Icon } from '../components/exercise/ui';

// YouTube-style watch history for exercise videos.
// Rendered as the "History" tab inside ExerciseProgressScreen.

const PAGE_SIZE = 20;

const timeAgo = (date, isSinhala) => {
    const secs = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
    const units = [
        [31536000, 'year', 'වසර'],
        [2592000, 'month', 'මාස'],
        [604800, 'week', 'සති'],
        [86400, 'day', 'දින'],
        [3600, 'hour', 'පැය'],
        [60, 'minute', 'මිනිත්තු']
    ];
    for (const [s, en, si] of units) {
        const n = Math.floor(secs / s);
        if (n >= 1) return isSinhala ? `${si} ${n}කට පෙර` : `${n} ${en}${n > 1 ? 's' : ''} ago`;
    }
    return isSinhala ? 'දැන්' : 'Just now';
};

const groupLabel = (date, isSinhala) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - day) / 86400000);
    if (diffDays <= 0) return isSinhala ? 'අද' : 'Today';
    if (diffDays === 1) return isSinhala ? 'ඊයේ' : 'Yesterday';
    if (diffDays < 7) return isSinhala ? 'මෙම සතිය' : 'This week';
    return isSinhala ? 'කලින්' : 'Earlier';
};

const getEmbedUrl = (item, startPct) => {
    const id = item.videoId && item.videoId.length === 11 ? item.videoId : null;
    if (!id) return null;
    // Resume where the user stopped (unless they finished it)
    const durationSecs = (item.duration || 0) * 60;
    const start = startPct > 0 && startPct < 95 && durationSecs ? Math.floor((startPct / 100) * durationSecs) : 0;
    return `https://www.youtube.com/embed/${id}?playsinline=1&controls=1&rel=0&modestbranding=1&autoplay=1&start=${start}`;
};

export default function ExerciseWatchHistory({ isSinhala }) {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [playing, setPlaying] = useState(null);

    // Each request gets an id; responses from an older request (e.g. a previous search) are ignored
    const requestIdRef = useRef(0);

    const load = useCallback(async (pageNum = 1) => {
        const requestId = ++requestIdRef.current;
        try {
            pageNum === 1 ? setLoading(true) : setLoadingMore(true);
            const data = await exerciseService.getWatchHistory({ page: pageNum, limit: PAGE_SIZE, search: query });
            if (requestId !== requestIdRef.current) return;
            setItems(prev => {
                if (pageNum === 1) return data.items;
                // Deletes or re-watches shift the pages, so skip anything already shown
                const seen = new Set(prev.map(i => i._id));
                return [...prev, ...data.items.filter(i => !seen.has(i._id))];
            });
            setHasMore(!!data.hasMore);
            setPage(pageNum);
        } catch (err) {
            if (requestId === requestIdRef.current) console.error('Failed to load watch history:', err.message);
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
                setLoadingMore(false);
            }
        }
    }, [query]);

    useEffect(() => { load(1); }, [load]);

    // Debounce the search box
    useEffect(() => {
        const t = setTimeout(() => setQuery(search.trim()), 400);
        return () => clearTimeout(t);
    }, [search]);

    const confirm = (title, message, onYes) => {
        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n\n${message}`)) onYes();
            return;
        }
        Alert.alert(title, message, [
            { text: isSinhala ? 'අවලංගු කරන්න' : 'Cancel', style: 'cancel' },
            { text: isSinhala ? 'ඉවත් කරන්න' : 'Remove', style: 'destructive', onPress: onYes }
        ]);
    };

    const removeItem = (item) => {
        confirm(
            isSinhala ? 'ඉතිහාසයෙන් ඉවත් කරන්නද?' : 'Remove from history?',
            item.title || '',
            async () => {
                setItems(prev => prev.filter(i => i._id !== item._id));
                try {
                    await exerciseService.deleteWatchHistoryItem(item._id);
                } catch (err) {
                    console.error('Failed to delete history item:', err.message);
                    load(1);
                }
            }
        );
    };

    const clearAll = () => {
        confirm(
            isSinhala ? 'සියලු ඉතිහාසය මකන්නද?' : 'Clear all watch history?',
            isSinhala ? 'මෙය නැවත ලබාගත නොහැක.' : 'This cannot be undone.',
            async () => {
                setItems([]);
                setHasMore(false);
                try {
                    await exerciseService.clearWatchHistory();
                } catch (err) {
                    console.error('Failed to clear history:', err.message);
                    load(1);
                }
            }
        );
    };

    const openVideo = (item) => {
        setPlaying(item);
        // Bump it to the top of history like YouTube does
        exerciseService.saveWatchHistory({
            videoId: item.videoId,
            videoUrl: item.videoUrl,
            title: item.title,
            thumbnailUrl: item.thumbnailUrl,
            channelTitle: item.channelTitle,
            category: item.category,
            duration: item.duration,
            watchPercentage: item.lastPercentage,
            newSession: true
        }).catch(err => console.error('Failed to update watch history:', err.message));
    };

    const closeVideo = () => {
        setPlaying(null);
        load(1);
    };

    const renderCard = (item) => {
        const pct = Math.round(item.watchPercentage || 0);
        return (
            <TouchableOpacity key={item._id} style={styles.card} onPress={() => openVideo(item)} activeOpacity={0.85}>
                <View style={styles.thumbWrap}>
                    {item.thumbnailUrl ? (
                        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} resizeMode="cover" />
                    ) : (
                        <View style={[styles.thumb, styles.thumbPlaceholder]}>
                            <Icon name="play" size={26} color={C.primaryDark} />
                        </View>
                    )}
                    {!!item.duration && (
                        <View style={styles.durationBadge}>
                            <Text style={styles.durationText}>{item.duration} {isSinhala ? 'මි.' : 'min'}</Text>
                        </View>
                    )}
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                </View>

                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>{item.title || (isSinhala ? 'ව්‍යායාම වීඩියෝව' : 'Exercise video')}</Text>
                    {!!item.channelTitle && <Text style={styles.meta} numberOfLines={1}>{item.channelTitle}</Text>}
                    <Text style={styles.meta}>
                        {timeAgo(item.watchedAt, isSinhala)}
                        {item.watchCount > 1 ? ` · ${isSinhala ? `${item.watchCount} වතාවක්` : `watched ${item.watchCount}×`}` : ''}
                    </Text>
                    <View style={styles.badgeRow}>
                        {item.completed ? (
                            <View style={[styles.badge, styles.badgeDone]}>
                                <Text style={[styles.badgeText, { color: C.success }]}>{isSinhala ? 'සම්පූර්ණයි' : 'Completed'}</Text>
                            </View>
                        ) : (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{pct}% {isSinhala ? 'නැරඹුවා' : 'watched'}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <TouchableOpacity onPress={() => removeItem(item)} style={styles.removeBtn} accessibilityRole="button" accessibilityLabel={isSinhala ? 'ඉතිහාසයෙන් ඉවත් කරන්න' : 'Remove from history'}>
                    <Icon name="close" size={16} color={C.textSub} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    // Group into Today / Yesterday / This week / Earlier, preserving order
    const groups = [];
    items.forEach(item => {
        const label = groupLabel(item.watchedAt, isSinhala);
        const last = groups[groups.length - 1];
        if (last && last.label === label) last.items.push(item);
        else groups.push({ label, items: [item] });
    });

    const embedUrl = playing ? getEmbedUrl(playing, playing.lastPercentage) : null;

    return (
        <View style={styles.container}>
            <View style={styles.toolbar}>
                <TextInput
                    style={styles.search}
                    value={search}
                    onChangeText={setSearch}
                    placeholder={isSinhala ? '🔍 ඉතිහාසය සොයන්න' : '🔍 Search watch history'}
                    placeholderTextColor="#94A3B8"
                />
                {items.length > 0 && (
                    <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
                        <Text style={styles.clearText}>{isSinhala ? 'සියල්ල මකන්න' : 'Clear all'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
            ) : items.length === 0 ? (
                <View style={styles.empty}>
                    <View style={styles.emptyIcon}><Icon name="clock" size={30} color={C.primaryDark} /></View>
                    <Text style={styles.emptyTitle}>
                        {query
                            ? (isSinhala ? 'ගැළපෙන වීඩියෝ නැත' : 'No matching videos')
                            : (isSinhala ? 'තවම නැරඹූ වීඩියෝ නැත' : 'No watch history yet')}
                    </Text>
                    {!query && (
                        <Text style={styles.emptySub}>
                            {isSinhala
                                ? 'ඔබ නරඹන ව්‍යායාම වීඩියෝ මෙහි දිස්වේ.'
                                : 'Exercise videos you watch will show up here.'}
                        </Text>
                    )}
                </View>
            ) : (
                <>
                    {groups.map(group => (
                        <View key={group.label} style={{ marginBottom: 8 }}>
                            <Text style={styles.groupLabel}>{group.label}</Text>
                            {group.items.map(renderCard)}
                        </View>
                    ))}
                    {hasMore && (
                        <TouchableOpacity style={styles.moreBtn} onPress={() => load(page + 1)} disabled={loadingMore}>
                            {loadingMore
                                ? <ActivityIndicator color="#4F46E5" />
                                : <Text style={styles.moreText}>{isSinhala ? 'තවත් පෙන්වන්න' : 'Load more'}</Text>}
                        </TouchableOpacity>
                    )}
                </>
            )}

            <Modal visible={!!playing} animationType="slide" transparent onRequestClose={closeVideo}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle} numberOfLines={2}>{playing?.title}</Text>
                            <TouchableOpacity onPress={closeVideo} style={styles.modalClose} accessibilityRole="button" accessibilityLabel={isSinhala ? 'වසන්න' : 'Close video'}>
                                <Icon name="close" size={16} color={C.textSub} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.player}>
                            {!embedUrl ? (
                                <Text style={{ color: '#fff', textAlign: 'center', marginTop: 90 }}>
                                    {isSinhala ? 'වීඩියෝව පූරණය කළ නොහැක' : 'Failed to load video'}
                                </Text>
                            ) : Platform.OS === 'web' ? (
                                <iframe
                                    src={embedUrl}
                                    style={{ border: 'none', width: '100%', height: '100%' }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <WebView
                                    source={{ uri: embedUrl }}
                                    style={{ flex: 1, backgroundColor: '#000' }}
                                    allowsFullscreenVideo
                                    allowsInlineMediaPlayback
                                    mediaPlaybackRequiresUserAction={false}
                                    javaScriptEnabled
                                />
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 4 },
    toolbar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
    search: {
        flex: 1, minWidth: 220, minHeight: 46, backgroundColor: '#FFFFFF', borderRadius: 23, borderWidth: 1.5, borderColor: C.control,
        paddingHorizontal: 16, fontSize: 14, ...T.medium, color: C.text
    },
    clearBtn: { minHeight: 46, paddingHorizontal: 16, borderRadius: 23, backgroundColor: C.dangerBg, justifyContent: 'center' },
    clearText: { color: C.danger, ...T.bold, fontSize: 13 },
    groupLabel: { fontSize: 15, ...T.headingSemi, color: C.textSub, marginBottom: 10, marginTop: 6 },
    card: {
        flexDirection: 'row', gap: 12, marginBottom: 12, padding: 10, borderRadius: 20, alignItems: 'center',
        backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.border, ...cardShadow
    },
    thumbWrap: { width: 132, aspectRatio: 16 / 9, borderRadius: 14, overflow: 'hidden', backgroundColor: C.control },
    thumb: { width: '100%', height: '100%' },
    thumbPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: C.tint },
    durationBadge: {
        position: 'absolute', right: 6, bottom: 9, backgroundColor: 'rgba(44,26,53,0.8)',
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6
    },
    durationText: { color: '#FFFFFF', fontSize: 10, ...T.bold },
    progressTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, backgroundColor: 'rgba(255,255,255,0.6)' },
    progressFill: { height: '100%', backgroundColor: C.primaryDark },
    info: { flex: 1, justifyContent: 'center', gap: 3 },
    title: { fontSize: 14, ...T.semi, color: C.text },
    meta: { fontSize: 12, ...T.medium, color: C.textSub },
    badgeRow: { flexDirection: 'row', marginTop: 4 },
    badge: { backgroundColor: C.tint, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    badgeDone: { backgroundColor: C.successBg },
    badgeText: { fontSize: 11, ...T.bold, color: C.primaryDark },
    removeBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
    removeIcon: { fontSize: 14, color: C.textSub },
    empty: { alignItems: 'center', paddingVertical: 40, gap: 6 },
    emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.tint, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    emptyEmoji: { fontSize: 44, marginBottom: 10 },
    emptyTitle: { fontSize: 17, ...T.heading, color: C.text },
    emptySub: { fontSize: 13, ...T.medium, color: C.textSub, textAlign: 'center' },
    moreBtn: { alignItems: 'center', justifyContent: 'center', minHeight: 48, borderRadius: 24, borderWidth: 1.5, borderColor: C.primary, backgroundColor: '#FFFFFF', marginTop: 4 },
    moreText: { color: C.primaryDark, ...T.bold },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(44,26,53,0.6)', justifyContent: 'center', padding: 16 },
    modalCard: { backgroundColor: C.bg, borderRadius: 24, overflow: 'hidden', width: '100%', maxWidth: 860, alignSelf: 'center' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
    modalTitle: { flex: 1, fontSize: 16, ...T.heading, color: C.text },
    modalClose: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: C.control },
    player: { width: '100%', aspectRatio: 16 / 9, backgroundColor: C.video }
});
