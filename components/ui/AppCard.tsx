import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Spacing, Radius } from '@/constants/Layout';
import { useTheme } from '@/lib/context/ThemeContext';

interface AppCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    delay?: number;
    onPress?: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function AppCard({ children, style, delay = 0, onPress }: AppCardProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    // Fade-in animation
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(16);

    // Scale-on-press
    const scale = useSharedValue(1);
    const shadowOpacityVal = useSharedValue(0.08);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 150 }));
        translateY.value = withDelay(delay, withTiming(0, { duration: 150 }));
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        shadowOpacity: shadowOpacityVal.value,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        shadowOpacityVal.value = withTiming(0.15, { duration: 120 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        shadowOpacityVal.value = withTiming(0.08, { duration: 120 });
    };

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
            <AnimatedTouchableOpacity
                style={cardStyle}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
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
        borderRadius: Radius.card,
        padding: Spacing.card,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
        // No default marginBottom — parent controls spacing via gap
    },
});
