import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import Dashboard from './components/menu/Dashboard.jsx';
import RestaurantPage from './components/Restaurants/RestaurantPage.jsx';
import Cart from './components/Order/Сart.jsx';
import Checkout from './components/Order/Checkout.jsx';
import OrderTracking from './components/Order/OrderTracking.jsx';
import { CartProvider } from './components/contexts/CartContext.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register setIsAuthenticated={setIsAuthenticated} />
          } />
          <Route path="/dashboard" element={
            isAuthenticated ? <Dashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" replace />
          } />
          <Route path="/restaurants/:id" element={
            isAuthenticated ? <RestaurantPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" replace />
          } />
          <Route path="/cart" element={
            isAuthenticated ? <Cart /> : <Navigate to="/login" replace />
          } />
          <Route path="/checkout" element={
            isAuthenticated ? <Checkout setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" replace />
          } />
          <Route path="/order/:orderId" element={
            isAuthenticated ? <OrderTracking /> : <Navigate to="/login" replace />
          } />
          <Route path="/" element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;