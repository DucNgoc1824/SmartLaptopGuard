// src/App.jsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SensorData from './components/SensorData';
import ActionHistory from './components/ActionHistory'; // Import mới
import Profile from './components/Profile';             // Import mới
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'sensor-data' && <SensorData />}

        {/* Render 2 trang mới */}
        {activeTab === 'action-history' && <ActionHistory />}
        {activeTab === 'profile' && <Profile />}
      </main>
    </div>
  );
}

export default App;