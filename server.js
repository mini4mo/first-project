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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS настройки
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

// Эндпоинт для входа (логин)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Эндпоинт для регистрации
app.post('/api/auth/register', async (req, res) => {
  console.log('Registration request:', req.body);
  
  try {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email and password are required' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

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

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      `INSERT INTO users 
       (name, email, password, phone, created_at) 
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
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Эндпоинт для получения данных пользователя
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
});

// Эндпоинт для получения списка ресторанов
app.get('/api/restaurants', authenticateToken, async (req, res) => {
  try {
    // Получаем список ресторанов с их категориями
    const [restaurants] = await pool.query(`
      SELECT r.*, 
        (SELECT AVG(rating) FROM reviews WHERE restaurant_id = r.id) as rating
      FROM restaurants r
    `);

    // Для каждого ресторана получаем его категории
    for (const restaurant of restaurants) {
      const [categories] = await pool.query(`
        SELECT c.name 
        FROM categories c
        JOIN restaurant_categories rc ON c.id = rc.category_id
        WHERE rc.restaurant_id = ?
      `, [restaurant.id]);
      
      restaurant.categories = categories.map(c => c.name);
      
      // Добавляем mock-меню (в реальном приложении нужно получать из БД)
      restaurant.menu = [
        { id: 1, name: 'Пицца Маргарита', description: 'Классическая пицца с томатами и моцареллой', price: 450 },
        { id: 2, name: 'Паста Карбонара', description: 'Паста с беконом, яйцом и пармезаном', price: 380 },
        { id: 3, name: 'Салат Цезарь', description: 'Салат с курицей, сухариками и соусом Цезарь', price: 320 },
      ];
    }

    res.status(200).json({
      success: true,
      restaurants
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get restaurants'
    });
  }
});

// Эндпоинт для получения категорий
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT name FROM categories');
    res.status(200).json({
      success: true,
      categories: categories.map(c => c.name)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories'
    });
  }
});

// Эндпоинт для создания заказа
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items are required'
      });
    }

    // Рассчитываем сумму заказа
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 150; // Фиксированная стоимость доставки
    const total = subtotal + deliveryFee;

    // Создаем заказ в БД
    const [orderResult] = await pool.query(
      `INSERT INTO orders 
       (user_id, status, subtotal, delivery_fee, total, delivery_address, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, 'Готовится', subtotal, deliveryFee, total, deliveryAddress || '']
    );

    const orderId = orderResult.insertId;

    // Добавляем элементы заказа
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items 
         (order_id, item_name, item_price, quantity, restaurant_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.name, item.price, item.quantity, item.restaurantId || 1]
      );
    }

    // Возвращаем информацию о заказе
    const [order] = await pool.query(
      `SELECT * FROM orders WHERE id = ?`,
      [orderId]
    );

    const [orderItems] = await pool.query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    res.status(201).json({
      success: true,
      order: {
        ...order[0],
        items: orderItems
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// Эндпоинт для получения активного заказа пользователя
app.get('/api/orders/active', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // В реальном приложении здесь нужно искать заказы со статусом не "Доставлен"
    const [orders] = await pool.query(
      `SELECT * FROM orders 
       WHERE user_id = ? AND status != 'Доставлен' 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        order: null
      });
    }

    const order = orders[0];
    const [orderItems] = await pool.query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [order.id]
    );

    res.status(200).json({
      success: true,
      order: {
        ...order,
        items: orderItems
      }
    });

  } catch (error) {
    console.error('Get active order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active order'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});