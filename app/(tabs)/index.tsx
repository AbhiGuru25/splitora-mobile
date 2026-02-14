import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Spacing, Radius, Typography } from '@/constants/Layout';
import { useTheme } from '@/lib/context/ThemeContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { useExpenses } from '@/lib/hooks/useExpenses';
import AppContainer from '@/components/ui/AppContainer';
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
    const oweAmount = 0;
    const getBackAmount = 0;

    const hasEnoughDataForTrends = expenses.length >= 5;
    const spendingTrend = hasEnoughDataForTrends ? -15 : null;

    return (
        <AppContainer>
            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={{ paddingTop: Spacing.lg, paddingBottom: 80 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                }
            >
                {/* 1. Header & Greeting — max 110px */}
                <View style={styles.headerRow}>
                    <GreetingCard name={firstName} />
                </View>

                {/* 2. Stats Cards — Fintech left-border style */}
                {loading ? (
                    <View style={styles.statsContainer}>
                        <SkeletonCard variant="stat" />
                        <View style={styles.statsRow}>
                            <View style={styles.halfStatCardWrapper}>
                                <SkeletonCard variant="stat" />
                            </View>
                            <View style={styles.halfStatCardWrapperLast}>
                                <SkeletonCard variant="stat" />
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.statsContainer}>
                        {/* Total Spent — dark card + subtle blue glow */}
                        <AppCard style={[styles.fullWidthStatCard, styles.blueGlowCard]} delay={100}>
                            <View style={styles.statIconBadge}>
                                <Text style={{ fontSize: 20 }}>💰</Text>
                            </View>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Spent</Text>
                            <MoneyText amount={totalSpent} style={styles.statValue} animate={!loading} />
                            <Text style={[styles.timeContext, { color: theme.textMuted }]}>This month</Text>
                            {totalSpent === 0 ? (
                                <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>No expenses yet</Text>
                            ) : spendingTrend !== null ? (
                                <TrendIndicator value={spendingTrend} label="vs last month" />
                            ) : null}
                        </AppCard>

                        {/* You Owe & Get Back — Side by Side with left border */}
                        <View style={styles.statsRow}>
                            <View style={styles.halfStatCardWrapper}>
                                {/* You Owe — dark card + red left border + subtle red tint */}
                                <AppCard style={[
                                    styles.halfStatCard,
                                    {
                                        borderLeftWidth: 3,
                                        borderLeftColor: theme.danger,
                                        backgroundColor: activeColorScheme === 'dark'
                                            ? 'rgba(239, 68, 68, 0.05)'
                                            : 'rgba(239, 68, 68, 0.04)',
                                    }
                                ]} delay={200}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>You Owe</Text>
                                    <MoneyText amount={-oweAmount} style={styles.subStatValue} showSign animate={!loading} />
                                    {oweAmount === 0 && (
                                        <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>All settled</Text>
                                    )}
                                </AppCard>
                            </View>

                            <View style={styles.halfStatCardWrapperLast}>
                                {/* Get Back — dark card + green left border + subtle green tint */}
                                <AppCard style={[
                                    styles.halfStatCard,
                                    {
                                        borderLeftWidth: 3,
                                        borderLeftColor: theme.success,
                                        backgroundColor: activeColorScheme === 'dark'
                                            ? 'rgba(16, 185, 129, 0.05)'
                                            : 'rgba(16, 185, 129, 0.04)',
                                    }
                                ]} delay={300}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Get Back</Text>
                                    <MoneyText amount={getBackAmount} style={styles.subStatValue} showSign animate={!loading} />
                                    {getBackAmount === 0 && (
                                        <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>All clear</Text>
                                    )}
                                </AppCard>
                            </View>
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

                {/* Recent Activity */}
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

                <View style={{ height: 100 }} />
            </ScrollView>
        </AppContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flex: 1,
    },
    headerRow: {
        marginBottom: Spacing.lg, // 16px to stats
    },
    statsContainer: {
        marginBottom: Spacing.section, // 24px to next section
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: Spacing.md,
    },
    halfStatCardWrapper: {
        flex: 1,
        marginRight: Spacing.md,
    },
    halfStatCardWrapperLast: {
        flex: 1,
    },
    fullWidthStatMargin: {
        marginBottom: 0,
    },
    chartSection: {
        marginBottom: Spacing.lg,
    },
    fullWidthStatCard: {
        minHeight: 100,
        padding: Spacing.card,
        borderRadius: Radius.card,
        justifyContent: 'center',
    },
    blueGlowCard: {
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.15)',
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
    },
    halfStatCard: {
        flex: 1,
        minHeight: 90,
        padding: Spacing.card,
        borderRadius: Radius.card,
        justifyContent: 'center',
    },
    emptyHint: {
        ...Typography.caption,
        marginTop: Spacing.xs,
        opacity: 0.7,
    },
    timeContext: {
        fontSize: 11,
        fontWeight: '400',
        marginTop: 2,
        opacity: 0.6,
    },
    statIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    statLabel: {
        ...Typography.caption,
        marginBottom: Spacing.xs,
    },
    statValue: {
        ...Typography.statLarge,
    },
    subStatValue: {
        ...Typography.statSmall,
    },
    horizontalList: {
        marginHorizontal: -Spacing.screen,
        paddingHorizontal: Spacing.screen,
        marginBottom: Spacing.lg,
    },
    personCard: {
        width: 140,
        marginRight: Spacing.md,
        alignItems: 'center',
        padding: Spacing.lg,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    personName: {
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    personAmount: {
        fontSize: 14,
    },
    activityCard: {
        padding: Spacing.card,
        borderRadius: Radius.card,
        marginBottom: Spacing.md,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: Radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        ...Typography.cardTitle,
        marginBottom: 2,
    },
    tagContainer: {
        flexDirection: 'row',
    },
    tagText: {
        ...Typography.caption,
    },
    activityAmount: {
        ...Typography.cardTitle,
    }
});
