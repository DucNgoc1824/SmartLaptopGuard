// src/components/ActionHistory.jsx
import React, { useState, useEffect } from 'react';
import './ActionHistory.css';

const ActionHistory = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Tạm thời dùng Mock Data khớp với Figma (Sau này có API thì thay bằng axios.get)
        const fetchHistory = () => {
            setIsLoading(true);
            setTimeout(() => {
                setHistory([
                    { id: 551, deviceName: "Cooling Fan", action: "ON", status: "SUCCESS", timestamp: "2024-01-15T10:30:05Z" },
                    { id: 552, deviceName: "RGB Light", action: "OFF", status: "SUCCESS", timestamp: "2024-01-15T10:30:05Z" },
                    { id: 553, deviceName: "Dehumidifier", action: "ON", status: "LOADING", timestamp: "2024-01-15T10:30:05Z" },
                    { id: 554, deviceName: "Posture Alert", action: "ON", status: "FAILED", timestamp: "2024-01-15T10:30:05Z" },
                    { id: 555, deviceName: "Posture Alert", action: "OFF", status: "SUCCESS", timestamp: "2024-01-15T10:30:05Z" }
                ]);
                setIsLoading(false);
            }, 800);
        };
        fetchHistory();
    }, []);

    const getStatusClass = (status) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS': return 'status-success';
            case 'FAILED': return 'status-failed';
            case 'LOADING': return 'status-loading';
            default: return '';
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-GB', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div className="table-page">
            <h2><i className="fa-solid fa-clock-rotate-left"></i> Action History</h2>

            <div className="filter-container">
                <div className="filter-row">
                    <div className="filter-item">
                        <label>Device</label>
                        <select className="input-field">
                            <option value="">All Devices</option>
                            <option value="fan">Cooling Fan</option>
                            <option value="light">RGB Light</option>
                            <option value="ac">Dehumidifier</option>
                            <option value="posture">Posture Alert</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>Action</label>
                        <select className="input-field">
                            <option value="">All</option>
                            <option value="ON">ON</option>
                            <option value="OFF">OFF</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>Status</label>
                        <select className="input-field">
                            <option value="">All</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                            <option value="LOADING">Loading</option>
                        </select>
                    </div>
                    <div className="btn-group">
                        <button className="btn btn-search">
                            <i className="fas fa-search"></i> Search
                        </button>
                        <button className="btn btn-refresh">
                            <i className="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Action ID</th>
                            <th>Device Name</th>
                            <th>Action</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="loading-text">
                                    <i className="fa-solid fa-spinner fa-spin"></i> Loading history...
                                </td>
                            </tr>
                        ) : (
                            history.map((item, index) => (
                                <tr key={index}>
                                    <td>#{item.id}</td>
                                    <td>{item.deviceName}</td>
                                    <td style={{ fontWeight: 'bold' }}>{item.action}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(item.timestamp)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActionHistory;