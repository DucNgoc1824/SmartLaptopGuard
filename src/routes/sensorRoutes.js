const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// Gọi GET /api/sensors -> Lấy dữ liệu vẽ biểu đồ
router.get('/', sensorController.getSensorData);

// Gọi POST /api/sensors -> Ghi dữ liệu mới vào DB
router.post('/', sensorController.saveSensorData);

module.exports = router;