import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';

interface SectionHeaderProps {
    title: string;
    actionText?: string;
    onAction?: () => void;
}

export default function SectionHeader({ title, actionText, onAction }: SectionHeaderProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            {actionText && onAction && (
                <TouchableOpacity onPress={onAction}>
                    <Text style={[styles.action, { color: theme.primary }]}>{actionText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    action: {
        fontSize: 14,
        fontWeight: '600',
    }
});
