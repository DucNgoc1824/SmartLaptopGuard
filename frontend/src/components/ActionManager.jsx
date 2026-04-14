import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../style/ActionManager.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const DEVICE_ORDER = ['Cooling Fan', 'RGB Light', 'Dehumidifier', 'Posture Alert', 'NewDevice'];

const formatLabelDate = (dateString) => {
    const dateObj = new Date(dateString);
    if (Number.isNaN(dateObj.getTime())) return dateString;
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
};

const ActionManager = () => {
    const [chartData, setChartData] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('http://localhost:3000/api/devices/stats');
                if (response.data.success) {
                    const data = response.data.data || [];
                    setRawData(data);

                    setChartData({
                        labels: data.map((item) => formatLabelDate(item.date)),
                        datasets: [
                            {
                                label: 'Total successful control actions',
                                data: data.map((item) => item.total),
                                borderColor: '#00d2ff',
                                backgroundColor: 'rgba(0, 210, 255, 0.18)',
                                fill: true,
                                tension: 0.35,
                                pointRadius: 4,
                                pointHoverRadius: 7,
                                pointBackgroundColor: '#00d2ff',
                            },
                        ],
                    });
                }
            } catch (error) {
                console.error('Failed to fetch action statistics:', error);
                setRawData([]);
                setChartData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: 'rgba(255,255,255,0.9)' } },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                padding: 12,
                callbacks: {
                    label: (context) => `Total: ${context.parsed.y} times`,
                    afterBody: (context) => {
                        const dataIndex = context[0]?.dataIndex;
                        const dayData = rawData[dataIndex];
                        if (!dayData) return [];

                        const breakdown = dayData.breakdown || {};
                        const extraDeviceNames = Object.keys(breakdown).filter(
                            (name) => !DEVICE_ORDER.includes(name)
                        );
                        const orderedDeviceNames = [...DEVICE_ORDER, ...extraDeviceNames];

                        return [
                            '-------------------------',
                            ...orderedDeviceNames.map((deviceName) => `${deviceName}: ${breakdown[deviceName] || 0} times`),
                        ];
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: { color: 'rgba(255,255,255,0.7)' },
                grid: { color: 'rgba(255,255,255,0.05)' },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'rgba(255,255,255,0.7)',
                    precision: 0,
                },
                grid: { color: 'rgba(255,255,255,0.05)' },
            },
        },
    };

    return (
        <div className="table-page action-manager-page">
            <h2><i className="fa-solid fa-chart-line"></i> Action Manager</h2>

            <div className="action-manager-chart-panel">
                <div className="action-manager-title">Daily Device Control Activity</div>
                <div className="action-manager-chart-body">
                    {isLoading && <div className="action-manager-empty">Loading data...</div>}
                    {!isLoading && chartData && rawData.length > 0 && <Line data={chartData} options={chartOptions} />}
                    {!isLoading && rawData.length === 0 && (
                        <div className="action-manager-empty">No successful actions available for statistics.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionManager;
