const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Tuyến 1: Lấy danh sách
router.get('/', deviceController.getAllDevices);

// Tuyến 2: Điều khiển thiết bị
router.post('/control', deviceController.controlDevice); 

module.exports = router;