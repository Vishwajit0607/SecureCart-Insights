import { UserProfile, Transaction, FraudType, RiskTier, FeatureContribution } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const FIRST_NAMES = [
    'James', 'Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Ethan', 'Sophia',
    'Mason', 'Isabella', 'Logan', 'Mia', 'Lucas', 'Charlotte', 'Aiden',
    'Amelia', 'Jackson', 'Harper', 'Sebastian', 'Evelyn', 'Mateo', 'Aria',
    'Henry', 'Scarlett', 'Owen', 'Grace', 'Alexander', 'Chloe', 'Daniel',
    'Penelope', 'Benjamin', 'Layla', 'William', 'Riley', 'Elijah', 'Zoey',
    'Ryan', 'Nora', 'Nathan', 'Lily'
];
const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
    'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
    'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const CATEGORIES = ['Electronics', 'Apparel', 'Shoes', 'Home & Kitchen', 'Beauty', 'Sports', 'Toys', 'Jewelry'];
const APPAREL_ITEMS = ['Designer Dress', 'Evening Gown', 'Blazer', 'Suit Jacket', 'Cocktail Dress', 'Silk Blouse', 'Cashmere Sweater'];
const ELECTRONICS_ITEMS = ['Wireless Earbuds', 'Smart Watch', 'Tablet', 'Bluetooth Speaker', 'Webcam', 'Keyboard'];
const SHOES_ITEMS = ['Running Shoes', 'Dress Shoes', 'Sneakers', 'Boots', 'Sandals'];
const HOME_ITEMS = ['Air Fryer', 'Coffee Maker', 'Blender', 'Vacuum', 'Bedding Set'];
const BEAUTY_ITEMS = ['Perfume Set', 'Skincare Kit', 'Makeup Palette', 'Hair Dryer'];
const SPORTS_ITEMS = ['Yoga Mat', 'Dumbbells', 'Tennis Racket', 'Cycling Gloves'];
const TOYS_ITEMS = ['LEGO Set', 'Board Game', 'Action Figure', 'Puzzle'];
const JEWELRY_ITEMS = ['Necklace', 'Bracelet', 'Earrings', 'Watch'];

const RETURN_REASONS = [
    'Defective product', 'Wrong size', 'Changed my mind', 'Not as described',
    'Better price found', 'Unwanted gift', 'Arrived too late', 'Quality issues'
];

function getItemForCategory(cat: string): string {
    switch (cat) {
        case 'Apparel': return pick(APPAREL_ITEMS);
        case 'Electronics': return pick(ELECTRONICS_ITEMS);
        case 'Shoes': return pick(SHOES_ITEMS);
        case 'Home & Kitchen': return pick(HOME_ITEMS);
        case 'Beauty': return pick(BEAUTY_ITEMS);
        case 'Sports': return pick(SPORTS_ITEMS);
        case 'Toys': return pick(TOYS_ITEMS);
        case 'Jewelry': return pick(JEWELRY_ITEMS);
        default: return 'Generic Item';
    }
}

function dateOffset(baseDate: Date, daysOffset: number): string {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
}

// ─── Transaction Generators by Fraud Profile ────────────────────────────────

function generateNormalTransactions(userId: string, count: number): Transaction[] {
    const txns: Transaction[] = [];
    const base = new Date('2025-06-01');
    let txId = 1;
    for (let i = 0; i < count; i++) {
        const cat = pick(CATEGORIES);
        const purchaseDay = randInt(0, 240);
        const amount = Number(rand(15, 250).toFixed(2));
        txns.push({
            id: `${userId}-T${txId++}`,
            date: dateOffset(base, purchaseDay),
            type: 'purchase',
            amount,
            itemCategory: cat,
            itemName: getItemForCategory(cat),
        });
        // ~15% return rate for normal users
        if (Math.random() < 0.15) {
            const daysOwned = randInt(14, 60);
            txns.push({
                id: `${userId}-T${txId++}`,
                date: dateOffset(base, purchaseDay + daysOwned),
                type: 'return',
                amount,
                itemCategory: cat,
                itemName: getItemForCategory(cat),
                returnReason: pick(RETURN_REASONS),
                daysOwned,
                receiptMatch: true,
            });
        }
    }
    return txns;
}

