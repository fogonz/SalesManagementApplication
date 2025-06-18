import React, { useEffect, useState, useRef } from 'react';
import './TableBox.css';
import TableComponent from '../../components/Components/TableComponent/TableComponent';
import Calendar from '../../components/Components/Calendar/Calendar';
import ProductDisplay from '../../components/Components/ProductDisplay/ProductDisplay';
import AddButton from '../../assets/icons/AddButton';
import { fetchCuentas } from '../../services/api/cuentas';
import { fetchTableData } from '../../services/api';
import { getColumnsForActiveView } from '../../config/tableColumns';
import {
  filterData,
  extractDatesFromSearchTerm,
  getNonDateSearchTerm,
  type MovimientoRow,
  type CuentaRow,
  type ProductoRow,
  type Tabla
} from '../../utils/filterUtils';

interface TableBoxProps {
  onOpenMenu: () => void;
  activeView: 'movimientos' | 'cuentas' | 'productos';
  setActiveView: (view: 'movimientos' | 'cuentas' | 'productos') => void;
  refreshTrigger?: number;
}

// Get movimientos columns specifically
const getMovimientosColumns = (cuentas: CuentaRow[]) => {
  return [
    { key: 'id', label: 'ID' },
    { key: 'fecha', label: 'FECHA' },
    { key: 'tipo', label: 'TIPO' },
    { 
      key: 'cuenta', 
      label: 'CUENTA',
      format: (cuenta_id: number) => {
        if (!cuentas || cuentas.length === 0) {
          return 'Cargando...';
        }
        
        const cuenta = cuentas.find(c => c.id === cuenta_id);
        return cuenta ? cuenta.nombre : `ID: ${cuenta_id} (no encontrada)`;
      }
    },
    { key: 'concepto', label: 'CONCEPTO' },
    { key: 'descuento_total', label: 'DESCUENTO', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')},
    { key: 'total', label: 'TOTAL', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')}
  ];
};

// Custom hooks
const useCuentas = () => {
  const [cuentas, setCuentas] = useState<CuentaRow[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadCuentas = async () => {
      try {
        const data = await fetchCuentas();
        setCuentas(data);
      } catch (err) {
        setError("Error al cargar cuentas");
      }
    };
    loadCuentas();
  }, []);

  return { cuentas, error };
};

const useTableData = (activeView: Tabla, cuentas: CuentaRow[], refreshTrigger?: number) => {
  const [data, setData] = useState<MovimientoRow[] | CuentaRow[] | ProductoRow[]>([]);

  const loadData = async () => {
    try {
      const tableData = await fetchTableData(activeView);
      setData(tableData);
    } catch (err) {
      console.error(`Error loading ${activeView} data:`, err);
    }
  };

  useEffect(() => {
    // Solo cargar movimientos si las cuentas ya están cargadas
    if (activeView === 'movimientos' && cuentas.length === 0) {
      return;
    }
    loadData();
  }, [activeView, cuentas]);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && activeView !== 'productos') {
      loadData();
    }
  }, [refreshTrigger, activeView]);

  return { data, loadData };
};

// NEW: Custom hook for movimientos data
const useMovimientosData = () => {
  const [movimientosData, setMovimientosData] = useState<MovimientoRow[]>([]);

  const loadMovimientosData = async () => {
    try {
      const data = await fetchTableData('movimientos');
      setMovimientosData(data as MovimientoRow[]);
      console.log(`MOVIMIENTOS DATA: ${JSON.stringify(data)}`)
    } catch (err) {
      console.error('Error loading movimientos data:', err);
    }
  };

  useEffect(() => {
    loadMovimientosData();
  }, []);

  return { movimientosData, loadMovimientosData };
};

const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleDateSelect = (dates: string[]) => {
    setSelectedDates(dates);
    const nonDateSearchTerm = getNonDateSearchTerm(searchTerm);
    const datesString = dates.length > 0 ? dates.join(' ') : '';
    const newSearchTerm = [nonDateSearchTerm, datesString].filter(Boolean).join(' ');
    setSearchTerm(newSearchTerm);
  };

  const clearDateFilter = () => {
    setSelectedDates([]);
    const nonDateSearchTerm = getNonDateSearchTerm(searchTerm);
    setSearchTerm(nonDateSearchTerm);
  };

  return {
    searchTerm,
    selectedDates,
    handleSearch,
    handleDateSelect,
    clearDateFilter
  };
};

