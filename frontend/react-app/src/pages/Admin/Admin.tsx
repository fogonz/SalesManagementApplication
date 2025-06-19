import React, { useState, useEffect, useMemo } from 'react';
import './Admin.css';
import SideBar from '../../layouts/SideBar/SideBar';
import ROIChart from '../../components/Charts/ROIChart/ROIChart';
import ProductChart from '../../components/Charts/ProductChart/ProductChart';
import SalesChart from '../../components/Charts/SalesChart/SalesChart';
import Datachart from '../../components/Charts/Datachart/Datachart';
import PerformanceGrid from '../../components/Components/PerformanceGrid/PerformanceGrid';
import Alerts from '../../components/Components/Alerts/Aletrs';
import SidebarPanel from '../../components/Components/SidebarPanel/SidebarPanel';
import FilterButton from '../../components/Components/FilterButton/FilterButton';
import TotalSales from '../../components/Charts/TotalSales/TotalSales';
import PieChartExpenses from '../../components/Charts/SalesChart/SalesChart';
import { useData } from '../../contexts/DataContext';
import TableBox from '../../layouts/TableBox/TableBox';
import Transaction from '../../layouts/menus/NewTransaction/NewTransaction';
import NewAccount from '../../layouts/menus/NewAccount/NewAccount';
import NewProduct from '../../layouts/menus/NewProduct/NewProduct';
import ChatDisplay from '../../components/Components/Chat/Chat';
import { filterData } from '../../utils/filterUtils';
import { fetchTableData } from '../../services/api';

type Tabla = "movimientos" | "cuentas" | "productos";
type Menu = 'transaction' | 'account' | 'product' | null;
type AdminView = 'estadisticas' | 'historial' | 'movimientos' | 'cuentas' | 'productos' | 'exportar' | 'chat';

interface AdminProps {
  activeView: Tabla;
  setActiveView: (view: Tabla) => void;
  openMenu: Menu;
  setOpenMenu: (menu: Menu) => void;
}

interface GroupedData {
  [key: string]: {
    sales: number;
    revenue: number;
  };
}

const Admin: React.FC<AdminProps> = ({ activeView, setActiveView, openMenu, setOpenMenu }) => {
  // Estado para controlar qué vista del admin está activa
  const [currentAdminView, setCurrentAdminView] = useState<AdminView>('estadisticas');
  // Refresh Trigger para cuando se acepta un movimiento
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [roiChartData, setRoiChartData] = useState<{ date: string; sales: number; revenue: number }[]>([]);
  const [loadingRoiData, setLoadingRoiData] = useState(false);
  const [roiError, setRoiError] = useState("");
  
  // Estados para movimientos
  const [movimientosData, setMovimientosData] = useState<any[]>([]);
  const [loadingMovs, setLoadingMovs] = useState(true);
  const [movsError, setMovsError] = useState("");

  // Calculate ingreso from roiChartData
  const calculatedIngreso = useMemo(() => {
    return roiChartData.reduce((total, item) => total + item.sales, 0);
  }, [roiChartData]);

  // Función para procesar datos de movimientos
  const processMovimientosData = (movimientos: any[]): { date: string; sales: number; revenue: number }[] => {
    // Filtrar solo movimientos de tipo factura_venta
    const ventasMovimientos = movimientos.filter(mov => mov.tipo === 'factura_venta');
    
    // Agrupar por fecha y sumar los montos - now with proper typing
    const groupedByDate: GroupedData = ventasMovimientos.reduce((acc: GroupedData, mov) => {
      const fecha = mov.fecha ? new Date(mov.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const monto = parseFloat(mov.total) || 0;
      
      if (!acc[fecha]) {
        acc[fecha] = { sales: 0, revenue: 0 };
      }
      
      acc[fecha].sales += monto;
      acc[fecha].revenue += monto; // Para ventas, sales y revenue son el mismo valor
      
      return acc;
    }, {});
    
    // Convertir a array y ordenar por fecha
    return Object.entries(groupedByDate)
      .map(([date, values]) => ({
        date,
        sales: values.sales,
        revenue: values.revenue
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Fetch de movimientos una vez montado
  useEffect(() => {
    const fetchMovs = async () => {
      try {
        setLoadingMovs(true);
        const data = await fetchTableData("movimientos");
        setMovimientosData(data);
        
        // Procesar datos para ROI Chart
        const processedData = processMovimientosData(data);
        setRoiChartData(processedData);
      } catch (err) {
        console.error("Error al obtener movimientos:", err);
        setMovsError("Error al cargar movimientos");
      } finally {
        setLoadingMovs(false);
      }
    };

    fetchMovs();
  }, [refreshTrigger]);

  // Usar el contexto de datos (excluding ingreso since we calculate it from ROI data)
  const {
    expensesData,
    expensesLoading,
    expensesError,
    productData,
    productLoading,
    productError,
    selectedFilter,
    setSelectedFilter,
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
                <Datachart ingreso={calculatedIngreso} egreso={egresoTotal} />
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
                  <ROIChart 
                    data={roiChartData}
                    noDataMessage={
                      loadingMovs ? "Cargando datos de ROI..." : 
                      movsError ? `Error: ${movsError}` : 
                      "No hay datos de ROI disponibles"
                    }
                  />
                  <TotalSales amount={calculatedIngreso} />
                </div>
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
      
      case 'chat':
        return (
          <div className="dashboard-container chat-container-wrapper">
            <ChatDisplay />
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
          <>
            <Alerts Alerts={Alerts} />
            {renderContent()}
          </>
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