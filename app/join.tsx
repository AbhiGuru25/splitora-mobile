import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ActivityIndicator,
    TouchableOpacity, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { useGroupInvite, InviteInfo } from '@/lib/hooks/useGroupInvite';
import Button from '@/components/ui/Button';

export default function JoinGroupScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const router = useRouter();
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];
    const { user } = useAuth();
    const { getInviteInfo, joinViaCode, loading } = useGroupInvite();

    const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [joined, setJoined] = useState(false);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (code) {
            loadInvite(code as string);
        }
    }, [code]);

    async function loadInvite(inviteCode: string) {
        const info = await getInviteInfo(inviteCode);
        if (info) {
            setInviteInfo(info);
        } else {
            setFetchError('This invite link is invalid or has expired.');
        }
    }

    async function handleJoin() {
        if (!user) {
            // Redirect to login, then come back
            router.push(`/auth/login?redirect=/join?code=${code}`);
            return;
        }

        setJoining(true);
        const error = await joinViaCode(code as string);
        setJoining(false);

        if (error === null || error === 'already_member') {
            setJoined(true);
            // Navigate to the group after a brief pause
            setTimeout(() => {
                if (inviteInfo?.groupId) {
                    router.replace(`/group/${inviteInfo.groupId}`);
                } else {
                    router.replace('/(tabs)/groups');
                }
            }, 1500);
        } else {
            setFetchError(error);
        }
    }

    const firstLetter = inviteInfo?.groupName?.charAt(0).toUpperCase() || '?';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.gradientTop, { backgroundColor: 'rgba(56,189,248,0.04)' }]} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/groups')} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {loading && !inviteInfo ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                            Loading invite...
                        </Text>
                    </View>
                ) : fetchError ? (
                    <View style={styles.center}>
                        <View style={[styles.errorIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                            <Ionicons name="close-circle-outline" size={52} color={theme.danger} />
                        </View>
                        <Text style={[styles.errorTitle, { color: theme.text }]}>Invalid Invite</Text>
                        <Text style={[styles.errorSubtitle, { color: theme.textSecondary }]}>
                            {fetchError}
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.replace('/(tabs)/groups')}
                            style={[styles.goHomeBtn, { borderColor: theme.border }]}
                        >
                            <Text style={[styles.goHomeText, { color: theme.textSecondary }]}>Go Home</Text>
                        </TouchableOpacity>
                    </View>
                ) : joined ? (
                    <View style={styles.center}>
                        <View style={[styles.successIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                            <Ionicons name="checkmark-circle" size={64} color={theme.success} />
                        </View>
                        <Text style={[styles.successTitle, { color: theme.text }]}>You're In!</Text>
                        <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
                            Redirecting to {inviteInfo?.groupName}...
                        </Text>
                    </View>
                ) : inviteInfo ? (
                    <View style={styles.inviteCard}>
                        {/* Group avatar */}
                        <View style={[styles.groupAvatar, { backgroundColor: 'rgba(56,189,248,0.12)', borderColor: 'rgba(56,189,248,0.25)' }]}>
                            <Text style={styles.groupInitial}>{firstLetter}</Text>
                        </View>

                        <Text style={[styles.invitedLabel, { color: theme.textMuted }]}>
                            You've been invited to join
                        </Text>
                        <Text style={[styles.groupName, { color: theme.text }]}>
                            {inviteInfo.groupName}
                        </Text>

                        <View style={[styles.codeBadge, { backgroundColor: theme.surfaceHighlight, borderColor: theme.border }]}>
                            <Text style={[styles.codeLabel, { color: theme.textMuted }]}>Invite Code</Text>
                            <Text style={[styles.codeText, { color: theme.primary }]}>{inviteInfo.code}</Text>
                        </View>

                        {inviteInfo.expiresAt && (
                            <Text style={[styles.expiryText, { color: theme.textMuted }]}>
                                Expires {new Date(inviteInfo.expiresAt).toLocaleDateString()}
                            </Text>
                        )}

                        {!user && (
                            <View style={[styles.authNotice, { backgroundColor: 'rgba(56,189,248,0.08)', borderColor: 'rgba(56,189,248,0.2)' }]}>
                                <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
                                <Text style={[styles.authNoticeText, { color: theme.textSecondary }]}>
                                    You'll need to sign in first
                                </Text>
                            </View>
                        )}

                        <Button
                            title={joining ? 'Joining...' : user ? `Join ${inviteInfo.groupName}` : 'Sign In & Join'}
                            onPress={handleJoin}
                            loading={joining}
                            style={styles.joinBtn}
                        />
                    </View>
                ) : null}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradientTop: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 300,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
    },
    backBtn: {
        padding: 8,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    center: {
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 12,
    },
    errorIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    errorSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    goHomeBtn: {
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    goHomeText: {
        fontSize: 15,
        fontWeight: '600',
    },
    successIcon: {
        width: 112,
        height: 112,
        borderRadius: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '800',
    },
    successSubtitle: {
        fontSize: 15,
        textAlign: 'center',
    },
    inviteCard: {
        alignItems: 'center',
        gap: 12,
    },
    groupAvatar: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 8,
    },
    groupInitial: {
        fontSize: 36,
        fontWeight: '800',
        color: '#38BDF8',
    },
    invitedLabel: {
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    groupName: {
        fontSize: 30,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    codeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 4,
    },
    codeLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    codeText: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 4,
    },
    expiryText: {
        fontSize: 12,
    },
    authNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 4,
    },
    authNoticeText: {
        fontSize: 13,
    },
    joinBtn: {
        marginTop: 12,
        width: '100%',
    },
});
