// В файле app.jsx
import React from 'react';
// Убираем BrowserRouter отсюда, т.к. он теперь в main.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
// Убираем useState, useEffect и CartProvider, если они не используются для других целей внутри App
// import { useState, useEffect } from 'react'; // --- Убираем, если не используется для другого
// import { CartProvider } from './components/contexts/CartContext.jsx'; // --- Убираем

// Импорты компонентов остаются
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import Dashboard from './components/menu/Dashboard.jsx';
import RestaurantPage from './components/Restaurants/RestaurantPage.jsx';
import Cart from './components/Order/Cart.jsx';
import Checkout from './components/Order/Checkout.jsx';
import OrderTracking from './components/Order/OrderTracking.jsx';
import { useAuth } from './components/auth/AuthContext.jsx'; // <<<--- Импортируем useAuth для проверки

function App() {
  // Получаем состояние аутентификации и загрузки из AuthContext
  const { isAuthenticated, loading } = useAuth(); // <<<--- Используем useAuth

  // Состояние загрузки теперь берется из AuthContext
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Убираем обертку Router и CartProvider отсюда
  return (
    <Routes>
      {/* Используем isAuthenticated из AuthContext */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login /> // Убираем setIsAuthenticated
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register /> // Убираем setIsAuthenticated
      } />
      <Route path="/dashboard" element={
        isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace /> // Убираем setIsAuthenticated
      } />
      <Route path="/restaurants/:id" element={
        isAuthenticated ? <RestaurantPage /> : <Navigate to="/login" replace /> // Убираем setIsAuthenticated
      } />
      <Route path="/cart" element={
        isAuthenticated ? <Cart /> : <Navigate to="/login" replace />
      } />
      <Route path="/checkout" element={
        isAuthenticated ? <Checkout /> : <Navigate to="/login" replace /> // Убираем setIsAuthenticated
      } />
      <Route path="/order/:orderId" element={
        isAuthenticated ? <OrderTracking /> : <Navigate to="/login" replace />
      } />
      <Route path="/" element={
        <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;