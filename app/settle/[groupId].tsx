import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppCard from '@/components/ui/AppCard';
import MoneyText from '@/components/ui/MoneyText';
import Button from '@/components/ui/Button';
import { useBalances } from '@/lib/hooks/useBalances';

export default function SettleUpScreen() {
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];
    const { balances, settlements, loading, recordSettlement, refreshBalances } = useBalances(groupId);
    const [processingId, setProcessingId] = useState<string | null>(null);

    async function handleRecordSettlement(fromUser: string, toUser: string, amount: number, index: number) {
        Alert.alert(
            'Record Payment',
            `Confirm that ${settlements[index].from_user_name} paid ${settlements[index].to_user_name} ₹${amount.toFixed(2)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            setProcessingId(`${fromUser}-${toUser}`);
                            await recordSettlement(fromUser, toUser, amount);
                            Alert.alert('Success', 'Payment recorded successfully');
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to record payment');
                        } finally {
                            setProcessingId(null);
                        }
                    }
                }
            ]
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Settle Up</Text>
                <TouchableOpacity onPress={refreshBalances}>
                    <Ionicons name="refresh" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <AppCard style={styles.card}>
                        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                            Calculating balances...
                        </Text>
                    </AppCard>
                ) : settlements.length === 0 ? (
                    <AppCard style={styles.card}>
                        <View style={styles.emptyState}>
                            <Ionicons name="checkmark-circle" size={64} color={theme.success} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                                All Settled Up! 🎉
                            </Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                                No outstanding balances in this group
                            </Text>
                        </View>
                    </AppCard>
                ) : (
                    <>
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Suggested Settlements
                            </Text>
                            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                                Optimized to minimize the number of transactions
                            </Text>
                        </View>

                        {settlements.map((settlement, index) => (
                            <AppCard key={index} style={styles.settlementCard} delay={index * 100}>
                                <View style={styles.settlementHeader}>
                                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                                        <Text style={styles.avatarText}>
                                            {settlement.from_user_name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Ionicons name="arrow-forward" size={24} color={theme.textMuted} style={{ marginHorizontal: 16 }} />
                                    <View style={[styles.avatar, { backgroundColor: theme.success }]}>
                                        <Text style={styles.avatarText}>
                                            {settlement.to_user_name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.settlementDetails}>
                                    <View style={styles.settlementRow}>
                                        <Text style={[styles.fromText, { color: theme.text }]}>
                                            {settlement.from_user_name}
                                        </Text>
                                        <Text style={[styles.payText, { color: theme.textSecondary }]}>pays</Text>
                                        <Text style={[styles.toText, { color: theme.text }]}>
                                            {settlement.to_user_name}
                                        </Text>
                                    </View>
                                    <MoneyText
                                        amount={settlement.amount}
                                        style={styles.settlementAmount}
                                        showSign={false}
                                    />
                                </View>

                                <Button
                                    title={
                                        processingId === `${settlement.from_user}-${settlement.to_user}`
                                            ? 'Recording...'
                                            : 'Record Payment'
                                    }
                                    onPress={() => handleRecordSettlement(
                                        settlement.from_user,
                                        settlement.to_user,
                                        settlement.amount,
                                        index
                                    )}
                                    variant="outline"
                                    disabled={processingId !== null}
                                />
                            </AppCard>
                        ))}
                    </>
                )}

                {/* Current Balances Section */}
                {!loading && balances.length > 0 && (
                    <>
                        <View style={[styles.section, { marginTop: 32 }]}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Individual Balances
                            </Text>
                        </View>

                        {balances.map((balance, index) => (
                            <AppCard key={balance.user_id} style={styles.balanceCard} delay={(settlements.length + index) * 100}>
                                <View style={styles.balanceRow}>
                                    <View style={[styles.avatar, { backgroundColor: theme.cardHighlight }]}>
                                        <Text style={[styles.avatarText, { color: theme.primary }]}>
                                            {balance.user_name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.balanceDetails}>
                                        <Text style={[styles.balanceName, { color: theme.text }]}>
                                            {balance.user_name}
                                        </Text>
                                        <Text style={[styles.balanceSubtext, { color: theme.textSecondary }]}>
                                            Paid ₹{balance.total_paid.toFixed(2)} • Owes ₹{balance.total_owed.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={styles.balanceAmount}>
                                        {balance.net_balance > 0.01 ? (
                                            <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                                <Text style={[styles.badgeText, { color: theme.success }]}>
                                                    Gets ₹{balance.net_balance.toFixed(2)}
                                                </Text>
                                            </View>
                                        ) : balance.net_balance < -0.01 ? (
                                            <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                                <Text style={[styles.badgeText, { color: theme.danger }]}>
                                                    Owes ₹{Math.abs(balance.net_balance).toFixed(2)}
                                                </Text>
                                            </View>
                                        ) : (
                                            <Text style={[styles.settledText, { color: theme.textMuted }]}>Settled</Text>
                                        )}
                                    </View>
                                </View>
                            </AppCard>
                        ))}
                    </>
                )}

                <View style={{ height: 100 }} />
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    card: {
        padding: 32,
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
    },
    emptyState: {
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
    },
    settlementCard: {
        padding: 20,
        marginBottom: 16,
    },
    settlementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    settlementDetails: {
        marginBottom: 20,
    },
    settlementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    fromText: {
        fontSize: 16,
        fontWeight: '600',
    },
    payText: {
        fontSize: 14,
        marginHorizontal: 8,
    },
    toText: {
        fontSize: 16,
        fontWeight: '600',
    },
    settlementAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    balanceCard: {
        padding: 16,
        marginBottom: 12,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceDetails: {
        flex: 1,
        marginLeft: 16,
    },
    balanceName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    balanceSubtext: {
        fontSize: 12,
    },
    balanceAmount: {
        alignItems: 'flex-end',
    },
    badge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    settledText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
