import React from 'react';
import { UserProfile } from '../types';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, ReferenceLine
} from 'recharts';
import { X, ShieldAlert, Activity, Fingerprint, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { getUserTransactionTimeline } from '../utils/anomalyDetection';
import './ExperimentDetailModal.css';

interface UserRiskModalProps {
    user: UserProfile;
    onClose: () => void;
}

export const UserRiskModal: React.FC<UserRiskModalProps> = ({ user, onClose }) => {
    if (!user) return null;

    const timelineData = getUserTransactionTimeline(user);

    // Prepare waterfall data for SHAP-style feature contributions
    const waterfallData = user.riskScore.featureContributions.map(fc => ({
        feature: fc.feature,
        contribution: Number((fc.value * 80).toFixed(1)), // Scale to score impact
        fill: fc.value >= 0 ? '#ef4444' : '#10b981',
        description: fc.description,
    }));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-title">
                        <Fingerprint className="text-accent" />
                        <h2>User Risk Profile: {user.name}</h2>
                        <span className="user-id-badge">{user.id}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Key Metrics */}
                    <div className="metrics-row">
                        <div className="metric-box">
                            <TrendingUp size={18} className="metric-icon" />
                            <span className="metric-label">Return Rate</span>
                            <span className="metric-value text-warning">{(user.returnRate * 100).toFixed(0)}%</span>
                        </div>
                        <div className="metric-box">
                            <DollarSign size={18} className="metric-icon" />
                            <span className="metric-label">Total Spend</span>
                            <span className="metric-value">${user.totalSpend.toLocaleString()}</span>
                        </div>
                        <div className="metric-box">
                            <Clock size={18} className="metric-icon" />
                            <span className="metric-label">Avg. Days to Return</span>
                            <span className="metric-value">{user.avgDaysToReturn}</span>
                        </div>
                        <div className="metric-box">
                            <ShieldAlert size={18} className="metric-icon" />
                            <span className="metric-label">Risk Score</span>
                            <span className={`metric-value ${user.isFlagged ? 'text-critical' : 'text-nominal'}`}>
                                {user.riskScore.overall} / 100
                            </span>
                        </div>
                    </div>

                    {/* AI Explanation */}
                    <div className="explanation-section panel">
                        <div className="explanation-header">
                            {user.isFlagged ? (
                                <ShieldAlert className="text-critical" size={20} />
                            ) : (
                                <Activity className="text-nominal" size={20} />
                            )}
                            <h3>AI Analysis</h3>
                            {user.primaryFraudType !== 'None' && (
                                <span className="fraud-type-badge">{user.primaryFraudType}</span>
                            )}
                        </div>
                        <p className="explanation-text">{user.explanation}</p>

                        {user.isFlagged && (
                            <div className="detected-pattern">
                                <span className="cluster-tag">{user.cluster}</span>
                            </div>
                        )}
                    </div>

                    {/* SHAP-style Feature Contribution Waterfall */}
                    <div className="chart-section panel">
                        <h3>Explainable Risk Breakdown <span className="chart-tag">SHAP-style</span></h3>
                        <p className="chart-description">
                            Each bar shows how much a feature pushes the risk score above or below the baseline ({user.riskScore.baselineScore}).
                        </p>
                        <div className="modal-chart-wrapper">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={waterfallData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                    <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="feature" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} width={140} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                                        formatter={((value: any, _name: any, props: any) => [
                                            `${(value ?? 0) > 0 ? '+' : ''}${value ?? 0} pts — ${props?.payload?.description ?? ''}`,
                                            'Impact'
                                        ]) as any}
                                    />
                                    <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" />
                                    <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                                        {waterfallData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Transaction Timeline */}
                    <div className="chart-section panel">
                        <h3>Transaction Timeline</h3>
                        <p className="chart-description">Monthly purchases vs. returns in dollar value.</p>
                        <div className="modal-chart-wrapper">
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                    />
                                    <Area type="monotone" dataKey="Purchases" stroke="#10b981" fillOpacity={1} fill="url(#colorPurchase)" />
                                    <Area type="monotone" dataKey="Returns" stroke="#ef4444" fillOpacity={1} fill="url(#colorReturn)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
