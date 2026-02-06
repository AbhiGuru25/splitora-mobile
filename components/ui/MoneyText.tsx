import React, { useEffect } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';

interface MoneyTextProps {
    amount: number;
    style?: StyleProp<TextStyle>;
    currencySymbol?: string;
    showSign?: boolean;
    animate?: boolean; // Enable count-up animation
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export default function MoneyText({
    amount,
    style,
    currencySymbol = '₹',
    showSign = false,
    animate = false
}: MoneyTextProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    const animatedValue = useSharedValue(animate ? 0 : amount);

    useEffect(() => {
        if (animate) {
            animatedValue.value = withTiming(amount, {
                duration: 800,
                easing: Easing.out(Easing.cubic),
            });
        } else {
            animatedValue.value = amount;
        }
    }, [amount, animate]);

    let color = theme.text;
    let sign = '';

    if (amount > 0) {
        color = theme.success; // Green for positive (Get back)
        sign = '+';
    } else if (amount < 0) {
        color = theme.danger; // Red for negative (You owe)
        sign = ''; // Negative number already has '-'
    }

    const animatedProps = useAnimatedProps(() => {
        const currentValue = animatedValue.value;
        const formattedAmount = Math.abs(currentValue).toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0, // Whole numbers during animation
        });

        const displayAmount = currentValue < 0
            ? `-${currencySymbol}${formattedAmount}`
            : `${showSign && currentValue > 0 ? '+' : ''}${currencySymbol}${formattedAmount}`;

        return {
            text: displayAmount,
        } as any;
    });

    return (
        <AnimatedText
            animatedProps={animatedProps}
            style={[{ color, fontWeight: '700', fontFamily: 'Inter_700Bold' }, style]}
        />
    );
}
