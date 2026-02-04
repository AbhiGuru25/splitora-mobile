import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import AppCard from './ui/AppCard';

interface SpendingChartProps {
    expenses: any[];
}

export default function SpendingChart({ expenses }: SpendingChartProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    // Group expenses by category
    const categoryTotals = expenses.reduce((acc, expense) => {
        const cat = expense.category || 'Other';
        acc[cat] = (acc[cat] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum: number, val: number) => sum + val, 0);

    // Prepare data for chart
    const data = Object.keys(categoryTotals).map((cat, index) => {
        const amount = categoryTotals[cat];
        const percentage = total > 0 ? (amount / total) * 100 : 0;

        // Generate nice colors for the chart
        const colors = [
            '#38BDF8', // primary (Sky Blue)
            '#818CF8', // Indigo
            '#34D399', // Emerald
            '#F472B6', // Pink
            '#fbbf24', // Amber
            '#A78BFA', // Violet
        ];

        return {
            value: amount,
            color: colors[index % colors.length],
            text: `${percentage.toFixed(0)}%`,
            category: cat
        };
    }).sort((a, b) => b.value - a.value); // Sort biggest to smallest

    if (total === 0) {
        return null;
    }

    const renderLegend = (category: string, color: string, amount: number) => {
        return (
            <View style={styles.legendRow} key={category}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>{category}</Text>
                <Text style={[styles.legendAmount, { color: theme.text }]}>₹{amount.toFixed(0)}</Text>
            </View>
        );
    };

    return (
        <AppCard style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>Spending by Category</Text>

            <View style={styles.chartContainer}>
                <PieChart
                    data={data}
                    donut
                    showText
                    textColor="white"
                    radius={100}
                    innerRadius={60}
                    textSize={12}
                    focusOnPress
                    strokeWidth={2}
                    strokeColor={theme.surface}
                    centerLabelComponent={() => {
                        return (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 22, color: theme.text, fontWeight: 'bold' }}>
                                    ₹{total.toFixed(0)}
                                </Text>
                                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Total</Text>
                            </View>
                        );
                    }}
                />
            </View>

            <View style={styles.legendContainer}>
                {data.map(item => renderLegend(item.category, item.color, item.value))}
            </View>
        </AppCard>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    legendContainer: {
        gap: 12,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
        flex: 1,
    },
    legendAmount: {
        fontSize: 14,
        fontWeight: '600',
    }
});
