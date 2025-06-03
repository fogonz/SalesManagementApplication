import React from 'react';
import './Admin.css';
import SideBar from '../../layouts/SideBar/SideBar';
import ROIChart from '../../components/Charts/ROIChart/ROIChart';
import SalesChart from '../../components/Charts/SalesChart/SalesChart';
import Datachart from '../../components/Datachart/Datachart';

const Admin = () => {
  const ingreso = 400000;
  const egreso = 100000;

  const performanceData = [
    { label: 'Rendimiento de...', value: 11, type: 'negative' },
    { label: 'Rendimiento de...', value: 11, type: 'negative' },
    { label: 'Rendimiento de...', value: 11, type: 'negative' },
    { label: 'Rendimiento de...', value: 11, type: 'negative' },
    { label: 'Rendimiento de...', value: 11, type: 'negative' },
    { label: 'Rendimiento de...', value: 11, type: 'negative' },
    { label: 'Rendimiento de...', value: 11, type: 'negative' },
    { label: 'Rendimiento de...', value: 11, type: 'negative' },
    { label: 'Rendimiento de...', value: 11, type: 'negative' },
  ];

  return (
    <div className='app-wrapper'>
      <div className='row'>
        <SideBar currentSection='admin' />
        <div className="dashboard-container">

          {/* Header */}
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

          {/* Main Content */}
          <div className="content-and-sidebar">
            <div className='wrapper'>
              <Datachart ingreso={ingreso} egreso={egreso} performanceData={performanceData} />
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;
