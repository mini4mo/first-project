import React, { useState, useContext } from 'react';
import { MapPin, CreditCard, Truck, User, Phone } from 'lucide-react';
import { useCart } from '../contexts/CartContext.jsx';
import { CartProvider } from '../contexts/CartContext.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryType: 'delivery',
    paymentMethod: 'card',
    comment: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const orderData = {
        ...formData,
        items: cart,
        total: totalPrice,
        status: 'created'
      };

      const response = await axios.post('/api/orders', orderData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        clearCart();
        navigate(`/order/${response.data.order.id}`);
      }
    } catch (err) {
      console.error('Ошибка при оформлении заказа:', err);
      alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Форма заказа */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Оформление заказа</h2>
          
          <form onSubmit={handleSubmitOrder}>
            {/* Личные данные */}
            <div className="space-y-4">
              <div className="flex items-center border-b pb-4">
                <User className="mr-3 text-blue-500" />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ваше имя"
                  required
                  className="w-full bg-transparent focus:outline-none"
                />
              </div>

              <div className="flex items-center border-b pb-4">
                <Phone className="mr-3 text-blue-500" />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Номер телефона"
                  required
                  className="w-full bg-transparent focus:outline-none"
                />
              </div>

              <div className="flex items-center border-b pb-4">
                <MapPin className="mr-3 text-blue-500" />
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Адрес доставки"
                  required
                  className="w-full bg-transparent focus:outline-none"
                />
              </div>

              {/* Способ доставки */}
              <div>
                <h3 className="font-semibold mb-2">Способ доставки</h3>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="deliveryType"
                      value="delivery"
                      checked={formData.deliveryType === 'delivery'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <Truck className="mr-2" /> Доставка
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="deliveryType"
                      value="pickup"
                      checked={formData.deliveryType === 'pickup'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <MapPin className="mr-2" /> Самовывоз
                  </label>
                </div>
              </div>

              {/* Способ оплаты */}
              <div>
                <h3 className="font-semibold mb-2">Способ оплаты</h3>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <CreditCard className="mr-2" /> Картой онлайн
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Наличными
                  </label>
                </div>
              </div>

              {/* Комментарий к заказу */}
              <div>
                <textarea 
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="Комментарий к заказу (необязательно)"
                  className="w-full border rounded-lg p-3 mt-4"
                  rows="3"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-green-500 text-white py-3 rounded-lg mt-6 hover:bg-green-600 transition-colors"
            >
              Подтвердить заказ
            </button>
          </form>
        </div>

        {/* Блок заказа */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Ваш заказ</h2>
          
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b py-3">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-500">{item.quantity} × {item.price} ₽</p>
              </div>
              <span className="font-bold">{item.quantity * item.price} ₽</span>
            </div>
          ))}

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Сумма заказа</span>
              <span>{totalPrice} ₽</span>
            </div>
            <div className="flex justify-between font-bold text-green-600">
              <span>Итого</span>
              <span>{totalPrice} ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;