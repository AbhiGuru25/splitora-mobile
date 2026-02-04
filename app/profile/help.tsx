import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppCard from '@/components/ui/AppCard';

export default function HelpSupportScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

    const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
        <AppCard style={styles.card}>
            <Text style={[styles.question, { color: theme.text }]}>{question}</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>{answer}</Text>
        </AppCard>
    );

    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@splitora.app?subject=Support Request');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Help & Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <AppCard style={styles.contactCard} onPress={handleEmailSupport}>
                    <View style={styles.contactInner}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
                            <Ionicons name="mail" size={24} color="white" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={[styles.contactTitle, { color: theme.text }]}>Contact Support</Text>
                            <Text style={[styles.contactSubtitle, { color: theme.textSecondary }]}>
                                We usually respond within 24 hours
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={theme.textMuted} />
                    </View>
                </AppCard>

                <Text style={[styles.sectionHeader, { color: theme.primary }]}>Frequently Asked Questions</Text>

                <FAQItem
                    question="How do I split an expense?"
                    answer="Go to a group, tap the '+' button, enter the amount, and choose how to split it among members."
                />

                <FAQItem
                    question="Can I add people who don't have the app?"
                    answer="Yes! You can add ghost members to your group. However, they won't be able to see details until they sign up with that email."
                />

                <FAQItem
                    question="How is my data secured?"
                    answer="We use industry-standard encryption and Row Level Security to ensure only you and your group members can access your data."
                />

                <FAQItem
                    question="Is Splitora free?"
                    answer="Splitora is currently free to use with all core features included."
                />

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
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        marginBottom: 16,
        padding: 16,
    },
    question: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    answer: {
        fontSize: 14,
        lineHeight: 22,
    },
    contactCard: {
        marginBottom: 32,
        padding: 0,
    },
    contactInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    contactSubtitle: {
        fontSize: 13,
    },
});
