import React, { useEffect, useState } from 'react';
import './TableBox.css';
import Transaction from '../Transaction/Transaction'; // Importar el componente Transaction
import TableComponent from '../TableComponent/TableComponent';

// Interfaz actualizada para los datos de la tabla
interface UserRow {
  id: number;
  name: string;
  producto: string;
  fecha: string;
  cuenta: string;
  tipoMovimiento: string;
  abonado: number;
}

const TableBox: React.FC = () => {
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [data, setData] = useState<UserRow[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddMovement = () => {
        setIsTransactionOpen(true);
    };

    const handleCloseTransaction = () => {
        setIsTransactionOpen(false);
    };

    const handleAcceptTransaction = () => {
        // Aquí puedes agregar la lógica para procesar la transacción
        console.log("Transacción aceptada");
        setIsTransactionOpen(false);
    };

    // Función para normalizar texto removiendo tildes/acentos
    const normalizeText = (text: string): string => {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // Filtrar datos basado en el término de búsqueda - AHORA FILTRA TODOS LOS CAMPOS SIN TILDES
    const filteredData = data.filter(item => {
        const normalizedSearchTerm = normalizeText(searchTerm);
        return (
            normalizeText(item.name).includes(normalizedSearchTerm) ||
            normalizeText(item.producto).includes(normalizedSearchTerm) ||
            normalizeText(item.fecha).includes(normalizedSearchTerm) ||
            normalizeText(item.cuenta).includes(normalizedSearchTerm) ||
            normalizeText(item.tipoMovimiento).includes(normalizedSearchTerm) ||
            normalizeText(item.abonado.toString()).includes(normalizedSearchTerm)
        );
    });

    useEffect(() => {
        // Simular carga de datos desde una API 
        setTimeout(() => {
            setData([
                { id: 1, name: "Ana García", producto: "Roble", fecha: "2024-05-20", cuenta: "ACC-001", tipoMovimiento: "Depósito", abonado: 2500.00 },
                { id: 2, name: "Luis Martínez", producto: "Arroz", fecha: "2024-05-21", cuenta: "ACC-002", tipoMovimiento: "Transferencia", abonado: 1800.50 },
                { id: 3, name: "Carlos López", producto: "Azucar", fecha: "2024-05-22", cuenta: "ACC-003", tipoMovimiento: "Pago", abonado: 750.25 },
                { id: 4, name: "María Rodríguez", producto: "Hierro", fecha: "2024-05-23", cuenta: "ACC-004", tipoMovimiento: "Depósito", abonado: 3200.00 },
                { id: 5, name: "Pedro Silva", producto: "Bife", fecha: "2024-05-24", cuenta: "ACC-005", tipoMovimiento: "Retiro", abonado: 1500.75 },
                { id: 6, name: "Laura Fernández", producto: "Obeja", fecha: "2024-05-25", cuenta: "ACC-006", tipoMovimiento: "Transferencia", abonado: 2750.00 },
                { id: 7, name: "Diego Morales", producto: "Vaca", fecha: "2024-05-26", cuenta: "ACC-007", tipoMovimiento: "Depósito", abonado: 4100.25 },
                { id: 8, name: "Sofia Herrera", producto: "burro", fecha: "2024-05-27", cuenta: "ACC-008", tipoMovimiento: "Pago", abonado: 950.00 },
                { id: 9, name: "Andrés Castro", producto: "Caballo", fecha: "2024-05-28", cuenta: "ACC-009", tipoMovimiento: "Transferencia", abonado: 2200.80 },
                { id: 10, name: "Valeria Torres", producto: "Aluminio", fecha: "2024-05-29", cuenta: "ACC-010", tipoMovimiento: "Depósito", abonado: 1650.40 },
                { id: 11, name: "Roberto Jiménez", producto: "Hierro", fecha: "2024-05-30", cuenta: "ACC-011", tipoMovimiento: "Retiro", abonado: 800.00 },
                { id: 12, name: "Isabella Vargas", producto: "aaa", fecha: "2024-05-31", cuenta: "ACC-012", tipoMovimiento: "Transferencia", abonado: 3100.90 },
                { id: 13, name: "Joaquín Mendoza", producto: "aaa", fecha: "2024-06-01", cuenta: "ACC-013", tipoMovimiento: "Depósito", abonado: 2800.60 },
                { id: 14, name: "Camila Ruiz", producto: "aaa", fecha: "2024-06-02", cuenta: "ACC-014", tipoMovimiento: "Pago", abonado: 1200.30 },
                { id: 15, name: "Sebastián Ortiz", producto: "aa", fecha: "2024-06-03", cuenta: "ACC-015", tipoMovimiento: "Transferencia", abonado: 1950.70 }
            ]);
        }, 1000);
    }, []);

    return(
        <div className="content-container">
            <div className="content-box">
                <div className="toolbar">
                    <div className="toolbar-nav">
                        <div className="toolbar-icon">
                            <i className="fas fa-home"></i>
                        </div>
                        <div className="toolbar-icon">
                            <i className="fas fa-list"></i>
                        </div>
                        <div className="toolbar-icon">
                            <i className="fas fa-table"></i>
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
                            title="Add New"
                            className="add-movement-btn"
                            onClick={handleAddMovement}
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
                                <path
                                    d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                                ></path>
                                <path d="M8 12H16"></path>
                                <path d="M12 16V8"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div id="table-container">
                    <TableComponent rows={filteredData} />
                </div>
            </div>

            {/* Renderizar el componente Transaction condicionalmente */}
            {isTransactionOpen && (
                <Transaction 
                    onClose={handleCloseTransaction}
                    onAccept={handleAcceptTransaction}
                />
            )}
        </div>
    );
};

export default TableBox;