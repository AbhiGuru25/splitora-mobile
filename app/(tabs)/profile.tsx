import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import AppCard from '@/components/ui/AppCard';
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
                </View>

                {/* User Info Card */}
                <AppCard style={styles.userCard} delay={100}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                            <Text style={styles.avatarText}>
                                {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.userName, { color: theme.text }]}>
                        {user?.user_metadata?.full_name || 'User'}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                        {user?.email}
                    </Text>
                </AppCard>

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

                {/* Sign Out */}
                <View style={{ marginTop: 24 }}>
                    <MenuItem
                        icon="log-out-outline"
                        title="Sign Out"
                        onPress={handleSignOut}
                        danger={true}
                    />
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        paddingHorizontal: 4,
        paddingVertical: 16,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    userCard: {
        alignItems: 'center',
        padding: 32,
        marginBottom: 8,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    menuItem: {
        marginBottom: 12,
        padding: 0,
    },
    menuItemInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
});
