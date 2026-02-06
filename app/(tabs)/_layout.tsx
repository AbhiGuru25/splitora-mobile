import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

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
                        height: 70,
                        paddingBottom: 10,
                        paddingTop: 10,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    tabBarActiveTintColor: '#38bdf8', // Ice blue for active
                    tabBarInactiveTintColor: theme.textSecondary,
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                        marginTop: 4,
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
                        tabBarIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? 'home' : 'home-outline'}
                                size={24}
                                color={color}
                                style={{ opacity: focused ? 1 : 0.4 }} // 40% opacity when inactive
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="groups"
                    options={{
                        title: 'Groups',
                        tabBarLabel: 'Groups',
                        tabBarIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? 'people' : 'people-outline'}
                                size={24}
                                color={color}
                                style={{ opacity: focused ? 1 : 0.4 }}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="add"
                    options={{
                        title: 'Add',
                        tabBarLabel: '',
                        tabBarIcon: ({ focused }) => (
                            <View style={[styles.fab, {
                                backgroundColor: theme.primary,
                                shadowColor: '#38bdf8', // Ice-blue glow
                            }]}>
                                <Ionicons name="add" size={28} color="white" />
                            </View>
                        ),
                    }}
                    listeners={() => ({
                        tabPress: (e) => {
                            e.preventDefault();
                            // Add expense modal will open here
                        },
                    })}
                />
                <Tabs.Screen
                    name="activity"
                    options={{
                        title: 'Activity',
                        tabBarLabel: 'Activity',
                        tabBarIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? 'list' : 'list-outline'}
                                size={24}
                                color={color}
                                style={{ opacity: focused ? 1 : 0.4 }}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarLabel: 'Profile',
                        tabBarIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? 'person' : 'person-outline'}
                                size={24}
                                color={color}
                                style={{ opacity: focused ? 1 : 0.4 }}
                            />
                        ),
                    }}
                />
            </Tabs>
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20, // Float above navbar
        // Ice-blue glow effect
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
});
