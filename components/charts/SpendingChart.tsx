import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
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

    // Find max value for scaling
    const maxAmount = Math.max(...data.map(d => d.amount), 1);

    return (
        <View style={styles.container}>
            {/* Simple bar chart */}
            <View style={styles.chartContainer}>
                {data.map((item, index) => {
                    const barHeight = (item.amount / maxAmount) * 150;
                    return (
                        <View key={index} style={styles.barWrapper}>
                            <Text style={[styles.barValue, { color: theme.textSecondary }]}>
                                {item.amount >= 1000
                                    ? `${(item.amount / 1000).toFixed(1)}k`
                                    : item.amount.toFixed(0)
                                }
                            </Text>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height: Math.max(barHeight, 4),
                                        backgroundColor: '#38bdf8',
                                    }
                                ]}
                            />
                            <Text style={[styles.barLabel, { color: theme.textSecondary }]}>
                                {item.date}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 200,
        paddingTop: 30,
    },
    barWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    bar: {
        width: '60%',
        borderRadius: 4,
        minHeight: 4,
    },
    barValue: {
        fontSize: 10,
        marginBottom: 4,
    },
    barLabel: {
        fontSize: 9,
        marginTop: 8,
        textAlign: 'center',
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
