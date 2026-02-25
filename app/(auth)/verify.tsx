import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function VerifyOtp() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

    async function verify() {
        if (token.trim().length < 6) {
            setError('Please enter the 6-digit code from your email.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email: email ?? '',
                token: token.trim(),
                type: 'signup',
            });
            if (verifyError) {
                setError(verifyError.message);
            }
            // On success AuthProvider redirects automatically
        } catch (err: any) {
            setError(err.message || 'Verification failed.');
        } finally {
            setLoading(false);
        }
    }

    async function resend() {
        setError(null);
        const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email ?? '',
        });
        if (resendError) {
            setError(resendError.message);
        } else {
            const msg = 'A new code has been sent to your email.';
            if (Platform.OS === 'web') {
                window.alert(msg);
            } else {
                Alert.alert('Code resent', msg);
            }
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={styles.inner}>
                <Text style={[styles.title, { color: theme.text }]}>Check your email</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    We sent a 6-digit code to{'\n'}
                    <Text style={{ color: theme.primary }}>{email}</Text>
                </Text>

                {error && (
                    <View style={[styles.errorBox, { borderColor: theme.danger }]}>
                        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
                    </View>
                )}

                <Input
                    label="Verification Code"
                    placeholder="123456"
                    value={token}
                    onChangeText={setToken}
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    maxLength={6}
                />

                <Button
                    title="Verify Email"
                    onPress={verify}
                    loading={loading}
                    style={styles.button}
                />

                <Text
                    style={[styles.resend, { color: theme.primary }]}
                    onPress={resend}
                >
                    Didn't receive it? Resend code
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    errorBox: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    errorText: { textAlign: 'center' },
    button: { marginTop: 8 },
    resend: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
});
