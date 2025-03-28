import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  // State for user profile
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null,
    addresses: []
  });

  // State for form management
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAddress, setNewAddress] = useState({
    street: '',
    apartment: '',
    city: '',
    postalCode: ''
  });

  // Navigation hook
  const navigate = useNavigate();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/user/profile', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        setProfile(response.data);
      } catch (err) {
        setError('Не удалось загрузить профиль');
        console.error(err);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsLoading(true);
      const token = localStorage.getItem('userToken');
      const response = await axios.post('/api/user/upload-avatar', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });

      setProfile(prev => ({
        ...prev,
        avatar: response.data.avatarUrl
      }));
    } catch (err) {
      setError('Не удалось загрузить аватар');
    } finally {
      setIsLoading(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('userToken');
      await axios.put('/api/user/profile', profile, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Не удалось сохранить изменения');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new address
  const handleAddAddress = () => {
    if (!newAddress.street) {
      setError('Введите адрес');
      return;
    }

    setProfile(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress]
    }));

    // Reset new address form
    setNewAddress({
      street: '',
      apartment: '',
      city: '',
      postalCode: ''
    });
  };

  // Remove address
  const handleRemoveAddress = (indexToRemove) => {
    setProfile(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, index) => index !== indexToRemove)
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Настройки профиля</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Avatar Section */}
        <div className="flex items-center mb-6">
          <div className="mr-6">
            <img 
              src={profile.avatar || '/default-avatar.png'} 
              alt="Аватар профиля" 
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
          <div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <label 
              htmlFor="avatar-upload" 
              className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Загрузить аватар
            </label>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Имя</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            ) : (
              <p className="mt-1">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            ) : (
              <p className="mt-1">{profile.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Телефон</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            ) : (
              <p className="mt-1">{profile.phone || 'Не указан'}</p>
            )}
          </div>
        </div>

        {/* Edit/Save Button */}
        <div className="mt-6">
          {isEditing ? (
            <div className="flex space-x-4">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Редактировать
            </button>
          )}
        </div>

        {/* Addresses Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Адреса доставки</h2>
          
          {profile.addresses.map((address, index) => (
            <div 
              key={index} 
              className="bg-gray-100 p-4 rounded-md mb-4 flex justify-between items-center"
            >
              <div>
                <p>{address.street}</p>
                {address.apartment && <p>Квартира: {address.apartment}</p>}
                <p>{address.city}, {address.postalCode}</p>
              </div>
              <button
                onClick={() => handleRemoveAddress(index)}
                className="text-red-500 hover:text-red-700"
              >
                Удалить
              </button>
            </div>
          ))}

          {/* Add New Address Form */}
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Добавить новый адрес</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Улица"
                value={newAddress.street}
                onChange={(e) => setNewAddress(prev => ({
                  ...prev, 
                  street: e.target.value
                }))}
                className="border border-gray-300 rounded-md py-2 px-3"
              />
              <input
                type="text"
                placeholder="Квартира/Офис"
                value={newAddress.apartment}
                onChange={(e) => setNewAddress(prev => ({
                  ...prev, 
                  apartment: e.target.value
                }))}
                className="border border-gray-300 rounded-md py-2 px-3"
              />
              <input
                type="text"
                placeholder="Город"
                value={newAddress.city}
                onChange={(e) => setNewAddress(prev => ({
                  ...prev, 
                  city: e.target.value
                }))}
                className="border border-gray-300 rounded-md py-2 px-3"
              />
              <input
                type="text"
                placeholder="Почтовый индекс"
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress(prev => ({
                  ...prev, 
                  postalCode: e.target.value
                }))}
                className="border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
            <button
              onClick={handleAddAddress}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Добавить адрес
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;