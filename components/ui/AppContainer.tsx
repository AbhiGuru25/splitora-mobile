/**
 * AppContainer - Consistent screen wrapper with premium background gradient.
 * Use this to wrap all tab screens for consistent padding + depth.
 */
import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/context/ThemeContext';
import { BackgroundGradient, Spacing } from '@/constants/Layout';

interface AppContainerProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    /** Skip horizontal padding (for full-bleed content) */
    noPadding?: boolean;
}

export default function AppContainer({ children, style, noPadding }: AppContainerProps) {
    const { activeColorScheme } = useTheme();
    const gradientColors = BackgroundGradient[activeColorScheme];

    return (
        <LinearGradient
            colors={gradientColors}
            style={styles.gradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            <SafeAreaView style={[styles.container, !noPadding && styles.padded, style]}>
                {children}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    padded: {
        paddingHorizontal: Spacing.screen,
    },
});
