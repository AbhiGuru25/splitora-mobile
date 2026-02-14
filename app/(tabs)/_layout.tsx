import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { haptics } from '@/lib/utils/haptics';

export default function TabLayout() {
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const fabScale = useSharedValue(1);

    const fabAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: fabScale.value }],
    }));

    const handleFABPress = () => {
        haptics.medium();

        fabScale.value = withSpring(0.9, { damping: 10 });
        setTimeout(() => {
            fabScale.value = withSpring(1, { damping: 10 });
        }, 100);

        setTimeout(() => {
            router.push('/addExpense');
        }, 150);
    };

    // Tab icon with top indicator line
    const TabIcon = ({ focused, color, name, outlineName }: {
        focused: boolean;
        color: string;
        name: string;
        outlineName: string;
    }) => (
        <View style={styles.tabIconContainer}>
            {focused && <View style={[styles.activeIndicator, { backgroundColor: '#38bdf8' }]} />}
            <Ionicons
                name={(focused ? name : outlineName) as any}
                size={22}
                color={color}
                style={{ opacity: focused ? 1 : 0.5 }}
            />
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
                        height: 64,
                        paddingBottom: 8,
                        paddingTop: 6,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    tabBarActiveTintColor: '#38bdf8',
                    tabBarInactiveTintColor: theme.textSecondary,
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                        marginTop: 2,
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
                            <TabIcon
                                focused={focused}
                                color={color}
                                name="home"
                                outlineName="home-outline"
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
                            <TabIcon
                                focused={focused}
                                color={color}
                                name="people"
                                outlineName="people-outline"
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="add"
                    options={{
                        title: 'Add',
                        tabBarLabel: '',
                        tabBarButton: () => (
                            <TouchableOpacity
                                onPress={handleFABPress}
                                activeOpacity={0.9}
                                style={styles.fabWrapper}
                            >
                                <Animated.View
                                    style={[styles.fab, fabAnimatedStyle, {
                                        backgroundColor: theme.primary,
                                        shadowColor: '#38bdf8',
                                    }]}
                                >
                                    <Ionicons name="add" size={28} color="white" />
                                </Animated.View>
                            </TouchableOpacity>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="activity"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="analytics"
                    options={{
                        title: 'Analytics',
                        tabBarLabel: 'Analytics',
                        tabBarIcon: ({ focused, color }) => (
                            <TabIcon
                                focused={focused}
                                color={color}
                                name="stats-chart"
                                outlineName="stats-chart-outline"
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
                            <TabIcon
                                focused={focused}
                                color={color}
                                name="person"
                                outlineName="person-outline"
                            />
                        ),
                    }}
                />
            </Tabs>
        </>
    );
}

const styles = StyleSheet.create({
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: 32,
    },
    activeIndicator: {
        position: 'absolute',
        top: -10,
        width: 20,
        height: 2,
        borderRadius: 1,
    },
    fabWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
});
