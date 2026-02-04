import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppCard from '@/components/ui/AppCard';
import Button from '@/components/ui/Button';
import { useSplitExpenses, ExpenseSplit } from '@/lib/hooks/useSplitExpenses';
import { useAuth } from '@/lib/hooks/useAuth';
import { calculateEqualSplit, validateSplits } from '@/lib/utils/settlementAlgorithm';
import { supabase } from '@/lib/supabase';

type GroupMember = {
    user_id: string;
    full_name: string;
    email: string;
    selected: boolean;
    share_amount: number;
};

export default function AddSplitExpenseScreen() {
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];
    const { user } = useAuth();
    const { addSplitExpense } = useSplitExpenses(groupId);

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Food');
    const [paidBy, setPaidBy] = useState<string>(user?.id || '');
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [splitType, setSplitType] = useState<'equal' | 'unequal'>('equal');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGroupMembers();
    }, [groupId]);

    async function fetchGroupMembers() {
        if (!groupId) return;

        try {
            // Fetch group members
            const { data: membersData, error: membersError } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', groupId);

            if (membersError) throw membersError;
            if (!membersData || membersData.length === 0) {
                setMembers([]);
                return;
            }

            // Fetch profiles for those users
            const userIds = membersData.map(m => m.user_id);
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', userIds);

            if (profilesError) throw profilesError;

            // Combine the data
            const membersList: GroupMember[] = membersData.map((member) => {
                const profile = profilesData?.find(p => p.id === member.user_id);
                return {
                    user_id: member.user_id,
                    full_name: profile?.full_name || 'Unknown',
                    email: profile?.email || '',
                    selected: true, // All selected by default
                    share_amount: 0,
                };
            });

            setMembers(membersList);
            if (membersList.length > 0 && !paidBy) {
                setPaidBy(membersList[0].user_id);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    }

    function recalculateSplits() {
        if (!amount || members.length === 0) return;

        const totalAmount = parseFloat(amount);
        const selectedMembers = members.filter(m => m.selected);

        if (splitType === 'equal') {
            const shareAmount = calculateEqualSplit(totalAmount, selectedMembers.length);
            setMembers(prev =>
                prev.map(m => ({
                    ...m,
                    share_amount: m.selected ? shareAmount : 0,
                }))
            );
        }
    }

    useEffect(() => {
        recalculateSplits();
    }, [amount, splitType, members.map(m => m.selected).join(',')]);

    function toggleMember(userId: string) {
        setMembers(prev =>
            prev.map(m =>
                m.user_id === userId ? { ...m, selected: !m.selected } : m
            )
        );
    }

    function updateMemberShare(userId: string, value: string) {
        const shareAmount = parseFloat(value) || 0;
        setMembers(prev =>
            prev.map(m =>
                m.user_id === userId ? { ...m, share_amount: shareAmount } : m
            )
        );
    }

    async function handleSubmit() {
        if (!amount || !description || !paidBy) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const totalAmount = parseFloat(amount);
        const selectedMembers = members.filter(m => m.selected);

        if (selectedMembers.length === 0) {
            Alert.alert('Error', 'Please select at least one person to split with');
            return;
        }

        const splitAmounts = selectedMembers.map(m => m.share_amount);
        if (!validateSplits(totalAmount, splitAmounts)) {
            Alert.alert('Error', 'Split amounts do not add up to total amount');
            return;
        }

        try {
            setLoading(true);

            const splits: ExpenseSplit[] = selectedMembers.map(m => ({
                user_id: m.user_id,
                share_amount: m.share_amount,
            }));

            await addSplitExpense(totalAmount, description, category, paidBy, splits);

            Alert.alert('Success', 'Expense added successfully', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to add expense');
        } finally {
            setLoading(false);
        }
    }

    const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Utilities', 'Other'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Split Expense</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Amount */}
                <AppCard style={styles.card}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Amount</Text>
                    <View style={styles.amountInput}>
                        <Text style={[styles.currencySymbol, { color: theme.text }]}>₹</Text>
                        <TextInput
                            style={[styles.input, styles.amountText, { color: theme.text }]}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            placeholderTextColor={theme.textMuted}
                        />
                    </View>
                </AppCard>

                {/* Description */}
                <AppCard style={styles.card}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="What's this expense for?"
                        placeholderTextColor={theme.textMuted}
                    />
                </AppCard>

                {/* Category */}
                <AppCard style={styles.card}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    { borderColor: theme.border },
                                    category === cat && { backgroundColor: theme.primary, borderColor: theme.primary },
                                ]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[styles.categoryText, { color: category === cat ? 'white' : theme.text }]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </AppCard>

                {/* Paid By */}
                <AppCard style={styles.card}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Paid by</Text>
                    {members.map(member => (
                        <TouchableOpacity
                            key={member.user_id}
                            style={styles.memberRow}
                            onPress={() => setPaidBy(member.user_id)}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.memberName, { color: theme.text }]}>{member.full_name}</Text>
                            </View>
                            <Ionicons
                                name={paidBy === member.user_id ? 'radio-button-on' : 'radio-button-off'}
                                size={24}
                                color={paidBy === member.user_id ? theme.primary : theme.textMuted}
                            />
                        </TouchableOpacity>
                    ))}
                </AppCard>

                {/* Split Type */}
                <AppCard style={styles.card}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Split Type</Text>
                    <View style={styles.splitTypeRow}>
                        <TouchableOpacity
                            style={[
                                styles.splitTypeButton,
                                { borderColor: theme.border },
                                splitType === 'equal' && { backgroundColor: theme.primary, borderColor: theme.primary },
                            ]}
                            onPress={() => setSplitType('equal')}
                        >
                            <Text style={[styles.splitTypeText, { color: splitType === 'equal' ? 'white' : theme.text }]}>
                                Equal
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.splitTypeButton,
                                { borderColor: theme.border },
                                splitType === 'unequal' && { backgroundColor: theme.primary, borderColor: theme.primary },
                            ]}
                            onPress={() => setSplitType('unequal')}
                        >
                            <Text style={[styles.splitTypeText, { color: splitType === 'unequal' ? 'white' : theme.text }]}>
                                Unequal
                            </Text>
                        </TouchableOpacity>
                    </View>
                </AppCard>

                {/* Split Among */}
                <AppCard style={styles.card}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Split among</Text>
                    {members.map(member => (
                        <View key={member.user_id} style={styles.splitRow}>
                            <TouchableOpacity
                                style={styles.checkboxRow}
                                onPress={() => toggleMember(member.user_id)}
                            >
                                <Ionicons
                                    name={member.selected ? 'checkbox' : 'square-outline'}
                                    size={24}
                                    color={member.selected ? theme.primary : theme.textMuted}
                                />
                                <Text style={[styles.memberName, { color: theme.text, marginLeft: 12 }]}>
                                    {member.full_name}
                                </Text>
                            </TouchableOpacity>
                            {member.selected && (
                                <View style={styles.shareInput}>
                                    {splitType === 'equal' ? (
                                        <Text style={[styles.shareText, { color: theme.textSecondary }]}>
                                            ₹{member.share_amount.toFixed(2)}
                                        </Text>
                                    ) : (
                                        <TextInput
                                            style={[styles.shareInputField, { color: theme.text, borderColor: theme.border }]}
                                            value={member.share_amount.toString()}
                                            onChangeText={(val) => updateMemberShare(member.user_id, val)}
                                            keyboardType="decimal-pad"
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                    ))}
                </AppCard>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                <Button
                    title={loading ? 'Adding...' : 'Add Expense'}
                    onPress={handleSubmit}
                    disabled={loading}
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
    card: {
        padding: 20,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    amountInput: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: 'bold',
        marginRight: 8,
    },
    amountText: {
        fontSize: 32,
        fontWeight: 'bold',
        flex: 1,
    },
    input: {
        fontSize: 16,
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '500',
    },
    splitTypeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    splitTypeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    splitTypeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    splitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    shareInput: {
        minWidth: 80,
    },
    shareText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'right',
    },
    shareInputField: {
        fontSize: 16,
        padding: 8,
        borderWidth: 1,
        borderRadius: 8,
        textAlign: 'right',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
});
