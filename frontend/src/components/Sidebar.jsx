// src/components/Sidebar.jsx
import React from 'react';
import '../style/Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
        { id: 'sensor-data', icon: 'fa-database', label: 'Sensor Data' },
        { id: 'action-history', icon: 'fa-clock-rotate-left', label: 'Action History' },
        { id: 'action-manager', icon: 'fa-chart-line', label: 'Action Manager' },
        { id: 'profile', icon: 'fa-user-gear', label: 'Profile & Docs' },
    ];

    return (
        <nav className="sidebar">
            <div className="logo">
                <i className="fa-solid fa-laptop-code"></i> Smart Cooling Stand
            </div>

            {menuItems.map((item) => (
                <div
                    key={item.id}
                    className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                >
                    <i className={`fa-solid ${item.icon}`}></i> {item.label}
                </div>
            ))}
        </nav>
    );
};

export default Sidebar;