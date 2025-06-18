import React from 'react';
import './SidebarPanel.css';

interface SidebarPanelProps {
  title?: string;
  className?: string;
}

const SidebarPanel: React.FC<SidebarPanelProps> = ({ 
  title = "Panel Lateral", 
  className = "" 
}) => {
  return (
    <div className={`sidebar-panel ${className}`}>
      <div className="sidebar-panel-header">
        <h3>{title}</h3>
      </div>
      <div className="sidebar-panel-content">
        <div className="sidebar-content-item">
          <h4>Resumen del Día</h4>
          <p>Información actualizada del rendimiento diario</p>
        </div>
        
        <div className="sidebar-content-item">
          <h4>Pago Reciente</h4>
          <p>##### realizo un pago</p>
        </div>
        
        <div className="sidebar-content-item">
          <h4>Actividad Reciente</h4>
          <p>Últimas acciones realizadas en el sistema</p>
        </div>
      </div>
    </div>
  );
};

export default SidebarPanel;