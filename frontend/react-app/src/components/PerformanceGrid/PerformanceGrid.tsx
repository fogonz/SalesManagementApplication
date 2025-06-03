import React from 'react';
import "./PerformanceGrid.css";

const PerformanceGrid = ({ performanceData }) => {
  return (
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
  );
};

export default PerformanceGrid; 