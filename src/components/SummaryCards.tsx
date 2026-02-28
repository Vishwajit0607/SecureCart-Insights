import React, { useState, useEffect } from 'react';
import './SummaryCards.css';
import { Users, AlertTriangle, DollarSign, Activity } from 'lucide-react';

interface SummaryCardsProps {
    metrics: {
        totalUsers: number;
        flaggedUsers: number;
        totalAtRisk: number;
        avgRiskScore: string;
    };
}

/** Animated counter hook — counts from 0 to target over a duration. */
function useAnimatedCount(target: number, duration = 1200) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const startTime = performance.now();
        const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setCount(target);
            }
        };
        requestAnimationFrame(step);
    }, [target, duration]);
    return count;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
    const animatedTotal = useAnimatedCount(metrics.totalUsers);
    const animatedFlagged = useAnimatedCount(metrics.flaggedUsers);
    const animatedRisk = useAnimatedCount(Math.round(metrics.totalAtRisk));
    const animatedAvg = useAnimatedCount(Math.round(parseFloat(metrics.avgRiskScore)), 1500);

    return (
        <div className="cards-grid">
            <div className="summary-card">
                <div className="card-icon-wrapper info">
                    <Users size={24} />
                </div>
                <div className="card-content">
                    <p className="card-label">Customers Monitored</p>
                    <h3 className="card-value">{animatedTotal}</h3>
                </div>
            </div>

            <div className="summary-card">
                <div className="card-icon-wrapper critical">
                    <AlertTriangle size={24} />
                </div>
                <div className="card-content">
                    <p className="card-label">Flagged Users</p>
                    <h3 className="card-value">{animatedFlagged}</h3>
                </div>
            </div>

            <div className="summary-card">
                <div className="card-icon-wrapper warning">
                    <DollarSign size={24} />
                </div>
                <div className="card-content">
                    <p className="card-label">Estimated $ at Risk</p>
                    <h3 className="card-value">${animatedRisk.toLocaleString()}</h3>
                </div>
            </div>

            <div className="summary-card">
                <div className="card-icon-wrapper success">
                    <Activity size={24} />
                </div>
                <div className="card-content">
                    <p className="card-label">Avg. Risk Score</p>
                    <h3 className="card-value">{animatedAvg}</h3>
                </div>
            </div>
        </div>
    );
};
