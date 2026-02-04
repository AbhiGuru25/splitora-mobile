import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

interface ActionSheetProps {
    visible: boolean;
    onClose: () => void;
}

export default function ActionSheet({ visible, onClose }: ActionSheetProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];
    const router = useRouter();

    const actions = [
        {
            icon: 'receipt',
            label: 'Add Expense',
            onPress: () => {
                onClose();
                router.push('/(tabs)/add'); // Or wherever add expense is
            }
        },
        {
            icon: 'people',
            label: 'Create Group',
            onPress: () => {
                onClose();
                router.push('/groups/create');
            }
        },
        {
            icon: 'cash',
            label: 'Settle Up',
            onPress: () => {
                onClose();
                router.push('/settle-up');
            }
        }
    ];

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <BlurView intensity={20} style={styles.blur} tint="dark" />

                    <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={styles.handle} />
                        <Text style={[styles.title, { color: theme.text }]}>Quick Actions</Text>

                        <View style={styles.grid}>
                            {actions.map((action, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.actionItem, { borderColor: theme.border }]}
                                    onPress={action.onPress}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                                        <Ionicons name={action.icon as any} size={28} color={theme.primary} />
                                    </View>
                                    <Text style={[styles.actionLabel, { color: theme.text }]}>{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 48,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#334155',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    actionItem: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        width: '30%',
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: 24,
        right: 24,
    }
});
