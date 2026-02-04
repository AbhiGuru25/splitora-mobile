import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGroups, Group } from '@/lib/hooks/useGroups';
import { Ionicons } from '@expo/vector-icons';
import AppCard from '@/components/ui/AppCard';
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

    const renderGroupItem = ({ item, index }: { item: Group; index: number }) => (
        <AppCard
            style={styles.card}
            delay={index * 100}
            onPress={() => router.push(`/group/${item.id}`)}
        >
            <View style={styles.cardInner}>
                <View style={styles.cardHeader}>
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
                        <Text style={[styles.memberCount, { color: theme.textSecondary }]}>Click to view details</Text>
                    </View>
                </View>

                {/* Mock Balance for Design Showcase */}
                <View style={styles.balanceContainer}>
                    <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Text style={[styles.badgeText, { color: theme.success }]}>You get ₹500</Text>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} style={styles.chevron} />
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    addButton: {
        padding: 8,
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    card: {
        marginBottom: 16,
        padding: 0,
    },
    cardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    groupIconPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.2)',
    },
    groupInitial: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#38BDF8',
    },
    groupInfo: {
        justifyContent: 'center',
        flex: 1,
    },
    groupName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    memberCount: {
        fontSize: 13,
    },
    balanceContainer: {
        marginHorizontal: 8,
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    chevron: {
        marginLeft: 8,
    }
});
