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
            {/* Gradient Icon Container */}
            <LinearGradient
                colors={
                    activeColorScheme === 'dark'
                        ? ['rgba(56, 189, 248, 0.2)', 'rgba(45, 212, 191, 0.1)']
                        : ['rgba(56, 189, 248, 0.15)', 'rgba(45, 212, 191, 0.08)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
            >
                <Ionicons name={icon} size={72} color={theme.primary} />
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
                        ? 'rgba(56, 189, 248, 0.1)'
                        : theme.cardHighlight,
                    borderColor: theme.border
                }]}>
                    <Ionicons name="bulb-outline" size={16} color={theme.primary} style={styles.tipIcon} />
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
        padding: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: Typography.size.headline,
        fontWeight: Typography.weight.bold,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.size.body,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        lineHeight: Typography.size.body * Typography.lineHeight.relaxed,
        paddingHorizontal: Spacing.md,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: Spacing.lg,
        maxWidth: 320,
    },
    tipIcon: {
        marginRight: Spacing.sm,
    },
    tipText: {
        fontSize: Typography.size.caption,
        flex: 1,
        lineHeight: Typography.size.caption * Typography.lineHeight.normal,
    },
    button: {
        minWidth: 200,
        marginTop: Spacing.sm,
    }
});
