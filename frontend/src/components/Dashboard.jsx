// src/components/Dashboard.jsx
import React, { useState } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Component đại diện cho 1 nút bấm (Khớp với Sequence Diagram)
const DeviceControlBtn = ({ deviceId, iconClass, activeClass, defaultName }) => {
    const [isOn, setIsOn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        if (isLoading) return;

        const targetAction = isOn ? "OFF" : "ON";
        setIsLoading(true); // Sequence Step 3: Set status to Loading

        try {
            // Sequence Step 2: POST /api/devices/control
            const response = await axios.post('http://localhost:3000/api/devices/control', {
                deviceId: deviceId,
                actionName: targetAction
            });

            if (response.data.success) {
                // Sequence Step 10 & 11: HTTP 200 OK & Update UI
                // Simulate delay for MQTT Hardware ACK
                setTimeout(() => {
                    setIsOn(!isOn);
                    setIsLoading(false);
                }, 1000);
            }
        } catch (error) {
            console.error("API Error:", error);
            setIsLoading(false);
            // Sequence Step 13 & 14: Timeout / Error
            alert(`Failed to execute: ${defaultName}`);
        }
    };

    // Cập nhật lại phần return bên trong const DeviceControlBtn = (...) => {
    return (
        <div
            className={`control-btn ${isOn ? activeClass : ''} ${isLoading ? 'loading-state' : ''}`}
            onClick={handleToggle}
        >
            {isLoading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
                <i className={iconClass}></i>
            )}

            <span>{defaultName}: {isLoading ? "LOADING..." : (isOn ? "ON" : "OFF")}</span>

            <div className="toggle-switch">
                <div className="toggle-knob" style={{ transform: isOn ? 'translateX(28px)' : 'translateX(0)' }}></div>
            </div>

            {/* Thêm phần này để vẽ hiệu ứng sóng radar đỏ cho nút thứ 4 */}
            {deviceId === 2 && (
                <div className="alert-waves" aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    // Chart Config matching Figma Dark Theme
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: 'rgba(255,255,255,0.9)' } }
        },
        scales: {
            x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
    };

    // Dummy data to match your Figma screenshot shape
    const tempHumData = {
        labels: ['13:14:05', '13:16:05', '13:18:05', '13:20:05', '13:20:09', '13:20:13'],
        datasets: [
            { label: 'Laptop Temp (°C)', data: [35, 38, 49, 36, 41, 39], borderColor: '#ff4d6d', tension: 0.4 },
            { label: 'Ambient Humid (%)', data: [64, 66, 64, 67, 63, 66], borderColor: '#00d2ff', tension: 0.4 }
        ]
    };

    const lightDistData = {
        labels: ['13:14:05', '13:16:05', '13:18:05', '13:20:05', '13:20:09', '13:20:13'],
        datasets: [
            { label: 'Ambient Light (Lux)', data: [880, 320, 980, 250, 680, 100], borderColor: '#ffd166', tension: 0.4 },
            { label: 'Dist (cm)', data: [75, 41, 79, 45, 28, 78], borderColor: '#a29bfe', tension: 0.4 }
        ]
    };

    return (
        <div className="dashboard-container">
            {/* Top Stats */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Laptop Temp</h3>
                        <h1>42.5 °C</h1>
                    </div>
                    <div className="card-icon temp-icon"><i className="fa-solid fa-temperature-three-quarters"></i></div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Ambient Humid</h3>
                        <h1>65.0 %</h1>
                    </div>
                    <div className="card-icon hum-icon"><i className="fa-solid fa-droplet"></i></div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Ambient Light</h3>
                        <h1>300 Lux</h1>
                    </div>
                    <div className="card-icon light-icon"><i className="fa-solid fa-sun"></i></div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Sitting Distance (cm)</h3>
                        <h1>42 cm</h1>
                    </div>
                    <div className="card-icon dist-icon"><i className="fa-solid fa-ruler"></i></div>
                </div>
            </div>

            {/* Middle Charts */}
            <div className="charts-container">
                <div className="chart-wrapper">
                    <div className="chart-title">Temperature & Humidity</div>
                    <div className="chart-body"><Line data={tempHumData} options={chartOptions} /></div>
                </div>
                <div className="chart-wrapper">
                    <div className="chart-title">Light & Distance</div>
                    <div className="chart-body"><Line data={lightDistData} options={chartOptions} /></div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="controls-container">
                <DeviceControlBtn deviceId={3} iconClass="fa-solid fa-fan" activeClass="active-fan" defaultName="Cooling Fan" />
                <DeviceControlBtn deviceId={1} iconClass="fa-regular fa-lightbulb" activeClass="active-light" defaultName="RGB Light" />
                <DeviceControlBtn deviceId={4} iconClass="fa-solid fa-droplet-slash" activeClass="active-ac" defaultName="Dehumidifier" />
                <DeviceControlBtn deviceId={2} iconClass="fa-solid fa-bell" activeClass="active-posture" defaultName="Posture Alert" />
            </div>
        </div>
    );
};

export default Dashboard;