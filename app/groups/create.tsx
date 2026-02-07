import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useGroups } from '@/lib/hooks/useGroups';
import { Ionicons } from '@expo/vector-icons';

export default function CreateGroupScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];
    const { createGroup } = useGroups();

    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;

        setLoading(true);
        const group = await createGroup(name);
        setLoading(false);

        if (group) {
            router.back();
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Create Group',
                    headerStyle: { backgroundColor: theme.background },
                    headerTintColor: theme.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    )
                }}
            />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.primary + '20' }]}>
                        <Ionicons name="people" size={40} color={theme.primary} />
                    </View>
                </View>

                <Text style={[styles.title, { color: theme.text }]}>New Group</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Create a group to split expenses with friends, family, or housemates.
                </Text>

                <View style={styles.form}>
                    <Input
                        label="Group Name"
                        placeholder="e.g. Trip to Goa, House Rent"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Create Group"
                        onPress={handleCreate}
                        loading={loading}
                        disabled={!name.trim()}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16, // Tighter layout
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    form: {
        flex: 1,
    },
    footer: {
        paddingBottom: 20,
    }
});
