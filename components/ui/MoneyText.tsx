import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';

interface MoneyTextProps {
    amount: number;
    style?: StyleProp<TextStyle>;
    currencySymbol?: string;
    showSign?: boolean;
}

export default function MoneyText({ amount, style, currencySymbol = '₹', showSign = false }: MoneyTextProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    let color = theme.text;
    let sign = '';

    if (amount > 0) {
        color = theme.success; // Green for positive (Get back)
        sign = '+';
    } else if (amount < 0) {
        color = theme.danger; // Red for negative (You owe)
        sign = ''; // Negative number already has '-'
    }

    // Format number with commas
    const formattedAmount = Math.abs(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    const displayAmount = amount < 0 ? `-${currencySymbol}${formattedAmount}` : `${showSign && amount > 0 ? '+' : ''}${currencySymbol}${formattedAmount}`;

    return (
        <Text style={[{ color, fontWeight: '700', fontFamily: 'Inter_700Bold' }, style]}>
            {displayAmount}
        </Text>
    );
}
