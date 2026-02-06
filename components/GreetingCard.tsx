import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface GreetingCardProps {
    name: string;
}

export default function GreetingCard({ name }: GreetingCardProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';

    // Capitalize first letter of name
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    return (
        <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* Top Row: Avatar and Bell */}
            <View style={styles.topRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
                </View>

                <TouchableOpacity style={styles.bellButton}>
                    <Ionicons name="notifications-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Greeting Content */}
            <View style={styles.content}>
                <Text style={styles.greeting}>{greeting},</Text>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM do')}</Text>
            </View>

            {/* Decorative circles */}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        height: 120, // Reduced from 180px (33% reduction)
        marginBottom: 16,
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bellButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        zIndex: 10,
    },
    greeting: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 2,
    },
    name: {
        color: 'white',
        fontSize: 32, // Increased for premium feel
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    date: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        fontWeight: '500',
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    circle1: {
        width: 150,
        height: 150,
        top: -40,
        right: -40,
    },
    circle2: {
        width: 100,
        height: 100,
        bottom: -20,
        right: 30,
    },
});
