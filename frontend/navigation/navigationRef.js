import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

// Shared ref so non-component code (e.g. the axios 401 handler) can navigate.
export const navigationRef = createNavigationContainerRef();

export function resetToLogin() {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
        );
    }
}
