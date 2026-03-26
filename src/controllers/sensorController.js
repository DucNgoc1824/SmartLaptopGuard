const db = require('../config/db');

// 1. API Lấy dữ liệu cảm biến (Frontend sẽ gọi để vẽ biểu đồ)
const getSensorData = async (req, res) => {
    try {
        // 1. Nhận các tham số từ Frontend gửi lên (nếu không có thì dùng mặc định)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { sensorType, startDate, endDate, sort } = req.query;

        // 2. Xây dựng câu lệnh SQL động
        let baseQuery = `
            FROM DataSensor 
            JOIN Sensors ON DataSensor.idSensor = Sensors.ID 
            WHERE 1=1
        `;
        let queryParams = [];

        // Lọc theo loại cảm biến
        if (sensorType) {
            baseQuery += ` AND Sensors.sensorName LIKE ?`;
            queryParams.push(`%${sensorType}%`);
        }

        // Lọc theo thời gian (Từ ngày giờ... Đến ngày giờ...)
        if (startDate) {
            baseQuery += ` AND DataSensor.time >= ?`;
            queryParams.push(startDate);
        }
        if (endDate) {
            baseQuery += ` AND DataSensor.time <= ?`;
            queryParams.push(endDate);
        }

        // 3. Đếm tổng số dòng (để Frontend tính ra tổng số Trang)
        const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
        const [[countResult]] = await db.query(countQuery, queryParams);
        const totalRecords = countResult.total;
        const totalPages = Math.ceil(totalRecords / limit);

        // 4. Lấy dữ liệu thực tế cho Trang hiện tại
        let orderClause = (sort === 'oldest') ? 'ASC' : 'DESC';
        let dataQuery = `
            SELECT DataSensor.ID, Sensors.sensorName, DataSensor.value, DataSensor.time 
            ${baseQuery} 
            ORDER BY DataSensor.time ${orderClause} 
            LIMIT ? OFFSET ?
        `;

        // Thêm limit và offset vào cuối mảng tham số
        const finalParams = [...queryParams, limit, offset];
        const [rows] = await db.query(dataQuery, finalParams);

        res.status(200).json({
            success: true,
            message: "Lấy dữ liệu thành công!",
            data: rows,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalRecords: totalRecords,
                limit: limit
            }
        });
    } catch (error) {
        console.error("Lỗi lấy dữ liệu cảm biến:", error);
        res.status(500).json({ success: false, message: "Lỗi Server!" });
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