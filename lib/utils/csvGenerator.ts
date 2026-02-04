/**
 * Converts an array of objects to a CSV string.
 * @param data Array of objects to convert
 * @param headers Optional array of headers (keys) to include. If not provided, keys from the first object are used.
 * @returns CSV string
 */
export function convertToCSV(data: any[], headers?: string[]): string {
    if (!data || data.length === 0) {
        return '';
    }

    const keys = headers || Object.keys(data[0]);

    // Create header row
    const headerRow = keys.join(',') + '\n';

    // Create data rows
    const rows = data.map(row => {
        return keys.map(key => {
            let cell = row[key] === null || row[key] === undefined ? '' : row[key];

            // Handle strings with commas or newlines by wrapping in quotes
            cell = cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
            }
            return cell;
        }).join(',');
    }).join('\n');

    return headerRow + rows;
}
