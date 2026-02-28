import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import './Charts.css';

interface ChartsProps {
    timelineData: { name: string; Score: number; Date: string; User: string }[];
    distributionData: { name: string; value: number }[];
    tierData: { name: string; value: number }[];
}

const FRAUD_COLORS: Record<string, string> = {
    'Serial Returner': '#ef4444',
    'Wardrobing': '#f97316',
    'Receipt Manipulation': '#eab308',
    'Timing Anomaly': '#8b5cf6',
};

const TIER_COLORS: Record<string, string> = {
    'Low': '#10b981',
    'Medium': '#f59e0b',
    'High': '#ef4444',
};

export const DashboardCharts: React.FC<ChartsProps> = ({ timelineData, distributionData, tierData }) => {
    return (
        <div className="charts-container">
            {/* Risk Score Timeline */}
            <div className="chart-panel full-width">
                <div className="chart-header">
                    <h3>Risk Score Timeline</h3>
                    <span className="chart-subtitle">Per-user risk scores across the portfolio</span>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                itemStyle={{ color: '#ef4444' }}
                                labelFormatter={(label) => {
                                    const item = timelineData.find(d => d.name === label);
                                    return item ? `${item.User} (${item.name})` : label;
                                }}
                            />
                            <Area type="monotone" dataKey="Score" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Fraud Type Distribution */}
            <div className="chart-panel half-width">
                <div className="chart-header">
                    <h3>Fraud Type Distribution</h3>
                    <span className="chart-subtitle">Detected fraud categories</span>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={distributionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                            <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} width={130} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={FRAUD_COLORS[entry.name] || '#6b7280'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Risk Tier Breakdown */}
            <div className="chart-panel half-width">
                <div className="chart-header">
                    <h3>Risk Tier Breakdown</h3>
                    <span className="chart-subtitle">Low / Medium / High distribution</span>
                </div>
                <div className="chart-wrapper tier-chart">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={tierData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            >
                                {tierData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.name] || '#6b7280'} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
