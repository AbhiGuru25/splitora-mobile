import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { CategorySpending } from '@/lib/hooks/useAnalytics';

interface CategoryChartProps {
    data: CategorySpending[];
}

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

    // Take top 5 categories
    const topCategories = data.slice(0, 5);
    const total = topCategories.reduce((sum, cat) => sum + cat.amount, 0);

    return (
        <View style={styles.container}>
            {/* Progress bars for each category */}
            <View style={styles.barsContainer}>
                {topCategories.map((cat, index) => (
                    <View key={index} style={styles.categoryRow}>
                        <View style={styles.categoryHeader}>
                            <View style={styles.categoryInfo}>
                                <View style={[styles.dot, { backgroundColor: cat.color }]} />
                                <Text style={[styles.categoryName, { color: theme.text }]}>
                                    {cat.category}
                                </Text>
                            </View>
                            <Text style={[styles.categoryPercent, { color: theme.textSecondary }]}>
                                {cat.percentage.toFixed(0)}%
                            </Text>
                        </View>
                        <View style={[styles.progressBackground, { backgroundColor: theme.border }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        backgroundColor: cat.color,
                                        width: `${cat.percentage}%`
                                    }
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    barsContainer: {
        gap: 16,
    },
    categoryRow: {
        gap: 8,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoryPercent: {
        fontSize: 14,
        fontWeight: '600',
    },
    progressBackground: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
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
});
