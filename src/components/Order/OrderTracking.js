import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  CreditCard, 
  Navigation 
} from 'lucide-react';

const OrderStatus = {
  CREATED: 'Создан',
  CONFIRMED: 'Подтвержден',
  COOKING: 'Готовится',
  DELIVERING: 'Доставляется',
  COMPLETED: 'Доставлен'
};

const OrderTracking = ({ orderId }) => {
  const [orderDetails, setOrderDetails] = useState({
    id: orderId,
    status: OrderStatus.CREATED,
    restaurant: 'Вкусная Кухня',
    estimatedDeliveryTime: '45-60 мин',
    items: [
      { id: 1, name: 'Цезарь с курицей', quantity: 1, price: 350 },
      { id: 2, name: 'Пицца Маргарита', quantity: 2, price: 450 }
    ],
    totalPrice: 1250,
    deliveryAddress: 'ул. Центральная, 10, кв. 25',
    courierInfo: {
      name: 'Иван',
      phone: '+7 (999) 123-45-67',
      transportType: 'Скутер'
    }
  });

  const [trackingSteps, setTrackingSteps] = useState([
    { 
      status: OrderStatus.CREATED, 
      completed: true, 
      time: '20:15' 
    },
    { 
      status: OrderStatus.CONFIRMED, 
      completed: true, 
      time: '20:17' 
    },
    { 
      status: OrderStatus.COOKING, 
      completed: true, 
      time: '20:25' 
    },
    { 
      status: OrderStatus.DELIVERING, 
      completed: false, 
      time: null 
    },
    { 
      status: OrderStatus.COMPLETED, 
      completed: false, 
      time: null 
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case OrderStatus.CREATED: return 'text-blue-500';
      case OrderStatus.CONFIRMED: return 'text-yellow-500';
      case OrderStatus.COOKING: return 'text-orange-500';
      case OrderStatus.DELIVERING: return 'text-green-500';
      case OrderStatus.COMPLETED: return 'text-green-700';
      default: return 'text-gray-500';
    }
  };

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

          {/* Детали курьера */}
          <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Truck className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Курьер: {orderDetails.courierInfo.name}</h3>
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{orderDetails.courierInfo.phone}</span>
                <Navigation className="w-4 h-4 text-blue-500" />
                <span>{orderDetails.courierInfo.transportType}</span>
              </div>
            </div>
          </div>

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
              <span>{orderDetails.totalPrice} ₽</span>
            </div>
          </div>

          {/* Информация о доставке */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <MapPin className="text-blue-500" />
              <div>
                <h4 className="font-semibold">Адрес доставки</h4>
                <p className="text-gray-600">{orderDetails.deliveryAddress}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-3">
              <Clock className="text-blue-500" />
              <div>
                <h4 className="font-semibold">Estimated Delivery</h4>
                <p className="text-gray-600">
                  {orderDetails.estimatedDeliveryTime}
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