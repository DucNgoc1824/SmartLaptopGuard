const mqtt = require('mqtt');
const db = require('../config/db');
require('dotenv').config();

const client = mqtt.connect(process.env.MQTT_BROKER);

client.on('connect', () => {
    console.log('📡 Đã kết nối thành công với MQTT Broker!');

    // Nghe cả 2 kênh: Cảm biến và Trạng thái lệnh
    client.subscribe(['smartlaptop/sensors', 'smartlaptop/status'], (err) => {
        if (!err) console.log('🎧 Đang lắng nghe MQTT topics: sensors & status');
    });
});

client.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());

        // 1. Nếu là dữ liệu Cảm biến
        if (topic === 'smartlaptop/sensors') {
            console.log(`[MQTT Sensors]`, data);
            await db.query(
                'INSERT INTO DataSensor (idSensor, value) VALUES (?, ?)',
                [data.idSensor, data.value]
            );
        }

        // 2. Nếu là phản hồi Trạng thái lệnh từ ESP32
        if (topic === 'smartlaptop/status') {
            console.log(`[MQTT Status] ESP32 phản hồi:`, data);
            // Cập nhật trạng thái SUCCESS hoặc FAILED vào Database dựa theo ID thiết bị mới nhất
            // (Trong thực tế nên truyền kèm actionId để update chính xác nhất)
            await db.query(
                `UPDATE Actions SET actionStatus = ? 
                 WHERE deviceID = ? ORDER BY time DESC LIMIT 1`,
                [data.status, data.deviceId]
            );
        }
    } catch (error) {
        console.error('[MQTT] Lỗi xử lý tin nhắn:', error);
    }
});

const publishControlCommand = (deviceId, actionName) => {
    const command = JSON.stringify({ deviceId, actionName });
    client.publish('smartlaptop/control', command);
    console.log(`[MQTT] 🚀 Đã phát lệnh: ${command}`);
};

module.exports = { publishControlCommand };