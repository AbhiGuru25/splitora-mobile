/**
 * AppContainer - Consistent screen wrapper with premium background gradient.
 * Uses plain View (not SafeAreaView) since tab navigator handles safe area.
 */
import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
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
            <View style={[styles.container, !noPadding && styles.padded, style]}>
                {children}
            </View>
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
