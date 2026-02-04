import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { minimizeTransactions } from '@/lib/utils/settlementAlgorithm';

export type UserBalance = {
    user_id: string;
    user_name: string;
    user_email: string;
    total_paid: number;
    total_owed: number;
    net_balance: number; // positive = gets back, negative = owes
};

export type SimplifiedDebt = {
    from_user: string;
    from_user_name: string;
    to_user: string;
    to_user_name: string;
    amount: number;
};

export function useBalances(groupId?: string) {
    const [balances, setBalances] = useState<UserBalance[]>([]);
    const [settlements, setSettlements] = useState<SimplifiedDebt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!groupId) {
            setLoading(false);
            return;
        }

        calculateBalances();
    }, [groupId]);

    async function calculateBalances() {
        if (!groupId) return;

        try {
            setLoading(true);

            // 1. Get all group members
            // Fetch group members
            const { data: membersData, error: membersError } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', groupId);

            if (membersError) throw membersError;
            if (!membersData || membersData.length === 0) {
                setBalances([]);
                setSettlements([]);
                return;
            }

            // Fetch profiles for those users
            const userIds = membersData.map(m => m.user_id);
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', userIds);

            if (profilesError) throw profilesError;

            // Create a map for quick profile lookup
            const profilesMap = new Map<string, { id: string; full_name: string; email: string }>();
            profilesData?.forEach(profile => {
                profilesMap.set(profile.id, profile);
            });

            // 2. Get all split expenses for this group
            const { data: expenses, error: expensesError } = await supabase
                .from('split_expenses')
                .select(`
                    id,
                    paid_by,
                    amount,
                    expense_splits(user_id, share_amount)
                `)
                .eq('group_id', groupId);

            if (expensesError) throw expensesError;

            // 3. Get all settlements for this group
            const { data: settlementsData, error: settlementsError } = await supabase
                .from('settlements')
                .select('from_user, to_user, amount')
                .eq('group_id', groupId);

            if (settlementsError) throw settlementsError;

            // 4. Calculate balances
            const balanceMap = new Map<string, UserBalance>();

            // Initialize all members
            membersData?.forEach((member: any) => {
                const profile = profilesMap.get(member.user_id);
                balanceMap.set(member.user_id, {
                    user_id: member.user_id,
                    user_name: profile?.full_name || 'Unknown',
                    user_email: profile?.email || '',
                    total_paid: 0,
                    total_owed: 0,
                    net_balance: 0,
                });
            });

            // Add up expenses
            expenses?.forEach((expense: any) => {
                const paidBy = expense.paid_by;

                // Add to total_paid for the payer
                const payer = balanceMap.get(paidBy);
                if (payer) {
                    payer.total_paid += parseFloat(expense.amount);
                }

                // Add to total_owed for each person who owes
                expense.expense_splits?.forEach((split: any) => {
                    const person = balanceMap.get(split.user_id);
                    if (person) {
                        person.total_owed += parseFloat(split.share_amount);
                    }
                });
            });

            // Subtract settlements
            settlementsData?.forEach((settlement: any) => {
                const from = balanceMap.get(settlement.from_user);
                const to = balanceMap.get(settlement.to_user);

                if (from) {
                    from.total_paid += parseFloat(settlement.amount);
                }
                if (to) {
                    to.total_owed -= parseFloat(settlement.amount);
                }
            });

            // Calculate net balances
            balanceMap.forEach((balance) => {
                balance.net_balance = balance.total_paid - balance.total_owed;
            });

            const balancesArray = Array.from(balanceMap.values());
            setBalances(balancesArray);

            // 5. Generate settlement suggestions
            const settlementPlan = minimizeTransactions(balancesArray);
            setSettlements(settlementPlan);

        } catch (error) {
            console.error('Error calculating balances:', error);
        } finally {
            setLoading(false);
        }
    }

    async function recordSettlement(fromUser: string, toUser: string, amount: number) {
        if (!groupId) return;

        try {
            const { error } = await supabase
                .from('settlements')
                .insert({
                    group_id: groupId,
                    from_user: fromUser,
                    to_user: toUser,
                    amount,
                    settled_at: new Date().toISOString(),
                });

            if (error) throw error;

            // Recalculate balances
            await calculateBalances();
        } catch (error) {
            console.error('Error recording settlement:', error);
            throw error;
        }
    }

    return {
        balances,
        settlements,
        loading,
        refreshBalances: calculateBalances,
        recordSettlement,
    };
}
