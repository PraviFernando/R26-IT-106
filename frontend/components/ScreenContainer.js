// components/ScreenContainer.js
//
// The standard screen shell. Handles: safe-area insets (per-edge), an optional
// full-bleed LinearGradient background, an optional header/footer rendered
// full-width OUTSIDE the scroll area, an internal ScrollView (or a plain View),
// optional KeyboardAvoidingView, and — the important part — a centered
// `maxWidth` content column so screens don't stretch edge-to-edge on tablets.
//
// Structural rule: the background + header + footer are ALWAYS 100% width.
// Only the scroll/content body is constrained by <ContentWell>. Never put
// maxWidth on the background.
//
//   <ScreenContainer gradient={['#F8F4FF', '#FFF0F8']} tabBar>
//     ...page content...
//   </ScreenContainer>
//
//   <ScreenContainer edges={['top', 'bottom']} maxWidth="reading" keyboardAvoiding>
//     ...form...
//   </ScreenContainer>
//
// For FlatList screens use `scroll={false}` and feed the list
// `useListContainerStyle(...)`.
//
import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useResponsive } from '../hooks/useResponsive';

// The centered content column. Exported for use inside a FlatList
// ListHeaderComponent, a Modal, or a per-item render.
export function ContentWell({ maxWidth = 'wide', padded = true, style, children }) {
  const { contentMaxWidth, hPad } = useResponsive();
  return (
    <View
      style={[
        styles.well,
        { maxWidth: contentMaxWidth(maxWidth) },
        padded && { paddingHorizontal: hPad },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// contentContainerStyle (+ grid props) for a FlatList so it gets the same
// centered well + tab-bar-aware bottom padding without being wrapped.
//
//   const list = useListContainerStyle({ tabBar: true, grid: { minTile: 150 } });
//   <FlatList {...list} data={...} renderItem={...} />
export function useListContainerStyle({
  maxWidth = 'wide',
  padded = true,
  tabBar = false,
  extraBottom = 16,
  grid, // { minTile, gap?, maxCols? }  -> adds numColumns / key / columnWrapperStyle
} = {}) {
  const r = useResponsive();
  const bottom = (tabBar ? r.tabBarSpace : r.insets.bottom) + extraBottom;

  const out = {
    contentContainerStyle: {
      width: '100%',
      maxWidth: r.contentMaxWidth(maxWidth),
      alignSelf: 'center',
      paddingHorizontal: padded ? r.hPad : 0,
      paddingBottom: bottom,
      flexGrow: 1,
    },
  };

  if (grid) {
    const gap = grid.gap ?? 12;
    const cols = r.gridColumns(grid.minTile, gap, grid.maxCols ?? 6);
    out.numColumns = cols;
    out.key = `cols-${cols}`; // RN throws if numColumns changes without a new key
    if (cols > 1) out.columnWrapperStyle = { gap };
    out.tileWidth = r.tileWidth(cols, gap);
    out.columns = cols;
  }

  return out;
}

export default function ScreenContainer({
  gradient = false,
  edges = ['top'],
  header,
  footer,
  scroll = true,
  keyboardAvoiding = false,
  maxWidth = 'wide',
  padded = true,
  tabBar = false,
  extraBottom = 16,
  contentContainerStyle,
  style,
  refreshControl,
  scrollRef,
  bounces,
  onScroll,
  scrollEventThrottle,
  keyboardShouldPersistTaps = 'handled',
  children,
}) {
  const { insets, tabBarSpace, contentMaxWidth, hPad } = useResponsive();

  const bottomPad = (tabBar ? tabBarSpace : insets.bottom) + extraBottom;

  const well = (
    <View
      style={[
        styles.well,
        { maxWidth: contentMaxWidth(maxWidth) },
        padded && { paddingHorizontal: hPad },
        !scroll && styles.fill,
      ]}
    >
      {children}
    </View>
  );

  let body = scroll ? (
    <ScrollView
      ref={scrollRef}
      style={styles.fill}
      refreshControl={refreshControl}
      bounces={bounces}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        { flexGrow: 1, paddingBottom: bottomPad },
        contentContainerStyle,
      ]}
    >
      {well}
    </ScrollView>
  ) : (
    <View style={[styles.fill, footer ? null : { paddingBottom: bottomPad }]}>
      {well}
    </View>
  );

  if (keyboardAvoiding) {
    body = (
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  const inner = (
    <SafeAreaView style={styles.fill} edges={edges}>
      {header}
      {body}
      {footer}
    </SafeAreaView>
  );

  if (gradient) {
    return (
      <LinearGradient colors={gradient} style={styles.fill}>
        {inner}
      </LinearGradient>
    );
  }

  return <View style={[styles.fill, style]}>{inner}</View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  well: { width: '100%', alignSelf: 'center' },
});
