import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export type ExpenseSplit = {
    id?: string;
    expense_id?: string;
    user_id: string;
    share_amount: number;
};

export type SplitExpense = {
    id: string;
    group_id: string;
    paid_by: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    created_at?: string;
    splits?: ExpenseSplit[];
    paid_by_user?: {
        full_name: string;
        email: string;
    };
};

export function useSplitExpenses(groupId?: string) {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<SplitExpense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !groupId) {
            setLoading(false);
            return;
        }

        fetchExpenses();

        // Real-time subscription
        const subscription = supabase
            .channel(`split_expenses_${groupId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'split_expenses',
                    filter: `group_id=eq.${groupId}`,
                },
                () => {
                    fetchExpenses();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user, groupId]);

    async function fetchExpenses() {
        if (!groupId) return [];

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('split_expenses')
                .select(`
                    *,
                    paid_by_user:profiles!split_expenses_paid_by_fkey(full_name, email),
                    expense_splits(*)
                `)
                .eq('group_id', groupId)
                .order('date', { ascending: false });

            if (error) throw error;

            if (data) {
                setExpenses(data as SplitExpense[]);
                return data as SplitExpense[];
            }
            return [];
        } catch (error) {
            console.error('Error fetching split expenses:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }

    async function addSplitExpense(
        amount: number,
        description: string,
        category: string,
        paidBy: string,
        splits: ExpenseSplit[]
    ) {
        if (!user || !groupId) return;

        try {
            // 1. Create the split expense
            const { data: expenseData, error: expenseError } = await supabase
                .from('split_expenses')
                .insert({
                    group_id: groupId,
                    paid_by: paidBy,
                    amount,
                    description,
                    category,
                    date: new Date().toISOString(),
                })
                .select()
                .single();

            if (expenseError) throw expenseError;
            if (!expenseData) throw new Error('No expense data returned');

            // 2. Create the splits
            const splitsToInsert = splits.map(split => ({
                expense_id: expenseData.id,
                user_id: split.user_id,
                share_amount: split.share_amount,
            }));

            const { error: splitsError } = await supabase
                .from('expense_splits')
                .insert(splitsToInsert);

            if (splitsError) throw splitsError;

            // Refresh the list
            await fetchExpenses();
            return expenseData;
        } catch (error: any) {
            console.error('Error adding split expense:', error);
            throw error;
        }
    }

    async function deleteSplitExpense(expenseId: string) {
        try {
            // Splits will be deleted automatically via CASCADE
            const { error } = await supabase
                .from('split_expenses')
                .delete()
                .eq('id', expenseId);

            if (error) throw error;

            await fetchExpenses();
        } catch (error) {
            console.error('Error deleting split expense:', error);
            throw error;
        }
    }

    return {
        expenses,
        loading,
        addSplitExpense,
        deleteSplitExpense,
        refreshExpenses: fetchExpenses,
        fetchExpenses, // Allow direct calling for export
    };
}
