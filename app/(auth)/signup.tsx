import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    Alert
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // We'll need to create a profile trigger for this
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

    async function signUpWithEmail() {
        if (!name.trim()) {
            setError('Please enter your full name.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const { data: { session, user }, error: signUpError } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        full_name: name.trim(),
                    }
                }
            });

            if (signUpError) {
                setError(signUpError.message);
                return;
            }

            if (!user) {
                setError('Signup failed. Please try again.');
                return;
            }

            // Profile is auto-created by the handle_new_user DB trigger.
            // If email confirmation is required, session will be null — go to OTP verify screen.
            if (!session) {
                router.replace({
                    pathname: '/(auth)/verify',
                    params: { email: email.trim() },
                });
            }
            // If no email confirmation needed, AuthProvider will auto-redirect.
        } catch (err: any) {
            setError(err.message || 'An error occurred during signup');
        } finally {
            setLoading(false);
        }
    }

    const Content = (
        <View style={[styles.content, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.logo, { color: theme.text }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Join Splitora to track expenses and split bills seamlessly.
                    </Text>
                </View>

                <View style={styles.form}>
                    {error && (
                        <View style={[styles.errorContainer, { borderColor: theme.danger }]}>
                            <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
                        </View>
                    )}

                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                    />

                    <Input
                        label="Email"
                        placeholder="john@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Button
                        title="Sign Up"
                        onPress={signUpWithEmail}
                        loading={loading}
                        style={styles.button}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                        Already have an account?
                    </Text>
                    <Link href="/(auth)/login" asChild>
                        <Text style={{ ...styles.link, color: theme.primary }}>Sign In</Text>
                    </Link>
                </View>
            </ScrollView>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {Platform.OS === 'web' ? (
                Content
            ) : (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {Content}
                </TouchableWithoutFeedback>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        marginBottom: 32,
    },
    button: {
        marginTop: 16,
    },
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    errorText: {
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 14,
    },
    link: {
        fontSize: 14,
        fontWeight: '600',
    },
});
