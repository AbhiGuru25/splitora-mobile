import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Spacing, Radius, Typography } from '@/constants/Layout';
import { useTheme } from '@/lib/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useGroups, Group } from '@/lib/hooks/useGroups';
import { Ionicons } from '@expo/vector-icons';
import AppCard from '@/components/ui/AppCard';
import AppContainer from '@/components/ui/AppContainer';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/ui/SectionHeader';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function GroupsScreen() {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];
    const router = useRouter();
    const { groups, loading, refreshGroups } = useGroups();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        refreshGroups();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refreshGroups();
        setRefreshing(false);
    }, []);

    const renderGroupItem = ({ item, index }: { item: Group; index: number }) => {
        const balance = item.user_balance || 0;
        const balanceColor = balance > 0.01 ? theme.success : balance < -0.01 ? theme.danger : theme.textMuted;
        const balanceText = balance > 0.01
            ? `₹${balance.toFixed(0)}`
            : balance < -0.01
                ? `₹${Math.abs(balance).toFixed(0)}`
                : '—';
        const balanceLabelText = balance > 0.01
            ? 'You get'
            : balance < -0.01
                ? 'You owe'
                : 'Settled';

        return (
            <AppCard
                style={styles.card}
                delay={index * 100}
                onPress={() => router.push(`/group/${item.id}`)}
            >
                <View style={styles.cardInner}>
                    {/* Left: Avatar + Info */}
                    <View style={styles.cardLeft}>
                        <View style={styles.groupIconPlaceholder}>
                            <Text style={styles.groupInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.groupInfo}>
                            {/* @ts-ignore */}
                            <Animated.Text
                                sharedTransitionTag={`groupName-${item.id}`}
                                style={[styles.groupName, { color: theme.text }]}
                            >
                                {item.name}
                            </Animated.Text>
                            <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
                                {item.member_count || 0} members
                            </Text>
                        </View>
                    </View>

                    {/* Right: Balance badge — real data */}
                    <View style={styles.balanceContainer}>
                        <Text style={[styles.balanceAmount, { color: balanceColor }]}>
                            {balanceText}
                        </Text>
                        <Text style={[styles.balanceLabel, { color: theme.textMuted }]}>
                            {balanceLabelText}
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                </View>
            </AppCard>
        );
    };

    return (
        <AppContainer>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Groups</Text>
                <TouchableOpacity onPress={() => router.push('/groups/create')} style={styles.addButton}>
                    <Ionicons name="add-circle" size={24} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.listContent}>
                    <SkeletonCard variant="group" />
                    <SkeletonCard variant="group" />
                    <SkeletonCard variant="group" />
                    <SkeletonCard variant="group" />
                    <SkeletonCard variant="group" />
                </View>
            ) : (
                <FlatList
                    data={groups}
                    renderItem={renderGroupItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        groups.length === 0 ? (
                            <EmptyState
                                title="No groups yet"
                                subtitle="Create a group to split expenses with friends and family"
                                buttonText="Create Group"
                                onPress={() => router.push('/groups/create')}
                                icon="people-outline"
                                helpText="Groups are perfect for trips, shared apartments, or regular dinners"
                            />
                        ) : null
                    }
                />
            )}
        </AppContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    title: {
        ...Typography.title,
        fontSize: 32,
    },
    addButton: {
        padding: Spacing.sm,
    },
    listContent: {
        paddingTop: 0,
        paddingBottom: 100,
    },
    card: {
        marginBottom: Spacing.md,
        padding: 0,
    },
    cardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.card,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    groupIconPlaceholder: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.2)',
    },
    groupInitial: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#38BDF8',
    },
    groupInfo: {
        justifyContent: 'center',
        flex: 1,
    },
    groupName: {
        ...Typography.cardTitle,
        fontSize: 17,
        marginBottom: 2,
    },
    memberCount: {
        ...Typography.caption,
    },
    balanceContainer: {
        alignItems: 'flex-end',
        marginRight: Spacing.sm,
    },
    balanceAmount: {
        fontSize: 18,
        fontWeight: '700',
    },
    balanceLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 1,
    },
});
