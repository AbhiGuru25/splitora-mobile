import { UserBalance, SimplifiedDebt } from '@/lib/hooks/useBalances';

/**
 * Smart Settlement Algorithm
 * 
 * Minimizes the number of transactions needed to settle all debts in a group.
 * Uses a greedy approach: repeatedly match the largest creditor with the largest debtor.
 * 
 * @param balances - Array of user balances with net_balance calculated
 * @returns Array of simplified debts (who pays whom and how much)
 */
export function minimizeTransactions(balances: UserBalance[]): SimplifiedDebt[] {
    const transactions: SimplifiedDebt[] = [];

    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = balances
        .filter(b => b.net_balance > 0.01) // Small threshold for floating point precision
        .map(b => ({
            user_id: b.user_id,
            user_name: b.user_name,
            amount: b.net_balance,
        }))
        .sort((a, b) => b.amount - a.amount); // Descending order

    const debtors = balances
        .filter(b => b.net_balance < -0.01)
        .map(b => ({
            user_id: b.user_id,
            user_name: b.user_name,
            amount: -b.net_balance, // Make positive for easier math
        }))
        .sort((a, b) => b.amount - a.amount); // Descending order

    // Greedy matching: largest creditor with largest debtor
    let i = 0; // creditor index
    let j = 0; // debtor index

    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];

        const settlementAmount = Math.min(creditor.amount, debtor.amount);

        // Record the transaction
        transactions.push({
            from_user: debtor.user_id,
            from_user_name: debtor.user_name,
            to_user: creditor.user_id,
            to_user_name: creditor.user_name,
            amount: Math.round(settlementAmount * 100) / 100, // Round to 2 decimals
        });

        // Update remaining amounts
        creditor.amount -= settlementAmount;
        debtor.amount -= settlementAmount;

        // Move to next creditor/debtor if fully settled
        if (creditor.amount < 0.01) i++;
        if (debtor.amount < 0.01) j++;
    }

    return transactions;
}

/**
 * Helper function to calculate equal splits for an expense
 * 
 * @param totalAmount - Total expense amount
 * @param numPeople - Number of people to split among
 * @returns Amount each person owes (rounded to 2 decimals)
 */
export function calculateEqualSplit(totalAmount: number, numPeople: number): number {
    if (numPeople === 0) return 0;
    return Math.round((totalAmount / numPeople) * 100) / 100;
}

/**
 * Validate that splits add up to the total amount
 * 
 * @param totalAmount - Total expense amount
 * @param splits - Array of split amounts
 * @returns True if splits are valid, false otherwise
 */
export function validateSplits(totalAmount: number, splits: number[]): boolean {
    const sum = splits.reduce((acc, val) => acc + val, 0);
    const difference = Math.abs(sum - totalAmount);
    return difference < 0.01; // Allow small floating point errors
}
