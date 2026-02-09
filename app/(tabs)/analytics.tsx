import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import SpendingChart from '@/components/charts/SpendingChart';
import CategoryChart from '@/components/charts/CategoryChart';
import InsightCard from '@/components/InsightCard';
import AppCard from '@/components/ui/AppCard';

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
        if (amount >= 100000) {
            return '₹' + (amount / 100000).toFixed(1) + 'L';
        } else if (amount >= 1000) {
            return '₹' + (amount / 1000).toFixed(1) + 'k';
        }
        return '₹' + amount.toFixed(0);
    };

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
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                        Loading analytics...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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

                {/* Total This Month Card */}
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

                {/* Period Selector */}
                <View style={[styles.periodSelector, { backgroundColor: theme.surface }]}>
                    <PeriodButton value="week" label="Week" />
                    <PeriodButton value="month" label="Month" />
                    <PeriodButton value="year" label="Year" />
                </View>

                {/* Spending Trend Chart */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        📈 Spending Trend
                    </Text>
                    <AppCard style={styles.chartCard}>
                        <SpendingChart data={data?.dailySpending || []} />
                    </AppCard>
                </View>

                {/* Insights */}
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

                {/* Category Breakdown */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        🍩 By Category
                    </Text>
                    <AppCard style={styles.chartCard}>
                        <CategoryChart data={data?.categoryBreakdown || []} />
                    </AppCard>
                </View>

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
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    totalCard: {
        padding: 24,
        borderRadius: 20,
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 42,
        fontWeight: 'bold',
        color: 'white',
        marginVertical: 8,
    },
    totalStats: {
        flexDirection: 'row',
        marginTop: 8,
    },
    totalStat: {
        flex: 1,
    },
    totalStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    totalStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 16,
    },
    periodSelector: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        marginBottom: 20,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    periodButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    chartCard: {
        padding: 16,
    },
    insightsGrid: {
        gap: 12,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    categoryDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    categoryName: {
        fontSize: 16,
    },
    categoryValues: {
        alignItems: 'flex-end',
    },
    categoryAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    categoryPercent: {
        fontSize: 12,
    },
});
