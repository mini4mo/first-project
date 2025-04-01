import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RestaurantList.css';

const RestaurantList = () => {
  // State management
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering and sorting states
  const [filters, setFilters] = useState({
    cuisine: '',
    minRating: 0,
    priceRange: '',
    searchQuery: ''
  });

  // Sorting options
  const [sortBy, setSortBy] = useState('rating');

  // Navigation hook
  const navigate = useNavigate();

  // Fetch restaurants on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/restaurants', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        setRestaurants(response.data);
        setFilteredRestaurants(response.data);
      } catch (err) {
        setError('Не удалось загрузить рестораны');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...restaurants];

    // Search filter
    if (filters.searchQuery) {
      result = result.filter(restaurant => 
        restaurant.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Cuisine filter
    if (filters.cuisine) {
      result = result.filter(restaurant => 
        restaurant.cuisine === filters.cuisine
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter(restaurant => 
        restaurant.rating >= filters.minRating
      );
    }

    // Price range filter
    if (filters.priceRange) {
      result = result.filter(restaurant => 
        restaurant.priceRange === filters.priceRange
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'deliveryTime':
          return a.avgDeliveryTime - b.avgDeliveryTime;
        case 'distance':
          return a.distance - b.distance;
        default:
          return 0;
      }
    });

    setFilteredRestaurants(result);
  }, [restaurants, filters, sortBy]);

  // Handle restaurant selection
  const handleRestaurantSelect = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  // Render restaurant card
  const renderRestaurantCard = (restaurant) => (
    <div 
      key={restaurant.id} 
      className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => handleRestaurantSelect(restaurant.id)}
    >
      <img 
        src={restaurant.imageUrl} 
        alt={restaurant.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{restaurant.name}</h3>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-yellow-500">★</span>
            <span className="ml-1">{restaurant.rating.toFixed(1)}</span>
            <span className="mx-2 text-gray-300">•</span>
            <span>{restaurant.cuisine}</span>
          </div>
          <div className="text-gray-500">
            {restaurant.avgDeliveryTime} мин
          </div>
        </div>
      </div>
    </div>
  );

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        {error}
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Рестораны поблизости</h1>

      {/* Filters and Sorting */}
      <div className="mb-6 grid md:grid-cols-4 gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Поиск ресторанов"
          value={filters.searchQuery}
          onChange={(e) => setFilters(prev => ({
            ...prev, 
            searchQuery: e.target.value
          }))}
          className="border border-gray-300 rounded-md py-2 px-3"
        />

        {/* Cuisine Filter */}
        <select
          value={filters.cuisine}
          onChange={(e) => setFilters(prev => ({
            ...prev, 
            cuisine: e.target.value
          }))}
          className="border border-gray-300 rounded-md py-2 px-3"
        >
          <option value="">Все кухни</option>
          <option value="Итальянская">Итальянская</option>
          <option value="Азиатская">Азиатская</option>
          <option value="Фаст-фуд">Фаст-фуд</option>
        </select>

        {/* Rating Filter */}
        <select
          value={filters.minRating}
          onChange={(e) => setFilters(prev => ({
            ...prev, 
            minRating: Number(e.target.value)
          }))}
          className="border border-gray-300 rounded-md py-2 px-3"
        >
          <option value={0}>Все рейтинги</option>
          <option value={4}>От 4 звезд</option>
          <option value={4.5}>От 4.5 звезд</option>
        </select>

        {/* Sorting */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-3"
        >
          <option value="rating">По рейтингу</option>
          <option value="deliveryTime">По времени доставки</option>
        </select>
      </div>

      {/* Restaurants Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          Нет ресторанов, соответствующих выбранным фильтрам
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredRestaurants.map(renderRestaurantCard)}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;