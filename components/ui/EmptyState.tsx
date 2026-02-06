import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { useTheme } from '@/lib/context/ThemeContext';
import Button from './Button';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
    title: string;
    subtitle: string;
    buttonText?: string;
    onPress?: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    helpText?: string; // Optional helpful tip
}

export default function EmptyState({
    title,
    subtitle,
    buttonText,
    onPress,
    icon = 'planet-outline',
    helpText
}: EmptyStateProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    return (
        <View style={styles.container}>
            {/* Compact Icon - Subtle & Professional */}
            <LinearGradient
                colors={
                    activeColorScheme === 'dark'
                        ? ['rgba(56, 189, 248, 0.15)', 'rgba(45, 212, 191, 0.08)']
                        : ['rgba(56, 189, 248, 0.1)', 'rgba(45, 212, 191, 0.05)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
            >
                <Ionicons name={icon} size={48} color={theme.primary} style={{ opacity: 0.8 }} />
            </LinearGradient>

            {/* Title */}
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

            {/* Subtitle */}
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {subtitle}
            </Text>

            {/* Helpful Tip (Optional) */}
            {helpText && (
                <View style={[styles.tipContainer, {
                    backgroundColor: activeColorScheme === 'dark'
                        ? 'rgba(56, 189, 248, 0.08)' : theme.cardHighlight,
                    borderColor: theme.border
                }]}>
                    <Ionicons name="bulb-outline" size={14} color={theme.primary} style={styles.tipIcon} />
                    <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                        {helpText}
                    </Text>
                </View>
            )}

            {/* Action Button */}
            {buttonText && onPress && (
                <Button
                    title={buttonText}
                    onPress={onPress}
                    style={styles.button}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200, // Reduced from 300
    },
    iconContainer: {
        width: 80, // Reduced from 140px
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 18, // Fixed size instead of Typography.size.subheadline
        fontWeight: Typography.weight.semibold, // Lighter weight
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.size.caption, // Smaller, more subtle
        textAlign: 'center',
        marginBottom: Spacing.md,
        lineHeight: Typography.size.caption * 1.4,
        paddingHorizontal: Spacing.sm,
        opacity: 0.8,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: Spacing.md,
        maxWidth: 280,
    },
    tipIcon: {
        marginRight: Spacing.xs,
    },
    tipText: {
        fontSize: 11, // Very subtle
        flex: 1,
        lineHeight: 14,
    },
    button: {
        minWidth: 180,
        marginTop: Spacing.xs,
    }
});
