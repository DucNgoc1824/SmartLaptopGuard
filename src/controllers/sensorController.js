const db = require('../config/db');

// 1. API Lấy dữ liệu cảm biến (Frontend sẽ gọi để vẽ biểu đồ)
const getSensorData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { sensorType, exactValue, exactTime, sort } = req.query;

        let baseQuery = `
            FROM DataSensor 
            JOIN Sensors ON DataSensor.idSensor = Sensors.ID 
            WHERE 1=1
        `;
        let queryParams = [];

        // 1. Lọc theo Loại cảm biến
        if (sensorType) {
            baseQuery += ` AND Sensors.sensorName LIKE ?`;
            queryParams.push(`%${sensorType}%`);
        }

        // 2. Lọc theo Giá trị (khớp theo 1 chữ số thập phân để đồng bộ UI hiển thị)
        const hasExactValue = exactValue !== undefined
            && exactValue !== null
            && String(exactValue).trim() !== '';
        if (hasExactValue) {
            const normalizedValue = String(exactValue).trim().replace(',', '.');
            const parsedValue = Number(normalizedValue);

            if (!Number.isFinite(parsedValue)) {
                return res.status(400).json({
                    success: false,
                    message: 'exactValue must be a valid number'
                });
            }

            baseQuery += ` AND ROUND(DataSensor.value, 1) = ROUND(?, 1)`;
            queryParams.push(parsedValue);
        }

        // 3. Lọc chính xác theo Thời gian (yyyy/mm/dd hh:mm:ss)
        if (exactTime) {
            // Chuyển dấu "/" thành "-" để khớp định dạng datetime của MySQL
            const dbTime = exactTime.replace(/\//g, '-');
            baseQuery += ` AND DataSensor.time LIKE ?`;
            queryParams.push(`${dbTime}%`);
        }

        // Đếm tổng số dòng để phân trang
        const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
        const [[countResult]] = await db.query(countQuery, queryParams);
        const totalRecords = countResult.total;
        const totalPages = Math.ceil(totalRecords / limit) || 1;

        // 4. Bốn chế độ sắp xếp
        let orderClause = 'ORDER BY DataSensor.time DESC'; // Mặc định: Mới nhất
        if (sort === 'time-asc') orderClause = 'ORDER BY DataSensor.time ASC';
        if (sort === 'value-desc') orderClause = 'ORDER BY DataSensor.value DESC';
        if (sort === 'value-asc') orderClause = 'ORDER BY DataSensor.value ASC';

        let dataQuery = `
            SELECT DataSensor.ID, Sensors.sensorName, DataSensor.value, DataSensor.time 
            ${baseQuery} 
            ${orderClause} 
            LIMIT ? OFFSET ?
        `;

        const finalParams = [...queryParams, limit, offset];
        const [rows] = await db.query(dataQuery, finalParams);

        res.status(200).json({
            success: true,
            data: rows,
            pagination: { currentPage: page, totalPages: totalPages, totalRecords: totalRecords }
        });
    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        res.status(500).json({ success: false });
    }
};

// 2. API Lưu dữ liệu cảm biến mới (ESP32 sẽ gọi để báo cáo nhiệt độ/độ ẩm)
const saveSensorData = async (req, res) => {
    const { idSensor, value } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO DataSensor (idSensor, value) VALUES (?, ?)',
            [idSensor, value]
        );

        res.status(200).json({
            success: true,
            message: "Đã lưu dữ liệu cảm biến!",
            data: { id: result.insertId, idSensor, value }
        });
    } catch (error) {
        console.error("Lỗi khi lưu cảm biến:", error);
        res.status(500).json({ success: false, message: "Lỗi Server!" });
    }
};

module.exports = {
    getSensorData,
    saveSensorData
};