// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../style/Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Component Nút Bấm
const DeviceControlBtn = ({ deviceId, iconClass, activeClass, defaultName }) => {
    // FIX 3: Khởi tạo state bằng cách đọc từ LocalStorage (Nhớ được lúc F5 hoặc chuyển trang)
    const [isOn, setIsOn] = useState(() => {
        return localStorage.getItem(`device_${deviceId}`) === 'true';
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        if (isLoading) return;

        const targetAction = isOn ? "OFF" : "ON";
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/api/devices/control', {
                deviceId: deviceId,
                actionName: targetAction
            });

            if (response.data.success) {
                const actionId = response.data.data.actionId;
                let attempts = 0;

                const checkStatusInterval = setInterval(async () => {
                    attempts++;
                    try {
                        const statusRes = await axios.get(`http://localhost:3000/api/devices/action-status/${actionId}`);
                        const currentStatus = statusRes.data.data.actionStatus;

                        if (currentStatus === 'SUCCESS') {
                            clearInterval(checkStatusInterval);
                            const newState = (targetAction === "ON");
                            setIsOn(newState);
                            localStorage.setItem(`device_${deviceId}`, newState);
                            setIsLoading(false);
                        } else if (attempts >= 10) {
                            // Bước 3: Timeout sau 10 giây
                            clearInterval(checkStatusInterval);

                            // GỌI API BÁO BACKEND SỬA CHỮ 'LOADING' THÀNH 'FAILED' TRONG DB
                            await axios.put(`http://localhost:3000/api/devices/action-status/${actionId}`);

                            setIsLoading(false);
                            // Vì ta không gọi setIsOn(newState) ở đây, nên nút sẽ TỰ ĐỘNG LÙI VỀ TRẠNG THÁI CŨ
                            alert(`⏳ Timeout: Lệnh ${targetAction} cho "${defaultName}" thất bại!`);
                        }
                        // eslint-disable-next-line no-unused-vars
                    } catch (err) {
                        clearInterval(checkStatusInterval);
                        setIsLoading(false);
                    }
                }, 1000);
            }
        } catch (error) {
            console.error("API Error:", error);
            setIsLoading(false);
            alert(`❌ Lỗi: Không gửi được lệnh tới ${defaultName}`);
        }
    };

    return (
        <div className={`control-btn ${isOn ? activeClass : ''} ${isLoading ? 'loading-state' : ''}`} onClick={handleToggle}>
            {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className={iconClass}></i>}
            <span>{defaultName}: {isLoading ? "LOADING..." : (isOn ? "ON" : "OFF")}</span>
            <div className="toggle-switch">
                <div className="toggle-knob" style={{ transform: isOn ? 'translateX(28px)' : 'translateX(0)' }}></div>
            </div>
            {deviceId === 2 && (
                <div className="alert-waves" aria-hidden="true"><span></span><span></span><span></span></div>
            )}
        </div>
    );
};

// Component Dashboard
const Dashboard = () => {
    const [currentStats, setCurrentStats] = useState({
        temp: 0, humid: 0, light: 0, dist: 0
    });

    const [chartData, setChartData] = useState({
        labels: [], temp: [], humid: [], light: [], dist: []
    });

    useEffect(() => {
        let isMounted = true;

        const fetchRealtimeData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/sensors?limit=40&sort=newest');

                if (response.data.success && isMounted) {
                    const rawData = response.data.data.reverse();

                    const temps = rawData.filter(d => d.sensorName.includes('Temp'));
                    const humids = rawData.filter(d => d.sensorName.includes('Humid'));
                    const lights = rawData.filter(d => d.sensorName.includes('Light'));
                    const dists = rawData.filter(d => d.sensorName.includes('Dist'));

                    // FIX 1: Ép tất cả số liệu về 1 chữ số thập phân (Ví dụ 23.3696 -> 23.4)
                    const formatNum = (val) => Number(val).toFixed(1);

                    setCurrentStats({
                        temp: temps.length > 0 ? formatNum(temps[temps.length - 1].value) : "0.0",
                        humid: humids.length > 0 ? formatNum(humids[humids.length - 1].value) : "0.0",
                        light: lights.length > 0 ? formatNum(lights[lights.length - 1].value) : "0.0",
                        dist: dists.length > 0 ? formatNum(dists[dists.length - 1].value) : "0.0",
                    });

                    setChartData({
                        labels: temps.map(d => new Date(d.time).toLocaleTimeString('vi-VN')),
                        temp: temps.map(d => d.value),
                        humid: humids.map(d => d.value),
                        light: lights.map(d => d.value),
                        dist: dists.map(d => d.value),
                    });
                }
            } catch (error) {
                console.error("Lỗi cập nhật biểu đồ:", error);
            }
        };

        fetchRealtimeData();
        const interval = setInterval(fetchRealtimeData, 2000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const tempHumConfig = {
        labels: chartData.labels,
        datasets: [
            { label: 'Laptop Temp (°C)', data: chartData.temp, borderColor: '#ff4d6d', tension: 0.4 },
            { label: 'Ambient Humid (%)', data: chartData.humid, borderColor: '#00d2ff', tension: 0.4 }
        ]
    };

    const lightDistConfig = {
        labels: chartData.labels,
        datasets: [
            { label: 'Ambient Light (Lux)', data: chartData.light, borderColor: '#ffd166', tension: 0.4 },
            { label: 'Dist (cm)', data: chartData.dist, borderColor: '#a29bfe', tension: 0.4 }
        ]
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: 'rgba(255,255,255,0.9)' } } },
        scales: {
            x: { ticks: { color: 'rgba(255,255,255,0.7)', maxTicksLimit: 6 }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
    };

    return (
        <div className="dashboard-container">
            {/* Top Stats */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Laptop Temp</h3>
                        <h1>{currentStats.temp} °C</h1>
                    </div>
                    <div className="card-icon temp-icon"><i className="fa-solid fa-temperature-three-quarters"></i></div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Ambient Humid</h3>
                        <h1>{currentStats.humid} %</h1>
                    </div>
                    <div className="card-icon hum-icon"><i className="fa-solid fa-droplet"></i></div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Ambient Light</h3>
                        <h1>{currentStats.light} Lux</h1>
                    </div>
                    <div className="card-icon light-icon"><i className="fa-solid fa-sun"></i></div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Sitting Distance</h3>
                        <h1>{currentStats.dist} cm</h1>
                    </div>
                    <div className="card-icon dist-icon"><i className="fa-solid fa-ruler"></i></div>
                </div>
            </div>

            {/* Middle Charts */}
            <div className="charts-container">
                <div className="chart-wrapper">
                    <div className="chart-title">Temperature & Humidity</div>
                    <div className="chart-body"><Line data={tempHumConfig} options={chartOptions} /></div>
                </div>
                <div className="chart-wrapper">
                    <div className="chart-title">Light & Distance</div>
                    <div className="chart-body"><Line data={lightDistConfig} options={chartOptions} /></div>
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