const useCalendar = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  return { showCalendar, setShowCalendar, calendarRef };
};

// Main component
const TableBox: React.FC<TableBoxProps> = ({ 
  onOpenMenu, 
  activeView, 
  setActiveView, 
  refreshTrigger 
}) => {
  // Custom hooks
  const { cuentas, error } = useCuentas();
  const { data } = useTableData(activeView, cuentas, refreshTrigger);
  const { movimientosData } = useMovimientosData();
  const { 
    searchTerm, 
    selectedDates, 
    handleSearch, 
    handleDateSelect, 
    clearDateFilter 
  } = useSearch();
  const { showCalendar, setShowCalendar, calendarRef } = useCalendar();
  
  // Refs
  const productDisplayRef = useRef<any>(null);

  // Event handlers
  const handleAdd = () => {
    onOpenMenu();
  };

  const handleRefreshProducts = () => {
    if (productDisplayRef.current && productDisplayRef.current.refreshData) {
      productDisplayRef.current.refreshData();
    }
  };

  // Refresh effect for products
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && activeView === 'productos') {
      handleRefreshProducts();
    }
  }, [refreshTrigger, activeView]);

  // Computed values
  const filteredData = filterData(data, activeView, searchTerm, selectedDates, cuentas);
  const columns = getColumnsForActiveView(activeView, cuentas);
  const movimientosColumns = getMovimientosColumns(cuentas);

  return (
    <div className="content-container">
      <div className="content-box">
        {/* Toolbar */}
        <div className="toolbar">
          {/* Navigation */}
          <div className="toolbar-nav">
            <button 
              className={`toolbar-icon ${activeView === 'movimientos' ? 'active' : ''}`} 
              onClick={() => setActiveView("movimientos")}
            >
              <i className="fas fa-home" title="Movimientos"></i>
            </button>
            <button 
              className={`toolbar-icon ${activeView === 'cuentas' ? 'active' : ''}`} 
              onClick={() => setActiveView("cuentas")}
            >
              <i className="fas fa-circle-user" title="Cuentas"></i>
            </button>
            <button 
              className={`toolbar-icon ${activeView === 'productos' ? 'active' : ''}`} 
              onClick={() => setActiveView("productos")}
            >
              <i className="fas fa-boxes" title="Productos"></i>
            </button>
          </div>

          {/* Search container */}
          <div className="search-container">
            {/* Calendar button */}
            <div 
              className="toolbar-icon" 
              onClick={() => setShowCalendar(!showCalendar)} 
              style={{ position: 'relative' }}
            >
              <i className="fas fa-table"></i>
              {showCalendar && (
                <div className="calendar-popup-left" ref={calendarRef}>
                  <Calendar onDateSelect={handleDateSelect} />
                </div>
              )}
            </div>

            {/* Search input */}
            <input
              type="text"
              className="search-input"
              placeholder="Buscar en todos los campos..."
              value={searchTerm}
              onChange={handleSearch}
            />

            {/* Search button */}
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
            
            {/* Clear dates button */}
            {selectedDates.length > 0 && (
              <button 
                className="clear-dates-btn" 
                onClick={clearDateFilter}
                title="Limpiar fechas seleccionadas"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Add button */}
          <div className="toolbar-actions">
            <button
              title={
                activeView === 'movimientos' 
                  ? 'Agregar Movimiento' 
                  : activeView === 'cuentas' 
                    ? 'Agregar Cuenta' 
                    : 'Agregar Producto'
              }
              className="add-button"
              onClick={handleAdd}
            >
              <AddButton />
            </button>
          </div>
        </div>

        {/* Table container */}
        <div id="table-container">
          {activeView === 'productos' ? (
            <ProductDisplay 
              ref={productDisplayRef} 
              searchTerm={searchTerm} 
              refreshTrigger={refreshTrigger}
            />
          ) : (
            <TableComponent 
              rows={filteredData} 
              columns={columns} 
              tableType={activeView}
              movimientosData={movimientosData}
              movimientosColumns={movimientosColumns}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TableBox;