// navigation/tabBarLayout.js
// Height of the visible custom tab-bar pill (wrapper paddingTop + bar padding +
// active chip), EXCLUDING the bottom safe-area inset. The bar in AppNavigator is
// position:'absolute', so screens can't measure it — they add
// `TAB_BAR_BASE_HEIGHT + insets.bottom` (exposed as `tabBarSpace` from
// useResponsive) as bottom padding on their scroll content.
export const TAB_BAR_BASE_HEIGHT = 74;
