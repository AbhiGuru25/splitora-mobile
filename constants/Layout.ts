/**
 * Design System - Layout & Spacing Constants
 * Consistent vertical rhythm across the entire app.
 * Premium = consistent, not cramped.
 */

export const Spacing = {
    /** Screen horizontal padding */
    screen: 20,
    /** Section spacing (between major sections) */
    section: 24,
    /** Card internal padding */
    card: 14,
    /** Small gap (between related items) */
    sm: 8,
    /** Micro gap (labels, icon-to-text) */
    xs: 4,
    /** Medium gap */
    md: 12,
    /** Large gap */
    lg: 16,
} as const;

export const Radius = {
    /** Default card radius */
    card: 18,
    /** Small element radius */
    sm: 10,
    /** Pill/badge */
    pill: 20,
    /** Circle */
    full: 999,
} as const;

export const Typography = {
    /** Page title */
    title: { fontSize: 28, fontWeight: '700' as const },
    /** Section header */
    sectionHeader: { fontSize: 18, fontWeight: '700' as const },
    /** Card title */
    cardTitle: { fontSize: 16, fontWeight: '600' as const },
    /** Body text */
    body: { fontSize: 14, fontWeight: '400' as const },
    /** Caption/label */
    caption: { fontSize: 12, fontWeight: '500' as const },
    /** Stat value large */
    statLarge: { fontSize: 24, fontWeight: '700' as const },
    /** Stat value small */
    statSmall: { fontSize: 18, fontWeight: '700' as const },
    /** Tab label */
    tabLabel: { fontSize: 11, fontWeight: '600' as const },
} as const;

/** Background gradient for premium depth (never flat black) */
export const BackgroundGradient = {
    dark: ['#0A0F1C', '#0E1627'] as [string, string],
    light: ['#F8FAFC', '#EFF6FF'] as [string, string],
} as const;
