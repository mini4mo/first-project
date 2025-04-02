import React from 'react';

const RestaurantCard = ({ 
  id, 
  name, 
  cuisine, 
  rating, 
  deliveryTime, 
  imageUrl, 
  onClick, 
  buttonText = "Перейти в меню" 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={imageUrl} 
        alt={name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <p className="text-gray-600 mb-2">{cuisine}</p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-yellow-500">★ {rating}</span>
          <span className="text-gray-500">{deliveryTime} мин</span>
        </div>
        <button
          onClick={() => onClick(id)}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;