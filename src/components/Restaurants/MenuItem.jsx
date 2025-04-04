// first-project/src/components/Restaurants/MenuItem.jsx
import React from 'react';
// 1. Import the custom hook instead of useContext and CartContext
import { useCart } from '../contexts/CartContext'; // Make sure the path is correct!
// import './MenuItem.css'; // Ensure styles are imported if needed

function MenuItem({ item }) {
    // 2. Use the custom hook to get dispatch (and state if needed)
    const { dispatch } = useCart();

    // Handler function
    const handleAddToCart = () => {
        // 3. Dispatch the 'ADD_ITEM' action with the item as payload
        if (item && typeof dispatch === 'function') {
            dispatch({ type: 'ADD_ITEM', payload: item });
            console.log(`Диспетчеризовано добавление: ${item.name}`); // Optional: for debugging
        } else {
            console.error("Ошибка: Не удалось диспетчеризовать добавление товара. Проверьте item и useCart.", item);
        }
    };

    // Basic check if item data is available
    if (!item) {
        return null;
    }

    return (
        <div className="menu-item"> {/* Ensure class matches your CSS */}
            <h3>{item.name || 'Название отсутствует'}</h3>
            <p>{item.description || 'Описание отсутствует'}</p>
            <span>
                {typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : 'Цена не указана'}
            </span>

            {/* Button calls the corrected handler */}
            {/* Disable button if dispatch isn't available (means context is likely missing) */}
            <button onClick={handleAddToCart} disabled={typeof dispatch !== 'function'}>
                Добавить в корзину
            </button>
             {typeof dispatch !== 'function' && (
                 <small style={{ display: 'block', color: 'red', marginTop: '5px' }}>
                     Не удалось подключить корзину
                 </small>
             )}
        </div>
    );
}

export default MenuItem;