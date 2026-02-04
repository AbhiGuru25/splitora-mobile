import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { Spacing } from '@/constants/Spacing';

interface SkeletonCardProps {
    variant?: 'stat' | 'expense' | 'group';
}

export default function SkeletonCard({ variant = 'expense' }: SkeletonCardProps) {
    if (variant === 'stat') {
        return (
            <View style={styles.statCard}>
                <Skeleton width={40} height={40} borderRadius={20} style={{ marginBottom: Spacing.sm }} />
                <Skeleton width="60%" height={14} style={{ marginBottom: Spacing.xs }} />
                <Skeleton width="80%" height={28} />
            </View>
        );
    }

    if (variant === 'group') {
        return (
            <View style={styles.groupCard}>
                <View style={styles.groupRow}>
                    <Skeleton width={48} height={48} borderRadius={24} />
                    <View style={styles.groupInfo}>
                        <Skeleton width="70%" height={16} style={{ marginBottom: Spacing.xs }} />
                        <Skeleton width="50%" height={14} />
                    </View>
                </View>
            </View>
        );
    }

    // Expense card (default)
    return (
        <View style={styles.expenseCard}>
            <View style={styles.expenseRow}>
                <Skeleton width={40} height={40} borderRadius={20} />
                <View style={styles.expenseInfo}>
                    <Skeleton width="60%" height={16} style={{ marginBottom: Spacing.xs }} />
                    <Skeleton width="40%" height={12} />
                </View>
                <Skeleton width={60} height={20} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    statCard: {
        padding: Spacing.lg,
        borderRadius: 20,
        marginBottom: Spacing.md,
    },
    groupCard: {
        padding: Spacing.md,
        borderRadius: 16,
        marginBottom: Spacing.sm,
    },
    groupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    groupInfo: {
        flex: 1,
    },
    expenseCard: {
        padding: Spacing.md,
        borderRadius: 16,
        marginBottom: Spacing.sm,
    },
    expenseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    expenseInfo: {
        flex: 1,
    },
});
