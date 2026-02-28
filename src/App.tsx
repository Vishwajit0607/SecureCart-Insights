import { useState } from 'react';
import './App.css';
import { DashboardLayout } from './components/DashboardLayout';
import { SummaryCards } from './components/SummaryCards';
import { DashboardCharts } from './components/Charts';
import { TransactionTable } from './components/ExperimentTable';
import { UserRiskModal } from './components/ExperimentDetailModal';
import { UsersPage } from './components/UsersPage';
import { AlertsPage } from './components/AlertsPage';
import { SettingsPage } from './components/SettingsPage';
import { mockUsers } from './data/mockData';
import { calculateDashboardMetrics } from './utils/anomalyDetection';
import { UserProfile } from './types';
import { parseCsvData } from './utils/csvParser';

export type Page = 'dashboard' | 'users' | 'alerts' | 'settings';

function App() {
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [usersData, setUsersData] = useState<UserProfile[]>(mockUsers);
    const [isUploading, setIsUploading] = useState(false);

    const {
        totalUsers,
        flaggedUsers,
        totalAtRisk,
        avgRiskScore,
        distributionData,
        tierData,
        timelineData
    } = calculateDashboardMetrics(usersData);

    const metrics = {
        totalUsers,
        flaggedUsers,
        totalAtRisk,
        avgRiskScore
    };

    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        setSelectedUser(null);
    };

    const handleFileUpload = async (file: File) => {
        try {
            setIsUploading(true);
            const parsedUsers = await parseCsvData(file) as UserProfile[];
            if (parsedUsers.length > 0) {
                setUsersData(parsedUsers);
                setCurrentPage('dashboard');
            } else {
                alert('No valid user transactions found in CSV.');
            }
        } catch (err) {
            console.error('Failed to parse CSV:', err);
            alert('Failed to parse CSV file. Make sure it has columns like userId, type, amount, date.');
        } finally {
            setIsUploading(false);
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return (
                    <>
                        <SummaryCards metrics={metrics} />
                        <DashboardCharts
                            timelineData={timelineData}
                            distributionData={distributionData}
                            tierData={tierData}
                        />
                        <TransactionTable
                            users={usersData}
                            onSelectUser={setSelectedUser}
                        />
                    </>
                );
            case 'users':
                return <UsersPage users={usersData} onSelectUser={setSelectedUser} />;
            case 'alerts':
                return <AlertsPage users={usersData} onViewUser={setSelectedUser} />;
            case 'settings':
                return <SettingsPage />;
            default:
                return null;
        }
    };

    return (
        <>
            <DashboardLayout
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onFileUpload={handleFileUpload}
            >
                {isUploading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div className="status-dot green" style={{ width: '16px', height: '16px', margin: '0 auto 16px', animationDuration: '1s' }} />
                        <h2>Processing transactions and generating risk scores...</h2>
                        <p>Running ML models via SHAP-style explainability engine.</p>
                    </div>
                ) : (
                    renderPage()
                )}
            </DashboardLayout>

            {selectedUser && !isUploading && (
                <UserRiskModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </>
    );
}

export default App;
