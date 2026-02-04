import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Index() {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    if (user) {
        return <Redirect href="/(tabs)" />;
    } else {
        return <Redirect href="/landing" />;
    }
}
