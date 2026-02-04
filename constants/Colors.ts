const tintColorLight = '#38BDF8';
const tintColorDark = '#38BDF8';

export const Colors = {
    light: {
        text: '#020617', // Slate 950 - Absolute black/blue for max contrast
        textSecondary: '#475569', // Slate 600
        textMuted: '#94A3B8', // Slate 400
        background: '#FFFFFF', // Pure White
        tint: tintColorLight,
        icon: '#475569', // Slate 600
        tabIconDefault: '#94A3B8',
        tabIconSelected: tintColorLight,
        primary: '#0EA5E9', // Sky 500
        accent: '#0D9488', // Teal 600 - slightly darker for white bg
        surface: '#FFFFFF', // White cards on White BG (requires border/shadow)
        surfaceHighlight: '#F8FAFC', // Slate 50
        border: '#E2E8F0', // Slate 200 - crisp borders
        cardHighlight: '#F1F5F9', // Slate 100
        danger: '#EF4444',
        success: '#10B981',
    },
    dark: {
        text: '#F8FAFC', // Slate 50 - nearly white
        textSecondary: '#94A3B8', // Slate 400
        textMuted: '#64748B', // Slate 500
        background: '#0F172A', // Slate 900 - deep blue-grey, better than pure black
        tint: tintColorDark,
        icon: '#94A3B8',
        tabIconDefault: '#94A3B8',
        tabIconSelected: tintColorDark,
        primary: '#38BDF8', // Sky 400 - bright and visible
        accent: '#2DD4BF', // Teal 400
        surface: '#1E293B', // Slate 800 - distinct from background
        surfaceHighlight: '#334155', // Slate 700
        border: 'rgba(56, 189, 248, 0.2)', // Slightly stronger border
        cardHighlight: 'rgba(56, 189, 248, 0.1)',
        danger: '#F87171', // Red 400 - lighter for dark mode
        success: '#34D399', // Emerald 400
    },
};

export const Gradients = {
    primary: ['#38BDF8', '#2DD4BF'] as const,
    card: ['#121A2B', '#1e293b'] as const,
};
