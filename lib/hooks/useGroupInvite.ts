import { useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// Base URL for invite links
const BASE_URL = Platform.OS === 'web'
    ? (typeof window !== 'undefined' ? window.location.origin : 'https://splitora.in')
    : 'https://splitora.in';

/** Generate a random 6-character alphanumeric code */
function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No 0/O/I/1 to avoid confusion
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export type InviteInfo = {
    code: string;
    groupId: string;
    groupName: string;
    expiresAt: string | null;
};

export function useGroupInvite() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    /**
     * Generate (or reuse existing) invite code for a group.
     * Returns the full shareable URL.
     */
    async function generateInviteLink(groupId: string): Promise<{ code: string; url: string } | null> {
        if (!user) return null;

        try {
            setLoading(true);

            // Check if a valid (non-expired) code already exists for this group
            const { data: existing } = await supabase
                .from('group_invite_codes')
                .select('code, expires_at')
                .eq('group_id', groupId)
                .eq('created_by', user.id)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (existing) {
                const url = `${BASE_URL}/join?code=${existing.code}`;
                return { code: existing.code, url };
            }

            // Generate new code (retry if collision)
            let code = generateCode();
            let attempts = 0;
            while (attempts < 5) {
                const { error } = await supabase
                    .from('group_invite_codes')
                    .insert({
                        group_id: groupId,
                        code,
                        created_by: user.id,
                        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    });

                if (!error) break;
                if (error.code === '23505') {
                    // Unique violation — try another code
                    code = generateCode();
                    attempts++;
                } else {
                    throw error;
                }
            }

            const url = `${BASE_URL}/join?code=${code}`;
            return { code, url };
        } catch (error) {
            console.error('Error generating invite link:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }

    /**
     * Fetch group info for a given invite code (used on the join screen).
     */
    async function getInviteInfo(code: string): Promise<InviteInfo | null> {
        try {
            setLoading(true);
            const upperCode = code.trim().toUpperCase();

            const { data, error } = await supabase
                .from('group_invite_codes')
                .select('code, group_id, expires_at, groups(name)')
                .eq('code', upperCode)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (error || !data) return null;

            return {
                code: data.code,
                groupId: data.group_id,
                groupName: (data.groups as any)?.name || 'Unknown Group',
                expiresAt: data.expires_at,
            };
        } catch (error) {
            console.error('Error fetching invite info:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }

    /**
     * Join a group using an invite code.
     * Returns null on success, or an error message string.
     */
    async function joinViaCode(code: string): Promise<string | null> {
        if (!user) return 'You must be signed in to join a group.';

        try {
            setLoading(true);
            const upperCode = code.trim().toUpperCase();

            // Get the invite
            const invite = await getInviteInfo(upperCode);
            if (!invite) return 'Invite code is invalid or has expired.';

            // Check if already a member
            const { data: already } = await supabase
                .from('group_members')
                .select('id')
                .eq('group_id', invite.groupId)
                .eq('user_id', user.id)
                .single();

            if (already) return 'already_member';

            // Add as member
            const { error } = await supabase
                .from('group_members')
                .insert({ group_id: invite.groupId, user_id: user.id });

            if (error) throw error;

            return null; // success
        } catch (error: any) {
            console.error('Error joining via code:', error);
            return error.message || 'Failed to join group.';
        } finally {
            setLoading(false);
        }
    }

    return {
        loading,
        generateInviteLink,
        getInviteInfo,
        joinViaCode,
    };
}
