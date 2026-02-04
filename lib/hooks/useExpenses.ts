import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export type Expense = {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    user_id: string;
};

export function useExpenses() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Initial fetch
        fetchExpenses();

        // Real-time subscription
        const subscription = supabase
            .channel('personal_expenses_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'personal_expenses',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setExpenses((prev) => [payload.new as Expense, ...prev]);
                    } else if (payload.eventType === 'DELETE') {
                        setExpenses((prev) => prev.filter((e) => e.id !== payload.old.id));
                    } else if (payload.eventType === 'UPDATE') {
                        setExpenses((prev) =>
                            prev.map((e) => (e.id === payload.new.id ? (payload.new as Expense) : e))
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    async function fetchExpenses() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('personal_expenses')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                throw error;
            }

            if (data) {
                setExpenses(data);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    }

    async function addExpense(amount: number, description: string, category: string) {
        if (!user) return;

        const { error } = await supabase.from('personal_expenses').insert({
            user_id: user.id,
            amount,
            description,
            category,
            date: new Date().toISOString(),
        });

        if (error) {
            console.error('Error adding expense:', error);
            throw error;
        }
    }

    async function deleteExpense(id: string) {
        const { error } = await supabase.from('personal_expenses').delete().eq('id', id);

        if (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    }

    return {
        expenses,
        loading,
        addExpense,
        deleteExpense,
        refreshExpenses: fetchExpenses,
    };
}
