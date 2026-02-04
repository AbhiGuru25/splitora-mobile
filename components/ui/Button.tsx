import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { haptics } from '@/lib/utils/haptics';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    style?: any;
}

export default function Button({
    onPress,
    title,
    variant = 'primary',
    loading = false,
    disabled = false,
    style
}: ButtonProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];

    const handlePress = () => {
        if (!disabled && !loading) {
            // Haptic feedback based on variant
            if (variant === 'danger') {
                haptics.warning();
            } else {
                haptics.light();
            }
            onPress();
        }
    };

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={handlePress}
                disabled={disabled || loading}
                style={[styles.container, style, disabled && styles.disabled]}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={Gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.textPrimary}>
                            {title}
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary':
                return { backgroundColor: theme.surfaceHighlight };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: theme.primary
                };
            case 'danger':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: theme.danger
                };
            default:
                return {};
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'secondary':
                return { color: theme.text };
            case 'outline':
                return { color: theme.primary };
            case 'danger':
                return { color: theme.danger };
            default:
                return { color: theme.text };
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            style={[
                styles.buttonBase,
                getButtonStyle(),
                style,
                disabled && styles.disabled
            ]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? theme.primary : theme.text} />
            ) : (
                <Text style={[styles.textBase, getTextStyle()]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        height: 56,
    },
    gradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonBase: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    textPrimary: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    textBase: {
        fontSize: 16,
        fontWeight: '600',
    },
    disabled: {
        opacity: 0.6,
    },
});
