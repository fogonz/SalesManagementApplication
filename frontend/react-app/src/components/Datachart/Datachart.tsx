import React from 'react';
import "./Datachart.css";

const Datachart = ({ ingreso, egreso, performanceData }) => {
  const total = ingreso - egreso;

  return (
    <div className="datachart-wrapper">
      {/* Main Content: Ingreso, Egreso, Total */}
      <div className="main-content">
        <div className="main-grid">
          <div className="card">
            {/* Ingreso y Egreso */}
            <div className="income-expense-grid">
              <div className="metric-item">
                <div className="metric-label">Ingreso</div>
                <div className="metric-value metric-value--positive">
                  ${ingreso.toLocaleString()}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Egreso</div>
                <div className="metric-value metric-value--negative">
                  ${egreso.toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Total */}
            <div className="total-section">
              <div className="metric-label">Total</div>
              <div className={`metric-value total-value ${total >= 0 ? 'metric-value--positive' : 'metric-value--negative'}`}>
                ${total.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance Grid debajo */}
      <div className="bottom-grid">
        <div className="performance-grid">
          {performanceData.map((item, index) => (
            <div className="performance-card" key={index}>
              <div className="performance-label">{item.label}</div>
              <div className={`performance-value performance-value--${item.type}`}>
                {item.value}%
              </div>
              <div className={`performance-indicator performance-indicator--${item.type}`}>
                {item.type === 'positive' ? '▲' : '▼'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Datachart;