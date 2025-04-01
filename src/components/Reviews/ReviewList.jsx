import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import './ReviewList.css';

const ReviewList = ({ restaurantId }) => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      userName: 'Анна Петрова',
      userAvatar: '/api/placeholder/50/50',
      rating: 5,
      text: 'Потрясающе вкусная пицца! Курьер был очень вежливым, еда пришла горячей. Обязательно закажу еще.',
      images: ['/api/placeholder/100/100', '/api/placeholder/100/100'],
      date: '2024-03-15',
      likes: 12,
      dislikes: 2
    },
    {
      id: 2,
      userName: 'Игорь Смирнов',
      userAvatar: '/api/placeholder/50/50',
      rating: 4,
      text: 'Хороший ресторан, но немного долго готовили. Качество еды на высоте.',
      images: [],
      date: '2024-03-10',
      likes: 5,
      dislikes: 1
    }
  ]);

  const [filters, setFilters] = useState({
    rating: null,
    sortBy: 'newest'
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={20}
        className={`
          ${index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
        `}
      />
    ));
  };

  const filteredReviews = reviews
    .filter(review => filters.rating ? review.rating === filters.rating : true)
    .sort((a, b) => {
      switch(filters.sortBy) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'likes':
          return b.likes - a.likes;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleReaction = (reviewId, type) => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          [type]: review[type] + 1
        };
      }
      return review;
    }));
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Отзывы</h2>
          <div className="flex space-x-2">
            {/* Фильтры рейтинга */}
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                onClick={() => handleFilterChange('rating', filters.rating === rating ? null : rating)}
                className={`
                  px-2 py-1 rounded-full flex items-center
                  ${filters.rating === rating 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600'}
                `}
              >
                {rating} <Star className="ml-1" size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Сортировка */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('sortBy', 'newest')}
              className={`
                flex items-center px-3 py-1 rounded-full
                ${filters.sortBy === 'newest' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600'}
              `}
            >
              <Filter size={16} className="mr-2" /> Новые
            </button>
            <button
              onClick={() => handleFilterChange('sortBy', 'likes')}
              className={`
                flex items-center px-3 py-1 rounded-full
                ${filters.sortBy === 'likes' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600'}
              `}
            >
              <ThumbsUp size={16} className="mr-2" /> Полезные
            </button>
          </div>
          <span className="text-gray-500">
            Всего отзывов: {filteredReviews.length}
          </span>
        </div>

        {/* Список отзывов */}
        {filteredReviews.map(review => (
          <div 
            key={review.id} 
            className="border-b pb-6 mb-6 last:border-b-0"
          >
            <div className="flex items-center mb-4">
              <img 
                src={review.userAvatar} 
                alt={review.userName}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-bold">{review.userName}</h3>
                <div className="flex items-center">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <p className="mb-4">{review.text}</p>

            {review.images.length > 0 && (
              <div className="flex space-x-2 mb-4">
                {review.images.map((img, index) => (
                  <img 
                    key={index} 
                    src={img} 
                    alt={`Фото отзыва ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleReaction(review.id, 'likes')}
                className="flex items-center text-green-600 hover:text-green-800"
              >
                <ThumbsUp size={18} className="mr-2" />
                {review.likes}
              </button>
              <button
                onClick={() => handleReaction(review.id, 'dislikes')}
                className="flex items-center text-red-600 hover:text-red-800"
              >
                <ThumbsDown size={18} className="mr-2" />
                {review.dislikes}
              </button>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            Отзывов пока нет
          </div>
        )}
      </div>
    </div>
  );
};

ReviewList.defaultProps = {
  restaurantId: null
};

export default ReviewList;