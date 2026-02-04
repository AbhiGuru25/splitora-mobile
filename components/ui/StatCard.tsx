import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StatCardProps {
    label: string;
    value: string;
    subtext?: string;
    type?: 'neutral' | 'credit' | 'debit';
    icon: string;
}

export default function StatCard({ label, value, subtext, type = 'neutral', icon }: StatCardProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];

    const getValueColor = () => {
        switch (type) {
            case 'credit': return theme.success;
            case 'debit': return theme.danger;
            default: return theme.text;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{icon}</Text>
            </View>
            <View>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
                <Text style={[styles.value, { color: getValueColor() }]}>{value}</Text>
                {subtext && (
                    <Text style={[styles.subtext, { color: theme.textMuted }]}>{subtext}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        fontSize: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subtext: {
        fontSize: 10,
    },
});
