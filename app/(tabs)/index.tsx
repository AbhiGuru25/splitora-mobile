import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { useExpenses } from '@/lib/hooks/useExpenses';
import GreetingCard from '@/components/GreetingCard';
import AppCard from '@/components/ui/AppCard';
import MoneyText from '@/components/ui/MoneyText';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import TrendIndicator from '@/components/ui/TrendIndicator';
import SwipeableRow from '@/components/ui/SwipeableRow';
import SuccessAnimation from '@/components/ui/SuccessAnimation';
import SkeletonCard from '@/components/ui/SkeletonCard';
import SpendingChart from '@/components/SpendingChart';
import WeeklySpendingChart from '@/components/WeeklySpendingChart';

export default function Dashboard() {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];
    const { user } = useAuth();
    const { expenses, loading, refreshExpenses, deleteExpense } = useExpenses();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [firstName, setFirstName] = useState('User');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            setFirstName(user.user_metadata.full_name.split(' ')[0]);
        }
    }, [user]);

    // Show success animation briefly when new expense is added
    useEffect(() => {
        const prevExpenseCount = expenses.length;
        if (prevExpenseCount > 0 && expenses.length > prevExpenseCount) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }
    }, [expenses.length]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refreshExpenses();
        setRefreshing(false);
    }, []);

    const handleDeleteExpense = async (expenseId: string) => {
        try {
            await deleteExpense(expenseId);
            await refreshExpenses();
        } catch (error) {
            console.error('Failed to delete expense:', error);
        }
    };

    // Calculate totals
    const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

    // Settlement amounts - currently no split expense logic implemented
    // These will be 0 until we add group/split functionality
    const oweAmount = 0;
    const getBackAmount = 0;

    // Mock trend data (in production, calculate from historical data)
    const spendingTrend = expenses.length > 0 ? -15 : 0; // 15% less than last month
    const oweTrend = 0;
    const getBackTrend = 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                }
            >
                {/* 1. Header & Greeting */}
                <View style={styles.headerRow}>
                    <GreetingCard name={firstName} />
                </View>

                {/* 2. Stats Grid (3 Cards) - Show skeletons while loading */}
                {loading ? (
                    <View style={styles.statsGrid}>
                        <View style={styles.mainStatCard}>
                            <SkeletonCard variant="stat" />
                        </View>
                        <View style={styles.secondaryStatsCol}>
                            <View style={styles.subStatCard}>
                                <SkeletonCard variant="stat" />
                            </View>
                            <View style={styles.subStatCard}>
                                <SkeletonCard variant="stat" />
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.statsGrid}>
                        <AppCard style={styles.mainStatCard} delay={100}>
                            <View style={styles.statIconBadge}>
                                <Text style={{ fontSize: 20 }}>💰</Text>
                            </View>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Spent</Text>
                            <MoneyText amount={totalSpent} style={styles.statValue} />
                            <TrendIndicator value={spendingTrend} label="vs last month" />
                        </AppCard>

                        <View style={styles.secondaryStatsCol}>
                            <AppCard style={[
                                styles.subStatCard,
                                {
                                    backgroundColor: activeColorScheme === 'dark'
                                        ? 'rgba(239, 68, 68, 0.1)'
                                        : '#FEF2F2',
                                    borderLeftWidth: 3,
                                    borderLeftColor: theme.danger,
                                }
                            ]} delay={200}>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>You Owe</Text>
                                <MoneyText amount={-oweAmount} style={styles.subStatValue} showSign />
                                <TrendIndicator value={oweTrend} />
                            </AppCard>

                            <AppCard style={[
                                styles.subStatCard,
                                {
                                    backgroundColor: activeColorScheme === 'dark'
                                        ? 'rgba(16, 185, 129, 0.1)'
                                        : '#F0FDF4',
                                    borderLeftWidth: 3,
                                    borderLeftColor: theme.success,
                                }
                            ]} delay={300}>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Get Back</Text>
                                <MoneyText amount={getBackAmount} style={styles.subStatValue} showSign />
                                <TrendIndicator value={getBackTrend} />
                            </AppCard>
                        </View>
                    </View>
                )}

                {expenses.length > 0 && (
                    <View style={styles.chartSection}>
                        <SectionHeader title="Spending Insights" />
                        <SpendingChart expenses={expenses} />
                        <WeeklySpendingChart expenses={expenses} />
                    </View>
                )}

                {/* 3. People to Settle With - Only show if there are actual settlements */}
                {(oweAmount > 0 || getBackAmount > 0) && (
                    <>
                        <SectionHeader
                            title="People to Settle With"
                            actionText="See all"
                            onAction={() => router.push('/settle-up')}
                        />

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                            {/* Mock Data */}
                            <AppCard style={styles.personCard} delay={400} onPress={() => router.push('/settle-up')}>
                                <View style={styles.avatarPlaceholder}><Text>S</Text></View>
                                <Text style={[styles.personName, { color: theme.text }]}>Sneha</Text>
                                <MoneyText amount={-1000} style={styles.personAmount} />
                            </AppCard>

                            <AppCard style={styles.personCard} delay={500} onPress={() => router.push('/settle-up')}>
                                <View style={styles.avatarPlaceholder}><Text>R</Text></View>
                                <Text style={[styles.personName, { color: theme.text }]}>Rahul</Text>
                                <MoneyText amount={600} style={styles.personAmount} />
                            </AppCard>
                        </ScrollView>
                    </>
                )}

                {/* 4. Recent Activity */}
                <SectionHeader
                    title="Recent Activity"
                    actionText="View all"
                    onAction={() => router.push('/(tabs)/activity')}
                />

                {loading ? (
                    <View>
                        <SkeletonCard variant="expense" />
                        <SkeletonCard variant="expense" />
                        <SkeletonCard variant="expense" />
                    </View>
                ) : expenses.length === 0 ? (
                    <EmptyState
                        title="No activity yet"
                        subtitle="Add your first expense to get started!"
                        buttonText="Add Expense"
                        onPress={() => router.push('/(tabs)/add')}
                        icon="receipt-outline"
                        helpText="Tip: You can split expenses with friends or track personal spending"
                    />
                ) : (
                    <View>
                        {expenses.slice(0, 5).map((expense, index) => (
                            <SwipeableRow
                                key={expense.id}
                                onDelete={() => handleDeleteExpense(expense.id)}
                            >
                                <AppCard
                                    style={styles.activityCard}
                                    delay={600 + (index * 100)}
                                    onPress={() => router.push(`/expense/${expense.id}`)}
                                >
                                    <View style={styles.activityRow}>
                                        <View style={[styles.categoryIcon, { backgroundColor: theme.surface }]}>
                                            <Text>🍱</Text>
                                        </View>

                                        <View style={styles.activityInfo}>
                                            <Text style={[styles.activityTitle, { color: theme.text }]}>{expense.description}</Text>
                                            <View style={styles.tagContainer}>
                                                <Text style={[styles.tagText, { color: theme.textSecondary }]}>Personal</Text>
                                            </View>
                                        </View>

                                        <MoneyText amount={expense.amount} style={styles.activityAmount} />
                                    </View>
                                </AppCard>
                            </SwipeableRow>
                        ))}
                    </View>
                )}

                {/* Bottom Padding for FAB */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    headerRow: {
        marginBottom: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    chartSection: {
        marginBottom: 8,
    },
    mainStatCard: {
        flex: 1,
        minHeight: 120, // Reduced from 140
        justifyContent: 'center',
    },
    secondaryStatsCol: {
        flex: 1,
        gap: 12,
    },
    subStatCard: {
        flex: 1,
        padding: 12, // Reduced from 16
        justifyContent: 'center',
        marginBottom: 0,
    },
    statIconBadge: {
        width: 40, // Reduced from 48
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12, // Reduced from 14
        fontWeight: '500',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24, // Reduced from 28
    },
    subStatValue: {
        fontSize: 18, // Reduced from 20
    },
    horizontalList: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    personCard: {
        width: 140,
        marginRight: 12,
        alignItems: 'center',
        padding: 16,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    personName: {
        fontWeight: '600',
        marginBottom: 4,
    },
    personAmount: {
        fontSize: 14,
    },
    activityCard: {
        padding: 16,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    tagContainer: {
        flexDirection: 'row',
    },
    tagText: {
        fontSize: 12,
    },
    activityAmount: {
        fontSize: 16,
    }
});
