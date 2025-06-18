import React from 'react';
import './TotalSales.css';

interface TotalSalesProps {
  amount: number;
  label?: string; 
  currency?: string; 
}

const TotalSales: React.FC<TotalSalesProps> = ({ 
  amount, 
  label = "Total sales", 
  currency = "$" 
}) => {


  return (
    <div className="sales-total">
      <div className="total-sales-container">
        <div className="total-sales-label">{label}</div>
        <div className="total-sales-amount">
          {currency}{(amount)}
        </div>
      </div>
    </div>
  );
};

export default TotalSales;