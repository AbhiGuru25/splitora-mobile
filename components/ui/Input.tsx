import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
    icon?: string; // We can add icon support later
}

export default function Input({ label, error, style, ...props }: InputProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
                {label}
            </Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: theme.surface,
                        color: theme.text,
                        borderColor: error ? theme.danger : theme.border,
                    },
                    style
                ]}
                placeholderTextColor={theme.textMuted}
                {...props}
            />
            {error && (
                <Text style={[styles.errorText, { color: theme.danger }]}>
                    {error}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
});
