import React, { useState, useEffect } from 'react';
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
import PieChartExpenses from '../../components/Charts/SalesChart/SalesChart';

const Admin = () => {
  const [selectedFilter, setSelectedFilter] = useState('Esta Semana');
  const [expensesData, setExpensesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState(null);
  
  const ingreso = 400000;
  const egresoTotal = expensesData.reduce((sum, item) => sum + item.value, 0);

  const performanceData = [];

  const filterOptions = ['Esta Semana', 'Este Mes', 'Este Año'];

  // Function to fetch and process expenses data
  const fetchExpensesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/movimientos/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter by the specified expense types
      const expenseTypes = ['pago', 'sueldo', 'aguinaldo', 'impuestos', 'jornal', 'alquiler'];
      const filteredData = data.filter(item => expenseTypes.includes(item.tipo));
      
      // Group by tipo and sum the totals
      const groupedExpenses: Record<string, number> = filteredData.reduce((acc, item) => {
        const tipo = item.tipo;
        const total = parseFloat(item.total);
        
        if (acc[tipo]) {
          acc[tipo] += total;
        } else {
          acc[tipo] = total;
        }
        
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate total for percentages
      const totalAmount = Object.values(groupedExpenses).reduce((sum: number, value: number) => sum + value, 0);
      
      // Convert to chart format
      const chartData = Object.entries(groupedExpenses).map(([tipo, value]: [string, number]) => ({
        name: tipo.charAt(0).toUpperCase() + tipo.slice(1), // Capitalize first letter
        value: value,
        percentage: totalAmount > 0 ? Math.round((value / totalAmount) * 100) : 0
      }));
      
      setExpensesData(chartData);
      
    } catch (err) {
      console.error('Error fetching expenses data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch and process product data
  const fetchProductData = async () => {
    try {
      setProductLoading(true);
      setProductError(null);
      
      // Use the sales per product endpoint
      const response = await fetch('http://localhost:8000/api/ventas-producto/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the data to match the expected format for ProductChart
      const processedData = data
        .map(item => ({
          name: item.nombre_producto, // Map from API response
          ventas: parseFloat(item.total_vendido) // Map from API response
        }))
        .sort((a, b) => b.ventas - a.ventas) // Sort by sales descending
        .slice(0, 6); // Take top 6 products
      
      setProductData(processedData);
      
    } catch (err) {
      console.error('Error fetching product data:', err);
      setProductError(err.message);
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesData();
    fetchProductData();
  }, []);

  // Refetch data when filter changes
  useEffect(() => {
    fetchExpensesData();
    fetchProductData();
  }, [selectedFilter]);

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
              <Datachart ingreso={ingreso} egreso={egresoTotal} />
              <PerformanceGrid performanceData={performanceData} />
            </div>

            <div className="right-side-wrapper">
              <div className='cards-container'>
                <div className='cards-row'>
                  <PieChartExpenses 
                    data={expensesData}
                    title="Distribución de Gastos"
                    noDataMessage={loading ? "Cargando datos..." : error ? `Error: ${error}` : "No hay gastos disponibles"}
                  />
                  <ProductChart 
                    data={productData}
                    title="Productos Más Vendidos"
                    noDataMessage={productLoading ? "Cargando productos..." : productError ? `Error: ${productError}` : "No hay productos disponibles"}
                  />
                </div>
                <ROIChart data={[]} />
                <TotalSales amount={0} />
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