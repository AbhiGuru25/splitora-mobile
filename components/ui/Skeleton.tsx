import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export default function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0, { duration: 1000 })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            shimmer.value,
            [0, 1],
            [0.3, 0.6]
        );

        return {
            opacity,
        };
    });

    return (
        <View style={[styles.container, style]}>
            <Animated.View
                style={[
                    styles.skeleton,
                    {
                        width,
                        height,
                        borderRadius,
                        backgroundColor: activeColorScheme === 'dark'
                            ? theme.surfaceHighlight
                            : theme.border,
                    },
                    animatedStyle,
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    skeleton: {
        // Base styles applied via props
    },
});
