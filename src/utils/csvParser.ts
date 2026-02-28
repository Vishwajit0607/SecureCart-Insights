import Papa from 'papaparse';
import { Transaction } from '../types';
import { analyzeUserTransactions } from './scoringEngine';

const getVal = (row: any, searchKeys: string[]): any => {
    const rowKeys = Object.keys(row);
    for (const searchKey of searchKeys) {
        const normalizedSearch = searchKey.toLowerCase().replace(/[^a-z0-9]/g, '');
        const foundKey = rowKeys.find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSearch);
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
            return row[foundKey];
        }
    }
    return undefined;
};

export async function parseCsvData(file: File) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                console.log("Papa results:", results);
                try {
                    const data = results.data as any[];
                    console.log("Papa data length:", data.length);
                    if (data.length > 0) {
                        console.log("First row from CSV:", data[0]);
                    }

                    // Group by user
                    const userGroups: Record<string, {
                        name: string,
                        email: string,
                        transactions: Transaction[]
                    }> = {};

                    data.forEach((row, i) => {
                        const userId = getVal(row, ['userid', 'id', 'customer', 'customerid', 'user']);
                        if (!userId) {
                            console.warn("Row missing userId:", row);
                            return;
                        }

                        if (!userGroups[userId]) {
                            userGroups[userId] = {
                                name: getVal(row, ['username', 'name', 'customername']) || `User ${userId}`,
                                email: getVal(row, ['useremail', 'email', 'contact']) || `${userId}@email.com`,
                                transactions: []
                            };
                        }

                        const rawType = getVal(row, ['type', 'transactiontype', 'action', 'status']);
                        const type = (rawType ? String(rawType).toLowerCase() : 'purchase');
                        const finalType = (type.includes('return') || type.includes('refund')) ? 'return' : 'purchase';

                        const amountStr = getVal(row, ['amount', 'price', 'total', 'value', 'cost']);
                        let amount = 0;
                        if (amountStr) {
                            const parsed = parseFloat(String(amountStr).replace(/[^0-9.-]+/g, ""));
                            if (!isNaN(parsed)) amount = parsed;
                        }

                        const receiptMatchStr = getVal(row, ['receiptmatch', 'receipt', 'hasreceipt', 'validreceipt']);
                        const receiptMatch = receiptMatchStr ? (String(receiptMatchStr).toLowerCase() === 'true' || String(receiptMatchStr) === '1' || String(receiptMatchStr).toLowerCase() === 'yes') : true;

                        const daysOwnedStr = getVal(row, ['daysowned', 'daysheld', 'duration', 'returndays']);
                        let daysOwned: number | undefined = undefined;
                        if (daysOwnedStr) {
                            const parsed = parseInt(String(daysOwnedStr), 10);
                            if (!isNaN(parsed)) daysOwned = parsed;
                        }

                        let dateStr = getVal(row, ['date', 'timestamp', 'createdat', 'time']);
                        if (!dateStr) dateStr = new Date().toISOString();

                        userGroups[userId].transactions.push({
                            id: getVal(row, ['transactionid', 'txid', 'orderid']) || `T-${i}`,
                            date: String(dateStr),
                            type: finalType as 'purchase' | 'return',
                            amount,
                            itemCategory: getVal(row, ['itemcategory', 'category', 'department']) || 'Other',
                            itemName: getVal(row, ['itemname', 'item', 'product', 'productname']) || 'Unknown Item',
                            returnReason: getVal(row, ['returnreason', 'reason', 'notes']) || undefined,
                            daysOwned,
                            receiptMatch
                        });
                    });

                    // Build user profiles
                    const profiles = Object.entries(userGroups).map(([userId, group]) => {
                        return analyzeUserTransactions(
                            userId,
                            group.name,
                            group.email,
                            '2024-01-01', // Default member since
                            group.transactions
                        );
                    });

                    // Sort by risk score
                    profiles.sort((a, b) => b.riskScore.overall - a.riskScore.overall);

                    resolve(profiles);
                } catch (err) {
                    reject(err);
                }
            },
            error: (err) => reject(err)
        });
    });
}
