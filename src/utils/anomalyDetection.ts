import { UserProfile } from '../types';

/**
 * Calculate top-level dashboard KPIs from the user dataset.
 */
export const calculateDashboardMetrics = (users: UserProfile[]) => {
    const totalUsers = users.length;
    const flaggedUsers = users.filter(u => u.isFlagged).length;

    const totalAtRisk = users
        .filter(u => u.isFlagged)
        .reduce((sum, u) => {
            const returnAmount = u.transactions
                .filter(t => t.type === 'return')
                .reduce((s, t) => s + t.amount, 0);
            return sum + returnAmount;
        }, 0);

    const avgRiskScore = users.length > 0
        ? users.reduce((sum, u) => sum + u.riskScore.overall, 0) / users.length
        : 0;

    // Fraud type distribution
    const fraudTypeCounts: Record<string, number> = {};
    users.forEach(u => {
        const key = u.primaryFraudType;
        fraudTypeCounts[key] = (fraudTypeCounts[key] || 0) + 1;
    });
    const distributionData = Object.entries(fraudTypeCounts)
        .filter(([key]) => key !== 'None')
        .map(([name, value]) => ({ name, value }));

    // Risk tier distribution
    const tierCounts = { Low: 0, Medium: 0, High: 0 };
    users.forEach(u => { tierCounts[u.riskScore.tier]++; });
    const tierData = Object.entries(tierCounts).map(([name, value]) => ({ name, value }));

    // Timeline: risk scores over member-since dates
    const sorted = [...users].sort((a, b) => a.memberSince.localeCompare(b.memberSince));
    const timelineData = sorted.map(u => ({
        name: u.id,
        Score: u.riskScore.overall,
        Date: u.memberSince,
        User: u.name,
    }));

    return {
        totalUsers,
        flaggedUsers,
        totalAtRisk: Number(totalAtRisk.toFixed(2)),
        avgRiskScore: avgRiskScore.toFixed(1),
        distributionData,
        tierData,
        timelineData,
    };
};

/**
 * Prepare the per-month purchase vs return aggregation for a specific user's transaction timeline chart.
 */
export const getUserTransactionTimeline = (user: UserProfile) => {
    const monthMap: Record<string, { month: string; purchases: number; returns: number }> = {};

    user.transactions.forEach(t => {
        const month = t.date.substring(0, 7); // YYYY-MM
        if (!monthMap[month]) {
            monthMap[month] = { month, purchases: 0, returns: 0 };
        }
        if (t.type === 'purchase') {
            monthMap[month].purchases += t.amount;
        } else {
            monthMap[month].returns += t.amount;
        }
    });

    return Object.values(monthMap)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(m => ({
            month: m.month,
            Purchases: Number(m.purchases.toFixed(2)),
            Returns: Number(m.returns.toFixed(2)),
        }));
};
