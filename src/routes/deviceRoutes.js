// src/routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Tuyến 1: Lấy danh sách
router.get('/', deviceController.getAllDevices);

// Tuyến 2: Điều khiển thiết bị
router.post('/control', deviceController.controlDevice);

// CHÚ Ý: Phải đặt /history lên TRƯỚC /:id để không bị nhận nhầm
router.get('/history', deviceController.getActionHistory);

// API thống kê hành động thành công theo ngày
router.get('/stats', deviceController.getActionStats);

// Thêm API kiểm tra trạng thái
router.get('/action-status/:id', deviceController.getActionStatus);

// Thêm API để cập nhật trạng thái thành FAILED khi Timeout
router.put('/action-status/:id', deviceController.markActionFailed);

module.exports = router;