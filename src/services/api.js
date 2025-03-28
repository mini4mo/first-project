// src/services/api.js
const API_BASE_URL = 'http://localhost:5173/api';

export const fetchRestaurants = async () => {
  const response = await fetch(`${API_BASE_URL}/restaurants`);
  return await response.json();
};

export const fetchMenuItems = async (restaurantId) => {
  const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/menu`);
  return await response.json();
};

export const createOrder = async (orderData) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  return await response.json();
};