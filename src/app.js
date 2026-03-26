const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

require('./config/db');
require('./services/mqttService');

app.get('/', (req, res) => {
    res.send('Chào mừng đến với Backend của Smart Laptop Guard!');
});

const deviceRoutes = require('./routes/deviceRoutes');
app.use('/api/devices', deviceRoutes); 

const sensorRoutes = require('./routes/sensorRoutes');
app.use('/api/sensors', sensorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy ngon lành tại: http://localhost:${PORT}`);
});