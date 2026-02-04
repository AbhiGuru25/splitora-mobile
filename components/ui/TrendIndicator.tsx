import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { useTheme } from '@/lib/context/ThemeContext';

interface TrendIndicatorProps {
    value: number; // Percentage change (positive or negative)
    label?: string; // Optional label like "vs last month"
}

export default function TrendIndicator({ value, label }: TrendIndicatorProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    const isPositive = value > 0;
    const isNeutral = value === 0;

    const getColor = () => {
        if (isNeutral) return theme.textMuted;
        return isPositive ? theme.success : theme.danger;
    };

    const getIcon = () => {
        if (isNeutral) return 'remove-outline';
        return isPositive ? 'trending-up' : 'trending-down';
    };

    return (
        <View style={styles.container}>
            <Ionicons
                name={getIcon()}
                size={14}
                color={getColor()}
                style={styles.icon}
            />
            <Text style={[styles.value, { color: getColor() }]}>
                {Math.abs(value).toFixed(0)}%
            </Text>
            {label && (
                <Text style={[styles.label, { color: theme.textMuted }]}>
                    {label}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    icon: {
        marginRight: 2,
    },
    value: {
        fontSize: Typography.size.label,
        fontWeight: Typography.weight.semibold,
    },
    label: {
        fontSize: Typography.size.label,
        marginLeft: Spacing.xs,
    },
});
