import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/Colors';
import { AuthProvider } from '../lib/hooks/useAuth';
import { ThemeProvider, useTheme } from '../lib/context/ThemeContext';

function RootLayoutContent() {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

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
