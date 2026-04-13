import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/SensorData.css';

const SensorData = () => {
    const [sensors, setSensors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [limitInput, setLimitInput] = useState('10');
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // State chuẩn form theo yêu cầu của bạn
    const defaultFilters = { sensorType: '', exactValue: '', exactTime: '', sort: 'time-desc' };
    const [filters, setFilters] = useState(defaultFilters);

    // Hàm gọi API (Có tham số override để Reset gọi được ngay lập tức)
    const fetchSensorData = async (overrideFilters = null) => {
        setIsLoading(true);
        const currentFilters = overrideFilters || filters;
        try {
            const response = await axios.get('http://localhost:3000/api/sensors', {
                params: {
                    page: page,
                    limit: limit,
                    sensorType: currentFilters.sensorType,
                    exactValue: currentFilters.exactValue,
                    exactTime: currentFilters.exactTime,
                    sort: currentFilters.sort
                }
            });

            if (response.data.success) {
                setSensors(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalRecords(response.data.pagination.totalRecords);
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu cảm biến:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Theo dõi thay đổi trang -> Gọi lại API
    useEffect(() => { fetchSensorData(); }, [page]);

    useEffect(() => {
        if (page === 1) fetchSensorData();
        else setPage(1);
    }, [limit]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Nút Search
    const handleSearch = () => {
        if (page === 1) fetchSensorData();
        else setPage(1);
    };

    // Nút Reset
    const handleReset = () => {
        setFilters(defaultFilters);
        if (page === 1) fetchSensorData(defaultFilters);
        else setPage(1);
    };

    const applyLimitInput = () => {
        const parsed = Number(limitInput);
        const normalized = Number.isFinite(parsed) && parsed > 0 ? Math.min(500, Math.floor(parsed)) : 10;
        setLimitInput(String(normalized));
        if (normalized !== limit) setLimit(normalized);
    };

    // Định dạng yyyy/mm/dd hh:mm:ss
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`;
    };

    // Ghép Đơn vị vào Giá trị
    const formatValueWithUnit = (val, sensorName) => {
        const name = sensorName.toLowerCase();
        let unit = 'State';
        if (name.includes('temp')) unit = '°C';
        if (name.includes('humid')) unit = '%';
        if (name.includes('light')) unit = 'Lux';
        if (name.includes('dist')) unit = 'cm';

        // Làm tròn số nếu nó lẻ
        let num = Number(val);
        num = num % 1 === 0 ? num : num.toFixed(1);
        return `${num} ${unit}`;
    };

    // Thuật toán vẽ nút Phân trang (Siêu Back / Next)
    const renderPagination = () => {
        const pages = [];
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(totalPages, page + 2);

        // Đảm bảo luôn hiện 5 nút nếu có đủ trang
        if (endPage - startPage < 4) {
            if (startPage === 1) endPage = Math.min(totalPages, 5);
            else if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button key={i} className={`page-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>
                    {i}
                </button>
            );
        }

        return (
            <div className="pagination-controls">
                <button className="nav-btn" disabled={page === 1} onClick={() => setPage(1)} title="Trang đầu">
                    <i className="fa-solid fa-angles-left"></i>
                </button>
                <button className="nav-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    <i className="fa-solid fa-angle-left"></i>
                </button>

                {startPage > 1 && <span className="page-dots">...</span>}
                {pages}
                {endPage < totalPages && <span className="page-dots">...</span>}

                <button className="nav-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                    <i className="fa-solid fa-angle-right"></i>
                </button>
                <button className="nav-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)} title="Trang cuối">
                    <i className="fa-solid fa-angles-right"></i>
                </button>
            </div>
        );
    };

    // Hàm ánh xạ màu Cảm biến đồng bộ với Nút điều khiển
    const getValueColor = (sensorName) => {
        const name = (sensorName || '').toLowerCase();
        if (name.includes('dist')) return '#ff4d6d';   // Đỏ (Map với Còi báo gù)
        if (name.includes('humid')) return '#2ee59d';  // Xanh lá (Map với Máy hút ẩm)
        if (name.includes('temp')) return '#00d2ff';   // Xanh dương (Map với Quạt tản nhiệt)
        if (name.includes('light')) return '#ffd166';  // Vàng (Map với Đèn RGB)
        return '#ffffff';
    };

    return (
        <div className="table-page">
            <h2><i className="fa-solid fa-database"></i> Sensor Data History</h2>

            {/* --- BỘ LỌC CHUYÊN SÂU --- */}
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
                        <label>Exact Value</label>
                        <input type="number" name="exactValue" placeholder="E.g., 40, 150" value={filters.exactValue} onChange={handleFilterChange} className="input-field" />
                    </div>
                    <div className="filter-item">
                        <label>Exact Time</label>
                        <input type="text" name="exactTime" placeholder="yyyy/mm/dd hh:mm:ss" value={filters.exactTime} onChange={handleFilterChange} className="input-field" />
                    </div>
                    <div className="filter-item">
                        <label>Sort By</label>
                        <select name="sort" value={filters.sort} onChange={handleFilterChange} className="input-field">
                            <option value="time-desc">Time: Newest ➔ Oldest</option>
                            <option value="time-asc">Time: Oldest ➔ Newest</option>
                            <option value="value-desc">Value: High ➔ Low</option>
                            <option value="value-asc">Value: Low ➔ High</option>
                        </select>
                    </div>
                    <div className="btn-group">
                        <button className="btn btn-search" onClick={handleSearch}><i className="fas fa-search"></i> Search</button>
                        <button className="btn btn-refresh" onClick={handleReset}><i className="fas fa-sync-alt"></i> Reset</button>
                    </div>
                </div>
            </div>

            {/* --- BẢNG DỮ LIỆU --- */}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Sensor</th>
                            <th>Value</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" className="loading-text"><i className="fa-solid fa-spinner fa-spin"></i> Loading data...</td></tr>
                        ) : sensors.length > 0 ? (
                            sensors.map((item, index) => (
                                <tr key={index}>
                                    <td>{(page - 1) * limit + index + 1}</td>
                                    <td>{item.sensorName}</td>
                                    <td style={{ fontWeight: 'bold', color: getValueColor(item.sensorName) }}>
                                        {formatValueWithUnit(item.value, item.sensorName)}
                                    </td>
                                    <td>{formatDate(item.time)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>Không tìm thấy dữ liệu khớp với bộ lọc!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- THANH PHÂN TRANG GIAO DIỆN MỚI --- */}
            {!isLoading && sensors.length > 0 && (
                <div className="pagination-wrapper">
                    <div className="total-info">
                        Showing {(page - 1) * limit + 1} - {Math.min(page * limit, totalRecords)} of <b>{totalRecords}</b> records
                    </div>
                    <div className="pagination-right-group">
                        <div className="limit-selector">
                            <span className="limit-label">Rows per page:</span>
                            <input
                                type="number"
                                min="1"
                                max="500"
                                step="1"
                                value={limitInput}
                                onChange={(e) => setLimitInput(e.target.value)}
                                onBlur={applyLimitInput}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') applyLimitInput();
                                }}
                                className="input-field limit-select"
                            />
                        </div>
                        {renderPagination()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SensorData;