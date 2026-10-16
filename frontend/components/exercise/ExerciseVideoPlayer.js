import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme';
import styles from './exerciseStyles';
import { getYoutubeEmbedUrl } from '../../utils/exerciseUtils';

const ExerciseVideoPlayer = ({ url, onProgress }) => {
    const { width: currentWidth } = useWindowDimensions();
    const isLargeScreen = currentWidth > 768;
    const { t } = useTranslation();
    const [error, setError] = useState(false);
    const webViewRef = useRef(null);

    const embedUrl = getYoutubeEmbedUrl(url, url && url.includes('youtube.com/embed/') ? '' : undefined);
    const videoId = embedUrl.split('youtube.com/embed/')[1]?.split('?')[0];

    // Web: read real playback position from the YouTube iframe (enablejsapi) instead of counting seconds,
    // so pausing or never pressing play does not advance progress.
    const iframeRef = useRef(null);
    const onProgressRef = useRef(onProgress);
    onProgressRef.current = onProgress;
    const webEmbedUrl = embedUrl.includes('youtube.com/embed/')
        ? `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}enablejsapi=1`
        : embedUrl;

    useEffect(() => {
        if (Platform.OS !== 'web') return;
        let videoDuration = 0;
        const handleMessage = (event) => {
            if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
            if (typeof event.origin !== 'string' || !event.origin.includes('youtube')) return;
            let data;
            try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; } catch (e) { return; }
            const info = data && data.info;
            if (!info || !onProgressRef.current) return;
            if (info.duration) videoDuration = info.duration;
            if (info.playerState === 0) onProgressRef.current(100); // ended
            else if (typeof info.currentTime === 'number' && videoDuration > 0) {
                onProgressRef.current((info.currentTime / videoDuration) * 100);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [url]);

    const startListeningToIframe = () => {
        // Ask the YouTube player to start sending 'infoDelivery' events (currentTime, duration, state)
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
    };

    if (!embedUrl.includes('youtube.com/embed/')) {
        return (
            <View style={[styles.videoPlayer, styles.videoPlayerCentered, { height: isLargeScreen ? 420 : 250 }]}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>
                    {t('Failed to load video')}
                </Text>
            </View>
        );
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                body, html, #player { width: 100%; height: 100%; margin: 0; padding: 0; background-color: #000; overflow: hidden; }
            </style>
        </head>
        <body>
            <div id="player"></div>
            <script>
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                var player;
                function onYouTubeIframeAPIReady() {
                    player = new YT.Player('player', {
                        height: '100%',
                        width: '100%',
                        videoId: '${videoId}',
                        playerVars: {
                            'playsinline': 1,
                            'controls': 1,
                            'rel': 0,
                            'modestbranding': 1
                        },
                        events: {
                            'onStateChange': onPlayerStateChange,
                            'onReady': onPlayerReady
                        }
                    });
                }

                var progressInterval;
                function onPlayerReady(event) {
                    progressInterval = setInterval(function() {
                        if (player && player.getCurrentTime) {
                            var currentTime = player.getCurrentTime();
                            var duration = player.getDuration();
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'progress',
                                currentTime: currentTime,
                                duration: duration
                            }));
                        }
                    }, 1000);
                }

                function onPlayerStateChange(event) {
                    if (event.data == YT.PlayerState.ENDED) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'ended'
                        }));
                    }
                }
            </script>
        </body>
        </html>
    `;

    const handleMessage = (event) => {
        try {
            const msgData = JSON.parse(event.nativeEvent.data);
            if (msgData.type === 'progress') {
                const percentage = msgData.duration > 0 ? (msgData.currentTime / msgData.duration) * 100 : 0;
                if (onProgress) {
                    onProgress(percentage);
                }
            } else if (msgData.type === 'ended') {
                if (onProgress) {
                    onProgress(100);
                }
            }
        } catch (e) {
            console.log('Error parsing player message:', e);
        }
    };

    return (
        <View style={[styles.videoPlayer, { overflow: 'hidden', height: isLargeScreen ? 420 : 250, marginBottom: isLargeScreen ? 16 : 6 }]}>
            {error && (
                <View style={styles.webViewErrorContainer}>
                    <Text style={styles.webViewErrorText}>
                        {t('Failed to load video')}
                    </Text>
                    <TouchableOpacity
                        style={styles.webViewRetryBtn}
                        onPress={() => {
                            setError(false);
                            webViewRef.current?.reload();
                        }}
                    >
                        <Text style={styles.webViewRetryBtnText}>
                            {t('Retry')}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            {Platform.OS === 'web' ? (
                <iframe
                    ref={iframeRef}
                    src={webEmbedUrl}
                    onLoad={startListeningToIframe}
                    style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: htmlContent }}
                    style={styles.webView}
                    allowsFullscreenVideo={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    onMessage={handleMessage}
                    renderLoading={() => (
                        <View style={styles.webViewLoadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    )}
                    onError={() => {
                        setError(true);
                    }}
                />
            )}
        </View>
    );
};

export default ExerciseVideoPlayer;
