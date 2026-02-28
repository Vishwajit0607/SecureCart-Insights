import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Search, ShieldAlert, TrendingUp, Clock, User as UserIcon } from 'lucide-react';
import './UsersPage.css';

interface UsersPageProps {
    users: UserProfile[];
    onSelectUser: (user: UserProfile) => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ users, onSelectUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField] = useState<'riskScore' | 'returnRate' | 'name' | 'totalReturns'>('riskScore');
    const [sortDir] = useState<'asc' | 'desc'>('desc');

    const filtered = users
        .filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case 'riskScore': cmp = a.riskScore.overall - b.riskScore.overall; break;
                case 'returnRate': cmp = a.returnRate - b.returnRate; break;
                case 'name': cmp = a.name.localeCompare(b.name); break;
                case 'totalReturns': cmp = a.totalReturns - b.totalReturns; break;
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });

    const getTierClass = (tier: string) =>
        tier === 'High' ? 'tier-high' : tier === 'Medium' ? 'tier-medium' : 'tier-low';

    return (
        <div className="users-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Profiles</h1>
                    <p className="page-subtitle">Manage and review all monitored customer profiles</p>
                </div>
                <div className="user-search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, ID or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="users-grid">
                {filtered.map((user, idx) => (
                    <div
                        key={user.id}
                        className={`user-card panel ${user.isFlagged ? 'user-card-flagged' : ''}`}
                        onClick={() => onSelectUser(user)}
                        style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                        <div className="user-card-top">
                            <div className="user-avatar">
                                <UserIcon size={22} />
                            </div>
                            <div className="user-info">
                                <h3>{user.name}</h3>
                                <span className="user-email">{user.email}</span>
                            </div>
                            <span className={`tier-badge ${getTierClass(user.riskScore.tier)}`}>
                                {user.riskScore.tier}
                            </span>
                        </div>

                        <div className="user-card-stats">
                            <div className="user-stat">
                                <TrendingUp size={14} />
                                <span className="stat-label">Return Rate</span>
                                <span className="stat-value">{(user.returnRate * 100).toFixed(0)}%</span>
                            </div>
                            <div className="user-stat">
                                <ShieldAlert size={14} />
                                <span className="stat-label">Risk Score</span>
                                <span className={`stat-value ${user.riskScore.overall >= 70 ? 'text-critical' : ''}`}>
                                    {user.riskScore.overall}
                                </span>
                            </div>
                            <div className="user-stat">
                                <Clock size={14} />
                                <span className="stat-label">Avg. Return</span>
                                <span className="stat-value">{user.avgDaysToReturn}d</span>
                            </div>
                        </div>

                        {user.primaryFraudType !== 'None' && (
                            <div className="user-card-fraud-tag">
                                {user.primaryFraudType}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <Search size={48} />
                    <p>No users found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};
