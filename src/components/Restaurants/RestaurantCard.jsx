import React from 'react';
import { Star, Clock, MapPin } from 'lucide-react';
import './RestaurantCard.css';
const RestaurantCard = ({ 
  id,
  name, 
  cuisine, 
  rating = 4, 
  deliveryTime = 30, 
  distance = 2.5, 
  imageUrl = '/placeholder-food.jpg', 
  priceRange = '₽₽',
  onAddToCart
}) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        size={16} 
        fill={index < Math.floor(rating) ? '#FFD700' : '#E0E0E0'} 
        color={index < Math.floor(rating) ? '#FFD700' : '#E0E0E0'}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl w-full">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-food.jpg';
          }}
        />
        <div className="absolute top-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded-md">
          <span className="text-sm font-semibold">{priceRange}</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">{name}</h2>
          <div className="flex">{renderStars(rating)}</div>
        </div>
        
        <p className="text-gray-600 mb-2">{cuisine}</p>
        
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock size={16} className="mr-2" />
            <span>{deliveryTime} мин</span>
          </div>
          <div className="flex items-center">
            <MapPin size={16} className="mr-2" />
            <span>{distance} км</span>
          </div>
        </div>

        <button 
          onClick={onAddToCart}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Добавить в корзину
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;