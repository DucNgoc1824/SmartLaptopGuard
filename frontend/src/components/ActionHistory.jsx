// src/components/ActionHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/ActionHistory.css';

const ActionHistory = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [limitInput, setLimitInput] = useState('10');
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Bộ lọc mặc định cho Action History
    const defaultFilters = { device: '', action: '', status: '', exactTime: '', sort: 'time-desc' };
    const [filters, setFilters] = useState(defaultFilters);

    const fetchHistory = async (overrideFilters = null) => {
        setIsLoading(true);
        const currentFilters = overrideFilters || filters;
        try {
            const response = await axios.get('http://localhost:3000/api/devices/history', {
                params: {
                    page: page,
                    limit: limit,
                    device: currentFilters.device,
                    action: currentFilters.action,
                    status: currentFilters.status,
                    exactTime: currentFilters.exactTime,
                    sort: currentFilters.sort
                }
            });

            if (response.data.success) {
                setHistory(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalRecords(response.data.pagination.totalRecords);
            }
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, [page]);

    useEffect(() => {
        if (page === 1) fetchHistory();
        else setPage(1);
    }, [limit]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = () => {
        if (page === 1) fetchHistory();
        else setPage(1);
    };

    const handleFilterKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    const handleReset = () => {
        setFilters(defaultFilters);
        if (page === 1) fetchHistory(defaultFilters);
        else setPage(1);
    };

    const applyLimitInput = () => {
        const parsed = Number(limitInput);
        const normalized = Number.isFinite(parsed) && parsed > 0 ? Math.min(500, Math.floor(parsed)) : 10;
        setLimitInput(String(normalized));
        if (normalized !== limit) setLimit(normalized);
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`;
    };

    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case 'SUCCESS': return 'status-success';
            case 'FAILED': return 'status-failed';
            case 'LOADING': return 'status-loading';
            default: return '';
        }
    };

    const renderPagination = () => {
        const pages = [];
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(totalPages, page + 2);

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

    // Hàm ánh xạ màu Thiết bị đồng bộ với Nút điều khiển
    const getValueColor = (deviceName) => {
        const name = (deviceName || '').toLowerCase();
        if (name.includes('posture') || name.includes('dist')) return '#ff4d6d';   // Đỏ
        if (name.includes('dehumidifier') || name.includes('humid')) return '#2ee59d';  // Xanh lá
        if (name.includes('fan') || name.includes('temp')) return '#00d2ff';   // Xanh dương
        if (name.includes('light')) return '#ffd166';  // Vàng
        return '#ffffff';
    };

    return (
        <div className="table-page action-history-page">
            <h2><i className="fa-solid fa-clock-rotate-left"></i> Action History</h2>

            <div className="filter-container">
                <div className="filter-row" onKeyDown={handleFilterKeyDown}>
                    <div className="filter-item filter-compact">
                        <label>Device</label>
                        <select name="device" value={filters.device} onChange={handleFilterChange} className="input-field">
                            <option value="">All Devices</option>
                            <option value="Fan">Cooling Fan</option>
                            <option value="Light">RGB Light</option>
                            <option value="Dehumidifier">Dehumidifier</option>
                            <option value="Posture">Posture Alert</option>
                            <option value="NewDevice">New Device</option>
                        </select>
                    </div>
                    <div className="filter-item filter-compact">
                        <label>Action</label>
                        <select name="action" value={filters.action} onChange={handleFilterChange} className="input-field">
                            <option value="">All Actions</option>
                            <option value="ON">ON</option>
                            <option value="OFF">OFF</option>
                        </select>
                    </div>
                    <div className="filter-item filter-compact">
                        <label>Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="input-field">
                            <option value="">All Status</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                    <div className="filter-item filter-time">
                        <label>Exact Time</label>
                        <input type="text" name="exactTime" placeholder="yyyy/mm/dd hh:mm:ss" value={filters.exactTime} onChange={handleFilterChange} className="input-field" />
                    </div>
                    <div className="filter-item filter-sort">
                        <label>Sort By</label>
                        <select name="sort" value={filters.sort} onChange={handleFilterChange} className="input-field">
                            <option value="time-desc">Time: Newest ➔ Oldest</option>
                            <option value="time-asc">Time: Oldest ➔ Newest</option>
                        </select>
                    </div>
                    <div className="btn-group">
                        <button className="btn btn-search" onClick={handleSearch}><i className="fas fa-search"></i> Search</button>
                        <button className="btn btn-refresh" onClick={handleReset}><i className="fas fa-sync-alt"></i> Reset</button>
                    </div>
                </div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Device Name</th>
                            <th>Action</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5" className="loading-text"><i className="fa-solid fa-spinner fa-spin"></i> Loading history...</td></tr>
                        ) : history.length > 0 ? (
                            history.map((item, index) => (
                                <tr key={index}>
                                    <td>{(page - 1) * limit + index + 1}</td>
                                    <td style={{ fontWeight: 'bold', color: getValueColor(item.deviceName) }}>{item.deviceName}</td>
                                    <td style={{ fontWeight: 'bold' }}>{item.actionName}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(item.actionStatus)}`}>
                                            {item.actionStatus}
                                        </span>
                                    </td>
                                    <td>{formatDate(item.time)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Không tìm thấy lịch sử nào!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!isLoading && history.length > 0 && (
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

export default ActionHistory;