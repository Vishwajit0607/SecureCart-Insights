import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Search, Filter, AlertTriangle, ShieldAlert, Receipt, Clock } from 'lucide-react';
import './ExperimentTable.css';

interface TransactionTableProps {
    users: UserProfile[];
    onSelectUser: (user: UserProfile) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ users, onSelectUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTier, setFilterTier] = useState<string>('All');

    const getFraudIcon = (type: string) => {
        switch (type) {
            case 'Serial Returner': return <AlertTriangle size={16} className="text-critical" />;
            case 'Wardrobing': return <ShieldAlert size={16} className="text-warning" />;
            case 'Receipt Manipulation': return <Receipt size={16} className="text-amber" />;
            case 'Timing Anomaly': return <Clock size={16} className="text-purple" />;
            default: return null;
        }
    };

    const getScoreClass = (score: number) => {
        if (score >= 70) return 'score-critical';
        if (score >= 40) return 'score-warning';
        return 'score-nominal';
    };

    const getTierBadge = (tier: string) => {
        const cls = tier === 'High' ? 'tier-high' : tier === 'Medium' ? 'tier-medium' : 'tier-low';
        return <span className={`tier-badge ${cls}`}>{tier}</span>;
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.primaryFraudType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = filterTier === 'All' || u.riskScore.tier === filterTier;
        return matchesSearch && matchesTier;
    });

    return (
        <div className="table-container panel">
            <div className="table-header">
                <h3 className="section-title">User Risk Monitor</h3>

                <div className="table-actions">
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search users, IDs, fraud types..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <Filter size={16} />
                        {['All', 'High', 'Medium', 'Low'].map(tier => (
                            <button
                                key={tier}
                                className={`filter-chip ${filterTier === tier ? 'active' : ''}`}
                                onClick={() => setFilterTier(tier)}
                            >
                                {tier}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Return Rate</th>
                            <th>Risk Score</th>
                            <th>Risk Tier</th>
                            <th>Classification</th>
                            <th>Returns</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr
                                key={user.id}
                                className={user.isFlagged ? 'row-highlight' : ''}
                                onClick={() => onSelectUser(user)}
                            >
                                <td className="font-mono">{user.id}</td>
                                <td>{user.name}</td>
                                <td>{(user.returnRate * 100).toFixed(0)}%</td>
                                <td>
                                    <span className={`score-badge ${getScoreClass(user.riskScore.overall)}`}>
                                        {user.riskScore.overall}
                                    </span>
                                </td>
                                <td>{getTierBadge(user.riskScore.tier)}</td>
                                <td>
                                    <div className="fraud-cell">
                                        {getFraudIcon(user.primaryFraudType)}
                                        <span className={user.primaryFraudType !== 'None' ? 'text-highlight' : 'text-muted'}>
                                            {user.primaryFraudType}
                                        </span>
                                    </div>
                                </td>
                                <td className="font-mono">{user.totalReturns}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
