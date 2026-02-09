import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// Configure notification handling
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface NotificationPreferences {
    expense_alerts: boolean;
    group_invites: boolean;
    settlement_reminders: boolean;
    monthly_reports: boolean;
    marketing_updates: boolean;
}

class NotificationService {
    private expoPushToken: string | null = null;

    // Initialize notifications
    async initialize(): Promise<void> {
        console.log('🔔 Initializing notification service...');

        // Request permissions
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
            console.log('⚠️ Notification permission denied');
            return;
        }

        // Get and register push token
        await this.registerPushToken();

        // Set up notification listeners
        this.setupListeners();

        console.log('✅ Notification service initialized');
    }

    // Request notification permissions
    async requestPermissions(): Promise<boolean> {
        if (!Device.isDevice) {
            console.log('⚠️ Must use physical device for push notifications');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('⚠️ Failed to get push token for push notification!');
            return false;
        }

        return true;
    }

    // Get Expo push token
    async getExpoPushToken(): Promise<string | null> {
        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId
                ?? Constants.easConfig?.projectId;

            if (!projectId) {
                console.log('⚠️ No project ID found for push notifications');
                return null;
            }

            const token = await Notifications.getExpoPushTokenAsync({
                projectId,
            });

            return token.data;
        } catch (error) {
            console.error('❌ Error getting push token:', error);
            return null;
        }
    }

    // Register push token with Supabase
    async registerPushToken(): Promise<void> {
        const token = await this.getExpoPushToken();
        if (!token) return;

        this.expoPushToken = token;
        console.log('📱 Push token:', token);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log('⚠️ No user logged in, skipping token registration');
            return;
        }

        const platform = Platform.OS as 'ios' | 'android' | 'web';

        const { error } = await supabase
            .from('push_tokens')
            .upsert({
                user_id: user.id,
                token: token,
                platform: platform,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,token'
            });

        if (error) {
            console.error('❌ Error saving push token:', error);
        } else {
            console.log('✅ Push token registered with Supabase');
        }
    }

    // Remove push token (on logout)
    async unregisterPushToken(): Promise<void> {
        if (!this.expoPushToken) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('push_tokens')
            .delete()
            .eq('user_id', user.id)
            .eq('token', this.expoPushToken);

        this.expoPushToken = null;
        console.log('🗑️ Push token unregistered');
    }

    // Set up notification listeners
    setupListeners(): void {
        // Handle notifications received while app is foregrounded
        Notifications.addNotificationReceivedListener(notification => {
            console.log('📩 Notification received:', notification);
        });

        // Handle notification taps
        Notifications.addNotificationResponseReceivedListener(response => {
            console.log('👆 Notification tapped:', response);
            this.handleNotificationTap(response);
        });
    }

    // Handle notification tap actions
    handleNotificationTap(response: Notifications.NotificationResponse): void {
        const data = response.notification.request.content.data;

        // Navigate based on notification type
        if (data?.type === 'expense') {
            // Navigate to expense detail
            console.log('Navigate to expense:', data.expenseId);
        } else if (data?.type === 'group_invite') {
            // Navigate to group
            console.log('Navigate to group:', data.groupId);
        } else if (data?.type === 'settlement') {
            // Navigate to settle up
            console.log('Navigate to settlement');
        }
    }

    // Get user's notification preferences
    async getPreferences(): Promise<NotificationPreferences | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('❌ Error fetching preferences:', error);
            // Return defaults if no preferences exist
            return {
                expense_alerts: true,
                group_invites: true,
                settlement_reminders: true,
                monthly_reports: false,
                marketing_updates: false,
            };
        }

        return data;
    }

    // Update notification preferences
    async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('notification_preferences')
            .upsert({
                user_id: user.id,
                ...preferences,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id'
            });

        if (error) {
            console.error('❌ Error updating preferences:', error);
            return false;
        }

        console.log('✅ Preferences updated');
        return true;
    }

    // Send a local notification (for testing)
    async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: null, // Immediately
        });
    }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export types
export type { Notifications };
