import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantCard from './RestaurantCard';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';
import CartSidebar from './CartSidebar';
import OrderStatus from './OrderStatus';

const Dashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('userToken');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // Получаем данные пользователя
        const userResponse = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userResponse.data);

        // Получаем список ресторанов
        const restaurantsResponse = await axios.get('/api/restaurants');
        setRestaurants(restaurantsResponse.data);
        setFilteredRestaurants(restaurantsResponse.data);

        // Получаем категории
        const categoriesResponse = await axios.get('/api/categories');
        setCategories(['Все', ...categoriesResponse.data]);

        // Проверяем активный заказ
        const orderResponse = await axios.get('/api/orders/active', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (orderResponse.data) {
          setActiveOrder(orderResponse.data);
        }

        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setError(err.response?.data?.message || 'Ошибка загрузки данных');
        if (err.response?.status === 401) {
          localStorage.removeItem('userToken');
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    let result = restaurants;
    
    // Фильтрация по категории
    if (selectedCategory !== 'Все') {
      result = result.filter(restaurant => 
        restaurant.categories.includes(selectedCategory)
      );
    }
    
    // Фильтрация по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query) || 
        restaurant.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredRestaurants(result);
  }, [selectedCategory, searchQuery, restaurants]);

  const handleAddToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post('/api/orders', {
        items: cartItems,
        deliveryAddress: userData.address || ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActiveOrder(response.data);
      setCartItems([]);
      setIsCartOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при оформлении заказа');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md max-w-md mx-auto mt-8">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">Быстрая Доставка</h1>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-indigo-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
            
            <div className="relative group">
              <button className="flex items-center space-x-2 focus:outline-none">
                <span className="text-sm font-medium">{userData?.name || userData?.email}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Профиль</a>
                <a href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Мои заказы</a>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Выйти</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {activeOrder && (
          <OrderStatus 
            order={activeOrder} 
            onClose={() => setActiveOrder(null)} 
          />
        )}

        <div className="mb-6">
          <SearchBar 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        <div className="mb-6">
          <CategoryFilter 
            categories={categories} 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map(restaurant => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant} 
                onAddToCart={handleAddToCart} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">Рестораны не найдены. Попробуйте изменить параметры поиска.</p>
            </div>
          )}
        </div>
      </main>

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onRemoveItem={handleRemoveFromCart} 
        onUpdateQuantity={handleUpdateQuantity} 
        onCheckout={handleCheckout} 
      />
    </div>
  );
};

export default Dashboard;