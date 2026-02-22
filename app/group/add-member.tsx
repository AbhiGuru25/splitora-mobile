import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import AppCard from '@/components/ui/AppCard';
import { supabase } from '@/lib/supabase';
import { useGroupInvite } from '@/lib/hooks/useGroupInvite';

export default function AddMemberScreen() {
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { generateInviteLink, loading: inviteLoading } = useGroupInvite();

    async function handleAddMember() {
        if (!email.trim()) {
            Platform.OS === 'web' ? window.alert('Please enter an email address') : Alert.alert('Error', 'Please enter an email address');
            return;
        }

        try {
            setLoading(true);
            const emailToFind = email.trim().toLowerCase();

            // 1. Find user by email
            const { data: users, error: searchError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('email', emailToFind)
                .single();

            if (searchError || !users) {
                // Try searching with ilike for better UX if exact match fails
                const { data: looseUsers, error: looseError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .ilike('email', emailToFind)
                    .single();

                if (looseError || !looseUsers) {
                    const msg = 'No user found with this email. Make sure they have signed up for Splitora first.';
                    Platform.OS === 'web' ? window.alert(msg) : Alert.alert('User not found', msg);
                    setLoading(false);
                    return;
                }
                var userToAdd = looseUsers;
            } else {
                var userToAdd = users;
            }

            // 2. Check if already in group
            const { data: existingMember } = await supabase
                .from('group_members')
                .select('id')
                .eq('group_id', groupId)
                .eq('user_id', userToAdd.id)
                .single();

            if (existingMember) {
                const msg = 'This user is already in the group.';
                Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Already added', msg);
                setLoading(false);
                return;
            }

            // 3. Add to group
            const { error: insertError } = await supabase
                .from('group_members')
                .insert({ group_id: groupId, user_id: userToAdd.id });

            if (insertError) throw insertError;

            const successMsg = `${userToAdd.full_name} added to the group!`;
            if (Platform.OS === 'web') {
                window.alert(successMsg);
                router.back();
            } else {
                Alert.alert('Success', successMsg, [{ text: 'OK', onPress: () => router.back() }]);
            }
        } catch (error: any) {
            console.error('Error adding member:', error);
            const msg = error.message || 'Failed to add member';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    }

    async function handleGetInviteLink() {
        const result = await generateInviteLink(groupId as string);
        if (result) {
            setInviteUrl(result.url);
            setInviteCode(result.code);
        } else {
            const msg = 'Failed to generate invite link.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
        }
    }

    async function handleCopyLink() {
        if (!inviteUrl) return;
        if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            // On native, fall back to share sheet
            handleShareLink();
        }
    }

    async function handleShareLink() {
        if (!inviteUrl || !inviteCode) return;
        const message = `Join my group on Splitora!\n\nCode: ${inviteCode}\nLink: ${inviteUrl}`;
        if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
            await navigator.share({ title: 'Join my Splitora group', text: message, url: inviteUrl });
        } else if (Platform.OS !== 'web') {
            const { Share } = require('react-native');
            await Share.share({ message });
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Add Member</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>
                {/* Email add */}
                <AppCard>
                    <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                        Add by email
                    </Text>
                    <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                        <Ionicons name="mail-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="friend@example.com"
                            placeholderTextColor={theme.textMuted}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                    <Text style={[styles.hint, { color: theme.textMuted }]}>
                        They must already have a Splitora account.
                    </Text>
                </AppCard>

                <Button
                    title={loading ? 'Adding...' : 'Add to Group'}
                    onPress={handleAddMember}
                    loading={loading}
                    style={styles.button}
                />

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR</Text>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                </View>

                {/* Invite link section */}
                <AppCard>
                    <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                        Share an invite link
                    </Text>
                    <Text style={[styles.hint, { color: theme.textMuted }]}>
                        Anyone with this link can join, even if they don't have an account yet.
                    </Text>

                    {inviteUrl ? (
                        <View style={styles.linkRow}>
                            {/* Code badge */}
                            <View style={[styles.codeBadge, { backgroundColor: theme.surfaceHighlight, borderColor: theme.border }]}>
                                <Text style={[styles.codeText, { color: theme.primary }]}>{inviteCode}</Text>
                            </View>

                            {/* Action buttons */}
                            <View style={styles.linkActions}>
                                <TouchableOpacity
                                    onPress={handleCopyLink}
                                    style={[styles.actionBtn, { backgroundColor: copied ? 'rgba(16,185,129,0.12)' : theme.surfaceHighlight, borderColor: theme.border }]}
                                >
                                    <Ionicons
                                        name={copied ? 'checkmark' : 'copy-outline'}
                                        size={18}
                                        color={copied ? theme.success : theme.primary}
                                    />
                                    <Text style={[styles.actionBtnText, { color: copied ? theme.success : theme.primary }]}>
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleShareLink}
                                    style={[styles.actionBtn, { backgroundColor: theme.surfaceHighlight, borderColor: theme.border }]}
                                >
                                    <Ionicons name="share-outline" size={18} color={theme.primary} />
                                    <Text style={[styles.actionBtnText, { color: theme.primary }]}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Button
                            title={inviteLoading ? 'Generating...' : 'Generate Invite Link'}
                            onPress={handleGetInviteLink}
                            loading={inviteLoading}
                            style={[styles.button, { marginTop: 12 }]}
                        />
                    )}
                </AppCard>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        gap: 0,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        marginBottom: 8,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    hint: {
        fontSize: 12,
        lineHeight: 18,
    },
    button: {
        marginTop: 16,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        gap: 12,
    },
    divider: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    linkRow: {
        marginTop: 14,
        gap: 12,
    },
    codeBadge: {
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    codeText: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 5,
        textAlign: 'center',
    },
    linkActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
