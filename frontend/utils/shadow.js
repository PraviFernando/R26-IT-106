/**
 * shadowStyle(color, x, y, blur, opacity, elevation)
 *
 * Returns a cross-platform shadow style object.
 * - On web:    uses `boxShadow` CSS property (avoids deprecated shadow* props)
 * - On native: uses iOS shadow* props + Android elevation
 *
 * Usage:
 *   import { shadowStyle } from '../utils/shadow';
 *   const styles = StyleSheet.create({
 *     card: { ...shadowStyle('#000', 0, 2, 6, 0.08, 3) }
 *   });
 */
import { Platform } from 'react-native';

export function shadowStyle(
    color = '#000',
    offsetX = 0,
    offsetY = 2,
    blurRadius = 6,
    opacity = 0.1,
    elevation = 3,
) {
    if (Platform.OS === 'web') {
        // Parse hex color to rgba
        let r = 0, g = 0, b = 0;
        const hex = color.replace('#', '');
        if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        }
        return {
            boxShadow: `${offsetX}px ${offsetY}px ${blurRadius}px rgba(${r},${g},${b},${opacity})`,
        };
    }
    return {
        shadowColor: color,
        shadowOffset: { width: offsetX, height: offsetY },
        shadowOpacity: opacity,
        shadowRadius: blurRadius,
        elevation,
    };
}

// Common presets
export const shadows = {
    none: {},
    xs: (color = '#000') => shadowStyle(color, 0, 1, 3, 0.06, 1),
    sm: (color = '#000') => shadowStyle(color, 0, 1, 4, 0.07, 2),
    md: (color = '#000') => shadowStyle(color, 0, 2, 6, 0.1, 3),
    lg: (color = '#000') => shadowStyle(color, 0, 4, 12, 0.15, 6),
    xl: (color = '#000') => shadowStyle(color, 0, 6, 16, 0.2, 10),
    sidebar: (color = '#000') => shadowStyle(color, 4, 0, 20, 0.2, 10),
};
