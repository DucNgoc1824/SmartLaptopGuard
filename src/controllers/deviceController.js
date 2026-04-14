// src/controllers/deviceController.js
const db = require('../config/db');
const mqttService = require('../services/mqttService');

const getAllDevices = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Devices');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server!" });
    }
};

const controlDevice = async (req, res) => {
    const { deviceId, actionName } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Actions (deviceID, actionName, actionStatus) VALUES (?, ?, ?)',
            [deviceId, actionName, 'LOADING']
        );
        const actionId = result.insertId;
        mqttService.publishControlCommand(deviceId, actionName);

        res.status(200).json({ success: true, data: { actionId } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server!" });
    }
};

const getActionStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT actionStatus FROM Actions WHERE ID = ?', [req.params.id]);
        if (rows.length > 0) {
            res.status(200).json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

// Thay thế hàm getActionHistory cũ bằng hàm này:
const getActionHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Bổ sung thêm biến sort
        const { device, action, status, exactTime, sort } = req.query;

        let baseQuery = `
            FROM Actions 
            JOIN Devices ON Actions.deviceID = Devices.ID 
            WHERE Actions.actionStatus != 'LOADING'
        `;
        let queryParams = [];

        if (device) {
            baseQuery += ` AND Devices.deviceName LIKE ?`;
            queryParams.push(`%${device}%`);
        }
        if (action) {
            baseQuery += ` AND Actions.actionName = ?`;
            queryParams.push(action);
        }
        if (status) {
            baseQuery += ` AND Actions.actionStatus = ?`;
            queryParams.push(status);
        }
        if (exactTime) {
            const dbTime = exactTime.replace(/\//g, '-');
            baseQuery += ` AND Actions.time LIKE ?`;
            queryParams.push(`${dbTime}%`);
        }

        const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
        const [[countResult]] = await db.query(countQuery, queryParams);
        const totalRecords = countResult.total;
        const totalPages = Math.ceil(totalRecords / limit) || 1;

        // Xử lý logic sắp xếp (Mặc định là mới nhất)
        let orderClause = 'ORDER BY Actions.time DESC';
        if (sort === 'time-asc') {
            orderClause = 'ORDER BY Actions.time ASC';
        }

        let dataQuery = `
            SELECT Actions.ID, Devices.deviceName, Actions.actionName, Actions.actionStatus, Actions.time 
            ${baseQuery} 
            ${orderClause} 
            LIMIT ? OFFSET ?
        `;

        const finalParams = [...queryParams, limit, offset];
        const [rows] = await db.query(dataQuery, finalParams);

        res.status(200).json({
            success: true,
            data: rows,
            pagination: { currentPage: page, totalPages, totalRecords }
        });
    } catch (error) {
        console.error("Lỗi lấy Action History:", error);
        res.status(500).json({ success: false });
    }
};

const getActionStats = async (req, res) => {
    try {
        const query = `
            SELECT
                DATE(a.time) as actionDate,
                d.deviceName,
                COUNT(a.ID) as count
            FROM Actions a
            JOIN Devices d ON a.deviceID = d.ID
            WHERE a.actionStatus = 'SUCCESS'
            GROUP BY DATE(a.time), d.deviceName
            ORDER BY actionDate ASC;
        `;

        const [rows] = await db.query(query);
        const statsByDate = {};
        const defaultBreakdown = {
            'Cooling Fan': 0,
            'RGB Light': 0,
            'Dehumidifier': 0,
            'Posture Alert': 0,
            'NewDevice': 0,
        };

        const normalizeDateKey = (value) => {
            const raw = String(value || '').slice(0, 10);
            if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

            const parsed = new Date(value);
            if (Number.isNaN(parsed.getTime())) return null;
            return parsed.toISOString().slice(0, 10);
        };

        rows.forEach((row) => {
            const dateKey = normalizeDateKey(row.actionDate);
            if (!dateKey) return;

            if (!statsByDate[dateKey]) {
                statsByDate[dateKey] = {
                    date: dateKey,
                    total: 0,
                    breakdown: { ...defaultBreakdown },
                };
            }

            if (statsByDate[dateKey].breakdown[row.deviceName] === undefined) {
                statsByDate[dateKey].breakdown[row.deviceName] = 0;
            }

            const count = Number(row.count) || 0;
            statsByDate[dateKey].breakdown[row.deviceName] = count;
            statsByDate[dateKey].total += count;
        });

        const sortedDateKeys = Object.keys(statsByDate).sort();

        if (sortedDateKeys.length > 0) {
            let cursor = new Date(`${sortedDateKeys[0]}T00:00:00.000Z`);
            const end = new Date(`${sortedDateKeys[sortedDateKeys.length - 1]}T00:00:00.000Z`);

            while (cursor <= end) {
                const dateKey = cursor.toISOString().slice(0, 10);

                if (!statsByDate[dateKey]) {
                    statsByDate[dateKey] = {
                        date: dateKey,
                        total: 0,
                        breakdown: { ...defaultBreakdown },
                    };
                }

                cursor.setUTCDate(cursor.getUTCDate() + 1);
            }
        }

        const normalizedData = Object.values(statsByDate).sort((a, b) => a.date.localeCompare(b.date));
        res.status(200).json({ success: true, data: normalizedData });
    } catch (error) {
        console.error('Loi lay thong ke Action:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const markActionFailed = async (req, res) => {
    try {
        await db.query('UPDATE Actions SET actionStatus = "FAILED" WHERE ID = ?', [req.params.id]);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

module.exports = {
    getAllDevices,
    controlDevice,
    getActionStatus,
    getActionHistory,
    getActionStats,
    markActionFailed,
};