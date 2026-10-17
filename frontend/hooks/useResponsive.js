// hooks/useResponsive.js
//
// The one responsive primitive for the app. Everything layout-related that used
// to read a module-level `Dimensions.get('window')` should read this hook
// instead, so values stay correct on rotation, iPad Split View / Slide Over,
// and Android multi-window.
//
//   const r = useResponsive();
//   <View style={{ maxWidth: r.contentMaxWidth('wide'), alignSelf: 'center' }} />
//   const cols = r.gridColumns(150);           // 2 on a phone, 3-4 on an iPad
//   fontSize: r.scale(9, { min: 11 })          // legible floor for micro labels
//
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_BASE_HEIGHT } from '../navigation/tabBarLayout';

// Width classes (dp). One real breakpoint at 700: portrait-locked phones top out
// ~430dp, the smallest iPad is 744dp portrait. The only thing between ~510 and
// 744 is an iPad in a wide split-view, which *should* use the phone layout.
export const BP = { largePhone: 400, tablet: 700 };

// Centered content-well caps.
const MAX_READING = 560; // prose / forms / chat / detail screens
const MAX_WIDE = 760;     // dashboards / card grids

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const isTablet = width >= BP.tablet;
    const isLargePhone = width >= BP.largePhone && width < BP.tablet;
    const isCompact = width < BP.largePhone;
    const landscape = width > height;

    // Design-size multiplier. Layered ON TOP of the OS text-scale setting
    // (leave allowFontScaling default-on). Gentle on purpose.
    const fontFactor = isTablet ? 1.12 : isCompact ? 0.96 : 1;
    const scale = (n, { min = 0, max = Infinity } = {}) =>
      Math.round(Math.min(max, Math.max(min, n * fontFactor)));

    const hPad = isTablet ? 24 : 16;

    // kind: 'reading' | 'wide' | number
    const contentMaxWidth = (kind = 'wide') => {
      if (typeof kind === 'number') return Math.min(width, kind);
      const cap = kind === 'reading' ? MAX_READING : MAX_WIDE;
      return Math.min(width, cap);
    };
    // Usable width INSIDE the centered content well (i.e. minus hPad on both sides).
    // This is what grids/tiles actually get to lay out in.
    const contentInnerWidth = (kind = 'wide') => contentMaxWidth(kind) - hPad * 2;

    // How many `minTile`-wide columns fit in `containerWidth` (default: the wide
    // content well's inner width). Never < 1. Replaces every `(width - N) / 2`
    // and numColumns={4}.
    const gridColumns = (minTile, gap = 12, maxCols = 6, containerWidth) => {
      const w = containerWidth ?? contentInnerWidth('wide');
      const cols = Math.floor((w + gap) / (minTile + gap));
      return Math.max(1, Math.min(maxCols, cols));
    };

    // Tile px for a given column count inside `containerWidth`.
    const tileWidth = (columns, gap = 12, containerWidth) => {
      const w = containerWidth ?? contentInnerWidth('wide');
      return Math.floor((w - gap * (columns - 1)) / columns);
    };

    return {
      width,
      height,
      landscape,
      insets,
      isTablet,
      isLargePhone,
      isCompact,
      breakpoint: isTablet ? 'tablet' : isLargePhone ? 'largePhone' : 'phone',
      contentMaxWidth,
      contentInnerWidth,
      gridColumns,
      tileWidth,
      scale,
      // Bottom padding a scroll/list must leave so the absolute custom tab bar
      // never covers content. Screens WITHOUT the tab bar use insets.bottom.
      tabBarSpace: TAB_BAR_BASE_HEIGHT + insets.bottom,
      // Standard screen horizontal padding.
      hPad,
    };
  }, [width, height, insets.top, insets.bottom, insets.left, insets.right]);
}

export default useResponsive;
