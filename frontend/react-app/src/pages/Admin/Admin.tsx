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
import PieChartExpenses from '../../components/Charts/SalesChart/SalesChart';
import { useData } from '../../contexts/DataContext';
import TableBox from '../../components/TableBox/TableBox';
import Transaction from '../../layouts/menus/NewTransaction/NewTransaction';
import NewAccount from '../../layouts/menus/NewAccount/NewAccount';
import NewProduct from '../../layouts/menus/NewProduct/NewProduct';

type Tabla = "movimientos" | "cuentas" | "productos";
type Menu = 'transaction' | 'account' | 'product' | null;
type AdminView = 'estadisticas' | 'historial' | 'movimientos' | 'cuentas' | 'productos' | 'exportar';

interface AdminProps {
  activeView: Tabla;
  setActiveView: (view: Tabla) => void;
  openMenu: Menu;
  setOpenMenu: (menu: Menu) => void;
}

const Admin: React.FC<AdminProps> = ({ activeView, setActiveView, openMenu, setOpenMenu }) => {
  // Estado para controlar qué vista del admin está activa
  const [currentAdminView, setCurrentAdminView] = useState<AdminView>('estadisticas');
  // Refresh Trigger para cuando se acepta un movimiento
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Usar el contexto de datos
  const {
    expensesData,
    expensesLoading,
    expensesError,
    productData,
    productLoading,
    productError,
    selectedFilter,
    setSelectedFilter,
    ingreso,
    egresoTotal,
    refreshData
  } = useData();

  const performanceData: any[] = [];
  const filterOptions = ['Esta Semana', 'Este Mes', 'Este Año'];

  // Functions to handle menu actions
  const open = (menu: Exclude<Menu, null>) => setOpenMenu(menu);
  const close = () => setOpenMenu(null);

  const handleAcceptTransaction = () => {
    console.log("Transacción aceptada");
    close();
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAcceptAccount = () => {
    console.log("Cuenta guardada");
    close();
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAcceptProduct = () => {
    console.log("Producto guardado");
    close();
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    console.log('Filtro seleccionado:', filter);
  };

  // Función para renderizar el contenido según la vista activa
  const renderContent = () => {
    switch (currentAdminView) {
      case 'estadisticas':
        return (
          <div className="dashboard-container">
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
                      noDataMessage={
                        expensesLoading ? "Cargando datos..." : 
                        expensesError ? `Error: ${expensesError}` : 
                        "No hay gastos disponibles"
                      }
                    />
                    <ProductChart 
                      data={productData}
                      title="Productos Más Vendidos"
                      noDataMessage={
                        productLoading ? "Cargando productos..." : 
                        productError ? `Error: ${productError}` : 
                        "No hay productos disponibles"
                      }
                    />
                  </div>
                  {/*<ROIChart data={[]} />*/}
                  <TotalSales amount={0} />
                </div>

                <SidebarPanel title="Panel de Control" />
              </div>
            </div>
          </div>
        );
      
      case 'historial':
        return (
          <div className="dashboard-container">
            <h2>Historial de Movimientos</h2>
            <p>Contenido del historial de movimientos...</p>
          </div>
        );
      
      case 'movimientos':
      case 'cuentas':
      case 'productos':
        // Use the same TableBox component for all three views
        // Convert currentAdminView to the appropriate activeView
        const tableActiveView: Tabla = currentAdminView as Tabla;
        return (
          <div className={`dashboard-container ${openMenu ? "blurred" : ""}`}>
            <TableBox
              activeView={tableActiveView}
              setActiveView={(view) => {
                setActiveView(view);
                setCurrentAdminView(view); // Keep both states in sync
              }}
              refreshTrigger={refreshTrigger}
              onOpenMenu={() => open(
                tableActiveView === 'movimientos' ? 'transaction' : 
                tableActiveView === 'cuentas' ? 'account' : 
                tableActiveView === 'productos' ? 'product' :
                'transaction'
              )}
            />
          </div>
        );
      
      case 'exportar':
        return (
          <div className="dashboard-container">
            <h2>Exportar a Excel</h2>
            <p>Opciones de exportación...</p>
            <button onClick={refreshData}>
              Refrescar Datos
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className='app-wrapper'>
      <div className='admin-container'>
        <SideBar 
          currentSection='admin' 
          activeView={''} 
          setActiveView={setActiveView}
          currentAdminView={currentAdminView}
          setCurrentAdminView={setCurrentAdminView}
        />
        <main>
          <Alerts Alerts={Alerts} />
          <div>{renderContent()}</div>
        </main>
      </div>


      {/* Render modals based on openMenu - same as in Home component */}
      {openMenu === 'transaction' && (
        <Transaction onClose={close} onAccept={handleAcceptTransaction} />
      )}
      {openMenu === 'account' && (
        <NewAccount onClose={close} onAccept={handleAcceptAccount} />
      )}
      {openMenu === 'product' && (
        <NewProduct onClose={close} onAccept={handleAcceptProduct} />
      )}
    </div>
  );
};

export default Admin;