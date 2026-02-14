/**
 * Haptics Utility
 * Centralized haptic feedback functions.
 * All calls wrapped in try-catch for web safety.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

const safeHaptic = (fn: () => void) => {
    if (!isNative) return;
    try {
        fn();
    } catch (e) {
        // Silently fail on web or unsupported platforms
    }
};

export const haptics = {
    /** Light tap feedback for button presses */
    light: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

    /** Medium tap feedback for important actions */
    medium: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

    /** Heavy tap feedback for critical actions */
    heavy: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),

    /** Success feedback (e.g., expense added, settlement complete) */
    success: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

    /** Warning feedback */
    warning: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),

    /** Error feedback */
    error: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),

    /** Selection feedback for toggles and switches */
    selection: () => safeHaptic(() => Haptics.selectionAsync()),
};
