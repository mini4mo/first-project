import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Поиск ресторанов..."
        value={value}
        onChange={onChange}
        className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

export default SearchBar; // Добавлен экспорт по умолчанию