function generateSerialReturnerTransactions(userId: string, count: number): Transaction[] {
    const txns: Transaction[] = [];
    const base = new Date('2025-06-01');
    let txId = 1;
    for (let i = 0; i < count; i++) {
        const cat = pick(CATEGORIES);
        const purchaseDay = randInt(0, 240);
        const amount = Number(rand(20, 400).toFixed(2));
        txns.push({
            id: `${userId}-T${txId++}`,
            date: dateOffset(base, purchaseDay),
            type: 'purchase',
            amount,
            itemCategory: cat,
            itemName: getItemForCategory(cat),
        });
        // ~70% return rate — most items come back
        if (Math.random() < 0.70) {
            const daysOwned = randInt(1, 10); // Very quick returns
            txns.push({
                id: `${userId}-T${txId++}`,
                date: dateOffset(base, purchaseDay + daysOwned),
                type: 'return',
                amount,
                itemCategory: cat,
                itemName: getItemForCategory(cat),
                returnReason: pick(['Changed my mind', 'Not as described', 'Wrong size']),
                daysOwned,
                receiptMatch: true,
            });
        }
    }
    return txns;
}

function generateWardrobingTransactions(userId: string, count: number): Transaction[] {
    const txns: Transaction[] = [];
    const base = new Date('2025-06-01');
    let txId = 1;
    for (let i = 0; i < count; i++) {
        // Wardrobers target apparel/shoes/jewelry
        const cat = pick(['Apparel', 'Shoes', 'Jewelry', 'Apparel', 'Apparel']);
        const purchaseDay = randInt(0, 240);
        const amount = Number(rand(80, 600).toFixed(2));
        txns.push({
            id: `${userId}-T${txId++}`,
            date: dateOffset(base, purchaseDay),
            type: 'purchase',
            amount,
            itemCategory: cat,
            itemName: getItemForCategory(cat),
        });
        // ~55% return rate, with suspiciously consistent timing (7-14 days — post-event)
        if (Math.random() < 0.55) {
            const daysOwned = randInt(7, 14);
            txns.push({
                id: `${userId}-T${txId++}`,
                date: dateOffset(base, purchaseDay + daysOwned),
                type: 'return',
                amount,
                itemCategory: cat,
                itemName: getItemForCategory(cat),
                returnReason: pick(['Changed my mind', 'Wrong size']),
                daysOwned,
                receiptMatch: true,
            });
        }
    }
    return txns;
}

function generateReceiptManipulatorTransactions(userId: string, count: number): Transaction[] {
    const txns: Transaction[] = [];
    const base = new Date('2025-06-01');
    let txId = 1;
    for (let i = 0; i < count; i++) {
        const cat = pick(CATEGORIES);
        const purchaseDay = randInt(0, 240);
        const amount = Number(rand(30, 300).toFixed(2));
        txns.push({
            id: `${userId}-T${txId++}`,
            date: dateOffset(base, purchaseDay),
            type: 'purchase',
            amount,
            itemCategory: cat,
            itemName: getItemForCategory(cat),
        });
        // ~40% return rate with receipt mismatches
        if (Math.random() < 0.40) {
            const daysOwned = randInt(5, 25);
            const manipulated = Math.random() < 0.6; // 60% of returns have receipt issues
            txns.push({
                id: `${userId}-T${txId++}`,
                date: dateOffset(base, purchaseDay + daysOwned),
                type: 'return',
                amount: manipulated ? Number((amount * rand(1.1, 1.5)).toFixed(2)) : amount,
                itemCategory: cat,
                itemName: getItemForCategory(cat),
                returnReason: pick(RETURN_REASONS),
                daysOwned,
                receiptMatch: !manipulated,
            });
        }
    }
    return txns;
}

function generateTimingAnomalyTransactions(userId: string, count: number): Transaction[] {
    const txns: Transaction[] = [];
    const base = new Date('2025-06-01');
    let txId = 1;
    for (let i = 0; i < count; i++) {
        const cat = pick(CATEGORIES);
        const purchaseDay = randInt(0, 240);
        const amount = Number(rand(25, 350).toFixed(2));
        txns.push({
            id: `${userId}-T${txId++}`,
            date: dateOffset(base, purchaseDay),
            type: 'purchase',
            amount,
            itemCategory: cat,
            itemName: getItemForCategory(cat),
        });
        // ~45% return rate, returns cluster around day 28-30 (policy deadline)
        if (Math.random() < 0.45) {
            const daysOwned = randInt(27, 30); // Always near the deadline
            txns.push({
                id: `${userId}-T${txId++}`,
                date: dateOffset(base, purchaseDay + daysOwned),
                type: 'return',
                amount,
                itemCategory: cat,
                itemName: getItemForCategory(cat),
                returnReason: pick(['Changed my mind', 'Not as described']),
                daysOwned,
                receiptMatch: true,
            });
        }
    }
    return txns;
}

