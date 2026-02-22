import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

/**
 * useUserBalanceSummary
 *
 * Computes the logged-in user's total "You Owe" and "Get Back" across ALL groups.
 * This powers the home screen stats cards with real data.
 *
 * Algorithm:
 * For each group the user belongs to:
 *   1. Sum up what they paid (total_paid from split_expenses where paid_by = user)
 *   2. Sum up what they owe (share_amount from expense_splits where user_id = user)
 *   3. Factor in settlements (from_user reduces owed, to_user reduces owed to them)
 *   4. net = total_paid - total_owed
 *      - positive net → user gets back money
 *      - negative net → user owes money
 */
export function useUserBalanceSummary() {
    const { user } = useAuth();
    const [totalOwe, setTotalOwe] = useState(0);
    const [totalGetBack, setTotalGetBack] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        calculateSummary();
    }, [user]);

    async function calculateSummary() {
        if (!user) return;

        try {
            setLoading(true);

            // 1. Get all groups the user belongs to
            const { data: memberships, error: memberError } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', user.id);

            if (memberError) throw memberError;
            if (!memberships || memberships.length === 0) {
                setTotalOwe(0);
                setTotalGetBack(0);
                return;
            }

            const groupIds = memberships.map(m => m.group_id);

            // 2. Get all split expenses across user's groups
            const { data: expenses, error: expError } = await supabase
                .from('split_expenses')
                .select('id, paid_by, total_amount, group_id, expense_splits(user_id, share_amount)')
                .in('group_id', groupIds);

            if (expError) throw expError;

            // 3. Get all settlements across user's groups
            const { data: settlements, error: settError } = await supabase
                .from('settlements')
                .select('from_user, to_user, amount, group_id')
                .in('group_id', groupIds);

            if (settError) throw settError;

            // 4. Calculate per-group balances for this user
            let owe = 0;
            let getBack = 0;

            // Track per-group net balance
            const groupBalances = new Map<string, number>();
            groupIds.forEach(gid => groupBalances.set(gid, 0));

            // Process expenses
            expenses?.forEach((expense: any) => {
                const gid = expense.group_id;
                let currentBalance = groupBalances.get(gid) || 0;

                // If user paid, they get credit for the total
                if (expense.paid_by === user.id) {
                    currentBalance += parseFloat(expense.total_amount);
                }

                // User's share (what they owe from this expense)
                expense.expense_splits?.forEach((split: any) => {
                    if (split.user_id === user.id) {
                        currentBalance -= parseFloat(split.share_amount);
                    }
                });

                groupBalances.set(gid, currentBalance);
            });

            // Process settlements
            settlements?.forEach((settlement: any) => {
                const gid = settlement.group_id;
                let currentBalance = groupBalances.get(gid) || 0;

                // User paid someone → treat like they paid more
                if (settlement.from_user === user.id) {
                    currentBalance += parseFloat(settlement.amount);
                }

                // Someone paid user → reduces what user is owed
                if (settlement.to_user === user.id) {
                    currentBalance -= parseFloat(settlement.amount);
                }

                groupBalances.set(gid, currentBalance);
            });

            // Sum up across all groups
            groupBalances.forEach((netBalance) => {
                if (netBalance > 0.01) {
                    getBack += netBalance;
                } else if (netBalance < -0.01) {
                    owe += Math.abs(netBalance);
                }
            });

            setTotalOwe(Math.round(owe * 100) / 100);
            setTotalGetBack(Math.round(getBack * 100) / 100);
        } catch (error) {
            console.error('Error calculating balance summary:', error);
        } finally {
            setLoading(false);
        }
    }

    return {
        totalOwe,
        totalGetBack,
        loading,
        refreshSummary: calculateSummary,
    };
}
