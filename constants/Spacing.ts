/**
 * Spacing System
 * Consistent spacing values for margins and padding
 */

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
} as const;

/**
 * Common spacing patterns
 */
export const SpacingPresets = {
    screen: {
        horizontal: Spacing.lg,  // 24px
        vertical: Spacing.lg,    // 24px
    },

    card: {
        padding: Spacing.lg,     // 24px
        margin: Spacing.md,      // 16px
        gap: Spacing.md,         // 16px between cards
    },

    section: {
        marginBottom: Spacing.lg, // 24px
        gap: Spacing.sm,          // 8px between items
    },

    button: {
        padding: {
            horizontal: Spacing.lg, // 24px
            vertical: Spacing.md,   // 16px
        },
    },
} as const;
