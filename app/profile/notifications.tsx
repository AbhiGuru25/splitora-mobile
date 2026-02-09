import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppCard from '@/components/ui/AppCard';
import { notificationService, NotificationPreferences } from '@/lib/notifications';
import { haptics } from '@/lib/utils/haptics';

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        expense_alerts: true,
        group_invites: true,
        settlement_reminders: true,
        monthly_reports: false,
        marketing_updates: false,
    });

    // Load preferences on mount
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        setLoading(true);
        const prefs = await notificationService.getPreferences();
        if (prefs) {
            setPreferences(prefs);
        }
        setLoading(false);
    };

    const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
        haptics.selection();

        // Optimistic update
        setPreferences(prev => ({ ...prev, [key]: value }));
        setSaving(true);

        const success = await notificationService.updatePreferences({ [key]: value });

        if (!success) {
            // Revert on failure
            setPreferences(prev => ({ ...prev, [key]: !value }));
            alert('Failed to save preference');
        }

        setSaving(false);
    };

    const NotificationItem = ({
        title,
        description,
        preferenceKey
    }: {
        title: string;
        description: string;
        preferenceKey: keyof NotificationPreferences;
    }) => (
        <AppCard style={styles.card}>
            <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>
                        {description}
                    </Text>
                </View>
                <Switch
                    value={preferences[preferenceKey]}
                    onValueChange={(value) => updatePreference(preferenceKey, value)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={theme.background}
                    disabled={loading || saving}
                />
            </View>
        </AppCard>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                        Loading preferences...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
                <View style={{ width: 24 }}>
                    {saving && <ActivityIndicator size="small" color={theme.primary} />}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionHeader, { color: theme.primary }]}>Activity</Text>

                <NotificationItem
                    title="Expense Alerts"
                    description="Get notified when you are added to an expense."
                    preferenceKey="expense_alerts"
                />

                <NotificationItem
                    title="Group Invites"
                    description="Receive alerts when someone invites you to a group."
                    preferenceKey="group_invites"
                />

                <NotificationItem
                    title="Settlement Reminders"
                    description="Reminder when you have pending settlements."
                    preferenceKey="settlement_reminders"
                />

                <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 24 }]}>Updates</Text>

                <NotificationItem
                    title="Monthly Reports"
                    description="Summary of your spending activity each month."
                    preferenceKey="monthly_reports"
                />

                <NotificationItem
                    title="Product Updates"
                    description="News about new features and improvements."
                    preferenceKey="marketing_updates"
                />

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                        Your preferences are saved automatically and synced across all your devices.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
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
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        marginBottom: 16,
        padding: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemInfo: {
        flex: 1,
        paddingRight: 16,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
    },
});
