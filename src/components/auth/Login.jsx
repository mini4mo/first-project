import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      // Проверяем наличие токена и данных пользователя в ответе
      if (response.data.success && response.data.token && response.data.user) {
        // Сохраняем данные в localStorage
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email
        }));
        
        setIsLoading(false);
        
        // Переходим на главную страницу
        navigate('src/components/menu/Dashboard.jsx');
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (err) {
      setIsLoading(false);
      setError(
        err.response?.data?.message || 
        'Ошибка входа. Проверьте логин и пароль.'
      );
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google Login');
  };

  const handleFacebookLogin = () => {
    console.log('Facebook Login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Вход в Быструю Доставку
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Пароль</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a 
                href="/forgot-password" 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Забыли пароль?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white 
              ${isLoading 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Входим...' : 'Войти'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Или войдите через
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Google
                </button>
              </div>
              <div>
                <button
                  onClick={handleFacebookLogin}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Facebook
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Нет аккаунта? {' '}
              <a 
                href="/register" 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Зарегистрируйтесь
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;