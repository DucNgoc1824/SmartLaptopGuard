import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SensorData.css';

const SensorData = () => {
    // State lưu dữ liệu
    const [sensors, setSensors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // State cho Phân trang
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10; // Số dòng trên 1 trang

    // State cho Bộ lọc
    const [filters, setFilters] = useState({
        sensorType: '',
        startDate: '',
        endDate: '',
        sort: 'newest'
    });

    // Hàm gọi API kèm Query Params
    const fetchSensorData = async () => {
        setIsLoading(true);
        try {
            // Đẩy tất cả state vào URL query
            const response = await axios.get('http://localhost:3000/api/sensors', {
                params: {
                    page: page,
                    limit: limit,
                    sensorType: filters.sensorType,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    sort: filters.sort
                }
            });

            if (response.data.success) {
                setSensors(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu cảm biến:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Tự động gọi lại API mỗi khi `page` thay đổi
    useEffect(() => {
        fetchSensorData();
    }, [page]);

    // Bắt sự kiện người dùng nhập bộ lọc
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Khi bấm Search, reset về trang 1 và gọi API
    const handleSearch = () => {
        if (page === 1) {
            fetchSensorData(); // Nếu đang ở trang 1 thì gọi luôn
        } else {
            setPage(1); // Set về 1 sẽ tự trigger useEffect bên trên
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const getUnit = (sensorName) => {
        const name = sensorName.toLowerCase();
        if (name.includes('temp')) return '°C';
        if (name.includes('humid')) return '%';
        if (name.includes('light')) return 'Lux';
        if (name.includes('dist')) return 'cm';
        return 'State';
    };

    return (
        <div className="table-page">
            <h2><i className="fa-solid fa-database"></i> Sensor Data History</h2>

            {/* --- BỘ LỌC --- */}
            <div className="filter-container">
                <div className="filter-row">
                    <div className="filter-item">
                        <label>Sensor Type</label>
                        <select name="sensorType" value={filters.sensorType} onChange={handleFilterChange} className="input-field">
                            <option value="">All Sensors</option>
                            <option value="Temp">Laptop Temp</option>
                            <option value="Humid">Ambient Humid</option>
                            <option value="Light">Ambient Light</option>
                            <option value="Dist">Sitting Distance</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>From Time</label>
                        <input type="datetime-local" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input-field" />
                    </div>
                    <div className="filter-item">
                        <label>To Time</label>
                        <input type="datetime-local" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input-field" />
                    </div>
                    <div className="filter-item">
                        <label>Sort</label>
                        <select name="sort" value={filters.sort} onChange={handleFilterChange} className="input-field">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                    <div className="btn-group">
                        <button className="btn btn-search" onClick={handleSearch}>
                            <i className="fas fa-search"></i> Search
                        </button>
                    </div>
                </div>
            </div>

            {/* --- BẢNG DỮ LIỆU --- */}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Sensor</th>
                            <th>Value</th>
                            <th>Unit</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="loading-text">
                                    <i className="fa-solid fa-spinner fa-spin"></i> Loading data...
                                </td>
                            </tr>
                        ) : sensors.length > 0 ? (
                            sensors.map((item, index) => (
                                <tr key={index}>
                                    <td>#{item.ID}</td>
                                    <td>{item.sensorName}</td>
                                    <td style={{ fontWeight: 'bold', color: '#00d2ff' }}>{item.value}</td>
                                    <td>{getUnit(item.sensorName)}</td>
                                    <td>{formatDate(item.time)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No data found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- THANH PHÂN TRANG (PAGINATION) --- */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                    className="btn btn-refresh"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    style={{ opacity: page === 1 ? 0.5 : 1 }}
                >
                    <i className="fa-solid fa-chevron-left"></i> Prev
                </button>

                <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'white' }}>
                    Page {page} / {totalPages === 0 ? 1 : totalPages}
                </span>

                <button
                    className="btn btn-refresh"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    style={{ opacity: page >= totalPages ? 0.5 : 1 }}
                >
                    Next <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </div>
    );
};

export default SensorData;