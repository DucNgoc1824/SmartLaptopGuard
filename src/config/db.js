const mysql = require('mysql2/promise'); 
require('dotenv').config();

// Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_laptop_guard',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.query('SELECT 1')
    .then(() => console.log('✅ Kết nối MySQL Database thành công!'))
    .catch((err) => console.error('❌ Lỗi kết nối Database:', err));

module.exports = pool;