import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Alert } from 'react-native';

export type Group = {
    id: string;
    name: string;
    created_by: string;
    member_count?: number; // Optional, for display
};

export function useGroups() {
    const { user } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGroups = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('groups')
                .select(`*, group_members!inner (user_id)`)
                .eq('group_members.user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGroups(data || []);
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
