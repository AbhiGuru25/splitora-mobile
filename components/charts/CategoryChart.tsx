import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { CategorySpending } from '@/lib/hooks/useAnalytics';

interface CategoryChartProps {
    data: CategorySpending[];
}

const screenWidth = Dimensions.get('window').width;

export default function CategoryChart({ data }: CategoryChartProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    if (data.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.surface }]}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No category data yet
                </Text>
            </View>
        );
    }

    // Take top 5 categories for the chart
    const topCategories = data.slice(0, 5);

    const chartData = topCategories.map((cat, index) => ({
        name: cat.category.split(' ')[0], // Just the text, no emoji for chart
        amount: cat.amount,
        color: cat.color,
        legendFontColor: theme.textSecondary,
        legendFontSize: 12,
    }));

    const chartConfig = {
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    };

    return (
        <View style={styles.container}>
            <PieChart
                data={chartData}
                width={screenWidth - 48}
                height={180}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute={false}
                hasLegend={false}
            />

            {/* Custom Legend */}
            <View style={styles.legend}>
                {topCategories.map((cat, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                        <Text style={[styles.legendText, { color: theme.text }]}>
                            {cat.category}
                        </Text>
                        <Text style={[styles.legendValue, { color: theme.textSecondary }]}>
                            {cat.percentage.toFixed(0)}%
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    emptyContainer: {
        height: 180,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
        paddingHorizontal: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '500',
    },
    legendValue: {
        fontSize: 12,
    },
});
