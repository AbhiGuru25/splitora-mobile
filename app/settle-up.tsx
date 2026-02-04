import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '@/components/ui/EmptyState';
import { useRouter } from 'expo-router';

export default function SettleUpScreen() {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Settle Up</Text>
            </View>
            <EmptyState
                title="You're all settled up!"
                subtitle="You don't owe anyone anything at the moment."
                icon="checkmark-circle-outline"
                buttonText="Go Home"
                onPress={() => router.replace('/(tabs)')}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
});
