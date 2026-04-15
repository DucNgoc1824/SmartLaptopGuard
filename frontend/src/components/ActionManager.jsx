import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import '../style/ActionManager.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ACTION_MANAGER_DATE_KEY = 'action_manager_selected_date';

const getTodayLocalDate = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
};

const isValidDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '');

const ActionManager = () => {
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => {
        const storedDate = localStorage.getItem(ACTION_MANAGER_DATE_KEY);
        return isValidDateString(storedDate) ? storedDate : getTodayLocalDate();
    });

    useEffect(() => {
        localStorage.setItem(ACTION_MANAGER_DATE_KEY, selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://localhost:3000/api/devices/stats?date=${selectedDate}`);
                if (response.data.success) {
                    const data = response.data.data || [];

                    setChartData({
                        labels: data.map((item) => item.deviceName),
                        datasets: [
                            {
                                label: 'ON Count',
                                data: data.map((item) => item.onCount),
                                backgroundColor: 'rgba(46, 229, 157, 0.85)',
                                borderRadius: 6,
                                barPercentage: 0.6,
                                categoryPercentage: 0.8
                            },
                            {
                                label: 'OFF Count',
                                data: data.map((item) => item.offCount),
                                backgroundColor: 'rgba(149, 165, 166, 0.85)',
                                borderRadius: 6,
                                barPercentage: 0.6,
                                categoryPercentage: 0.8
                            },
                        ],
                    });
                }
            } catch (error) {
                console.error('Failed to fetch action statistics:', error);
                setChartData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [selectedDate]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: 'rgba(255,255,255,0.9)', font: { size: 13 } },
                position: 'top',
                align: 'end'
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                padding: 12,
            },
        },
        scales: {
            x: {
                ticks: { color: 'rgba(255,255,255,0.7)', font: { weight: 'bold' } },
                grid: { color: 'rgba(255,255,255,0.05)', display: false },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'rgba(255,255,255,0.7)',
                    precision: 0,
                    stepSize: 2,
                },
                grid: { color: 'rgba(255,255,255,0.1)', borderDash: [5, 5] },
            },
        },
    };

    return (
        <div className="table-page action-manager-page">
            <h2><i className="fa-solid fa-chart-simple"></i> Action Manager</h2>

            <div className="action-manager-chart-panel">
                <div className="am-top-bar">
                    <div className="am-title-group">
                        <div className="action-manager-title">Device ON/OFF statistics</div>
                        <p>Successful actions for the selected date</p>
                    </div>
                    <div className="am-date-picker">
                        <label>Select date:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="action-manager-chart-body">
                    {isLoading && <div className="action-manager-empty"><i className="fa-solid fa-spinner fa-spin"></i> Loading data...</div>}
                    {!isLoading && chartData && <Bar data={chartData} options={chartOptions} />}
                    {!isLoading && !chartData && (
                        <div className="action-manager-empty">No data found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionManager;
