// db.js
import mysql from 'mysql2/promise';

// Параметры подключения (должны совпадать с настройками в MySQL Workbench)
const pool = mysql.createPool({
  host: 'localhost', // или '127.0.0.1'
  port: 3306, // стандартный порт MySQL
  user: 'root', // имя пользователя (как в Workbench)
  password: 'root', // пароль, который вы используете в Woarkbench
  database: 'food_delivery',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;