import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category, index) => {
        // Если категория является объектом, используем её поля, иначе работаем со строкой.
        const catName = typeof category === 'object' ? category.name : category;
        // Используем уникальный ключ: если есть id, то он, иначе имя, а если и то отсутствует – индекс.
        const key = typeof category === 'object' && category.id ? category.id : catName || index;
        
        return (
          <button
            key={key}
            className={`px-4 py-2 border rounded ${
              selectedCategory === catName ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
            }`}
            onClick={() => onSelectCategory(catName)}
          >
            {catName}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
