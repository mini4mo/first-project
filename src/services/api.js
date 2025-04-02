const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('userToken');
  return token ? { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {};
};

export const fetchRestaurants = async () => {
  const response = await fetch(`${API_BASE_URL}/restaurants`, {
    headers: getAuthHeader(),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch restaurants');
  }
  
  return await response.json();
};

export const fetchMenuItems = async (restaurantId) => {
  const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/menu`, {
    headers: getAuthHeader(),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }
  
  return await response.json();
};

export const createOrder = async (orderData) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(orderData),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to create order');
  }
  
  return await response.json();
};

export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  
  return await response.json();
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Registration failed');
  }
  
  return await response.json();
};

export const fetchActiveOrder = async () => {
  const response = await fetch(`${API_BASE_URL}/orders/active`, {
    headers: getAuthHeader(),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch active order');
  }
  
  return await response.json();
};

export const getUserProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeader(),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  
  return await response.json();
};