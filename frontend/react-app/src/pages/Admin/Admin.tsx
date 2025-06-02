import React from 'react';
import './Admin.css';
import SideBar from '../../layouts/SideBar/SideBar';
import ROIChart from '../../components/Charts/ROIChart/ROIChart';
import SalesChart from '../../components/Charts/SalesChart/SalesChart';

const Admin = () => {

  return (
    <div className='app-wrapper'>
      <div className='row'>
        <SideBar currentSection='admin'></SideBar>
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

          {/* Flex container for main content and sidebar */}
          <div className="content-and-sidebar">
            {/* Main Content */}
            <div className="main-content">
              <div className="main-grid">
                {/* Income/Expense Cards */}
                <div className="card">
                  <div className="income-expense-grid">
                    <div className="metric-item">
                      <div className="metric-label">Ingreso</div>
                      <div className="metric-value metric-value--positive">$400,000</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-label">Egreso</div>
                      <div className="metric-value metric-value--negative">$100,000</div>
                    </div>
                  </div>
                  <div className="total-section">
                    <div className="metric-label">Total</div>
                    <div className="metric-value metric-value--positive total-value">$300,000</div>
                  </div>
                </div>

                {/* ROI/ROE Chart */}
                <div className="card">
                  <div className="chart-header">
                    <div className="chart-metric">
                      <span className="chart-label">graph</span>
                      <span className="chart-title chart-title--positive">ROI</span>
                      <span className="chart-percentage chart-percentage--positive">25%</span>
                    </div>
                    <div className="chart-metric">
                      <span className="chart-label">graph</span>
                      <span className="chart-title chart-title--negative">ROE</span>
                      <span className="chart-percentage chart-percentage--negative">13%</span>
                    </div>
                  </div>
                  <ROIChart />
                </div>
              </div>

              <div className="bottom-grid">
                <div className="performance-grid">
                  <div className="performance-card">
                    <div className="performance-label">Rendimiento de...</div>
                    <div className="performance-value performance-value--negative">11%</div>
                    <div className="performance-indicator performance-indicator--down">▼</div>
                  </div>
                  <div className="performance-card">
                    <div className="performance-label">Ganancias en relación al mes pasado</div>
                    <div className="performance-value performance-value--positive">23%</div>
                    <div className="performance-indicator performance-indicator--up">▲</div>
                  </div>
                  <div className="performance-card">
                    <div className="performance-label">Rendimiento de...</div>
                    <div className="performance-value performance-value--negative">11%</div>
                    <div className="performance-indicator performance-indicator--down">▼</div>
                  </div>
                  <div className="performance-card">
                    <div className="performance-label">Ganancias en reducción al mes pasado</div>
                    <div className="performance-value performance-value--positive">23%</div>
                    <div className="performance-indicator performance-indicator--up">▲</div>
                  </div>
                </div>

                <div className="card">
                  <div className="sales-chart-title">Ventas en los Últimos 7 días</div>
                  <SalesChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
