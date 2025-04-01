import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'food_delivery',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

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

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const [users] = await pool.query('SELECT id, name, email, phone FROM users WHERE id = ?', [decoded.userId]);
    
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

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
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user data' });
  }
});

// Новый маршрут для списка ресторанов
app.get('/api/restaurants', async (req, res) => {
  try {
    const [restaurants] = await pool.query('SELECT * FROM restaurants');
    res.json({ success: true, restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurants' });
  }
});

// Новый маршрут для списка категорий
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories');
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Новый маршрут для получения активного заказа
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
