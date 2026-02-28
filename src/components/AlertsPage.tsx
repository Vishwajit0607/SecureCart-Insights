import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AlertTriangle, ShieldAlert, Clock, Eye, CheckCircle, XCircle } from 'lucide-react';
import './AlertsPage.css';

interface AlertsPageProps {
    users: UserProfile[];
    onViewUser: (user: UserProfile) => void;
}

interface Alert {
    id: string;
    userId: string;
    userName: string;
    type: 'critical' | 'warning' | 'info';
    category: string;
    message: string;
    timestamp: string;
    status: 'new' | 'acknowledged' | 'dismissed';
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ users, onViewUser }) => {
    const flaggedUsers = users.filter(u => u.isFlagged);

    const generateAlerts = (): Alert[] => {
        const alerts: Alert[] = [];
        flaggedUsers.forEach((u, i) => {
            alerts.push({
                id: `ALT-${1000 + i}`,
                userId: u.id,
                userName: u.name,
                type: u.riskScore.overall >= 80 ? 'critical' : 'warning',
                category: u.primaryFraudType,
                message: u.explanation.substring(0, 120) + '...',
                timestamp: `${Math.floor(Math.random() * 48) + 1}h ago`,
                status: 'new',
            });
        });
        // Add a couple of info alerts
        alerts.push({
            id: 'ALT-SYS-01',
            userId: '',
            userName: 'System',
            type: 'info',
            category: 'System',
            message: 'Weekly fraud summary report has been generated and is ready for review.',
            timestamp: '6h ago',
            status: 'acknowledged',
        });
        alerts.push({
            id: 'ALT-SYS-02',
            userId: '',
            userName: 'System',
            type: 'info',
            category: 'Model',
            message: 'Fraud detection model retrained with latest data. Accuracy: 94.2% (+0.3%).',
            timestamp: '12h ago',
            status: 'acknowledged',
        });
        return alerts;
    };

    const [alerts, setAlerts] = useState<Alert[]>(generateAlerts);
    const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'acknowledged' | 'dismissed'>('all');

    const handleAcknowledge = (alertId: string) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    };

    const handleDismiss = (alertId: string) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'dismissed' } : a));
    };

    const filteredAlerts = alerts.filter(a => filterStatus === 'all' || a.status === filterStatus);

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical': return <ShieldAlert size={18} className="text-critical" />;
            case 'warning': return <AlertTriangle size={18} className="text-warning" />;
            default: return <Clock size={18} className="text-accent" />;
        }
    };

    const newCount = alerts.filter(a => a.status === 'new').length;
    const ackCount = alerts.filter(a => a.status === 'acknowledged').length;

    return (
        <div className="alerts-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Fraud Alerts</h1>
                    <p className="page-subtitle">
                        <span className="alert-count-badge critical">{newCount} new</span>
                        <span className="alert-count-badge info">{ackCount} acknowledged</span>
                    </p>
                </div>

                <div className="alert-filters">
                    {(['all', 'new', 'acknowledged', 'dismissed'] as const).map(status => (
                        <button
                            key={status}
                            className={`filter-chip ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="alerts-list">
                {filteredAlerts.map((alert, idx) => (
                    <div
                        key={alert.id}
                        className={`alert-card panel alert-${alert.type} alert-status-${alert.status}`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                        <div className="alert-icon-col">
                            {getAlertIcon(alert.type)}
                        </div>
                        <div className="alert-content">
                            <div className="alert-top-row">
                                <span className="alert-id font-mono">{alert.id}</span>
                                <span className={`alert-type-badge alert-type-${alert.type}`}>{alert.category}</span>
                                <span className="alert-time">{alert.timestamp}</span>
                            </div>
                            <p className="alert-message">
                                <strong>{alert.userName}</strong> — {alert.message}
                            </p>
                        </div>
                        <div className="alert-actions">
                            {alert.userId && (
                                <button
                                    className="alert-action-btn view-btn"
                                    title="View user profile"
                                    onClick={() => {
                                        const user = users.find(u => u.id === alert.userId);
                                        if (user) onViewUser(user);
                                    }}
                                >
                                    <Eye size={16} />
                                </button>
                            )}
                            {alert.status === 'new' && (
                                <button
                                    className="alert-action-btn ack-btn"
                                    title="Acknowledge"
                                    onClick={() => handleAcknowledge(alert.id)}
                                >
                                    <CheckCircle size={16} />
                                </button>
                            )}
                            {alert.status !== 'dismissed' && (
                                <button
                                    className="alert-action-btn dismiss-btn"
                                    title="Dismiss"
                                    onClick={() => handleDismiss(alert.id)}
                                >
                                    <XCircle size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredAlerts.length === 0 && (
                <div className="empty-state">
                    <CheckCircle size={48} />
                    <p>No alerts matching this filter</p>
                </div>
            )}
        </div>
    );
};