// ─── Risk Score Computation ─────────────────────────────────────────────────

function computeRiskScore(
    returnRate: number,
    avgDaysToReturn: number,
    totalReturns: number,
    fraudType: FraudType,
    transactions: Transaction[]
): { overall: number; tier: RiskTier; featureContributions: FeatureContribution[]; baselineScore: number } {
    const baseline = 25; // Population-average risk score
    const contributions: FeatureContribution[] = [];

    // Feature 1: Return Rate
    const rrContrib = returnRate > 0.5 ? 0.35 : returnRate > 0.3 ? 0.18 : returnRate > 0.15 ? 0.05 : -0.05;
    contributions.push({
        feature: 'Return Rate',
        value: Number(rrContrib.toFixed(2)),
        description: `Return rate of ${(returnRate * 100).toFixed(0)}% ${returnRate > 0.3 ? 'significantly exceeds' : returnRate > 0.15 ? 'slightly exceeds' : 'is within'} the platform average of 12%.`
    });

    // Feature 2: Average Days to Return
    const timingContrib = avgDaysToReturn < 5 ? 0.20 : avgDaysToReturn < 15 ? 0.10 : avgDaysToReturn > 25 ? 0.15 : -0.03;
    contributions.push({
        feature: 'Return Timing',
        value: Number(timingContrib.toFixed(2)),
        description: avgDaysToReturn < 5
            ? `Extremely fast returns (avg ${avgDaysToReturn.toFixed(0)} days). Items barely used before return.`
            : avgDaysToReturn > 25
                ? `Returns cluster near the 30-day policy deadline (avg ${avgDaysToReturn.toFixed(0)} days).`
                : `Average return timing of ${avgDaysToReturn.toFixed(0)} days is ${avgDaysToReturn < 15 ? 'somewhat quick' : 'within normal range'}.`
    });

    // Feature 3: Return Volume
    const volContrib = totalReturns > 15 ? 0.22 : totalReturns > 8 ? 0.10 : -0.02;
    contributions.push({
        feature: 'Return Volume',
        value: Number(volContrib.toFixed(2)),
        description: `${totalReturns} total returns — ${totalReturns > 15 ? 'abnormally high volume' : totalReturns > 8 ? 'elevated volume' : 'within normal range'}.`
    });

    // Feature 4: Receipt Integrity
    const receiptMismatches = transactions.filter(t => t.type === 'return' && t.receiptMatch === false).length;
    const receiptContrib = receiptMismatches > 3 ? 0.28 : receiptMismatches > 0 ? 0.12 : -0.05;
    contributions.push({
        feature: 'Receipt Integrity',
        value: Number(receiptContrib.toFixed(2)),
        description: receiptMismatches > 0
            ? `${receiptMismatches} return(s) with receipt amount mismatches detected.`
            : 'All receipts match — no manipulation signals.'
    });

    // Feature 5: Category Concentration
    const returnTxns = transactions.filter(t => t.type === 'return');
    const catCounts: Record<string, number> = {};
    returnTxns.forEach(t => { catCounts[t.itemCategory] = (catCounts[t.itemCategory] || 0) + 1; });
    const topCatPct = returnTxns.length > 0
        ? Math.max(...Object.values(catCounts)) / returnTxns.length
        : 0;
    const catContrib = topCatPct > 0.7 ? 0.15 : topCatPct > 0.4 ? 0.05 : -0.03;
    const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
    contributions.push({
        feature: 'Category Concentration',
        value: Number(catContrib.toFixed(2)),
        description: topCat
            ? `${(topCatPct * 100).toFixed(0)}% of returns are in "${topCat[0]}" — ${topCatPct > 0.7 ? 'highly concentrated' : 'moderate spread'}.`
            : 'No returns to evaluate.'
    });

    // Composite score
    const totalContrib = contributions.reduce((sum, c) => sum + c.value, 0);
    let overall = baseline + totalContrib * 80; // Scale contributions into 0-100 range
    overall = Math.min(100, Math.max(0, Number(overall.toFixed(0))));

    // Manual adjustment for fraud types to ensure flagged users score high
    if (fraudType !== 'None' && overall < 55) overall = randInt(55, 75);

    const tier: RiskTier = overall >= 70 ? 'High' : overall >= 40 ? 'Medium' : 'Low';

    return { overall, tier, featureContributions: contributions, baselineScore: baseline };
}

// ─── User Profile Generator ─────────────────────────────────────────────────

