import React from 'react';
import { Star, Clock, MapPin } from 'lucide-react';

const RestaurantCard = ({ 
  name, 
  cuisine, 
  rating, 
  deliveryTime, 
  distance, 
  imageUrl, 
  priceRange 
}) => {
  // Функция для генерации звездного рейтинга
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        size={16} 
        fill={index < rating ? '#FFD700' : '#E0E0E0'} 
        color={index < rating ? '#FFD700' : '#E0E0E0'}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl w-72">
      <div className="relative">
        <img 
          src={imageUrl || '/api/placeholder/350/200'} 
          alt={name} 
          className="w-full h-48 object-cover"
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
        
        <div className="flex justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Clock size={16} className="mr-2" />
            <span>{deliveryTime} мин</span>
          </div>
          <div className="flex items-center">
            <MapPin size={16} className="mr-2" />
            <span>{distance} км</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Значения по умолчанию для пропсов
RestaurantCard.defaultProps = {
  name: 'Название ресторана',
  cuisine: 'Тип кухни',
  rating: 4,
  deliveryTime: 30,
  distance: 2.5,
  imageUrl: '/api/placeholder/350/200',
  priceRange: '₽₽'
};

export default RestaurantCard;