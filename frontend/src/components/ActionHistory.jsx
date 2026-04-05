// src/components/ActionHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ActionHistory.css';

const ActionHistory = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Đổi lại defaultFilters có thêm sort
    const defaultFilters = { device: '', exactTime: '', sort: 'time-desc' };
    const [filters, setFilters] = useState(defaultFilters);

    const fetchHistory = async (overrideFilters = null) => {
        setIsLoading(true);
        const currentFilters = overrideFilters || filters;
        try {
            const response = await axios.get('http://localhost:3000/api/devices/history', {
                params: {
                    page: page,
                    limit: 10,
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

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = () => {
        if (page === 1) fetchHistory();
        else setPage(1);
    };

    const handleReset = () => {
        setFilters(defaultFilters);
        if (page === 1) fetchHistory(defaultFilters);
        else setPage(1);
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

    return (
        <div className="table-page">
            <h2><i className="fa-solid fa-clock-rotate-left"></i> Action History</h2>

            <div className="filter-container">
                <div className="filter-row">
                    <div className="filter-item">
                        <label>Device</label>
                        <select name="device" value={filters.device} onChange={handleFilterChange} className="input-field">
                            <option value="">All Devices</option>
                            <option value="Fan">Cooling Fan</option>
                            <option value="Light">RGB Light</option>
                            <option value="Dehumidifier">Dehumidifier</option>
                            <option value="Posture">Posture Alert</option>
                        </select>
                    </div>
                    {/* ĐÃ XÓA 2 DROP DOWN ACTION VÀ STATUS Ở ĐÂY */}
                    <div className="filter-item">
                        <label>Exact Time</label>
                        <input type="text" name="exactTime" placeholder="yyyy/mm/dd hh:mm:ss" value={filters.exactTime} onChange={handleFilterChange} className="input-field" />
                    </div>
                    <div className="filter-item">
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
                                    <td>{(page - 1) * 10 + index + 1}</td>
                                    <td>{item.deviceName}</td>
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
                        Showing {(page - 1) * 10 + 1} - {Math.min(page * 10, totalRecords)} of <b>{totalRecords}</b> records
                    </div>
                    {renderPagination()}
                </div>
            )}
        </div>
    );
};

export default ActionHistory;