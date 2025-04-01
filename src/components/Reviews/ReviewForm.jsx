import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import './ReviewForm.css';

const ReviewForm = ({ restaurantId, onSubmitReview }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState({
    text: '',
    images: []
  });

  const handleRatingChange = (currentRating) => {
    setRating(currentRating);
  };

  const handleReviewTextChange = (e) => {
    setReview(prev => ({
      ...prev,
      text: e.target.value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setReview(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));
  };

  const removeImage = (index) => {
    setReview(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Пожалуйста, поставьте оценку');
      return;
    }

    const reviewData = {
      restaurantId,
      rating,
      text: review.text,
      images: review.images.map(img => img.file)
    };

    onSubmitReview(reviewData);
    
    // Сброс формы
    setRating(0);
    setHover(0);
    setReview({ text: '', images: [] });
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Оставить отзыв</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Блок рейтинга */}
        <div className="mb-6 flex justify-center">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <Star
                key={index}
                className={`
                  cursor-pointer transition-colors duration-200
                  ${ratingValue <= (hover || rating) 
                    ? 'text-yellow-500 fill-current' 
                    : 'text-gray-300'}
                `}
                size={40}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
                onClick={() => handleRatingChange(ratingValue)}
              />
            );
          })}
        </div>

        {/* Текстовый отзыв */}
        <textarea
          placeholder="Расскажите о вашем впечатлении..."
          value={review.text}
          onChange={handleReviewTextChange}
          className="w-full h-32 p-4 border rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          maxLength={500}
        />
        <div className="text-right text-sm text-gray-500">
          {review.text.length}/500
        </div>

        {/* Загрузка изображений */}
        <div className="mb-4">
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label 
            htmlFor="image-upload" 
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 cursor-pointer inline-block"
          >
            Добавить фото
          </label>
        </div>

        {/* Превью изображений */}
        {review.images.length > 0 && (
          <div className="flex space-x-2 mb-4">
            {review.images.map((img, index) => (
              <div key={index} className="relative">
                <img 
                  src={img.preview} 
                  alt={`Preview ${index}`} 
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Кнопка отправки */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
        >
          <Send className="mr-2" />
          Отправить отзыв
        </button>
      </form>
    </div>
  );
};

// Пропсы по умолчанию
ReviewForm.defaultProps = {
  restaurantId: null,
  onSubmitReview: (reviewData) => {
    console.log('Отзыв отправлен:', reviewData);
  }
};

export default ReviewForm;