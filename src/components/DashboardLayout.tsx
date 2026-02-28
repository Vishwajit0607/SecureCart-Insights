import React, { useState, useRef, useEffect } from 'react';
import './DashboardLayout.css';
import { BarChart3, Users, AlertTriangle, Settings, Menu, Bell, User, Shield, Upload } from 'lucide-react';
import type { Page } from '../App';

interface DashboardLayoutProps {
    children: React.ReactNode;
    currentPage: Page;
    onNavigate: (page: Page) => void;
    onFileUpload?: (file: File) => void;
}

const NOTIFICATIONS = [
    { id: 1, type: 'critical' as const, message: 'USR-1020 flagged as Serial Returner — 70% return rate', time: '2 min ago' },
    { id: 2, type: 'warning' as const, message: 'New wardrobing cluster detected — 3 users identified', time: '15 min ago' },
    { id: 3, type: 'info' as const, message: 'Weekly fraud report generated successfully', time: '1 hr ago' },
    { id: 4, type: 'warning' as const, message: 'Receipt manipulation alert — USR-1032 price mismatch', time: '3 hrs ago' },
];

const PAGE_LABELS: Record<Page, string> = {
    dashboard: '/ Fraud Detection / Returns Analysis',
    users: '/ Fraud Detection / User Profiles',
    alerts: '/ Fraud Detection / Active Alerts',
    settings: '/ Fraud Detection / Settings',
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentPage, onNavigate, onFileUpload }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [readNotifications, setReadNotifications] = useState<number[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const notifRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const unreadCount = NOTIFICATIONS.length - readNotifications.length;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNotificationClick = (id: number) => {
        if (!readNotifications.includes(id)) {
            setReadNotifications(prev => [...prev, id]);
        }
    };

    const markAllRead = () => {
        setReadNotifications(NOTIFICATIONS.map(n => n.id));
    };

    const navItems: { page: Page; icon: React.ReactNode; label: string }[] = [
        { page: 'dashboard', icon: <BarChart3 size={20} />, label: 'Dashboard' },
        { page: 'users', icon: <Users size={20} />, label: 'Users' },
        { page: 'alerts', icon: <AlertTriangle size={20} />, label: 'Alerts' },
        { page: 'settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div className="layout-container">
            <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
                <div className="sidebar-header">
                    <Shield className="logo-icon" size={28} />
                    <h2>FRAUD OPS</h2>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
                            onClick={() => onNavigate(item.page)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="status-indicator">
                        <div className="status-dot green"></div>
                        <span>Detection Active</span>
                    </div>
                </div>
            </aside>

            <div className={`main-wrapper ${sidebarOpen ? '' : 'main-expanded'}`}>
                <header className="top-header">
                    <div className="header-left">
                        <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle sidebar">
                            <Menu size={20} />
                        </button>
                        <span className="current-path">{PAGE_LABELS[currentPage]}</span>
                    </div>
                    <div className="header-right">
                        {onFileUpload && (
                            <>
                                <input
                                    type="file"
                                    accept=".csv"
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            onFileUpload(e.target.files[0]);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button
                                    className="upload-btn"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: 'var(--accent-emerald)', border: '1px solid rgba(16,185,129,0.3)',
                                        padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer',
                                        marginRight: '12px'
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Upload Custom Data"
                                >
                                    <Upload size={16} />
                                    <span>Import Data</span>
                                </button>
                            </>
                        )}
                        <div className="notification-wrapper" ref={notifRef}>
                            <button
                                className="icon-btn notification-btn"
                                onClick={() => setShowNotifications(!showNotifications)}
                                title="Notifications"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="notif-header">
                                        <h4>Notifications</h4>
                                        {unreadCount > 0 && (
                                            <button className="mark-read-btn" onClick={markAllRead}>
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="notif-list">
                                        {NOTIFICATIONS.map(n => (
                                            <div
                                                key={n.id}
                                                className={`notif-item ${readNotifications.includes(n.id) ? 'read' : 'unread'} notif-${n.type}`}
                                                onClick={() => handleNotificationClick(n.id)}
                                            >
                                                <div className="notif-dot-wrapper">
                                                    <div className={`notif-dot notif-dot-${n.type}`} />
                                                </div>
                                                <div className="notif-content">
                                                    <p className="notif-message">{n.message}</p>
                                                    <span className="notif-time">{n.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="icon-btn user-btn" title="Profile">
                            <User size={20} />
                        </button>
                    </div>
                </header>

                <main className="content-area" key={currentPage}>
                    {children}
                </main>
            </div>
        </div>
    );
};
