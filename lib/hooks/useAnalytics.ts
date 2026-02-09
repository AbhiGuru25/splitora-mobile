import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface DailySpending {
    date: string;
    amount: number;
}

export interface CategorySpending {
    category: string;
    amount: number;
    percentage: number;
    color: string;
}

export interface AnalyticsData {
    totalThisMonth: number;
    totalLastMonth: number;
    percentChange: number;
    averagePerDay: number;
    transactionCount: number;
    topCategory: string;
    biggestExpense: {
        description: string;
        amount: number;
    } | null;
    dailySpending: DailySpending[];
    categoryBreakdown: CategorySpending[];
}

// Category colors for chart
const CATEGORY_COLORS: Record<string, string> = {
    'Food 🍽️': '#FF6B6B',
    'Travel 🚗': '#4ECDC4',
    'Shopping 🛒': '#45B7D1',
    'Entertainment 🎬': '#96CEB4',
    'Bills 📄': '#FFEAA7',
    'Other 💸': '#DDA0DD',
    'default': '#38bdf8',
};

export function useAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('Not authenticated');
                return;
            }

            // Calculate date ranges
            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

            let startDate: Date;
            if (period === 'week') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (period === 'month') {
                startDate = startOfThisMonth;
            } else {
                startDate = new Date(now.getFullYear(), 0, 1);
            }

            // Fetch this month's expenses
            const { data: thisMonthExpenses, error: thisMonthError } = await supabase
                .from('personal_expenses')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', startOfThisMonth.toISOString())
                .order('created_at', { ascending: true });

            if (thisMonthError) throw thisMonthError;

            // Fetch last month's expenses
            const { data: lastMonthExpenses, error: lastMonthError } = await supabase
                .from('personal_expenses')
                .select('amount')
                .eq('user_id', user.id)
                .gte('created_at', startOfLastMonth.toISOString())
                .lte('created_at', endOfLastMonth.toISOString());

            if (lastMonthError) throw lastMonthError;

            // Calculate totals
            const totalThisMonth = thisMonthExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
            const totalLastMonth = lastMonthExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;

            const percentChange = totalLastMonth > 0
                ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
                : 0;

            // Calculate daily spending
            const dailyMap = new Map<string, number>();
            thisMonthExpenses?.forEach(exp => {
                const date = new Date(exp.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                dailyMap.set(date, (dailyMap.get(date) || 0) + (exp.amount || 0));
            });

            const dailySpending: DailySpending[] = Array.from(dailyMap.entries())
                .map(([date, amount]) => ({ date, amount }))
                .slice(-7); // Last 7 data points

            // Calculate category breakdown
            const categoryMap = new Map<string, number>();
            thisMonthExpenses?.forEach(exp => {
                const cat = exp.category || 'Other 💸';
                categoryMap.set(cat, (categoryMap.get(cat) || 0) + (exp.amount || 0));
            });

            const categoryBreakdown: CategorySpending[] = Array.from(categoryMap.entries())
                .map(([category, amount]) => ({
                    category,
                    amount,
                    percentage: totalThisMonth > 0 ? (amount / totalThisMonth) * 100 : 0,
                    color: CATEGORY_COLORS[category] || CATEGORY_COLORS.default,
                }))
                .sort((a, b) => b.amount - a.amount);

            // Find biggest expense
            const biggestExpense = thisMonthExpenses?.length > 0
                ? thisMonthExpenses.reduce((max, exp) =>
                    (exp.amount || 0) > (max.amount || 0) ? exp : max
                )
                : null;

            // Days elapsed this month
            const daysElapsed = now.getDate();
            const averagePerDay = daysElapsed > 0 ? totalThisMonth / daysElapsed : 0;

            setData({
                totalThisMonth,
                totalLastMonth,
                percentChange,
                averagePerDay,
                transactionCount: thisMonthExpenses?.length || 0,
                topCategory: categoryBreakdown[0]?.category || 'None',
                biggestExpense: biggestExpense ? {
                    description: biggestExpense.description || 'Unknown',
                    amount: biggestExpense.amount || 0,
                } : null,
                dailySpending,
                categoryBreakdown,
            });

        } catch (err: any) {
            console.error('Analytics error:', err);
            setError(err.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return {
        data,
        loading,
        error,
        period,
        setPeriod,
        refresh: fetchAnalytics,
    };
}
