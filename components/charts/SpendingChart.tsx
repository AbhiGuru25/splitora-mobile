import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { DailySpending } from '@/lib/hooks/useAnalytics';

interface SpendingChartProps {
    data: DailySpending[];
}

const screenWidth = Dimensions.get('window').width;

export default function SpendingChart({ data }: SpendingChartProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    if (data.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.surface }]}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No spending data yet
                </Text>
            </View>
        );
    }

    const chartData = {
        labels: data.map(d => d.date),
        datasets: [
            {
                data: data.map(d => d.amount),
                color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`, // Ice blue
                strokeWidth: 3,
            },
        ],
    };

    const chartConfig = {
        backgroundColor: theme.surface,
        backgroundGradientFrom: theme.surface,
        backgroundGradientTo: theme.surface,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
        labelColor: (opacity = 1) => theme.textSecondary,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#38bdf8',
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: theme.border,
            strokeOpacity: 0.3,
        },
    };

    return (
        <View style={styles.container}>
            <LineChart
                data={chartData}
                width={screenWidth - 48}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero={true}
                yAxisLabel="₹"
                yAxisSuffix=""
                formatYLabel={(value) => {
                    const num = parseFloat(value);
                    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
                    return value;
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 8,
    },
    chart: {
        borderRadius: 16,
    },
    emptyContainer: {
        height: 200,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});
