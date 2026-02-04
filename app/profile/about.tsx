import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppCard from '@/components/ui/AppCard';

export default function AboutScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>About</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoContainer}>
                    <Text style={[styles.logo, { color: theme.text }]}>💎</Text>
                    <Text style={[styles.appName, { color: theme.text }]}>Splitora</Text>
                    <Text style={[styles.version, { color: theme.textSecondary }]}>Version 1.0.0</Text>
                </View>

                <AppCard style={styles.card}>
                    <Text style={[styles.description, { color: theme.text }]}>
                        Splitora makes it easy to split expenses with friends and family. Track bills, shared costs, and settle up effortlessly.
                    </Text>
                </AppCard>

                <AppCard style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Credits</Text>
                    <Text style={[styles.text, { color: theme.textSecondary }]}>
                        Designed and developed with ❤️ using React Native and Supabase.
                    </Text>
                </AppCard>

                <AppCard style={styles.card} onPress={() => Linking.openURL('https://splitora.app/privacy')}>
                    <View style={styles.row}>
                        <Text style={[styles.link, { color: theme.primary }]}>Privacy Policy</Text>
                        <Ionicons name="open-outline" size={20} color={theme.primary} />
                    </View>
                </AppCard>

                <AppCard style={styles.card} onPress={() => Linking.openURL('https://splitora.app/terms')}>
                    <View style={styles.row}>
                        <Text style={[styles.link, { color: theme.primary }]}>Terms of Service</Text>
                        <Ionicons name="open-outline" size={20} color={theme.primary} />
                    </View>
                </AppCard>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    logo: {
        fontSize: 64,
        marginBottom: 8,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    version: {
        fontSize: 16,
    },
    card: {
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    text: {
        fontSize: 16,
        lineHeight: 22,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    link: {
        fontSize: 16,
        fontWeight: '600',
    }
});
