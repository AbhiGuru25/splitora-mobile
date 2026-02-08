import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { haptics } from '@/lib/utils/haptics';

export default function AddExpenseScreen() {
    const router = useRouter();
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];
    const { addExpense } = useExpenses();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = ['Food 🍽️', 'Travel 🚗', 'Shopping 🛒', 'Entertainment 🎬', 'Bills 📄', 'Other 💸'];

    const handleSubmit = async () => {
        if (!amount || !description || !category) return;

        try {
            setLoading(true);
            await addExpense(parseFloat(amount), description, category);

            // Success feedback
            haptics.success();
            router.back();
        } catch (error) {
            haptics.error();
            alert('Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Add Expense</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: theme.primary, fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Amount</Text>
                    <View style={[styles.amountInputContainer, { borderBottomColor: theme.primary }]}>
                        <Text style={[styles.currency, { color: theme.text }]}>₹</Text>
                        <Input
                            label=""
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            style={[styles.amountInput, { color: theme.text, backgroundColor: 'transparent', borderWidth: 0 }]}
                            placeholder="0"
                        />
                    </View>
                </View>

                <Input
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What is this for?"
                />

                <Text style={[styles.label, { color: theme.textSecondary, marginBottom: 12 }]}>Category</Text>
                <View style={styles.categories}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                {
                                    borderColor: theme.border,
                                    backgroundColor: category === cat ? theme.primary : theme.surface
                                }
                            ]}
                            onPress={() => {
                                haptics.selection();
                                setCategory(cat);
                            }}
                        >
                            <Text style={{ color: category === cat ? 'white' : theme.text }}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Button
                    title="Save Expense"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={!amount || !description || !category}
                    style={styles.submitButton}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16, // Tighter layout
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        paddingBottom: 4,
    },
    currency: {
        fontSize: 32,
        fontWeight: 'bold',
        marginRight: 8,
    },
    amountInput: {
        fontSize: 32,
        fontWeight: 'bold',
        flex: 1,
        height: 50,
        paddingHorizontal: 0,
    },
    categories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 32,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    submitButton: {
        marginTop: 'auto',
    }
});
