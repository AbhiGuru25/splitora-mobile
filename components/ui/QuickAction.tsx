import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { useTheme } from '@/lib/context/ThemeContext';
import { haptics } from '@/lib/utils/haptics';

interface QuickActionProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
}

export default function QuickAction({ icon, label, onPress, variant = 'secondary' }: QuickActionProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    const handlePress = () => {
        haptics.light();
        onPress();
    };

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={handlePress}
                style={styles.container}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#0EA5E9', '#0D9488']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryButton}
                >
                    <Ionicons name={icon} size={24} color="white" />
                    <Text style={styles.primaryLabel}>{label}</Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.container, styles.secondaryButton, {
                backgroundColor: theme.surface,
                borderColor: theme.border,
            }]}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, {
                backgroundColor: activeColorScheme === 'dark'
                    ? 'rgba(14, 165, 233, 0.15)'
                    : 'rgba(14, 165, 233, 0.1)'
            }]}>
                <Ionicons name={icon} size={20} color={theme.primary} />
            </View>
            <Text style={[styles.secondaryLabel, { color: theme.text }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 80,
    },
    primaryButton: {
        flex: 1,
        borderRadius: 16,
        padding: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    primaryLabel: {
        color: 'white',
        fontSize: Typography.size.caption,
        fontWeight: Typography.weight.semibold,
    },
    secondaryButton: {
        borderRadius: 16,
        padding: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        borderWidth: 1,
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryLabel: {
        fontSize: Typography.size.caption,
        fontWeight: Typography.weight.semibold,
    },
});
