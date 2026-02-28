export type FraudType =
    | 'Serial Returner'
    | 'Wardrobing'
    | 'Receipt Manipulation'
    | 'Timing Anomaly'
    | 'None';

export type RiskTier = 'Low' | 'Medium' | 'High';

export interface Transaction {
    id: string;
    date: string;          // ISO date string
    type: 'purchase' | 'return';
    amount: number;        // Dollar amount
    itemCategory: string;  // e.g. "Electronics", "Apparel", "Shoes"
    itemName: string;
    returnReason?: string; // Only for returns
    daysOwned?: number;    // Days between purchase and return
    receiptMatch?: boolean; // Whether receipt amount matches return amount
}

export interface FeatureContribution {
    feature: string;
    value: number;      // Contribution to risk score (-1 to +1 scale, positive = risky)
    description: string; // Human-readable explanation
}

export interface RiskScore {
    overall: number;            // 0-100 composite risk score
    tier: RiskTier;
    featureContributions: FeatureContribution[]; // SHAP-style breakdown
    baselineScore: number;      // Population average risk score
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    memberSince: string;       // ISO date
    totalPurchases: number;
    totalReturns: number;
    returnRate: number;        // 0–1 ratio
    totalSpend: number;        // Lifetime spend in $
    avgDaysToReturn: number;   // Average days between purchase and return
    transactions: Transaction[];

    // Computed & Flagged Data
    riskScore: RiskScore;
    isFlagged: boolean;
    primaryFraudType: FraudType;
    explanation: string;       // AI-generated human-readable explanation
    cluster: string;           // Cluster label (e.g. "Cluster A - High Volume Returners")
}
