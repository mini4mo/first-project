import React from 'react';
import { useCart } from '../contexts/CartContext';

const MenuItem = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <img 
        src={item.imageUrl} 
        alt={item.name} 
        className="w-full h-40 object-cover mb-3 rounded"
      />
      <h3 className="text-xl font-semibold">{item.name}</h3>
      <p className="text-gray-600 my-2">{item.description}</p>
      <div className="flex justify-between items-center mt-3">
        <span className="text-lg font-bold">{item.price} ₽</span>
        <button 
          onClick={() => addToCart(item)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Добавить
        </button>
      </div>
    </div>
  );
};

export default MenuItem;