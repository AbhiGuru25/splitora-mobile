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

/**
 * Calculate percentage-based splits for an expense
 * 
 * @param totalAmount - Total expense amount
 * @param percentages - Array of { userId, percent } where percents should sum to 100
 * @returns Array of { userId, amount } with amounts rounded to 2 decimals
 */
export function calculatePercentageSplit(
    totalAmount: number,
    percentages: { userId: string; percent: number }[]
): { userId: string; amount: number }[] {
    if (percentages.length === 0) return [];

    const totalPercent = percentages.reduce((sum, p) => sum + p.percent, 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
        throw new Error(`Percentages must sum to 100 (got ${totalPercent})`);
    }

    // Calculate raw amounts
    const rawSplits = percentages.map(p => ({
        userId: p.userId,
        amount: (totalAmount * p.percent) / 100,
    }));

    // Round to 2 decimals
    const roundedSplits = rawSplits.map(s => ({
        userId: s.userId,
        amount: Math.round(s.amount * 100) / 100,
    }));

    // Fix rounding errors — adjust the largest share
    const roundedTotal = roundedSplits.reduce((sum, s) => sum + s.amount, 0);
    const diff = Math.round((totalAmount - roundedTotal) * 100) / 100;

    if (Math.abs(diff) > 0) {
        // Add the difference to the person with the largest share
        const maxIndex = roundedSplits.reduce(
            (maxIdx, s, idx) => (s.amount > roundedSplits[maxIdx].amount ? idx : maxIdx),
            0
        );
        roundedSplits[maxIndex].amount = Math.round((roundedSplits[maxIndex].amount + diff) * 100) / 100;
    }

    return roundedSplits;
}

/**
 * Validate that percentages sum to 100
 * 
 * @param percentages - Array of percentage values
 * @returns True if percentages are valid
 */
export function validatePercentages(percentages: number[]): boolean {
    const sum = percentages.reduce((acc, val) => acc + val, 0);
    return Math.abs(sum - 100) < 0.01;
}

