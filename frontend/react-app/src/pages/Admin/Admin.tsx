import React, { useState, useEffect, useMemo } from 'react';
import './Admin.css';

// Importaciones de componentes de layout
import SideBar from '../../layouts/SideBar/SideBar';
import TableBox from '../../layouts/TableBox/TableBox';

// Importaciones de componentes de gráficos
import ROIChart from '../../components/Charts/ROIChart/ROIChart';
import ProductChart from '../../components/Charts/ProductChart/ProductChart';
import SalesChart from '../../components/Charts/SalesChart/SalesChart';
import Datachart from '../../components/Charts/Datachart/Datachart';
import TotalSales from '../../components/Charts/TotalSales/TotalSales';
import PieChartExpenses from '../../components/Charts/SalesChart/SalesChart';

// Importaciones de componentes de interfaz
import PerformanceGrid from '../../components/Components/PerformanceGrid/PerformanceGrid';
import Alerts from '../../components/Components/Alerts/Aletrs';
import SidebarPanel from '../../components/Components/SidebarPanel/SidebarPanel';
import FilterButton from '../../components/Components/FilterButton/FilterButton';
import ChatDisplay from '../../components/Components/Chat/Chat';

// Importaciones de menús modales
import Transaction from '../../layouts/menus/NewTransaction/NewTransaction';
import NewAccount from '../../layouts/menus/NewAccount/NewAccount';
import NewProduct from '../../layouts/menus/NewProduct/NewProduct';
import { ConfirmChangesMenu } from '../../layouts/menus/ConfirmChanges/ConfirmChangesMenu';

// Importaciones de contextos y servicios
import { useData, DataProvider } from '../../contexts/DataContext';
import { filterData } from '../../utils/filterUtils';
import { fetchTableData } from '../../services/api';

// ========== DEFINICIÓN DE TIPOS ==========
type Tabla = "movimientos" | "cuentas" | "productos";
type Menu = 'transaction' | 'account' | 'product' | 'confirmChanges' | null;
type AdminView = 'estadisticas' | 'historial' | 'movimientos' | 'cuentas' | 'productos' | 'exportar' | 'chat' | 'linkDevice';

// Interfaz para props del componente
interface AdminProps {
  activeView: Tabla;
  setActiveView: (view: Tabla) => void;
  openMenu: Menu;
  setOpenMenu: (menu: Menu) => void;
}

// Interfaz para datos agrupados
interface GroupedData {
  [key: string]: {
    sales: number;
    revenue: number;
  };
}

interface CellEditParams {
  rowId: number;
  field: any;
  newValue: number | string;
  prevValue?: number | string; // Add prevValue to store the original value
}

