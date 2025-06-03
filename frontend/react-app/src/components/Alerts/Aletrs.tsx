import React from 'react';
import "./Alerts.css";

const Avisos = (Avisos) => {
  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <span className="analysis-label">AVISOS</span>
          <div className="alert-badges">
            <div className="alert-badge alert-badge--warning">
              % Productos de alto rendimiento con ventas críticas
            </div>
            <div className="alert-badge alert-badge--danger">
              1 Deuda por pagar dentro de 4 días
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="header-title">INFORMACIÓN Y ESTADÍSTICAS</div>
        </div>
      </div>
    </div>
  );
};

export default Avisos;
