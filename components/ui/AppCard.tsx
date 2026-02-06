import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, useColorScheme, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

interface AppCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    delay?: number;
    onPress?: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

import { useTheme } from '@/lib/context/ThemeContext';

export default function AppCard({ children, style, delay = 0, onPress }: AppCardProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 200 })); // Snappier 200ms
        translateY.value = withDelay(delay, withTiming(0, { duration: 200 }));
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const cardStyle = [
        styles.card,
        {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: theme.primary,
        },
        animatedStyle,
        style
    ];

    if (onPress) {
        return (
            <AnimatedTouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
                {children}
            </AnimatedTouchableOpacity>
        );
    }

    return (
        <Animated.View style={cardStyle}>
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        // Enhanced shadow for "White on White" visibility
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, // Subtle but visible
        shadowRadius: 16,
        elevation: 3,
        marginBottom: 16,
    },
});
