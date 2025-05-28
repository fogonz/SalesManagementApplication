import React, { useEffect, useState, useRef } from 'react';
import './TableBox.css';
import Transaction from '../Transaction/Transaction';
import TableComponent from '../TableComponent/TableComponent';
import Calendar from '../Calendar/Calendar';
import ProductDisplay from '../ProductDisplay/ProductDisplay';

interface TableBoxProps {
    onOpenTransaction: () => void;
}

interface UserRow {
  id: number;
  name: string;
  producto: string;
  fecha: string;
  cuenta: string;
  tipoMovimiento: string;
  abonado: number;
}

const TableBox: React.FC<TableBoxProps> = ({ onOpenTransaction }) => {
    const [movimientos, setMovimientos] = useState([]);

    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [data, setData] = useState<UserRow[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [activeView, setActiveView] = useState<'table' | 'products'>('table');
    const calendarRef = useRef<HTMLDivElement>(null);
    const productDisplayRef = useRef<any>(null);

    const handleAddMovement = () => {
        onOpenTransaction();
    };

    const handleAddProduct = () => {
        if (productDisplayRef.current) {
            productDisplayRef.current.addProduct();
        }
    };

    const normalizeText = (text: string): string => {
        return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const filteredData = data.filter(item => {
        const normalizedSearchTerm = normalizeText(searchTerm);
        const dateMatch = selectedDates.length === 0 || 
                         selectedDates.includes(item.fecha);
        
        return dateMatch && (
            normalizeText(item.name).includes(normalizedSearchTerm) ||
            normalizeText(item.producto).includes(normalizedSearchTerm) ||
            normalizeText(item.fecha).includes(normalizedSearchTerm) ||
            normalizeText(item.cuenta).includes(normalizedSearchTerm) ||
            normalizeText(item.tipoMovimiento).includes(normalizedSearchTerm) ||
            normalizeText(item.abonado.toString()).includes(normalizedSearchTerm)
        );
    });

    const handleDateSelect = (dates: string[]) => {
        setSelectedDates(dates);
        console.log('Fechas seleccionadas:', dates);
    };

    useEffect(() => {
        fetch('http://localhost:8000/api/movimientos')
          .then(res => res.json())
          .then(data => setMovimientos(data))
          .catch(err => console.error('Error al cargar los movimientos:', err));
      }, []);

    return(
        <div className="content-container">
            <div className="content-box">
                <div className="toolbar">
                    <div className="toolbar-nav">
                        <div className="toolbar-icon" onClick={() => setActiveView('table')}>
                            <i className="fas fa-home"></i>
                        </div>
                        <div className="toolbar-icon" onClick={() => setActiveView('products')}>
                            <i className="fas fa-boxes"></i>
                        </div>
                        <div 
                            className="toolbar-icon" 
                            onClick={() => setShowCalendar(!showCalendar)}
                            style={{ position: 'relative' }}
                        >
                            <i className="fas fa-table"></i>
                            {showCalendar && (
                                <div className="calendar-popup" ref={calendarRef}>
                                    <Calendar onDateSelect={handleDateSelect} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="search-container">
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
                        <button 
                            title={activeView === 'table' ? 'Add New Transaction' : 'Add New Product'}
                            className="add-movement-btn"
                            onClick={activeView === 'table' ? handleAddMovement : handleAddProduct}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'rotate(90deg)';
                            }}
                            onMouseLeave={(e) => {
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
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.fill = '#13a813';
                                    e.currentTarget.style.stroke = '#374151';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.fill = 'none';
                                    e.currentTarget.style.stroke = '#13a813';
                                }}
                            >
                                <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"></path>
                                <path d="M8 12H16"></path>
                                <path d="M12 16V8"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {selectedDates.length > 0 && (
                    <div className="date-filter-info">
                        Filtrado por fechas: {selectedDates.join(', ')}
                        <button 
                            onClick={() => setSelectedDates([])} 
                            className="clear-filter-btn"
                        >
                            Limpiar filtro
                        </button>
                    </div>
                )}

                <div id="table-container">
                    {activeView === 'table' ? (
                        <TableComponent rows={movimientos} />
                    ) : (
                        <ProductDisplay ref={productDisplayRef} searchTerm={searchTerm} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TableBox;