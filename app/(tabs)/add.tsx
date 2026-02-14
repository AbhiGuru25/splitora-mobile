import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

// This tab exists only as a placeholder for the FAB button.
// If the user somehow lands here (e.g., direct URL), redirect to addExpense.
export default function AddPlaceholder() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the actual add expense screen
        router.replace('/addExpense');
    }, []);

    return <View />;
}
