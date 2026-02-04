import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function EditProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];
    const { user } = useAuth();

    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [age, setAge] = useState('');
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);

    // Load initial profile data
    React.useEffect(() => {
        loadProfile();
    }, [user]);

    async function loadProfile() {
        try {
            if (!user?.id) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, age, mobile_number')
                .eq('id', user.id)
                .single();

            if (data) {
                setFullName(data.full_name || '');
                setAge(data.age ? data.age.toString() : '');
                setMobile(data.mobile_number || '');
            }
        } catch (e) {
            console.log('Error loading profile:', e);
        }
    }

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        try {
            setLoading(true);

            // 1. Update auth metadata (only supports standard fields or custom map)
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (authError) throw authError;

            // 2. Update public profile
            const updates = {
                full_name: fullName,
                age: age ? parseInt(age) : null,
                mobile_number: mobile,
                updated_at: new Date(),
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user?.id);

            if (profileError) throw profileError;

            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Input
                    label="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                />

                <Input
                    label="Mobile Number"
                    value={mobile}
                    onChangeText={setMobile}
                    placeholder="+91 98765 43210"
                    keyboardType="phone-pad"
                />

                <Input
                    label="Age"
                    value={age}
                    onChangeText={setAge}
                    placeholder="25"
                    keyboardType="numeric"
                    maxLength={3}
                />

                <Button
                    title="Save Changes"
                    onPress={handleSave}
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
    button: {
        marginTop: 24,
    }
});
