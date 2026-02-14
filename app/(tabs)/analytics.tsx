import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients } from '@/constants/Colors';
import { Spacing, Radius, Typography } from '@/constants/Layout';
import { useTheme } from '@/lib/context/ThemeContext';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import SpendingChart from '@/components/charts/SpendingChart';
import CategoryChart from '@/components/charts/CategoryChart';
import InsightCard from '@/components/InsightCard';
import AppCard from '@/components/ui/AppCard';
import AppContainer from '@/components/ui/AppContainer';

export default function AnalyticsScreen() {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];
    const { data, loading, error, period, setPeriod, refresh } = useAnalytics();

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
        if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'k';
        return '₹' + amount.toFixed(0);
    };

    const hasData = data && data.transactionCount > 0;

    const PeriodButton = ({ value, label }: { value: 'week' | 'month' | 'year'; label: string }) => (
        <TouchableOpacity
            onPress={() => setPeriod(value)}
            style={[
                styles.periodButton,
                period === value && { backgroundColor: theme.primary }
            ]}
        >
            <Text style={[
                styles.periodButtonText,
                { color: period === value ? 'white' : theme.textSecondary }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    if (loading && !data) {
        return (
            <AppContainer>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                        Loading analytics...
                    </Text>
                </View>
            </AppContainer>
        );
    }

    return (
        <AppContainer>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Analytics</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Track your spending habits
                    </Text>
                </View>

                {/* Total This Month Card — reduced height */}
                <LinearGradient
                    colors={Gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.totalCard}
                >
                    <Text style={styles.totalLabel}>Total This Month</Text>
                    <Text style={styles.totalAmount}>
                        {formatCurrency(data?.totalThisMonth || 0)}
                    </Text>
                    <View style={styles.totalStats}>
                        <View style={styles.totalStat}>
                            <Text style={styles.totalStatValue}>{data?.transactionCount || 0}</Text>
                            <Text style={styles.totalStatLabel}>Transactions</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.totalStat}>
                            <Text style={styles.totalStatValue}>
                                {formatCurrency(data?.averagePerDay || 0)}
                            </Text>
                            <Text style={styles.totalStatLabel}>Per Day</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Period Selector — Compact segmented control */}
                <View style={[styles.periodSelector, { backgroundColor: theme.surface }]}>
                    <PeriodButton value="week" label="W" />
                    <PeriodButton value="month" label="M" />
                    <PeriodButton value="year" label="Y" />
                </View>

                {/* Spending Trend Chart */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        📈 Spending Trend
                    </Text>
                    <AppCard style={styles.chartCard}>
                        {hasData ? (
                            <SpendingChart data={data?.dailySpending || []} />
                        ) : (
                            <View style={styles.emptyChart}>
                                {/* Shimmer skeleton bars */}
                                <View style={styles.skeletonBars}>
                                    {[40, 60, 30, 55, 45, 70, 50].map((h, i) => (
                                        <View
                                            key={i}
                                            style={[styles.skeletonBar, {
                                                height: h,
                                                backgroundColor: theme.border,
                                                opacity: 0.4 + (i * 0.05),
                                            }]}
                                        />
                                    ))}
                                </View>
                                <Text style={[styles.emptyChartText, { color: theme.textMuted }]}>
                                    Start adding expenses to see insights
                                </Text>
                            </View>
                        )}
                    </AppCard>
                </View>

                {/* Insights */}
                {hasData && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            💡 Insights
                        </Text>
                        <View style={styles.insightsGrid}>
                            <InsightCard
                                icon="trending-up"
                                title="vs Last Month"
                                value={`${data?.percentChange.toFixed(0) || 0}%`}
                                subtext={data?.percentChange && data.percentChange > 0 ? 'increase' : 'decrease'}
                                trend={data?.percentChange && data.percentChange > 0 ? 'up' : 'down'}
                            />
                            <InsightCard
                                icon="restaurant"
                                title="Top Category"
                                value={data?.topCategory || 'None'}
                                color="#FF6B6B"
                            />
                            {data?.biggestExpense && (
                                <InsightCard
                                    icon="cash"
                                    title="Biggest Expense"
                                    value={formatCurrency(data.biggestExpense.amount)}
                                    subtext={data.biggestExpense.description}
                                    color="#4ECDC4"
                                />
                            )}
                        </View>
                    </View>
                )}

                {/* Category Breakdown */}
                {hasData && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            🍩 By Category
                        </Text>
                        <AppCard style={styles.chartCard}>
                            <CategoryChart data={data?.categoryBreakdown || []} />
                        </AppCard>
                    </View>
                )}

                {/* Category List */}
                {data?.categoryBreakdown && data.categoryBreakdown.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            📊 Breakdown
                        </Text>
                        {data.categoryBreakdown.map((cat, index) => (
                            <View
                                key={index}
                                style={[styles.categoryRow, { borderBottomColor: theme.border }]}
                            >
                                <View style={styles.categoryInfo}>
                                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                                    <Text style={[styles.categoryName, { color: theme.text }]}>
                                        {cat.category}
                                    </Text>
                                </View>
                                <View style={styles.categoryValues}>
                                    <Text style={[styles.categoryAmount, { color: theme.text }]}>
                                        {formatCurrency(cat.amount)}
                                    </Text>
                                    <Text style={[styles.categoryPercent, { color: theme.textSecondary }]}>
                                        {cat.percentage.toFixed(1)}%
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </AppContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: 16,
    },
    scrollContent: {
        paddingTop: Spacing.lg,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    title: {
        ...Typography.title,
    },
    subtitle: {
        fontSize: 14,
        marginTop: Spacing.xs,
    },
    totalCard: {
        padding: Spacing.lg,
        borderRadius: Radius.card,
        marginBottom: Spacing.lg,
    },
    totalLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginVertical: Spacing.xs,
    },
    totalStats: {
        flexDirection: 'row',
        marginTop: Spacing.sm,
    },
    totalStat: {
        flex: 1,
    },
    totalStatValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    totalStatLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: Spacing.lg,
    },
    periodSelector: {
        flexDirection: 'row',
        padding: 3,
        borderRadius: Radius.sm,
        marginBottom: Spacing.section,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 7,
        borderRadius: 7,
        alignItems: 'center',
    },
    periodButtonText: {
        fontSize: 13,
        fontWeight: '700',
    },
    section: {
        marginBottom: Spacing.section,
    },
    sectionTitle: {
        ...Typography.sectionHeader,
        marginBottom: Spacing.md,
    },
    chartCard: {
        padding: Spacing.card,
    },
    insightsGrid: {
        gap: Spacing.md,
    },
    emptyChart: {
        height: 140,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: Spacing.lg,
    },
    skeletonBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        height: 80,
        marginBottom: Spacing.md,
    },
    skeletonBar: {
        width: 24,
        borderRadius: 4,
    },
    emptyChartText: {
        fontSize: 13,
        fontWeight: '500',
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.card,
        borderBottomWidth: 1,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    categoryDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    categoryName: {
        ...Typography.cardTitle,
    },
    categoryValues: {
        alignItems: 'flex-end',
    },
    categoryAmount: {
        ...Typography.cardTitle,
    },
    categoryPercent: {
        ...Typography.caption,
    },
});
