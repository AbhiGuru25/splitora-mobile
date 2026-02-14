import { View } from 'react-native';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/Colors';
import { AuthProvider } from '../lib/hooks/useAuth';
import { ThemeProvider, useTheme } from '../lib/context/ThemeContext';
import { notificationService } from '../lib/notifications';

function RootLayoutContent() {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    // Don't auto-init notifications on load — only trigger when user enables manually
    // useEffect(() => {
    //     notificationService.initialize();
    // }, []);

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar style={activeColorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
                <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
                <Stack.Screen
                    name="group/[id]"
                    options={{
                        animation: 'slide_from_right',
                        presentation: 'card'
                    }}
                />
                <Stack.Screen
                    name="expense/add-split"
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom'
                    }}
                />
                <Stack.Screen
                    name="settle/[groupId]"
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom'
                    }}
                />
                <Stack.Screen
                    name="group/add-member"
                    options={{
                        presentation: 'transparentModal',
                        animation: 'fade',
                        contentStyle: { backgroundColor: 'transparent' }
                    }}
                />
            </Stack>
        </View>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <RootLayoutContent />
            </ThemeProvider>
        </AuthProvider>
    );
}
