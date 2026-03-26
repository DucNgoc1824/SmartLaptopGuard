const db = require('../config/db');
const mqttService = require('../services/mqttService');

const getAllDevices = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Devices');
        res.status(200).json({ success: true, message: "Thành công!", data: rows });
    } catch (error) {
        console.error(error);
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

        // 💥 ĐÂY LÀ ĐIỂM ĂN TIỀN: Bắn lệnh sang ESP32 qua MQTT
        mqttService.publishControlCommand(deviceId, actionName);

        // Cập nhật trạng thái thành công
        await db.query('UPDATE Actions SET actionStatus = ? WHERE ID = ?', ['SUCCESS', actionId]);

        res.status(200).json({
            success: true,
            message: "Đã gửi lệnh điều khiển xuống ESP32!",
            data: { actionId, deviceId, actionName, status: 'SUCCESS' }
        });

    } catch (error) {
        console.error("Lỗi khi điều khiển:", error);
        res.status(500).json({ success: false, message: "Lỗi Server!" });
    }
};

module.exports = { getAllDevices, controlDevice };