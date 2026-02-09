import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';

interface InsightCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string;
    subtext?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
}

export default function InsightCard({
    icon,
    title,
    value,
    subtext,
    trend,
    color
}: InsightCardProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    const trendColor = trend === 'up' ? '#FF6B6B' : trend === 'down' ? '#4ECDC4' : theme.textSecondary;
    const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : undefined;

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: color || theme.primary + '20' }]}>
                <Ionicons name={icon} size={20} color={color || theme.primary} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
                <View style={styles.valueRow}>
                    <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
                    {trendIcon && (
                        <View style={styles.trendContainer}>
                            <Ionicons name={trendIcon} size={14} color={trendColor} />
                            {subtext && (
                                <Text style={[styles.subtext, { color: trendColor }]}>{subtext}</Text>
                            )}
                        </View>
                    )}
                </View>
                {!trendIcon && subtext && (
                    <Text style={[styles.subtext, { color: theme.textSecondary }]}>{subtext}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    subtext: {
        fontSize: 12,
    },
});