// ========== COMPONENTE PRINCIPAL ==========
const Admin: React.FC<AdminProps> = ({ activeView, setActiveView, openMenu, setOpenMenu }) => {
  
  // ========== ESTADOS LOCALES ==========
  // Control de vista activa del admin
  const [currentAdminView, setCurrentAdminView] = useState<AdminView>('estadisticas');
  
  // Control de refrescar datos
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Estados para datos de ROI
  const [roiChartData, setRoiChartData] = useState<{  }[]>([]);
  const [loadingRoiData, setLoadingRoiData] = useState(false);
  const [roiError, setRoiError] = useState("");
  
  // Estados para movimientos
  const [movimientosData, setMovimientosData] = useState<any[]>([]);
  const [loadingMovs, setLoadingMovs] = useState(true);
  const [movsError, setMovsError] = useState("");

  // Estado para almacenar los datos de la celda editada
  const [cellEditData, setCellEditData] = useState<CellEditParams | null>(null);

  const filterOptions = ['Esta Semana', 'Este Mes', 'Este Año'];

  // ========== CONTEXTO DE DATOS ==========
  const {
    expensesData,
    expensesLoading,
    expensesError,
    productData,
    productLoading,
    productError,
    ventasData,
    ventasLoading,
    ventasError,
    selectedFilter,
    setSelectedFilter,
    egresoTotal,
    refreshData
  } = useData();

  // ========== HANDLERS DE MENÚS ==========
  // Abrir menú específico
  const open = (menu: Exclude<Menu, null>) => setOpenMenu(menu);
  
  // Cerrar menú actual
  const close = () => {
    setOpenMenu(null);
    setCellEditData(null);
  };

  // Manejar edición de celda
  const handleCellEdit = (params: CellEditParams) => {
    console.log('Se editó una celda:', params);
    // Make sure we have both prevValue and newValue
    const editData: CellEditParams = {
      rowId: params.rowId,
      field: params.field,
      prevValue: params.prevValue, // This should be the original value
      newValue: params.newValue,   // This should be the new value
    };
    console.log('Edit data:', {
      original: editData.prevValue,
      new: editData.newValue
    });
  
    setCellEditData(editData);
    open('confirmChanges');
  };

  // Manejar aceptación de transacción
  const handleAcceptTransaction = () => {
    console.log("Transacción aceptada");
    close();
    setRefreshTrigger(prev => prev + 1);
  };

  // Manejar aceptación de cuenta
  const handleAcceptAccount = () => {
    console.log("Cuenta guardada");
    close();
    setRefreshTrigger(prev => prev + 1);
  };

  // Manejar aceptación de producto
  const handleAcceptProduct = () => {
    console.log("Producto guardado");
    close();
    setRefreshTrigger(prev => prev + 1);
  };

  // Manejar confirmación de cambios en celda
  const handleConfirmChanges = () => {
    if (cellEditData) {
      console.log("Cambios confirmados:", cellEditData);
      // Aquí puedes agregar la lógica para guardar los cambios
      // Por ejemplo, hacer una llamada a la API
    }
    close();
    setRefreshTrigger(prev => prev + 1);
  };

  // Manejar cancelación de cambios
  const handleCancelChanges = () => {
    console.log("Cambios cancelados");
    close();
  };

  // Manejar cambio de filtro
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    console.log('Filtro seleccionado:', filter);
  };

  // ========== RENDERIZADO CONDICIONAL ==========
  // Función para renderizar contenido según vista activa
  const renderContent = () => {
    switch (currentAdminView) {
      // Vista de estadísticas con dashboard completo
      case 'estadisticas':
        return (
          <div className="dashboard-container">
            {/* Botón de filtros */}
            <FilterButton
              selectedFilter={selectedFilter}
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
            />

            <div className="content-and-sidebar">
              {/* Contenido principal del dashboard */}
              <div className="dashboard-main-wrapper">
                <Datachart ingreso={useData().ingreso} egreso={useData().egresoTotal} />
                <PerformanceGrid performanceData={[]} />
              </div>

              {/* Panel lateral con gráficos */}
              <div className="right-side-wrapper">
                <div className='cards-container'>
                  <div className='cards-row'>
                    {/* Gráfico de gastos */}
                    <PieChartExpenses 
                      data={expensesData}
                      title="Distribución de Gastos"
                      noDataMessage={
                        expensesLoading ? "Cargando datos..." : 
                        expensesError ? `Error: ${expensesError}` : 
                        "No hay gastos disponibles"
                      }
                    />
                    {/* Gráfico de productos */}
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
                  {/* Gráfico de ROI */}
                  <ROIChart 
                    data={roiChartData}
                    noDataMessage={
                      loadingMovs ? "Cargando datos de ROI..." : 
                      movsError ? `Error: ${movsError}` : 
                      "No hay datos de ROI disponibles"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      // Vista de historial (placeholder)
      case 'historial':
        return (
          <div className="dashboard-container">
            <h2>Historial de Movimientos</h2>
            <p>Contenido del historial de movimientos...</p>
          </div>
        );
      
      // Vistas de tablas (movimientos, cuentas, productos)
      case 'movimientos':
      case 'cuentas':
      case 'productos':
        const tableActiveView: Tabla = currentAdminView as Tabla;
        return (
          <div className={`dashboard-container ${openMenu ? "blurred" : ""}`}>
            <TableBox
              onCellEdit={handleCellEdit}
              isAdmin={true}
              activeView={tableActiveView}
              setActiveView={(view) => {
                setActiveView(view);
                setCurrentAdminView(view);
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
      
      // Vista de exportación
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
      
      // Vista de chat
      case 'chat':
        return (
          <div className="dashboard-container chat-container-wrapper">
            <ChatDisplay />
          </div>
        );
      
      // Vista por defecto
      default:
        return null;
    }
  };

  // ========== RENDERIZADO PRINCIPAL ==========
  return (
    <div className='app-wrapper'>
      <div className='admin-container'>
        {/* Barra lateral de navegación */}
        <SideBar 
          currentSection='admin' 
          activeView={''} 
          setActiveView={setActiveView}
          currentAdminView={currentAdminView}
          setCurrentAdminView={setCurrentAdminView}
        />
        
        {/* Contenido principal */}
        <main>
          <>
            <Alerts Alerts={Alerts} />
            {renderContent()}
          </>
        </main>
      </div>

      {/* ========== MODALES ==========*/}
      {/* Modal de nueva transacción */}
      {openMenu === 'transaction' && (
        <Transaction onClose={close} onAccept={handleAcceptTransaction} />
      )}
      
      {/* Modal de nueva cuenta */}
      {openMenu === 'account' && (
        <NewAccount onClose={close} onAccept={handleAcceptAccount} />
      )}
      
      {/* Modal de nuevo producto */}
      {openMenu === 'product' && (
        <NewProduct onClose={close} onAccept={handleAcceptProduct} />
      )}

      {/* Modal confirmar cambios en cell edit */}
      {openMenu === 'confirmChanges' && cellEditData && (
        <ConfirmChangesMenu
          onClose={close}
          onAccept={handleConfirmChanges}
          prevValue={cellEditData.prevValue || ''}
          newValue={cellEditData.newValue}
          rowId={cellEditData.rowId}
          field={cellEditData.field}
        />
      )}
    </div>
  );
};

export default Admin;