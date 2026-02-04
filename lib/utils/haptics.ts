/**
 * Haptics Utility
 * Centralized haptic feedback functions
 */

import * as Haptics from 'expo-haptics';

export const haptics = {
    /**
     * Light tap feedback for button presses
     */
    light: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    /**
     * Medium tap feedback for important actions
     */
    medium: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },

    /**
     * Heavy tap feedback for critical actions
     */
    heavy: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    },

    /**
     * Success feedback (e.g., expense added, settlement complete)
     */
    success: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },

    /**
     * Warning feedback
     */
    warning: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    },

    /**
     * Error feedback
     */
    error: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },

    /**
     * Selection feedback for toggles and switches
     */
    selection: () => {
        Haptics.selectionAsync();
    },
};
