import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppCard from '@/components/ui/AppCard';

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

    const [expenseAlerts, setExpenseAlerts] = useState(true);
    const [groupInvites, setGroupInvites] = useState(true);
    const [monthlyReports, setMonthlyReports] = useState(false);
    const [marketingUpdates, setMarketingUpdates] = useState(false);

    const NotificationItem = ({ title, description, value, onValueChange }: any) => (
        <AppCard style={styles.card}>
            <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>
                        {description}
                    </Text>
                </View>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={theme.background}
                />
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionHeader, { color: theme.primary }]}>Activity</Text>

                <NotificationItem
                    title="Expense Alerts"
                    description="Get notified when you are added to an expense."
                    value={expenseAlerts}
                    onValueChange={setExpenseAlerts}
                />

                <NotificationItem
                    title="Group Invites"
                    description="Receive alerts when someone invites you to a group."
                    value={groupInvites}
                    onValueChange={setGroupInvites}
                />

                <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 24 }]}>Updates</Text>

                <NotificationItem
                    title="Monthly Reports"
                    description="Summary of your spending activity each month."
                    value={monthlyReports}
                    onValueChange={setMonthlyReports}
                />

                <NotificationItem
                    title="Product Updates"
                    description="News about new features and improvements."
                    value={marketingUpdates}
                    onValueChange={setMarketingUpdates}
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
});
