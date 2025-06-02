import React from 'react';
import './StatsDashboard.css';

const StatisticsDashboard = () => {
  // Sample data for the charts
  const roiData = [
    { x: 1, roi: 22, roe: 8 },
    { x: 2, roi: 28, roe: 12 },
    { x: 3, roi: 25, roe: 15 },
    { x: 4, roi: 30, roe: 18 },
    { x: 5, roi: 32, roe: 16 },
    { x: 6, roi: 28, roe: 20 },
    { x: 7, roi: 35, roe: 13 }
  ];

  const salesData = [
    { day: 1, value: 25 },
    { day: 2, value: 22 },
    { day: 3, value: 28 },
    { day: 4, value: 32 },
    { day: 5, value: 30 },
    { day: 6, value: 35 },
    { day: 7, value: 33 }
  ];

  const ROIChart = () => (
    <svg width="180" height="80" className="chart-svg">
      <defs>
        <linearGradient id="roiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="roeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#fca5a5" />
        </linearGradient>
      </defs>
      {/* ROI Line (Green) */}
      <polyline
        className="roi-line"
        points={roiData.map((d, i) => `${i * 28 + 10},${70 - d.roi}`).join(' ')}
      />
      {/* ROE Line (Red) */}
      <polyline
        className="roe-line"
        points={roiData.map((d, i) => `${i * 28 + 10},${70 - d.roe}`).join(' ')}
      />
      {/* ROI Points */}
      {roiData.map((d, i) => (
        <circle
          key={`roi-${i}`}
          className="roi-point"
          cx={i * 28 + 10}
          cy={70 - d.roi}
          r="3"
        />
      ))}
      {/* ROE Points */}
      {roiData.map((d, i) => (
        <circle
          key={`roe-${i}`}
          className="roe-point"
          cx={i * 28 + 10}
          cy={70 - d.roe}
          r="3"
        />
      ))}
    </svg>
  );

  const SalesChart = () => (
    <svg width="200" height="100" className="chart-svg">
      {/* Grid lines */}
      {[0, 10, 20, 30, 40].map(y => (
        <line
          key={y}
          className="grid-line"
          x1="20"
          y1={80 - y * 1.5}
          x2="180"
          y2={80 - y * 1.5}
        />
      ))}
      {/* Y-axis labels */}
      {[0, 10, 20, 30, 40].map(y => (
        <text
          key={y}
          className="axis-label"
          x="15"
          y={85 - y * 1.5}
          textAnchor="end"
        >
          {y}
        </text>
      ))}
      {/* Sales line */}
      <polyline
        className="sales-line"
        points={salesData.map((d, i) => `${30 + i * 22},${80 - d.value * 1.5}`).join(' ')}
      />
      {/* Sales points */}
      {salesData.map((d, i) => (
        <circle
          key={i}
          className="sales-point"
          cx={30 + i * 22}
          cy={80 - d.value * 1.5}
          r="3"
        />
      ))}
      {/* X-axis labels */}
      {[1, 2, 3, 4, 5, 6, 7].map((day, i) => (
        <text
          key={day}
          className="axis-label"
          x={30 + i * 22}
          y="95"
          textAnchor="middle"
        >
          {day}
        </text>
      ))}
    </svg>
  );

  return (
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

        {/* Sidebar */}
        <div className="sidebar2">
          <div className="sidebar-content">
            <div className="sidebar-title2">CATEGORÍAS</div>
            <div className="sidebar-menu">
              <div className="sidebar-item sidebar-item--active">
                <div className="sidebar-icon sidebar-icon--square"></div>
                <div className="sidebar-text">Estadisticas</div>
              </div>
              <div className="sidebar-item">
                <div className="sidebar-icon sidebar-icon--circle"></div>
                <div className="sidebar-text">Caja chica</div>
              </div>
              <div className="sidebar-item">
                <div className="sidebar-icon sidebar-icon--circle"></div>
                <div className="sidebar-text">Stock</div>
              </div>
              <div className="sidebar-item">
                <div className="sidebar-icon sidebar-icon--square"></div>
                <div className="sidebar-text">Cuentas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
