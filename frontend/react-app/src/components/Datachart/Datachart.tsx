import React from 'react';
import "./Datachart.css";

const Datachart = ({ ingreso, egreso,}) => {
  const total = ingreso - egreso;

  return (
    <div className="datachart-wrapper">
      {/* Main Content: Individual Cards for Ingreso, Egreso, Total */}
      <div className="main-content">
        <div className="main-grid">
          {/* Ingreso Card */}
          <div className="card">
            <div className="metric-item">
              <div className="metric-label">Ingreso</div>
              <div className="metric-value metric-value--positive">
                ${ingreso.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Egreso Card */}
          <div className="card">
            <div className="metric-item">
              <div className="metric-label">Egreso</div>
              <div className="metric-value metric-value--negative">
                ${egreso.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Total Card */}
          <div className="card card--total">
            <div className="metric-item">
              <div className="metric-label">Total</div>
              <div className={`metric-value ${total >= 0 ? 'metric-value--positive' : 'metric-value--negative'}`}>
                ${total.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Datachart;