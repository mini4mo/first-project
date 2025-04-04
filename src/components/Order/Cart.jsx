import React from 'react';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
// Убираем ненужный импорт CartProvider, он уже есть в main.jsx
// import { CartProvider } from '../contexts/CartContext.jsx'; 
import { useCart } from '../contexts/CartContext.jsx'; // <<<--- Импортируем useCart
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  // <<<--- ИСПРАВЛЕНО: Получаем state и dispatch
  const { state, dispatch } = useCart(); 
  // Получаем массив товаров из state
  const cartItems = state.items; 

  // --- Функции для взаимодействия с корзиной через dispatch ---
  const handleIncreaseQuantity = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item }); // Используем ту же логику, что и при добавлении
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } });
    } else {
      // Если количество 1, то удаляем товар
      dispatch({ type: 'REMOVE_ITEM', payload: item.id }); 
    }
  };

  const handleRemoveItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const handleClearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  // --- Конец функций для dispatch ---

  // Рассчитываем общую стоимость на основе cartItems (state.items)
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Группировка больше не нужна, так как редьюсер уже правильно обрабатывает количество
  // const groupedCart = ...; 

  // Расчет стоимости доставки
  const calculateDeliveryCost = () => {
    const FREE_DELIVERY_THRESHOLD = 1000;
    const DELIVERY_COST = 150;
    return totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST;
  };

  const deliveryCost = calculateDeliveryCost();
  const totalWithDelivery = totalPrice + deliveryCost;

  // <<<--- ИСПРАВЛЕНО: Проверяем длину cartItems
  if (cartItems.length === 0) { 
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-white shadow-lg rounded-lg p-10">
          <ShoppingCart className="mx-auto w-24 h-24 text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Ваша корзина пуста</h2>
          <p className="text-gray-600 mb-6">
            Добавьте блюда из меню ресторана, чтобы оформить заказ
          </p>
          <Link 
            to="/dashboard" // <<<--- Можно изменить на /dashboard или другую страницу с ресторанами
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Перейти к выбору блюд
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
              onClick={handleClearCart} // <<<--- ИСПРАВЛЕНО: Используем handleClearCart
              className="text-red-500 hover:text-red-700 flex items-center"
            >
              <Trash2 className="mr-2" size={18} />
              Очистить корзину
            </button>
          </div>

          {/* <<<--- ИСПРАВЛЕНО: Используем cartItems для итерации */}
          {cartItems.map(item => ( 
            <div 
              key={item.id} 
              className="flex items-center justify-between border-b py-4"
            >
              <div className="flex items-center space-x-4">
                <img 
                  // Добавил базовый URL, если imageUrl относительный, или используйте process.env.VITE_API_URL
                  src={item.imageUrl || '/placeholder.jpg'} // Замените '/placeholder.jpg' на ваш плейсхолдер
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.jpg'; }} // Обработка ошибки загрузки изображения
                />
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-gray-500">{item.price} ₽</p>
                  {/* Кнопка удаления отдельная */}
                  <button 
                     onClick={() => handleRemoveItem(item.id)} // <<<--- ИСПРАВЛЕНО: Кнопка удаления
                     className="text-xs text-red-500 hover:text-red-700 mt-1"
                   >
                     Удалить
                   </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDecreaseQuantity(item)} // <<<--- ИСПРАВЛЕНО
                    className="bg-gray-200 p-1 rounded-full hover:bg-gray-300 disabled:opacity-50"
                    // disabled={item.quantity <= 1} // Можно оставить disabled, если кнопка удаления отдельно
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => handleIncreaseQuantity(item)} // <<<--- ИСПРАВЛЕНО
                    className="bg-gray-200 p-1 rounded-full hover:bg-gray-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {/* <<<--- ИСПРАВЛЕНО: Расчет общей цены за позицию */}
                <span className="font-bold w-20 text-right">{item.price * item.quantity} ₽</span> 
              </div>
            </div>
          ))}
        </div>

        {/* Блок оформления */}
        <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-6"> {/* Добавлен h-fit и sticky */}
          <h2 className="text-2xl font-bold mb-6">Итого</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Сумма заказа</span>
              {/* <<<--- ИСПРАВЛЕНО: Используем рассчитанный totalPrice */}
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
            
            {deliveryCost > 0 && totalPrice > 0 && totalPrice < 1000 && ( // Условие показа
              <div className="text-green-600 text-sm">
                До бесплатной доставки осталось {1000 - totalPrice} ₽
              </div>
            )}
            
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>К оплате</span>
              {/* <<<--- ИСПРАВЛЕНО: Используем рассчитанный totalWithDelivery */}
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