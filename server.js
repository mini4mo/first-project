import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// CORS конфигурация
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

// Middleware для аутентификации
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверяем, не отозван ли токен
    const [tokens] = await pool.query(
      'SELECT * FROM revoked_tokens WHERE token = ?',
      [token]
    );
    
    if (tokens.length > 0) {
      return res.status(403).json({ success: false, message: 'Токен отозван' });
    }

    const [users] = await pool.query(
      'SELECT id, name, email, phone FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(403).json({ success: false, message: 'Пользователь не найден' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Токен истек',
        code: 'TOKEN_EXPIRED'
      });
    }
    console.error('Ошибка проверки токена:', error);
    return res.status(403).json({ success: false, message: 'Неверный токен' });
  }
};

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Проверка обязательных полей
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Имя, email и пароль обязательны' 
      });
    }

    // Проверка существующего пользователя
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Пользователь с таким email уже существует' 
      });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создание пользователя
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, phone, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [name, email, hashedPassword, phone || null]
    );

    // Генерация токенов
    const accessToken = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Сохранение refresh токена в базе
    await pool.query(
      'INSERT INTO user_tokens (user_id, refresh_token) VALUES (?, ?)',
      [result.insertId, refreshToken]
    );

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      token: accessToken,
      refreshToken,
      user: {
        id: result.insertId,
        name,
        email,
        phone: phone || null
      }
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при регистрации' 
    });
  }
});

// Вход пользователя
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email и пароль обязательны' 
      });
    }

    // Поиск пользователя
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Неверный email или пароль' 
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Неверный email или пароль' 
      });
    }

    // Генерация токенов
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Сохранение refresh токена в базе
    await pool.query(
      'INSERT INTO user_tokens (user_id, refresh_token) VALUES (?, ?)',
      [user.id, refreshToken]
    );

    res.json({
      success: true,
      message: 'Вход выполнен успешно',
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при входе' 
    });
  }
});

// Обновление токена
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token отсутствует' 
      });
    }

    // Проверка refresh токена
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET
    );

    // Проверка в базе
    const [tokens] = await pool.query(
      `SELECT * FROM user_tokens 
       WHERE user_id = ? AND refresh_token = ?`,
      [decoded.userId, refreshToken]
    );
    
    if (tokens.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Неверный refresh token' 
      });
    }

    // Получаем данные пользователя
    const [users] = await pool.query(
      'SELECT id, email FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    const user = users[0];

    // Генерация нового access токена
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      token: newAccessToken
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token истек',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }
    console.error('Ошибка обновления токена:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Неверный refresh token' 
    });
  }
});

// Выход пользователя
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Добавляем токен в список отозванных
    await pool.query(
      'INSERT INTO revoked_tokens (token) VALUES (?)',
      [token]
    );

    res.json({ 
      success: true, 
      message: 'Выход выполнен успешно' 
    });
  } catch (error) {
    console.error('Ошибка выхода:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при выходе' 
    });
  }
});

// Получение данных пользователя
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      }
    });
  } catch (error) {
    console.error('Ошибка получения данных:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при получении данных' 
    });
  }
});

app.get('/api/restaurants', async (req, res) => {
  try {
    const [restaurants] = await pool.query('SELECT * FROM restaurants');
    res.json({ success: true, restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurants' });
  }
});

app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const [restaurants] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    if (restaurants.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, restaurant: restaurants[0] });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurant' });
  }
});

app.get('/api/restaurants/:id/menu', async (req, res) => {
  try {
    const [menuItems] = await pool.query('SELECT * FROM menu_items WHERE restaurant_id = ?', [req.params.id]);
    res.json({ success: true, menu: menuItems });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch menu' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories');
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

app.get('/api/orders/active', authenticateToken, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (orders.length === 0) {
      return res.json(null);
    }

    res.json(orders[0]);
  } catch (error) {
    console.error('Error fetching active order:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active order' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});