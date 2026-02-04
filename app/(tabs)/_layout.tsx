import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

    // Tab Icons (Placeholder text for now, can replace with icons later)
    const TabIcon = ({ name, focused, label }: { name: string, focused: boolean, label: string }) => (
        <View style={styles.tabItem}>
            <View style={{ opacity: focused ? 1 : 0.5 }}>
                {/* Using Emoji for simplicity as requested in previous design, can implement icons */}
                <View style={{ transform: [{ scale: focused ? 1.2 : 1 }] }}>
                    {/* Text-based icons for now until vector-icons setup is confirmed working perfectly */}
                </View>
            </View>
        </View>
    );

    return (
        <>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: theme.surface,
                        borderTopColor: theme.border,
                        borderTopWidth: 1,
                        height: 70, // Premium height
                        paddingBottom: 10,
                        paddingTop: 10,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    tabBarActiveTintColor: theme.primary,
                    tabBarInactiveTintColor: theme.textSecondary,
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                        marginBottom: 4,
                    },
                    tabBarIconStyle: {
                        marginBottom: 0,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarLabel: 'Home',
                        tabBarIcon: ({ color, size }) => <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2, opacity: 0.2 }} />, // Placeholder circle
                    }}
                />
                <Tabs.Screen
                    name="groups"
                    options={{
                        title: 'Groups',
                        tabBarLabel: 'Groups',
                        tabBarIcon: ({ color, size }) => <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2, opacity: 0.2 }} />,
                    }}
                />
                <Tabs.Screen
                    name="add"
                    options={{
                        title: 'Add',
                        tabBarLabel: '',
                        tabBarIcon: ({ focused }) => (
                            <View style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: theme.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 20, // Elevate above tab bar
                                shadowColor: theme.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 4,
                            }}>
                                <View style={{ width: 24, height: 2, backgroundColor: 'white', position: 'absolute' }} />
                                <View style={{ width: 2, height: 24, backgroundColor: 'white', position: 'absolute' }} />
                            </View>
                        ),
                    }}
                    listeners={() => ({
                        tabPress: (e) => {
                            e.preventDefault();
                            // Open add modal logic here
                        },
                    })}
                />
                <Tabs.Screen
                    name="activity"
                    options={{
                        title: 'Activity',
                        tabBarLabel: 'Activity',
                        tabBarIcon: ({ color, size }) => <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2, opacity: 0.2 }} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarLabel: 'Profile',
                        tabBarIcon: ({ color, size }) => <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2, opacity: 0.2 }} />,
                    }}
                />
            </Tabs>
        </>
    );
}

const styles = StyleSheet.create({
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
