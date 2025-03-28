import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
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

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
  console.log('Registration request:', req.body);
  
  try {
    const { name, email, password, phone } = req.body;
    
    // Валидация
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email and password are required' 
      });
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Проверка существования пользователя
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создание пользователя
    const [result] = await pool.query(
      `INSERT INTO users 
       (name, email, password, phone, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [name, email, hashedPassword, phone || null]
    );

    // Генерация токена
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    // Успешный ответ
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
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

console.log('Registration attempt:', {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  });

// Остальные эндпоинты (restaurants, menu, orders) остаются без изменений
// ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});