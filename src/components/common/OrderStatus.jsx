import React from 'react';
import './OrderStatus.css';

const OrderStatus = ({ order, onClose }) => {
  if (!order) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Готовится':
        return 'bg-yellow-100 text-yellow-800';
      case 'В пути':
        return 'bg-blue-100 text-blue-800';
      case 'Доставлен':
        return 'bg-green-100 text-green-800';
      case 'Отменен':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Статус заказа #{order.id}</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      <div className="space-y-2">
        <p>
          <span className="font-medium">Статус:</span>{' '}
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </p>
        <p><span className="font-medium">Адрес доставки:</span> {order.deliveryAddress}</p>
        <p><span className="font-medium">Сумма:</span> {order.total} ₽</p>
        <p><span className="font-medium">Время заказа:</span> {new Date(order.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default OrderStatus; // Важно: экспорт по умолчанию