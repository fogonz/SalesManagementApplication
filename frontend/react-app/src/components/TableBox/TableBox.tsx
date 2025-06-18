import React, { useEffect, useState, useRef } from 'react';
import './TableBox.css';
import TableComponent from '../TableComponent/TableComponent';
import Calendar from '../Calendar/Calendar';
import ProductDisplay from '../ProductDisplay/ProductDisplay';
import AddButton from '../../assets/icons/AddButton';

// Types
type Tabla = 'movimientos' | 'cuentas' | 'productos';

interface TableBoxProps {
  onOpenMenu: () => void;
  activeView: 'movimientos' | 'cuentas' | 'productos';
  setActiveView: (view: 'movimientos' | 'cuentas' | 'productos') => void;
  refreshTrigger?: number;
}

interface MovimientoRow {
  id: number;
  fecha: string;
  tipo: string;
  cuenta: number; // Changed from cuenta_id to cuenta
  total: string | number | null;
  descuento_total?: string | number | null;
  concepto?: string;
  cantidad_productos?: number;
  items?: { nombre_producto: string; precio_unitario: string; cantidad: string; descuento_item: string }[];
}

interface CuentaRow {
  id: number;
  nombre: string;
  contacto_mail: string;
  contacto_telefono: string;
  tipo_cuenta: string;
  monto?: number | null;
}

interface ProductoRow {
  id: number;
  descripcion: string;
  stock: number | null;
  precio: number | null;
}

// Utility functions
const normalizeText = (text: any): string => {
  if (text === null || text === undefined) return '';
  const str = String(text);
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const extractDatesFromSearchTerm = (term: string): string[] => {
  const datePattern = /\b\d{4}-\d{2}-\d{2}\b/g;
  const matches = term.match(datePattern);
  return matches || [];
};

const getNonDateSearchTerm = (term: string): string => {
  return term.replace(/\b\d{4}-\d{2}-\d{2}\b/g, '').replace(/\s+/g, ' ').trim();
};

// Configuration functions
const getColumnsForActiveView = (activeView: Tabla, cuentas: CuentaRow[]) => {
  switch (activeView) {
    case 'movimientos':
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
            console.log(`cuenta_id: ${cuenta_id}, cuenta encontrada:`, cuenta);
            
            return cuenta ? cuenta.nombre : `ID: ${cuenta_id} (no encontrada)`;
          }
        },
        { key: 'concepto', label: 'CONCEPTO' },
        { key: 'descuento_total', label: 'DESCUENTO', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')},
        { key: 'total', label: 'TOTAL', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')}
      ];
    case 'cuentas':
      return [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'NOMBRE' },
        { key: 'contacto_mail', label: 'E-MAIL'},
        { key: 'contacto_telefono', label: 'TELÉFONO' },
        { key: 'tipo_cuenta', label: 'TIPO de CUENTA'},
        { key: 'monto', label: 'MONTO', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')}
      ];
    case 'productos':
      return [];
    default:
      return [];
  }
};

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

// Filter functions
const filterMovimientos = (item: MovimientoRow, normalizedSearchTerm: string, cuentas: CuentaRow[]): boolean => {
  const cuenta = cuentas.find(c => c.id === item.cuenta); // Changed from cuenta_id to cuenta
  const cuentaNombre = cuenta ? cuenta.nombre : '';
  
  return (
    normalizeText(item.id).includes(normalizedSearchTerm) ||
    normalizeText(item.fecha).includes(normalizedSearchTerm) ||
    normalizeText(item.tipo).includes(normalizedSearchTerm) ||
    normalizeText(item.cuenta).includes(normalizedSearchTerm) || // Changed from cuenta_id to cuenta
    normalizeText(cuentaNombre).includes(normalizedSearchTerm) ||
    normalizeText(item.concepto).includes(normalizedSearchTerm) ||
    normalizeText(item.total).includes(normalizedSearchTerm) ||
    normalizeText(item.descuento_total).includes(normalizedSearchTerm)
  );
};

const filterCuentas = (item: CuentaRow, normalizedSearchTerm: string): boolean => {
  return (
    normalizeText(item.id).includes(normalizedSearchTerm) ||
    normalizeText(item.nombre).includes(normalizedSearchTerm) ||
    normalizeText(item.contacto_mail).includes(normalizedSearchTerm) ||
    normalizeText(item.contacto_telefono).includes(normalizedSearchTerm) ||
    normalizeText(item.tipo_cuenta).includes(normalizedSearchTerm) ||
    normalizeText(item.monto).includes(normalizedSearchTerm)
  );
};

const filterProductos = (item: ProductoRow, normalizedSearchTerm: string): boolean => {
  return (
    normalizeText(item.id).includes(normalizedSearchTerm) ||
    normalizeText(item.descripcion).includes(normalizedSearchTerm) ||
    normalizeText(item.stock).includes(normalizedSearchTerm) ||
    normalizeText(item.precio).includes(normalizedSearchTerm)
  );
};

const filterData = (
  data: any[], 
  activeView: Tabla, 
  searchTerm: string, 
  selectedDates: string[], 
  cuentas: CuentaRow[]
): any[] => {
  return data.filter(item => {
    const nonDateSearchTerm = getNonDateSearchTerm(searchTerm);
    const datesInSearchTerm = extractDatesFromSearchTerm(searchTerm);
    const normalizedSearchTerm = normalizeText(nonDateSearchTerm);
    
    // Date filter logic
    const allDatesToFilter = [...selectedDates, ...datesInSearchTerm];
    const dateMatch =
      allDatesToFilter.length === 0 ||
      (activeView === 'movimientos' && allDatesToFilter.includes(item.fecha));

    if (!dateMatch) return false;
    if (!nonDateSearchTerm) return true;

    // Search logic based on active view
    switch (activeView) {
      case 'movimientos':
        return filterMovimientos(item, normalizedSearchTerm, cuentas);
      case 'cuentas':
        return filterCuentas(item, normalizedSearchTerm);
      case 'productos':
        return filterProductos(item, normalizedSearchTerm);
      default:
        return false;
    }
  });
};

// API functions
const fetchCuentas = async (): Promise<CuentaRow[]> => {
  try {
    const response = await fetch(`http://localhost:8000/api/cuentas`);
    const data = await response.json();
    console.log("CUENTAS:", data);
    return data;
  } catch (err) {
    console.error(`Error al cargar cuentas:`, err);
    throw new Error("Error al cargar cuentas");
  }
};

const fetchTableData = async (activeView: Tabla): Promise<any[]> => {
  try {
    const response = await fetch(`http://localhost:8000/api/${activeView}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Error al cargar ${activeView}:`, err);
    throw err;
  }
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