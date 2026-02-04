import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import AppCard from '@/components/ui/AppCard';
import { supabase } from '@/lib/supabase';

export default function AddMemberScreen() {
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleAddMember() {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter an email address');
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
                    Alert.alert('User not found', 'No user found with this email. Make sure they have signed up for Splitora first.');
                    setLoading(false);
                    return;
                }
                // Found via loose match
                var userToAdd = looseUsers;
            } else {
                // Found via exact match
                var userToAdd = users;
            }

            // 2. Check if already in group
            const { data: existingMember, error: checkError } = await supabase
                .from('group_members')
                .select('id')
                .eq('group_id', groupId)
                .eq('user_id', userToAdd.id)
                .single();

            if (existingMember) {
                Alert.alert('Already added', 'This user is already in the group.');
                setLoading(false);
                return;
            }

            // 3. Add to group
            const { error: insertError } = await supabase
                .from('group_members')
                .insert({
                    group_id: groupId,
                    user_id: userToAdd.id
                });

            if (insertError) throw insertError;

            Alert.alert('Success', `${userToAdd.full_name} added to the group!`, [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (error: any) {
            console.error('Error adding member:', error);
            Alert.alert('Error', error.message || 'Failed to add member');
        } finally {
            setLoading(false);
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
                <AppCard>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>
                        Enter email address
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
                        Note: The user must already have a Splitora account.
                    </Text>
                </AppCard>

                <Button
                    title={loading ? "Adding..." : "Add to Group"}
                    onPress={handleAddMember}
                    loading={loading}
                    style={styles.button}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
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
        marginBottom: 4,
    },
    button: {
        marginTop: 24,
    }
});
