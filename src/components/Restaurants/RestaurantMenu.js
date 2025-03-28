import React, { useState, useContext } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';

const MenuItem = ({ item, onAddToCart, onRemoveFromCart, cartQuantity }) => {
  return (
    <div className="flex items-center justify-between border-b p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <img 
          src={item.imageUrl || '/api/placeholder/100/100'} 
          alt={item.name} 
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div>
          <h3 className="font-bold text-lg">{item.name}</h3>
          <p className="text-gray-600">{item.description}</p>
          <span className="font-semibold text-green-600">{item.price} ₽</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {cartQuantity > 0 ? (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onRemoveFromCart(item)}
              className="bg-red-50 text-red-500 p-1 rounded-full"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold">{cartQuantity}</span>
            <button 
              onClick={() => onAddToCart(item)}
              className="bg-green-50 text-green-500 p-1 rounded-full"
            >
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onAddToCart(item)}
            className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ShoppingCart size={16} className="mr-2" />
            В корзину
          </button>
        )}
      </div>
    </div>
  );
};

const RestaurantMenu = ({ restaurant }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { cart, addToCart, removeFromCart } = useContext(CartContext);

  // Группировка блюд по категориям
  const categorizedMenu = restaurant.menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Фильтрация блюд по поиску
  const filteredMenu = Object.entries(categorizedMenu).reduce((acc, [category, items]) => {
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-blue-500 text-white p-6">
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-blue-100">{restaurant.cuisine} • {restaurant.address}</p>
      </div>

      <div className="p-4">
        <input 
          type="text" 
          placeholder="Поиск блюд..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
        />

        {Object.entries(filteredMenu).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{category}</h2>
            {items.map(item => (
              <MenuItem 
                key={item.id}
                item={item}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                cartQuantity={cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Пример структуры данных ресторана
RestaurantMenu.defaultProps = {
  restaurant: {
    id: 1,
    name: 'Вкусная Кухня',
    cuisine: 'Европейская',
    address: 'ул. Центральная, 10',
    menu: [
      {
        id: 1,
        name: 'Цезарь с курицей',
        description: 'Классический салат с куриным филе',
        price: 350,
        category: 'Салаты',
        imageUrl: '/api/placeholder/100/100'
      },
      {
        id: 2,
        name: 'Пицца Маргарита',
        description: 'Традиционная итальянская пицца',
        price: 450,
        category: 'Пицца',
        imageUrl: '/api/placeholder/100/100'
      }
    ]
  }
};

export default RestaurantMenu;