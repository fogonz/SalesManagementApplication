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
import TotalSales from '../../components/TotalSales/TotalSales';

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
    console.log('Filtro seleccionado:', filter);
  };

  return (
    <div className='app-wrapper'>
      <div className='admin-container'>
        <SideBar currentSection='admin' activeView={''} />
        <div className="dashboard-container">
          <div>
            <Alerts Alerts={Alerts} />
          </div>

          <FilterButton
            selectedFilter={selectedFilter}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
          />

          <div className="content-and-sidebar">
            <div className="dashboard-main-wrapper">
              <Datachart ingreso={ingreso} egreso={egreso} />
              <PerformanceGrid performanceData={performanceData} />
            </div>

            <div className="right-side-wrapper">
              <div className='cards-container'>
                <div className='cards-row'>
                  <SalesChart />
                  <ProductChart />
                </div>
                <ROIChart />
                <TotalSales />
              </div>

              <SidebarPanel title="Panel de Control" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
