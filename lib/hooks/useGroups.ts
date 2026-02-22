import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Alert } from 'react-native';

export type Group = {
    id: string;
    name: string;
    created_by: string;
    member_count: number;
    user_balance: number; // positive = gets back, negative = owes
};

export function useGroups() {
    const { user } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGroups = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // 1. Fetch groups the user belongs to
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select(`*, group_members!inner (user_id)`)
                .eq('group_members.user_id', user.id)
                .order('created_at', { ascending: false });

            if (groupError) throw groupError;
            if (!groupData || groupData.length === 0) {
                setGroups([]);
                return;
            }

            const groupIds = groupData.map((g: any) => g.id);

            // 2. Fetch member counts for all groups
            const { data: allMembers, error: membersError } = await supabase
                .from('group_members')
                .select('group_id, user_id')
                .in('group_id', groupIds);

            if (membersError) throw membersError;

            const memberCountMap = new Map<string, number>();
            allMembers?.forEach((m: any) => {
                memberCountMap.set(m.group_id, (memberCountMap.get(m.group_id) || 0) + 1);
            });

            // 3. Fetch split expenses + splits for balance calculation
            const { data: expenses, error: expError } = await supabase
                .from('split_expenses')
                .select('id, group_id, paid_by, total_amount, expense_splits(user_id, share_amount)')
                .in('group_id', groupIds);

            if (expError) throw expError;

            // 4. Fetch settlements
            const { data: settlements, error: settError } = await supabase
                .from('settlements')
                .select('group_id, from_user, to_user, amount')
                .in('group_id', groupIds);

            if (settError) throw settError;

            // 5. Calculate per-group balance for the current user
            const balanceMap = new Map<string, number>();
            groupIds.forEach(gid => balanceMap.set(gid, 0));

            expenses?.forEach((expense: any) => {
                const gid = expense.group_id;
                let bal = balanceMap.get(gid) || 0;

                // User paid → credit
                if (expense.paid_by === user.id) {
                    bal += parseFloat(expense.total_amount);
                }

                // User's share → debit
                expense.expense_splits?.forEach((split: any) => {
                    if (split.user_id === user.id) {
                        bal -= parseFloat(split.share_amount);
                    }
                });

                balanceMap.set(gid, bal);
            });

            settlements?.forEach((settlement: any) => {
                const gid = settlement.group_id;
                let bal = balanceMap.get(gid) || 0;

                if (settlement.from_user === user.id) {
                    bal += parseFloat(settlement.amount);
                }
                if (settlement.to_user === user.id) {
                    bal -= parseFloat(settlement.amount);
                }

                balanceMap.set(gid, bal);
            });

            // 6. Assemble final group objects
            const enrichedGroups: Group[] = groupData.map((g: any) => ({
                id: g.id,
                name: g.name,
                created_by: g.created_by,
                member_count: memberCountMap.get(g.id) || 0,
                user_balance: Math.round((balanceMap.get(g.id) || 0) * 100) / 100,
            }));

            setGroups(enrichedGroups);
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const createGroup = async (name: string) => {
        if (!user) return null;

        try {
            // 1. Create the group
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .insert([{ name, created_by: user.id }])
                .select()
                .single();

            if (groupError) throw groupError;
            if (!groupData) throw new Error('No group data returned');

            // 2. Add creator as a member
            const { error: memberError } = await supabase
                .from('group_members')
                .insert([{ group_id: groupData.id, user_id: user.id }]);

            if (memberError) throw memberError;

            // Refresh list
            await fetchGroups();
            return groupData;
        } catch (error: any) {
            console.error('Error creating group:', error);
            Alert.alert('Error', error.message);
            return null;
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [user]);

    return {
        groups,
        loading,
        refreshGroups: fetchGroups,
        createGroup
    };
}
