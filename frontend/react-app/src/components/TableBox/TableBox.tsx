import React, { useEffect, useState, useRef } from 'react';
import './TableBox.css';
import TableComponent from '../TableComponent/TableComponent';
import Calendar from '../Calendar/Calendar';
import ProductDisplay from '../ProductDisplay/ProductDisplay';

type Tabla = 'movimientos' | 'cuentas' | 'productos';

interface TableBoxProps {
  onOpenTransaction: () => void;
  activeView: 'movimientos' | 'cuentas' | 'productos';
  setActiveView: (view: 'movimientos' | 'cuentas' | 'productos') => void;
}

interface MovimientoRow {
  id: number;
  name: string;
  producto: string;
  fecha: string;
  cuenta: string;
  tipoMovimiento: string;
  abonado: number | null;
}

interface CuentaRow {
  id: number;
  nombre: string;
  saldo: number | null;
  tipo: string;
}

interface ProductoRow {
  id: number;
  descripcion: string;
  stock: number | null;
  precio: number | null;
}

const TableBox: React.FC<TableBoxProps> = ({ onOpenTransaction, activeView, setActiveView }) => {
  const [data, setData] = useState<MovimientoRow[] | CuentaRow[] | ProductoRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const calendarRef = useRef<HTMLDivElement>(null);
  const productDisplayRef = useRef<any>(null);

  const getColumnsForActiveView = () => {
    switch (activeView) {
      case 'movimientos':
        return [
          { key: 'id', label: 'ID' },
          { key: 'fecha', label: 'FECHA' },
          { key: 'tipo_comprobante', label: 'TIPO de COMPROBANTE' },
          { key: 'cuenta_id', label: 'CUENTA' },
          { key: 'producto_id', label: 'DETALLE' },
          { key: 'total', label: 'TOTAL', format: (value:any) => (value ? `$${parseFloat(value).toFixed(2)}` : '-')}
        ];
      case 'cuentas':
        return [
          { key: 'id', label: 'ID' },
          { key: 'nombre', label: 'NOMBRE' },
          { key: 'contacto_mail', label: 'E-MAIL'},
          { key: 'contacto_telefono', label: 'TELÉFONO' },
          { key: 'tipo_cuenta', label: 'TIPO de CUENTA'}
        ];
      case 'productos':
        return [];
      default:
        return [];
    }
  };

  const handleAddMovement = () => {
    onOpenTransaction();
  };

  const handleAddProduct = () => {
    if (productDisplayRef.current) {
      productDisplayRef.current.addProduct();
    }
  };

  const normalizeText = (text: any): string => {
    if (typeof text !== 'string') return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredData = (data as any[]).filter(item => {
    const normalizedSearchTerm = normalizeText(searchTerm);
    const dateMatch =
      selectedDates.length === 0 ||
      (activeView === 'movimientos' && selectedDates.includes((item as any).fecha));

    if (!dateMatch) return false;

    if (activeView === 'movimientos') {
      const mov = item as MovimientoRow;
      return (
        normalizeText(mov.name).includes(normalizedSearchTerm) ||
        normalizeText(mov.producto).includes(normalizedSearchTerm) ||
        normalizeText(mov.fecha).includes(normalizedSearchTerm) ||
        normalizeText(mov.cuenta).includes(normalizedSearchTerm) ||
        normalizeText(mov.tipoMovimiento).includes(normalizedSearchTerm) ||
        normalizeText(mov.abonado?.toString()).includes(normalizedSearchTerm)
      );
    }

    if (activeView === 'cuentas') {
      const cta = item as CuentaRow;
      return (
        normalizeText(cta.nombre).includes(normalizedSearchTerm) ||
        normalizeText(cta.saldo?.toString()).includes(normalizedSearchTerm) ||
        normalizeText(cta.tipo).includes(normalizedSearchTerm)
      );
    }

    if (activeView === 'productos') {
      const prod = item as ProductoRow;
      return (
        normalizeText(prod.descripcion).includes(normalizedSearchTerm) ||
        normalizeText(prod.stock?.toString()).includes(normalizedSearchTerm) ||
        normalizeText(prod.precio?.toString()).includes(normalizedSearchTerm)
      );
    }

    return false;
  });

  const handleDateSelect = (dates: string[]) => {
    setSelectedDates(dates);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/${activeView}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(`Error al cargar ${activeView}:`, err);
      }
    };
    fetchData();
  }, [activeView]);

  return (
    <div className="content-container">
      <div className="content-box">
        <div className="toolbar">
          <div className="toolbar-nav">
            <div className={`toolbar-icon ${activeView === 'movimientos' ? 'active' : ''}`}>
              <i className="fas fa-home" title="Movimientos"></i>
            </div>
            <div className={`toolbar-icon ${activeView === 'cuentas' ? 'active' : ''}`}>
              <i className="fas fa-circle-user" title="Cuentas"></i>
            </div>
            <div className={`toolbar-icon ${activeView === 'productos' ? 'active' : ''}`}>
              <i className="fas fa-boxes" title="Productos"></i>
            </div>
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
            {activeView !== 'productos' && (
              <button
                title={activeView === 'movimientos' ? 'Add New Transaction' : 'Add New Product'}
                className="add-movement-btn"
                onClick={activeView === 'movimientos' ? handleAddMovement : handleAddProduct}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                <svg
                  width="40px"
                  height="40px"
                  viewBox="0 0 24 24"
                  style={{
                    stroke: '#13a813',
                    fill: 'none',
                    strokeWidth: '1.5',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.fill = '#13a813';
                    e.currentTarget.style.stroke = '#374151';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.fill = 'none';
                    e.currentTarget.style.stroke = '#13a813';
                  }}
                >
                  <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"></path>
                  <path d="M8 12H16"></path>
                  <path d="M12 16V8"></path>
                </svg>
              </button>
            )}
          </div>
        </div>

        {selectedDates.length > 0 && activeView === 'movimientos' && (
          <div className="date-filter-info">
            Filtrado por fechas: {selectedDates.join(', ')}
            <button onClick={() => setSelectedDates([])} className="clear-filter-btn">
              Limpiar filtro
            </button>
          </div>
        )}

        <div id="table-container">
          {activeView === 'productos' ? (
            <ProductDisplay ref={productDisplayRef} searchTerm={searchTerm} />
          ) : (
            <TableComponent rows={filteredData} columns={getColumnsForActiveView()} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TableBox;