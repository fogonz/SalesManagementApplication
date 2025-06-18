import React from 'react';
import './ShoppingCart.css';

interface CartTotalProps {
  total: number;
}

const ShoppingCartTotal: React.FC<CartTotalProps> = ({ total }) => {
  return (
    <div className="cart-total">
      <span>Total:</span>
      <span className="cart-total__amount">
        ${total.toFixed(2)}
      </span>
    </div>
  );
};

export default ShoppingCartTotal;