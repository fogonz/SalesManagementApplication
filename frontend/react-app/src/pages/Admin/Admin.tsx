import React, { useState } from 'react';
import './Admin.css';
import SideBar from '../../layouts/SideBar/SideBar';
import ROIChart from '../../components/Charts/ROIChart/ROIChart';
import ProductChart from '../../components/Charts/ProductChart/ProductChart';
import SalesChart from '../../components/Charts/SalesChart/SalesChart';
import Datachart from '../../components/Datachart/Datachart';
import PerformanceGrid from '../../components/PerformanceGrid/PerformanceGrid';
import Alerts from '../../components/Alerts/Aletrs';
import SidebarPanel from '../../components/SidebarPanel/SidebarPanel';
import FilterButton from '../../components/FilterButton/FilterButton';

const Admin = () => {
  const [selectedFilter, setSelectedFilter] = useState('Esta Semana');
 
  const ingreso = 400000;
  const egreso = 100000;
      
  const performanceData = [
    { label: 'Rendimiento de Ventas', value: 11, type: 'negative' },
    { label: 'Rentabilidad Neta', value: 22, type: 'positive' },
    { label: 'Nivel de Satisfacción', value: 92, type: 'positive' }
  ];
  
  const filterOptions = ['Esta Semana', 'Este Mes', 'Este Año'];
  
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    //lógica para filtrar los datos
    console.log('Filtro seleccionado:', filter);
  };
  
  return (
    <div className='app-wrapper'>
      <div className='admin-container'>
        <SideBar currentSection='admin' />
        <div className="dashboard-container">
          {/* Header */}
          <div>
            <Alerts Alerts={Alerts}/>
          </div>
          
          {/* Filter Button */}
          <FilterButton selectedFilter={selectedFilter} filterOptions={filterOptions} onFilterChange={handleFilterChange}/>
          
          {/* Main Content */}
          <div className="content-and-sidebar">
            <div className="dashboard-main-wrapper">
              <Datachart ingreso={ingreso} egreso={egreso} />
              <PerformanceGrid performanceData={performanceData}/>
            </div>
            
            {/* Container for Charts and New Container */}
            <div className="right-side-wrapper">
              {/* Charts Container */}
              <div className='cards-container'>
                {/* Contenedor para las cards en fila */}
                <div className='cards-row'>
                  <div className="card-chart">
                    <div className="sales-chart-title"></div>
                    <SalesChart />
                  </div>
                  <div className="card-chart">
                    <div className="sales-chart-title"></div>
                    <ProductChart />
                  </div>
                </div>
                
                {/* Card individual en columna */}
                <div className="card-chart2">
                  <div className="sales-chart-title">Ventas</div>
                  <ROIChart />
                </div>
                
                {/* Nuevo contenedor de Ventas Totales */}
                <div className="sales-total">
                  <div className="total-sales-container">
                    <div className="total-sales-label">Total sales</div>
                    <div className="total-sales-amount">$137,142.33</div>
                  </div>
                </div>
              </div>
              
              {/* New Sidebar Panel Component */}
              <SidebarPanel title="Panel de Control" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;