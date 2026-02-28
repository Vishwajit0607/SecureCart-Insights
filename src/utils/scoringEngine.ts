import { Transaction, RiskTier, FeatureContribution, FraudType, UserProfile } from '../types';

export function analyzeUserTransactions(
    userId: string,
    name: string,
    email: string,
    memberSince: string,
    transactions: Transaction[]
): UserProfile {
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

    const baseline = 25; // Population-average risk score
    const contributions: FeatureContribution[] = [];

    // Feature 1: Return Rate
    const safeReturnRate = isNaN(returnRate) ? 0 : returnRate;
    const rrContrib = safeReturnRate > 0.5 ? 0.35 : safeReturnRate > 0.3 ? 0.18 : safeReturnRate > 0.15 ? 0.05 : -0.05;
    contributions.push({
        feature: 'Return Rate',
        value: Number((rrContrib * 100).toFixed(0)),
        description: `Return rate of ${(safeReturnRate * 100).toFixed(0)}% ${safeReturnRate > 0.3 ? 'significantly exceeds' : safeReturnRate > 0.15 ? 'slightly exceeds' : 'is within'} the platform average of 12%.`
    });

    // Feature 2: Average Days to Return
    const safeAvgDays = isNaN(avgDaysToReturn) ? 15 : avgDaysToReturn;
    const timingContrib = safeAvgDays > 0 && safeAvgDays < 5 ? 0.20 : safeAvgDays > 0 && safeAvgDays < 15 ? 0.10 : safeAvgDays > 25 ? 0.15 : -0.03;
    contributions.push({
        feature: 'Return Timing',
        value: Number((timingContrib * 100).toFixed(0)),
        description: safeAvgDays > 0 && safeAvgDays < 5
            ? `Extremely fast returns (avg ${safeAvgDays.toFixed(0)} days). Items barely used before return.`
            : safeAvgDays > 25
                ? `Returns cluster near the 30-day policy deadline (avg ${safeAvgDays.toFixed(0)} days).`
                : `Average return timing of ${safeAvgDays.toFixed(0)} days is ${safeAvgDays < 15 && safeAvgDays > 0 ? 'somewhat quick' : 'within normal range'}.`
    });

    // Feature 3: Return Volume
    const safeTotalReturns = isNaN(totalReturns) ? 0 : totalReturns;
    const volContrib = safeTotalReturns > 15 ? 0.22 : safeTotalReturns > 8 ? 0.10 : -0.02;
    contributions.push({
        feature: 'Return Volume',
        value: Number((volContrib * 100).toFixed(0)),
        description: `${safeTotalReturns} total returns — ${safeTotalReturns > 15 ? 'abnormally high volume' : safeTotalReturns > 8 ? 'elevated volume' : 'within normal range'}.`
    });

    // Feature 4: Receipt Integrity
    const receiptMismatches = transactions.filter(t => t.type === 'return' && t.receiptMatch === false).length;
    const receiptContrib = receiptMismatches > 3 ? 0.28 : receiptMismatches > 0 ? 0.12 : -0.05;
    contributions.push({
        feature: 'Receipt Integrity',
        value: Number((receiptContrib * 100).toFixed(0)),
        description: receiptMismatches > 0
            ? `${receiptMismatches} return(s) with receipt amount mismatches detected.`
            : 'All receipts match — no manipulation signals.'
    });

    // Feature 5: Category Concentration
    const catCounts: Record<string, number> = {};
    returns.forEach(t => { catCounts[t.itemCategory || 'Unknown'] = (catCounts[t.itemCategory || 'Unknown'] || 0) + 1; });
    const topCatPct = returns.length > 0
        ? Math.max(...Object.values(catCounts)) / returns.length
        : 0;
    const catContrib = topCatPct > 0.7 ? 0.15 : topCatPct > 0.4 ? 0.05 : -0.03;
    const topCat = returns.length > 0 ? Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0] : null;
    contributions.push({
        feature: 'Category Concentration',
        value: Number((catContrib * 100).toFixed(0)),
        description: topCat
            ? `${(topCatPct * 100).toFixed(0)}% of returns are in "${topCat[0]}" — ${topCatPct > 0.7 ? 'highly concentrated' : 'moderate spread'}.`
            : 'No returns to evaluate.'
    });

    // Composite score
    const totalContrib = rrContrib + timingContrib + volContrib + receiptContrib + catContrib;
    let overall = baseline + (totalContrib * 80); // Scale contributions into 0-100 range
    if (isNaN(overall)) overall = baseline;
    overall = Math.min(100, Math.max(0, Number(overall.toFixed(0))));

    // Infer Fraud Type from logic (instead of hardcoded)
    let fraudType: FraudType = 'None';
    let clusterLabel = 'Cluster D — Normal Shoppers';
    let explanation = 'Normal purchasing behavior. Return rate and timing are within expected ranges. No suspicious patterns detected.';

    if (receiptMismatches > 0) {
        fraudType = 'Receipt Manipulation';
        clusterLabel = 'Cluster C — Receipt Anomalies';
        overall = Math.max(overall, 75); // Ensure flagged
        explanation = `Multiple returns show receipt-amount mismatches where the refunded amount exceeds the original purchase price. ${receiptMismatches} transactions flagged for potential receipt swapping.`;
    } else if (safeReturnRate > 0.5 && safeAvgDays < 10 && safeTotalReturns > 5) {
        fraudType = 'Serial Returner';
        clusterLabel = 'Cluster A — High Volume Returners';
        overall = Math.max(overall, 80); // Ensure flagged
        explanation = `This customer has returned ${safeTotalReturns} items (${(safeReturnRate * 100).toFixed(0)}% return rate) with an average ownership of only ${safeAvgDays.toFixed(0)} days. The high volume and rapid return pattern strongly suggests systematic abuse of the return policy.`;
    } else if (safeReturnRate > 0.4 && safeAvgDays >= 25) {
        fraudType = 'Timing Anomaly';
        clusterLabel = 'Cluster E — Deadline Gamers';
        overall = Math.max(overall, 72); // Ensure flagged
        explanation = `${(safeReturnRate * 100).toFixed(0)}% of purchases are returned, with returns consistently filed 25+ days post-purchase, clustering around the return policy deadline. This pattern is statistically unlikely to occur naturally.`;
    } else if (safeReturnRate > 0.4 && topCatPct > 0.5 && ['Apparel', 'Shoes', 'Jewelry'].includes(topCat?.[0] || '')) {
        fraudType = 'Wardrobing';
        clusterLabel = 'Cluster B — Event-Driven Returners';
        overall = Math.max(overall, 70); // Ensure flagged
        explanation = `Returns are concentrated in high-value apparel/accessories with a consistent ownership window, suggesting items are used temporarily for events and then returned.`;
    }

    const tier: RiskTier = overall >= 70 ? 'High' : overall >= 40 ? 'Medium' : 'Low';
    const isFlagged = tier === 'High';

    return {
        id: userId,
        name,
        email,
        memberSince,
        totalPurchases,
        totalReturns,
        returnRate: Number(returnRate.toFixed(3)),
        totalSpend,
        avgDaysToReturn: Number(avgDaysToReturn.toFixed(1)),
        transactions,
        riskScore: { overall, tier, featureContributions: contributions, baselineScore: baseline },
        isFlagged,
        primaryFraudType: fraudType,
        explanation,
        cluster: clusterLabel,
    };
}
