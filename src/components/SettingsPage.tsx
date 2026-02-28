import React, { useState } from 'react';
import { Save, RotateCcw, Shield, Bell, Sliders, Database } from 'lucide-react';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
    const [riskThresholdHigh, setRiskThresholdHigh] = useState(70);
    const [riskThresholdMed, setRiskThresholdMed] = useState(40);
    const [returnRateAlert, setReturnRateAlert] = useState(50);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [slackAlerts, setSlackAlerts] = useState(false);
    const [autoFlag, setAutoFlag] = useState(true);
    const [retrainFreq, setRetrainFreq] = useState('weekly');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleReset = () => {
        setRiskThresholdHigh(70);
        setRiskThresholdMed(40);
        setReturnRateAlert(50);
        setEmailAlerts(true);
        setSlackAlerts(false);
        setAutoFlag(true);
        setRetrainFreq('weekly');
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Configure fraud detection thresholds and alert preferences</p>
                </div>
                <div className="settings-actions">
                    <button className="settings-btn secondary" onClick={handleReset}>
                        <RotateCcw size={16} />
                        <span>Reset Defaults</span>
                    </button>
                    <button className="settings-btn primary" onClick={handleSave}>
                        <Save size={16} />
                        <span>{saved ? 'Saved ✓' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>

            <div className="settings-grid">
                {/* Risk Thresholds */}
                <div className="settings-section panel">
                    <div className="section-header">
                        <Shield size={20} />
                        <h2>Risk Thresholds</h2>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <label>High Risk Threshold</label>
                            <p className="setting-desc">Users scoring above this value are flagged as high risk</p>
                        </div>
                        <div className="setting-control">
                            <input
                                type="range"
                                min={50}
                                max={95}
                                value={riskThresholdHigh}
                                onChange={e => setRiskThresholdHigh(Number(e.target.value))}
                            />
                            <span className="range-value text-critical">{riskThresholdHigh}</span>
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <label>Medium Risk Threshold</label>
                            <p className="setting-desc">Users scoring above this value are classified as medium risk</p>
                        </div>
                        <div className="setting-control">
                            <input
                                type="range"
                                min={20}
                                max={riskThresholdHigh - 1}
                                value={riskThresholdMed}
                                onChange={e => setRiskThresholdMed(Number(e.target.value))}
                            />
                            <span className="range-value text-warning">{riskThresholdMed}</span>
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <label>Return Rate Alert Threshold</label>
                            <p className="setting-desc">Trigger alert when a user's return rate exceeds this %</p>
                        </div>
                        <div className="setting-control">
                            <input
                                type="range"
                                min={20}
                                max={90}
                                value={returnRateAlert}
                                onChange={e => setReturnRateAlert(Number(e.target.value))}
                            />
                            <span className="range-value">{returnRateAlert}%</span>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="settings-section panel">
                    <div className="section-header">
                        <Bell size={20} />
                        <h2>Notification Preferences</h2>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <label>Email Alerts</label>
                            <p className="setting-desc">Receive fraud alerts via email</p>
                        </div>
                        <div className="setting-control">
                            <button
                                className={`toggle-switch ${emailAlerts ? 'on' : 'off'}`}
                                onClick={() => setEmailAlerts(!emailAlerts)}
                            >
                                <div className="toggle-thumb" />
                            </button>
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <label>Slack Integration</label>
                            <p className="setting-desc">Send alerts to Slack channel</p>
                        </div>
                        <div className="setting-control">
                            <button
                                className={`toggle-switch ${slackAlerts ? 'on' : 'off'}`}
                                onClick={() => setSlackAlerts(!slackAlerts)}
                            >
                                <div className="toggle-thumb" />
                            </button>
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <label>Auto-Flag High Risk</label>
                            <p className="setting-desc">Automatically flag users who exceed the high-risk threshold</p>
                        </div>
                        <div className="setting-control">
                            <button
                                className={`toggle-switch ${autoFlag ? 'on' : 'off'}`}
                                onClick={() => setAutoFlag(!autoFlag)}
                            >
                                <div className="toggle-thumb" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Model Settings */}
                <div className="settings-section panel">
                    <div className="section-header">
                        <Sliders size={20} />
                        <h2>Model Configuration</h2>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <label>Retraining Frequency</label>
                            <p className="setting-desc">How often the fraud detection model is retrained</p>
                        </div>
                        <div className="setting-control">
                            <select
                                value={retrainFreq}
                                onChange={e => setRetrainFreq(e.target.value)}
                                className="settings-select"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Bi-weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="settings-section panel">
                    <div className="section-header">
                        <Database size={20} />
                        <h2>Data Management</h2>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <label>Export Data</label>
                            <p className="setting-desc">Download all user risk data as CSV</p>
                        </div>
                        <div className="setting-control">
                            <button className="settings-btn secondary" onClick={() => alert('Export started! (Demo)')}>
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {saved && (
                <div className="save-toast">
                    <Save size={16} />
                    Settings saved successfully!
                </div>
            )}
        </div>
    );
};
