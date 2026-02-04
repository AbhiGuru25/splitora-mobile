import React, { useRef } from 'react';
import { Animated, StyleSheet, View, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/lib/context/ThemeContext';
import { haptics } from '@/lib/utils/haptics';

interface SwipeableRowProps {
    children: React.ReactNode;
    onDelete: () => void;
    disabled?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 70; // Threshold to trigger delete (in pixels)
const DELETE_BUTTON_WIDTH = 80; // Width of the delete action area

export default function SwipeableRow({ children, onDelete, disabled = false }: SwipeableRowProps) {
    const { activeColorScheme } = useTheme();
    const theme = Colors[activeColorScheme];
    const translateX = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disabled,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only activate if horizontal swipe is more significant than vertical
                return !disabled && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
            },
            onPanResponderGrant: () => {
                // Provide slight haptic feedback when swipe starts
                haptics.selection();
            },
            onPanResponderMove: (_, gestureState) => {
                if (disabled) return;

                // Only allow left swipe (negative dx)
                // Limit the swipe distance to DELETE_BUTTON_WIDTH
                if (gestureState.dx < 0) {
                    const newValue = Math.max(gestureState.dx, -DELETE_BUTTON_WIDTH);
                    translateX.setValue(newValue);
                } else if (gestureState.dx > 0) {
                    // Allow slight bounce back
                    translateX.setValue(Math.min(gestureState.dx * 0.3, 20));
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (disabled) return;

                // Check if swipe exceeded threshold
                if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD && gestureState.dx < 0) {
                    // Swipe exceeds threshold - trigger delete
                    haptics.warning();
                    Animated.timing(translateX, {
                        toValue: -SCREEN_WIDTH,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        onDelete();
                        // Reset after deletion
                        translateX.setValue(0);
                    });
                } else {
                    // Reset to original position
                    haptics.light();
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 80,
                        friction: 8,
                    }).start();
                }
            },
            onPanResponderTerminate: () => {
                // Reset if gesture is interrupted
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            },
        })
    ).current;

    return (
        <View style={styles.container}>
            {/* Delete button background */}
            <View style={[styles.deleteBackground, { backgroundColor: theme.danger }]}>
                <Ionicons name="trash-outline" size={22} color="white" />
            </View>

            {/* Swipeable content */}
            <Animated.View
                style={[
                    styles.swipeableContent,
                    {
                        transform: [{ translateX }],
                        backgroundColor: theme.background, // Cover delete button with solid background
                    }
                ]}
                {...panResponder.panHandlers}
            >
                {children}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginBottom: 8,
        overflow: 'hidden', // Critical: clips the delete button
    },
    deleteBackground: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: DELETE_BUTTON_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    swipeableContent: {
        width: '100%',
    },
});
