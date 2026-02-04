import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppCard from '@/components/ui/AppCard';
import MoneyText from '@/components/ui/MoneyText';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useSplitExpenses } from '@/lib/hooks/useSplitExpenses';
import { useBalances } from '@/lib/hooks/useBalances';
import { supabase } from '@/lib/supabase';
import { exportToCSV } from '@/lib/utils/exportData';
import { format } from 'date-fns';

export default function GroupDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    const [groupName, setGroupName] = useState('Group');
    const [refreshing, setRefreshing] = useState(false);

    // @ts-ignore - Reanimated types issue
    const { expenses, refreshExpenses, loading: expensesLoading, fetchExpenses: getExpensesForExport } = useSplitExpenses(id as string);
    // @ts-ignore - Reanimated types issue
    const { balances, refreshBalances, loading: balancesLoading } = useBalances(id as string);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchGroupName();
    }, [id]);

    async function fetchGroupName() {
        if (!id) return;

        try {
            const { data, error } = await supabase
                .from('groups')
                .select('name')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) setGroupName(data.name);
        } catch (error) {
            console.error('Error fetching group name:', error);
        }
    }

    async function onRefresh() {
        setRefreshing(true);
        await Promise.all([refreshExpenses(), fetchGroupName()]);
        setRefreshing(false);
    }

    const handleExport = async () => {
        try {
            setExporting(true);
            const data = await getExpensesForExport();
            if (data && data.length > 0) {
                // Format data for CSV
                const csvData = data.map((e: any) => ({
                    Date: new Date(e.date).toLocaleDateString(),
                    Description: e.description,
                    Amount: e.amount,
                    Category: e.category,
                    PaidBy: e.paid_by_user?.full_name || 'Unknown',
                    SplitsCount: e.splits?.length || 0
                }));

                await exportToCSV(csvData, `Splitora_Group_${groupName.replace(/\s+/g, '_')}_Expenses`);
            } else {
                Alert.alert('No expenses to export');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setExporting(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        if (category.toLowerCase().includes('food')) return '🍽️';
        if (category.toLowerCase().includes('travel')) return '🚗';
        if (category.toLowerCase().includes('shop')) return '🛒';
        if (category.toLowerCase().includes('ent')) return '🎬';
        return '💸';
    };

    const confirmDelete = () => {
        Alert.alert(
            'Delete Group',
            'Are you sure you want to delete this group? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('groups')
                                .delete()
                                .eq('id', id);

                            if (error) throw error;

                            // Navigate back to groups list
                            router.dismissAll();
                            router.replace('/(tabs)/groups');
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete group');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                {/* @ts-ignore */}
                <Animated.Text
                    sharedTransitionTag={`groupName-${id}`}
                    style={[styles.title, { color: theme.text }]}
                    numberOfLines={1}
                >
                    {groupName}
                </Animated.Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <TouchableOpacity onPress={handleExport} disabled={exporting}>
                        <Ionicons name="download-outline" size={24} color={exporting ? theme.textMuted : theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push(`/group/add-member?groupId=${id}`)}>
                        <Ionicons name="person-add-outline" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push(`/settle/${id}`)}>
                        <Ionicons name="card-outline" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmDelete}>
                        <Ionicons name="trash-outline" size={24} color={theme.danger} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                    />
                }
            >
                {/* Quick Actions */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push(`/expense/add-split?groupId=${id}`)}
                    >
                        <AppCard style={[styles.actionCard, { backgroundColor: theme.primary }]}>
                            <Ionicons name="add-circle" size={32} color="white" />
                            <Text style={styles.actionText}>Add Expense</Text>
                        </AppCard>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push(`/settle/${id}`)}
                    >
                        <AppCard style={styles.actionCard}>
                            <Ionicons name="cash-outline" size={32} color={theme.primary} />
                            <Text style={[styles.actionText, { color: theme.text }]}>Settle Up</Text>
                        </AppCard>
                    </TouchableOpacity>
                </View>

                {/* Balances Summary */}
                {!balancesLoading && balances.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Balances</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {balances.slice(0, 5).map((balance, index) => (
                                <AppCard key={balance.user_id} style={styles.balanceCard} delay={index * 80}>
                                    <View style={[styles.balanceAvatar, { backgroundColor: theme.cardHighlight }]}>
                                        <Text style={[styles.balanceAvatarText, { color: theme.primary }]}>
                                            {balance.user_name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={[styles.balanceName, { color: theme.text }]} numberOfLines={1}>
                                        {balance.user_name}
                                    </Text>
                                    {balance.net_balance > 0.01 ? (
                                        <Text style={[styles.balanceAmount, { color: theme.success }]}>
                                            +₹{balance.net_balance.toFixed(0)}
                                        </Text>
                                    ) : balance.net_balance < -0.01 ? (
                                        <Text style={[styles.balanceAmount, { color: theme.danger }]}>
                                            -₹{Math.abs(balance.net_balance).toFixed(0)}
                                        </Text>
                                    ) : (
                                        <Text style={[styles.balanceAmount, { color: theme.textMuted }]}>
                                            Settled
                                        </Text>
                                    )}
                                </AppCard>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Expenses List */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Expenses</Text>

                    {expensesLoading ? (
                        <AppCard style={styles.expenseCard}>
                            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                                Loading expenses...
                            </Text>
                        </AppCard>
                    ) : expenses.length === 0 ? (
                        <EmptyState
                            title="No expenses yet"
                            subtitle="Add your first group expense to get started"
                            buttonText="Add Expense"
                            onPress={() => router.push(`/expense/add-split?groupId=${id}`)}
                            icon="receipt-outline"
                            helpText="Split bills, rent, or dinner costs with your group"
                        />
                    ) : (
                        expenses.map((expense, index) => (
                            <AppCard key={expense.id} style={styles.expenseCard} delay={index * 80}>
                                <View style={styles.expenseRow}>
                                    <View style={[styles.expenseIcon, { backgroundColor: theme.cardHighlight }]}>
                                        <Text style={styles.expenseEmoji}>{getCategoryIcon(expense.category)}</Text>
                                    </View>

                                    <View style={styles.expenseDetails}>
                                        <Text style={[styles.expenseDescription, { color: theme.text }]}>
                                            {expense.description}
                                        </Text>
                                        <Text style={[styles.expenseSubtext, { color: theme.textSecondary }]}>
                                            Paid by {expense.paid_by_user?.full_name || 'Someone'} • {format(new Date(expense.date), 'MMM d')}
                                        </Text>
                                    </View>

                                    <MoneyText amount={expense.amount} style={styles.expenseAmount} showSign={false} />
                                </View>
                            </AppCard>
                        ))
                    )}
                </View>

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
        flex: 1,
        marginHorizontal: 16,
        textAlign: 'center',
    },
    content: {
        padding: 20,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
    },
    actionCard: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    balanceCard: {
        padding: 16,
        marginRight: 12,
        alignItems: 'center',
        minWidth: 100,
    },
    balanceAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    balanceAvatarText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    balanceName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    expenseCard: {
        padding: 16,
        marginBottom: 12,
    },
    loadingText: {
        fontSize: 14,
        textAlign: 'center',
    },
    expenseRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expenseIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    expenseEmoji: {
        fontSize: 24,
    },
    expenseDetails: {
        flex: 1,
    },
    expenseDescription: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    expenseSubtext: {
        fontSize: 13,
    },
    expenseAmount: {
        fontSize: 18,
    },
});
