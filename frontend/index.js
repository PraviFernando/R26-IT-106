import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// ─── Suppress known react-native-web deprecation warnings (web only) ─────────
// These warnings come from third-party library code (react-navigation, chart-kit,
// etc.) and cannot be fixed in user code. They are harmless console noise.
if (Platform.OS === 'web') {
    const SUPPRESSED = [
        'shadow*',
        'textShadow*',
        'pointerEvents',
        'Invalid DOM property',
        'React does not recognize',
        'Failed prop type',
        'Expo AV has been deprecated',
    ];
    const _warn = console.warn.bind(console);
    const _error = console.error.bind(console);
    const shouldSuppress = (args) => {
        const fullMsg = args.map((a) => (typeof a === 'object' ? (a?.message || JSON.stringify(a)) : String(a))).join(' ');
        return SUPPRESSED.some((s) => fullMsg.includes(s));
    };

    console.warn = (...args) => { if (!shouldSuppress(args)) _warn(...args); };
    console.error = (...args) => { if (!shouldSuppress(args)) _error(...args); };
}
// ─────────────────────────────────────────────────────────────────────────────

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