function generateUser(
    index: number,
    fraudType: FraudType,
    clusterLabel: string
): UserProfile {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
    const lastName = LAST_NAMES[index % LAST_NAMES.length];
    const id = `USR-${(1000 + index).toString()}`;
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
    const memberSince = dateOffset(new Date('2023-01-01'), randInt(0, 700));

    let transactions: Transaction[];
    const txnCount = randInt(12, 30);

    switch (fraudType) {
        case 'Serial Returner':
            transactions = generateSerialReturnerTransactions(id, txnCount);
            break;
        case 'Wardrobing':
            transactions = generateWardrobingTransactions(id, txnCount);
            break;
        case 'Receipt Manipulation':
            transactions = generateReceiptManipulatorTransactions(id, txnCount);
            break;
        case 'Timing Anomaly':
            transactions = generateTimingAnomalyTransactions(id, txnCount);
            break;
        default:
            transactions = generateNormalTransactions(id, txnCount);
    }

    // Sort transactions by date
    transactions.sort((a, b) => a.date.localeCompare(b.date));

    const purchases = transactions.filter(t => t.type === 'purchase');
    const returns = transactions.filter(t => t.type === 'return');
    const totalPurchases = purchases.length;
    const totalReturns = returns.length;
    const returnRate = totalPurchases > 0 ? totalReturns / totalPurchases : 0;
    const totalSpend = Number(purchases.reduce((s, t) => s + t.amount, 0).toFixed(2));
    const avgDaysToReturn = returns.length > 0
        ? returns.reduce((s, t) => s + (t.daysOwned || 0), 0) / returns.length
        : 0;

    const riskScore = computeRiskScore(returnRate, avgDaysToReturn, totalReturns, fraudType, transactions);
    const isFlagged = riskScore.tier === 'High';

    // Generate explanation
    let explanation: string;
    switch (fraudType) {
        case 'Serial Returner':
            explanation = `This customer has returned ${totalReturns} items (${(returnRate * 100).toFixed(0)}% return rate) with an average ownership of only ${avgDaysToReturn.toFixed(0)} days. The high volume and rapid return pattern strongly suggests systematic abuse of the return policy.`;
            break;
        case 'Wardrobing':
            explanation = `Returns are concentrated in high-value apparel and accessories with a consistent 7–14 day ownership window, suggesting items are used temporarily for events and then returned.`;
            break;
        case 'Receipt Manipulation':
            explanation = `Multiple returns show receipt-amount mismatches where the refunded amount exceeds the original purchase price. ${transactions.filter(t => !t.receiptMatch).length} transactions flagged for potential receipt swapping.`;
            break;
        case 'Timing Anomaly':
            explanation = `${(returnRate * 100).toFixed(0)}% of purchases are returned, with returns consistently filed 27–30 days post-purchase, clustering around the return policy deadline. This pattern is statistically unlikely to occur naturally.`;
            break;
        default:
            explanation = 'Normal purchasing behavior. Return rate and timing are within expected ranges. No suspicious patterns detected.';
    }

    return {
        id,
        name,
        email,
        memberSince,
        totalPurchases,
        totalReturns,
        returnRate: Number(returnRate.toFixed(3)),
        totalSpend,
        avgDaysToReturn: Number(avgDaysToReturn.toFixed(1)),
        transactions,
        riskScore,
        isFlagged,
        primaryFraudType: fraudType,
        explanation,
        cluster: clusterLabel,
    };
}

// ─── Generate Full Mock Dataset ─────────────────────────────────────────────

const profiles: UserProfile[] = [];
let idx = 0;

// 20 normal users
for (let i = 0; i < 20; i++) profiles.push(generateUser(idx++, 'None', 'Cluster D — Normal Shoppers'));

// 6 serial returners
for (let i = 0; i < 6; i++) profiles.push(generateUser(idx++, 'Serial Returner', 'Cluster A — High Volume Returners'));

// 5 wardrobers
for (let i = 0; i < 5; i++) profiles.push(generateUser(idx++, 'Wardrobing', 'Cluster B — Event-Driven Returners'));

// 4 receipt manipulators
for (let i = 0; i < 4; i++) profiles.push(generateUser(idx++, 'Receipt Manipulation', 'Cluster C — Receipt Anomalies'));

// 5 timing anomaly users
for (let i = 0; i < 5; i++) profiles.push(generateUser(idx++, 'Timing Anomaly', 'Cluster E — Deadline Gamers'));

// Sort by risk score descending for dashboard readability
profiles.sort((a, b) => b.riskScore.overall - a.riskScore.overall);

export const mockUsers: UserProfile[] = profiles;
