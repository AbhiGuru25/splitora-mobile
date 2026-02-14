import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import { Colors } from '@/constants/Colors';
import { Spacing, Radius, Typography } from '@/constants/Layout';
import { useTheme } from '@/lib/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import AppCard from '@/components/ui/AppCard';
import AppContainer from '@/components/ui/AppContainer';
import SectionHeader from '@/components/ui/SectionHeader';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { themeMode, setThemeMode, activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    const handleThemeToggle = () => {
        if (themeMode === 'system') setThemeMode('light');
        else if (themeMode === 'light') setThemeMode('dark');
        else setThemeMode('system');
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: signOut
                }
            ]
        );
    };

    const MenuItem = ({ icon, title, onPress, danger = false }: any) => (
        <AppCard style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemInner}>
                <View style={[styles.menuIcon, { backgroundColor: danger ? 'rgba(239, 68, 68, 0.1)' : theme.cardHighlight }]}>
                    <Ionicons name={icon} size={22} color={danger ? theme.danger : theme.primary} />
                </View>
                <Text style={[styles.menuTitle, { color: danger ? theme.danger : theme.text }]}>{title}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </View>
        </AppCard>
    );

    return (
        <AppContainer>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
                </View>

                {/* User Info Card */}
                <AppCard style={styles.userCard} delay={100}>
                    <View style={styles.avatarContainer}>
                        {/* Avatar with blue glow ring */}
                        <View style={[styles.avatarGlowRing]}>
                            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                                <Text style={styles.avatarText}>
                                    {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Text style={[styles.userName, { color: theme.text }]}>
                        {user?.user_metadata?.full_name || 'User'}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                        {user?.email}
                    </Text>
                </AppCard>

                {/* Divider after profile card */}
                <View style={[styles.sectionDivider, { backgroundColor: theme.border }]} />

                {/* Account Section */}
                <SectionHeader title="Account" />
                <MenuItem
                    icon="person-outline"
                    title="Edit Profile"
                    onPress={() => router.push('/profile/edit')}
                />
                <MenuItem
                    icon="lock-closed-outline"
                    title="Change Password"
                    onPress={() => router.push('/profile/change-password')}
                />

                {/* Preferences Section */}
                <SectionHeader title="Preferences" />
                <MenuItem
                    icon="notifications-outline"
                    title="Notifications"
                    onPress={() => router.push('/profile/notifications')}
                />
                <MenuItem
                    icon="moon-outline"
                    title={`Theme: ${themeMode === 'system' ? 'System' : themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}`}
                    onPress={handleThemeToggle}
                />

                {/* About Section */}
                <SectionHeader title="About" />
                <MenuItem
                    icon="information-circle-outline"
                    title="About Splitora"
                    onPress={() => router.push('/profile/about')}
                />
                <MenuItem
                    icon="help-circle-outline"
                    title="Help & Support"
                    onPress={() => router.push('/profile/help')}
                />

                {/* Sign Out — red text only, not full card red */}
                <View style={{ marginTop: Spacing.section }}>
                    <TouchableOpacity
                        onPress={handleSignOut}
                        style={[styles.signOutButton, { borderColor: theme.border }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="log-out-outline" size={20} color={theme.danger} />
                        <Text style={[styles.signOutText, { color: theme.danger }]}>Sign Out</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </AppContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingTop: Spacing.lg,
    },
    header: {
        paddingVertical: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    title: {
        ...Typography.title,
        fontSize: 32,
    },
    userCard: {
        alignItems: 'center',
        padding: Spacing.section,
        marginBottom: Spacing.sm,
    },
    avatarContainer: {
        marginBottom: Spacing.lg,
    },
    avatarGlowRing: {
        padding: 4,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: 'rgba(56, 189, 248, 0.4)',
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    avatar: {
        width: 76,
        height: 76,
        borderRadius: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: Spacing.xs,
    },
    userEmail: {
        fontSize: 14,
    },
    sectionDivider: {
        height: 1,
        marginVertical: Spacing.lg,
        opacity: 0.5,
    },
    menuItem: {
        marginBottom: Spacing.sm,
        padding: 0,
    },
    menuItemInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.card,
    },
    menuIcon: {
        width: 38,
        height: 38,
        borderRadius: Radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.lg,
    },
    menuTitle: {
        flex: 1,
        ...Typography.cardTitle,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.card,
        borderRadius: Radius.card,
        borderWidth: 1,
        gap: Spacing.sm,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
