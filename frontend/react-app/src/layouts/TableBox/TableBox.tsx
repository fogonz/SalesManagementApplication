import React, { useEffect, useState, useRef } from 'react';
import './TableBox.css';
import TableComponent from '../../components/Components/TableComponent/TableComponent';
import Calendar from '../../components/Components/Calendar/Calendar';
import ProductDisplay from '../../components/Components/ProductDisplay/ProductDisplay';
import AddButton from '../../assets/AddButton';
import DeleteButton from '../../assets/DeleteButton';
import { fetchCuentas } from '../../services/api/cuentas';
import { fetchTableData } from '../../services/api';
import { getColumnsForActiveView } from '../../config/tableColumns';
import { TableBoxProps, Tabla } from '../../types';
import {
  filterData,
  extractDatesFromSearchTerm,
  getNonDateSearchTerm,
  type MovimientoRow,
  type CuentaRow,
  type ProductoRow,
} from '../../utils/filterUtils';


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
  }, [activeView, cuentas, refreshTrigger]); // <-- Add refreshTrigger here

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
  onCellEdit,
  activeView, 
  setActiveView, 
  refreshTrigger,
  isAdmin,
  onRefresh
}) => {
  // Custom hooks
  const { cuentas, error } = useCuentas();
  const { data, loadData } = useTableData(activeView, cuentas, refreshTrigger);
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

  // Selected Row - JUST ADDED THIS
  const [rowSelected, setRowSelected] = useState<number | null>(null);

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

  // Add this effect to force re-fetch on refreshTrigger
  useEffect(() => {
    loadData();
  }, [refreshTrigger]); // <-- This ensures data is always re-fetched

  // Computed values
  const filteredData = (() => {
    if (activeView === 'cajachica') {
      // Show only movimientos with tipo = "cobranza" or "pago" or any tipo except "factura_venta" and "factura_compra"
      return filterData(
        data.filter(
          (row: any) =>
            row.tipo === 'cobranza' ||
            row.tipo === 'pago' ||
            (row.tipo !== 'factura_venta' && row.tipo !== 'factura_compra')
        ),
        'movimientos',
        searchTerm,
        selectedDates,
        cuentas
      );
    }
    return filterData(data, activeView, searchTerm, selectedDates, cuentas);
  })();
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
              className={`toolbar-icon ${activeView === 'cajachica' ? 'active' : ''}`} 
              onClick={() => setActiveView("cajachica")}
            >
              <i className="fas fa-cash-register" title="Caja Chica"></i>
            </button>
            <button 
              className={`toolbar-icon ${activeView === 'cuentas' ? 'active' : ''}`} 
              onClick={() => {
                setActiveView("cuentas");
                // Debug: log the value to verify
                console.log("Set activeView to:", "cuentas");
              }}
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

          {/* Add & Delete buttons */}
          <div className="toolbar-actions">
            {/*}
            <button
              title={
                activeView === 'movimientos' 
                  ? 'Eliminar Movimiento' 
                  : activeView === 'cuentas' 
                    ? 'Eliminar Cuenta' 
                    : 'Eliminar Producto'
              }
              className="add-button"
              onClick={handleAdd}
            >
              <DeleteButton />
            </button>
            */}
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
              isAdmin={isAdmin}
              onCellEdit={onCellEdit}
            />
          ) : (
            <TableComponent
              rows={filteredData} 
              columns={columns}
              tableType={activeView}
              movimientosData={movimientosData}
              movimientosColumns={movimientosColumns}
              isAdmin={isAdmin}
              rowSelected={rowSelected}
              onCellEdit={onCellEdit}
              onRowSelect={setRowSelected}
              onRefresh={onRefresh}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TableBox;