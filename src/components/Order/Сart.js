import React, { useContext } from 'react';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    clearCart, 
    totalPrice 
  } = useContext(CartContext);

  // Группировка похожих товаров
  const groupedCart = cart.reduce((acc, item) => {
    const existingItem = acc.find(groupedItem => groupedItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.totalItemPrice += item.price * item.quantity;
    } else {
      acc.push({
        ...item,
        totalItemPrice: item.price * item.quantity
      });
    }
    
    return acc;
  }, []);

  // Расчет стоимости доставки
  const calculateDeliveryCost = () => {
    const FREE_DELIVERY_THRESHOLD = 1000;
    const DELIVERY_COST = 150;

    return totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST;
  };

  const deliveryCost = calculateDeliveryCost();
  const totalWithDelivery = totalPrice + deliveryCost;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-white shadow-lg rounded-lg p-10">
          <ShoppingCart className="mx-auto w-24 h-24 text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Ваша корзина пуста</h2>
          <p className="text-gray-600 mb-6">
            Добавьте блюда из меню ресторана, чтобы оформить заказ
          </p>
          <Link 
            to="/restaurants" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Перейти в рестораны
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Список товаров */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Ваш заказ</h2>
            <button 
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 flex items-center"
            >
              <Trash2 className="mr-2" size={18} />
              Очистить корзину
            </button>
          </div>

          {groupedCart.map(item => (
            <div 
              key={item.id} 
              className="flex items-center justify-between border-b py-4"
            >
              <div className="flex items-center space-x-4">
                <img 
                  src={item.imageUrl || '/api/placeholder/100/100'} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-gray-500">{item.price} ₽</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => removeFromCart(item)}
                    className="bg-gray-200 p-1 rounded-full"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => addToCart(item)}
                    className="bg-gray-200 p-1 rounded-full"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="font-bold">{item.totalItemPrice} ₽</span>
              </div>
            </div>
          ))}
        </div>

        {/* Блок оформления */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Итого</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Сумма заказа</span>
              <span>{totalPrice} ₽</span>
            </div>
            
            <div className="flex justify-between">
              <span>Доставка</span>
              <span>
                {deliveryCost === 0 
                  ? 'Бесплатно' 
                  : `${deliveryCost} ₽`
                }
              </span>
            </div>
            
            {deliveryCost > 0 && (
              <div className="text-green-600 text-sm">
                Доставка бесплатно от {1000} ₽
              </div>
            )}
            
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>К оплате</span>
              <span>{totalWithDelivery} ₽</span>
            </div>
            
            <Link
              to="/checkout"
              className="w-full bg-green-500 text-white py-3 rounded-lg text-center block hover:bg-green-600 transition-colors"
            >
              Оформить заказ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;