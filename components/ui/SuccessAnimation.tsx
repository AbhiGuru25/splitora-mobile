import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    ZoomIn,
    RotateInUpLeft
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';

interface SuccessAnimationProps {
    visible: boolean;
    variant?: 'checkmark' | 'celebration';
}

export default function SuccessAnimation({ visible, variant = 'checkmark' }: SuccessAnimationProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    if (!visible) return null;

    if (variant === 'celebration') {
        return (
            <Animated.View
                entering={ZoomIn.duration(400)}
                exiting={FadeOut.duration(200)}
                style={[styles.container, styles.celebration]}
            >
                <Ionicons name="happy-outline" size={80} color={theme.success} />
            </Animated.View>
        );
    }

    return (
        <Animated.View
            entering={ZoomIn.springify().damping(15)}
            exiting={FadeOut.duration(200)}
            style={[styles.container, {
                backgroundColor: activeColorScheme === 'dark'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(16, 185, 129, 0.15)'
            }]}
        >
            <Animated.View
                entering={RotateInUpLeft.delay(100)}
            >
                <Ionicons name="checkmark-circle" size={80} color={theme.success} />
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        zIndex: 1000,
    },
    celebration: {
        backgroundColor: 'transparent',
    },
});
