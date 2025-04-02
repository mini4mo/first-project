import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import MenuItem from '../Restaurants/MenuItem.jsx'
import CartSidebar from '../common/CartSidebar.jsx'

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

const RestaurantPage = ({ setIsAuthenticated }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError('')
        const token = localStorage.getItem('userToken')
        
        if (!token) {
          setIsAuthenticated(false)
          navigate('/login')
          return
        }

        const config = {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        const [restaurantRes, menuRes] = await Promise.all([
          axios.get(`/api/restaurants/${id}`, config),
          axios.get(`/api/restaurants/${id}/menu`, config)
        ]);
        
        setRestaurant(restaurantRes.data.restaurant || restaurantRes.data);
        setMenuItems(menuRes.data.menu || menuRes.data);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err)
        setError(err.response?.data?.message || err.message || 'Ошибка загрузки данных')
        if (err.response?.status === 401) {
          setIsAuthenticated(false)
          localStorage.removeItem('userToken')
          navigate('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, navigate, setIsAuthenticated])

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-red-500 p-4">
      <p className="text-lg font-medium mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Попробовать снова
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md w-full py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Назад к ресторанам
        </button>
        <h1 className="text-xl font-bold text-center">{restaurant?.name}</h1>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-gray-600 hover:text-indigo-600"
          disabled={cartItems.length === 0}
        >
          🛒 {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </button>
      </header>

      <div className="container mx-auto py-8 px-4">
        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Меню пока пустое</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <MenuItem 
                key={item.id} 
                item={item} 
                onAddToCart={() => setCartItems([...cartItems, item])}
              />
            ))}
          </div>
        )}
      </div>

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onCheckout={() => navigate('/checkout')}
        onRemoveItem={(itemId) => setCartItems(cartItems.filter(item => item.id !== itemId))}
      />
    </div>
  )
}

export default RestaurantPage