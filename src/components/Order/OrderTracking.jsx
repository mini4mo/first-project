import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  CreditCard, 
  Navigation 
} from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const OrderStatus = {
  CREATED: 'Создан',
  CONFIRMED: 'Подтвержден',
  COOKING: 'Готовится',
  DELIVERING: 'Доставляется',
  COMPLETED: 'Доставлен',
  CANCELLED: 'Отменен'
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          setError('Требуется авторизация');
          return;
        }

        const response = await axios.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setOrderDetails(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка загрузки данных заказа');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getStatusColor = (status) => {
    switch(status) {
      case OrderStatus.CREATED: return 'text-blue-500';
      case OrderStatus.CONFIRMED: return 'text-yellow-500';
      case OrderStatus.COOKING: return 'text-orange-500';
      case OrderStatus.DELIVERING: return 'text-green-500';
      case OrderStatus.COMPLETED: return 'text-green-700';
      case OrderStatus.CANCELLED: return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        {error}
      </div>
    );
  }

  if (!orderDetails) {
    return <div className="text-center mt-10">Заказ не найден</div>;
  }

  // Создаем шаги для отображения прогресса
  const statusSteps = Object.values(OrderStatus);
  const currentStatusIndex = statusSteps.indexOf(orderDetails.status);

  const trackingSteps = statusSteps.map((status, index) => ({
    status,
    completed: index <= currentStatusIndex,
    time: index <= currentStatusIndex ? new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null
  }));

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Заголовок */}
        <div className="bg-blue-500 text-white p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Заказ #{orderId}</h1>
            <p className={`text-sm ${getStatusColor(orderDetails.status)}`}>
              Статус: {orderDetails.status}
            </p>
          </div>
          <Clock className="w-10 h-10" />
        </div>

        {/* Прогресс-бар статусов */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            {trackingSteps.map((step, index) => (
              <div 
                key={step.status} 
                className="flex flex-col items-center relative"
              >
                <div 
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center 
                    ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}
                >
                  {step.completed ? <CheckCircle /> : index + 1}
                </div>
                <span className="text-xs mt-2 text-center">{step.status}</span>
                {step.time && (
                  <span className="text-xs text-gray-500">{step.time}</span>
                )}
                {index < trackingSteps.length - 1 && (
                  <div 
                    className={`
                      absolute top-6 left-6 w-full h-1 
                      ${step.completed ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                    style={{ zIndex: -1 }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Детали курьера (если статус DELIVERING) */}
          {orderDetails.status === OrderStatus.DELIVERING && orderDetails.courier && (
            <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <Truck className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Курьер: {orderDetails.courier.name}</h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{orderDetails.courier.phone}</span>
                  <Navigation className="w-4 h-4 text-blue-500" />
                  <span>{orderDetails.courier.transportType || 'Автомобиль'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Список товаров */}
          <div className="border-t pt-4">
            <h3 className="font-bold mb-4">Состав заказа</h3>
            {orderDetails.items.map(item => (
              <div 
                key={item.id} 
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-gray-500 ml-2">
                    {item.quantity} × {item.price} ₽
                  </span>
                </div>
                <span className="font-bold">
                  {item.quantity * item.price} ₽
                </span>
              </div>
            ))}
            <div className="flex justify-between font-bold mt-4">
              <span>Итого</span>
              <span>{orderDetails.total} ₽</span>
            </div>
          </div>

          {/* Информация о доставке */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <MapPin className="text-blue-500" />
              <div>
                <h4 className="font-semibold">Адрес доставки</h4>
                <p className="text-gray-600">{orderDetails.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-3">
              <Clock className="text-blue-500" />
              <div>
                <h4 className="font-semibold">Время доставки</h4>
                <p className="text-gray-600">
                  {orderDetails.estimatedDeliveryTime || '30-60 мин'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-3">
              <CreditCard className="text-blue-500" />
              <div>
                <h4 className="font-semibold">Способ оплаты</h4>
                <p className="text-gray-600">
                  {orderDetails.paymentMethod === 'card' ? 'Картой онлайн' : 'Наличными'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;