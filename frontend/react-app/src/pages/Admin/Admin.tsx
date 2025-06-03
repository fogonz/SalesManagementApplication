import React from 'react';
import './Admin.css';
import SideBar from '../../layouts/SideBar/SideBar';
import ROIChart from '../../components/Charts/ROIChart/ROIChart';
import SalesChart from '../../components/Charts/SalesChart/SalesChart';
import Datachart from '../../components/Datachart/Datachart';
import performanceData from '../../components/PerformanceGrid/PerformanceGrid';
import PerformanceGrid from '../../components/PerformanceGrid/PerformanceGrid';
import Alerts from '../../components/Alerts/Aletrs';

const Admin = () => {
  const ingreso = 400000;
  const egreso = 100000;

  const performanceData = [
    { label: 'Rendimiento de..saaaaaaaaaaaaaaaaaaa.', value: 11, type: 'negative' },
  ];

  return (
    <div className='app-wrapper'>
      <div className='row'>
        <SideBar currentSection='admin' />
        <div className="dashboard-container">

          {/* Header */}
          <div className="dashboard-header">
            <Alerts Alerts={Alerts}/>
          </div>

          {/* Main Content */}
          <div className="content-and-sidebar">

            <Datachart ingreso={ingreso} egreso={egreso} /> 
            <PerformanceGrid performanceData={performanceData}/>

            {/* Additional Cards like Sales/ROI Charts */}
            <div className="card-chart">
              <div className="sales-chart-title">Ventas en los Últimos 7 días</div>
              <SalesChart />
            </div>

            <div className="card-chart">
              <div className="sales-chart-title">Roi vs ROe</div>
              <ROIChart />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;
