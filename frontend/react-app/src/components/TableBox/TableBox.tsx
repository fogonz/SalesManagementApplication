import React, { useEffect, useState, useRef } from 'react';
import './TableBox.css';
import TableComponent from '../TableComponent/TableComponent';
import Calendar from '../Calendar/Calendar';
import ProductDisplay from '../ProductDisplay/ProductDisplay';
import AddButton from '../../assets/icons/AddButton';

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
  cuenta: number;
  total: string | number | null;
  descuento_total?: string | number | null;
  concepto?: string;
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

const TableBox: React.FC<TableBoxProps> = ({ onOpenMenu, activeView, setActiveView, refreshTrigger }) => {
  const [data, setData] = useState<MovimientoRow[] | CuentaRow[] | ProductoRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const calendarRef = useRef<HTMLDivElement>(null);
  const productDisplayRef = useRef<any>(null);
  const [error, setError] = useState<string>("");
  const [cuentas, setCuentas] = useState<CuentaRow[]>([]);

  // Fetch: Table Cuentas
  useEffect(() => {
      const fetchAccounts = async () => {
          try {
              const responseAccounts = await fetch(`http://localhost:8000/api/cuentas`);
              const jsonAccounts = await responseAccounts.json();
              setCuentas(jsonAccounts)
              console.log("CUENTAS:")
              console.log(jsonAccounts)
          } catch(err) {
              console.error(`Error al cargar cuentas:`, err);
              setError("Error al cargar cuentas");
          }
      };
      fetchAccounts();
  }, []);

  const getColumnsForActiveView = () => {
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
              // Si las cuentas aún no se han cargado, mostrar "Cargando..."
              if (!cuentas || cuentas.length === 0) {
                return 'Cargando...';
              }
              
              const cuenta = cuentas.find(c => c.id === cuenta_id);
              console.log(`cuenta_id: ${cuenta_id}, cuenta encontrada:`, cuenta);
              
              return cuenta ? cuenta.nombre : `ID: ${cuenta_id} (no encontrada)`;
            }
          },
          { key: 'concepto', label: 'CONCEPTO' },
          { key: 'total', label: 'TOTAL', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')},
          { key: 'descuento_total', label: 'DESCUENTO', format: (value: any) => (value ? `${parseFloat(value).toFixed(2)}` : '-')}
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
  
  const handleAdd = () => {
    if (activeView === 'movimientos') return onOpenMenu();
    if (activeView === 'cuentas') return onOpenMenu();
    if (activeView === 'productos') return onOpenMenu();
  };

  const normalizeText = (text: any): string => {
    if (text === null || text === undefined) return '';
    const str = String(text); // Convert numbers to strings
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredData = (data as any[]).filter(item => {
    const normalizedSearchTerm = normalizeText(searchTerm);
    
    // Date filter logic
    const dateMatch =
      selectedDates.length === 0 ||
      (activeView === 'movimientos' && selectedDates.includes(item.fecha));

    if (!dateMatch) return false;

    // If no search term, return items that pass date filter
    if (!searchTerm.trim()) return true;

    // Search logic based on active view
    if (activeView === 'movimientos') {
      const mov = item as MovimientoRow;
      // Get account name for search
      const cuenta = cuentas.find(c => c.id === mov.cuenta);
      const cuentaNombre = cuenta ? cuenta.nombre : '';
      
      return (
        normalizeText(mov.id).includes(normalizedSearchTerm) ||
        normalizeText(mov.fecha).includes(normalizedSearchTerm) ||
        normalizeText(mov.tipo).includes(normalizedSearchTerm) ||
        normalizeText(mov.cuenta).includes(normalizedSearchTerm) ||
        normalizeText(cuentaNombre).includes(normalizedSearchTerm) ||
        normalizeText(mov.concepto).includes(normalizedSearchTerm) ||
        normalizeText(mov.total).includes(normalizedSearchTerm) ||
        normalizeText(mov.descuento_total).includes(normalizedSearchTerm)
      );
    }

    if (activeView === 'cuentas') {
      const cta = item as CuentaRow;
      return (
        normalizeText(cta.id).includes(normalizedSearchTerm) ||
        normalizeText(cta.nombre).includes(normalizedSearchTerm) ||
        normalizeText(cta.contacto_mail).includes(normalizedSearchTerm) ||
        normalizeText(cta.contacto_telefono).includes(normalizedSearchTerm) ||
        normalizeText(cta.tipo_cuenta).includes(normalizedSearchTerm) ||
        normalizeText(cta.monto).includes(normalizedSearchTerm)
      );
    }

    if (activeView === 'productos') {
      const prod = item as ProductoRow;
      return (
        normalizeText(prod.id).includes(normalizedSearchTerm) ||
        normalizeText(prod.descripcion).includes(normalizedSearchTerm) ||
        normalizeText(prod.stock).includes(normalizedSearchTerm) ||
        normalizeText(prod.precio).includes(normalizedSearchTerm)
      );
    }

    return false;
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/${activeView}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(`Error al cargar ${activeView}:`, err);
    }
  };

  const handleDateSelect = (dates: string[]) => {
    setSelectedDates(dates);
  };

  const clearDateFilter = () => {
    setSelectedDates([]);
  };

  useEffect(() => {
    // Solo cargar movimientos si las cuentas ya están cargadas
    if (activeView === 'movimientos' && cuentas.length === 0) {
      return; // No cargar movimientos hasta tener las cuentas
    }
    fetchData();
  }, [activeView, cuentas]); 

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      if (activeView === 'productos') {
        // Trigger refresh on ProductDisplay component
        if (productDisplayRef.current && productDisplayRef.current.refreshData) {
          productDisplayRef.current.refreshData();
        }
      } else {
        fetchData();
      }
    }
  }, [refreshTrigger, activeView]);
  
  // Close calendar when clicking outside
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

  return (
    <div className="content-container">
      <div className="content-box">
        <div className="toolbar">
          <div className="toolbar-nav">
            <button className={`toolbar-icon ${activeView === 'movimientos' ? 'active' : ''}`} onClick={(e) => {setActiveView("movimientos")}}>
              <i className="fas fa-home" title="Movimientos"></i>
            </button>
            <button className={`toolbar-icon ${activeView === 'cuentas' ? 'active' : ''}`} onClick={(e) => {setActiveView("cuentas")}}>
              <i className="fas fa-circle-user" title="Cuentas"></i>
            </button>
            <button className={`toolbar-icon ${activeView === 'productos' ? 'active' : ''}`} onClick={(e) => {setActiveView("productos")}}>
              <i className="fas fa-boxes" title="Productos"></i>
            </button>
          </div>

          <div className="search-container">
            <div className="toolbar-icon" onClick={() => setShowCalendar(!showCalendar)} style={{ position: 'relative' }}>
              <i className="fas fa-table"></i>
              {showCalendar && (
                <div className="calendar-popup" ref={calendarRef}>
                  <Calendar onDateSelect={handleDateSelect} />
                </div>
              )}
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar en todos los campos..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>

          <div className="toolbar-actions">
            {(
              <button
              title={
                activeView === 'movimientos' ? 'Agregar Movimiento' : activeView === 'cuentas' ? 'Agregar Cuenta' : activeView === 'productos' ? 'Agregar Producto' : 'Agregar Movimiento'
              }
              className="add-button"
              onClick={handleAdd}
              >
                <AddButton />
              </button>
            )}
          </div>
          
        </div>

        {selectedDates.length > 0 && activeView === 'movimientos' && (
          <div className="date-filter-info">
            Filtrado por fechas: {selectedDates.join(', ')}
            <button onClick={clearDateFilter} className="clear-filter-btn">
              Limpiar filtro
            </button>
            </div>
        )}

        <div id="table-container">
          {activeView === 'productos' ? (
            <ProductDisplay ref={productDisplayRef} searchTerm={searchTerm} refreshTrigger={refreshTrigger}/>
          ) : (
            <TableComponent rows={filteredData} columns={getColumnsForActiveView()} tableType={activeView}/>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableBox;