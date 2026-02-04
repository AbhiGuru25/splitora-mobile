import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import AppCard from './ui/AppCard';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, subDays } from 'date-fns';

interface WeeklySpendingChartProps {
    expenses: any[];
}

export default function WeeklySpendingChart({ expenses }: WeeklySpendingChartProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    // Get last 7 days including today
    const today = new Date();
    const last7Days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today
    });

    // Calculate daily totals
    const weeklyData = last7Days.map(day => {
        const dayTotal = expenses
            .filter(e => isSameDay(new Date(e.date), day))
            .reduce((sum, e) => sum + e.amount, 0);

        return {
            value: dayTotal,
            label: format(day, 'E'), // Mon, Tue, etc.
            frontColor: theme.primary,
            topLabelComponent: () => (
                dayTotal > 0 ? (
                    <Text style={{ color: theme.textSecondary, fontSize: 10, marginBottom: 4 }}>
                        {dayTotal >= 1000 ? `${(dayTotal / 1000).toFixed(1)}k` : dayTotal}
                    </Text>
                ) : null
            ),
        };
    });

    const maxVal = Math.max(...weeklyData.map(d => d.value));

    return (
        <AppCard style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>Weekly Activity</Text>

            <View style={styles.chartContainer}>
                <BarChart
                    data={weeklyData}
                    barWidth={28}
                    spacing={16}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
                    noOfSections={3}
                    maxValue={maxVal > 0 ? maxVal * 1.2 : 100} // Add some headroom
                    xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 12 }}
                    width={Dimensions.get('window').width - 80}
                    height={180}
                    isAnimated
                />
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
        paddingVertical: 10,
    }
});
