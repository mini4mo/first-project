import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const app = express();
app.use(express.json());

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Настройка подключения к БД
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'food_delivery',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

// Проверка подключения к БД
pool.getConnection()
  .then(conn => {
    console.log('Successfully connected to database');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

console.log('Database config:', {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'food_delivery'
});

// Middleware для проверки JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const [users] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(403).json({ success: false, message: 'User not found' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Эндпоинт для регистрации
app.post('/api/auth/register', async (req, res) => {
  console.log('Registration request:', req.body);
  
  try {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email and password are required' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, phone, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [name, email, hashedPassword, phone || null]
    );

    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        phone: phone || null
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
