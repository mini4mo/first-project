import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantCard from '../Restaurants/RestaurantCard.jsx';
import CategoryFilter from '../common/CategoryFilter.jsx';
import SearchBar from '../common/SearchBar.jsx';
import CartSidebar from '../common/CartSidebar.jsx';
import OrderStatus from '../common/OrderStatus.jsx';
import './Dashboard.css';

// Устанавливаем базовый URL для axios
axios.defaults.baseURL = 'http://localhost:5000';

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

        const userResponse = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserData(userResponse.data);

        const restaurantsResponse = await axios.get('/api/restaurants');
        setRestaurants(restaurantsResponse.data.restaurants);
        setFilteredRestaurants(restaurantsResponse.data.restaurants);

        const categoriesResponse = await axios.get('/api/categories');
        setCategories(['Все', ...categoriesResponse.data.categories]);

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
    
    if (selectedCategory !== 'Все') {
      result = result.filter(restaurant => 
        restaurant.cuisine === selectedCategory
      );
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query) || 
        restaurant.cuisine.toLowerCase().includes(query)
      );
    }
    
    setFilteredRestaurants(result);
  }, [selectedCategory, searchQuery, restaurants]);

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurants/${restaurantId}`);
  };

  return (
    <div className="dashboard min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="bg-white shadow-md w-full py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">Быстрая Доставка</h1>
        <div className="relative flex items-center">
          <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <span className="absolute right-2 top-2 text-gray-500 text-lg">🔍</span>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-gray-600 hover:text-indigo-600"
        >
          🛒 {cartItems.length > 0 ? cartItems.length : ''}
        </button>
      </header>

      {activeOrder && (
        <div className="w-full max-w-7xl mt-4">
          <OrderStatus order={activeOrder} />
        </div>
      )}

      <div className="flex w-full max-w-7xl mt-6 gap-4">
        <aside className="w-1/4 p-4 bg-white shadow rounded-lg">
          <CategoryFilter 
            categories={categories} 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
        </aside>

        <main className="w-3/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard 
              key={restaurant.id} 
              {...restaurant}
              onClick={() => handleRestaurantClick(restaurant.id)}
              buttonText="Перейти в меню"
            />
          ))}
        </main>
      </div>

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onCheckout={() => navigate('/checkout')}
      />
    </div>
  );
};

export default Dashboard;