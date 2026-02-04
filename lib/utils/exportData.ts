import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { convertToCSV } from './csvGenerator';
import { Alert, Platform } from 'react-native';

export async function exportToCSV(data: any[], fileName: string, headers?: string[]) {
    try {
        if (!data || data.length === 0) {
            Alert.alert('No Data', 'There is nothing to export.');
            return;
        }

        // 1. Convert to CSV string
        const csvString = convertToCSV(data, headers);

        // 2. Define file path
        // Use documentDirectory or cacheDirectory
        const fileUri = `${FileSystem.documentDirectory}${fileName}.csv`;

        // 3. Write file
        await FileSystem.writeAsStringAsync(fileUri, csvString, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // 4. Share file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: `Export ${fileName}`,
                UTI: 'public.comma-separated-values-text' // helpful for iOS
            });
        } else {
            Alert.alert('Error', 'Sharing is not available on this device');
        }

    } catch (error: any) {
        console.error('Export error:', error);
        Alert.alert('Export Failed', error.message || 'Could not export file.');
    }
}
