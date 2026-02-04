import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { format } from 'date-fns';

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

    return (
        <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.greeting}>{greeting},</Text>
                <Text style={styles.name}>{name}</Text>
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
        borderRadius: 20, // Reduced from 24
        padding: 16, // Reduced from 24
        height: 180,
        marginBottom: 16, // Reduced from 24
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    content: {
        zIndex: 10,
    },
    greeting: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14, // Reduced from 16
        fontWeight: '500',
        marginBottom: 4,
    },
    name: {
        color: 'white',
        fontSize: 22, // Reduced from 32
        fontWeight: 'bold',
        marginBottom: 4, // Reduced from 8
    },
    date: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 13, // Reduced from 14
        fontWeight: '500',
        opacity: 0.7, // Added
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    circle1: {
        width: 200,
        height: 200,
        top: -50,
        right: -50,
    },
    circle2: {
        width: 150,
        height: 150,
        bottom: -30,
        right: 40,
    },
});
