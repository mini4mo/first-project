// В файле main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <<<--- Импортируем BrowserRouter
import App from './app.jsx';
import { CartProvider } from './components/contexts/CartContext.jsx';
import { AuthProvider } from './components/auth/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <<<--- Оборачиваем всё в BrowserRouter */}
      <AuthProvider>
        <CartProvider> {/* <<<--- Оставляем CartProvider здесь */}
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);