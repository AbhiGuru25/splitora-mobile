/**
 * Typography System
 * Consistent text sizes and styles across the app
 */

export const Typography = {
    // Font Sizes
    size: {
        hero: 34,      // Main titles (Dashboard, Group names)
        title: 28,     // Section headers
        headline: 22,  // Card titles, prominent text
        body: 16,      // Primary text, descriptions
        caption: 14,   // Secondary text, metadata
        label: 12,     // Small labels, badges
    },

    // Font Weights
    weight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    // Line Heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
} as const;

/**
 * Common text style presets
 */
export const TextStyles = {
    hero: {
        fontSize: Typography.size.hero,
        fontWeight: Typography.weight.bold,
        lineHeight: Typography.size.hero * Typography.lineHeight.tight,
    },

    h1: {
        fontSize: Typography.size.title,
        fontWeight: Typography.weight.bold,
        lineHeight: Typography.size.title * Typography.lineHeight.tight,
    },

    h2: {
        fontSize: Typography.size.headline,
        fontWeight: Typography.weight.semibold,
        lineHeight: Typography.size.headline * Typography.lineHeight.normal,
    },

    body: {
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.regular,
        lineHeight: Typography.size.body * Typography.lineHeight.normal,
    },

    bodyBold: {
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.semibold,
        lineHeight: Typography.size.body * Typography.lineHeight.normal,
    },

    caption: {
        fontSize: Typography.size.caption,
        fontWeight: Typography.weight.regular,
        lineHeight: Typography.size.caption * Typography.lineHeight.normal,
    },

    label: {
        fontSize: Typography.size.label,
        fontWeight: Typography.weight.medium,
        lineHeight: Typography.size.label * Typography.lineHeight.normal,
    },
} as const;
