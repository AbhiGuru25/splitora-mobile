import React, { useState } from 'react';
import { View, Text, RefreshControl, FlatList, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useExpenses, Expense } from '@/lib/hooks/useExpenses';
import { useRouter } from 'expo-router';
import AppCard from '@/components/ui/AppCard';
import MoneyText from '@/components/ui/MoneyText';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonCard from '@/components/ui/SkeletonCard';
import SectionHeader from '@/components/ui/SectionHeader';

export default function ActivityScreen() {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];
    const { expenses, loading, refreshExpenses } = useExpenses();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refreshExpenses();
        setRefreshing(false);
    }, []);

    const getCategoryIcon = (category: string) => {
        // Simple mapping, can be expanded
        if (category.toLowerCase().includes('food')) return '🍽️';
        if (category.toLowerCase().includes('travel') || category.includes('uber')) return '🚗';
        if (category.toLowerCase().includes('shop')) return '🛒';
        if (category.toLowerCase().includes('ent')) return '🎬';
        return '💸';
    };

    const renderItem = ({ item, index }: { item: Expense; index: number }) => (
        <AppCard
            style={styles.item}
            delay={index * 80}
            onPress={() => router.push(`/expense/${item.id}`)}
        >
            <View style={styles.itemInner}>
                <View style={[styles.iconContainer, { backgroundColor: theme.cardHighlight }]}>
                    <Text style={styles.icon}>{getCategoryIcon(item.category)}</Text>
                </View>
                <View style={styles.content}>
                    <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>
                    <Text style={[styles.subtext, { color: theme.textSecondary }]}>
                        {item.category} • {format(new Date(item.date), 'MMM d, h:mm a')}
                    </Text>
                </View>
                <MoneyText amount={item.amount} style={styles.amount} />
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Activity</Text>
            </View>

            {loading ? (
                <View style={styles.listContent}>
                    <SkeletonCard variant="expense" />
                    <SkeletonCard variant="expense" />
                    <SkeletonCard variant="expense" />
                    <SkeletonCard variant="expense" />
                    <SkeletonCard variant="expense" />
                    <SkeletonCard variant="expense" />
                </View>
            ) : (
                <FlatList
                    data={expenses}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title="No activity yet"
                            subtitle="Your expense history will appear here"
                            buttonText="Add Expense"
                            onPress={() => router.push('/(tabs)/add')}
                            icon="receipt-outline"
                            helpText="Track all your expenses in one place"
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    item: {
        marginBottom: 12,
        padding: 0,
    },
    itemInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.2)',
    },
    icon: {
        fontSize: 24,
    },
    content: {
        flex: 1,
    },
    description: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtext: {
        fontSize: 13,
    },
    amount: {
        fontSize: 18,
    },
});
